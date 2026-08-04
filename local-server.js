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
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : root;
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const bookingsFile = path.join(dataDir, "bookings.jsonl");
const settingsFile = path.join(dataDir, "site-settings.json");
const ownerEmail = process.env.BOOKING_OWNER_EMAIL || "lvlc.support@lovelylocsnc.com";
const ownerPhone = process.env.BOOKING_OWNER_PHONE || "3364711098";
const emailLogoUrl = "https://lovelylocsnc.com/assets/lovely-locs-logo.jpg";
const legacyLogoUrls = new Set([
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6978dfbb416a772de9813cbb/da2605355_ModernBeigeBuyOneCoffeeGetOneFreeHalfPageAd.png"
]);
const dayMs = 24 * 60 * 60 * 1000;
const minimumBookingLeadMs = 24 * 60 * 60 * 1000;
const referralCreditAmount = Number(process.env.REFERRAL_CREDIT_AMOUNT || 15);
const referredNewClientCreditAmount = Number(process.env.REFERRED_NEW_CLIENT_CREDIT_AMOUNT || 15);
const birthdayCreditAmount = Number(process.env.BIRTHDAY_CREDIT_AMOUNT || 15);
const returningClientCreditAmount = Number(process.env.RETURNING_CLIENT_CREDIT_AMOUNT || 5);
let stripeClient = null;
let googleJwksCache = { expiresAt: 0, keys: [] };

const defaultSiteSettings = {
  logo: {
    url: emailLogoUrl,
    navSize: 40,
    heroSize: 88,
    heroAlign: "center",
    fit: "contain",
    x: 50,
    y: 50,
  },
  discount: {
    code: "LOVELY10",
    percent: 10,
    enabled: false,
    expiresAt: "",
  },
  catalog: [],
};

const serviceCatalog = [
  { id: "shampoo-service", duration: "30 min", price: 15, name: "Shampoo Service", description: "Standard shampoo cleanse add-on for clients who want Lovely Locs to shampoo their scalp and locs before the booked service.", category: "add-ons" },
  { id: "acv-clarifying-wash", duration: "45 min", price: 25, name: "ACV Clarifying Wash", description: "Apple cider vinegar clarifying wash for light buildup, oils, or product residue that needs a deeper cleanse than a standard shampoo.", category: "add-ons" },
  { id: "full-acv-buildup-removal", duration: "1h", price: 40, name: "Full ACV Buildup Removal Service", description: "Full ACV buildup removal for heavier product buildup, lint, odor, or residue before styling or maintenance begins.", category: "add-ons" },
  { id: "loc-trim", duration: "20 min", price: 10, name: "Loc Trim", category: "add-ons", requiresMainService: true, compatibleMainCategories: ["loc-maintenance"] },
  { id: "sprinkles-addon", duration: "1h", price: 20, name: "Loc Sprinkles (Add On)", description: "Maintenance add-on includes up to two locs with jewels on hand or jewels provided by the client, with up to two color choices. There is no upcharge for client-provided beads or beads already on hand. Very specific colors, custom jewelry, or jewelry purchased specifically for your order start at an additional $15.", category: "add-ons", requiresMainService: true, compatibleMainCategories: ["loc-maintenance"], requiresSprinklePreferences: true },
  { id: "emergency-fee", duration: "3h", price: 45, name: "Emergency Fee", category: "add-ons" },
  { id: "children-instant-starter", duration: "5h", price: 150, name: "Children Instant Starter Locs", category: "starter-locs" },
  { id: "medium-adult-starter", duration: "6h 30min", price: 150, name: "Medium Adult Starter Locs", category: "starter-locs" },
  { id: "adult-retwist", duration: "3h 30min", price: 90, name: "Adult Retwist (Maintenance)", category: "loc-maintenance", includedAddOnIds: ["style-addon"] },
  { id: "child-starter-coils", duration: "3h 30min", price: 75, name: "Children's Starter Locs Coils & Two Strand Twist", category: "starter-locs" },
  { id: "sprinkle-install", duration: "2h 15min", price: 50, priceLabel: "Starting at $50", name: "Loc Sprinkles Installation", description: "Standalone installation starts at $50 and includes up to two locs with jewels on hand or jewels provided by the client, with up to two color choices. There is no upcharge for client-provided beads or beads already on hand. Very specific colors, custom jewelry, or jewelry purchased specifically for your order start at an additional $15.", category: "add-ons", standaloneAppointment: true, requiresSprinklePreferences: true },
  { id: "children-retwist", duration: "3h", price: 75, name: "Children Retwist (Maintenance)", category: "loc-maintenance", includedAddOnIds: ["style-addon"] },
  { id: "adult-instant", duration: "5h 30min", price: 125, name: "Adult Instant Locs", category: "instant-crochet", includedAddOnIds: ["style-addon"] },
  { id: "child-instant", duration: "3h 30min", price: 85, name: "Children's Instant Loc", category: "instant-crochet", includedAddOnIds: ["style-addon"] },
  { id: "referral-retwist", duration: "3h 30min", price: 75, name: "Referral (Retwist)", category: "loc-maintenance", includedAddOnIds: ["style-addon"] },
  { id: "style-addon", duration: "1h 30min", price: 30, name: "Basic Style", category: "add-ons", requiresMainService: true, compatibleMainCategories: ["loc-maintenance"] },
  { id: "consultation", duration: "1h 15min", price: 30, name: "Consultation", category: "add-ons" },
  { id: "loc-repair", duration: "30 min", price: 3, priceLabel: "$3 per loc", name: "Loc Repair", category: "add-ons", requiresMainService: true, compatibleMainCategories: ["loc-maintenance"] },
  { id: "small-adult-starter", duration: "5h 30min", price: 225, name: "Small Adult Starter Locs", category: "starter-locs" },
  { id: "overdue-retwist", duration: "4-5 hours", price: 125, name: "Overdue Retwist (4+ Months)", category: "loc-maintenance", includedAddOnIds: ["style-addon"] },
  { id: "admin-test-booking", duration: "15 min", price: 0, name: "Free Admin Test Booking", category: "admin-test" },
];

const productCatalog = [
  { id: "product-Gold Sparkle Sprinkles", price: 12, name: "Gold Sparkle Sprinkles" },
  { id: "product-Silver Shimmer Sprinkles", price: 12, name: "Silver Shimmer Sprinkles" },
  { id: "product-Rose Gold Sprinkles", price: 12, name: "Rose Gold Sprinkles" },
  { id: "product-Custom Color Sprinkles", price: 15, name: "Custom Color Sprinkles" },
];

const allowedBaseProducts = new Set([
  "Loctician's Preference",
  "Gel",
  "Foam",
  "Oil and Water",
  "Bring Your Own Product",
]);
const allowedLocJourneyLengths = new Set(["", "exploring", "under_1_year", "1_to_3_years", "3_to_5_years", "5_plus_years"]);
const sprinkleCustomJewelryFee = 15;
const sprinkleJewelrySourceLabels = {
  byoj: "BYOJ - Bring Your Own Jewels",
  "on-hand": "Use On-Hand Beads",
  custom: "Custom Colors or Styles"
};
const allowedPartingFees = new Map([
  ["Brick Layered Parts", 0],
  ["Natural C Parts", 0],
  ["Triangle Parts", 40],
]);

