const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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
const settingsFile = path.join(root, "site-settings.json");
const ownerEmail = process.env.BOOKING_OWNER_EMAIL || "lovely2locs@gmail.com";
const ownerPhone = process.env.BOOKING_OWNER_PHONE || "3364711098";
const dayMs = 24 * 60 * 60 * 1000;
const referralCreditAmount = Number(process.env.REFERRAL_CREDIT_AMOUNT || 15);
const birthdayCreditAmount = Number(process.env.BIRTHDAY_CREDIT_AMOUNT || 15);
let stripeClient = null;

const defaultSiteSettings = {
  logo: {
    navSize: 40,
    heroSize: 88,
    heroAlign: "left",
    fit: "cover",
    x: 50,
    y: 50,
  },
  discount: {
    code: "LOVELY10",
    percent: 10,
    enabled: false,
    expiresAt: "",
  },
};

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

const regularAppointmentTimes = ["18:30", "19:30", "20:30"];
const emergencyProposalTimes = ["10:00", "12:00", "14:00", "16:00", "22:30"];
const holidayDates = new Set([
  "2026-01-01",
  "2026-05-25",
  "2026-07-04",
  "2026-09-07",
  "2026-11-26",
  "2026-12-24",
  "2026-12-25",
  "2026-12-31",
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
    `Preferred time: ${timeLabel(booking.client?.time)}`,
    booking.client?.birthday ? `Birthday: ${booking.client.birthday}` : "",
    `Appointment type: ${booking.client?.appointmentType || "standard"}`,
    `Preferred contact: ${contactPreferenceLabel(booking.client?.preferredContact)}`,
    `Monthly referral campaign opt-in: ${booking.client?.marketingEmailOptIn ? "Yes" : "No"}`,
    `Referral reminders opt-in: ${booking.client?.referralOptIn ? "Yes" : "No"}`,
    booking.client?.referralCode ? `Client referral code: ${booking.client.referralCode}` : "",
    booking.client?.referredByCode ? `Referred by code: ${booking.client.referredByCode}` : "",
    "",
    "Services / products:",
    serviceLines.length ? serviceLines.join("\n") : "- No cart items included",
    "",
    booking.subtotal && booking.discountAmount ? `Subtotal before promo: $${booking.subtotal}` : "",
    booking.discountAmount ? `Promo code: ${booking.discountCode || ""} (${booking.discountPercent || 0}% off, -$${booking.discountAmount})` : "",
    `Estimated total: $${booking.total || 0}`,
    `Deposit required: $${booking.deposit || 0}`,
    "",
    `Notes: ${booking.client?.specialRequests || "No special requests added."}`,
    "",
    "Policy acknowledgement: Client confirmed they read the Lovely Locs policies.",
    "Studio note: Address is shared after booking and deposit are confirmed.",
  ].join("\n");
}

function timeLabel(value) {
  const [hourText, minuteText] = String(value || "").split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return "";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
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

function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONFIRMATION_FROM_EMAIL);
}

function configuredEmailAddress(value = "") {
  const match = String(value).match(/<([^>]+)>/);
  return (match ? match[1] : String(value)).trim().toLowerCase();
}

function emailReadiness() {
  if (!emailConfigured()) {
    return {
      configured: false,
      clientReady: false,
      reason: "RESEND_API_KEY and CONFIRMATION_FROM_EMAIL are required before any email can send.",
    };
  }
  const from = configuredEmailAddress(process.env.CONFIRMATION_FROM_EMAIL);
  const domain = from.includes("@") ? from.split("@").pop() : "";
  if (!domain || domain === "yourdomain.com") {
    return {
      configured: true,
      clientReady: false,
      from,
      reason: "CONFIRMATION_FROM_EMAIL is still a placeholder. Use a verified domain sender such as bookings@yourdomain.com.",
    };
  }
  if (["gmail.com", "googlemail.com", "resend.dev"].includes(domain)) {
    return {
      configured: true,
      clientReady: false,
      from,
      reason: "Owner test email can work, but client emails require a verified custom domain in Resend. Gmail and resend.dev cannot send production client confirmations.",
    };
  }
  return {
    configured: true,
    clientReady: true,
    from,
    reason: "Email sender uses a custom domain. Confirm the domain is verified in Resend before launch.",
  };
}

function isUsTollFreeNumber(phone) {
  const digits = String(phone || "").replace(/[^0-9]/g, "");
  const normalized = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return normalized.length === 10 && /^(800|833|844|855|866|877|888)/.test(normalized);
}

function smsBlockedReason() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) return "";
  if (isUsTollFreeNumber(TWILIO_FROM_NUMBER) && process.env.TWILIO_TOLLFREE_VERIFIED !== "true") {
    return "SMS is paused because the Twilio sender is a U.S. toll-free number and TWILIO_TOLLFREE_VERIFIED is not true. Verify the toll-free number in Twilio first to avoid paid undelivered messages.";
  }
  return "";
}

async function sendEmail(to, subject, text) {
  if (!emailConfigured()) {
    return { provider: "resend", skipped: true, reason: "RESEND_API_KEY and CONFIRMATION_FROM_EMAIL are not set" };
  }

  const sendFrom = async from => postJson("https://api.resend.com/emails", {
    from,
    to,
    subject,
    text,
  }, {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  });
  try {
    const result = await sendFrom(process.env.CONFIRMATION_FROM_EMAIL);
    return { provider: "resend", skipped: false, id: result.id || "" };
  } catch (error) {
    const unverifiedSender = /domain is not verified/i.test(error.message || "");
    if (!unverifiedSender) throw error;
    try {
      const result = await sendFrom("Lovely Locs <onboarding@resend.dev>");
      return { provider: "resend", skipped: false, fallbackFrom: "onboarding@resend.dev", id: result.id || "" };
    } catch (fallbackError) {
      throw new Error(`${error.message} Fallback sender onboarding@resend.dev also failed: ${fallbackError.message}`);
    }
  }
}

