const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;

function loadEnvFile() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
}

loadEnvFile();

const port = Number(process.env.PORT || 4175);
const host = process.env.HOST || "0.0.0.0";
const bookingsFile = path.join(root, "bookings.jsonl");
const ownerEmail = process.env.BOOKING_OWNER_EMAIL || "timaslovelylocs@gmail.com";
const ownerPhone = process.env.BOOKING_OWNER_PHONE || "3364711098";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".md": "text/markdown; charset=utf-8",
};

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function bookingText(booking) {
  const serviceLines = (booking.cart || []).map(item => {
    const details = [
      item.duration ? `Time: ${item.duration}` : "",
      item.baseProduct ? `Base product: ${item.baseProduct}` : "",
      item.partingPreference ? `Parting: ${item.partingPreference}${item.partingFee ? ` (+$${item.partingFee})` : ""}` : "",
    ].filter(Boolean).join("; ");
    return `- ${item.name} ($${item.price}${details ? ` | ${details}` : ""})`;
  });

  return [
    "Lovely Locs appointment request",
    "",
    `Client: ${booking.client?.fullName || ""}`,
    `Email: ${booking.client?.email || ""}`,
    `Phone: ${booking.client?.phone || ""}`,
    `Preferred date: ${booking.client?.date || ""}`,
    `Preferred contact: ${contactPreferenceLabel(booking.client?.preferredContact)}`,
    "",
    "Services / products:",
    serviceLines.length ? serviceLines.join("\n") : "- No cart items included",
    "",
    `Estimated total: $${booking.total || 0}`,
    `Deposit required: $${booking.deposit || 0}`,
    "",
    `Notes: ${booking.client?.specialRequests || "No special requests added."}`,
    "",
    "Policy acknowledgement: Client confirmed they read the Lovely Locs policies.",
    "Studio note: Address is shared after booking and deposit are confirmed.",
  ].join("\n");
}

function contactPreferenceLabel(value) {
  if (value === "text") return "Text";
  if (value === "email") return "Email";
  return "Text + Email";
}

async function postJson(url, body, headers = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`${response.status} ${text}`.trim());
  }
  return response.json().catch(() => ({}));
}

async function sendEmail(to, subject, text) {
  if (!process.env.RESEND_API_KEY || !process.env.CONFIRMATION_FROM_EMAIL) {
    return { provider: "resend", skipped: true, reason: "RESEND_API_KEY and CONFIRMATION_FROM_EMAIL are not set" };
  }

  await postJson("https://api.resend.com/emails", {
    from: process.env.CONFIRMATION_FROM_EMAIL,
    to,
    subject,
    text,
  }, {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  });
  return { provider: "resend", skipped: false };
}

async function sendSms(to, body) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    return { provider: "twilio", skipped: true, reason: "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER are not set" };
  }

  const params = new URLSearchParams({
    From: TWILIO_FROM_NUMBER,
    To: to,
    Body: body,
  });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`${response.status} ${text}`.trim());
  }
  return { provider: "twilio", skipped: false };
}

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/[^0-9]/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return phone;
}

async function handleBooking(req, res) {
  try {
    const raw = await readBody(req);
    const booking = JSON.parse(raw || "{}");
    const required = ["fullName", "email", "phone", "date"];
    const missing = required.filter(field => !booking.client?.[field]);
    if (missing.length || !Array.isArray(booking.cart) || booking.cart.length === 0 || !booking.policyAcknowledgement) {
      sendJson(res, 400, { ok: false, error: "Booking is missing required client, cart, or policy fields." });
      return;
    }

    const id = `LL-${Date.now()}`;
    const savedBooking = { id, receivedAt: new Date().toISOString(), ...booking };
    fs.appendFileSync(bookingsFile, `${JSON.stringify(savedBooking)}\n`, "utf8");

    const details = bookingText(savedBooking);
    const preferredContact = contactPreferenceLabel(booking.client.preferredContact);
    const clientText = `Lovely Locs received your appointment request for ${booking.client.date}. Deposit required: $${booking.deposit}. Your appointment is pending until payment is received.`;
    const ownerText = `New Lovely Locs booking from ${booking.client.fullName} for ${booking.client.date}. Preferred contact: ${preferredContact}. Total: $${booking.total}. Deposit: $${booking.deposit}.`;
    const results = [];

    for (const task of [
      ["clientEmail", () => sendEmail(booking.client.email, "Lovely Locs appointment request received", `${clientText}\n\n${details}`)],
      ["ownerEmail", () => sendEmail(ownerEmail, `New Lovely Locs booking: ${booking.client.fullName}`, details)],
      ["clientSms", () => sendSms(normalizePhone(booking.client.phone), clientText)],
      ["ownerSms", () => sendSms(normalizePhone(ownerPhone), ownerText)],
    ]) {
      try {
        results.push({ channel: task[0], ...(await task[1]()) });
      } catch (error) {
        results.push({ channel: task[0], failed: true, error: error.message });
      }
    }

    const sent = results.some(result => !result.skipped && !result.failed);
    sendJson(res, sent ? 200 : 202, { ok: true, id, sent, results });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && (req.url || "").split("?")[0] === "/healthz") {
    sendJson(res, 200, { ok: true, service: "lovely-locs" });
    return;
  }

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/bookings") {
    handleBooking(req, res);
    return;
  }

  const rawPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const requested = rawPath === "/" ? "index.html" : rawPath.replace(/^\/+/, "");
  const filePath = path.resolve(root, requested);

  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store",
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }

  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, host, () => {
  const shownHost = host === "0.0.0.0" ? "127.0.0.1" : host;
  console.log(`Lovely Locs site running at http://${shownHost}:${port}/`);
});
