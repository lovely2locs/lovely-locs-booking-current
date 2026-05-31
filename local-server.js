const http = require("http");
const fs = require("fs");
const path = require("path");

let Stripe = null;
try {
  Stripe = require("stripe");
} catch {
  Stripe = null;
}

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
const ownerEmail = process.env.BOOKING_OWNER_EMAIL || "lovely2locs@gmail.com";
const ownerPhone = process.env.BOOKING_OWNER_PHONE || "3364711098";
let stripeClient = null;

const serviceCatalog = [
  { id: "sprinkles-addon", duration: "30 min", price: 15, name: "Loc Sprinkles (Add On)", category: "add-ons" },
  { id: "emergency-fee", duration: "3h", price: 45, name: "Emergency Fee", category: "add-ons" },
  { id: "children-instant-starter", duration: "5h", price: 150, name: "Children Instant Starter Locs", category: "starter-locs" },
  { id: "medium-adult-starter", duration: "6h 30min", price: 150, name: "Medium Adult Starter Locs", category: "starter-locs" },
  { id: "adult-retwist", duration: "3h 30min", price: 90, name: "Adult Retwist (Maintenance)", category: "loc-maintenance" },
  { id: "child-starter-coils", duration: "3h 30min", price: 75, name: "Children's Starter Locs Coils & Two Strand Twist", category: "starter-locs" },
  { id: "sprinkle-install", duration: "2h 15min", price: 50, name: "Loc Sprinkle Installation", category: "add-ons" },
  { id: "children-retwist", duration: "3h", price: 75, name: "Children Retwist (Maintenance)", category: "loc-maintenance" },
  { id: "adult-instant", duration: "5h 30min", price: 125, name: "Adult Instant Locs", category: "instant-crochet" },
  { id: "child-instant", duration: "3h 30min", price: 85, name: "Children's Instant Loc", category: "instant-crochet" },
  { id: "referral-retwist", duration: "3h 30min", price: 75, name: "Referral (Retwist)", category: "loc-maintenance" },
  { id: "style-addon", duration: "1h 30min", price: 30, name: "Style (Add On)", category: "add-ons" },
  { id: "consultation", duration: "1h 15min", price: 30, name: "Consultation", category: "add-ons" },
  { id: "small-adult-starter", duration: "5h 30min", price: 225, name: "Small Adult Starter Locs", category: "starter-locs" },
  { id: "overdue-retwist", duration: "4-5 hours", price: 125, name: "Overdue Retwist (4+ Months)", category: "loc-maintenance" },
  { id: "admin-test-booking", duration: "15 min", price: 0, name: "Free Admin Test Booking", category: "admin-test" },
];

const productCatalog = [
  { id: "product-Gold Sparkle Sprinkles", price: 12, name: "Gold Sparkle Sprinkles" },
  { id: "product-Silver Shimmer Sprinkles", price: 12, name: "Silver Shimmer Sprinkles" },
  { id: "product-Rose Gold Sprinkles", price: 12, name: "Rose Gold Sprinkles" },
  { id: "product-Custom Color Sprinkles", price: 15, name: "Custom Color Sprinkles" },
];

const allowedBaseProducts = new Set(["Oil and Water", "Foam", "Gel"]);
const allowedPartingFees = new Map([
  ["Brick Layered Parts", 0],
  ["Natural C Parts", 0],
  ["Triangle Parts", 40],
]);

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

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe Checkout is not configured. Add STRIPE_SECRET_KEY in Render.");
  }
  if (!Stripe) {
    throw new Error("Stripe package is not installed. Run npm install before starting the server.");
  }
  if (!stripeClient) stripeClient = Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
}

function publicSiteUrl(req) {
  const configured = (process.env.PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  if (configured) return configured;
  const proto = req.headers["x-forwarded-proto"] || "http";
  const hostHeader = req.headers["x-forwarded-host"] || req.headers.host || `127.0.0.1:${port}`;
  return `${proto}://${hostHeader}`.replace(/\/+$/, "");
}

function appendBookingRecord(record) {
  fs.appendFileSync(bookingsFile, `${JSON.stringify(record)}\n`, "utf8");
}

function findBookingById(id) {
  if (!id || !fs.existsSync(bookingsFile)) return null;
  const lines = fs.readFileSync(bookingsFile, "utf8").split(/\r?\n/).filter(Boolean);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try {
      const record = JSON.parse(lines[index]);
      if (record.id === id && record.client && Array.isArray(record.cart)) return record;
    } catch {
      // Ignore malformed historical lines.
    }
  }
  return null;
}

function isAdminTestBooking(cart = []) {
  return cart.length === 1 && cart[0]?.id === "admin-test-booking";
}