async function sendSms(to, body) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    return { provider: "twilio", skipped: true, reason: "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER are not set" };
  }
  const blockedReason = smsBlockedReason();
  if (blockedReason) {
    return { provider: "twilio", skipped: true, reason: blockedReason };
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
  const result = await response.json().catch(() => ({}));
  return {
    provider: "twilio",
    skipped: false,
    sid: result.sid || "",
    status: result.status || "",
    to: result.to || to,
    from: result.from || TWILIO_FROM_NUMBER,
    errorCode: result.error_code || null,
    errorMessage: result.error_message || null,
  };
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

function readBookingRecords() {
  if (!fs.existsSync(bookingsFile)) return [];
  return fs.readFileSync(bookingsFile, "utf8").split(/\r?\n/).filter(Boolean).flatMap(line => {
    try {
      return [JSON.parse(line)];
    } catch {
      return [];
    }
  });
}

function bookingRecordId(record = {}) {
  return record.bookingId || (record.client && Array.isArray(record.cart) ? record.id : "");
}

function latestBookingRecords(records = readBookingRecords()) {
  const bookings = new Map();
  for (const record of records) {
    if (record.id && record.client && Array.isArray(record.cart)) {
      bookings.set(record.id, record);
    }
  }
  return [...bookings.values()];
}

function bookingStatus(booking, records) {
  let status = booking.status || "";
  for (const record of records) {
    if (bookingRecordId(record) !== booking.id) continue;
    if (record.status === "deposit_paid" || record.type === "stripe.checkout.session.completed" || record.type === "manual.deposit.confirmed") {
      status = "deposit_paid";
    } else if (record.status === "no_charge_test") {
      status = "no_charge_test";
    }
  }
  return status;
}

function calendarDay(date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function daysUntilDate(dateText, now = new Date()) {
  const parsed = new Date(`${dateText}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.round((calendarDay(parsed) - calendarDay(now)) / dayMs);
}

function hoursSince(isoDate, now = new Date()) {
  const parsed = new Date(isoDate || 0);
  if (Number.isNaN(parsed.getTime())) return 0;
  return (now - parsed) / (60 * 60 * 1000);
}

function clientFirstName(booking = {}) {
  return String(booking.client?.fullName || "there").trim().split(/\s+/)[0] || "there";
}

function appointmentLine(booking = {}) {
  return `${booking.client?.date || ""} at ${timeLabel(booking.client?.time)}`;
}

function bookingPaymentOptionsUrl(booking) {
  const siteUrl = (process.env.PUBLIC_SITE_URL || "").replace(/\/+$/, "") || `http://127.0.0.1:${port}`;
  return `${siteUrl}/?booking=${encodeURIComponent(booking.id)}&deposit=${encodeURIComponent(booking.deposit || 0)}#payment-options`;
}

function automationTokenIsValid(token) {
  return [process.env.AUTOMATION_RUN_TOKEN, process.env.MANUAL_DEPOSIT_CONFIRM_TOKEN].some(expected => (
    Boolean(expected && token === expected)
  ));
}

function automationAlreadySent(records, automationType, recipientKey, cycleKey = "") {
  return records.some(record => (
    record.type === "automation.notification.sent"
    && record.automationType === automationType
    && record.recipientKey === recipientKey
    && String(record.cycleKey || "") === String(cycleKey || "")
  ));
}

function automationSentCount(records, automationType, recipientKey) {
  return records.filter(record => (
    record.type === "automation.notification.sent"
    && record.automationType === automationType
    && record.recipientKey === recipientKey
  )).length;
}

async function runNotificationTasks(tasks) {
  const results = [];
  for (const task of tasks) {
    try {
      results.push({ channel: task[0], ...(await task[1]()) });
    } catch (error) {
      results.push({ channel: task[0], failed: true, error: error.message });
    }
  }
  return results;
}

function clientEmailTask(booking, subject, text) {
  if (!booking.client?.email) return null;
  return ["clientEmail", () => sendEmail(booking.client.email, subject, text)];
}

function clientSmsTask(booking, text) {
  if (!booking.client?.smsOptIn || !booking.client?.phone) return null;
  return ["clientSms", () => sendSms(normalizePhone(booking.client.phone), text)];
}

async function sendClientAutomation(booking, automationType, cycleKey, subject, emailText, smsText = emailText, options = {}) {
  const records = readBookingRecords();
  const recipientKey = booking.id;
  if (automationAlreadySent(records, automationType, recipientKey, cycleKey)) {
    return { skipped: true, reason: "already_sent", automationType, bookingId: booking.id };
  }
  const tasks = [
    clientEmailTask(booking, subject, emailText),
    options.emailOnly ? null : clientSmsTask(booking, smsText),
  ].filter(Boolean);
  if (!tasks.length) {
    return { skipped: true, reason: "no_available_client_channel", automationType, bookingId: booking.id };
  }
  const notificationResults = await runNotificationTasks(tasks);
  appendBookingRecord({
    type: "automation.notification.sent",
    automationType,
    recipientKey,
    bookingId: booking.id,
    cycleKey,
    sentAt: new Date().toISOString(),
    notificationResults,
  });
  return { sent: true, automationType, bookingId: booking.id, cycleKey, notificationResults };
}

function sendHtml(res, status, html) {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(html);
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}

function sanitizeLogoSettings(logo = {}) {
  const align = ["left", "center", "right"].includes(logo.heroAlign) ? logo.heroAlign : defaultSiteSettings.logo.heroAlign;
  const fit = ["cover", "contain"].includes(logo.fit) ? logo.fit : defaultSiteSettings.logo.fit;
  return {
    navSize: clampNumber(logo.navSize, 28, 72, defaultSiteSettings.logo.navSize),
    heroSize: clampNumber(logo.heroSize, 56, 180, defaultSiteSettings.logo.heroSize),
    heroAlign: align,
    fit,
    x: clampNumber(logo.x, 0, 100, defaultSiteSettings.logo.x),
    y: clampNumber(logo.y, 0, 100, defaultSiteSettings.logo.y),
  };
}

function normalizeDiscountCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, 24);
}

function normalizeReferralCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 16);
}

function phoneDigits(phone) {
  return String(phone || "").replace(/[^0-9]/g, "");
}

function clientIdentityKey(client = {}) {
  const email = String(client.email || "").trim().toLowerCase();
  const phone = phoneDigits(client.phone);
  if (!email || !phone) return "";
  return `${email}|${phone}`;
}

function referralCodeForClient(client = {}) {
  const identity = clientIdentityKey(client);
  if (!identity) return "";
  return `LL${crypto.createHash("sha1").update(identity).digest("hex").slice(0, 6).toUpperCase()}`;
}

function birthdayMonthDay(value) {
  const clean = String(value || "").trim();
  const match = clean.match(/^\d{4}-(\d{2})-(\d{2})$/) || clean.match(/^(\d{2})-(\d{2})$/);
  return match ? `${match[1]}-${match[2]}` : "";
}

function birthdayWindowForYear(value, year) {
  const monthDay = birthdayMonthDay(value);
  const [month, day] = monthDay.split("-").map(Number);
  if (!month || !day) return null;
  const birthdayDate = new Date(year, month - 1, day, 12, 0, 0);
  if (birthdayDate.getMonth() !== month - 1 || birthdayDate.getDate() !== day) return null;
  const validFrom = new Date(birthdayDate);
  validFrom.setDate(validFrom.getDate() - 14);
  const expiresAt = new Date(birthdayDate);
  expiresAt.setMonth(expiresAt.getMonth() + 1);
  return {
    cycleYear: String(year),
    birthdayDate: dateKey(birthdayDate),
    validFrom: dateKey(validFrom),
    expiresAt: dateKey(expiresAt),
  };
}

function activeBirthdayWindow(value, now = new Date()) {
  const today = dateKey(now);
  for (const year of [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]) {
    const window = birthdayWindowForYear(value, year);
    if (window && today >= window.validFrom && today <= window.expiresAt) return window;
  }
  return null;
}

function creditIsExpired(record, now = new Date()) {
  return Boolean(record.expiresAt && dateKey(now) > record.expiresAt);
}

function sameClient(left = {}, right = {}) {
  return Boolean(clientIdentityKey(left) && clientIdentityKey(left) === clientIdentityKey(right));
}

function latestClientBooking(client, records = readBookingRecords()) {
  const key = clientIdentityKey(client);
  if (!key) return null;
  const bookings = latestBookingRecords(records);
  for (let index = bookings.length - 1; index >= 0; index -= 1) {
    if (clientIdentityKey(bookings[index].client) === key) return bookings[index];
  }
  return null;
}