const regularAppointmentTimes = ["11:00", "16:00"];
const scheduledWorkAppointmentTimes = ["19:00"];
const scheduledWorkDates = new Set([
  "2026-06-27",
  "2026-06-30",
  "2026-07-01",
  "2026-07-07",
  "2026-07-08",
  "2026-07-09",
  "2026-07-10",
  "2026-07-13",
  "2026-07-14",
  "2026-07-15",
  "2026-07-16",
  "2026-07-17",
  "2026-07-20",
  "2026-07-21",
  "2026-07-22",
  "2026-07-23",
  "2026-07-25",
  "2026-07-28",
  "2026-07-29",
  "2026-07-30",
]);
const friendTestCheckpoints = ["home", "services", "products", "policies", "contact", "privacy", "terms"];
const friendTestCampaign = "friends-booking-test-2026-06";
const friendTestCampaignLimit = 10;
const emergencyProposalTimes = ["10:00", "12:00", "14:00", "16:00", "22:30"];
const forcedOpenAppointmentTimes = new Map([
  ["2026-07-03", new Set(["11:00", "16:00"])],
]);
const holidayAppointmentTimesByDate = new Map([
  ["2026-07-04", ["11:00", "16:00"]],
]);
const holidayBookedAppointmentTimes = new Map([
  ["2026-07-04", new Set(["16:00"])],
]);
const holidayDates = new Set([
  "2026-01-01",
  "2026-01-19",
  "2026-02-14",
  "2026-02-16",
  "2026-04-05",
  "2026-05-10",
  "2026-05-25",
  "2026-06-19",
  "2026-06-21",
  "2026-07-04",
  "2026-07-11",
  "2026-07-31",
  "2026-09-07",
  "2026-10-12",
  "2026-10-31",
  "2026-11-11",
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

function sendJson(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders,
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
  const discountLabel = booking.discountPercent
    ? `${booking.discountPercent}% off`
    : `$${booking.discountAmount || 0} off`;
  const serviceLines = (booking.cart || []).map(item => {
    const details = [
      item.duration ? `Time: ${item.duration}` : "",
      item.baseProduct ? `Base product: ${item.baseProduct}` : "",
      item.shampooDeclined ? "Shampoo: Client will arrive freshly shampooed" : "",
      item.partingPreference ? `Parting: ${item.partingPreference}${item.partingFee ? ` (+${item.partingFee})` : ""}` : "",
      sprinklePreferencesSummary(item) ? `Sprinkles: ${sprinklePreferencesSummary(item)}` : "",
    ].filter(Boolean).join("; ");
    return `- ${item.name} ($${item.price}${details ? ` | ${details}` : ""})`;
  });

  return [
    "Lovely Locs appointment request",
    "",
    `Client: ${booking.client?.fullName || ""}`,
    `Email: ${booking.client?.email || ""}`,
    booking.client?.phone ? `Phone: ${booking.client.phone}` : "",
    `Appointment date: ${booking.client?.date || ""}`,
    `Appointment time: ${timeLabel(booking.client?.time)}`,
    booking.client?.birthday ? `Birthday: ${booking.client.birthday}` : "",
    `Appointment type: ${booking.client?.appointmentType || "standard"}`,
    booking.client?.referralCode ? `Client referral code: ${booking.client.referralCode}` : "",
    booking.client?.referredByCode ? `Referred by code: ${booking.client.referredByCode}` : "",
    booking.friendTest ? `Friend website test: ${booking.friendTest.code}` : "",
    booking.friendTest ? `Website coverage: ${booking.friendTest.completedCheckpoints}/${booking.friendTest.totalCheckpoints} checkpoints (${booking.friendTest.percentComplete}%)` : "",
    booking.friendTest ? `Missing checkpoints: ${booking.friendTest.missing.join(", ") || "None - Golden Loc unlocked"}` : "",
    "",
    "Services / products:",
    serviceLines.length ? serviceLines.join("\n") : "- No cart items included",
    "",
    booking.subtotal && booking.discountAmount ? `Subtotal before promo: $${booking.subtotal}` : "",
    booking.discountAmount ? `Promo code: ${booking.discountCode || ""} (${discountLabel}, -$${booking.discountAmount})` : "",
    `Estimated total: $${booking.total || 0}`,
    `Deposit required: $${booking.deposit || 0}`,
    "",
    `Notes: ${booking.client?.specialRequests || "No special requests added."}`,
    "",
    "Policy acknowledgement: Client confirmed they read the Lovely Locs policies.",
    booking.shampooDeclineAcknowledgement ? "Shampoo preparation acknowledgement: Client confirmed they must arrive freshly shampooed after declining Shampoo Service." : "",
    "Studio note: Address is shared after booking and deposit are confirmed.",
  ].filter(line => line !== "").join("\n");
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailDetailRows(rows = []) {
  return rows
    .filter(row => row?.value !== undefined && row?.value !== null && String(row.value).trim() !== "")
    .map(row => `
      <tr>
        <td style="padding:10px 0;color:#7a6257;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0;color:#3b2821;font-size:15px;text-align:right;font-weight:700;">${escapeHtml(row.value)}</td>
      </tr>
    `).join("");
}

function serviceSummaryHtml(booking) {
  const items = (booking.selectedServices?.length ? booking.selectedServices : booking.cart || []);
  if (!items.length) return "";
  return items.map(item => {
    const details = [
      item.duration ? `Time: ${item.duration}` : "",
      item.baseProduct ? `Base product: ${item.baseProduct}` : "",
      item.shampooDeclined ? "Shampoo: Client will arrive freshly shampooed" : "",
      item.partingPreference ? `Parting: ${item.partingPreference}${item.partingFee ? ` (+${item.partingFee})` : ""}` : "",
      sprinklePreferencesSummary(item) ? `Sprinkles: ${sprinklePreferencesSummary(item)}` : "",
    ].filter(Boolean).join(" • ");
    return `<li style="margin:0 0 8px;color:#3b2821;"><strong>${escapeHtml(item.name)}</strong>${details ? `<br><span style="color:#7a6257;">${escapeHtml(details)}</span>` : ""}</li>`;
  }).join("");
}

function referralEmailCardHtml(referral = {}) {
  referral = referral || {};
  if (!referral.code || !referral.shareUrl) return "";
  return `
    <div style="margin-top:22px;background:linear-gradient(135deg,#f3e6f5,#fff1ea);border:1px solid #ddc2df;border-radius:16px;padding:20px;text-align:center;">
      <p style="margin:0 0 7px;color:#7b4f5f;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;">Good People Know Good People</p>
      <h2 style="margin:0 0 9px;color:#3b2821;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:400;">Share Lovely Locs</h2>
      <p style="margin:0 0 12px;color:#6c544b;font-size:14px;line-height:1.5;">Send your personal code or link to someone who would love a Lovely Locs appointment.</p>
      <div style="margin:0 auto 14px;background:#3b2821;color:#fffaf7;border-radius:12px;padding:13px 14px;font-size:18px;font-weight:800;letter-spacing:.04em;">${escapeHtml(referral.code)}</div>
      <a href="${escapeHtml(referral.shareUrl)}" style="background:#7b4f5f;color:#ffffff;text-decoration:none;border-radius:999px;display:inline-block;padding:13px 18px;font-weight:800;">Share My Referral Link</a>
    </div>`;
}

function brandEmailHtml({ eyebrow = "Lovely Locs", title, intro, rows = [], services = "", referral = null, note = "", ctaUrl = "", ctaLabel = "" }) {
  return `
  <div style="margin:0;padding:0;background:#f8f0ea;font-family:Arial,Helvetica,sans-serif;color:#3b2821;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f0ea;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffaf7;border:1px solid #ead8cf;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:#3b2821;padding:24px;text-align:center;">
                <img src="${emailLogoUrl}" alt="Lovely Locs" width="92" height="92" style="display:block;margin:0 auto 12px;border-radius:999px;object-fit:cover;border:3px solid #f3d9ce;">
                <p style="margin:0;color:#f3d9ce;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;">${escapeHtml(eyebrow)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px 12px;">
                <h1 style="margin:0 0 12px;color:#3b2821;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;font-weight:400;">${escapeHtml(title)}</h1>
                <p style="margin:0;color:#6c544b;font-size:16px;line-height:1.65;">${escapeHtml(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 28px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #ead8cf;border-bottom:1px solid #ead8cf;">
                  ${emailDetailRows(rows)}
                </table>
                ${services ? `<div style="margin-top:22px;"><p style="margin:0 0 10px;color:#7a6257;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;">Service Details</p><ul style="padding-left:20px;margin:0;">${services}</ul></div>` : ""}
                ${referralEmailCardHtml(referral)}
                ${note ? `<div style="margin-top:22px;background:#f1e3dc;border-radius:14px;padding:16px;color:#5d453c;font-size:15px;line-height:1.55;">${escapeHtml(note)}</div>` : ""}
                ${ctaUrl && ctaLabel ? `<p style="margin:26px 0 0;"><a href="${escapeHtml(ctaUrl)}" style="background:#7b4f5f;color:#ffffff;text-decoration:none;border-radius:999px;display:inline-block;padding:13px 18px;font-weight:800;">${escapeHtml(ctaLabel)}</a></p>` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;background:#fff3ee;color:#7a6257;font-size:13px;line-height:1.5;text-align:center;">
                Lovely Locs • Private in-home studio • Address shared after confirmation
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
}

function confirmationEmail(booking, { test = false } = {}) {
  const title = test ? "Your Lovely Locs test booking came through" : "Your loc time is confirmed";
  const intro = test
    ? "This was a no-charge owner test, but the email style matches what clients will see after a confirmed deposit."
    : "Take a breath, your appointment request is no longer floating around. Your deposit has been received, and your Lovely Locs time is saved.";
  const rows = [
    { label: "Client", value: booking.client?.fullName },
    { label: "Date", value: booking.client?.date },
    { label: "Time", value: timeLabel(booking.client?.time) },
    { label: "Booking ID", value: booking.id },
    { label: "Deposit", value: `$${booking.deposit || 0}` },
    { label: "Estimated Total", value: `$${booking.total || 0}` },
  ];
  const referralCode = normalizeReferralCode(booking.client?.referralCode || referralCodeForClient(booking.client));
  const siteUrl = String(process.env.PUBLIC_SITE_URL || `http://127.0.0.1:${port}`).replace(/\/+$/, "");
  const referralShareUrl = booking.referralShareUrl || `${siteUrl}/?ref=${encodeURIComponent(referralCode)}#services`;
  return {
    text: [
      title,
      "",
      intro,
      "",
      `Booking ID: ${booking.id}`,
      `Date: ${booking.client?.date || ""}`,
      `Time: ${timeLabel(booking.client?.time)}`,
      `Deposit: $${booking.deposit || 0}`,
      "",
      "Your personal referral code:",
      referralCode,
      `Share link: ${referralShareUrl}`,
      "",
      "Please arrive with your hair ready for the service unless Lovely Locs has told you otherwise.",
      "",
      "Hey, and here’s the location details.",
      "",
      "📍 Address: 4018 McIntosh Street, Unit K",
      "Greensboro, NC 27407",
      "",
      "🚗 Parking: Please park in the visitor spots or along the side of the parking lot.",
      "",
      "📲 Upon Arrival: Just text me or knock and I’ll meet you at the door!",
      "",
      bookingText(booking),
    ].join("\n"),
    html: brandEmailHtml({
      eyebrow: test ? "Owner Test" : "Appointment Confirmed",
      title,
      intro,
      rows,
      services: serviceSummaryHtml(booking),
      referral: { code: referralCode, shareUrl: referralShareUrl },
      note: "Please arrive with your hair ready for the service unless Lovely Locs has told you otherwise.<br><br>Hey, and here’s the location details.<br><br>📍 <strong>Address:</strong> 4018 McIntosh Street, Unit K<br>Greensboro, NC 27407<br><br>🚗 <strong>Parking:</strong> Please park in the visitor spots or along the side of the parking lot.<br><br>📲 <strong>Upon Arrival:</strong> Just text me or knock and I’ll meet you at the door!",
    }),
  };
}

function depositRequestEmail(booking, payUrl) {
  const title = "Your Lovely Locs deposit step is ready";
  const intro = "Your appointment request was saved, but it is not finalized yet. Send the deposit through Venmo, Cash App, or Apple Pay and include your booking ID so Lovely Locs can match the receipt.";
  const rows = [
    { label: "Client", value: booking.client?.fullName },
    { label: "Date", value: booking.client?.date },
    { label: "Time", value: timeLabel(booking.client?.time) },
    { label: "Booking ID", value: booking.id },
    { label: "Deposit", value: `$${booking.deposit || 0}` },
    { label: "Estimated Total", value: `$${booking.total || 0}` },
  ];
  const paymentOptions = paymentOptionsText(booking);
  return {
    text: [
      title,
      "",
      intro,
      "",
      `Booking ID: ${booking.id}`,
      `Date: ${booking.client?.date || ""}`,
      `Time: ${timeLabel(booking.client?.time)}`,
      `Deposit required: $${booking.deposit || 0}`,
      `Pay options: ${payUrl}`,
      "",
      "Payment options:",
      paymentOptions,
      "",
      "Your official appointment confirmation is sent after Lovely Locs verifies the matching receipt.",
      "",
      bookingText(booking),
    ].join("\n"),
    html: brandEmailHtml({
      eyebrow: "Deposit Needed",
      title,
      intro,
      rows,
      services: serviceSummaryHtml(booking),
      note: "Your official appointment confirmation is sent after Lovely Locs verifies the matching receipt.",
      ctaUrl: payUrl,
      ctaLabel: "Open Pay Options",
    }),
  };
}

function depositReleasedEmail(booking, reason) {
  const title = "Your Lovely Locs appointment request was released";
  const intro = "Lovely Locs did not receive a matching deposit for this appointment request, so the unpaid hold was released and the time is open for booking again.";
  const rows = [
    { label: "Client", value: booking.client?.fullName },
    { label: "Date", value: booking.client?.date },
    { label: "Time", value: timeLabel(booking.client?.time) },
    { label: "Booking ID", value: booking.id },
    { label: "Deposit", value: `$${booking.deposit || 0}` },
  ];
  return {
    text: [
      title,
      "",
      intro,
      "",
      `Booking ID: ${booking.id}`,
      `Date: ${booking.client?.date || ""}`,
      `Time: ${timeLabel(booking.client?.time)}`,
      `Reason: ${reason}`,
      "",
      "You can submit a new appointment request from the Lovely Locs booking page when you are ready.",
      "",
      bookingText(booking),
    ].join("\n"),
    html: brandEmailHtml({
      eyebrow: "Appointment Request Released",
      title,
      intro,
      rows,
      services: serviceSummaryHtml(booking),
      note: reason,
    }),
  };
}
function ownerBookingEmail(booking, { title, intro, ctaUrl = "", ctaLabel = "" }) {
  const rows = [
    { label: "Client", value: booking.client?.fullName },
    { label: "Client Email", value: booking.client?.email },
    { label: "Phone", value: booking.client?.phone },
    { label: "Date", value: booking.client?.date },
    { label: "Time", value: timeLabel(booking.client?.time) },
    { label: "Booking ID", value: booking.id },
    { label: "Deposit", value: `$${booking.deposit || 0}` },
    { label: "Estimated Total", value: `$${booking.total || 0}` },
    booking.friendTest ? { label: "Friend Test", value: booking.friendTest.code } : null,
    booking.friendTest ? { label: "Website Coverage", value: `${booking.friendTest.completedCheckpoints}/${booking.friendTest.totalCheckpoints} checkpoints (${booking.friendTest.percentComplete}%)` } : null,
  ].filter(Boolean);
  const friendTestNote = booking.friendTest
    ? `Friend test ${booking.friendTest.complete ? "complete" : "incomplete"}. Missing: ${booking.friendTest.missing.join(", ") || "none"}.`
    : "";
  return brandEmailHtml({
    eyebrow: "Owner Update",
    title,
    intro,
    rows,
    services: serviceSummaryHtml(booking),
    note: [
      booking.client?.specialRequests ? `Client notes: ${booking.client.specialRequests}` : "No special client notes were added.",
      friendTestNote,
    ].filter(Boolean).join(" "),
    ctaUrl,
    ctaLabel,
  });
}

function gmailComposeUrl(to, subject, body) {
  const url = new URL("https://mail.google.com/mail/");
  url.searchParams.set("view", "cm");
  url.searchParams.set("fs", "1");
  url.searchParams.set("to", to || "");
  url.searchParams.set("su", subject || "");
  url.searchParams.set("body", body || "");
  return url.toString();
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
      reason: "CONFIRMATION_FROM_EMAIL is still a placeholder. Use the verified Lovely Locs domain sender, such as lvlc.support@lovelylocsnc.com.",
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
  if (process.env.RESEND_DOMAIN_VERIFIED !== "true") {
    return {
      configured: true,
      clientReady: false,
      from,
      reason: "The sender uses a custom domain, but RESEND_DOMAIN_VERIFIED is not true. Verify the domain in Resend before enabling client confirmations.",
    };
  }
  return {
    configured: true,
    clientReady: true,
    from,
    reason: "Email sender uses a custom domain marked verified in Resend.",
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

async function sendEmail(to, subject, text, options = {}) {
  if (!emailConfigured()) {
    return { provider: "resend", skipped: true, reason: "RESEND_API_KEY and CONFIRMATION_FROM_EMAIL are not set" };
  }

  const sendFrom = async from => postJson("https://api.resend.com/emails", {
    from,
    to,
    subject,
    text,
    html: options.html || undefined,
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

function bookingEventSummary(record = {}) {
  return {
    type: record.type || "",
    status: record.status || "",
    receivedAt: record.receivedAt || record.sentAt || record.approvedAt || record.createdAt || "",
    notificationResults: Array.isArray(record.notificationResults) ? record.notificationResults : [],
    delivery: record.delivery || null,
    manualPayment: record.manualPayment || null,
  };
}

function findNotificationByProviderId(providerMessageId, records = readBookingRecords()) {
  if (!providerMessageId) return null;
  for (let index = records.length - 1; index >= 0; index -= 1) {
    const record = records[index];
    const notificationResults = Array.isArray(record.notificationResults) ? record.notificationResults : [];
    const notification = notificationResults.find(result => result?.id === providerMessageId);
    if (notification) {
      return {
        bookingId: bookingRecordId(record),
        channel: notification.channel || "",
        notification,
        record,
      };
    }
  }
  return null;
}

function verifyResendWebhook(raw, headers = {}) {
  const secret = String(process.env.RESEND_WEBHOOK_SECRET || "").trim();
  if (!secret.startsWith("whsec_")) throw new Error("Resend webhook signing secret is not configured.");
  const id = String(headers["svix-id"] || "").trim();
  const timestamp = String(headers["svix-timestamp"] || "").trim();
  const signatures = String(headers["svix-signature"] || "").trim();
  if (!id || !timestamp || !signatures) throw new Error("Resend webhook signature headers are missing.");
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > 5 * 60) {
    throw new Error("Resend webhook timestamp is outside the allowed window.");
  }
  const secretBytes = Buffer.from(secret.slice("whsec_".length), "base64");
  const expected = crypto
    .createHmac("sha256", secretBytes)
    .update(`${id}.${timestamp}.${raw}`)
    .digest();
  const valid = signatures.split(/\s+/).some(value => {
    const [version, encoded] = value.split(",", 2);
    if (version !== "v1" || !encoded) return false;
    let actual;
    try {
      actual = Buffer.from(encoded, "base64");
    } catch {
      return false;
    }
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  });
  if (!valid) throw new Error("Resend webhook signature is invalid.");
  return { id, event: JSON.parse(raw || "{}") };
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
    } else if (record.status === "released_unpaid" || record.type === "manual.deposit.released_unpaid") {
      status = "released_unpaid";
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
    ...extraHeaders,
  });
  res.end(html);
}

function notificationResultsMarkup(results = []) {
  if (!results.length) return "<p>No notification tasks were returned.</p>";
  return results.map(result => {
    const label = escapeHtml(result.channel || "notification");
    if (result.failed) {
      const fallback = result.fallback ? `<p>${escapeHtml(result.fallback)}</p>` : "";
      const draft = result.gmailDraftUrl
        ? `<p><a class="secondary" href="${escapeHtml(result.gmailDraftUrl)}" target="_blank" rel="noopener">Open email draft for client confirmation</a></p>`
        : "";
      return `<li><strong>${label}</strong><span class="failed">Failed - ${escapeHtml(result.error || "Unknown error")}</span>${fallback}${draft}</li>`;
    }
    if (result.skipped) return `<li><strong>${label}</strong><span>Skipped - ${escapeHtml(result.reason || "Provider not ready")}</span></li>`;
    const details = [
      result.provider ? `accepted by ${result.provider}` : "accepted",
      result.id ? `email id ${result.id}` : "",
      result.sid ? `sms sid ${result.sid}` : "",
      result.status ? `status ${result.status}` : "",
    ].filter(Boolean).join(" - ");
    return `<li><strong>${label}</strong><span>${escapeHtml(details)}</span></li>`;
  }).join("");
}

function ownerConfirmPageHtml({ title, intro, bookingId = "", adminUrl = "", notificationResults = [] }) {
  const results = notificationResultsMarkup(notificationResults);
  const adminHref = adminUrl || "/#admin";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} | Lovely Locs</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      body{margin:0;background:#fffaf7;color:#241916;font-family:Manrope,"Segoe UI",Arial,sans-serif;line-height:1.55}
      main{min-height:100vh;display:grid;place-items:center;padding:28px}
      section{width:min(100%,680px);background:#fff;border:1px solid rgba(75,51,44,.14);border-radius:18px;box-shadow:0 18px 44px rgba(31,23,20,.1);overflow:hidden}
      header{background:#231916;color:#fffaf7;padding:26px 28px}
      header p{color:#ead4b2;font-weight:800;margin:0 0 8px}
      h1{font-family:"Cormorant Garamond",Georgia,serif;font-size:44px;line-height:1;margin:0}
      .content{padding:28px}
      .booking{color:#7d5770;font-weight:800}
      ul{display:grid;gap:12px;list-style:none;margin:22px 0;padding:0}
      li{border:1px solid rgba(75,51,44,.14);border-radius:12px;padding:14px;background:#fffaf7}
      li strong{display:block;color:#4b332c}
      li span{display:block;color:#687a67;margin-top:4px}
      .failed{color:#8a3d3d}
      a.primary,a.secondary{display:inline-block;border-radius:10px;font-weight:800;margin:6px 8px 0 0;padding:12px 16px;text-decoration:none}
      a.primary{background:#4b332c;color:#fffaf7}
      a.secondary{border:1px solid #4b332c;color:#4b332c}
    </style>
  </head>
  <body>
    <main>
      <section>
        <header>
          <p>Lovely Locs owner confirmation</p>
          <h1>${escapeHtml(title)}</h1>
        </header>
        <div class="content">
          <p>${escapeHtml(intro)}</p>
          ${bookingId ? `<p class="booking">Booking ID: ${escapeHtml(bookingId)}</p>` : ""}
          ${notificationResults.length ? `<ul>${results}</ul>` : ""}
          <p>
            <a class="primary" href="${escapeHtml(adminHref)}">Open Owner Admin Confirmation</a>
            <a class="secondary" href="/#admin">Owner Admin</a>
          </p>
        </div>
      </section>
    </main>
  </body>
</html>`;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}

function sanitizeLogoUrl(value) {
  const url = String(value || "").trim();
  if (!url) return defaultSiteSettings.logo.url;
  if (legacyLogoUrls.has(url)) return defaultSiteSettings.logo.url;
  if (url.length > 1500000) return defaultSiteSettings.logo.url;
  if (/^https?:\/\/[^\s"'<>]+$/i.test(url)) return url;
  if (/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=]+$/i.test(url)) return url;
  return defaultSiteSettings.logo.url;
}

function sanitizeLogoSettings(logo = {}) {
  const align = ["left", "center", "right"].includes(logo.heroAlign) ? logo.heroAlign : defaultSiteSettings.logo.heroAlign;
  const fit = ["cover", "contain"].includes(logo.fit) ? logo.fit : defaultSiteSettings.logo.fit;
  return {
    url: sanitizeLogoUrl(logo.url),
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
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9/_-]/g, "")
    .slice(0, 64);
}

function phoneDigits(phone) {
  return String(phone || "").replace(/[^0-9]/g, "");
}

function clientIdentityKey(client = {}) {
  const email = String(client.email || "").trim().toLowerCase();
  return email || "";
}

function referralCodeForClient(client = {}) {
  const username = String(client.username || client.fullName || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 40);
  if (username) return `LOVELYLOCS/${username}`;

  const identity = clientIdentityKey(client);
  if (!identity) return "";
  const fallback = crypto.createHash("sha1").update(identity).digest("hex").slice(0, 8).toUpperCase();
  return `LOVELYLOCS/CLIENT${fallback}`;
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

function latestClientBookingByEmail(email, records = readBookingRecords()) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) return null;
  const bookings = latestBookingRecords(records);
  for (let index = bookings.length - 1; index >= 0; index -= 1) {
    if (String(bookings[index].client?.email || "").trim().toLowerCase() === cleanEmail) return bookings[index];
  }
  return null;
}

function latestClientProfile(client, records = readBookingRecords()) {
  const key = clientIdentityKey(client);
  if (!key) return null;
  for (let index = records.length - 1; index >= 0; index -= 1) {
    const record = records[index];
    if (record.type === "client.profile.saved" && clientIdentityKey(record.client) === key) return record;
  }
  return null;
}

function latestClientProfileByEmail(email, records = readBookingRecords()) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) return null;
  for (let index = records.length - 1; index >= 0; index -= 1) {
    const record = records[index];
    if (record.type !== "client.profile.saved") continue;
    if (String(record.client?.email || "").trim().toLowerCase() === cleanEmail) return record;
  }
  return null;
}

function completedClientBookings(client, records = readBookingRecords()) {
  const key = clientIdentityKey(client);
  if (!key) return [];
  return latestBookingRecords(records)
    .filter(booking => clientIdentityKey(booking.client) === key)
    .filter(booking => ["deposit_paid", "no_charge_test"].includes(bookingStatus(booking, records)))
    .sort((left, right) => (
      String(left.client?.date || "").localeCompare(String(right.client?.date || ""))
      || String(left.createdAt || left.id || "").localeCompare(String(right.createdAt || right.id || ""))
    ));
}

function latestClientProfileByGoogleSubject(subject, records = readBookingRecords()) {
  const cleanSubject = String(subject || "").trim();
  if (!cleanSubject) return null;
  for (let index = records.length - 1; index >= 0; index -= 1) {
    const record = records[index];
    if (record.type === "client.profile.saved" && record.googleSubject === cleanSubject) return record;
  }
  return null;
}

function findReferrerByCode(code, records = readBookingRecords()) {
  const cleanCode = normalizeReferralCode(code);
  if (!cleanCode) return null;
  const bookings = latestBookingRecords(records);
  for (let index = bookings.length - 1; index >= 0; index -= 1) {
    const booking = bookings[index];
    const storedCode = normalizeReferralCode(booking.client?.referralCode);
    const currentCode = normalizeReferralCode(referralCodeForClient(booking.client));
    if (storedCode === cleanCode || currentCode === cleanCode) return booking;
  }
  return null;
}

function latestBookingByClientKey(key, records = readBookingRecords()) {
  if (!key) return null;
  const bookings = latestBookingRecords(records);
  for (let index = bookings.length - 1; index >= 0; index -= 1) {
    if (clientIdentityKey(bookings[index].client) === key) return bookings[index];
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

function sanitizeCatalog(catalog = []) {
  if (!Array.isArray(catalog)) return [];
  const used = new Set(serviceCatalog.map(item => item.id));
  return catalog.slice(0, 100).map((item, index) => {
    const type = item?.type === "service" ? "service" : "product";
    const clean = (value, max) => String(value || "").trim().slice(0, max);
    const name = clean(item?.name, 120);
    if (!name) return null;
    const id = (clean(item.id, 100).toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")) || `custom-${type}-${index + 1}`;
    if (used.has(id)) return null;
    used.add(id);
    const validUrl = value => !value || /^https:\/\/[^\s"'<>]+$/i.test(value);
    const url = clean(item.url, 2000);
    const imageUrl = clean(item.imageUrl, 2000);
    return { id, type, name, price: clampNumber(item.price, 0, 10000, 0), description: clean(item.description, 800), duration: type === "service" ? clean(item.duration, 60) : "", category: type === "service" && ["loc-maintenance", "starter-locs", "instant-crochet", "add-ons"].includes(item.category) ? item.category : type === "service" ? "add-ons" : "", url: type === "product" && validUrl(url) ? url : "", imageUrl: type === "product" && validUrl(imageUrl) ? imageUrl : "", enabled: item.enabled !== false };
  }).filter(Boolean);
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
      catalog: sanitizeCatalog(saved.catalog || []),
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
    catalog: sanitizeCatalog(settings.catalog === undefined ? current.catalog : settings.catalog),
  };
  fs.writeFileSync(settingsFile, JSON.stringify(clean, null, 2), "utf8");
  return clean;
}

function tokenIsValid(token) {
  return automationTokenIsValid(token);
}

const ownerSessionCookieName = "lovely_locs_owner";

function ownerSessionSecret() {
  return String(process.env.MANUAL_DEPOSIT_CONFIRM_TOKEN || process.env.AUTOMATION_RUN_TOKEN || "").trim();
}

function ownerGoogleAccount(claims = {}) {
  const email = String(claims.email || "").trim().toLowerCase();
  const configured = String(process.env.OWNER_GOOGLE_EMAIL || ownerEmail || "").trim().toLowerCase();
  const localPart = email.split("@")[0].replace(/[^a-z0-9]/g, "");
  return Boolean(email && (email === configured || localPart === "lovely2locs"));
}

function ownerSessionValue(claims = {}) {
  const secret = ownerSessionSecret();
  if (!secret || !ownerGoogleAccount(claims)) return "";
  const payload = Buffer.from(JSON.stringify({
    sub: String(claims.sub || ""),
    email: String(claims.email || "").trim().toLowerCase(),
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000),
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return payload + "." + signature;
}

function ownerSessionIsValid(req) {
  const secret = ownerSessionSecret();
  if (!secret) return false;
  const cookieHeader = String(req.headers.cookie || "");
  const encoded = cookieHeader.split(";").map(part => part.trim()).find(part => part.startsWith(ownerSessionCookieName + "="));
  const value = decodeURIComponent(String(encoded || "").slice(ownerSessionCookieName.length + 1));
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number(session.exp) > Date.now() && ownerGoogleAccount(session);
  } catch {
    return false;
  }
}

function ownerRequestIsValid(req, token = "") {
  return tokenIsValid(token) || ownerSessionIsValid(req);
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

function creditAmount(record, total) {
  return Math.min(total, Math.max(0, Math.round(Number(record.amountOff || 0))));
}

function availableClientCredit(client, total, records = readBookingRecords()) {
  const key = clientIdentityKey(client);
  if (!key) return null;
  const credits = records.filter(record => (
    ["referral.reward.approved", "birthday.reward.approved", "returning_client.reward.approved"].includes(record.type)
    && record.clientKey === key
    && record.creditId
    && !creditIsUnavailable(records, record.creditId)
    && !creditIsExpired(record)
  ));
  if (!credits.length) return null;
  const referralCredits = credits
    .filter(credit => credit.type === "referral.reward.approved")
    .sort((left, right) => String(left.approvedAt || "").localeCompare(String(right.approvedAt || "")));
  if (referralCredits.length) {
    let remaining = total;
    const selected = [];
    for (const credit of referralCredits) {
      const amountOff = creditAmount(credit, remaining);
      if (!amountOff) continue;
      selected.push({ ...credit, redeemAmountOff: amountOff });
      remaining -= amountOff;
      if (remaining <= 0) break;
    }
    const amountOff = selected.reduce((sum, credit) => sum + credit.redeemAmountOff, 0);
    if (amountOff) {
      return {
        type: "referral",
        creditId: selected.length === 1 ? selected[0].creditId : `referral-stack:${crypto.createHash("sha1").update(selected.map(credit => credit.creditId).join("|")).digest("hex").slice(0, 12)}`,
        creditIds: selected.map(credit => credit.creditId),
        code: selected.length === 1 ? selected[0].discountCode || selected[0].creditId : `REF-STACK-${selected.length}`,
        amountOff,
        stackedCreditCount: selected.length,
      };
    }
  }
  const best = credits.reduce((winner, credit) => (
    Number(credit.amountOff || 0) > Number(winner.amountOff || 0) ? credit : winner
  ), credits[0]);
  const amountOff = creditAmount(best, total);
  if (!amountOff) return null;
  return {
    type: best.type === "birthday.reward.approved" ? "birthday" : best.type === "returning_client.reward.approved" ? "returning" : "referral",
    creditId: best.creditId,
    creditIds: [best.creditId],
    code: best.discountCode || best.creditId,
    amountOff,
  };
}

function qualifiesForReferredNewClientDiscount(selectedServices = []) {
  return selectedServices.some(service => (
    service
    && service.type === "service"
    && service.category !== "add-ons"
    && service.category !== "admin-test"
    && !service.autoEmergencyFee
    && Number(service.price) > 75
  ));
}

function referredNewClientDiscount(client, total, selectedServices = [], records = readBookingRecords()) {
  const code = normalizeReferralCode(client?.referredByCode);
  if (!code) return null;
  const referrer = findReferrerByCode(code, records);
  if (!referrer || sameClient(referrer.client, client)) return null;
  if (latestClientBooking(client, records)) return null;
  if (!qualifiesForReferredNewClientDiscount(selectedServices)) return null;
  const amountOff = Math.min(total, Math.max(0, Math.round(referredNewClientCreditAmount)));
  if (!amountOff) return null;
  return {
    type: "referral_new_client",
    code: `NEW-${code}`,
    amountOff,
    source: "referral_new_client_rate",
  };
}

function chooseBookingDiscount(subtotal, saleDiscount, clientCredit, referredClientDiscount) {
  const saleAmount = discountAmountForTotal(subtotal, saleDiscount);
  const creditAmount = clientCredit ? discountAmountForTotal(subtotal, clientCredit) : 0;
  const referredClientAmount = referredClientDiscount ? discountAmountForTotal(subtotal, referredClientDiscount) : 0;
  if (clientCredit && creditAmount > saleAmount) {
    return {
      code: clientCredit.code,
      type: clientCredit.type,
      percent: 0,
      amountOff: creditAmount,
      creditId: clientCredit.creditId,
      creditIds: Array.isArray(clientCredit.creditIds) ? clientCredit.creditIds : [clientCredit.creditId],
      stackedCreditCount: clientCredit.stackedCreditCount || 1,
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
  if (referredClientDiscount && referredClientAmount > 0) {
    return {
      code: referredClientDiscount.code,
      type: referredClientDiscount.type,
      percent: 0,
      amountOff: referredClientAmount,
      source: referredClientDiscount.source,
    };
  }
  return null;
}

function reserveBookingCredit(booking) {
  const credit = booking.automaticDiscountCredit;
  if (!credit?.creditId) return null;
  const records = readBookingRecords();
  const creditIds = Array.isArray(credit.creditIds) && credit.creditIds.length ? credit.creditIds : [credit.creditId];
  const availableCreditIds = creditIds.filter(creditId => creditId && !creditIsUnavailable(records, creditId));
  if (!availableCreditIds.length) return null;
  const amountPerCredit = Math.round(Number(credit.amountOff || 0) / availableCreditIds.length);
  const events = availableCreditIds.map((creditId, index) => {
    const event = {
      type: "discount.credit.reserved",
      bookingId: booking.id,
      clientKey: clientIdentityKey(booking.client),
      creditId,
      creditType: credit.type,
      amountOff: index === availableCreditIds.length - 1
        ? Math.max(0, Number(credit.amountOff || 0) - amountPerCredit * (availableCreditIds.length - 1))
        : amountPerCredit,
      reservedAt: new Date().toISOString(),
    };
    appendBookingRecord(event);
    return event;
  });
  return events.length === 1 ? events[0] : { type: "discount.credit.reserved.batch", bookingId: booking.id, creditType: credit.type, events };
}

function redeemBookingCredit(booking) {
  const credit = booking.automaticDiscountCredit;
  if (!credit?.creditId) return null;
  const records = readBookingRecords();
  const creditIds = Array.isArray(credit.creditIds) && credit.creditIds.length ? credit.creditIds : [credit.creditId];
  const unredeemedCreditIds = creditIds.filter(creditId => (
    creditId && !records.some(record => record.type === "discount.credit.redeemed" && record.creditId === creditId)
  ));
  if (!unredeemedCreditIds.length) return null;
  const amountPerCredit = Math.round(Number(credit.amountOff || 0) / unredeemedCreditIds.length);
  const events = unredeemedCreditIds.map((creditId, index) => {
    const event = {
      type: "discount.credit.redeemed",
      bookingId: booking.id,
      clientKey: clientIdentityKey(booking.client),
      creditId,
      creditType: credit.type,
      amountOff: index === unredeemedCreditIds.length - 1
        ? Math.max(0, Number(credit.amountOff || 0) - amountPerCredit * (unredeemedCreditIds.length - 1))
        : amountPerCredit,
      redeemedAt: new Date().toISOString(),
    };
    appendBookingRecord(event);
    return event;
  });
  return events.length === 1 ? events[0] : { type: "discount.credit.redeemed.batch", bookingId: booking.id, creditType: credit.type, events };
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

async function notifyReferralRewardApproved(reward, referredBooking) {
  if (!reward?.creditId || !reward.clientKey || !referredBooking?.id) return null;
  const records = readBookingRecords();
  if (records.some(record => record.type === "referral.reward.notification.sent" && record.creditId === reward.creditId)) return null;
  const referrer = latestBookingByClientKey(reward.clientKey, records);
  const email = String(referrer?.client?.email || "").trim();
  if (!email) return null;
  const siteUrl = (process.env.PUBLIC_SITE_URL || `http://127.0.0.1:${port}`).replace(/\/+$/, "");
  const text = [
    `Hi ${clientFirstName(referrer)},`,
    "",
    `${referredBooking.client?.fullName || "Your referral"} booked with your Lovely Locs referral code.`,
    `Your $${reward.amountOff || referralCreditAmount} referral reward is now available for your next service.`,
    `Referral code used: ${reward.referralCode}`,
    `Credit code: ${reward.discountCode}`,
    "",
    `You can check pending and approved referral rewards here: ${siteUrl}/#client-settings`,
    "",
    "Referral credits can stack when you have more than one available reward.",
  ].join("\n");
  const notificationResults = await runNotificationTasks([
    ["referrerEmail", () => sendEmail(email, "Your Lovely Locs referral reward is ready", text)],
  ]);
  const event = {
    type: "referral.reward.notification.sent",
    bookingId: referredBooking.id,
    referralCode: reward.referralCode,
    creditId: reward.creditId,
    recipientEmail: email,
    sentAt: new Date().toISOString(),
    notificationResults,
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
  const records = readBookingRecords();
  for (const booking of latestBookingRecords(records)) {
    const status = bookingStatus(booking, records);
    if (booking.client?.date !== date || !booking.client?.time) continue;
    if (["pending_manual_payment", "pending_payment", "deposit_paid", "no_charge_test"].includes(status)) {
      booked.add(booking.client.time);
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

function appointmentTimesForDate(date) {
  return scheduledWorkDates.has(date) ? scheduledWorkAppointmentTimes : regularAppointmentTimes;
}

function regularHoursLabelForDate(date) {
  return scheduledWorkDates.has(date) ? "7:00 PM - 10:30 PM" : "11:00 AM - 3:00 PM or 4:00 PM - 7:00 PM";
}

function appointmentDateTime(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || "")) || !/^\d{2}:\d{2}$/.test(String(time || ""))) return null;
  const parsed = new Date(`${date}T${time}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function appointmentBookable(date, time, now = new Date()) {
  const appointment = appointmentDateTime(date, time);
  return Boolean(appointment && appointment.getTime() - now.getTime() >= minimumBookingLeadMs);
}
function classifyAppointmentTime(date, time) {
  const weekday = dayOfWeek(date);
  const holiday = isHoliday(date);
  const isSunday = weekday === 0;
  const regular = !holiday && !isSunday && appointmentTimesForDate(date).includes(time);
  return {
    type: regular ? "standard" : "emergency",
    emergency: !regular,
    reason: regular ? "Within regular Lovely Locs appointment hours." : holiday ? "Holiday/key date appointment proposal." : isSunday ? "Sunday appointment proposal." : "Outside regular Lovely Locs appointment hours.",
  };
}

function availabilityForDate(date) {
  const booked = bookedTimesForDate(date);
  const holiday = isHoliday(date);
  const isSunday = dayOfWeek(date) === 0;
  const scheduledWorkDate = scheduledWorkDates.has(date);
  const appointmentTimes = appointmentTimesForDate(date);
  const forcedOpenTimes = forcedOpenAppointmentTimes.get(date) || new Set();
  const holidayTimes = holidayAppointmentTimesByDate.get(date) || [];
  const holidayBookedTimes = holidayBookedAppointmentTimes.get(date) || new Set();
  const holidaySlots = holiday ? holidayTimes.map(time => {
    const isBooked = holidayBookedTimes.has(time) || booked.has(time);
    const tooSoon = !appointmentBookable(date, time);
    return {
      time,
      label: timeLabel(time),
      type: "emergency",
      status: tooSoon ? "unavailable" : isBooked ? "booked" : "open",
      note: tooSoon ? "Appointments must be booked at least 24 hours ahead." : isBooked ? "Holiday appointment time is closed. Emergency fee applies to approved holiday bookings." : "Holiday appointment includes the $45 emergency fee.",
    };
  }) : [];
  const regularSlots = holiday || isSunday ? [] : appointmentTimes.map(time => {
    const tooSoon = !appointmentBookable(date, time);
    return {
      time,
      label: timeLabel(time),
      type: "standard",
      status: tooSoon ? "unavailable" : booked.has(time) && !forcedOpenTimes.has(time) ? "booked" : "open",
      note: tooSoon ? "Appointments must be booked at least 24 hours ahead." : scheduledWorkDate ? "Scheduled workday opening from 7:00 PM - 10:30 PM." : "Open appointment time.",
    };
  });
  const emergencySlots = [];
  return {
    date,
    holiday,
    regularHours: holiday || isSunday ? "Emergency proposals only" : regularHoursLabelForDate(date),
    slots: [...holidaySlots, ...regularSlots, ...emergencySlots],
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
      id: "cash-app",
      label: "Cash App",
      handle: process.env.CASH_APP_LINK || "https://cash.app/$TimasLovelyLocs",
      note: "Send the deposit through Cash App and include your booking ID in the note.",
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
    handle: publicPaymentHandle(option),
  }));
}

function publicPaymentHandle(option) {
  const handle = option.handle || "";
  if (handle && !/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(handle)) return handle;
  if (handle && handle.toLowerCase().includes("lvlc.support@lovelylocsnc.com")) return handle;
  return option.id === "apple-pay"
    ? "Confirm current Apple Pay contact with Lovely Locs before sending."
    : "Confirm current payment tag with Lovely Locs before sending.";
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
  const url = new URL("/", publicSiteUrl(req));
  url.searchParams.set("booking", booking.id);
  url.searchParams.set("method", method);
  url.searchParams.set("token", token);
  url.hash = "admin-confirm-deposit";
  return url.toString();
}

function sanitizeClient(client = {}) {
  const date = String(client.date || "").trim();
  const time = String(client.time || "").trim();
  const birthday = String(client.birthday || "").trim();
  const locJourneyLength = String(client.locJourneyLength || "").trim();
  const slot = date && time ? classifyAppointmentTime(date, time) : { type: "standard", emergency: false, reason: "" };
  return {
    fullName: String(client.fullName || "").trim(),
    email: String(client.email || "").trim(),
    phone: String(client.phone || "").trim(),
    date,
    time,
    birthday: /^\d{4}-\d{2}-\d{2}$/.test(birthday) || /^\d{2}-\d{2}$/.test(birthday) ? birthday : "",
    locJourneyLength: allowedLocJourneyLengths.has(locJourneyLength) ? locJourneyLength : "",
    onboardingCompleted: Boolean(client.onboardingCompleted),
    appointmentType: slot.type,
    emergencySlot: slot.emergency,
    emergencyReason: slot.reason,
    preferredContact: "email",
    smsOptIn: false,
    marketingEmailOptIn: Boolean(client.marketingEmailOptIn),
    referralOptIn: Boolean(client.referralOptIn),
    referralCode: referralCodeForClient(client) || normalizeReferralCode(client.referralCode),
    referredByCode: normalizeReferralCode(client.referredByCode),
    specialRequests: String(client.specialRequests || "").trim(),
  };
}

function sanitizeFriendTest(test = {}) {
  const cleanTest = test && typeof test === "object" ? test : {};
  const code = String(cleanTest.code || "").trim().toUpperCase();
  if (!/^LL-FRIEND-(0[1-9]|10)$/.test(code)) return null;
  const slot = Number(code.split("-").pop());
  const visited = [...new Set(Array.isArray(cleanTest.visited) ? cleanTest.visited : [])]
    .filter(checkpoint => friendTestCheckpoints.includes(checkpoint));
  const missing = friendTestCheckpoints.filter(checkpoint => !visited.includes(checkpoint));
  const startedAt = String(cleanTest.startedAt || "").trim();
  return {
    code,
    campaign: friendTestCampaign,
    slot,
    automatic: false,
    startedAt: Number.isFinite(Date.parse(startedAt)) ? new Date(startedAt).toISOString() : "",
    visited,
    completedCheckpoints: visited.length,
    totalCheckpoints: friendTestCheckpoints.length,
    percentComplete: Math.round((visited.length / friendTestCheckpoints.length) * 100),
    complete: missing.length === 0,
    missing,
    bookingSubmitted: Boolean(cleanTest.bookingSubmitted),
  };
}

function nextAutomaticFriendTest() {
  const usedSlots = new Set(
    latestBookingRecords(readBookingRecords())
      .filter(booking => booking.friendTest?.campaign === friendTestCampaign)
      .map(booking => Number(booking.friendTest?.slot || 0))
      .filter(slot => slot >= 1 && slot <= friendTestCampaignLimit)
  );
  let slot = 1;
  while (usedSlots.has(slot) && slot <= friendTestCampaignLimit) slot += 1;
  if (slot > friendTestCampaignLimit) return null;
  return {
    code: `LL-FRIEND-${String(slot).padStart(2, "0")}`,
    campaign: friendTestCampaign,
    slot,
    automatic: true,
    startedAt: new Date().toISOString(),
    visited: [],
    completedCheckpoints: 0,
    totalCheckpoints: friendTestCheckpoints.length,
    percentComplete: 0,
    complete: false,
    missing: [...friendTestCheckpoints],
    bookingSubmitted: true,
  };
}

function isMainAppointmentService(item = {}) {
  return item.type === "service" && (item.standaloneAppointment || item.category !== "add-ons") && item.category !== "admin-test";
}

function cleanSprinklePreference(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 120);
}

function normalizeSprinklePreferences(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const preferences = (Array.isArray(source.preferences) ? source.preferences : [source.preferenceOne, source.preferenceTwo])
    .map(cleanSprinklePreference)
    .filter(Boolean);
  const notes = cleanSprinklePreference(source.notes || "").slice(0, 220);
  const requestedSource = String(source.jewelrySource || "").trim();
  const jewelrySource = Object.prototype.hasOwnProperty.call(sprinkleJewelrySourceLabels, requestedSource)
    ? requestedSource
    : (source.customJewelryOrder ? "custom" : "");
  return { preferences, notes, jewelrySource, customJewelryOrder: Boolean(source.customJewelryOrder || jewelrySource === "custom") };
}

function validatedSprinklePreferences(input = {}, serviceName = "Loc Sprinkles") {
  const details = normalizeSprinklePreferences(input);
  if (!details.jewelrySource) throw new Error(`Choose BYOJ, on-hand beads, or custom colors/styles for ${serviceName}.`);
  if (details.customJewelryOrder && !details.preferences.length) throw new Error(`Custom colors or styles require at least one color or preference for ${serviceName}.`);
  if (details.preferences.length > 2) throw new Error(`The base price for ${serviceName} includes up to two color or preference choices.`);
  return details;
}

function sprinklePreferencesSummary(item = {}) {
  const details = normalizeSprinklePreferences(item.sprinklePreferences || {});
  const parts = [];
  if (details.jewelrySource) parts.push(`Jewels: ${sprinkleJewelrySourceLabels[details.jewelrySource]}`);
  if (details.preferences.length) parts.push(`Preferences: ${details.preferences.slice(0, 2).join(", ")}`);
  if (details.customJewelryOrder) parts.push(`Custom colors/styles: +$${sprinkleCustomJewelryFee} starting price`);
  if (details.notes) parts.push(`Notes: ${details.notes}`);
  return parts.join("; ");
}

function addOnCompatibilityIssue(addOn = {}, cart = []) {
  if (!addOn.requiresMainService) return "";
  const compatibleCategories = Array.isArray(addOn.compatibleMainCategories) ? addOn.compatibleMainCategories : [];
  const compatibleMainServices = cart.filter(item => isMainAppointmentService(item) && compatibleCategories.includes(item.category));
  if (!compatibleMainServices.length) {
    return `${addOn.name} must be attached to an eligible maintenance service.`;
  }
  const includedBy = compatibleMainServices.find(service => Array.isArray(service.includedAddOnIds) && service.includedAddOnIds.includes(addOn.id));
  if (includedBy) return `${addOn.name} is already included in ${includedBy.name}.`;
  return "";
}

function cartAddOnCompatibilityIssue(cart = []) {
  return cart.map(item => addOnCompatibilityIssue(item, cart)).find(Boolean) || "";
}

function shampooDeclineAcknowledged(cart = []) {
  return cart.some(item => item.shampooDeclineAcknowledgement);
}

function requiresShampooDeclineAcknowledgement(cart = []) {
  return !isAdminTestBooking(cart) && cart.some(isMainAppointmentService) && !cart.some(item => item.id === "shampoo-service") && !shampooDeclineAcknowledged(cart);
}

function pricedCartItem(item = {}) {
  const exactService = [...serviceCatalog, ...readSiteSettings().catalog.filter(entry => entry.type === "service" && entry.enabled)].find(service => service.id === item.id);
  if (exactService) {
    if (exactService.category === "starter-locs") throw new Error(`Parting preference is required for ${exactService.name}.`);
    if (exactService.category === "loc-maintenance" && !allowedBaseProducts.has(item.baseProduct)) {
      throw new Error(`Base product preference is required for ${exactService.name}.`);
    }
    const sprinklePreferences = exactService.requiresSprinklePreferences
      ? validatedSprinklePreferences(item.sprinklePreferences, exactService.name)
      : undefined;
    const sprinkleCustomFee = sprinklePreferences?.customJewelryOrder ? sprinkleCustomJewelryFee : 0;
    return {
      ...exactService,
      type: "service",
      price: exactService.price + sprinkleCustomFee,
      baseProduct: allowedBaseProducts.has(item.baseProduct) ? item.baseProduct : undefined,
      ...(item.shampooDeclined ? { shampooDeclined: true } : {}),
      ...(item.shampooDeclineAcknowledgement ? { shampooDeclineAcknowledgement: true } : {}),
      ...(sprinklePreferences ? { sprinklePreferences } : {}),
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
  const required = ["fullName", "email", "date", "time"];
  const missing = required.filter(field => !client[field]);
  if (missing.length) throw new Error(`Missing required booking fields: ${missing.join(", ")}.`);
  if (!appointmentBookable(client.date, client.time)) throw new Error("Appointment must be a future time at least 24 hours away.");
  const slot = availabilityForDate(client.date).slots.find(item => item.time === client.time);
  if (!slot) throw new Error("Selected appointment time is not available.");
  if (slot.status === "booked") throw new Error("That appointment time was just booked. Please choose another time.");
  if (!Array.isArray(booking.cart) || booking.cart.length === 0) throw new Error("Booking must include at least one cart item.");
  if (!booking.policyAcknowledgement) throw new Error("Policy acknowledgement is required.");

  const cart = booking.cart.map(pricedCartItem);
  if (requiresShampooDeclineAcknowledgement(cart) && !booking.shampooDeclineAcknowledgement) throw new Error("Shampoo preparation acknowledgement is required.");
  if (client.emergencySlot && !cart.some(item => item.id === "emergency-fee")) {
    const emergencyFee = serviceCatalog.find(service => service.id === "emergency-fee");
    if (emergencyFee) cart.push({ ...emergencyFee, type: "service", autoEmergencyFee: true });
  }
  const selectedServices = cart.filter(item => item.type === "service");
  const addOns = cart.filter(item => item.type !== "service");
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const saleDiscount = activeDiscountForCode(booking.discountCode);
  const clientCredit = availableClientCredit(client, subtotal);
  const referredClientDiscount = referredNewClientDiscount(client, subtotal, selectedServices);
  const discount = isAdminTestBooking(cart) ? null : chooseBookingDiscount(subtotal, saleDiscount, clientCredit, referredClientDiscount);
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
      creditIds: Array.isArray(discount.creditIds) ? discount.creditIds : [discount.creditId],
      code: discount.code,
      amountOff: discount.amountOff,
      stackedCreditCount: discount.stackedCreditCount || 1,
    } : null,
    total,
    deposit,
    policyAcknowledgement: true,
    shampooDeclineAcknowledgement: requiresShampooDeclineAcknowledgement(cart) || shampooDeclineAcknowledged(cart),
    friendTest: sanitizeFriendTest(booking.friendTest),
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
  const clientText = `Lovely Locs: your appointment is confirmed for ${booking.client.date} at ${timeLabel(booking.client.time)}. Your $${booking.deposit} deposit has been received. Reply STOP to opt out or HELP for help.`;
  const ownerText = `Stripe deposit paid for ${booking.client.fullName}: $${booking.deposit}. Preferred date: ${booking.client.date}. Total estimate: $${booking.total}.`;
  const clientEmail = confirmationEmail(booking);
  const ownerHtml = ownerBookingEmail(booking, {
    title: "Deposit confirmed",
    intro: "Stripe marked this deposit paid. The client confirmation email has been queued through the connected email provider.",
  });
  const results = [];

  for (const task of [
    ["clientEmail", () => sendEmail(booking.client.email, "Your Lovely Locs appointment is confirmed", clientEmail.text, { html: clientEmail.html })],
    ["ownerEmail", () => sendEmail(ownerEmail, `Lovely Locs deposit paid: ${booking.client.fullName}`, `${ownerText}\n\n${details}`, { html: ownerHtml })],
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
  const payUrl = bookingPaymentOptionsUrl(booking);
  const clientEmail = depositRequestEmail(booking, payUrl);
  const ownerText = [
    `Manual deposit pending for ${booking.client.fullName}: $${booking.deposit}.`,
    `Preferred date/time: ${booking.client.date} at ${timeLabel(booking.client.time)}. Total estimate: $${booking.total}.`,
    booking.client.emergencySlot ? `Emergency proposal: ${booking.client.emergencyReason} The $45 emergency fee is included.` : "Standard evening appointment slot selected.",
    "",
    "Payment options shown to the client:",
    paymentOptionsText(booking),
    "",
    "After you see the matching Venmo, Cash App, or Apple Pay receipt, approve the deposit here:",
    confirmLink || "Set MANUAL_DEPOSIT_CONFIRM_TOKEN in Render to enable one-click approval links.",
    "",
    details,
  ].join("\n");
  const ownerHtml = ownerBookingEmail(booking, {
    title: "A deposit is waiting for your eyes",
    intro: "A client chose manual payment. Once you see the matching Venmo, Cash App, or Apple Pay receipt, use the approve button to send their confirmation.",
    ctaUrl: confirmLink,
    ctaLabel: "Confirm Deposit",
  });
  const results = [];

  for (const task of [
    ["clientEmail", () => sendEmail(booking.client.email, "Your Lovely Locs deposit step is ready", clientEmail.text, { html: clientEmail.html })],
    ["ownerEmail", () => sendEmail(ownerEmail, `Lovely Locs deposit awaiting receipt: ${booking.client.fullName}`, ownerText, { html: ownerHtml })],
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
  const clientText = `Lovely Locs: your appointment is confirmed for ${booking.client.date} at ${timeLabel(booking.client.time)}. Your $${booking.deposit} deposit has been received. Reply STOP to opt out or HELP for help.`;
  const ownerText = `Manual deposit confirmed for ${booking.client.fullName}: $${booking.deposit}. Method: ${method}. Preferred date/time: ${booking.client.date} at ${timeLabel(booking.client.time)}.`;
  const clientEmail = confirmationEmail(booking);
  const ownerHtml = ownerBookingEmail(booking, {
    title: "Deposit confirmed",
    intro: `The ${method} deposit has been marked paid. The client confirmation email has been queued through the connected email provider.`,
  });
  const results = [];

  for (const task of [
    ["clientEmail", () => sendEmail(booking.client.email, "Your Lovely Locs appointment is confirmed", clientEmail.text, { html: clientEmail.html })],
    ["ownerEmail", () => sendEmail(ownerEmail, `Lovely Locs manual deposit confirmed: ${booking.client.fullName}`, `${ownerText}\n\n${details}`, { html: ownerHtml })],
    booking.client.smsOptIn ? ["clientSms", () => sendSms(normalizePhone(booking.client.phone), clientText)] : null,
    ["ownerSms", () => sendSms(normalizePhone(ownerPhone), ownerText)],
  ].filter(Boolean)) {
    try {
      results.push({ channel: task[0], ...(await task[1]()) });
    } catch (error) {
      results.push({ channel: task[0], failed: true, error: error.message });
    }
  }

  const clientEmailResult = results.find(result => result.channel === "clientEmail");
  if (clientEmailResult?.failed) {
    clientEmailResult.gmailDraftUrl = gmailComposeUrl(
      booking.client.email,
      "Your Lovely Locs appointment is confirmed",
      clientEmail.text
    );
    clientEmailResult.fallback = "Client email was blocked by the provider. Open the email draft link to send the confirmation from the owner email.";
  }

  return results;
}

async function notifyManualDepositReleased(booking, reason) {
  const clientEmail = depositReleasedEmail(booking, reason);
  const results = await runNotificationTasks([
    ["clientEmail", () => sendEmail(booking.client.email, "Your Lovely Locs appointment request was released", clientEmail.text, { html: clientEmail.html })],
  ]);
  const clientEmailResult = results.find(result => result.channel === "clientEmail");
  if (clientEmailResult?.failed) {
    clientEmailResult.gmailDraftUrl = gmailComposeUrl(
      booking.client.email,
      "Your Lovely Locs appointment request was released",
      clientEmail.text
    );
    clientEmailResult.fallback = "Client release email was blocked by the provider. Open the email draft link to send the release message from the owner email.";
  }
  return results;
}

async function notifyNoChargeTestBooking(booking) {
  const details = bookingText(booking);
  const clientText = `Lovely Locs: your test booking was received for ${booking.client.date}. This was a no-charge admin test, so no deposit was requested. Reply STOP to opt out or HELP for help.`;
  const ownerText = `No-charge admin test booking submitted for ${booking.client.fullName}. Preferred date: ${booking.client.date}.`;
  const clientEmail = confirmationEmail(booking, { test: true });
  const ownerHtml = ownerBookingEmail(booking, {
    title: "Test booking came through",
    intro: "This no-charge test booking confirms the form and notification path are connected.",
  });
  const results = [];

  for (const task of [
    ["clientEmail", () => sendEmail(booking.client.email, "Lovely Locs test booking received", clientEmail.text, { html: clientEmail.html })],
    ["ownerEmail", () => sendEmail(ownerEmail, `Lovely Locs test booking: ${booking.client.fullName}`, `${ownerText}\n\n${details}`, { html: ownerHtml })],
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
    "Reply if you need help matching your Venmo, Cash App, or Apple Pay receipt.",
  ].join("\n");
  const sms = `Lovely Locs reminder: your $${booking.deposit} deposit is still needed to confirm ${booking.client.date} at ${timeLabel(booking.client.time)}. Pay options: ${payUrl}. Reply STOP to opt out or HELP for help.`;
  return sendClientAutomation(booking, "deposit_reminder", cycleKey, "Lovely Locs deposit reminder", text, sms);
}

async function runAppointmentReminderAutomation(booking, records, now) {
  const status = bookingStatus(booking, records);
  if (!["deposit_paid", "no_charge_test"].includes(status)) return [];
  const daysOut = daysUntilDate(booking.client?.date, now);
  const windows = [
    { days: 2, type: "appointment_reminder_2_day", label: "2-day" },
    { days: 1, type: "appointment_reminder_1_day", label: "1-day" },
  ];
  const sent = [];
  for (const window of windows) {
    if (daysOut !== window.days) continue;
    const text = [
      `Hi ${clientFirstName(booking)}, your Lovely Locs appointment is coming up ${booking.client.date} at ${timeLabel(booking.client.time)}.`,
      "Please arrive with your hair ready for the service you selected unless Lovely Locs has told you otherwise.",
      "",
      "Hey, and here’s the location details.",
      "",
      "📍 Address: 4018 McIntosh Street, Unit K",
      "Greensboro, NC 27407",
      "",
      "🚗 Parking: Please park in the visitor spots or along the side of the parking lot.",
      "",
      "📲 Upon Arrival: Just text me or knock and I’ll meet you at the door!",
      "",
      window.days === 1 ? "See ya tomorrow!!" : "See ya in 2 days!!",
      "Reply if you need to update your appointment details.",
    ].join("\n");
    const sms = `Lovely Locs reminder: your appointment is ${booking.client.date} at ${timeLabel(booking.client.time)}. Address: 4018 McIntosh Street, Unit K, Greensboro, NC 27407. Park in visitor spots or along the side of the parking lot. Upon arrival, text me or knock and I’ll meet you at the door. Reply STOP to opt out or HELP for help.`;
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
  return sendClientAutomation(booking, "review_request", booking.id, "How was your Lovely Locs appointment?", text, text, { emailOnly: true });
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
  if (!booking.client?.birthday) return null;
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

async function runReturningClientCreditAutomation(booking, records, now) {
  const status = bookingStatus(booking, records);
  if (!["deposit_paid", "no_charge_test"].includes(status)) return null;
  if (daysUntilDate(booking.client?.date, now) !== -1) return null;
  const key = clientIdentityKey(booking.client);
  if (!key) return null;
  if (!returningClientCreditAmount) return null;
  if (records.some(record => record.type === "returning_client.reward.approved" && record.clientKey === key)) return null;
  const completedVisits = completedClientBookings(booking.client, records);
  if (!completedVisits.length || completedVisits[0].id !== booking.id) return null;
  const referralUsername = String(referralCodeForClient(booking.client)).split("/").pop() || "CLIENT";
  const discountCode = `RETURN5-${referralUsername}`.slice(0, 24);
  appendBookingRecord({
    type: "returning_client.reward.approved",
    clientKey: key,
    creditId: `returning:first:${key}`,
    discountCode,
    amountOff: returningClientCreditAmount,
    approvedAt: new Date().toISOString(),
    sourceBookingId: booking.id,
  });
  const siteUrl = (process.env.PUBLIC_SITE_URL || "https://lovely-locs-booking.onrender.com").replace(/\/+$/, "");
  const text = [
    `Hi ${clientFirstName(booking)},`,
    "",
    `Returning Client Credit: Get ${returningClientCreditAmount} off your next completed service after your first visit. No review required.`,
    `Open your Review & Rebook Hub: ${siteUrl}/#client-settings`,
    `Book again: ${siteUrl}/#services`,
  ].join("\n");
  return sendClientAutomation(booking, "returning_client_credit", "first_visit", "Your Lovely Locs returning client credit", text, text, { emailOnly: true });
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
  const dailyTypes = new Set(["all", "daily", "deposit", "appointment", "review", "referral", "birthday", "returning"]);

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
      if (type === "all" || type === "daily" || type === "returning") {
        const result = await runReturningClientCreditAutomation(booking, records, now);
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
    const containsAdminTestService = Array.isArray(booking.cart)
      && booking.cart.some(item => item?.id === "admin-test-booking");
    if (containsAdminTestService && !isAdminTestBooking(booking.cart)) {
      sendJson(res, 400, { ok: false, error: "The admin test service cannot be combined with other items." });
      return;
    }
    if (containsAdminTestService && !tokenIsValid(booking.adminToken || "")) {
      sendJson(res, 403, { ok: false, error: "The owner admin token is missing or invalid." });
      return;
    }
    const pricedBooking = priceBooking(booking);
    const id = `LL-${Date.now()}`;
    const friendTest = pricedBooking.deposit === 0
      ? pricedBooking.friendTest
      : pricedBooking.friendTest || nextAutomaticFriendTest();
    const referralCode = normalizeReferralCode(pricedBooking.client.referralCode || referralCodeForClient(pricedBooking.client));
    const referralShareUrl = `${publicSiteUrl(req)}/?ref=${encodeURIComponent(referralCode)}#services`;
    const pendingBooking = {
      id,
      receivedAt: new Date().toISOString(),
      status: pricedBooking.deposit === 0 ? "no_charge_test" : "pending_payment",
      ...pricedBooking,
      friendTest,
      client: { ...pricedBooking.client, referralCode },
      referralShareUrl,
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
        referralCode,
        referralShareUrl,
        friendTest: pendingBooking.friendTest,
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
      referralCode,
      referralShareUrl,
      friendTest: savedBooking.friendTest,
      message: "Appointment request saved, but it is not finalized yet. Pay options are ready; Lovely Locs will send the official confirmation once the deposit is confirmed as received.",
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
    const bookingId = url.searchParams.get("booking") || "";
    const method = url.searchParams.get("method") || "manual";
    const adminUrl = `${siteUrl}/?booking=${encodeURIComponent(bookingId)}&method=${encodeURIComponent(method)}#admin-confirm-deposit`;
    wantsJson = url.searchParams.get("format") === "json";
    if (!ownerRequestIsValid(req, token)) {
      if (wantsJson) {
        sendJson(res, 403, { ok: false, error: "The owner confirmation token is missing or invalid." });
        return;
      }
      sendHtml(res, 403, ownerConfirmPageHtml({
        title: "Token needed before confirming",
        intro: "This confirmation link is missing a valid owner token. Open the owner admin form, enter the booking ID and your manual deposit token, then confirm the deposit from there.",
        bookingId,
        adminUrl,
      }));
      return;
    }

    const booking = findBookingById(bookingId);
    if (!booking) {
      if (wantsJson) {
        sendJson(res, 404, { ok: false, error: "No matching Lovely Locs booking was found for this confirmation link." });
        return;
      }
      sendHtml(res, 404, ownerConfirmPageHtml({
        title: "Booking not found",
        intro: "No matching Lovely Locs booking was found for this confirmation link. Open the owner confirmation email link again so the booking ID is captured automatically, or double-check the booking ID from the pay-options page or payment note.",
        bookingId,
        adminUrl,
      }));
      return;
    }

    const existingConfirmation = readBookingRecords()
      .reverse()
      .find(record => bookingRecordId(record) === bookingId && record.type === "manual.deposit.confirmed");
    if (existingConfirmation) {
      const notificationResults = Array.isArray(existingConfirmation.notificationResults)
        ? existingConfirmation.notificationResults
        : [];
      if (wantsJson) {
        sendJson(res, 200, { ok: true, bookingId, alreadyConfirmed: true, notificationResults });
        return;
      }
      sendHtml(res, 200, ownerConfirmPageHtml({
        title: "Deposit already confirmed",
        intro: "This booking was already marked paid. No duplicate confirmation messages were sent.",
        bookingId,
        adminUrl,
        notificationResults,
      }));
      return;
    }

    const allowedMethods = new Set(["venmo", "cash-app", "apple-pay", "cash", "other"]);
    if (!allowedMethods.has(method)) {
      sendJson(res, 400, { ok: false, error: "Choose how the payment was received before confirming the deposit." });
      return;
    }
    const notificationResults = await notifyManualDepositPaid(booking, method);
    const referralReward = approveReferralReward(booking);
    const referralRewardNotification = referralReward
      ? await notifyReferralRewardApproved(referralReward, booking)
      : null;
    const redeemedCredit = redeemBookingCredit(booking);
    appendBookingRecord({
      type: "manual.deposit.confirmed",
      bookingId,
      receivedAt: new Date().toISOString(),
      status: "deposit_paid",
      manualPayment: { method },
      notificationResults,
      referralReward,
      referralRewardNotification,
      redeemedCredit,
    });

    if (wantsJson) {
      sendJson(res, 200, { ok: true, bookingId, alreadyConfirmed: false, notificationResults, referralReward, referralRewardNotification, redeemedCredit });
      return;
    }
    sendHtml(res, 200, ownerConfirmPageHtml({
      title: "Deposit confirmed",
      intro: "Lovely Locs marked this deposit paid. Review the provider results below; if the client email was blocked, use the email draft link shown here.",
      bookingId,
      adminUrl,
      notificationResults,
    }));
  } catch (error) {
    if (wantsJson) {
      sendJson(res, 400, { ok: false, error: error.message });
      return;
    }
    sendHtml(res, 400, ownerConfirmPageHtml({
      title: "Confirmation failed",
      intro: error.message,
    }));
  }
}

async function handleManualPaymentRelease(req, res) {
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw || "{}");
    if (!ownerRequestIsValid(req, body.token || "")) {
      sendJson(res, 403, { ok: false, error: "The owner token is missing or invalid." });
      return;
    }
    const bookingId = String(body.booking || body.bookingId || "").trim();
    const reason = String(body.reason || "Deposit was not received before the hold release window.").trim();
    const booking = findBookingById(bookingId);
    if (!booking) {
      sendJson(res, 404, { ok: false, error: "No matching Lovely Locs booking was found." });
      return;
    }
    const records = readBookingRecords();
    const status = bookingStatus(booking, records);
    if (!["pending_manual_payment", "pending_payment"].includes(status)) {
      sendJson(res, 409, { ok: false, error: `This booking is ${status || "not pending"} and cannot be released as unpaid.` });
      return;
    }
    const existingRelease = records
      .reverse()
      .find(record => bookingRecordId(record) === bookingId && record.type === "manual.deposit.released_unpaid");
    if (existingRelease) {
      const notificationResults = Array.isArray(existingRelease.notificationResults)
        ? existingRelease.notificationResults
        : [];
      sendJson(res, 200, {
        ok: true,
        bookingId,
        alreadyReleased: true,
        status: "released_unpaid",
        appointment: {
          date: booking.client?.date || "",
          time: booking.client?.time || "",
        },
        notificationResults,
      });
      return;
    }
    const notificationResults = await notifyManualDepositReleased(booking, reason);
    appendBookingRecord({
      type: "manual.deposit.released_unpaid",
      bookingId,
      receivedAt: new Date().toISOString(),
      status: "released_unpaid",
      reason,
      releasedBy: "owner",
      notificationResults,
    });
    sendJson(res, 200, {
      ok: true,
      bookingId,
      alreadyReleased: false,
      status: "released_unpaid",
      appointment: {
        date: booking.client?.date || "",
        time: booking.client?.time || "",
      },
      notificationResults,
      message: "Unpaid hold released. The appointment time can be booked again.",
    });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
  }
}

function handleAdminBookingLookup(req, res) {
  try {
    const url = new URL(req.url || "/", publicSiteUrl(req));
    const token = url.searchParams.get("token") || "";
    const bookingId = String(url.searchParams.get("booking") || "").trim();
    if (!ownerRequestIsValid(req, token)) {
      sendJson(res, 403, { ok: false, error: "The owner token is missing or invalid." });
      return;
    }
    const booking = findBookingById(bookingId);
    if (!booking) {
      sendJson(res, 404, { ok: false, error: "No matching Lovely Locs booking was found." });
      return;
    }
    const records = readBookingRecords();
    const events = records
      .filter(record => bookingRecordId(record) === bookingId && record !== booking)
      .map(bookingEventSummary);
    sendJson(res, 200, {
      ok: true,
      booking: {
        id: booking.id,
        status: bookingStatus(booking, records),
        receivedAt: booking.receivedAt || "",
        client: {
          fullName: booking.client?.fullName || "",
          email: booking.client?.email || "",
          phone: booking.client?.phone || "",
        },
        appointment: {
          date: booking.client?.date || "",
          time: booking.client?.time || "",
        },
        services: (booking.cart || []).map(item => ({
          name: item.name || item.title || "Service",
          type: item.type || "service",
          price: Number(item.price || 0),
          duration: item.duration || "",
        })),
        total: Number(booking.total || 0),
        deposit: Number(booking.deposit || 0),
        friendTest: booking.friendTest || null,
      },
      initialNotificationResults: Array.isArray(booking.notificationResults) ? booking.notificationResults : [],
      events,
    });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
  }
}

function handleAdminRecentBookings(req, res) {
  try {
    const url = new URL(req.url || "/", publicSiteUrl(req));
    const token = url.searchParams.get("token") || "";
    if (!ownerRequestIsValid(req, token)) {
      sendJson(res, 403, { ok: false, error: "The owner token is missing or invalid." });
      return;
    }
    const requestedLimit = Number(url.searchParams.get("limit") || 20);
    const limit = Math.min(Math.max(Number.isFinite(requestedLimit) ? requestedLimit : 20, 1), 100);
    const records = readBookingRecords();
    const bookings = latestBookingRecords(records)
      .sort((left, right) => String(right.receivedAt || "").localeCompare(String(left.receivedAt || "")))
      .slice(0, limit)
      .map(booking => ({
        id: booking.id,
        status: bookingStatus(booking, records),
        receivedAt: booking.receivedAt || "",
        client: {
          fullName: booking.client?.fullName || "",
          email: booking.client?.email || "",
          phone: booking.client?.phone || "",
        },
        appointment: {
          date: booking.client?.date || "",
          time: booking.client?.time || "",
        },
        services: (booking.cart || []).map(item => ({
          name: item.name || item.title || "Service",
          type: item.type || "service",
          price: Number(item.price || 0),
          duration: item.duration || "",
        })),
        total: Number(booking.total || 0),
        deposit: Number(booking.deposit || 0),
        friendTest: booking.friendTest || null,
        initialNotificationResults: Array.isArray(booking.notificationResults) ? booking.notificationResults : [],
        events: records
          .filter(record => bookingRecordId(record) === booking.id && record !== booking)
          .map(bookingEventSummary),
      }));
    sendJson(res, 200, { ok: true, bookings });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
  }
}

async function handleAdminConfirmationResend(req, res) {
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw || "{}");
    if (!ownerRequestIsValid(req, body.token || "")) {
      sendJson(res, 403, { ok: false, error: "The owner token is missing or invalid." });
      return;
    }
    const bookingId = String(body.bookingId || "").trim();
    const savedBooking = findBookingById(bookingId);
    const email = String(body.email || savedBooking?.client?.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendJson(res, 400, { ok: false, error: "Enter the client's valid email address." });
      return;
    }
    const fullName = String(body.fullName || savedBooking?.client?.fullName || "").trim();
    const date = String(body.date || savedBooking?.client?.date || "").trim();
    const time = String(body.time || savedBooking?.client?.time || "").trim();
    if (!fullName || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      sendJson(res, 400, { ok: false, error: "Enter the client name, appointment date, and appointment time." });
      return;
    }
    const booking = savedBooking ? {
      ...savedBooking,
      client: { ...savedBooking.client, fullName, email, date, time },
    } : {
      id: bookingId || `RECOVERY-${Date.now()}`,
      client: { fullName, email, date, time },
      cart: [],
      selectedServices: [],
      deposit: Number(body.deposit || 0),
      total: Number(body.total || 0),
    };
    const message = confirmationEmail(booking);
    let result;
    try {
      result = {
        channel: "clientEmail",
        ...(await sendEmail(email, "Your Lovely Locs appointment is confirmed", message.text, { html: message.html })),
      };
    } catch (error) {
      result = {
        channel: "clientEmail",
        failed: true,
        error: error.message,
        gmailDraftUrl: gmailComposeUrl(email, "Your Lovely Locs appointment is confirmed", message.text),
      };
    }
    appendBookingRecord({
      type: "confirmation.email.resent",
      bookingId: booking.id,
      recipientEmail: email,
      sentAt: new Date().toISOString(),
      notificationResults: [result],
      recoveredBooking: !savedBooking,
    });
    sendJson(res, 200, {
      ok: !result.failed && !result.skipped,
      bookingId: booking.id,
      recoveredBooking: !savedBooking,
      notificationResults: [result],
    });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
  }
}

async function handleResendWebhook(req, res) {
  try {
    const raw = await readBody(req);
    const verified = verifyResendWebhook(raw, req.headers);
    const records = readBookingRecords();
    if (records.some(record => record.type === "resend.email.event" && record.webhookId === verified.id)) {
      sendJson(res, 200, { ok: true, duplicate: true });
      return;
    }
    const event = verified.event || {};
    const eventType = String(event.type || "");
    if (!eventType.startsWith("email.")) {
      sendJson(res, 200, { ok: true, ignored: true });
      return;
    }
    const providerMessageId = String(event.data?.email_id || "");
    const linked = findNotificationByProviderId(providerMessageId, records);
    const detail = event.data?.bounce?.message
      || event.data?.failed?.message
      || event.data?.suppressed?.message
      || event.data?.reason
      || "";
    const deliveryRecord = {
      type: "resend.email.event",
      bookingId: linked?.bookingId || "",
      webhookId: verified.id,
      providerMessageId,
      receivedAt: new Date().toISOString(),
      delivery: {
        status: eventType.replace(/^email\./, ""),
        eventType,
        createdAt: event.created_at || event.data?.created_at || "",
        channel: linked?.channel || "",
        recipient: Array.isArray(event.data?.to) ? event.data.to[0] || "" : "",
        subject: event.data?.subject || "",
        detail,
      },
    };
    if (linked?.channel === "clientEmail" && ["email.bounced", "email.failed", "email.suppressed"].includes(eventType)) {
      const booking = findBookingById(linked.bookingId);
      const clientName = booking?.client?.fullName || "a client";
      const alertText = [
        `Client confirmation delivery problem for ${clientName}.`,
        `Booking ID: ${linked.bookingId || "unknown"}`,
        `Delivery status: ${eventType.replace(/^email\./, "")}`,
        detail ? `Provider detail: ${detail}` : "",
        "Open Owner Admin and use Resend Client Confirmation after correcting the email address.",
      ].filter(Boolean).join("\n");
      try {
        deliveryRecord.ownerAlert = await sendEmail(
          `Lovely Locs email delivery problem: ${linked.bookingId || clientName}`,
          alertText
        );
      } catch (error) {
        deliveryRecord.ownerAlert = { failed: true, error: error.message };
      }
    }
    appendBookingRecord(deliveryRecord);
    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
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
      const referralRewardNotification = referralReward
        ? await notifyReferralRewardApproved(referralReward, booking)
        : null;
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
        referralRewardNotification,
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
  const savedProfile = latestClientProfile(client, records);
  const profile = {
    fullName: String(client.fullName || "").trim(),
    email: String(client.email || "").trim(),
    phone: String(client.phone || "").trim(),
    ...(latest?.client || {}),
    ...(savedProfile?.client || {}),
  };
  const key = clientIdentityKey(profile);
  const referralCode = normalizeReferralCode(referralCodeForClient(profile) || profile.referralCode);
  const siteUrl = publicSiteUrl(req);
  const shareUrl = `${siteUrl}/?ref=${encodeURIComponent(referralCode)}#services`;
  const reviewUrl = String(process.env.REVIEW_REQUEST_URL || "").trim();
  const pendingReferrals = records.filter(record => record.type === "referral.reward.pending" && record.referrerKey === key);
  const approvedReferrals = records.filter(record => record.type === "referral.reward.approved" && record.clientKey === key);
  const completedVisits = completedClientBookings(profile, records).slice().reverse().map(booking => ({
    bookingId: booking.id,
    date: booking.client?.date || "",
    time: booking.client?.time || "",
    total: booking.total || 0,
    services: (booking.selectedServices?.length ? booking.selectedServices : booking.cart || []).map(item => item.name).filter(Boolean),
  }));
  const credits = records.filter(record => (
    ["referral.reward.approved", "birthday.reward.approved", "returning_client.reward.approved"].includes(record.type)
    && record.clientKey === key
  )).map(record => {
    const reserved = records.some(item => item.type === "discount.credit.reserved" && item.creditId === record.creditId);
    const redeemed = records.some(item => item.type === "discount.credit.redeemed" && item.creditId === record.creditId);
    const expired = creditIsExpired(record);
    return {
      type: record.type === "birthday.reward.approved"
        ? "birthday"
        : record.type === "returning_client.reward.approved"
          ? "returning"
          : "referral",
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
    clientFound: Boolean(latest || savedProfile),
    client: {
      fullName: profile.fullName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      birthday: profile.birthday || "",
      locJourneyLength: profile.locJourneyLength || "",
      onboardingCompleted: Boolean(profile.onboardingCompleted || savedProfile),
      googleLinked: Boolean(savedProfile?.googleSubject),
      preferredContact: "email",
      smsOptIn: false,
      marketingEmailOptIn: Boolean(profile.marketingEmailOptIn),
      referralOptIn: Boolean(profile.referralOptIn),
      specialRequests: profile.specialRequests || "",
    },
    referralCode,
    shareUrl,
    reviewUrl,
    rebookUrl: `${siteUrl}/#services`,
    feedbackEmail: ownerEmail,
    pastVisits: completedVisits,
    incentives: {
      returningClientCreditAmount,
      returningClientCopy: `Returning Client Credit: Get ${returningClientCreditAmount} off your next completed service after your first visit. No review required.`,
    },
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
      time: "11:00",
    });
    if (!client.email) {
      sendJson(res, 400, { ok: false, error: "Enter the email used for booking." });
      return;
    }
    sendJson(res, 200, clientSettingsFor(client, req));
  } catch (error) {
    sendJson(res, 400, { ok: false, error: error.message });
  }
}

function decodeJwtPart(value) {
  return JSON.parse(Buffer.from(String(value || ""), "base64url").toString("utf8"));
}

async function googleSigningKeys(forceRefresh = false) {
  if (!forceRefresh && googleJwksCache.expiresAt > Date.now() && googleJwksCache.keys.length) {
    return googleJwksCache.keys;
  }
  const response = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  if (!response.ok) throw new Error("Google's sign-in keys could not be loaded.");
  const body = await response.json();
  const cacheControl = response.headers.get("cache-control") || "";
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] || 3600);
  googleJwksCache = {
    expiresAt: Date.now() + Math.max(300, maxAge) * 1000,
    keys: Array.isArray(body.keys) ? body.keys : [],
  };
  return googleJwksCache.keys;
}

async function verifyGoogleCredential(credential) {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
  if (!clientId) throw new Error("Google sign-in is not configured.");
  const parts = String(credential || "").split(".");
  if (parts.length !== 3) throw new Error("Google returned an invalid sign-in credential.");
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJwtPart(encodedHeader);
  const claims = decodeJwtPart(encodedPayload);
  if (header.alg !== "RS256" || !header.kid) throw new Error("Google returned an unsupported sign-in credential.");
  let signingKey = (await googleSigningKeys()).find(key => key.kid === header.kid && key.kty === "RSA");
  if (!signingKey) {
    signingKey = (await googleSigningKeys(true)).find(key => key.kid === header.kid && key.kty === "RSA");
  }
  if (!signingKey) throw new Error("Google's sign-in key could not be verified. Please try again.");
  const publicKey = crypto.createPublicKey({ key: signingKey, format: "jwk" });
  const signatureValid = crypto.verify(
    "RSA-SHA256",
    Buffer.from(`${encodedHeader}.${encodedPayload}`),
    publicKey,
    Buffer.from(encodedSignature, "base64url")
  );
  if (!signatureValid) throw new Error("Google sign-in verification failed.");
  const now = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!["accounts.google.com", "https://accounts.google.com"].includes(claims.iss)) throw new Error("Google sign-in issuer is invalid.");
  if (!audiences.includes(clientId)) throw new Error("Google sign-in was issued for a different application.");
  if (!Number.isFinite(Number(claims.exp)) || Number(claims.exp) <= now) throw new Error("Google sign-in expired. Please try again.");
  if (claims.iat && Number(claims.iat) > now + 300) throw new Error("Google sign-in time is invalid.");
  if (!claims.email || claims.email_verified !== true) throw new Error("Use a Google account with a verified email address.");
  return claims;
}

async function handleGoogleSignIn(req, res) {
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw || "{}");
    const claims = await verifyGoogleCredential(body.credential);
    const records = readBookingRecords();
    const savedProfile = latestClientProfileByGoogleSubject(claims.sub, records)
      || latestClientProfileByEmail(claims.email, records);
    const booking = latestClientBookingByEmail(claims.email, records);
    if (!savedProfile && !booking) {
      sendJson(res, 200, {
        ok: true,
        needsSignup: true,
        signup: {
          email: String(claims.email).trim().toLowerCase(),
          fullName: String(claims.name || "").trim(),
        },
      });
      return;
    }
    const session = ownerSessionValue(claims);
    sendJson(res, 200, {
      ...clientSettingsFor(savedProfile?.client || booking.client, req),
      auth: {
        provider: "google",
        email: String(claims.email).trim().toLowerCase(),
      },
    }, session ? { "Set-Cookie": ownerSessionCookieName + "=" + encodeURIComponent(session) + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800" } : {});
  } catch (error) {
    sendJson(res, 401, { ok: false, error: error.message });
  }
}

async function handleGoogleSignup(req, res) {
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw || "{}");
    const claims = await verifyGoogleCredential(body.credential);
    const records = readBookingRecords();
    const existingProfile = latestClientProfileByGoogleSubject(claims.sub, records)
      || latestClientProfileByEmail(claims.email, records);
    if (existingProfile) {
      sendJson(res, 200, {
        ...clientSettingsFor(existingProfile.client, req),
        auth: { provider: "google", email: String(claims.email).trim().toLowerCase() },
      });
      return;
    }
    const requestedBirthday = String(body.birthday || "").trim();
    if (requestedBirthday && !/^\d{4}-\d{2}-\d{2}$/.test(requestedBirthday)) {
      sendJson(res, 400, { ok: false, error: "Enter a valid birthday or leave it blank." });
      return;
    }
    const client = sanitizeClient({
      fullName: body.fullName || claims.name || "",
      email: claims.email,
      phone: body.phone || "",
      birthday: requestedBirthday,
      locJourneyLength: body.locJourneyLength || "",
      onboardingCompleted: true,
      date: "2099-01-01",
      time: "11:00",
    });
    if (!client.fullName) {
      sendJson(res, 400, { ok: false, error: "Enter your full name." });
      return;
    }
    client.referralCode = referralCodeForClient(client);
    appendBookingRecord({
      type: "client.profile.saved",
      profileId: `google:${claims.sub}`,
      googleSubject: String(claims.sub || ""),
      clientKey: clientIdentityKey(client),
      client,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    });
    sendJson(res, 201, {
      ...clientSettingsFor(client, req),
      created: true,
      auth: { provider: "google", email: String(claims.email).trim().toLowerCase() },
    });
  } catch (error) {
    sendJson(res, 401, { ok: false, error: error.message });
  }
}

async function handleNotificationTest(req, res) {
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw || "{}");
    if (!ownerRequestIsValid(req, body.token || "")) {
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
    const validTypes = new Set(["all", "daily", "monthly", "referral-campaign", "deposit", "appointment", "review", "referral", "birthday", "returning"]);
    if (!validTypes.has(type)) {
      sendJson(res, 400, { ok: false, error: "Unknown automation type." });
      return;
    }
    const nowValue = body.now || url.searchParams.get("now") || "";
    const now = nowValue ? new Date(nowValue) : new Date();
    if (Number.isNaN(now.getTime())) {
      sendJson(res, 400, { ok: false, error: "Automation now must be a valid date." });
      return;
    }
    sendJson(res, 200, await runAutomations({ type, now }));
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
    dailyTypes: ["deposit", "appointment", "review", "referral", "birthday", "returning"],
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
      emailDeliveryTrackingConfigured: Boolean(process.env.RESEND_WEBHOOK_SECRET),
      emailDeliveryTrackingReason: process.env.RESEND_WEBHOOK_SECRET
        ? "Signed Resend delivery webhooks are configured."
        : "Set RESEND_WEBHOOK_SECRET after registering the production webhook.",
      confirmationFromEmail: email.from || configuredEmailAddress(process.env.CONFIRMATION_FROM_EMAIL || ""),
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

  if (req.method === "GET" && (req.url || "").split("?")[0] === "/api/auth/google/config") {
    const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
    sendJson(res, 200, { ok: true, configured: Boolean(clientId), clientId });
    return;
  }

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/site-settings") {
    readBody(req).then(raw => {
      const body = JSON.parse(raw || "{}");
      if (!ownerRequestIsValid(req, body.token || "")) {
        sendJson(res, 403, { ok: false, error: "Admin token is missing or invalid." });
        return;
      }
      const settings = saveSiteSettings({ logo: body.logo, discount: body.discount, catalog: body.catalog });
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

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/auth/google") {
    handleGoogleSignIn(req, res);
    return;
  }

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/auth/google/signup") {
    handleGoogleSignup(req, res);
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

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/resend/webhook") {
    handleResendWebhook(req, res);
    return;
  }

  if (["GET", "POST"].includes(req.method) && (req.url || "").split("?")[0] === "/api/automations/run") {
    handleAutomationRun(req, res);
    return;
  }

  if (["GET", "POST"].includes(req.method) && (req.url || "").split("?")[0] === "/api/manual-payment/confirm") {
    handleManualPaymentConfirm(req, res);
    return;
  }

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/manual-payment/release") {
    handleManualPaymentRelease(req, res);
    return;
  }

  if (req.method === "GET" && (req.url || "").split("?")[0] === "/api/admin/booking") {
    handleAdminBookingLookup(req, res);
    return;
  }

  if (req.method === "GET" && (req.url || "").split("?")[0] === "/api/admin/bookings") {
    handleAdminRecentBookings(req, res);
    return;
  }

  if (req.method === "POST" && (req.url || "").split("?")[0] === "/api/admin/confirmation/resend") {
    handleAdminConfirmationResend(req, res);
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
    ...extraHeaders,
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