function sanitizeClient(client = {}) {
  return {
    fullName: String(client.fullName || "").trim(),
    email: String(client.email || "").trim(),
    phone: String(client.phone || "").trim(),
    date: String(client.date || "").trim(),
    preferredContact: ["text", "email", "text_email"].includes(client.preferredContact) ? client.preferredContact : "text_email",
    smsOptIn: Boolean(client.smsOptIn),
    specialRequests: String(client.specialRequests || "").trim(),
  };
}

function pricedCartItem(item = {}) {
  const exactService = serviceCatalog.find(service => service.id === item.id);
  if (exactService) {
    if (exactService.category === "starter-locs") throw new Error(`Parting preference is required for ${exactService.name}.`);
    if (exactService.category === "loc-maintenance" && !allowedBaseProducts.has(item.baseProduct)) {
      throw new Error(`Base product preference is required for ${exactService.name}.`);
    }
    return {
      ...exactService,
      type: "service",
      baseProduct: allowedBaseProducts.has(item.baseProduct) ? item.baseProduct : undefined,
    };
  }

  const partingService = serviceCatalog.find(service => item.id === `${service.id}-triangle-parts` || String(item.id || "").startsWith(`${service.id}-`));
  if (partingService?.category === "starter-locs") {
    const partingPreference = String(item.partingPreference || "");
    if (!allowedPartingFees.has(partingPreference)) throw new Error(`Invalid parting preference for ${partingService.name}.`);
    const partingFee = allowedPartingFees.get(partingPreference);
    const expectedId = partingFee ? `${partingService.id}-triangle-parts` : `${partingService.id}-${partingPreference.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    if (item.id !== expectedId) throw new Error(`Invalid cart item option for ${partingService.name}.`);
    return {
      ...partingService,
      id: expectedId,
      name: partingFee ? `${partingService.name} + Triangle Parts` : partingService.name,
      price: partingService.price + partingFee,
      type: "service",
      partingPreference,
      partingFee,
    };
  }

  const product = productCatalog.find(productItem => productItem.id === item.id);
  if (product) return { ...product, type: "product" };

  throw new Error(`Unknown cart item: ${item.id || "missing id"}.`);
}

function priceBooking(booking) {
  const client = sanitizeClient(booking.client);
  const required = ["fullName", "email", "phone", "date"];
  const missing = required.filter(field => !client[field]);
  if (missing.length) throw new Error(`Missing required booking fields: ${missing.join(", ")}.`);
  if (!Array.isArray(booking.cart) || booking.cart.length === 0) throw new Error("Booking must include at least one cart item.");
  if (!booking.policyAcknowledgement) throw new Error("Policy acknowledgement is required.");

  const cart = booking.cart.map(pricedCartItem);
  const selectedServices = cart.filter(item => item.type === "service");
  const addOns = cart.filter(item => item.type !== "service");
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const deposit = isAdminTestBooking(cart) ? 0 : Math.max(Math.round(total * 0.3), 30);

  return {
    client,
    cart,
    selectedServices,
    addOns,
    total,
    deposit,
    policyAcknowledgement: true,
  };
}

async function createCheckoutSession(req, booking) {
  const stripe = getStripe();
  const siteUrl = publicSiteUrl(req);
  const serviceNames = booking.selectedServices.map(item => item.name).join(", ") || "Lovely Locs services";
  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: booking.client.email,
    phone_number_collection: { enabled: true },
    success_url: `${siteUrl}/?booking=${encodeURIComponent(booking.id)}&session_id={CHECKOUT_SESSION_ID}#payment-success`,
    cancel_url: `${siteUrl}/#services`,
    metadata: {
      bookingId: booking.id,
      clientName: booking.client.fullName.slice(0, 200),
      preferredDate: booking.client.date.slice(0, 200),
      total: String(booking.total),
      deposit: String(booking.deposit),
    },
    payment_intent_data: {
      metadata: {
        bookingId: booking.id,
        clientName: booking.client.fullName.slice(0, 200),
        preferredDate: booking.client.date.slice(0, 200),
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: booking.deposit * 100,
          product_data: {
            name: "Lovely Locs Appointment Deposit",
            description: `Non-refundable deposit for ${serviceNames}`.slice(0, 1000),
          },
        },
      },
    ],
  });
}