function findReferrerByCode(code, records = readBookingRecords()) {
  const cleanCode = normalizeReferralCode(code);
  if (!cleanCode) return null;
  const bookings = latestBookingRecords(records);
  for (let index = bookings.length - 1; index >= 0; index -= 1) {
    const booking = bookings[index];
    const bookingCode = normalizeReferralCode(booking.client?.referralCode || referralCodeForClient(booking.client));
    if (bookingCode === cleanCode) return booking;
  }
  return null;
}

function sanitizeDiscountSettings(discount = {}) {
  const expiresAt = /^\d{4}-\d{2}-\d{2}$/.test(discount.expiresAt || "") ? discount.expiresAt : "";
  return {
    code: normalizeDiscountCode(discount.code || defaultSiteSettings.discount.code) || defaultSiteSettings.discount.code,
    percent: clampNumber(discount.percent, 0, 100, defaultSiteSettings.discount.percent),
    enabled: Boolean(discount.enabled),
    expiresAt,
  };
}

function readSiteSettings() {
  if (!fs.existsSync(settingsFile)) return defaultSiteSettings;
  try {
    const saved = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
    return {
      ...defaultSiteSettings,
      ...saved,
      logo: sanitizeLogoSettings(saved.logo || {}),
      discount: sanitizeDiscountSettings(saved.discount || {}),
    };
  } catch {
    return defaultSiteSettings;
  }
}

function saveSiteSettings(settings = {}) {
  const current = readSiteSettings();
  const clean = {
    ...defaultSiteSettings,
    ...current,
    logo: sanitizeLogoSettings(settings.logo || current.logo),
    discount: sanitizeDiscountSettings(settings.discount || current.discount),
  };
  fs.writeFileSync(settingsFile, JSON.stringify(clean, null, 2), "utf8");
  return clean;
}

function tokenIsValid(token) {
  return automationTokenIsValid(token);
}

function discountIsExpired(discount) {
  if (!discount?.expiresAt) return false;
  const expiration = new Date(`${discount.expiresAt}T23:59:59`);
  return Number.isNaN(expiration.getTime()) ? true : expiration.getTime() < Date.now();
}

function activeDiscountForCode(code) {
  const settings = readSiteSettings().discount;
  const requestedCode = normalizeDiscountCode(code);
  if (!requestedCode) return null;
  if (!settings.enabled) return null;
  if (discountIsExpired(settings)) return null;
  if (normalizeDiscountCode(settings.code) !== requestedCode) return null;
  return settings;
}

function discountAmountForTotal(total, discount) {
  if (discount?.amountOff) return Math.min(total, Math.max(0, Math.round(Number(discount.amountOff))));
  if (!discount?.percent) return 0;
  return Math.min(total, Math.max(0, Math.round(total * Number(discount.percent) / 100)));
}

function creditIsUnavailable(records, creditId) {
  return records.some(record => (
    ["discount.credit.reserved", "discount.credit.redeemed"].includes(record.type)
    && record.creditId === creditId
  ));
}

function availableClientCredit(client, total, records = readBookingRecords()) {
  const key = clientIdentityKey(client);
  if (!key) return null;
  const credits = records.filter(record => (
    ["referral.reward.approved", "birthday.reward.approved"].includes(record.type)
    && record.clientKey === key
    && record.creditId
    && !creditIsUnavailable(records, record.creditId)
    && !creditIsExpired(record)
  ));
  if (!credits.length) return null;
  const best = credits.reduce((winner, credit) => (
    Number(credit.amountOff || 0) > Number(winner.amountOff || 0) ? credit : winner
  ), credits[0]);
  const amountOff = Math.min(total, Math.max(0, Math.round(Number(best.amountOff || 0))));
  if (!amountOff) return null;
  return {
    type: best.type === "birthday.reward.approved" ? "birthday" : "referral",
    creditId: best.creditId,
    code: best.discountCode || best.creditId,
    amountOff,
  };
}

function chooseBookingDiscount(subtotal, saleDiscount, clientCredit) {
  const saleAmount = discountAmountForTotal(subtotal, saleDiscount);
  const creditAmount = clientCredit ? discountAmountForTotal(subtotal, clientCredit) : 0;
  if (clientCredit && creditAmount > saleAmount) {
    return {
      code: clientCredit.code,
      type: clientCredit.type,
      percent: 0,
      amountOff: creditAmount,
      creditId: clientCredit.creditId,
      source: "earned_client_credit",
    };
  }
  if (saleDiscount && saleAmount > 0) {
    return {
      code: saleDiscount.code,
      type: "sale",
      percent: saleDiscount.percent,
      amountOff: saleAmount,
      expiresAt: saleDiscount.expiresAt || "",
      source: "sale_code",
    };
  }
  return null;
}

function reserveBookingCredit(booking) {
  const credit = booking.automaticDiscountCredit;
  if (!credit?.creditId) return null;
  const records = readBookingRecords();
  if (creditIsUnavailable(records, credit.creditId)) return null;
  const event = {
    type: "discount.credit.reserved",
    bookingId: booking.id,
    clientKey: clientIdentityKey(booking.client),
    creditId: credit.creditId,
    creditType: credit.type,
    amountOff: credit.amountOff,
    reservedAt: new Date().toISOString(),
  };
  appendBookingRecord(event);
  return event;
}

function redeemBookingCredit(booking) {
  const credit = booking.automaticDiscountCredit;
  if (!credit?.creditId) return null;
  const records = readBookingRecords();
  if (records.some(record => record.type === "discount.credit.redeemed" && record.creditId === credit.creditId)) return null;
  const event = {
    type: "discount.credit.redeemed",
    bookingId: booking.id,
    clientKey: clientIdentityKey(booking.client),
    creditId: credit.creditId,
    creditType: credit.type,
    amountOff: credit.amountOff,
    redeemedAt: new Date().toISOString(),
  };
  appendBookingRecord(event);
  return event;
}

function recordReferralPending(booking) {
  const code = normalizeReferralCode(booking.client?.referredByCode);
  if (!code || isAdminTestBooking(booking.cart)) return null;
  const records = readBookingRecords();
  const referrer = findReferrerByCode(code, records);
  if (!referrer || sameClient(referrer.client, booking.client)) return null;
  if (records.some(record => record.type === "referral.reward.pending" && record.referredBookingId === booking.id)) return null;
  const event = {
    type: "referral.reward.pending",
    referralCode: code,
    referrerKey: clientIdentityKey(referrer.client),
    referrerBookingId: referrer.id,
    referredBookingId: booking.id,
    referredClientName: booking.client.fullName,
    amountOff: referralCreditAmount,
    createdAt: new Date().toISOString(),
  };
  appendBookingRecord(event);
  return event;
}

function approveReferralReward(booking) {
  const code = normalizeReferralCode(booking.client?.referredByCode);
  if (!code) return null;
  const records = readBookingRecords();
  const pending = records.find(record => record.type === "referral.reward.pending" && record.referredBookingId === booking.id);
  const referrer = pending ? null : findReferrerByCode(code, records);
  const referrerKey = pending?.referrerKey || clientIdentityKey(referrer?.client);
  if (!referrerKey || records.some(record => record.type === "referral.reward.approved" && record.referredBookingId === booking.id)) return null;
  const creditId = `referral:${booking.id}:${referrerKey}`;
  const event = {
    type: "referral.reward.approved",
    referralCode: code,
    clientKey: referrerKey,
    referredBookingId: booking.id,
    creditId,
    discountCode: `REF-${code}`,
    amountOff: referralCreditAmount,
    approvedAt: new Date().toISOString(),
  };
  appendBookingRecord(event);
  return event;
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

function bookedTimesForDate(date) {
  if (!date || !fs.existsSync(bookingsFile)) return new Set();
  const booked = new Set();
  const lines = fs.readFileSync(bookingsFile, "utf8").split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    try {
      const record = JSON.parse(line);
      const status = String(record.status || "");
      const isBookingRecord = record.client && Array.isArray(record.cart);
      if (!isBookingRecord || record.client.date !== date || !record.client.time) continue;
      if (["pending_manual_payment", "pending_payment", "deposit_paid", "no_charge_test"].includes(status)) {
        booked.add(record.client.time);
      }
    } catch {
      // Ignore malformed historical lines.
    }
  }
  return booked;
}

function isHoliday(date) {
  return holidayDates.has(date);
}

function dayOfWeek(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getDay();
}

function classifyAppointmentTime(date, time) {
  const weekday = dayOfWeek(date);
  const holiday = isHoliday(date);
  const isSunday = weekday === 0;
  const regular = !holiday && !isSunday && regularAppointmentTimes.includes(time);
  return {
    type: regular ? "standard" : "emergency",
    emergency: !regular,
    reason: regular ? "Within regular Lovely Locs evening hours." : holiday ? "Holiday/key date appointment proposal." : isSunday ? "Sunday appointment proposal." : "Outside regular Lovely Locs evening hours.",
  };
}

function availabilityForDate(date) {
  const booked = bookedTimesForDate(date);
  const holiday = isHoliday(date);
  const isSunday = dayOfWeek(date) === 0;
  const regularSlots = holiday || isSunday ? [] : regularAppointmentTimes.map(time => ({
    time,
    label: timeLabel(time),
    type: "standard",
    status: booked.has(time) ? "booked" : "open",
    note: "Open appointment time.",
  }));
  const emergencySlots = emergencyProposalTimes.map(time => ({
    time,
    label: timeLabel(time),
    type: "emergency",
    status: booked.has(time) ? "booked" : "open",
    note: holiday ? "Holiday emergency proposal. $45 emergency fee applies." : isSunday ? "Sunday emergency proposal. $45 emergency fee applies." : "Outside business hours. $45 emergency fee applies.",
  }));
  return {
    date,
    holiday,
    regularHours: holiday || isSunday ? "Emergency proposals only" : "6:30 PM - 10:30 PM",
    slots: [...regularSlots, ...emergencySlots],
  };
}

function isAdminTestBooking(cart = []) {
  return cart.length === 1 && cart[0]?.id === "admin-test-booking";
}

function manualPaymentOptions() {
  return [
    {
      id: "venmo",
      label: "Venmo",
      handle: process.env.VENMO_HANDLE || "",
      note: "Send the deposit through Venmo and include your booking ID in the note.",
    },
    {
      id: "apple-pay",
      label: "Apple Pay",
      handle: process.env.APPLE_PAY_CONTACT || "",
      note: "Send the deposit through Apple Pay and include your booking ID in the note.",
    },
  ];
}

function publicManualPaymentOptions() {
  return manualPaymentOptions().map(option => ({
    ...option,
    handle: option.handle || "Confirm current payment tag with Lovely Locs before sending.",
  }));
}

function paymentOptionsText(booking) {
  return publicManualPaymentOptions().map(option => [
    `${option.label}: ${option.handle}`,
    option.note,
  ].join("\n")).join("\n\n");
}

function manualConfirmUrl(req, booking, method = "manual") {
  const token = process.env.MANUAL_DEPOSIT_CONFIRM_TOKEN || process.env.AUTOMATION_RUN_TOKEN;
  if (!token) return "";
  const url = new URL("/api/manual-payment/confirm", publicSiteUrl(req));
  url.searchParams.set("booking", booking.id);
  url.searchParams.set("method", method);
  url.searchParams.set("token", token);
  return url.toString();
}