async function notifyDepositPaid(booking, session) {
  const paidAt = new Date().toISOString();
  const details = bookingText({
    ...booking,
    status: "deposit_paid",
    stripe: {
      checkoutSessionId: session.id,
      paymentIntentId: session.payment_intent || "",
      amountTotal: session.amount_total || 0,
      paidAt,
    },
  });
  const clientText = `Lovely Locs received your $${booking.deposit} deposit for ${booking.client.date}. Your appointment request is paid and pending final availability confirmation from Lovely Locs.`;
  const ownerText = `Stripe deposit paid for ${booking.client.fullName}: $${booking.deposit}. Preferred date: ${booking.client.date}. Total estimate: $${booking.total}.`;
  const results = [];

  for (const task of [
    ["clientEmail", () => sendEmail(booking.client.email, "Lovely Locs deposit received", `${clientText}\n\n${details}`)],
    ["ownerEmail", () => sendEmail(ownerEmail, `Lovely Locs deposit paid: ${booking.client.fullName}`, `${ownerText}\n\n${details}`)],
    ["clientSms", () => sendSms(normalizePhone(booking.client.phone), clientText)],
    ["ownerSms", () => sendSms(normalizePhone(ownerPhone), ownerText)],
  ]) {
    try {
      results.push({ channel: task[0], ...(await task[1]()) });
    } catch (error) {
      results.push({ channel: task[0], failed: true, error: error.message });
    }
  }

  return results;
}

async function notifyNoChargeTestBooking(booking) {
  const details = bookingText(booking);
  const clientText = `Lovely Locs test booking received for ${booking.client.date}. This was a no-charge admin test, so no Stripe deposit was requested.`;
  const ownerText = `No-charge admin test booking submitted for ${booking.client.fullName}. Preferred date: ${booking.client.date}.`;
  const results = [];

  for (const task of [
    ["clientEmail", () => sendEmail(booking.client.email, "Lovely Locs test booking received", `${clientText}\n\n${details}`)],
    ["ownerEmail", () => sendEmail(ownerEmail, `Lovely Locs test booking: ${booking.client.fullName}`, `${ownerText}\n\n${details}`)],
    ["clientSms", () => sendSms(normalizePhone(booking.client.phone), clientText)],
    ["ownerSms", () => sendSms(normalizePhone(ownerPhone), ownerText)],
  ]) {
    try {
      results.push({ channel: task[0], ...(await task[1]()) });
    } catch (error) {
      results.push({ channel: task[0], failed: true, error: error.message });
    }
  }

  return results;
}

async function handleBooking(req, res) {
  try {
    const raw = await readBody(req);
    const booking = JSON.parse(raw || "{}");
    const pricedBooking = priceBooking(booking);
    const id = `LL-${Date.now()}`;
    const pendingBooking = {
      id,
      receivedAt: new Date().toISOString(),
      status: pricedBooking.deposit === 0 ? "no_charge_test" : "pending_payment",
      ...pricedBooking,
    };
    if (pricedBooking.deposit === 0 && isAdminTestBooking(pricedBooking.cart)) {
      const notificationResults = await notifyNoChargeTestBooking(pendingBooking);
      appendBookingRecord({ ...pendingBooking, notificationResults });
      sendJson(res, 200, {
        ok: true,
        id,
        status: pendingBooking.status,
        noCharge: true,
        total: pendingBooking.total,
        deposit: pendingBooking.deposit,
        message: "Free admin test booking saved. No Stripe deposit was requested. Confirmation messages were attempted with the connected providers.",
        notificationResults,
      });
      return;
    }

    const session = await createCheckoutSession(req, pendingBooking);
    const savedBooking = {
      ...pendingBooking,
      stripe: {
        checkoutSessionId: session.id,
        checkoutUrl: session.url,
        paymentStatus: session.payment_status || "unpaid",
      },
    };
    appendBookingRecord(savedBooking);

    sendJson(res, 200, {
      ok: true,
      id,
      status: savedBooking.status,
      checkoutUrl: session.url,
      total: savedBooking.total,
      deposit: savedBooking.deposit,
    });
  } catch (error) {
    const status = /Stripe Checkout is not configured|Stripe package is not installed/.test(error.message) ? 503 : 400;
    sendJson(res, status, { ok: false, error: error.message });
  }
}

async function handleStripeWebhook(req, res) {
  try {
    const raw = await readBody(req);
    const stripe = getStripe();
    const signature = req.headers["stripe-signature"];
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      sendJson(res, 503, { ok: false, error: "STRIPE_WEBHOOK_SECRET is not configured." });
      return;
    }

    const event = stripe.webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      const booking = findBookingById(bookingId);
      const notificationResults = booking ? await notifyDepositPaid(booking, session) : [];
      appendBookingRecord({
        type: "stripe.checkout.session.completed",
        bookingId,
        receivedAt: new Date().toISOString(),
        status: "deposit_paid",
        stripe: {
          checkoutSessionId: session.id,
          paymentIntentId: session.payment_intent || "",
          paymentStatus: session.payment_status || "",
          amountTotal: session.amount_total || 0,
          currency: session.currency || "usd",
        },
        notificationResults,
      });
    }

    sendJson(res, 200, { received: true });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
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

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/stripe/webhook") {
    handleStripeWebhook(req, res);
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