function sanitizeClient(client = {}) {
  const date = String(client.date || "").trim();
  const time = String(client.time || "").trim();
  const birthday = String(client.birthday || "").trim();
  const slot = date && time ? classifyAppointmentTime(date, time) : { type: "standard", emergency: false, reason: "" };
  return {
    fullName: String(client.fullName || "").trim(),
    email: String(client.email || "").trim(),
    phone: String(client.phone || "").trim(),
    date,
    time,
    birthday: /^\d{4}-\d{2}-\d{2}$/.test(birthday) || /^\d{2}-\d{2}$/.test(birthday) ? birthday : "",
    appointmentType: slot.type,
    emergencySlot: slot.emergency,
    emergencyReason: slot.reason,
    preferredContact: ["text", "email", "text_email"].includes(client.preferredContact) ? client.preferredContact : "text_email",
    smsOptIn: Boolean(client.smsOptIn),
    marketingEmailOptIn: Boolean(client.marketingEmailOptIn),
    referralOptIn: Boolean(client.referralOptIn),
    referralCode: normalizeReferralCode(client.referralCode) || referralCodeForClient(client),
    referredByCode: normalizeReferralCode(client.referredByCode),
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
  const required = ["fullName", "email", "phone", "date", "time"];
  const missing = required.filter(field => !client[field]);
  if (missing.length) throw new Error(`Missing required booking fields: ${missing.join(", ")}.`);
  const slot = availabilityForDate(client.date).slots.find(item => item.time === client.time);
  if (!slot) throw new Error("Selected appointment time is not available.");
  if (slot.status === "booked") throw new Error("That appointment time was just booked. Please choose another time.");
  if (!Array.isArray(booking.cart) || booking.cart.length === 0) throw new Error("Booking must include at least one cart item.");
  if (!booking.policyAcknowledgement) throw new Error("Policy acknowledgement is required.");

  const cart = booking.cart.map(pricedCartItem);
  if (client.emergencySlot && !cart.some(item => item.id === "emergency-fee")) {
    const emergencyFee = serviceCatalog.find(service => service.id === "emergency-fee");
    if (emergencyFee) cart.push({ ...emergencyFee, type: "service", autoEmergencyFee: true });
  }
  const selectedServices = cart.filter(item => item.type === "service");
  const addOns = cart.filter(item => item.type !== "service");
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const saleDiscount = activeDiscountForCode(booking.discountCode);
  const clientCredit = availableClientCredit(client, subtotal);
  const discount = isAdminTestBooking(cart) ? null : chooseBookingDiscount(subtotal, saleDiscount, clientCredit);
  const discountAmount = isAdminTestBooking(cart) ? 0 : discountAmountForTotal(subtotal, discount);
  const total = Math.max(0, subtotal - discountAmount);
  const deposit = isAdminTestBooking(cart) ? 0 : Math.max(Math.round(total * 0.3), 30);

  return {
    client,
    cart,
    selectedServices,
    addOns,
    subtotal,
    discountCode: discount ? discount.code : "",
    discountType: discount ? discount.type : "",
    discountPercent: discount ? discount.percent || 0 : 0,
    discountAmount,
    automaticDiscountCredit: discount?.creditId ? {
      type: discount.type,
      creditId: discount.creditId,
      code: discount.code,
      amountOff: discount.amountOff,
    } : null,
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
  const clientText = `Lovely Locs received your $${booking.deposit} deposit, and your appointment is confirmed for ${booking.client.date} at ${timeLabel(booking.client.time)}. Emergency appointments may receive a follow-up if the proposed time needs owner approval.`;
  const ownerText = `Stripe deposit paid for ${booking.client.fullName}: $${booking.deposit}. Preferred date: ${booking.client.date}. Total estimate: $${booking.total}.`;
  const results = [];

  for (const task of [
    ["clientEmail", () => sendEmail(booking.client.email, "Lovely Locs appointment confirmed", `${clientText}\n\n${details}`)],
    ["ownerEmail", () => sendEmail(ownerEmail, `Lovely Locs deposit paid: ${booking.client.fullName}`, `${ownerText}\n\n${details}`)],
    booking.client.smsOptIn ? ["clientSms", () => sendSms(normalizePhone(booking.client.phone), clientText)] : null,
    ["ownerSms", () => sendSms(normalizePhone(ownerPhone), ownerText)],
  ].filter(Boolean)) {
    try {
      results.push({ channel: task[0], ...(await task[1]()) });
    } catch (error) {
      results.push({ channel: task[0], failed: true, error: error.message });
    }
  }

  return results;
}

async function notifyManualPaymentPending(booking, req) {
  const details = bookingText(booking);
  const confirmLink = manualConfirmUrl(req, booking);
  const ownerText = [
    `Manual deposit pending for ${booking.client.fullName}: $${booking.deposit}.`,
    `Preferred date/time: ${booking.client.date} at ${timeLabel(booking.client.time)}. Total estimate: $${booking.total}.`,
    booking.client.emergencySlot ? `Emergency proposal: ${booking.client.emergencyReason} The $45 emergency fee is included.` : "Standard evening appointment slot selected.",
    "",
    "Payment options shown to the client:",
    paymentOptionsText(booking),
    "",
    "After you see the matching Venmo or Apple Pay receipt in Gmail, approve the deposit here:",
    confirmLink || "Set MANUAL_DEPOSIT_CONFIRM_TOKEN in Render to enable one-click approval links.",
    "",
    details,
  ].join("\n");
  const results = [];

  for (const task of [
    ["ownerEmail", () => sendEmail(ownerEmail, `Lovely Locs deposit awaiting Gmail receipt: ${booking.client.fullName}`, ownerText)],
    ["ownerSms", () => sendSms(normalizePhone(ownerPhone), `Manual deposit pending for ${booking.client.fullName}: $${booking.deposit}. ${booking.client.date} ${timeLabel(booking.client.time)}. Confirm link: ${confirmLink || "Set MANUAL_DEPOSIT_CONFIRM_TOKEN."}`)],
  ]) {
    try {
      results.push({ channel: task[0], ...(await task[1]()) });
    } catch (error) {
      results.push({ channel: task[0], failed: true, error: error.message });
    }
  }

  return results;
}

async function notifyManualDepositPaid(booking, method) {
  const confirmedAt = new Date().toISOString();
  const details = bookingText({
    ...booking,
    status: "deposit_paid",
    manualPayment: {
      method,
      confirmedAt,
    },
  });
  const clientText = `Lovely Locs received your $${booking.deposit} deposit, and your appointment is confirmed for ${booking.client.date} at ${timeLabel(booking.client.time)}. Emergency appointments may receive a follow-up if the proposed time needs owner approval.`;
  const ownerText = `Manual deposit confirmed for ${booking.client.fullName}: $${booking.deposit}. Method: ${method}. Preferred date/time: ${booking.client.date} at ${timeLabel(booking.client.time)}.`;
  const results = [];

  for (const task of [
    ["clientEmail", () => sendEmail(booking.client.email, "Lovely Locs appointment confirmed", `${clientText}\n\n${details}`)],
    ["ownerEmail", () => sendEmail(ownerEmail, `Lovely Locs manual deposit confirmed: ${booking.client.fullName}`, `${ownerText}\n\n${details}`)],
    booking.client.smsOptIn ? ["clientSms", () => sendSms(normalizePhone(booking.client.phone), clientText)] : null,
    ["ownerSms", () => sendSms(normalizePhone(ownerPhone), ownerText)],
  ].filter(Boolean)) {
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
  const clientText = `Lovely Locs test booking received for ${booking.client.date}. This was a no-charge admin test, so no deposit was requested.`;
  const ownerText = `No-charge admin test booking submitted for ${booking.client.fullName}. Preferred date: ${booking.client.date}.`;
  const results = [];

  for (const task of [
    ["clientEmail", () => sendEmail(booking.client.email, "Lovely Locs test booking received", `${clientText}\n\n${details}`)],
    ["ownerEmail", () => sendEmail(ownerEmail, `Lovely Locs test booking: ${booking.client.fullName}`, `${ownerText}\n\n${details}`)],
    booking.client.smsOptIn ? ["clientSms", () => sendSms(normalizePhone(booking.client.phone), clientText)] : null,
    ["ownerSms", () => sendSms(normalizePhone(ownerPhone), ownerText)],
  ].filter(Boolean)) {
    try {
      results.push({ channel: task[0], ...(await task[1]()) });
    } catch (error) {
      results.push({ channel: task[0], failed: true, error: error.message });
    }
  }

  return results;
}

async function runDepositReminderAutomation(booking, records, now) {
  const status = bookingStatus(booking, records);
  if (!["pending_manual_payment", "pending_payment"].includes(status)) return null;
  if (daysUntilDate(booking.client?.date, now) < 0) return null;
  if (hoursSince(booking.receivedAt, now) < 4) return null;
  if (automationSentCount(records, "deposit_reminder", booking.id) >= 3) return null;

  const cycleKey = dateKey(now);
  const payUrl = bookingPaymentOptionsUrl(booking);
  const text = [
    `Hi ${clientFirstName(booking)}, this is your Lovely Locs deposit reminder.`,
    `Your ${appointmentLine(booking)} appointment request is still waiting on the $${booking.deposit} deposit before it is fully confirmed.`,
    `Booking ID: ${booking.id}`,
    `Pay options: ${payUrl}`,
    "Reply if you need help matching your Venmo or Apple Pay receipt.",
  ].join("\n");
  const sms = `Lovely Locs reminder: your $${booking.deposit} deposit is still needed to confirm ${booking.client.date} at ${timeLabel(booking.client.time)}. Pay options: ${payUrl}`;
  return sendClientAutomation(booking, "deposit_reminder", cycleKey, "Lovely Locs deposit reminder", text, sms);
}

async function runAppointmentReminderAutomation(booking, records, now) {
  const status = bookingStatus(booking, records);
  if (!["deposit_paid", "no_charge_test"].includes(status)) return [];
  const daysOut = daysUntilDate(booking.client?.date, now);
  const windows = [
    { days: 3, type: "appointment_reminder_3_day", label: "3-day" },
    { days: 1, type: "appointment_reminder_1_day", label: "1-day" },
  ];
  const sent = [];
  for (const window of windows) {
    if (daysOut !== window.days) continue;
    const text = [
      `Hi ${clientFirstName(booking)}, your Lovely Locs appointment is coming up ${booking.client.date} at ${timeLabel(booking.client.time)}.`,
      "Please arrive with your hair ready for the service you selected unless Lovely Locs has told you otherwise.",
      "The private studio address is shared after confirmation. Reply if you need to update your appointment details.",
    ].join("\n");
    const sms = `Lovely Locs ${window.label} reminder: your appointment is ${booking.client.date} at ${timeLabel(booking.client.time)}. Reply if you need to update details.`;
    sent.push(await sendClientAutomation(booking, window.type, booking.client.date, `Lovely Locs ${window.label} appointment reminder`, text, sms));
  }
  return sent;
}

async function runReviewRequestAutomation(booking, records, now) {
  const status = bookingStatus(booking, records);
  if (!["deposit_paid", "no_charge_test"].includes(status)) return null;
  if (daysUntilDate(booking.client?.date, now) !== -1) return null;
  const reviewUrl = process.env.REVIEW_REQUEST_URL || process.env.PUBLIC_SITE_URL || "https://lovely-locs-booking.onrender.com";
  const text = [
    `Hi ${clientFirstName(booking)}, thank you for trusting Lovely Locs with your appointment.`,
    "If your service felt good, a quick review helps new loc clients feel confident before booking.",
    `Review link: ${reviewUrl}`,
  ].join("\n");
  const sms = `Thank you for booking Lovely Locs. A quick review helps new loc clients feel confident: ${reviewUrl}`;
  return sendClientAutomation(booking, "review_request", booking.id, "How was your Lovely Locs appointment?", text, sms);
}

async function runReferralReminderAutomation(booking, records, now) {
  const status = bookingStatus(booking, records);
  if (!["deposit_paid", "no_charge_test"].includes(status)) return null;
  if (!booking.client?.referralOptIn && !booking.client?.marketingEmailOptIn) return null;
  const daysOut = daysUntilDate(booking.client?.date, now);
  if (daysOut === null || daysOut > -14 || daysOut < -60) return null;
  const siteUrl = (process.env.PUBLIC_SITE_URL || "https://lovely-locs-booking.onrender.com").replace(/\/+$/, "");
  const text = [
    "Good People Know Good People",
    "",
    `Hi ${clientFirstName(booking)}, refer a friend to Lovely Locs.`,
    "When they book, they receive the new client rate and you receive $15 off your next service.",
    `Booking link: ${siteUrl}/#services`,
    "",
    "This rewards loyalty without discounting the Lovely Locs brand.",
  ].join("\n");
  return sendClientAutomation(booking, "referral_reminder", booking.id, "Good People Know Good People", text, text, { emailOnly: true });
}

async function runBirthdayCreditAutomation(booking, records, now) {
  if (!booking.client?.marketingEmailOptIn || !booking.client?.birthday) return null;
  const key = clientIdentityKey(booking.client);
  if (!key) return null;
  const window = activeBirthdayWindow(booking.client.birthday, now);
  if (!window) return null;
  const creditId = `birthday:${window.cycleYear}:${key}`;
  const currentRecords = readBookingRecords();
  if (currentRecords.some(record => record.type === "birthday.reward.approved" && record.creditId === creditId)) return null;
  const code = `BDAY-${window.cycleYear}-${referralCodeForClient(booking.client)}`;
  const event = {
    type: "birthday.reward.approved",
    clientKey: key,
    bookingId: booking.id,
    creditId,
    discountCode: code,
    amountOff: birthdayCreditAmount,
    cycleKey: window.cycleYear,
    birthdayDate: window.birthdayDate,
    validFrom: window.validFrom,
    expiresAt: window.expiresAt,
    approvedAt: new Date().toISOString(),
  };
  appendBookingRecord(event);
  const text = [
    `Happy birthday, ${clientFirstName(booking)}!`,
    `Lovely Locs added a $${birthdayCreditAmount} birthday credit to your client settings for this year.`,
    `Your birthday credit is available from ${window.validFrom} through ${window.expiresAt}.`,
    "Birthday credits are annual and can apply to one future booking while available.",
  ].join("\n");
  return sendClientAutomation(booking, "birthday_credit", window.cycleYear, "Your annual Lovely Locs birthday credit", text, text, { emailOnly: true });
}

async function runMonthlyReferralCampaignAutomation(bookings, records, now) {
  const cycleKey = monthKey(now);
  const subject = process.env.REFERRAL_CAMPAIGN_SUBJECT || "Good People Know Good People";
  const message = process.env.REFERRAL_CAMPAIGN_MESSAGE || [
    "Good People Know Good People",
    "",
    "Refer a friend.",
    "",
    "When they book:",
    "They receive the new client rate",
    "You receive $15 off your next service",
    "",
    "This rewards loyalty without discounting the Lovely Locs brand.",
    "",
    `Booking link: ${(process.env.PUBLIC_SITE_URL || "https://lovely-locs-booking.onrender.com").replace(/\/+$/, "")}/#services`,
  ].join("\n");
  const latestByEmail = new Map();
  for (const booking of bookings) {
    const email = String(booking.client?.email || "").trim().toLowerCase();
    if (email && booking.client?.marketingEmailOptIn) latestByEmail.set(email, booking);
  }
  const results = [];
  for (const [email, booking] of latestByEmail.entries()) {
    if (automationAlreadySent(records, "monthly_referral_campaign", email, cycleKey)) continue;
    const emailText = `Hi ${clientFirstName(booking)},\n\n${message}`;
    const notificationResults = await runNotificationTasks([
      ["clientEmail", () => sendEmail(email, subject, emailText)],
    ]);
    appendBookingRecord({
      type: "automation.notification.sent",
      automationType: "monthly_referral_campaign",
      recipientKey: email,
      bookingId: booking.id,
      cycleKey,
      sentAt: new Date().toISOString(),
      notificationResults,
    });
    results.push({ sent: true, automationType: "monthly_referral_campaign", recipientKey: email, cycleKey, notificationResults });
  }
  return results;
}

async function runAutomations(options = {}) {
  const type = options.type || "daily";
  const now = options.now || new Date();
  const records = readBookingRecords();
  const bookings = latestBookingRecords(records);
  const results = [];
  const dailyTypes = new Set(["all", "daily", "deposit", "appointment", "review", "referral", "birthday"]);

  if (dailyTypes.has(type)) {
    for (const booking of bookings) {
      if (type === "all" || type === "daily" || type === "deposit") {
        const result = await runDepositReminderAutomation(booking, records, now);
        if (result) results.push(result);
      }
      if (type === "all" || type === "daily" || type === "appointment") {
        results.push(...(await runAppointmentReminderAutomation(booking, records, now)).filter(Boolean));
      }
      if (type === "all" || type === "daily" || type === "review") {
        const result = await runReviewRequestAutomation(booking, records, now);
        if (result) results.push(result);
      }
      if (type === "all" || type === "daily" || type === "referral") {
        const result = await runReferralReminderAutomation(booking, records, now);
        if (result) results.push(result);
      }
      if (type === "all" || type === "daily" || type === "birthday") {
        const result = await runBirthdayCreditAutomation(booking, records, now);
        if (result) results.push(result);
      }
    }
  }

  if (["all", "monthly", "referral-campaign"].includes(type)) {
    results.push(...(await runMonthlyReferralCampaignAutomation(bookings, records, now)));
  }

  return {
    ok: true,
    type,
    checkedBookings: bookings.length,
    sent: results.filter(result => result?.sent).length,
    skipped: results.filter(result => result?.skipped).length,
    results,
  };
}

async function handleDiscountValidate(req, res) {
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw || "{}");
    const code = normalizeDiscountCode(body.code || "");
    const discount = activeDiscountForCode(code);
    if (!discount) {
      sendJson(res, 400, { ok: false, error: "That promo code is not active or has expired." });
      return;
    }
    sendJson(res, 200, {
      ok: true,
      code: discount.code,
      percent: discount.percent,
      expiresAt: discount.expiresAt,
      message: `${discount.code} applied for ${discount.percent}% off.`,
    });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
  }
}

async function handleDiscountEmail(req, res) {
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw || "{}");
    const email = String(body.email || "").trim();
    const discount = activeDiscountForCode(body.code || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendJson(res, 400, { ok: false, error: "Enter a valid email address." });
      return;
    }
    if (!discount) {
      sendJson(res, 400, { ok: false, error: "That promo code is not active or has expired." });
      return;
    }
    if (!emailConfigured()) {
      sendJson(res, 503, { ok: false, error: "Promo email is not configured yet. Save or screenshot the code for now." });
      return;
    }
    const expiresText = discount.expiresAt ? ` It expires on ${discount.expiresAt}.` : "";
    await sendEmail(
      email,
      `Lovely Locs promo code: ${discount.code}`,
      `Your Lovely Locs promo code is ${discount.code} for ${discount.percent}% off.${expiresText} Use it in the cart before booking. Codes must be active and unexpired when you submit your appointment request.`
    );
    sendJson(res, 200, { ok: true, message: "Promo code email was sent." });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
  }
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
      reserveBookingCredit(pendingBooking);
      sendJson(res, 200, {
        ok: true,
        id,
        status: pendingBooking.status,
        noCharge: true,
        subtotal: pendingBooking.subtotal,
        discountCode: pendingBooking.discountCode,
        discountPercent: pendingBooking.discountPercent,
        discountAmount: pendingBooking.discountAmount,
        total: pendingBooking.total,
        deposit: pendingBooking.deposit,
        message: "Free admin test booking saved. No deposit was requested. Confirmation messages were attempted with the connected providers.",
        notificationResults,
      });
      return;
    }

    const savedBooking = {
      ...pendingBooking,
      status: "pending_manual_payment",
      paymentOptions: publicManualPaymentOptions(),
    };
    const notificationResults = await notifyManualPaymentPending(savedBooking, req);
    appendBookingRecord({ ...savedBooking, notificationResults });
    recordReferralPending(savedBooking);
    reserveBookingCredit(savedBooking);

    sendJson(res, 200, {
      ok: true,
      id,
      status: savedBooking.status,
      payOptionsUrl: `${publicSiteUrl(req)}/?booking=${encodeURIComponent(id)}&deposit=${encodeURIComponent(savedBooking.deposit)}#payment-options`,
      paymentOptions: savedBooking.paymentOptions,
      subtotal: savedBooking.subtotal,
      discountCode: savedBooking.discountCode,
      discountPercent: savedBooking.discountPercent,
      discountAmount: savedBooking.discountAmount,
      total: savedBooking.total,
      deposit: savedBooking.deposit,
      message: "Appointment request saved. Pay options are ready; Lovely Locs will send the official confirmation after the deposit receipt is verified in Gmail.",
    });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
  }
}

async function handleManualPaymentConfirm(req, res) {
  let wantsJson = false;
  try {
    const siteUrl = publicSiteUrl(req);
    const url = new URL(req.url || "/", siteUrl);
    const token = url.searchParams.get("token") || "";
    wantsJson = url.searchParams.get("format") === "json";
    if (!tokenIsValid(token)) {
      if (wantsJson) {
        sendJson(res, 403, { ok: false, error: "The owner confirmation token is missing or invalid." });
        return;
      }
      sendHtml(res, 403, "<h1>Manual deposit confirmation unavailable</h1><p>The owner confirmation token is missing or invalid.</p>");
      return;
    }

    const bookingId = url.searchParams.get("booking") || "";
    const method = url.searchParams.get("method") || "manual";
    const booking = findBookingById(bookingId);
    if (!booking) {
      if (wantsJson) {
        sendJson(res, 404, { ok: false, error: "No matching Lovely Locs booking was found for this confirmation link." });
        return;
      }
      sendHtml(res, 404, "<h1>Booking not found</h1><p>No matching Lovely Locs booking was found for this confirmation link.</p>");
      return;
    }

    const notificationResults = await notifyManualDepositPaid(booking, method);
    const referralReward = approveReferralReward(booking);
    const redeemedCredit = redeemBookingCredit(booking);
    appendBookingRecord({
      type: "manual.deposit.confirmed",
      bookingId,
      receivedAt: new Date().toISOString(),
      status: "deposit_paid",
      manualPayment: { method },
      notificationResults,
      referralReward,
      redeemedCredit,
    });

    if (wantsJson) {
      sendJson(res, 200, { ok: true, bookingId, notificationResults, referralReward, redeemedCredit });
      return;
    }
    sendHtml(res, 200, `<h1>Deposit confirmed</h1><p>Lovely Locs confirmation messages were attempted for booking ${bookingId}.</p>`);
  } catch (error) {
    if (wantsJson) {
      sendJson(res, 400, { ok: false, error: error.message });
      return;
    }
    sendHtml(res, 400, `<h1>Confirmation failed</h1><p>${error.message}</p>`);
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
      const referralReward = booking ? approveReferralReward(booking) : null;
      const redeemedCredit = booking ? redeemBookingCredit(booking) : null;
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
        referralReward,
        redeemedCredit,
      });
    }

    sendJson(res, 200, { received: true });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
  }
}

function clientSettingsFor(client, req) {
  const records = readBookingRecords();
  const latest = latestClientBooking(client, records);
  const profile = latest?.client || {
    fullName: String(client.fullName || "").trim(),
    email: String(client.email || "").trim(),
    phone: String(client.phone || "").trim(),
  };
  const key = clientIdentityKey(profile);
  const referralCode = normalizeReferralCode(profile.referralCode || referralCodeForClient(profile));
  const siteUrl = publicSiteUrl(req);
  const shareUrl = `${siteUrl}/?ref=${encodeURIComponent(referralCode)}#services`;
  const pendingReferrals = records.filter(record => record.type === "referral.reward.pending" && record.referrerKey === key);
  const approvedReferrals = records.filter(record => record.type === "referral.reward.approved" && record.clientKey === key);
  const credits = records.filter(record => (
    ["referral.reward.approved", "birthday.reward.approved"].includes(record.type)
    && record.clientKey === key
  )).map(record => {
    const reserved = records.some(item => item.type === "discount.credit.reserved" && item.creditId === record.creditId);
    const redeemed = records.some(item => item.type === "discount.credit.redeemed" && item.creditId === record.creditId);
    const expired = creditIsExpired(record);
    return {
      type: record.type === "birthday.reward.approved" ? "birthday" : "referral",
      status: redeemed ? "redeemed" : reserved ? "reserved" : expired ? "expired" : "available",
      creditId: record.creditId,
      discountCode: record.discountCode,
      amountOff: record.amountOff,
      createdAt: record.approvedAt,
      validFrom: record.validFrom || "",
      expiresAt: record.expiresAt || "",
    };
  });
  return {
    ok: true,
    clientFound: Boolean(latest),
    client: {
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      birthday: profile.birthday || "",
      preferredContact: profile.preferredContact || "text_email",
      smsOptIn: Boolean(profile.smsOptIn),
      marketingEmailOptIn: Boolean(profile.marketingEmailOptIn),
      referralOptIn: Boolean(profile.referralOptIn),
      specialRequests: profile.specialRequests || "",
    },
    referralCode,
    shareUrl,
    referrals: {
      pending: pendingReferrals.map(record => ({
        referredClientName: record.referredClientName || "Pending client",
        referredBookingId: record.referredBookingId,
        amountOff: record.amountOff,
        createdAt: record.createdAt,
        status: "pending_deposit",
      })),
      approved: approvedReferrals.map(record => ({
        referredBookingId: record.referredBookingId,
        amountOff: record.amountOff,
        approvedAt: record.approvedAt,
        status: "approved",
      })),
    },
    credits,
    auth: {
      gmailConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
    },
  };
}

async function handleClientSettings(req, res) {
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw || "{}");
    const client = sanitizeClient({
      fullName: body.fullName || "",
      email: body.email || "",
      phone: body.phone || "",
      date: "2099-01-01",
      time: "18:30",
    });
    if (!client.email || !client.phone) {
      sendJson(res, 400, { ok: false, error: "Enter the email and phone number used for booking." });
      return;
    }
    sendJson(res, 200, clientSettingsFor(client, req));
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
  }
}

async function handleNotificationTest(req, res) {
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw || "{}");
    if (!tokenIsValid(body.token || "")) {
      sendJson(res, 403, { ok: false, error: "Admin token is missing or invalid." });
      return;
    }
    const channel = String(body.channel || "all").trim().toLowerCase();
    const email = String(body.email || ownerEmail).trim();
    const phone = normalizePhone(body.phone || ownerPhone);
    const tasks = [];
    const stamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    if (channel === "all" || channel === "email") {
      tasks.push(["ownerEmail", () => sendEmail(email, "Lovely Locs notification test", `Lovely Locs test email sent at ${stamp}. If you see this, email notifications are working.`)]);
    }
    if (channel === "all" || channel === "sms") {
      tasks.push(["ownerSms", () => sendSms(phone, `Lovely Locs test text sent at ${stamp}.`)]);
    }
    if (!tasks.length) {
      sendJson(res, 400, { ok: false, error: "Choose email, SMS, or both." });
      return;
    }
    sendJson(res, 200, { ok: true, results: await runNotificationTasks(tasks) });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
  }
}

async function handleAutomationRun(req, res) {
  try {
    const siteUrl = publicSiteUrl(req);
    const url = new URL(req.url || "/", siteUrl);
    let body = {};
    if (req.method === "POST") {
      const raw = await readBody(req);
      body = raw ? JSON.parse(raw) : {};
    }
    const bearer = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const token = body.token || url.searchParams.get("token") || bearer;
    if (!process.env.AUTOMATION_RUN_TOKEN && !process.env.MANUAL_DEPOSIT_CONFIRM_TOKEN) {
      sendJson(res, 503, { ok: false, error: "AUTOMATION_RUN_TOKEN is not configured." });
      return;
    }
    if (!automationTokenIsValid(token)) {
      sendJson(res, 403, { ok: false, error: "Automation token is missing or invalid." });
      return;
    }
    const type = String(body.type || url.searchParams.get("type") || "daily").trim().toLowerCase();
    const validTypes = new Set(["all", "daily", "monthly", "referral-campaign", "deposit", "appointment", "review", "referral", "birthday"]);
    if (!validTypes.has(type)) {
      sendJson(res, 400, { ok: false, error: "Unknown automation type." });
      return;
    }
    sendJson(res, 200, await runAutomations({ type }));
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
  }
}

function automationProviderStatus() {
  const configuredForSms = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
  const blockedReason = smsBlockedReason();
  const email = emailReadiness();
  return {
    tokenConfigured: Boolean(process.env.AUTOMATION_RUN_TOKEN || process.env.MANUAL_DEPOSIT_CONFIRM_TOKEN),
    emailConfigured: email.configured,
    emailReadyForClients: email.clientReady,
    emailReadinessReason: email.reason,
    smsConfigured: configuredForSms,
    smsReady: configuredForSms && !blockedReason,
    smsBlockedReason: blockedReason,
    dailyTypes: ["deposit", "appointment", "review", "referral", "birthday"],
    monthlyTypes: ["referral-campaign"],
  };
}

function startAutomationLoop() {
  if (process.env.AUTOMATION_AUTO_RUN !== "true") return;
  const runDaily = () => runAutomations({ type: "daily" }).catch(error => {
    console.error(`Lovely Locs automation run failed: ${error.message}`);
  });
  const firstRun = setTimeout(runDaily, 60 * 1000);
  const interval = setInterval(runDaily, 12 * 60 * 60 * 1000);
  if (firstRun.unref) firstRun.unref();
  if (interval.unref) interval.unref();
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && (req.url || "").split("?")[0] === "/healthz") {
    sendJson(res, 200, { ok: true, service: "lovely-locs" });
    return;
  }

  if (req.method === "GET" && (req.url || "").split("?")[0] === "/api/notification-status") {
    const configuredForSms = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
    const blockedReason = smsBlockedReason();
    const email = emailReadiness();
    sendJson(res, 200, {
      ok: true,
      emailConfigured: email.configured,
      emailReadyForClients: email.clientReady,
      emailReadinessReason: email.reason,
      confirmationFromEmail: email.from || configuredEmailAddress(process.env.CONFIRMATION_FROM_EMAIL || ""),
      ownerEmail,
      smsConfigured: configuredForSms,
      smsReady: configuredForSms && !blockedReason,
      smsBlockedReason: blockedReason,
      automation: automationProviderStatus(),
    });
    return;
  }

  if (req.method === "GET" && (req.url || "").split("?")[0] === "/api/automation-status") {
    sendJson(res, 200, { ok: true, ...automationProviderStatus() });
    return;
  }

  if (req.method === "GET" && (req.url || "").split("?")[0] === "/api/site-settings") {
    sendJson(res, 200, { ok: true, settings: readSiteSettings() });
    return;
  }

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/site-settings") {
    readBody(req).then(raw => {
      const body = JSON.parse(raw || "{}");
      if (!tokenIsValid(body.token || "")) {
        sendJson(res, 403, { ok: false, error: "Admin token is missing or invalid." });
        return;
      }
      const settings = saveSiteSettings({ logo: body.logo, discount: body.discount });
      sendJson(res, 200, { ok: true, settings });
    }).catch(error => {
      sendJson(res, 400, { ok: false, error: error.message });
    });
    return;
  }

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/discount/validate") {
    handleDiscountValidate(req, res);
    return;
  }

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/discount/email") {
    handleDiscountEmail(req, res);
    return;
  }

  if (req.method === "GET" && (req.url || "").split("?")[0] === "/api/availability") {
    const siteUrl = publicSiteUrl(req);
    const url = new URL(req.url || "/", siteUrl);
    const date = String(url.searchParams.get("date") || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      sendJson(res, 400, { ok: false, error: "A valid date is required." });
      return;
    }
    sendJson(res, 200, { ok: true, ...availabilityForDate(date) });
    return;
  }

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/bookings") {
    handleBooking(req, res);
    return;
  }

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/client-settings") {
    handleClientSettings(req, res);
    return;
  }

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/notifications/test") {
    handleNotificationTest(req, res);
    return;
  }

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/stripe/webhook") {
    handleStripeWebhook(req, res);
    return;
  }

  if (["GET", "POST"].includes(req.method) && (req.url || "").split("?")[0] === "/api/automations/run") {
    handleAutomationRun(req, res);
    return;
  }

  if (req.method === "GET" && (req.url || "").split("?")[0] === "/api/manual-payment/confirm") {
    handleManualPaymentConfirm(req, res);
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
  startAutomationLoop();
});
