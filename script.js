const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6978dfbb416a772de9813cbb/da2605355_ModernBeigeBuyOneCoffeeGetOneFreeHalfPageAd.png";

const categories = [
  { id: "loc-maintenance", label: "Loc Maintenance", icon: "Retwist" },
  { id: "starter-locs", label: "Starter Locs", icon: "" },
  { id: "instant-crochet", label: "Instant Locs / Crochet", icon: "" },
  { id: "add-ons", label: "Add-Ons & More", icon: "Add-On" }
];

const business = {
  name: "Lovely Locs",
  email: "lvlc.support@lovelylocsnc.com",
  phone: "(336)-471-1098",
  area: "Piedmont Triad, North Carolina",
  studio: "Private in-home studio"
};

const manualPaymentFallbackOptions = [
  {
    id: "venmo",
    label: "Venmo",
    handle: "Confirm current Venmo with Lovely Locs before sending.",
    note: "Include your booking ID in the payment note so the deposit can be matched quickly."
  },
  {
    id: "apple-pay",
    label: "Apple Pay",
    handle: "Confirm current Apple Pay contact with Lovely Locs before sending.",
    note: "Include your booking ID in the payment note so the deposit can be matched quickly."
  }
];

function publicPaymentHandle(option = {}) {
  const handle = option.handle || "";
  if (handle && !/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(handle)) return handle;
  if (handle && handle.toLowerCase().includes(business.email)) return handle;
  return option.id === "apple-pay"
    ? "Confirm current Apple Pay contact with Lovely Locs before sending."
    : "Confirm current payment tag with Lovely Locs before sending.";
}

function publicPaymentOptions(options) {
  const source = Array.isArray(options) && options.length ? options : manualPaymentFallbackOptions;
  return source.map(option => ({ ...option, handle: publicPaymentHandle(option) }));
}

const regularAppointmentTimes = ["18:30", "19:30", "20:30"];
const emergencyProposalTimes = ["10:00", "12:00", "14:00", "16:00", "22:30"];
const holidayDates = new Set(["2026-01-01", "2026-05-25", "2026-07-04", "2026-09-07", "2026-11-26", "2026-12-24", "2026-12-25", "2026-12-31"]);
const defaultLogoSettings = {
  url: logoUrl,
  navSize: 40,
  heroSize: 88,
  heroAlign: "left",
  fit: "cover",
  x: 50,
  y: 50
};
const defaultDiscountSettings = {
  code: "LOVELY10",
  percent: 10,
  enabled: false,
  expiresAt: ""
};

const services = [
  { id: "sprinkles-addon", duration: "30 min", featured: false, price: 15, name: "Loc Sprinkles (Add On)", description: "Premium loc accessories, glitter, charms, and sparkle. Must be added alongside a service booking. Custom colors available for $15.", category: "add-ons" },
  { id: "emergency-fee", duration: "3h", featured: false, price: 45, name: "Emergency Fee", description: "Additional fee for emergency bookings. Applies to same-day, within 24 hours, and major holiday appointments.", category: "add-ons" },
  { id: "children-instant-starter", duration: "5h", featured: false, price: 150, name: "Children Instant Starter Locs", description: "Instant starter locs for children. Ask about children's bundle services.", category: "starter-locs" },
  { id: "medium-adult-starter", duration: "6h 30min", featured: false, price: 150, name: "Medium Adult Starter Locs", description: "Medium-sized starter locs for adults.", category: "starter-locs" },
  { id: "adult-retwist", duration: "3h 30min", featured: false, price: 90, name: "Adult Retwist (Maintenance)", description: "Keep your loc journey beautiful with a fresh retwist focused on neatness and hydration. Includes a complimentary two-strand twist style.", category: "loc-maintenance" },
  { id: "child-starter-coils", duration: "3h 30min", featured: false, price: 75, name: "Children's Starter Locs Coils & Two Strand Twist", description: "Starter locs for children using coils and two-strand twist method.", category: "starter-locs" },
  { id: "sprinkle-install", duration: "2h 15min", featured: true, price: 50, name: "Loc Sprinkle Installation", description: "Hand-installed, high-quality beads and crystals. Includes 4 locs; add premium accessory color preferences in your notes.", category: "add-ons" },
  { id: "children-retwist", duration: "3h", featured: false, price: 75, name: "Children Retwist (Maintenance)", description: "Gentle retwist maintenance designed for children. Complimentary two-strand twist style included.", category: "loc-maintenance" },
  { id: "adult-instant", duration: "5h 30min", featured: false, price: 125, name: "Adult Instant Locs", description: "Uses 0.5mm and 0.75mm crochet needles for instant loc maintenance. Includes complimentary two-strand twist style.", category: "instant-crochet" },
  { id: "child-instant", duration: "3h 30min", featured: false, price: 85, name: "Children's Instant Loc", description: "Starting price for children's instant loc maintenance. Complimentary two-strand twist style included.", category: "instant-crochet" },
  { id: "referral-retwist", duration: "3h 30min", featured: false, price: 75, name: "Referral (Retwist)", description: "Special referral pricing for retwist service. First-time clients only. Referral can only be used once.", category: "loc-maintenance" },
  { id: "style-addon", duration: "1h 30min", featured: false, price: 30, name: "Style (Add On)", description: "Additional styling service. Must be booked with a maintenance service.", category: "add-ons" },
  { id: "consultation", duration: "1h 15min", featured: false, price: 30, name: "Consultation", description: "Discuss parting, size, texture, and method for your loc journey.", category: "add-ons" },
  { id: "small-adult-starter", duration: "5h 30min", featured: false, price: 225, name: "Small Adult Starter Locs", description: "Small-sized starter locs for adults. Consultation required before booking.", category: "starter-locs" },
  { id: "overdue-retwist", duration: "4-5 hours", featured: true, price: 125, name: "Overdue Retwist (4+ Months)", description: "For clients who haven't had a retwist in over 3 months. Includes full retwist and basic style.", category: "loc-maintenance" }
];

const adminTestService = {
  id: "admin-test-booking",
  duration: "15 min",
  featured: false,
  price: 0,
  name: "Free Admin Test Booking",
  description: "Owner-only test service for checking the booking form and confirmation messages without charging a deposit.",
  category: "admin-test"
};

const products = [
  { name: "Gold Sparkle Sprinkles", price: 12, description: "Premium gold glitter loc accessories for a touch of elegance." },
  { name: "Silver Shimmer Sprinkles", price: 12, description: "Shimmering silver loc charms perfect for any occasion." },
  { name: "Rose Gold Sprinkles", price: 12, description: "Soft rose gold accents that complement any loc style." },
  { name: "Custom Color Sprinkles", price: 15, description: "Choose your custom color to match your unique style." }
];

const recommendedHairProducts = [
  {
    name: "Made For Locs Vegan Apple Cider Vinegar Shampoo",
    shelf: "Cleanse",
    category: "Clarifying shampoo",
    bestFor: "Buildup-prone locs, mature locs, and wash days after gels or oils.",
    note: "A loc-focused clarifying wash option for clients whose hair feels heavy or coated.",
    review: "Walmart/Shop App-style purchaser reviews and Made For Locs reviews mention cleaner locs and buildup removal.",
    url: "https://business.walmart.com/ip/Made-For-Locs-Vegan-Apple-Cider-Vinegar-Shampoo/1128203990"
  },
  {
    name: "Dr Locs Yasin Shampoo",
    shelf: "Cleanse",
    category: "Loc shampoo",
    bestFor: "Clients who want a professional loc shampoo that rinses clean.",
    note: "A loctician-created shampoo option for routine cleansing without a heavy coated feel.",
    review: "Shop App and verified-buyer Dr Locs reviews support this as a niche loc product with lighter big-box retail proof.",
    url: "https://shop.app/products/9084609361"
  },
  {
    name: "Locsanity Rosewater & Peppermint Spray",
    shelf: "Hydrate",
    category: "Daily moisture spray",
    bestFor: "Dry locs, light refreshes, dyed locs, and between-appointment moisture.",
    note: "A light rosewater-peppermint mist for clients who need moisture without heavy creams.",
    review: "Walmart customer reviews mention use on locs, dreadlocks, dyed locs, and family members' locs.",
    url: "https://www.walmart.com/reviews/product/1227218001"
  },
  {
    name: "Made For Locs Aloe Moisturizing Hair Spray",
    shelf: "Hydrate",
    category: "Aloe hydration spray",
    bestFor: "Loc clients who want a simple spray routine between retwists.",
    note: "A lightweight aloe spray for keeping locs feeling hydrated without over-layering product.",
    review: "CVS customer reviews include loc-client comments about daily use and locs flourishing.",
    url: "https://www.cvs.com/shop/made-for-locs-aloe-moisturizing-hydrating-curl-enhancing-hair-spray-8-oz-prodid-614711-reviews"
  },
  {
    name: "FreeTheRoots Aloe Hydrating Mist",
    shelf: "Hydrate",
    category: "Botanical mist",
    bestFor: "Clients avoiding heavy oils, silicones, waxes, or buildup-prone products.",
    note: "A clean-feeling mist for loc clients who want moisture without product heaviness.",
    review: "Shop App/store reviews include loc clients mentioning starter locs, softer dreadlocks, and hydration.",
    url: "https://shop.app/products/7347969093704"
  },
  {
    name: "Dr Locs Imani Locking Spray",
    shelf: "Retwist",
    category: "Retwist hold spray",
    bestFor: "Clients who prefer spray hold over gel or want a lighter retwist product.",
    note: "A lighter retwist-hold option for neat roots without heavy gel buildup.",
    review: "Shop App and verified-buyer Dr Locs reviews mention hold, scent, sensitive-scalp use, and loctician work.",
    url: "https://shop.app/products/9084836177"
  },
  {
    name: "Taliah Waajid Lock It Up",
    shelf: "Retwist",
    category: "Retwist gel",
    bestFor: "Starter locs, two-strand twists, and budget-friendly loc grooming.",
    note: "A beauty-supply staple that can work well when used with a light hand.",
    review: "Walmart and Influenster customer reviews include loc and natural-style feedback about lightweight hold and lower residue.",
    url: "https://www.influenster.com/reviews/taliah-waajid-black-earth-products-lock-it-up-hair-gel"
  },
  {
    name: "Jamaican Mango & Lime Locking Gel",
    shelf: "Retwist",
    category: "Strong hold gel",
    bestFor: "Retwist clients who need firmer hold and an easy-to-find option.",
    note: "A stronger-hold budget gel; best used sparingly to reduce buildup risk.",
    review: "Walmart customer reviews provide outside-review proof, with official reviews adding loc-specific hold feedback.",
    url: "https://www.walmart.com/ip/Jamaican-Mango-Lime-Locking-Hair-Gel-6-Oz/10450991"
  },
  {
    name: "Cecred Scalp Refreshing Spray",
    shelf: "Scalp + Style Support",
    category: "Scalp refresher",
    bestFor: "Protective styles, scalp freshness, and cooling between scheduled wash days.",
    note: "A premium scalp refresher for clients wearing locs, braids, wigs, or extensions.",
    review: "Ulta customer reviews and Cecred verified-buyer reviews mention scalp comfort, cooling, coily hair, and protective styles.",
    url: "https://www.ulta.com/p/scalp-refreshing-spray-pimprod2054143"
  },
  {
    name: "tgin Rose Water Curl Refresher",
    shelf: "Scalp + Style Support",
    category: "Natural hair refresher",
    bestFor: "Loose naturals, curls, braids, protective styles, and select mature loc clients.",
    note: "A natural-hair substitute option for light refreshing when loc-specific reviews are thinner.",
    review: "Ulta and Walmart customer reviews are mostly from loose natural or curly clients, with some protective-style mentions.",
    url: "https://www.ulta.com/p/rose-water-curl-refresher-pimprod2005385"
  },
  {
    name: "Mielle Rosemary Mint Scalp & Hair Strengthening Oil",
    shelf: "Scalp + Style Support",
    category: "Scalp oil",
    bestFor: "Dry scalp support or a light pre-wash scalp massage.",
    note: "A popular oil option that should be used lightly and never marketed as guaranteed hair growth.",
    review: "Ulta and Target customer reviews provide a large natural-hair review base, including both praise and irritation concerns.",
    url: "https://www.ulta.com/p/rosemary-mint-scalp-hair-strengthening-oil-pimprod2033947"
  },
  {
    name: "Lion Locs 2-in-1 Co-Wash",
    shelf: "Cleanse",
    category: "Co-wash conditioner",
    bestFor: "Mature locs needing softness between stronger shampoo days.",
    note: "A softness-focused option, not the first pick when heavy buildup is the main issue.",
    review: "Walmart and Lion Locs customer reviews include loc-client feedback about softness, scent, body, and wash-day feel.",
    url: "https://www.walmart.com/ip/Lion-Locs-Shampoo-Conditioner-Co-Wash-8-oz/943692278"
  }
];

const productShelfGroups = [
  { name: "Cleanse", summary: "Wash-day picks for buildup, routine cleansing, and mature loc softness." },
  { name: "Hydrate", summary: "Water-based sprays and mists for light moisture between appointments." },
  { name: "Retwist", summary: "Hold products for neat roots, chosen with buildup risk in mind." },
  { name: "Scalp + Style Support", summary: "Support products for scalp comfort, protective styles, and natural-hair substitutes." }
];

const productCarePrinciples = [
  "Cleanse before layering more product.",
  "Use water-based moisture first, then oil lightly only when needed.",
  "Keep gels and strong-hold products at the roots instead of packing the loc shaft.",
  "Patch test anything new before making it part of your routine."
];

const stockShortlist = [
  {
    name: "Locsanity Rosewater & Peppermint Spray",
    role: "Best first shelf item",
    quality: "Light daily moisture, familiar to loc clients, and easy to explain after retwist appointments.",
    proof: "Walmart and Shop App listings show purchaser-review activity, while community feedback is mixed enough to keep this as a client-choice item rather than a blanket recommendation.",
    margin: "Strong add-on potential because sprays are easy to bundle, easy to sample, and low-risk to keep in small quantities.",
    action: "Stock soon"
  },
  {
    name: "Made For Locs Aloe Moisturizing Hair Spray",
    role: "Gentler hydration option",
    quality: "Aloe-based moisture support for clients who want a lighter routine between appointments.",
    proof: "CVS and Made For Locs review pages show loc-client feedback around daily use, hydration, and improved feel.",
    margin: "Good retail potential as a second spray option for sensitive or peppermint-avoidant clients.",
    action: "Stock soon"
  },
  {
    name: "Dr Locs Imani Locking Spray",
    role: "Professional retwist support",
    quality: "A lighter hold option that fits your current booking flow because clients already choose Oil and Water, Foam, or Gel.",
    proof: "Shop App and Dr Locs buyer reviews mention hold, scent, sensitive-scalp use, and loctician use.",
    margin: "Worth testing in limited quantity because professional hold products can sell after maintenance services.",
    action: "Test small"
  },
  {
    name: "Loc Sprinkles, cuffs, and custom charms",
    role: "Highest margin accessory lane",
    quality: "Visual add-ons are not hair-health dependent, so quality control is easier: shine, durability, comfort, and color variety matter most.",
    proof: "Your booking menu already supports sprinkles and custom color preferences, so this is the most natural shelf expansion.",
    margin: "Best profit-margin potential because accessories can be bought in bulk and sold as appointment add-ons.",
    action: "Prioritize"
  }
];

const visitStandards = [
  {
    title: "Starter loc planning",
    focus: "Consultation support",
    copy: "Starter loc services are framed around size, parting, and maintenance expectations so clients know what they are booking before appointment day."
  },
  {
    title: "Comfort-first maintenance",
    focus: "Retwist experience",
    copy: "Retwist appointments are described around neat roots, hydration, and a private studio setting instead of promising exaggerated results."
  },
  {
    title: "Accessory and style clarity",
    focus: "Add-on expectations",
    copy: "Style and loc accessory add-ons are discussed as optional finishing details, with product and color preferences collected in the booking notes."
  }
];

const serviceGuide = [
  {
    id: "new-locs",
    label: "Starter Locs",
    recommendation: "Start with a Consultation if you are unsure about size, parting, or method. If you are ready, choose Children's Starter Locs, Medium Adult Starter Locs, or Small Adult Starter Locs based on your desired size.",
    serviceIds: ["consultation", "child-starter-coils", "medium-adult-starter", "small-adult-starter"]
  },
  {
    id: "maintenance",
    label: "I need a fresh retwist",
    recommendation: "Choose Adult Retwist or Children Retwist. If it has been more than 3 months, choose Overdue Retwist so enough time is reserved.",
    serviceIds: ["adult-retwist", "children-retwist", "overdue-retwist"]
  },
  {
    id: "instant",
    label: "Instant Locs / Crochet",
    recommendation: "Choose Adult Instant Locs or Children's Instant Loc. These services use crochet needle work and need a longer appointment window.",
    serviceIds: ["adult-instant", "child-instant", "children-instant-starter"]
  },
  {
    id: "extra-style",
    label: "I want accessories or a style",
    recommendation: "Add Style, Loc Sprinkle Installation, or Loc Sprinkles alongside your main service. Add color/style preferences in your booking notes.",
    serviceIds: ["style-addon", "sprinkle-install", "sprinkles-addon"]
  }
];

const serviceQuizQuestions = [
  {
    id: "stage",
    label: "Hair stage",
    options: [
      { value: "starter", label: "Starter locs", guide: "new-locs" },
      { value: "maintenance", label: "Maintaining locs", guide: "maintenance" },
      { value: "instant", label: "Instant locs / crochet", guide: "instant" }
    ]
  },
  {
    id: "timing",
    label: "Timing",
    options: [
      { value: "fresh", label: "On schedule (6 to 8 weeks since last retwist)", guide: "maintenance" },
      { value: "overdue", label: "4+ months since retwist", guide: "maintenance", highlight: "Overdue Retwist" },
      { value: "extra", label: "Loc accessories only", guide: "extra-style" }
    ]
  }
];

const bookingPrepItems = [
  { title: "Send recent hair photos", copy: "Clear front, side, back, and root photos help Lovely Locs prepare for your current loc stage." },
  { title: "Know your last service date", copy: "Retwist timing helps prevent underbooking, especially for overdue maintenance." },
  { title: "Choose product preferences", copy: "Maintenance clients can note Oil and Water, Foam, or Gel so the finish matches their scalp and style goals." },
  { title: "Prepare your deposit method", copy: "After submitting, use the pay options page and include your booking ID with the deposit." },
  { title: "Wait for final confirmation", copy: "Submitting the form does not finalize your appointment. Your official confirmation is sent only after Lovely Locs verifies that your deposit was received. Emergency proposals may need an extra owner follow-up." }
];

const visualVersions = [
  { id: "v0", label: "Today", note: "Polished conversion layout with featured services, client guide, service focus, and visit expectations." },
  { id: "v1", label: "1 Day Ago", note: "Clean business site with booking process, service menu, and stronger brand copy." },
  { id: "v2", label: "2 Days Ago", note: "Original warm Lovely Locs layout with simple services, policies, products, and contact pages." },
  { id: "v3", label: "3 Days Ago", note: "Softer classic look with less shadow and a quieter service menu." },
  { id: "v4", label: "4 Days Ago", note: "High-contrast salon look with darker browns and stronger buttons." },
  { id: "v5", label: "5 Days Ago", note: "Simple booking-first layout with compact sections and fewer decorative elements." },
  { id: "v6", label: "6 Days Ago", note: "Portfolio-forward layout emphasizing visual proof and client preparation." },
  { id: "v7", label: "7 Days Ago", note: "Minimal fallback look closest to the early static clone." }
];

const policies = {
  deposit: "A non-refundable deposit is required to hold the selected appointment time. The deposit is 30% of the selected services and products, with a $30 minimum. Clients are sent to a pay options page for Venmo or Apple Pay details after submitting.",
  cancellation: "Lovely Locs does not provide any refunds for cancellations made after your booking is confirmed. Cancelling your booking at any time will result in the loss of your deposit fee.",
  booking_rules: "Only in-home studio service appointments are accepted. Deposits are non-refundable under all circumstances.",
  emergency_fee: "A $45 Emergency Fee is added when a client selects a brown emergency proposal slot outside regular business hours, on Sundays, or on holidays/key dates.",
  payment_options: "Deposits are paid through the Lovely Locs pay options page using Venmo or Apple Pay. The official client confirmation is sent only after Lovely Locs verifies the matching payment receipt."
};

const faq = [
  { question: "Do you repair locs?", answer: "Yes. Please contact us at lvlc.support@lovelylocsnc.com to discuss your specific needs and schedule a consultation." },
  { question: "How long do services take?", answer: "Service durations vary from 1.5 to 6.5 hours depending on the type and complexity of service." },
  { question: "Are deposits refundable?", answer: "No. All deposits are non-refundable under all circumstances. Cancelling will result in the loss of your deposit." },
  { question: "Where are appointments held?", answer: "All appointments are at our private in-home studio in the Piedmont Triad, NC. Studio address is shared after booking is confirmed." },
  { question: "What payment methods do you accept?", answer: "Appointment deposits can be sent through Venmo or Apple Pay from the pay options page. Remaining balances are handled directly with Lovely Locs after service." },
  { question: "What about emergency or holiday appointments?", answer: "Brown emergency proposal slots are outside regular business hours, Sundays, or holiday/key dates. The $45 Emergency Fee is added before the deposit is calculated." }
];

const hours = [
  ["Monday", "6:30 PM - 10:30 PM", true],
  ["Tuesday", "6:30 PM - 10:30 PM", true],
  ["Wednesday", "6:30 PM - 10:30 PM", true],
  ["Thursday", "6:30 PM - 10:30 PM", true],
  ["Friday", "6:30 PM - 10:30 PM", true],
  ["Saturday", "6:30 PM - 10:30 PM", true],
  ["Sunday", "By Appointment Only", false]
];

const portfolioItems = [
  { title: "Fresh Maintenance", tag: "Retwist + two-strand finish", tone: "warm" },
  { title: "Starter Loc Foundation", tag: "Clean parts, clear plan", tone: "sage" },
  { title: "Crochet Detail Work", tag: "Instant/crochet service", tone: "cream" },
  { title: "Loc Sprinkles", tag: "Accessories and shine", tone: "gold" }
];

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem("lovelyLocsCart") || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("lovelyLocsCart", JSON.stringify(cart));
}

function loadBookingDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem("lovelyLocsBookingDraft") || "null");
    return draft && typeof draft === "object" ? draft : null;
  } catch {
    return null;
  }
}

function saveBookingDraft(form) {
  if (!form) return null;
  const data = new FormData(form);
  const draft = {
    fullName: data.get("fullName") || "",
    email: data.get("email") || "",
    phone: data.get("phone") || "",
    date: data.get("date") || "",
    time: data.get("time") || "",
    birthday: data.get("birthday") || "",
    referredByCode: data.get("referredByCode") || "",
    emergencySlot: Boolean(data.get("emergencySlot")),
    preferredContact: data.get("preferredContact") || "email",
    smsOptIn: Boolean(data.get("smsOptIn")),
    specialRequests: data.get("specialRequests") || "",
    policyAcknowledgement: Boolean(data.get("policyAcknowledgement")),
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem("lovelyLocsBookingDraft", JSON.stringify(draft));
  bookingDraft = draft;
  const status = document.getElementById("bookingDraftStatus");
  if (status) status.textContent = "Saved on this device.";
  return draft;
}

function clearBookingDraft() {
  if (localStorage.removeItem) localStorage.removeItem("lovelyLocsBookingDraft");
  else localStorage.setItem("lovelyLocsBookingDraft", "");
  bookingDraft = null;
}

function loadLogoSettings() {
  try {
    return { ...defaultLogoSettings, ...JSON.parse(localStorage.getItem("lovelyLocsLogoSettings") || "{}") };
  } catch {
    return { ...defaultLogoSettings };
  }
}

function saveLogoSettingsLocal(settings) {
  logoSettings = { ...defaultLogoSettings, ...settings };
  localStorage.setItem("lovelyLocsLogoSettings", JSON.stringify(logoSettings));
  applyLogoSettings();
}

function normalizeDiscountCode(code) {
  return String(code || "").trim().toUpperCase();
}

function normalizeReferralCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9/_-]/g, "")
    .slice(0, 64);
}

function referralCodeForName(fullName) {
  const username = String(fullName || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 40);
  return username ? `LOVELYLOCS/${username}` : "";
}

function referralShareUrlForCode(code) {
  if (!code) return "";
  const origin = window.location.origin || "http://127.0.0.1:4175";
  return `${origin}/?ref=${encodeURIComponent(code)}#services`;
}

function personalReferralCard({ fullName = "", code = "", shareUrl = "", preview = false } = {}) {
  const referralCode = normalizeReferralCode(code || referralCodeForName(fullName));
  const referralUrl = shareUrl || referralShareUrlForCode(referralCode);
  const codeMarkup = referralCode
    ? `<strong class="personal-referral-code">${escapeAttr(referralCode)}</strong>`
    : `<strong class="personal-referral-code muted">Enter your name above to create your code</strong>`;
  return `
    <div class="personal-referral-card ${preview ? "preview" : ""}" data-personal-referral-card>
      <div>
        <p class="eyebrow">Good People Know Good People</p>
        <h3>Your Personal Referral</h3>
        <p>Share your code or link in seconds. Your personal referral code stays active for future bookings, and your referral reward becomes available after the new client's deposit is confirmed.</p>
      </div>
      ${codeMarkup}
      ${referralCode ? `
        <div class="personal-referral-actions">
          <button type="button" data-copy-personal-referral-code="${escapeAttr(referralCode)}">Copy Code</button>
          <button type="button" data-copy-personal-referral-link="${escapeAttr(referralUrl)}">Copy Link</button>
          <button type="button" data-share-personal-referral="${escapeAttr(referralUrl)}" data-referral-code="${escapeAttr(referralCode)}">Share</button>
        </div>
      ` : ""}
      <p class="personal-referral-status" data-referral-action-status aria-live="polite"></p>
    </div>`;
}

function loadDiscountSettings() {
  try {
    return { ...defaultDiscountSettings, ...JSON.parse(localStorage.getItem("lovelyLocsDiscountSettings") || "{}") };
  } catch {
    return { ...defaultDiscountSettings };
  }
}

function saveDiscountSettingsLocal(settings) {
  discountSettings = {
    ...defaultDiscountSettings,
    ...settings,
    code: normalizeDiscountCode(settings?.code || defaultDiscountSettings.code),
    percent: Number(settings?.percent ?? defaultDiscountSettings.percent),
    enabled: Boolean(settings?.enabled),
    expiresAt: settings?.expiresAt || ""
  };
  localStorage.setItem("lovelyLocsDiscountSettings", JSON.stringify(discountSettings));
  if (typeof appliedDiscount !== "undefined" && appliedDiscount) {
    const expires = discountSettings.expiresAt ? new Date(`${discountSettings.expiresAt}T23:59:59`).getTime() < Date.now() : false;
    if (!discountSettings.enabled || expires || appliedDiscount?.code !== discountSettings.code) {
      saveAppliedDiscount(null);
    }
  }
}

function loadAppliedDiscount() {
  try {
    const saved = JSON.parse(localStorage.getItem("lovelyLocsAppliedDiscount") || "null");
    if (!saved?.code || !saved?.percent) return null;
    return { code: normalizeDiscountCode(saved.code), percent: Number(saved.percent), expiresAt: saved.expiresAt || "" };
  } catch {
    return null;
  }
}

function saveAppliedDiscount(discount) {
  appliedDiscount = discount ? { code: normalizeDiscountCode(discount.code), percent: Number(discount.percent), expiresAt: discount.expiresAt || "" } : null;
  if (appliedDiscount) localStorage.setItem("lovelyLocsAppliedDiscount", JSON.stringify(appliedDiscount));
  else if (localStorage.removeItem) localStorage.removeItem("lovelyLocsAppliedDiscount");
  else localStorage.setItem("lovelyLocsAppliedDiscount", "");
}

function escapeAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cleanLogoUrl(value) {
  const url = String(value || "").trim();
  if (!url) return logoUrl;
  if (/^https?:\/\/[^\s"'<>]+$/i.test(url)) return url;
  if (/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=]+$/i.test(url) && url.length <= 1500000) return url;
  return logoUrl;
}

function currentLogoUrl(settings = logoSettings) {
  return cleanLogoUrl(settings?.url || logoUrl);
}

function loadClientProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem("lovelyLocsClientProfile") || "null");
    return profile && typeof profile === "object" ? profile : null;
  } catch {
    return null;
  }
}

function saveClientProfile(profile = {}) {
  const clean = {
    username: profile.username || "",
    fullName: profile.fullName || "",
    email: profile.email || "",
    phone: profile.phone || "",
    birthday: profile.birthday || "",
    locJourneyLength: profile.locJourneyLength || "",
    onboardingCompleted: Boolean(profile.onboardingCompleted),
    googleLinked: Boolean(profile.googleLinked),
    preferredContact: profile.preferredContact || "email",
    smsOptIn: Boolean(profile.smsOptIn),
    marketingEmailOptIn: Boolean(profile.marketingEmailOptIn),
    referralOptIn: Boolean(profile.referralOptIn),
    referralCode: profile.referralCode || "",
    specialRequests: profile.specialRequests || ""
  };
  localStorage.setItem("lovelyLocsClientProfile", JSON.stringify(clean));
  savedClientProfile = clean;
  if (isOwnerAccount(clean)) ownerAdminAccessNotice = "";
  syncOwnerAdminAccess();
  return clean;
}

const ownerAccountUsername = "LOVELY2LOCS";

function normalizeAccountUsername(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function accountUsernames(profile = {}) {
  const emailUsername = String(profile.email || "").split("@")[0];
  const referralUsername = String(profile.referralCode || "").split("/").pop();
  return [profile.username, emailUsername, referralUsername, profile.fullName]
    .map(normalizeAccountUsername)
    .filter(Boolean);
}

function isOwnerAccount(profile = savedClientProfile) {
  return Boolean(profile && accountUsernames(profile).includes(ownerAccountUsername));
}

function syncOwnerAdminAccess() {
  const allowed = isOwnerAccount();
  document.querySelectorAll("[data-owner-admin]").forEach(link => {
    link.hidden = !allowed;
    link.setAttribute?.("aria-hidden", allowed ? "false" : "true");
    if (allowed) link.removeAttribute?.("tabindex");
    else link.setAttribute?.("tabindex", "-1");
  });
}

function clearClientProfile() {
  window.google?.accounts?.id?.disableAutoSelect();
  if (localStorage.removeItem) localStorage.removeItem("lovelyLocsClientProfile");
  else localStorage.setItem("lovelyLocsClientProfile", "");
  savedClientProfile = null;
  clientSettingsResult = null;
  syncOwnerAdminAccess();
  render(currentRoute());
}

function applyLogoSettings() {
  const settings = { ...defaultLogoSettings, ...logoSettings };
  const offsetX = ((Number(settings.x) || 50) - 50) * 0.36;
  const offsetY = ((Number(settings.y) || 50) - 50) * 0.36;
  const activeLogoUrl = currentLogoUrl(settings);
  if (!document.documentElement?.style?.setProperty) return;
  document.documentElement.style.setProperty("--nav-logo-size", `${settings.navSize}px`);
  document.documentElement.style.setProperty("--hero-logo-size", `${settings.heroSize}px`);
  document.documentElement.style.setProperty("--logo-fit", settings.fit);
  document.documentElement.style.setProperty("--logo-position", `${settings.x}% ${settings.y}%`);
  document.documentElement.style.setProperty("--logo-offset-x", `${offsetX}%`);
  document.documentElement.style.setProperty("--logo-offset-y", `${offsetY}%`);
  document.documentElement.style.setProperty("--logo-image-scale", settings.fit === "contain" ? "1" : "1.16");
  document.documentElement.style.setProperty("--hero-logo-margin-inline", settings.heroAlign === "center" ? "auto" : settings.heroAlign === "right" ? "auto 0" : "0 auto");
  document.querySelectorAll("[data-brand-logo], [data-site-logo], [data-admin-logo-preview]").forEach(image => {
    if (image.getAttribute("src") !== activeLogoUrl) image.setAttribute("src", activeLogoUrl);
  });
  document.querySelector("link[rel='icon']")?.setAttribute("href", activeLogoUrl);
}

async function fetchLogoSettings() {
  try {
    const response = await fetch("/api/site-settings");
    const result = await response.json();
    if (result.ok && result.settings?.logo) {
      saveLogoSettingsLocal(result.settings.logo);
    }
    if (result.ok && result.settings?.discount) {
      saveDiscountSettingsLocal(result.settings.discount);
    }
  } catch {
    applyLogoSettings();
  }
}

let cart = loadCart();
let selectedService = cart.find(item => item.type === "service") || null;
let pendingAnchor = null;
let pendingAdvisoryService = null;
let pendingProductService = null;
let pendingPartingService = null;
let activeProductShelf = "All";
let activeGuideId = "new-locs";
let serviceQuizAnswers = { stage: "starter", timing: "fresh" };
let bookingDraft = loadBookingDraft();
let bookingSlotState = {
  date: bookingDraft?.date || "",
  time: bookingDraft?.time || "",
  type: bookingDraft?.emergencySlot ? "emergency" : "",
  reason: ""
};
let logoSettings = loadLogoSettings();
let discountSettings = loadDiscountSettings();
let appliedDiscount = loadAppliedDiscount();
let savedClientProfile = loadClientProfile();
let advisoryMessage = "";
let baseProductMessage = "";
let partingMessage = "";
let bookingConfirmation = null;
let clientSettingsResult = null;
let lastRoute = null;
let googleAuthConfig = null;
let googleAuthLoadAttempts = 0;
let googleSignupCredential = "";
let googleSignupState = null;
let ownerAdminAccessNotice = "";

const app = document.getElementById("app");
const drawer = document.getElementById("drawer");

const friendTestCheckpoints = [
  { id: "home", label: "Home" },
  { id: "services", label: "Services" },
  { id: "products", label: "Products" },
  { id: "policies", label: "Policies & FAQ" },
  { id: "contact", label: "Contact" },
  { id: "privacy", label: "Privacy" },
  { id: "sms-opt-in", label: "SMS Opt-In" },
  { id: "terms", label: "Terms" }
];

function normalizeFriendTestCode(value = "") {
  const clean = String(value).trim().toUpperCase();
  return /^LL-FRIEND-(0[1-9]|10)$/.test(clean) ? clean : "";
}

function loadFriendTestState() {
  const inviteCode = normalizeFriendTestCode(new URLSearchParams(window.location.search || "").get("friend-test"));
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem("lovelyLocsFriendTest") || "null");
  } catch {
    stored = null;
  }
  const storedCode = normalizeFriendTestCode(stored?.code);
  const code = inviteCode || storedCode;
  if (!code) return null;
  const visited = Array.isArray(stored?.visited)
    ? [...new Set(stored.visited.filter(id => friendTestCheckpoints.some(checkpoint => checkpoint.id === id)))]
    : [];
  const state = {
    code,
    startedAt: storedCode === code && stored?.startedAt ? stored.startedAt : new Date().toISOString(),
    visited
  };
  localStorage.setItem("lovelyLocsFriendTest", JSON.stringify(state));
  return state;
}

let friendTestState = loadFriendTestState();

function saveFriendTestState() {
  if (friendTestState) localStorage.setItem("lovelyLocsFriendTest", JSON.stringify(friendTestState));
}

function markFriendTestCheckpoint(route) {
  if (!friendTestState) return;
  const hash = String(window.location.hash || "").replace("#", "").split("?")[0];
  const checkpoint = route === "home" && hash === "services" ? "services" : route;
  if (!friendTestCheckpoints.some(item => item.id === checkpoint)) return;
  if (!friendTestState.visited.includes(checkpoint)) {
    friendTestState.visited.push(checkpoint);
    saveFriendTestState();
  }
}

function friendTestSnapshot(bookingSubmitted = false) {
  if (!friendTestState) return null;
  const visited = friendTestCheckpoints
    .map(checkpoint => checkpoint.id)
    .filter(id => friendTestState.visited.includes(id));
  const missing = friendTestCheckpoints
    .filter(checkpoint => !visited.includes(checkpoint.id))
    .map(checkpoint => checkpoint.label);
  return {
    code: friendTestState.code,
    startedAt: friendTestState.startedAt,
    visited,
    completedCheckpoints: visited.length,
    totalCheckpoints: friendTestCheckpoints.length,
    percentComplete: Math.round((visited.length / friendTestCheckpoints.length) * 100),
    complete: missing.length === 0,
    missing,
    bookingSubmitted
  };
}

function friendTestThankYouMarkup(test) {
  if (!test?.code) return "";
  const complete = Boolean(test.complete);
  const completed = Number(test.completedCheckpoints || 0);
  const total = Number(test.totalCheckpoints || friendTestCheckpoints.length);
  const testerNumber = Number(test.slot || 0);
  const testerLabel = testerNumber ? ` You are tester ${testerNumber} of 10.` : "";
  return `
    <div class="friend-test-finish ${complete ? "complete" : ""}">
      <p class="eyebrow">Friends Website Test</p>
      <h2>Thank you for testing the Lovely Locs booking service for me.</h2>
      <p>Your full appointment request went through successfully.${testerLabel} Your honest feedback will help make the website easier and clearer for future clients.</p>
      ${complete
        ? `<p><strong>You also found the Golden Loc.</strong> You made it through all ${total} website checkpoints.</p>`
        : completed ? `<p>You explored ${completed} of ${total} website checkpoints during your test.</p>` : ""}
      <p class="friend-test-code">Tester code: <strong>${escapeAttr(test.code)}</strong></p>
    </div>
  `;
}

function money(value) {
  return `$${Number(value).toFixed(0)}`;
}

function cartSubtotal(items = cart) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

function discountAmountForTotal(total, discount = appliedDiscount) {
  if (!discount?.code || !Number(discount.percent)) return 0;
  return Math.min(total, Math.max(0, Math.round(total * Number(discount.percent) / 100)));
}

function discountedCartTotal(items = cart, discount = appliedDiscount) {
  const subtotal = cartSubtotal(items);
  return Math.max(0, subtotal - discountAmountForTotal(subtotal, discount));
}

function discountExpiryText(discount = appliedDiscount) {
  return discount?.expiresAt ? `Expires ${discount.expiresAt}` : "No expiration date shown";
}

function appliedDiscountCodeLabel() {
  return appliedDiscount?.code || discountSettings?.code || "Promo";
}

function isAdminTestBooking(items = cart) {
  return items.length === 1 && items[0]?.id === adminTestService.id;
}

function bookingDeposit(total, items = cart) {
  if (isAdminTestBooking(items)) return 0;
  return items.length ? Math.max(Math.round(total * 0.3), 30) : 30;
}

function serviceDetails(service) {
  if (service.category === "loc-maintenance") return ["Wash prep encouraged", "Retwist care", "Style included when noted"];
  if (service.category === "starter-locs") return ["Parting plan", "Starter method", "Aftercare guidance"];
  if (service.category === "instant-crochet") return ["Crochet needle work", "Longer appointment", "Loc shaping"];
  return ["Add-on service", "Book with main service", "Custom notes welcome"];
}

function serviceCard(service) {
  const added = cart.some(item => item.id === service.id);
  return `
    <article class="service-card card">
      <div class="service-top">
        <h4>${service.name}</h4>
        <span class="price">${money(service.price)}</span>
      </div>
      <div class="service-meta"><span>${service.duration}</span><span>${service.category.replace(/-/g, " ")}</span></div>
      <p class="description">${service.description}</p>
      <div class="detail-chips">
        ${serviceDetails(service).map(detail => `<span>${detail}</span>`).join("")}
      </div>
      <button class="book-small ${added ? "added" : ""}" data-add-service="${service.id}">
        ${added ? "Selected" : "Add Service"}
      </button>
    </article>
  `;
}

function advisoryModal() {
  return `
    <div class="modal advisory-modal" id="advisoryModal">
      <div class="modal-panel advisory-panel">
        <div class="modal-head">
          <div>
            <h2>Quick Service Check</h2>
            <p class="duration">This helps reserve the right amount of time for your hair.</p>
          </div>
          <button class="modal-close" data-close-advisory>x</button>
        </div>
        <div class="advisory-box">
          <p class="eyebrow">Before selecting Adult Retwist</p>
          <h3>When was your last retwist?</h3>
          <p>If it has been longer than 3 months, your appointment usually needs more time for separation, cleanup, and a full maintenance finish.</p>
          <div class="advisory-actions">
            <button class="primary-btn" data-retwist-answer="standard">2-3 months</button>
            <button class="outline-btn" data-retwist-answer="overdue">4+ months</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function productPreferenceModal() {
  return `
    <div class="modal advisory-modal" id="productPreferenceModal">
      <div class="modal-panel advisory-panel">
        <div class="modal-head">
          <div>
            <h2>Base Product Preference</h2>
            <p class="duration">Choose what you prefer for your maintenance service.</p>
          </div>
          <button class="modal-close" data-close-product-preference>x</button>
        </div>
        <div class="advisory-box">
          <p class="eyebrow">Maintenance Service Prep</p>
          <h3>Which base product would you prefer?</h3>
          <p>Your preference helps Lovely Locs prepare the right finish for your scalp, hair texture, and style goals.</p>
          <div class="advisory-actions product-actions">
            <button class="primary-btn" data-product-preference="Oil and Water">Oil and Water</button>
            <button class="outline-btn" data-product-preference="Foam">Foam</button>
            <button class="outline-btn" data-product-preference="Gel">Gel</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function partingPreferenceModal() {
  return `
    <div class="modal advisory-modal" id="partingPreferenceModal">
      <div class="modal-panel advisory-panel">
        <div class="modal-head">
          <div>
            <h2>Parting Preference</h2>
            <p class="duration">Choose the parting pattern you want for your starter locs.</p>
          </div>
          <button class="modal-close" data-close-parting-preference>x</button>
        </div>
        <div class="advisory-box">
          <p class="eyebrow">Starter Loc Setup</p>
          <h3>What parting style do you prefer?</h3>
          <p>Brick layered and natural C parts keep your listed starter loc price. Triangle parts require extra sectioning detail and add $40.</p>
          <div class="advisory-actions product-actions">
            <button class="primary-btn" data-parting-preference="Brick Layered Parts" data-parting-fee="0">Brick Layered Parts</button>
            <button class="outline-btn" data-parting-preference="Natural C Parts" data-parting-fee="0">Natural C Parts</button>
            <button class="outline-btn" data-parting-preference="Triangle Parts" data-parting-fee="40">Triangle Parts (+$40)</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function servicesSection() {
  return `
    <section id="services" class="section tint">
      <div class="container">
        <h2 class="section-title">Service Menu</h2>
        <p class="section-subtitle">Choose from our range of professional loc care services</p>
        <div class="services-layout">
          <aside class="category-nav">
            ${categories.map((category, index) => `<button class="${index === 0 ? "active" : ""}" data-scroll="${category.id}">${category.label}</button>`).join("")}
          </aside>
          <div>
            ${categories.map(category => {
              const items = services.filter(service => service.category === category.id);
              return `
                <section class="service-group" id="${category.id}">
                  <div class="group-title"><span>${category.icon}</span><h3>${category.label}</h3></div>
                  <div class="service-grid">${items.map(serviceCard).join("")}</div>
                </section>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function homePage() {
  return `
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-copy">
          <div class="hero-logo"><img data-site-logo src="${escapeAttr(currentLogoUrl())}" alt="Lovely Locs Logo"></div>
          <h1>Lovely Locs</h1>
          <p class="subtitle">Private loc care with clear prices, honest service guidance, and a calm studio experience.</p>
          <div class="intro-copy">
            <p>Lovely Locs helps you choose the service your hair actually needs before you book, so your appointment has the right time, price, and care plan.</p>
            <p class="strong">Healthy locs first. Pretty finish always.</p>
          </div>
          <div class="button-row">
            <button class="primary-btn" data-view-services>Book Your Appointment</button>
            <a class="outline-btn" href="#services">View Services</a>
          </div>
        </div>
        <div class="hero-proof">
          <div class="proof-card main-proof">
            <span>Booking Standard</span>
            <strong>Right service, right timing, no rushed appointments.</strong>
            <p>Retwist clients get a quick fit check so overdue maintenance is booked with the correct service window.</p>
          </div>
        </div>
      </div>
      <div class="trust-row">
        <span>Private studio</span>
        <span>Transparent deposits</span>
        <span>Evening appointments</span>
      </div>
    </section>
    ${featuredServicesSection()}
    ${serviceGuideSection()}
    ${servicesSection()}
    ${referralShareSection()}
    ${bookingPrepSection()}
    ${firstTimeClientSection()}
    ${portfolioSection()}
    ${testimonialsSection()}
    ${processSection()}
    <section class="section">
      <div class="narrow">
        <h2 class="section-title">Business Hours</h2>
        <p class="section-subtitle">Evening appointments in our private in-home studio.</p>
        <div class="hours-grid">
          ${hours.map(([day, time, open]) => `<div class="card hour-card ${open ? "" : "closed"}"><h4>${day}</h4><p>${time}</p></div>`).join("")}
        </div>
      </div>
    </section>
    <section class="section white">
      <div class="narrow">
        <h2 class="section-title">About Lovely Locs</h2>
        <div class="about-box">
          <p>Lovely Locs was built for clients who want their locs cared for with patience, neat technique, and a comfortable appointment experience. Every booking is handled in a private studio setting so your service gets focused attention from start to finish.</p>
          <p>Use the booking notes to share your retwist product preference, style ideas, loc concerns, or questions. If you are new to locs or unsure which service fits, start with a consultation.</p>
          <p class="contact-line">${business.email}</p>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="narrow">
        <div class="studio-box">
          <h3>In-Home Studio - By Appointment Only</h3>
          <p>All appointments are held at our ${business.studio} in the ${business.area}.</p>
          <p><em>Studio address will be shared after your booking is confirmed.</em></p>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="narrow center">
        <h2 class="section-title">Ready to begin your loc journey?</h2>
        <div class="button-row">
          <button class="primary-btn" data-view-services>Book Your Appointment</button>
          <a class="outline-btn" href="#policies">View Policies &amp; FAQ</a>
        </div>
      </div>
    </section>
    ${cartMarkup()}
    ${bookingModal()}
    ${advisoryModal()}
    ${productPreferenceModal()}
    ${partingPreferenceModal()}
  `;
}

function referralShareSection() {
  return `
    <section class="section referral-section">
      <div class="container referral-card">
        <div>
          <p class="eyebrow">Referral Rewards</p>
          <h2>Good People Know Good People</h2>
          <p>Refer a friend. When they book, they receive the new client rate and you receive $15 off your next service.</p>
          <p>This rewards loyalty without discounting the Lovely Locs brand.</p>
          <p><a href="#client-settings" data-route="client-settings">Open client settings</a> to get your personal referral code and track pending rewards.</p>
        </div>
        <div class="referral-actions">
          <button class="share-icon-btn" data-share-booking aria-label="Share booking link" title="Share booking link">
            <span class="ios-share-icon" aria-hidden="true"></span>
          </button>
          <button class="outline-btn" data-copy-booking>Copy Link</button>
          <p id="shareStatus" class="share-status" aria-live="polite"></p>
        </div>
      </div>
    </section>
  `;
}

function googleSignupFormMarkup() {
  if (!googleSignupState) return "";
  const saved = savedClientProfile?.email === googleSignupState.email ? savedClientProfile : {};
  return `
    <div class="policy-box google-signup-card">
      <p class="eyebrow">One-Time Setup</p>
      <h2>Create Your Lovely Locs Profile</h2>
      <p>Save a few details once so future bookings can be faster. Birthday and loc-journey length are optional and can support future rewards.</p>
      <form class="form-grid" id="googleSignupForm">
        <label>Full Name<input name="fullName" required autocomplete="name" value="${escapeAttr(saved.fullName || googleSignupState.fullName)}"></label>
        <label>Google Email<input name="email" type="email" readonly value="${escapeAttr(googleSignupState.email)}"></label>
        <label>Phone Number<input name="phone" required autocomplete="tel" placeholder="(555) 123-4567" value="${escapeAttr(saved.phone)}"></label>
        <label>Birthday <span class="optional-label">(optional)</span><input name="birthday" type="date" autocomplete="bday" value="${escapeAttr(saved.birthday)}"></label>
        <label class="full">How long have you been on your loc journey? <span class="optional-label">(optional)</span>
          <select name="locJourneyLength">
            <option value="">Prefer not to answer</option>
            <option value="exploring" ${saved.locJourneyLength === "exploring" ? "selected" : ""}>Exploring or preparing to start</option>
            <option value="under_1_year" ${saved.locJourneyLength === "under_1_year" ? "selected" : ""}>Less than 1 year</option>
            <option value="1_to_3_years" ${saved.locJourneyLength === "1_to_3_years" ? "selected" : ""}>1 to 3 years</option>
            <option value="3_to_5_years" ${saved.locJourneyLength === "3_to_5_years" ? "selected" : ""}>3 to 5 years</option>
            <option value="5_plus_years" ${saved.locJourneyLength === "5_plus_years" ? "selected" : ""}>5 years or more</option>
          </select>
        </label>
        <label class="full policy-ack"><input name="profileConsent" type="checkbox" required><span>Save these details to my Lovely Locs client profile for future bookings and reward eligibility. I can clear the saved copy on this device at any time.</span></label>
        <p class="form-error" id="googleSignupStatus" aria-live="polite"></p>
        <button class="primary-btn" type="button" data-google-signup>Create My Profile</button>
      </form>
    </div>
  `;
}

function clientCreditLabel(type) {
  if (type === "birthday") return "Birthday";
  if (type === "returning") return "Returning Client";
  return "Referral";
}

function clientSettingsPastVisitsMarkup(result) {
  if (!result) return '<p>Sign in to see Past Visits, Book Again, Leave a Google Review, and Send Private Feedback.</p>';
  if (!result.pastVisits?.length) return '<p>No completed visits yet. Your first completed visit unlocks the returning client credit.</p>';
  return `
    <div class="past-visit-list">
      ${result.pastVisits.map(visit => {
        const services = visit.services?.length ? visit.services.join(", ") : "Lovely Locs service";
        const feedbackUrl = `mailto:${result.feedbackEmail || "lvlc.support@lovelylocsnc.com"}?subject=${encodeURIComponent(`Lovely Locs Private Feedback ${visit.bookingId}`)}`;
        return `
          <article class="past-visit-card">
            <div>
              <p class="eyebrow">Past Visit</p>
              <h3>${escapeAttr(visit.date || "Completed service")}</h3>
              <p>${escapeAttr(services)}</p>
              <p class="past-visit-meta">${escapeAttr(timeLabel(visit.time || "") || "")}${visit.total ? ` - Total ${money(visit.total)}` : ""}</p>
            </div>
            <div class="past-visit-actions">
              <a class="outline-btn" href="${escapeAttr(result.rebookUrl || "#services")}" data-route="services">Book Again</a>
              ${result.reviewUrl ? `<a class="outline-btn" href="${escapeAttr(result.reviewUrl)}" target="_blank" rel="noopener noreferrer">Leave a Google Review</a>` : ""}
              <a class="outline-btn" href="${escapeAttr(feedbackUrl)}">Send Private Feedback</a>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function clientSettingsPage() {
  const result = clientSettingsResult;
  const profile = savedClientProfile || result?.client || {};
  const creditRows = result?.credits?.length
    ? result.credits.map(credit => {
      const dates = credit.type === "birthday" && credit.validFrom && credit.expiresAt ? ` (${credit.validFrom} - ${credit.expiresAt})` : "";
      return `<li><strong>${clientCreditLabel(credit.type)} credit:</strong> ${money(credit.amountOff)} ${credit.status}${dates}</li>`;
    }).join("")
    : "<li>No earned credits yet.</li>";
  const pendingRows = result?.referrals?.pending?.length
    ? result.referrals.pending.map(item => `<li>${item.referredClientName}: pending until their deposit is accepted.</li>`).join("")
    : "<li>No pending referrals yet.</li>";
  const approvedRows = result?.referrals?.approved?.length
    ? result.referrals.approved.map(item => `<li>Referral approved for ${money(item.amountOff)} off.</li>`).join("")
    : "<li>No approved referrals yet.</li>";
  const returningCreditCopy = result?.incentives?.returningClientCopy || "Returning Client Credit: Get $5 off your next completed service after your first visit. No review required.";

  return `
    <section class="page-hero" id="client-settings-page">
      <div class="container">
        <p class="eyebrow">Client Settings</p>
        <h1>Review & Rebook Hub</h1>
        <p class="subtitle">Use the same email and phone number from your booking to see your referral code, Past Visits, and earned credits.</p>
      </div>
    </section>
    <section class="section">
      <div class="container admin-grid">
        ${ownerAdminAccessNotice ? `<div class="policy-box"><p class="promo-status">${ownerAdminAccessNotice}</p></div>` : ""}
        ${googleSignupFormMarkup()}
        <div class="policy-box">
          <h2>Look Up Your Settings</h2>
          ${savedClientProfile ? `<p class="promo-status success">Saved profile: ${escapeAttr(savedClientProfile.email || savedClientProfile.phone)}</p>` : ""}
          <form class="form-grid" id="clientSettingsForm">
            <label>Booking Email<input name="email" type="email" required placeholder="you@example.com" value="${escapeAttr(profile.email)}"></label>
            <label>Booking Phone<input name="phone" required placeholder="(555) 123-4567" value="${escapeAttr(profile.phone)}"></label>
            <p class="form-error" id="clientSettingsStatus" aria-live="polite"></p>
            <button class="primary-btn" type="button" data-client-settings-login>View Settings</button>
            ${savedClientProfile ? `<button class="outline-btn" type="button" data-clear-client-profile>Sign Out / Clear Saved Details</button>` : ""}
          </form>
        </div>
        <div class="policy-box">
          <h2>Easy Sign In</h2>
          ${savedClientProfile?.googleLinked ? `
            <div class="connected-google-account">
              <span>Connected Google Account</span>
              <strong>${escapeAttr(savedClientProfile.email)}</strong>
            </div>
            <p id="googleSignInStatus" class="form-error" aria-live="polite"></p>
            <button class="outline-btn" type="button" data-switch-google-account>Switch Google Account</button>
          ` : `
            <div id="googleSignInButton" class="google-sign-in"></div>
            <p id="googleSignInStatus" class="form-error" aria-live="polite">Loading Google sign-in...</p>
            <button class="outline-btn" type="button" data-switch-google-account>Use a Different Google Account</button>
          `}
          <p>Returning clients can sign in instantly. New clients will complete a short one-time profile before booking.</p>
        </div>
        ${savedClientProfile && cart.length ? `
          <div class="policy-box">
            <h2>Continue Your Booking</h2>
            <p>Your saved cart still has ${cart.length} ${cart.length === 1 ? "item" : "items"}. It stays there until you remove it.</p>
            <button class="primary-btn" type="button" data-resume-saved-cart>Return to My Cart</button>
          </div>
        ` : ""}
        <div class="policy-box">
          <h2>Returning Client Credit</h2>
          <p>${returningCreditCopy}</p>
          <p class="past-visit-meta">Reviews stay separate from this credit. Use the hub below to Book Again, Leave a Google Review, or Send Private Feedback.</p>
        </div>
        <div class="policy-box">
          <h2>Your Referral Code</h2>
          ${result ? `
            <p class="promo-status success">Code: <strong>${result.referralCode}</strong></p>
            <p>${result.shareUrl}</p>
            <button class="outline-btn" type="button" data-copy-client-referral>Copy Referral Link</button>
          ` : `<p>Enter your booking email and phone to see your code.</p>`}
        </div>
        <div class="policy-box">
          <h2>Referral Status</h2>
          <strong>Pending</strong>
          <ul>${pendingRows}</ul>
          <strong>Approved</strong>
          <ul>${approvedRows}</ul>
        </div>
        <div class="policy-box">
          <h2>Credits</h2>
          <ul>${creditRows}</ul>
        </div>
        <div class="policy-box past-visits-box">
          <h2>Past Visits</h2>
          ${clientSettingsPastVisitsMarkup(result)}
        </div>
      </div>
    </section>
  `;
}

function serviceGuideSection() {

  const activeGuide = serviceGuide.find(item => item.id === activeGuideId) || serviceGuide[0];
  const quizMatches = serviceQuizQuestions.map(question => {
    const selectedValue = serviceQuizAnswers[question.id];
    const selected = question.options.find(option => option.value === selectedValue) || question.options[0];
    return selected;
  });
  const highlighted = quizMatches.find(option => option.highlight)?.highlight;
  const suggestedServices = activeGuide.serviceIds
    .map(id => services.find(service => service.id === id))
    .filter(Boolean)
    .slice(0, 3);
  return `
    <section class="section guide-section">
      <div class="container">
        <div class="split-heading">
          <div>
            <p class="eyebrow">Quick Match</p>
            <h2 class="section-title left">Which Service Should I Book?</h2>
          </div>
          <p>Clients do not always know the service name. This guide helps them choose based on where they are in their loc journey.</p>
        </div>
        <div class="service-guide">
          <div class="guide-options">
            ${serviceGuide.map(item => `<button class="${activeGuide.id === item.id ? "active" : ""}" data-guide="${item.id}">${item.label}</button>`).join("")}
            <div class="guide-quiz-card">
              <p class="eyebrow">Mini Service Quiz</p>
              ${serviceQuizQuestions.map(question => `
                <div class="quiz-question">
                  <strong>${question.label}</strong>
                  <div class="quiz-options">
                    ${question.options.map(option => `<button class="${serviceQuizAnswers[question.id] === option.value ? "active" : ""}" data-quiz-question="${question.id}" data-quiz-value="${option.value}" data-quiz-guide="${option.guide}">${option.label}</button>`).join("")}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="guide-result" id="guideResult">
            <span>Recommended next step</span>
            <p>${activeGuide.recommendation}${highlighted ? ` Ask for ${highlighted} if that timing matches your hair.` : ""}</p>
            <div class="guide-service-list">
              ${suggestedServices.map(service => `
                <article>
                  <strong>${service.name}</strong>
                  <span>${service.duration} | ${money(service.price)}</span>
                  <button data-add-service="${service.id}">Add</button>
                </article>
              `).join("")}
            </div>
            <button class="primary-btn" data-view-services>View Matching Services</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function bookingPrepSection() {
  return `
    <section class="section prep-section">
      <div class="container">
        <div class="split-heading">
          <div>
            <p class="eyebrow">Booking Prep Checklist</p>
            <h2 class="section-title left">Bring the right details before you book.</h2>
          </div>
          <p>A little prep keeps your appointment request clear, especially for starter locs, overdue retwists, accessories, and payment verification.</p>
        </div>
        <div class="prep-grid">
          ${bookingPrepItems.map((item, index) => `
            <article class="prep-card">
              <span>${index + 1}</span>
              <h3>${item.title}</h3>
              <p>${item.copy}</p>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function featuredServicesSection() {
  const featured = services.filter(service => service.featured || ["adult-retwist", "consultation", "small-adult-starter"].includes(service.id)).slice(0, 4);
  return `
    <section class="section">
      <div class="container">
        <div class="split-heading">
          <div>
            <p class="eyebrow">Most Booked</p>
            <h2 class="section-title left">Start Here</h2>
          </div>
          <p>Not sure what to choose? These are the services most clients start with when they need maintenance, guidance, or a little extra detail.</p>
        </div>
        <div class="featured-grid">
          ${featured.map(service => `
            <article class="featured-card">
              <div>
                <span>${service.category.replace(/-/g, " ")}</span>
                <h3>${service.name}</h3>
                <p>${service.description}</p>
              </div>
              <div class="featured-foot">
                <strong>${money(service.price)}</strong>
                <button data-add-service="${service.id}">Add Service</button>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function firstTimeClientSection() {
  return `
    <section class="section">
      <div class="container client-guide">
        <div class="guide-copy">
          <p class="eyebrow">First-Time Clients</p>
          <h2>Come Prepared, Leave Clear</h2>
          <p>If this is your first visit, send notes about your current loc stage, last retwist date, desired style, scalp sensitivities, and any inspiration photos you have. The more context you share, the easier it is to match the right service to your hair.</p>
          <button class="primary-btn" data-view-services>Start Booking</button>
        </div>
        <div class="guide-list">
          <div><strong>Bring inspiration</strong><span>Photos help clarify size, finish, and styling expectations.</span></div>
          <div><strong>Know your timeline</strong><span>Starter locs, overdue maintenance, and crochet work require more time.</span></div>
          <div><strong>Review policies</strong><span>Deposits, emergency fees, and studio details are handled before confirmation.</span></div>
        </div>
      </div>
    </section>
  `;
}

function portfolioSection() {
  return `
    <section class="section white" id="gallery">
      <div class="container">
        <h2 class="section-title">Service Focus</h2>
        <p class="section-subtitle">A quick look at the appointment types Lovely Locs currently books, from maintenance and starter locs to crochet work and accessories.</p>
        <div class="portfolio-grid">
          ${portfolioItems.map(item => `
            <article class="portfolio-tile ${item.tone}">
              <div>
                <span>${item.tag}</span>
                <h3>${item.title}</h3>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function testimonialsSection() {
  return `
    <section class="section">
      <div class="container">
        <h2 class="section-title">What To Expect</h2>
        <p class="section-subtitle">Helpful booking guidance should stay factual. This section explains the current Lovely Locs experience without inventing client reviews.</p>
        <div class="testimonial-grid">
          ${visitStandards.map(item => `
            <article class="testimonial-card">
              <p>${item.copy}</p>
              <div>
                <strong>${item.title}</strong>
                <span>${item.focus}</span>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function processSection() {
  const steps = [
    ["1", "Choose your service", "Pick the service that fits your current loc stage, from maintenance to starter locs and add-ons."],
    ["2", "Share your notes", "Tell us your product preference, style goal, timing needs, and anything important about your loc history."],
    ["3", "Pay from the options page", "Use Venmo or Apple Pay and include your booking ID so the deposit can be matched."],
    ["4", "Arrive relaxed", "The studio address is shared after confirmation, and your appointment is handled one-on-one."]
  ];
  return `
    <section class="section white">
      <div class="container">
        <h2 class="section-title">How Booking Works</h2>
        <p class="section-subtitle">A simple process so you know what to expect before you sit in the chair.</p>
        <div class="process-grid">
          ${steps.map(([number, title, copy]) => `
            <article class="process-card">
              <span>${number}</span>
              <h3>${title}</h3>
              <p>${copy}</p>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function policiesPage() {
  const standards = [
    ["Private", "Appointments are held at the Lovely Locs home studio by appointment only. The exact address is shared after booking is confirmed."],
    ["Clear", "Prices, add-ons, advisory changes, and deposit expectations are shown before checkout."],
    ["Guided", "Service questions help match your hair history to the correct appointment so time is not underbooked."],
    ["Prepared", "Client notes, product preferences, and parting preferences are reviewed before confirmation."],
    ["Unrushed", "Please do not schedule anything directly after your appointment. Lovely Locs gives each service the time it needs because quality loc work cannot be rushed."]
  ];
  return `
    <section class="hero route-page" id="policies-page">
      <h1>Policies &amp; FAQ</h1>
      <p class="subtitle">Everything you need to know before booking</p>
    </section>
    <section class="section">
      <div class="narrow policy-stack">
        <div class="policy-box">
          <h2>Lovely Locs Booking Standards</h2>
          <div class="policy-standard-grid">
            ${standards.map(([title, copy]) => `<div><strong>${title}</strong><p>${copy}</p></div>`).join("")}
          </div>
        </div>
        <div class="policy-box"><h2>Payment &amp; Deposit Policies</h2><p>${policies.deposit}</p><div class="studio-box"><strong>Payment Options:</strong><p>${policies.payment_options}</p></div></div>
        <div class="policy-box"><h2>Booking Rules</h2><p>${policies.booking_rules}</p><div class="studio-box"><strong>Emergency Fee:</strong><p>${policies.emergency_fee}</p></div></div>
        <div class="policy-box"><h2>Cancellation Policy</h2><p class="quote">"${policies.cancellation}"</p></div>
        <div class="policy-box">
          <h2>Frequently Asked Questions</h2>
          ${faq.map(item => `<div class="faq-item"><button>${item.question}</button><div class="faq-answer">${item.answer}</div></div>`).join("")}
        </div>
        ${contactCard()}
      </div>
    </section>
  `;
}

function productInitials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join("").toUpperCase();
}

function productsPage() {
  const visibleGroups = productShelfGroups.filter(group => activeProductShelf === "All" || group.name === activeProductShelf);
  return `
    <section class="hero route-page" id="products-page">
      <h1>Lovely Locs Product Shelf</h1>
      <p class="subtitle">Client-friendly hair care picks, loc jewels, and accessories</p>
    </section>
    <section class="section product-shelf-section">
      <div class="container">
        <div class="product-shelf-intro">
          <div>
            <p class="eyebrow">Recommended Hair Products</p>
            <h2>Simple products for cleaner, softer-feeling locs.</h2>
            <p>Lovely Locs favors lightweight products that rinse clean, support moisture, and avoid unnecessary buildup. These recommendations use real customer review signals from retailer or purchaser-review sources whenever possible.</p>
          </div>
          <div class="product-principles">
            ${productCarePrinciples.map(principle => `<span>${principle}</span>`).join("")}
          </div>
        </div>
        <div class="product-filter-row" aria-label="Product shelf filters">
          ${["All", ...productShelfGroups.map(group => group.name)].map(filter => `<button class="${activeProductShelf === filter ? "active" : ""}" data-product-filter="${filter}">${filter}</button>`).join("")}
        </div>
        <div class="stock-shortlist">
          <div class="split-heading">
            <div>
              <p class="eyebrow">Worth Stocking Soon</p>
              <h2 class="section-title left">Quality first, margin second.</h2>
            </div>
            <p>These are the product lanes I would consider adding to Lovely Locs first because they fit real client needs, have outside review signals, and can sell naturally after an appointment without making the brand feel discount-heavy.</p>
          </div>
          <div class="stock-grid">
            ${stockShortlist.map(item => `
              <article class="card stock-card">
                <span>${item.action}</span>
                <h3>${item.name}</h3>
                <p class="stock-role">${item.role}</p>
                <div><strong>Quality reason</strong><p>${item.quality}</p></div>
                <div><strong>Review signal</strong><p>${item.proof}</p></div>
                <div><strong>Profit potential</strong><p>${item.margin}</p></div>
              </article>
            `).join("")}
          </div>
        </div>
        <div class="product-shelf-stack">
          ${visibleGroups.map(group => `
            <div class="product-shelf-group">
              <div class="group-title product-group-title">
                <span>${group.name === "Cleanse" ? "Wash" : group.name === "Hydrate" ? "Mist" : group.name === "Retwist" ? "Hold" : "Care"}</span>
                <h3>${group.name}</h3>
              </div>
              <p class="product-group-summary">${group.summary}</p>
              <div class="recommended-products-grid">
                ${recommendedHairProducts.filter(product => product.shelf === group.name).map(product => `
                  <article class="card product-card recommended-product-card">
                    <div class="product-visual ${product.shelf.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">
                      <span>${productInitials(product.name)}</span>
                      <small>${product.shelf}</small>
                    </div>
                    <div class="product-card-head">
                      <p class="product-type">${product.category}</p>
                      <a class="source-link" href="${product.url}" target="_blank" rel="noopener">Review source</a>
                    </div>
                    <h4>${product.name}</h4>
                    <p>${product.note}</p>
                    <div class="product-detail">
                      <strong>Best for</strong>
                      <span>${product.bestFor}</span>
                    </div>
                    <div class="product-detail review-proof">
                      <strong>Review proof</strong>
                      <span>${product.review}</span>
                    </div>
                  </article>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>
        <div class="product-consult-strip">
          <p><strong>Not sure what to buy?</strong> Bring your current routine or product questions to your appointment notes so Lovely Locs can help you keep it simple.</p>
          <a class="outline-btn" href="#services" data-route="home">Book with product notes</a>
        </div>
        <p class="product-disclaimer">Patch test new products first. Ingredients, prices, availability, and reviews can change, so check the current product page before purchasing.</p>
      </div>
    </section>
    <section class="section accessories-section">
      <div class="container">
        <div class="split-heading">
          <div>
            <p class="eyebrow">Loc Jewels &amp; Accessories</p>
            <h2 class="section-title left">Finish the style with shine.</h2>
          </div>
          <p>Add sparkle and personality to your locs with premium sprinkles, shimmer, charms, and custom accessory colors.</p>
        </div>
        <div class="products-grid">
          ${products.map(product => `
            <article class="card product-card accessory-card">
              <h3>${product.name}</h3>
              <p>${product.description}</p>
              <p class="price">${money(product.price)}</p>
              <button class="book-small ${cart.some(item => item.id === `product-${product.name}`) ? "added" : ""}" data-add-product="${product.name}">
                ${cart.some(item => item.id === `product-${product.name}`) ? "Added" : "Add to Cart"}
              </button>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
    ${cartMarkup()}
    ${bookingModal()}
  `;
}

function privacyPage() {
  return `
    <section class="hero route-page" id="privacy-page">
      <h1>Privacy Policy</h1>
      <p class="subtitle">How Lovely Locs handles booking, contact, and SMS information.</p>
    </section>
    <section class="section">
      <div class="narrow legal-stack">
        <div class="policy-box">
          <p class="eyebrow">Effective Date</p>
          <h2>Lovely Locs Privacy Policy</h2>
          <p>This Privacy Policy explains how Lovely Locs collects, uses, and protects information provided through this booking website, appointment forms, text messages, emails, and direct client communication.</p>
        </div>
        <div class="policy-box">
          <h2>Information We Collect</h2>
          <p>Lovely Locs may collect your name, email address, phone number, preferred appointment date, selected services, product or parting preferences, special requests, referral notes, opt-in status, and message history related to your appointment.</p>
        </div>
        <div class="policy-box">
          <h2>How We Use Information</h2>
          <p>Your information is used to process appointment requests, confirm booking details, send booking-related service updates, answer questions, manage referrals, and maintain client records.</p>
          <p>Referral rewards are not guaranteed and may vary based on availability, eligibility, timing, and active campaign rules.</p>
        </div>
        <div class="policy-box">
          <h2>SMS Privacy &amp; Consent</h2>
          <p>By choosing to receive texts from Lovely Locs, you consent to receive booking-related text messages, including appointment confirmations, deposit/payment updates, appointment reminders, and service-related updates. Message frequency varies. Message and data rates may apply. Reply STOP to opt out and HELP for help.</p>
          <p><strong>Lovely Locs does not sell, rent, or share SMS opt-in data, phone numbers, or text messaging consent with third parties for their own marketing or promotional purposes.</strong></p>
        </div>
        <div class="policy-box">
          <h2>Opt-Out &amp; Help</h2>
          <p>You can opt out of SMS messages at any time by replying STOP. You can request help by replying HELP. After opting out, you may receive one final message confirming your opt-out.</p>
        </div>
        <div class="policy-box">
          <h2>Service Providers</h2>
          <p>Lovely Locs may use trusted service providers, such as SMS, email, hosting, booking, or payment processors, only as needed to operate the booking process and client communication. These providers are not authorized to use your information for their own unrelated marketing.</p>
        </div>
        <div class="policy-box">
          <h2>Data Care</h2>
          <p>Lovely Locs keeps client information only as long as reasonably needed for booking, client care, business records, legal compliance, and dispute prevention. No online system is perfect, but Lovely Locs takes reasonable steps to protect booking and contact information.</p>
        </div>
        <div class="policy-box">
          <h2>Contact</h2>
          <p>Questions about this Privacy Policy can be sent to <a href="mailto:${business.email}">${business.email}</a> or by contacting Lovely Locs at ${business.phone}.</p>
        </div>
      </div>
    </section>
    ${cartMarkup()}
    ${bookingModal()}
  `;
}

function termsPage() {
  return `
    <section class="hero route-page" id="terms-page">
      <h1>Terms &amp; Conditions</h1>
      <p class="subtitle">Booking, payment, cancellation, and SMS terms for Lovely Locs clients.</p>
    </section>
    <section class="section">
      <div class="narrow legal-stack">
        <div class="policy-box">
          <p class="eyebrow">Effective Date</p>
          <h2>Lovely Locs Terms &amp; Conditions</h2>
          <p>By submitting an appointment request, using this website, or opting in to Lovely Locs messages, you agree to these Terms &amp; Conditions and the Lovely Locs Privacy Policy.</p>
        </div>
        <div class="policy-box">
          <h2>Appointment Requests</h2>
          <p>Submitting a request reserves the selected open time after the required deposit is verified. Emergency proposal slots may require an owner follow-up because they fall outside regular business hours, on Sundays, or on holiday/key dates.</p>
        </div>
        <div class="policy-box">
          <h2>Deposits, Payments &amp; Cancellations</h2>
          <p>${policies.deposit}</p>
          <p>${policies.cancellation}</p>
          <p>${policies.emergency_fee}</p>
        </div>
        <div class="policy-box">
          <h2>Client Accuracy &amp; Service Fit</h2>
          <p>Clients are responsible for providing accurate hair history, timing, contact information, preferred dates, product preferences, and service notes. Please disclose scalp irritation, open areas, allergies, sensitivities, recent chemical services, product buildup, tension concerns, or anything that may affect whether a loc service is appropriate.</p>
          <p>Lovely Locs provides listed natural-hair and loc grooming/styling services only. Lovely Locs does not provide medical care, scalp diagnosis, chemical services, cutting, coloring, relaxing, or any service outside the listed appointment scope unless it is separately confirmed and legally available. Lovely Locs may adjust, postpone, decline, or refer out a service if the selected booking does not match the condition, timing, safety, or needs of the client's hair/scalp.</p>
        </div>
        <div class="policy-box">
          <h2>Timing, Results &amp; Client Readiness</h2>
          <p>Service times are estimates. Clients should not schedule anything directly after the appointment because detailed loc work can take longer than expected and quality work cannot be rushed.</p>
          <p>Results vary by hair history, density, length, product buildup, maintenance routine, scalp condition, and the service selected. Lovely Locs will use care and clear communication, but no style, parting, timing, longevity, repair, or transformation result is guaranteed.</p>
        </div>
        <div class="policy-box">
          <h2>SMS Terms</h2>
          <p>By checking the optional SMS consent box, you agree to receive Lovely Locs text messages about your booking, including appointment confirmations, deposit/payment updates, appointment reminders, and service-related updates. Message frequency varies. Message and data rates may apply.</p>
          <p>Reply STOP to opt out of texts. Reply HELP for help. Opting out may limit text-based updates, but you may still contact Lovely Locs directly by email or other available methods.</p>
        </div>
        <div class="policy-box">
          <h2>Referral Rewards</h2>
          <p>Referral rewards are occasional opportunities only. They are not guaranteed for every client, service, booking, referral, or opt-in. Referral rules may vary based on availability, eligibility, timing, campaign rules, and Lovely Locs discretion.</p>
        </div>
        <div class="policy-box">
          <h2>Studio Policy</h2>
          <p>All appointments are held at the Lovely Locs private in-home studio by appointment only. The studio address is shared after booking is confirmed. Clients are expected to arrive on time, prepared, and respectful of the private studio environment.</p>
        </div>
        <div class="policy-box">
          <h2>Contact</h2>
          <p>Questions about these Terms can be sent to <a href="mailto:${business.email}">${business.email}</a> or by contacting Lovely Locs at ${business.phone}.</p>
        </div>
      </div>
    </section>
    ${cartMarkup()}
    ${bookingModal()}
  `;
}

function smsOptInPage() {
  return `
    <section class="hero route-page" id="sms-opt-in-page">
      <h1>SMS Opt-In</h1>
      <p class="subtitle">Text messaging is coming soon. You can provide consent now for future booking confirmations, payment updates, appointment reminders, and service-related text updates.</p>
    </section>
    <section class="section">
      <div class="narrow legal-stack">
        <div class="policy-box sms-optin-proof">
          <p class="eyebrow">Consent Form</p>
          <h2>Lovely Locs Text Message Opt-In <span class="coming-soon-badge">Coming Soon</span></h2>
          <p class="coming-soon-notice"><strong>Text service is not active yet.</strong> Email confirmations remain available while Lovely Locs completes carrier approval.</p>
          <p>Complete this form if you would like to receive booking-related text messages from Lovely Locs. Texts may include appointment confirmations, deposit/payment updates, appointment reminders, and service-related updates.</p>
          <form class="sms-optin-form">
            <label>Full Name<input name="smsOptInName" placeholder="Your name"></label>
            <label>Mobile Number<input name="smsOptInPhone" placeholder="(555) 123-4567"></label>
            <label class="full policy-ack sms-consent"><input name="smsConsent" type="checkbox"><span>I agree to receive text messages from Lovely Locs about my booking, including appointment confirmations, deposit/payment updates, appointment reminders, and service-related updates. Message and data rates may apply. Message frequency varies. Reply STOP to opt out and HELP for help. I agree to the <a href="#privacy" data-route="privacy">Privacy Policy</a> and <a href="#terms" data-route="terms">Terms &amp; Conditions</a>.</span></label>
            <button class="primary-btn" type="button" data-copy-optin-proof>Copy Opt-In Link</button>
          </form>
          <p class="duration">This opt-in checkbox is intentionally not preselected. Clients must choose it themselves.</p>
        </div>
        <div class="policy-box">
          <h2>For Twilio Proof of Consent</h2>
          <p>Use this page as the consent form URL for Lovely Locs. You can also screenshot this form showing the unchecked consent box and disclosures.</p>
          <p>Public opt-in URL: <strong>https://lovelylocsnc.com/#sms-opt-in</strong></p>
        </div>
      </div>
    </section>
    ${cartMarkup()}
    ${bookingModal()}
  `;
}

function contactCard() {
  return `
    <div class="contact-card">
      <p class="eyebrow">Talk locs with us</p>
      <h2>Questions, inspo pics, or not sure what to book?</h2>
      <p>Send a quick note and Lovely Locs will help you choose the service that fits your hair, timing, and style goals.</p>
      <div class="contact-actions">
        <a class="contact-pill" href="mailto:${business.email}">Email Lovely Locs</a>
        <a class="contact-pill" href="sms:${business.phone.replace(/[^0-9]/g, "")}">Text ${business.phone}</a>
      </div>
      <p class="contact-foot">${business.area} | In-home studio by appointment only</p>
    </div>
  `;
}

function contactPage() {
  return `
    <section class="hero contact-hero route-page" id="contact-page">
      <div class="contact-hero-copy">
        <p class="eyebrow">Lovely Locs Contact</p>
        <h1>Let us figure out the loc details together.</h1>
        <p class="subtitle">Send your questions, your timeline, or your inspo. Booking should feel clear before you ever sit in the chair.</p>
      </div>
    </section>
    <section class="section"><div class="narrow">${contactCard()}</div></section>
  `;
}

function pendingPaymentDetails() {
  const params = new URLSearchParams(window.location.search || "");
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem("lovelyLocsPendingPayment") || "{}");
  } catch {
    stored = {};
  }
  return {
    bookingId: params.get("booking") || stored.id || "Your booking ID",
    deposit: Number(params.get("deposit") || stored.deposit || 0),
    total: Number(stored.total || 0),
    fullName: stored.fullName || "",
    referralCode: stored.referralCode || "",
    referralShareUrl: stored.referralShareUrl || "",
    friendTest: stored.friendTest || null,
    paymentOptions: publicPaymentOptions(stored.paymentOptions)
  };
}

function paymentOptionsPage() {
  const details = pendingPaymentDetails();
  return `
    <section class="hero route-page" id="payment-options-page">
      <h1>Pay Your Lovely Locs Deposit</h1>
      <p class="subtitle">Your appointment is not finalized yet. Use Venmo or Apple Pay for the required deposit, then Lovely Locs will verify the receipt and send your official confirmation once the deposit is confirmed as received.</p>
    </section>
    <section class="section payment-options-section">
      <div class="container">
        ${friendTestThankYouMarkup(details.friendTest)}
        <div class="payment-summary-panel">
          <div>
            <p class="eyebrow">Deposit Step</p>
            <h2>${details.deposit ? money(details.deposit) : "Deposit amount shown after booking"}</h2>
            <p>Booking ID: <strong>${details.bookingId}</strong></p>
          </div>
          <p>Put the booking ID in the payment note when your payment app allows it. Lovely Locs will check the matching receipt before sending the official client confirmation.</p>
        </div>
        <div class="payment-options-grid">
          ${details.paymentOptions.map(option => `
            <article class="payment-option-card">
              <span>${option.label}</span>
              <h3>${option.handle}</h3>
              <p>${option.note}</p>
            </article>
          `).join("")}
        </div>
        <div class="payment-proof-box">
          <strong>Confirmation timing</strong>
          <p>This page is not the final appointment confirmation. Your confirmation message is sent only after Lovely Locs confirms the deposit receipt in Gmail. Emergency proposals may receive a follow-up if the proposed time needs owner approval.</p>
        </div>
        ${personalReferralCard({
          fullName: details.fullName,
          code: details.referralCode,
          shareUrl: details.referralShareUrl
        })}
      </div>
    </section>
    ${cartMarkup()}
    ${bookingModal()}
  `;
}

function paymentSuccessPage() {
  return `
    <section class="hero route-page" id="payment-success-page">
      <h1>Deposit Received</h1>
      <p class="subtitle">Thank you. Your deposit was received and your selected appointment time is held.</p>
    </section>
    <section class="section">
      <div class="narrow policy-stack">
        <div class="policy-box">
          <p class="eyebrow">Next Step</p>
          <h2>Lovely Locs will hold your selected time.</h2>
          <p>Your appointment is held after Lovely Locs verifies your deposit and sends final confirmation. Emergency proposals may receive a follow-up if the selected time needs owner approval. Keep your payment receipt for your records.</p>
        </div>
        ${contactCard()}
      </div>
    </section>
  `;
}

function manualDepositConfirmParams() {
  const params = new URLSearchParams(window.location.search || "");
  const booking = String(params.get("booking") || "").trim();
  const method = String(params.get("method") || "manual").trim();
  const token = String(params.get("token") || "").trim();
  const active = currentRoute() === "admin-confirm-deposit" || Boolean(booking || token);
  return { active, booking, method, token };
}

function adminPage() {
  const alreadyAdded = cart.some(item => item.id === adminTestService.id);
  const settings = { ...defaultLogoSettings, ...logoSettings };
  const activeLogoUrl = currentLogoUrl(settings);
  const logoUrlInputValue = activeLogoUrl.startsWith("data:image/") ? "" : activeLogoUrl;
  const uploadedLogoNote = activeLogoUrl.startsWith("data:image/")
    ? `<span class="field-note" data-logo-upload-note>Uploaded image is selected. Save settings to keep it for the live site.</span>`
    : `<span class="field-note" data-logo-upload-note>Paste an image URL or choose a PNG, JPG, WebP, or GIF from this device.</span>`;
  const discount = { ...defaultDiscountSettings, ...discountSettings };
  const confirmParams = manualDepositConfirmParams();
  const confirmNotice = confirmParams.active
    ? `<p class="advisory-copy">Owner confirm link loaded. Review the matching Venmo or Apple Pay receipt, then press the confirmation button below. If the token field is blank, enter your owner confirmation token first.</p>`
    : "";
  const adminTitle = confirmParams.active ? "Owner Deposit Confirmation" : "Admin Test Booking";
  const adminSubtitle = confirmParams.active
    ? "Confirm a verified manual deposit, then send the client their official Lovely Locs confirmation."
    : "Run a no-charge booking test without sending the client to the pay options page.";
  const methodOptions = ["venmo", "apple-pay", "manual"].map(method => `
                <option value="${method}" ${confirmParams.method === method ? "selected" : ""}>${method === "apple-pay" ? "Apple Pay" : method === "venmo" ? "Venmo" : "Manual"}</option>
              `).join("");
  return `
    <section class="hero route-page" id="admin-page">
      <h1>${adminTitle}</h1>
      <p class="subtitle">${adminSubtitle}</p>
    </section>
    <section class="section">
      <div class="narrow policy-stack">
        <div class="policy-box">
          <p class="eyebrow">Owner Testing</p>
          <h2>Free testing service</h2>
          <p>Use this when you want to test the booking form, saved request, and confirmation message setup without collecting the normal non-refundable deposit.</p>
          <p>This service is hidden from the public service menu. Only use it for test client details.</p>
          <div class="service-card admin-test-card">
            <div class="service-top">
              <h4>${adminTestService.name}</h4>
              <span class="price">${money(adminTestService.price)}</span>
            </div>
            <div class="service-meta"><span>${adminTestService.duration}</span><span>No deposit</span></div>
            <p class="description">${adminTestService.description}</p>
            <button class="book-small ${alreadyAdded ? "added" : ""}" data-add-admin-test>
              ${alreadyAdded ? "Test Service Selected" : "Add Free Test Booking"}
            </button>
          </div>
        </div>
        <div class="policy-box">
          <h2>How to use it</h2>
          <p>Add the free test booking, open the cart, then finalize like a normal client. The submit button will say "Submit No-Charge Test Booking" and no payment portal should open.</p>
        </div>
        <div class="policy-box brand-settings-box" id="manual-deposit-confirm-panel">
          <p class="eyebrow">Launch Readiness</p>
          <h2>Notification Status</h2>
          <p>Check this before launch. The email sender and signed delivery tracking should both show ready.</p>
          <div class="readiness-list" id="adminNotificationStatus">
            <p>Loading notification status...</p>
          </div>
          <button class="outline-btn" type="button" data-refresh-notification-status>Refresh Status</button>
        </div>
        <div class="policy-box brand-settings-box">
          <p class="eyebrow">Manual Deposits</p>
          <h2>Confirm a Client Deposit</h2>
          <p>After you verify the matching Venmo or Apple Pay receipt, enter the booking ID from the owner email or from the client's pay-options link after <strong>booking=</strong>. This marks the deposit paid and sends the client confirmation email.</p>
          <p>If the deposit was not received, use the release button instead. That keeps the booking history but opens the appointment time again.</p>
          ${confirmNotice}
          <form class="brand-settings-form" id="manualDepositConfirmForm">
            <label class="full">Admin Token<input name="token" type="password" placeholder="Manual deposit confirm token" autocomplete="current-password" value="${escapeAttr(confirmParams.token)}"></label>
            <label>Booking ID<input name="booking" placeholder="LL-1780438950711" value="${escapeAttr(confirmParams.booking)}"></label>
            <label>Payment Method
              <select name="method">
                ${methodOptions}
              </select>
            </label>
            <p class="form-error" id="manualDepositConfirmStatus" aria-live="polite"></p>
            <button class="primary-btn" type="button" data-confirm-manual-deposit>Confirm Deposit &amp; Send Client Confirmation</button>
            <button class="outline-btn" type="button" data-release-unpaid-hold>Deposit Not Received - Release Slot</button>
          </form>
        </div>
        <div class="policy-box brand-settings-box">
          <p class="eyebrow">Email Recovery</p>
          <h2>Resend Client Confirmation</h2>
          <p>Use this if the client did not receive their confirmation or their original booking record is unavailable. Enter the corrected email and appointment details. This sends email only and does not charge or confirm another deposit.</p>
          <form class="brand-settings-form" id="confirmationResendForm">
            <label class="full">Admin Token<input name="token" type="password" placeholder="Manual deposit confirm token" autocomplete="current-password"></label>
            <label>Booking ID<input name="bookingId" placeholder="LL-1781219564994"></label>
            <label>Client Email<input name="email" type="email" placeholder="client@example.com" required></label>
            <label>Client Name<input name="fullName" placeholder="Client name" required></label>
            <label>Appointment Date<input name="date" type="date" required></label>
            <label>Appointment Time<input name="time" type="time" required></label>
            <label>Deposit Paid<input name="deposit" type="number" min="0" step="1" value="0"></label>
            <label>Estimated Total<input name="total" type="number" min="0" step="1" value="0"></label>
            <p class="form-error" id="confirmationResendStatus" aria-live="polite"></p>
            <button class="primary-btn" type="button" data-resend-client-confirmation>Resend Client Confirmation Email</button>
          </form>
        </div>
        <div class="policy-box brand-settings-box">
          <p class="eyebrow">Notification Test</p>
          <h2>Send Notification Test</h2>
          <p>Use this before testing bookings. The app will show the real email or SMS provider result. SMS is skipped if the Twilio toll-free sender is not verified, so it will not keep spending credits on blocked texts.</p>
          <form class="brand-settings-form" id="notificationTestForm">
            <label class="full">Admin Token<input name="token" type="password" placeholder="Manual deposit confirm token" autocomplete="current-password"></label>
            <label>Email<input name="email" type="email" value="lvlc.support@lovelylocsnc.com"></label>
            <label>Phone<input name="phone" type="tel" value="3364711098"></label>
            <label>Channel
              <select name="channel">
                <option value="email">Email only</option>
                <option value="sms">SMS only</option>
                <option value="all">Email + SMS</option>
              </select>
            </label>
            <p class="form-error" id="notificationTestStatus" aria-live="polite"></p>
            <button class="primary-btn" type="button" data-send-notification-test>Send Test</button>
          </form>
        </div>
        <div class="policy-box brand-settings-box">
          <p class="eyebrow">Owner Branding</p>
          <h2>Logo size and centering</h2>
          <p>Use your private manual deposit token to save logo image, size, and placement adjustments. Changes apply to the live site after saving, but may reset after a Render restart until we add permanent database storage.</p>
          <div class="brand-preview">
            <div class="brand-preview-track">
              <div class="hero-logo admin-logo-preview"><img data-admin-logo-preview src="${escapeAttr(activeLogoUrl)}" alt="Lovely Locs Logo preview"></div>
            </div>
          </div>
          <form class="brand-settings-form" id="brandSettingsForm">
            <label class="full">Admin Token<input name="token" type="password" placeholder="Manual deposit confirm token" autocomplete="current-password"></label>
            <label class="full">Logo Image URL<input name="url" type="url" value="${escapeAttr(logoUrlInputValue)}" placeholder="https://.../logo.png"><span class="field-note">Use a public image URL for the cleanest saved logo change.</span></label>
            <label class="full">Upload Logo Image<input name="logoFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif">${uploadedLogoNote}</label>
            <label>Top Nav Logo Size <input name="navSize" type="range" min="28" max="72" value="${settings.navSize}"><span data-logo-value="navSize">${settings.navSize}px</span></label>
            <label>Hero Logo Size <input name="heroSize" type="range" min="56" max="180" value="${settings.heroSize}"><span data-logo-value="heroSize">${settings.heroSize}px</span></label>
            <label>Move Image Left/Right <input name="x" type="range" min="0" max="100" value="${settings.x}"><span data-logo-value="x">${settings.x}%</span></label>
            <label>Move Image Up/Down <input name="y" type="range" min="0" max="100" value="${settings.y}"><span data-logo-value="y">${settings.y}%</span></label>
            <div class="full brand-segment">
              <span>Hero alignment</span>
              <button type="button" class="${settings.heroAlign === "left" ? "active" : ""}" data-logo-align="left">Left</button>
              <button type="button" class="${settings.heroAlign === "center" ? "active" : ""}" data-logo-align="center">Center</button>
              <button type="button" class="${settings.heroAlign === "right" ? "active" : ""}" data-logo-align="right">Right</button>
            </div>
            <div class="full brand-segment">
              <span>Image fit</span>
              <button type="button" class="${settings.fit === "cover" ? "active" : ""}" data-logo-fit="cover">Fill circle</button>
              <button type="button" class="${settings.fit === "contain" ? "active" : ""}" data-logo-fit="contain">Show full logo</button>
            </div>
            <p class="form-error" id="brandSettingsStatus" aria-live="polite"></p>
            <button class="primary-btn" type="button" data-save-logo-settings>Save Logo Settings</button>
          </form>
        </div>
        <div class="policy-box brand-settings-box">
          <p class="eyebrow">Owner Promotions</p>
          <h2>Discount Code Settings</h2>
          <p>Use your private manual deposit token to save one active sale promo code. Clients can use the sale code on more than one separate booking before the deadline, but the server only applies one discount per booking.</p>
          <form class="brand-settings-form" id="discountSettingsForm">
            <label class="full">Admin Token<input name="token" type="password" placeholder="Manual deposit confirm token" autocomplete="current-password"></label>
            <label>Promo Code Spelling<input name="code" value="${discount.code}" maxlength="24" placeholder="LOVELY10"></label>
            <label>Discount Percent<input name="percent" type="number" min="0" max="100" value="${discount.percent}"></label>
            <label>Expiration Date<input name="expiresAt" type="date" value="${discount.expiresAt || ""}"></label>
            <label class="full toggle-line"><input name="enabled" type="checkbox" ${discount.enabled ? "checked" : ""}> Promo code is active</label>
            <p class="form-error" id="discountSettingsStatus" aria-live="polite"></p>
            <button class="primary-btn" type="button" data-save-discount-settings>Save Discount Code</button>
          </form>
        </div>
      </div>
    </section>
    ${cartMarkup()}
    ${bookingModal()}
  `;
}

function versionsPage() {
  const activeVersion = localStorage.getItem("visualVersion") || "v0";
  return `
    <section class="hero">
      <h1>Version History</h1>
      <p class="subtitle">Preview one week of visual changes and switch back whenever you want.</p>
    </section>
    <section class="section route-page" id="versions-page">
      <div class="container versions-layout">
        <div class="version-intro">
          <p class="eyebrow">Visual Rollback</p>
          <h2>Choose a Website Look</h2>
          <p>This does not change your service prices or booking content. It only lets you preview and keep different visual styles from the last 7 days of updates.</p>
          <button class="primary-btn" data-version="v0">Return To Current Look</button>
        </div>
        <div class="version-list">
          ${visualVersions.map(version => `
            <article class="version-card ${activeVersion === version.id ? "active" : ""}">
              <div>
                <span>${version.label}</span>
                <h3>${version.note}</h3>
              </div>
              <button data-version="${version.id}">${activeVersion === version.id ? "Active" : "Preview"}</button>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
    ${cartMarkup()}
    ${bookingModal()}
  `;
}

function cartMarkup() {
  const count = cart.length;
  const subtotal = cartSubtotal();
  const discountAmount = discountAmountForTotal(subtotal);
  const total = discountedCartTotal();
  const promoValue = appliedDiscount?.code || "";
  return `
    <button class="cart-button" id="cartButton">Cart ${count ? `(${count})` : ""}</button>
    <div class="cart" id="cart">
      <div class="cart-backdrop" data-close-cart></div>
      <aside class="cart-panel">
        <div class="cart-head"><span>Your Cart</span><button data-close-cart>x</button></div>
        <div class="cart-items">
          ${advisoryMessage ? `<div class="cart-advisory"><strong>Service updated</strong><p>${advisoryMessage}</p></div>` : ""}
          ${baseProductMessage ? `<div class="cart-advisory"><strong>Base product saved</strong><p>${baseProductMessage}</p></div>` : ""}
          ${partingMessage ? `<div class="cart-advisory"><strong>Parting preference saved</strong><p>${partingMessage}</p></div>` : ""}
          ${cart.length ? cart.map(item => `
            <div class="cart-item">
              <div><strong>${item.name}</strong><p class="duration">${item.duration || "Accessory"}</p>${item.description ? `<p class="cart-item-description">${item.description}</p>` : ""}${item.baseProduct ? `<p class="duration">Base product: ${item.baseProduct}</p>` : ""}${item.partingPreference ? `<p class="duration">Parting: ${item.partingPreference}${item.partingFee ? ` (+${money(item.partingFee)})` : ""}</p>` : ""}<p>${money(item.price)}</p></div>
              <button class="modal-close" data-remove="${item.id}">x</button>
            </div>
          `).join("") : `<p class="section-subtitle">Your cart is empty.</p>`}
        </div>
        ${cart.length ? `
          <div class="promo-box">
            <label>Promo Code<input id="promoCodeInput" value="${promoValue}" placeholder="Enter promo code"></label>
            <div class="promo-actions">
              <button type="button" data-apply-promo>Apply</button>
              ${appliedDiscount ? `<button type="button" data-clear-promo>Clear</button>` : ""}
            </div>
            ${appliedDiscount ? `<p class="promo-status success">${appliedDiscount.code} applied: ${appliedDiscount.percent}% off. ${discountExpiryText(appliedDiscount)}.</p>` : `<p class="promo-status" id="promoStatus">Enter an active Lovely Locs promo code before booking.</p>`}
            <div class="promo-email-row">
              <label>Email Code For Later<input id="promoEmailInput" type="email" placeholder="you@example.com"></label>
              <button type="button" data-email-promo>Email Code</button>
            </div>
            <p class="promo-status" id="promoEmailStatus" aria-live="polite"></p>
          </div>
          <div class="cart-total">
            <div class="service-top"><strong>Subtotal</strong><strong>${money(subtotal)}</strong></div>
            ${discountAmount ? `<div class="service-top discount-total"><strong>Promo Discount</strong><strong>-${money(discountAmount)}</strong></div>` : ""}
            <div class="service-top"><strong>Total</strong><strong>${money(total)}</strong></div>
            <div class="cart-saved-details">
              <strong>${savedClientProfile ? "Your saved details are ready" : bookingDraft ? "Your checkout details are saved" : "Make future bookings faster"}</strong>
              <p>${bookingDraft ? "You can refresh or add another item without starting over." : "Use your booking email and phone to load or manage saved details."}</p>
              <button type="button" data-open-client-settings>${savedClientProfile ? "Manage saved details" : "Client sign in / saved details"}</button>
            </div>
            <button class="primary-btn" data-open-booking>Finalize Cart &amp; Enter Details</button>
          </div>
        ` : ""}
      </aside>
    </div>
  `;
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

function isHolidayDate(date) {
  return holidayDates.has(date);
}

function dayOfWeek(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getDay();
}

function localAvailability(date, bookedTimes = []) {
  const booked = new Set(bookedTimes);
  const holiday = isHolidayDate(date);
  const isSunday = dayOfWeek(date) === 0;
  const regularSlots = holiday || isSunday ? [] : regularAppointmentTimes.map(time => ({
    time,
    label: timeLabel(time),
    type: "standard",
    status: booked.has(time) ? "booked" : "open",
    note: "Open appointment time."
  }));
  const emergencySlots = emergencyProposalTimes.map(time => ({
    time,
    label: timeLabel(time),
    type: "emergency",
    status: booked.has(time) ? "booked" : "open",
    note: holiday ? "Holiday emergency proposal. $45 emergency fee applies." : isSunday ? "Sunday emergency proposal. $45 emergency fee applies." : "Outside business hours. $45 emergency fee applies."
  }));
  return { date, slots: [...regularSlots, ...emergencySlots] };
}

function slotPickerMarkup(profile = {}) {
  return `
    <div class="full time-slot-field">
      <label class="slot-label">Appointment Time</label>
      <input id="bookingTime" name="time" type="hidden" required value="${escapeAttr(profile.time)}">
      <input id="bookingEmergencySlot" name="emergencySlot" type="hidden" value="${profile.emergencySlot ? "true" : ""}">
      <div class="time-slot-legend">
        <span class="legend-open">Open</span>
        <span class="legend-emergency">Emergency proposal</span>
        <span class="legend-booked">Booked</span>
      </div>
      <div class="time-slot-grid" id="timeSlotGrid">
        <p class="time-slot-placeholder">Choose a date to see open appointment times.</p>
      </div>
      <p class="time-slot-note" id="timeSlotNote">Regular appointment times are shown with a purple outline. Emergency proposals are brown and include the $45 emergency fee.</p>
    </div>
  `;
}

function emergencyFeeItem() {
  const fee = services.find(item => item.id === "emergency-fee");
  return fee ? { ...fee, type: "service", autoEmergencyFee: true } : null;
}

function setEmergencyFeeForSlot(enabled) {
  const hasAutoFee = cart.some(item => item.id === "emergency-fee" && item.autoEmergencyFee);
  if (enabled && !cart.some(item => item.id === "emergency-fee")) {
    const fee = emergencyFeeItem();
    if (fee) cart.push(fee);
  }
  if (!enabled && hasAutoFee) {
    cart = cart.filter(item => !(item.id === "emergency-fee" && item.autoEmergencyFee));
  }
  saveCart();
  updateBookingSummaryTotals();
}

function updateBookingSummaryTotals() {
  const subtotal = cartSubtotal();
  const discountAmount = discountAmountForTotal(subtotal);
  const total = discountedCartTotal();
  const deposit = bookingDeposit(total, cart);
  const totalNode = document.getElementById("bookingTotalText");
  const depositNode = document.getElementById("bookingDepositText");
  const addOnsNode = document.getElementById("bookingAddOnsText");
  const discountNode = document.getElementById("bookingDiscountText");
  if (totalNode) totalNode.textContent = `Estimated Total: ${money(total)}`;
  if (discountNode) discountNode.textContent = discountAmount ? `Promo Discount (${appliedDiscountCodeLabel()}): -${money(discountAmount)}` : "";
  if (depositNode) depositNode.textContent = `Deposit Required Before Confirmation: ${money(deposit)}. Your appointment is not finalized until Lovely Locs confirms the deposit was received.`;
  if (addOnsNode) {
    const addOns = cart.filter(item => item.type !== "service" || item.id === "emergency-fee");
    addOnsNode.textContent = addOns.length ? `Add-ons / products: ${addOns.map(item => item.name).join(", ")}` : "";
  }
}

function renderTimeSlots(availability, preferredSlot = null) {
  const grid = document.getElementById("timeSlotGrid");
  const note = document.getElementById("timeSlotNote");
  const timeInput = document.getElementById("bookingTime");
  const emergencyInput = document.getElementById("bookingEmergencySlot");
  if (!grid) return;
  const restoredSlot = availability.slots.find(slot => (
    preferredSlot
    && preferredSlot.date === availability.date
    && preferredSlot.time === slot.time
    && slot.status !== "booked"
  ));
  grid.innerHTML = availability.slots.map(slot => `
    <button type="button" class="time-slot ${slot.type} ${slot.status} ${restoredSlot?.time === slot.time ? "selected" : ""}" data-time-slot="${slot.time}" data-slot-type="${slot.type}" data-slot-note="${slot.note}" aria-pressed="${restoredSlot?.time === slot.time ? "true" : "false"}" ${slot.status === "booked" ? "disabled" : ""}>
      <strong>${slot.label}</strong>
      <span>${slot.status === "booked" ? "Booked" : slot.type === "emergency" ? "Emergency +$45" : "Open"}</span>
    </button>
  `).join("");
  const restoredType = restoredSlot?.type || "";
  if (timeInput) timeInput.value = restoredSlot?.time || "";
  if (emergencyInput) emergencyInput.value = restoredType === "emergency" ? "true" : "";
  bookingSlotState = {
    date: availability.date,
    time: restoredSlot?.time || "",
    type: restoredType,
    reason: restoredSlot?.note || ""
  };
  setEmergencyFeeForSlot(restoredType === "emergency");
  if (note) {
    note.textContent = restoredSlot
      ? restoredType === "emergency"
        ? `${restoredSlot.note} This saved slot includes the Emergency Fee.`
        : "Your saved regular appointment time has been restored."
      : availability.holiday
        ? "Holiday/key dates are emergency proposals and include the $45 emergency fee."
        : "Choose a purple regular slot or a brown emergency proposal.";
  }
  bindTimeSlotButtons();
}

async function loadAvailabilityForDate(date, preferredSlot = null) {
  if (!date) return;
  const grid = document.getElementById("timeSlotGrid");
  if (grid) grid.innerHTML = `<p class="time-slot-placeholder">Loading open times...</p>`;
  try {
    const response = await fetch(`/api/availability?date=${encodeURIComponent(date)}`);
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "Availability could not be loaded.");
    renderTimeSlots(result, preferredSlot);
  } catch {
    renderTimeSlots(localAvailability(date), preferredSlot);
  }
}

function bindTimeSlotButtons() {
  document.querySelectorAll("[data-time-slot]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-time-slot]").forEach(item => {
        item.classList.remove("selected");
        item.setAttribute("aria-pressed", "false");
      });
      button.classList.add("selected");
      button.setAttribute("aria-pressed", "true");
      const time = button.dataset.timeSlot;
      const type = button.dataset.slotType;
      const note = button.dataset.slotNote || "";
      const timeInput = document.getElementById("bookingTime");
      const emergencyInput = document.getElementById("bookingEmergencySlot");
      const noteNode = document.getElementById("timeSlotNote");
      if (timeInput) timeInput.value = time;
      if (emergencyInput) emergencyInput.value = type === "emergency" ? "true" : "";
      bookingSlotState = { ...bookingSlotState, time, type, reason: note };
      setEmergencyFeeForSlot(type === "emergency");
      saveBookingDraft(document.getElementById("bookingForm"));
      if (noteNode) {
        noteNode.textContent = type === "emergency"
          ? `Selected: ${timeLabel(time)}. ${note} This adds the Emergency Fee to your total before the deposit is calculated.`
          : `Selected: ${timeLabel(time)}. This is a regular Lovely Locs evening appointment time.`;
      }
    });
  });
}

function bookingModal() {
  const selectedServices = cart.filter(item => item.type === "service");
  const addOns = cart.filter(item => item.type !== "service");
  const profile = { ...(savedClientProfile || {}), ...(bookingDraft || {}) };
  const subtotal = cartSubtotal();
  const discountAmount = discountAmountForTotal(subtotal);
  const total = discountedCartTotal();
  const deposit = bookingDeposit(total, cart);
  const adminTest = isAdminTestBooking(cart);
  const confirmationMarkup = bookingConfirmation ? `
        <div class="confirmation-panel">
          <strong>${adminTest ? "Test booking saved" : "Payment step ready"}</strong>
          <p>${bookingConfirmation.message}</p>
        </div>
  ` : "";
  return `
    <div class="modal" id="bookingModal">
      <div class="modal-panel">
        <div class="modal-head">
          <div><h2>Appointment Request</h2><p class="duration">Review your service and send your details</p></div>
          <button class="modal-close" data-close-booking>x</button>
        </div>
        <div class="progress"><div></div></div>
        <div class="modal-summary">
          <strong>Booking Summary</strong>
          ${advisoryMessage ? `<p class="advisory-copy">${advisoryMessage}</p>` : ""}
          ${baseProductMessage ? `<p class="advisory-copy">${baseProductMessage}</p>` : ""}
          ${partingMessage ? `<p class="advisory-copy">${partingMessage}</p>` : ""}
          ${selectedServices.length ? `<p>Services: ${selectedServices.map(item => item.name).join(", ")}</p>` : `<p>No service selected yet. Please choose from the service menu before submitting.</p>`}
          ${selectedServices.length ? `<p>Estimated Service Time: ${selectedServices.map(item => item.duration).join(" + ")}</p>` : ""}
          ${selectedServices.some(item => item.baseProduct) ? `<p>Base Product Preferences: ${selectedServices.filter(item => item.baseProduct).map(item => `${item.name} - ${item.baseProduct}`).join(", ")}</p>` : ""}
          ${selectedServices.some(item => item.partingPreference) ? `<p>Parting Preferences: ${selectedServices.filter(item => item.partingPreference).map(item => `${item.name} - ${item.partingPreference}${item.partingFee ? ` (+${money(item.partingFee)})` : ""}`).join(", ")}</p>` : ""}
          <p id="bookingAddOnsText">${addOns.length ? `Add-ons / products: ${addOns.map(item => item.name).join(", ")}` : ""}</p>
          ${discountAmount ? `<p>Subtotal: ${money(subtotal)}</p>` : ""}
          <p id="bookingDiscountText">${discountAmount ? `Promo Discount (${appliedDiscountCodeLabel()}): -${money(discountAmount)}` : ""}</p>
          <p id="bookingTotalText">Estimated Total: ${money(total)}</p>
          <p id="bookingDepositText">Deposit Required Before Confirmation: ${money(deposit)}. Your appointment is not finalized until Lovely Locs confirms the deposit was received.</p>
          ${adminTest ? `<p class="advisory-copy">Admin test mode: no deposit payment will be requested for this booking.</p>` : ""}
        </div>
        <div class="booking-save-note">
          <strong>Your details save automatically</strong>
          <p id="bookingDraftStatus">${bookingDraft ? "Saved details restored. You can refresh or add another item without starting over." : "As you type, this unfinished booking will be saved on this device."}</p>
        </div>
        <form class="form-grid" id="bookingForm">
          <label>Full Name<input name="fullName" required placeholder="Your name" value="${escapeAttr(profile.fullName)}"></label>
          <label>Email Address<input name="email" required type="email" placeholder="you@example.com" value="${escapeAttr(profile.email)}"></label>
          <label>Phone Number<input name="phone" required placeholder="(555) 123-4567" value="${escapeAttr(profile.phone)}"></label>
          <label>Appointment Date<input id="bookingDate" name="date" required type="date" value="${escapeAttr(profile.date)}"><span class="field-note">For scheduling this appointment only. This does not set your birthday-credit dates.</span></label>
          <label>Birthday <span class="optional-label">(optional)</span><input name="birthday" type="date" autocomplete="bday" value="${escapeAttr(profile.birthday)}"><span class="field-note">Guest clients can enter only their birthday to receive the annual birthday credit. It becomes available automatically 2 weeks before your birthday and expires 1 month after it. No separate preferred redemption date is needed.</span></label>
          <label>Were You Referred? <span class="optional-label">(optional)</span><input name="referredByCode" value="${escapeAttr(profile.referredByCode || referredByCodeFromUrl())}" placeholder="LOVELYLOCS/FRIENDNAME"><span class="field-note">Enter the personal code shared by the client who referred you.</span></label>
          ${adminTest ? `<label class="full">Admin Token<input name="adminToken" type="password" required placeholder="Private owner token" autocomplete="current-password"><span class="field-note">Required for no-charge owner test bookings.</span></label>` : ""}
          ${slotPickerMarkup(profile)}
          <fieldset class="full contact-preference">
            <legend>Preferred Point of Contact</legend>
            <label><input name="preferredContact" type="radio" value="text_email" ${profile.preferredContact === "text_email" ? "checked" : ""}> Text + Email <span class="coming-soon-label">Coming Soon</span></label>
            <label><input name="preferredContact" type="radio" value="text" ${profile.preferredContact === "text" ? "checked" : ""}> Text <span class="coming-soon-label">Coming Soon</span></label>
            <label><input name="preferredContact" type="radio" value="email" ${!profile.preferredContact || profile.preferredContact === "email" ? "checked" : ""}> Email</label>
            <p>Text messaging is coming soon while carrier approval is completed. Choose Email for active confirmations. You may still provide optional text-message consent now.</p>
          </fieldset>
          <label class="full policy-ack sms-consent"><input name="smsOptIn" type="checkbox" ${profile.smsOptIn ? "checked" : ""}><span>I agree to receive text messages from Lovely Locs about my booking, including appointment confirmations, deposit/payment updates, appointment reminders, and service-related updates. Message and data rates may apply. Message frequency varies. Reply STOP to opt out and HELP for help. See our <a href="#sms-opt-in" data-route="sms-opt-in">SMS Opt-In</a>, <a href="#privacy" data-route="privacy">Privacy Policy</a>, and <a href="#terms" data-route="terms">Terms</a>.</span></label>
          <label class="full">Special Requests<textarea name="specialRequests" placeholder="Retwist product preference, style ideas, hair history, or notes...">${escapeAttr(profile.specialRequests)}</textarea></label>
          <label class="full policy-ack"><input id="policyAcknowledgement" name="policyAcknowledgement" type="checkbox" ${profile.policyAcknowledgement ? "checked" : ""}><span>I have read and agree to the Lovely Locs <a href="#policies" data-route="policies">booking policies</a>, <a href="#privacy" data-route="privacy">Privacy Policy</a>, and <a href="#terms" data-route="terms">Terms &amp; Conditions</a>. I understand deposits are non-refundable, appointment times are estimates, quality work cannot be rushed, and Lovely Locs may adjust or decline services that are outside the listed loc/natural-hair scope or unsafe based on hair/scalp condition.</span></label>
        </form>
        <div id="bookingReferralPreview">
          ${personalReferralCard({ fullName: profile.fullName, preview: true })}
        </div>
        <p class="form-error" id="bookingError" aria-live="polite"></p>
        ${confirmationMarkup}
        <div class="modal-summary">
          <strong>Before You Submit</strong>
          ${adminTest
            ? `<p>This is an admin-only test booking. It saves the request and tests confirmation messages without creating a deposit payment step.</p>`
            : `<p>Deposits are non-refundable. All services are held at the private Lovely Locs home studio; the exact studio address is shared after your booking is confirmed.</p><p>Purple time slots are regular open appointment times. Brown time slots are emergency proposals outside business hours, on Sundays, or on holiday/key dates and include the $45 emergency fee.</p><p>After submitting, you will see the Venmo and Apple Pay deposit options. Your official confirmation is sent only after Lovely Locs verifies the matching receipt. Emergency proposals may receive a follow-up if the proposed time needs owner approval.</p>`}
        </div>
        <div class="modal-actions">
          <button class="outline-btn" data-close-booking>Back</button>
          <button class="primary-btn" type="button" data-submit-booking>${adminTest ? "Submit No-Charge Test Booking" : `Submit Request &amp; View Pay Options`}</button>
        </div>
      </div>
    </div>
  `;
}

function render(route = currentRoute()) {
  if ((route === "admin" || route === "admin-confirm-deposit") && !isOwnerAccount()) {
    ownerAdminAccessNotice = "Owner Admin is available only when the LOVELY2LOCS account is signed in.";
    route = "client-settings";
    window.location.hash = "client-settings";
  }
  syncOwnerAdminAccess();
  markFriendTestCheckpoint(route);
  if (route === "policies") app.innerHTML = policiesPage();
  else if (route === "products") app.innerHTML = productsPage();
  else if (route === "contact") app.innerHTML = contactPage();
  else if (route === "sms-opt-in") app.innerHTML = smsOptInPage();
  else if (route === "privacy") app.innerHTML = privacyPage();
  else if (route === "terms") app.innerHTML = termsPage();
  else if (route === "payment-options") app.innerHTML = paymentOptionsPage();
  else if (route === "payment-success") app.innerHTML = paymentSuccessPage();
  else if (route === "client-settings") app.innerHTML = clientSettingsPage();
  else if (route === "admin" || route === "admin-confirm-deposit") app.innerHTML = adminPage();
  else if (route === "versions") app.innerHTML = versionsPage();
  else app.innerHTML = homePage();
  bindDynamic();
  if (route !== "home" && route !== lastRoute) {
    scrollRouteToTop(route);
  }
  lastRoute = route;
}

function scrollRouteToTop(route) {
  setTimeout(() => {
    const target = document.getElementById(`${route}-page`) || app;
    target.scrollIntoView({ behavior: "auto", block: "start" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, 20);
}

function currentRoute() {
  const hash = window.location.hash.replace("#", "").split("?")[0];
  const route = ["policies", "products", "contact", "sms-opt-in", "privacy", "terms", "payment-options", "payment-success", "client-settings", "admin", "admin-confirm-deposit", "versions"].includes(hash) ? hash : "home";
  if (!["policies", "products", "contact", "sms-opt-in", "privacy", "terms", "payment-options", "payment-success", "admin", "admin-confirm-deposit", "versions", "home", ""].includes(hash)) {
    pendingAnchor = hash;
  }
  if ((route === "admin" || route === "admin-confirm-deposit") && !isOwnerAccount()) {
    ownerAdminAccessNotice = "Owner Admin is available only when the LOVELY2LOCS account is signed in.";
    return "client-settings";
  }
  return route;
}

function addToCart(item) {
  bookingConfirmation = null;
  if (!cart.some(existing => existing.id === item.id)) cart.push(item);
  saveCart();
  render(currentRoute());
}

function clearCart() {
  cart = [];
  selectedService = null;
  bookingConfirmation = null;
  saveCart();
  render(currentRoute());
}

function addAdminTestBooking() {
  if (!isOwnerAccount()) {
    ownerAdminAccessNotice = "Owner Admin is available only when the LOVELY2LOCS account is signed in.";
    render("client-settings");
    return;
  }
  cart = [{ ...adminTestService, type: "service" }];
  advisoryMessage = "";
  baseProductMessage = "";
  partingMessage = "";
  bookingConfirmation = null;
  saveCart();
  render("admin");
  openCart();
}

function addServiceFromAdvisory(service) {
  selectedService = service;
  addToCart({ ...service, type: "service" });
  openCart();
}

function addServiceWithProductPreference(service, productPreference) {
  selectedService = service;
  baseProductMessage = `${service.name} will be prepared with ${productPreference}.`;
  addToCart({ ...service, type: "service", baseProduct: productPreference });
  openCart();
}

function addServiceWithPartingPreference(service, partingPreference, partingFee) {
  const fee = Number(partingFee || 0);
  selectedService = service;
  partingMessage = fee
    ? `${service.name} includes ${partingPreference}. Triangle parts require additional sectioning detail, so $40 was added.`
    : `${service.name} includes ${partingPreference}.`;
  addToCart({
    ...service,
    id: fee ? `${service.id}-triangle-parts` : `${service.id}-${partingPreference.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: fee ? `${service.name} + Triangle Parts` : service.name,
    price: service.price + fee,
    type: "service",
    partingPreference,
    partingFee: fee
  });
  openCart();
}

function openAdvisory(service) {
  pendingAdvisoryService = service;
  document.getElementById("advisoryModal")?.classList.add("open");
}

function closeAdvisory() {
  pendingAdvisoryService = null;
  document.getElementById("advisoryModal")?.classList.remove("open");
}

function openProductPreference(service) {
  pendingProductService = service;
  document.getElementById("productPreferenceModal")?.classList.add("open");
}

function closeProductPreference() {
  pendingProductService = null;
  document.getElementById("productPreferenceModal")?.classList.remove("open");
}

function openPartingPreference(service) {
  pendingPartingService = service;
  document.getElementById("partingPreferenceModal")?.classList.add("open");
}

function closePartingPreference() {
  pendingPartingService = null;
  document.getElementById("partingPreferenceModal")?.classList.remove("open");
}

function handlePartingPreference(partingPreference, partingFee) {
  const service = pendingPartingService;
  closePartingPreference();
  if (!service) return;
  addServiceWithPartingPreference(service, partingPreference, partingFee);
}

function handleProductPreference(preference) {
  const service = pendingProductService;
  closeProductPreference();
  if (!service) return;
  addServiceWithProductPreference(service, preference);
}

function handleRetwistAnswer(answer) {
  const standard = pendingAdvisoryService || services.find(item => item.id === "adult-retwist");
  const overdue = services.find(item => item.id === "overdue-retwist");
  closeAdvisory();

  if (answer === "overdue" && overdue) {
    cart = cart.filter(item => item.id !== standard.id && item.id !== overdue.id);
    advisoryMessage = "Because your last retwist was 4+ months ago, Adult Retwist was changed to Overdue Retwist. This reserves more time for separation, cleanup, and full maintenance, so the price updates to the listed Overdue Retwist price.";
    openProductPreference(overdue);
    return;
  }

  advisoryMessage = "";
  openProductPreference(standard);
}

function bindDynamic() {
  document.querySelectorAll("[data-scroll]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".category-nav button").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.scroll)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll("[data-add-service]").forEach(button => {
    button.addEventListener("click", () => {
      const service = services.find(item => item.id === button.dataset.addService);
      if (cart.some(item => item.id === service?.id)) {
        openCart();
        return;
      }
      if (service?.id === "adult-retwist" && !cart.some(item => item.id === service.id)) {
        openAdvisory(service);
        return;
      }
      if (service?.category === "loc-maintenance") {
        openProductPreference(service);
        return;
      }
      if (service?.category === "starter-locs") {
        openPartingPreference(service);
        return;
      }
      addServiceFromAdvisory(service);
    });
  });

  document.querySelectorAll("[data-add-product]").forEach(button => {
    button.addEventListener("click", () => {
      const product = products.find(item => item.name === button.dataset.addProduct);
      addToCart({ ...product, id: `product-${product.name}`, type: "product" });
    });
  });

  document.querySelectorAll("[data-product-filter]").forEach(button => {
    button.addEventListener("click", () => {
      activeProductShelf = button.dataset.productFilter || "All";
      render("products");
    });
  });

  document.querySelectorAll("[data-add-admin-test]").forEach(button => {
    button.addEventListener("click", addAdminTestBooking);
  });

  document.querySelectorAll("[data-remove]").forEach(button => {
    button.addEventListener("click", () => {
      cart = cart.filter(item => item.id !== button.dataset.remove);
      bookingConfirmation = null;
      saveCart();
      render(currentRoute());
      openCart();
    });
  });

  document.querySelectorAll("[data-open-booking]").forEach(button => button.addEventListener("click", openBooking));
  document.querySelectorAll("[data-close-advisory]").forEach(button => button.addEventListener("click", closeAdvisory));
  document.querySelectorAll("[data-close-product-preference]").forEach(button => button.addEventListener("click", closeProductPreference));
  document.querySelectorAll("[data-close-parting-preference]").forEach(button => button.addEventListener("click", closePartingPreference));
  document.querySelectorAll("[data-retwist-answer]").forEach(button => button.addEventListener("click", () => handleRetwistAnswer(button.dataset.retwistAnswer)));
  document.querySelectorAll("[data-product-preference]").forEach(button => button.addEventListener("click", () => handleProductPreference(button.dataset.productPreference)));
  document.querySelectorAll("[data-parting-preference]").forEach(button => button.addEventListener("click", () => handlePartingPreference(button.dataset.partingPreference, button.dataset.partingFee)));
  document.querySelectorAll("[data-view-services]").forEach(button => button.addEventListener("click", goToServices));
  document.querySelectorAll("[data-close-booking]").forEach(button => button.addEventListener("click", closeBooking));
  document.querySelectorAll("[data-submit-booking]").forEach(button => button.addEventListener("click", submitBooking));
  document.querySelectorAll("[data-open-client-settings]").forEach(button => button.addEventListener("click", openClientSettings));
  const bookingForm = document.getElementById("bookingForm");
  bookingForm?.addEventListener("input", event => {
    saveBookingDraft(bookingForm);
    if (event.target?.name === "fullName") updateBookingReferralPreview(event.target.value);
  });
  bookingForm?.addEventListener("change", () => saveBookingDraft(bookingForm));
  bindPersonalReferralActions(document);
  document.getElementById("bookingDate")?.addEventListener("change", event => {
    const timeInput = document.getElementById("bookingTime");
    const emergencyInput = document.getElementById("bookingEmergencySlot");
    if (timeInput) timeInput.value = "";
    if (emergencyInput) emergencyInput.value = "";
    bookingSlotState = { date: event.target.value, time: "", type: "", reason: "" };
    setEmergencyFeeForSlot(false);
    saveBookingDraft(bookingForm);
    loadAvailabilityForDate(event.target.value);
  });
  if (bookingDraft?.date) loadAvailabilityForDate(bookingDraft.date, bookingDraft);
  document.querySelectorAll("#brandSettingsForm input[type='range'], #brandSettingsForm input[name='url']").forEach(input => input.addEventListener("input", previewLogoSettings));
  document.querySelector("#brandSettingsForm input[name='logoFile']")?.addEventListener("change", handleLogoFileSelection);
  document.querySelectorAll("[data-logo-align]").forEach(button => {
    button.addEventListener("click", () => {
      logoSettings.heroAlign = button.dataset.logoAlign;
      document.querySelectorAll("[data-logo-align]").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      previewLogoSettings();
    });
  });
  document.querySelectorAll("[data-logo-fit]").forEach(button => {
    button.addEventListener("click", () => {
      logoSettings.fit = button.dataset.logoFit;
      document.querySelectorAll("[data-logo-fit]").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      previewLogoSettings();
    });
  });
  document.querySelectorAll("[data-save-logo-settings]").forEach(button => button.addEventListener("click", saveLogoSettings));
  document.querySelectorAll("[data-save-discount-settings]").forEach(button => button.addEventListener("click", saveDiscountSettings));
  document.querySelectorAll("[data-confirm-manual-deposit]").forEach(button => button.addEventListener("click", confirmManualDeposit));
  document.querySelectorAll("[data-release-unpaid-hold]").forEach(button => button.addEventListener("click", releaseUnpaidHold));
  document.querySelectorAll("[data-resend-client-confirmation]").forEach(button => button.addEventListener("click", resendClientConfirmation));
  document.querySelectorAll("[data-send-notification-test]").forEach(button => button.addEventListener("click", sendNotificationTest));
  document.querySelectorAll("[data-refresh-notification-status]").forEach(button => button.addEventListener("click", loadAdminNotificationStatus));
  document.querySelectorAll("[data-apply-promo]").forEach(button => button.addEventListener("click", applyPromoCode));
  document.querySelectorAll("[data-clear-promo]").forEach(button => button.addEventListener("click", clearPromoCode));
  document.querySelectorAll("[data-email-promo]").forEach(button => button.addEventListener("click", emailPromoCode));
  document.querySelectorAll("[data-share-booking]").forEach(button => button.addEventListener("click", shareBookingSite));
  document.querySelectorAll("[data-copy-booking]").forEach(button => button.addEventListener("click", copyBookingLink));
  document.querySelectorAll("[data-copy-optin-proof]").forEach(button => button.addEventListener("click", copySmsOptInLink));
  document.getElementById("cartButton")?.addEventListener("click", openCart);
  document.querySelectorAll("[data-close-cart]").forEach(item => item.addEventListener("click", closeCart));
  document.querySelectorAll(".faq-item button").forEach(button => button.addEventListener("click", () => button.parentElement.classList.toggle("open")));

  document.querySelectorAll("[data-guide]").forEach(button => {
    button.addEventListener("click", () => {
      const item = serviceGuide.find(option => option.id === button.dataset.guide);
      if (!item) return;
      activeGuideId = item.id;
      render(currentRoute());
    });
  });

  document.querySelectorAll("[data-quiz-question]").forEach(button => {
    button.addEventListener("click", () => {
      serviceQuizAnswers = {
        ...serviceQuizAnswers,
        [button.dataset.quizQuestion]: button.dataset.quizValue
      };
      activeGuideId = button.dataset.quizGuide || activeGuideId;
      render(currentRoute());
    });
  });

  document.querySelectorAll("[data-version]").forEach(button => {
    button.addEventListener("click", () => {
      applyVisualVersion(button.dataset.version);
      localStorage.setItem("visualVersion", button.dataset.version);
      if (currentRoute() === "versions") render("versions");
    });
  });

  document.querySelectorAll("[data-client-settings-login]").forEach(button => button.addEventListener("click", lookupClientSettings));
  document.querySelectorAll("[data-copy-client-referral]").forEach(button => button.addEventListener("click", copyClientReferralLink));
  document.querySelectorAll("[data-clear-client-profile]").forEach(button => button.addEventListener("click", clearClientProfile));
  document.querySelectorAll("[data-google-signup]").forEach(button => button.addEventListener("click", submitGoogleSignup));
  document.querySelectorAll("[data-switch-google-account]").forEach(button => button.addEventListener("click", switchGoogleAccount));
  document.querySelectorAll("[data-resume-saved-cart]").forEach(button => button.addEventListener("click", () => {
    window.location.hash = "home";
    render("home");
    openCart();
  }));
  if (currentRoute() === "client-settings") initializeGoogleSignIn();
  if (currentRoute() === "admin" || currentRoute() === "admin-confirm-deposit") loadAdminNotificationStatus();
  if (currentRoute() === "admin-confirm-deposit") {
    setTimeout(() => {
      document.getElementById("manual-deposit-confirm-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  if (pendingAnchor) {
    const target = document.getElementById(pendingAnchor);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
    pendingAnchor = null;
  }
}

function goToServices() {
  drawer.classList.remove("open");
  closeBooking();
  closeCart();
  closeAdvisory();
  closeProductPreference();
  closePartingPreference();
  pendingAnchor = "services";
  window.location.hash = "services";
  render("home");
}
function openClientSettings() {
  closeBooking();
  closeCart();
  window.location.hash = "client-settings";
  render("client-settings");
}
function openBooking() {
  if (!cart.length) {
    goToServices();
    return;
  }
  closeCart();
  document.getElementById("bookingModal")?.classList.add("open");
}
function closeBooking() { document.getElementById("bookingModal")?.classList.remove("open"); }
function openCart() { document.getElementById("cart")?.classList.add("open"); }
function closeCart() { document.getElementById("cart")?.classList.remove("open"); }

function bookingShareUrl() {
  const origin = window.location.origin || "http://127.0.0.1:4175";
  return `${origin}/#services`;
}

function referredByCodeFromUrl() {
  try {
    const code = new URLSearchParams(window.location.search || "").get("ref") || localStorage.getItem("lovelyLocsReferredByCode") || "";
    const clean = normalizeReferralCode(code);
    if (clean) localStorage.setItem("lovelyLocsReferredByCode", clean);
    return clean;
  } catch {
    return "";
  }
}

function shareMessage() {
  return {
    title: "Book Lovely Locs",
    text: "Book your Lovely Locs appointment here. Add my name in your booking notes for the referral bonus.",
    url: bookingShareUrl()
  };
}

function setShareStatus(message) {
  const status = document.getElementById("shareStatus");
  if (status) status.textContent = message;
}

async function lookupClientSettings() {
  const form = document.getElementById("clientSettingsForm");
  const status = document.getElementById("clientSettingsStatus");
  if (!form) return;
  if (!form.reportValidity()) {
    if (status) status.textContent = "Enter the email and phone number used for booking.";
    return;
  }
  const data = new FormData(form);
  if (status) status.textContent = "Loading client settings...";
  try {
    const response = await fetch("/api/client-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.get("email") || "",
        phone: data.get("phone") || ""
      })
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "Client settings could not be loaded.");
    clientSettingsResult = result;
    saveClientProfile({
      ...(result.client || {}),
      referralCode: result.referralCode || result.client?.referralCode || ""
    });
    render("client-settings");
  } catch (error) {
    if (status) status.textContent = error.message;
  }
}

async function fetchGoogleAuthConfig() {
  if (googleAuthConfig) return googleAuthConfig;
  const response = await fetch("/api/auth/google/config");
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "Google sign-in configuration could not be loaded.");
  googleAuthConfig = result;
  return result;
}

async function initializeGoogleSignIn() {
  const button = document.getElementById("googleSignInButton");
  const status = document.getElementById("googleSignInStatus");
  if (!button || !status) return;
  try {
    const config = await fetchGoogleAuthConfig();
    if (!config.configured || !config.clientId) {
      status.textContent = "Google sign-in is not configured yet. Use booking email and phone for now.";
      return;
    }
    if (!window.google?.accounts?.id) {
      googleAuthLoadAttempts += 1;
      if (googleAuthLoadAttempts <= 20) {
        status.textContent = "Loading Google sign-in...";
        setTimeout(initializeGoogleSignIn, 250);
      } else {
        status.textContent = "Google sign-in could not load. Refresh the page or use booking email and phone.";
      }
      return;
    }
    googleAuthLoadAttempts = 0;
    window.google.accounts.id.initialize({
      client_id: config.clientId,
      callback: handleGoogleCredential,
      auto_select: false,
      button_auto_select: false,
      use_fedcm_for_button: false,
      cancel_on_tap_outside: true
    });
    button.innerHTML = "";
    window.google.accounts.id.renderButton(button, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: Math.min(360, Math.max(220, button.clientWidth || 320)),
      click_listener: () => window.google.accounts.id.disableAutoSelect()
    });
    status.textContent = "";
  } catch (error) {
    status.textContent = error.message;
  }
}

function switchGoogleAccount() {
  window.google?.accounts?.id?.disableAutoSelect();
  if (localStorage.removeItem) localStorage.removeItem("lovelyLocsClientProfile");
  else localStorage.setItem("lovelyLocsClientProfile", "");
  savedClientProfile = null;
  clientSettingsResult = null;
  syncOwnerAdminAccess();
  googleSignupCredential = "";
  googleSignupState = null;
  render("client-settings");
}

async function handleGoogleCredential(response) {
  const status = document.getElementById("googleSignInStatus");
  if (!response?.credential) {
    if (status) status.textContent = "Google did not return a sign-in credential. Please try again.";
    return;
  }
  googleSignupCredential = response.credential;
  if (status) status.textContent = "Verifying your Google account...";
  try {
    const request = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential })
    });
    const result = await request.json();
    if (!request.ok || !result.ok) throw new Error(result.error || "Google sign-in could not be completed.");
    if (result.needsSignup) {
      googleSignupState = {
        email: result.signup?.email || "",
        fullName: result.signup?.fullName || ""
      };
      const saved = savedClientProfile;
      if (saved?.onboardingCompleted && saved.email === googleSignupState.email) {
        await saveGoogleSignupProfile(saved, { automatic: true });
        return;
      }
      render("client-settings");
      return;
    }
    googleSignupState = null;
    googleSignupCredential = "";
    clientSettingsResult = result;
    saveClientProfile({
      ...(result.client || {}),
      referralCode: result.referralCode || result.client?.referralCode || "",
      onboardingCompleted: true,
      googleLinked: true
    });
    render("client-settings");
  } catch (error) {
    if (status) status.textContent = error.message;
  }
}

async function saveGoogleSignupProfile(profile, options = {}) {
  const status = document.getElementById("googleSignupStatus") || document.getElementById("googleSignInStatus");
  if (status) status.textContent = options.automatic ? "Restoring your saved profile..." : "Creating your profile...";
  const request = await fetch("/api/auth/google/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      credential: googleSignupCredential,
      fullName: profile.fullName || "",
      phone: profile.phone || "",
      birthday: profile.birthday || "",
      locJourneyLength: profile.locJourneyLength || ""
    })
  });
  const result = await request.json();
  if (!request.ok || !result.ok) throw new Error(result.error || "Your Lovely Locs profile could not be created.");
  googleSignupState = null;
  googleSignupCredential = "";
  clientSettingsResult = result;
  saveClientProfile({
    ...(result.client || {}),
    referralCode: result.referralCode || result.client?.referralCode || "",
    onboardingCompleted: true,
    googleLinked: true
  });
  render("client-settings");
}

async function submitGoogleSignup() {
  const form = document.getElementById("googleSignupForm");
  const status = document.getElementById("googleSignupStatus");
  if (!form || !googleSignupCredential) {
    if (status) status.textContent = "Sign in with Google again to create your profile.";
    return;
  }
  if (!form.reportValidity()) {
    if (status) status.textContent = "Enter your name and phone number, then confirm that you want to save your profile.";
    return;
  }
  const data = new FormData(form);
  try {
    await saveGoogleSignupProfile({
      fullName: data.get("fullName") || "",
      email: googleSignupState?.email || "",
      phone: data.get("phone") || "",
      birthday: data.get("birthday") || "",
      locJourneyLength: data.get("locJourneyLength") || ""
    });
  } catch (error) {
    if (status) status.textContent = error.message;
  }
}

async function copyClientReferralLink() {
  const link = clientSettingsResult?.shareUrl || "";
  if (!link) return;
  await navigator.clipboard?.writeText(link);
}

function setPersonalReferralStatus(button, message) {
  const card = button?.closest?.("[data-personal-referral-card]");
  const status = card?.querySelector?.("[data-referral-action-status]");
  if (status) status.textContent = message;
}

async function copyReferralValue(button, value, successMessage) {
  if (!value) return;
  await navigator.clipboard?.writeText(value);
  setPersonalReferralStatus(button, successMessage);
}

async function sharePersonalReferral(button) {
  const url = button.dataset.sharePersonalReferral || "";
  const code = button.dataset.referralCode || "";
  if (!url) return;
  const data = {
    title: "Lovely Locs Referral",
    text: `Use my Lovely Locs referral code ${code} when you book.`,
    url
  };
  if (navigator.share) {
    await navigator.share(data);
    setPersonalReferralStatus(button, "Referral ready to share.");
    return;
  }
  await copyReferralValue(button, url, "Referral link copied.");
}

function bindPersonalReferralActions(root = document) {
  root.querySelectorAll?.("[data-copy-personal-referral-code]").forEach(button => {
    button.addEventListener("click", () => copyReferralValue(button, button.dataset.copyPersonalReferralCode, "Referral code copied."));
  });
  root.querySelectorAll?.("[data-copy-personal-referral-link]").forEach(button => {
    button.addEventListener("click", () => copyReferralValue(button, button.dataset.copyPersonalReferralLink, "Referral link copied."));
  });
  root.querySelectorAll?.("[data-share-personal-referral]").forEach(button => {
    button.addEventListener("click", () => sharePersonalReferral(button));
  });
}

function updateBookingReferralPreview(fullName) {
  const target = document.getElementById("bookingReferralPreview");
  if (!target) return;
  target.innerHTML = personalReferralCard({ fullName, preview: true });
  bindPersonalReferralActions(target);
}

async function copyBookingLink() {
  const url = bookingShareUrl();
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const helper = document.createElement("textarea");
      helper.value = url;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    setShareStatus("Booking link copied. Tell your friend to add your name in their notes.");
  } catch {
    setShareStatus(`Copy this link: ${url}`);
  }
}

async function shareBookingSite() {
  const payload = shareMessage();
  if (navigator.share) {
    try {
      await navigator.share(payload);
      setShareStatus("Thanks for sharing Lovely Locs.");
      return;
    } catch {
      setShareStatus("Share cancelled. You can still copy the link.");
      return;
    }
  }
  await copyBookingLink();
}

async function copySmsOptInLink() {
  const origin = window.location.origin || "http://127.0.0.1:4175";
  const url = `${origin}/#sms-opt-in`;
  try {
    await navigator.clipboard?.writeText(url);
    setShareStatus("SMS opt-in link copied.");
  } catch {
    setShareStatus(`Copy this SMS opt-in link: ${url}`);
  }
}

function logoSettingsFromForm() {
  const form = document.getElementById("brandSettingsForm");
  const data = new FormData(form);
  const manualUrl = String(data.get("url") || "").trim();
  return {
    url: manualUrl || logoSettings.url || logoUrl,
    navSize: Number(data.get("navSize")),
    heroSize: Number(data.get("heroSize")),
    heroAlign: logoSettings.heroAlign,
    fit: logoSettings.fit,
    x: Number(data.get("x")),
    y: Number(data.get("y"))
  };
}

function updateLogoControlLabels(settings) {
  for (const [key, suffix] of [["navSize", "px"], ["heroSize", "px"], ["x", "%"], ["y", "%"]]) {
    const node = document.querySelector(`[data-logo-value="${key}"]`);
    if (node) node.textContent = `${settings[key]}${suffix}`;
  }
}

function previewLogoSettings() {
  const settings = logoSettingsFromForm();
  saveLogoSettingsLocal(settings);
  updateLogoControlLabels(settings);
}

function handleLogoFileSelection(event) {
  const file = event.target?.files?.[0];
  const form = document.getElementById("brandSettingsForm");
  const status = document.getElementById("brandSettingsStatus");
  const note = document.querySelector("[data-logo-upload-note]");
  if (!file) return;
  if (!/^image\/(png|jpeg|webp|gif)$/i.test(file.type || "")) {
    if (status) status.textContent = "Choose a PNG, JPG, WebP, or GIF logo image.";
    event.target.value = "";
    return;
  }
  if (file.size > 1100000) {
    if (status) status.textContent = "Choose a logo image under 1 MB so it can save reliably.";
    event.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    logoSettings.url = String(reader.result || "");
    const urlInput = form?.elements?.url;
    if (urlInput) urlInput.value = "";
    if (note) note.textContent = `${file.name} is previewing. Save settings to keep it for the live site.`;
    if (status) status.textContent = "Logo image preview updated. Save settings to keep it for the live site.";
    previewLogoSettings();
  };
  reader.onerror = () => {
    if (status) status.textContent = "The logo image could not be read. Try a smaller image or paste a public image URL.";
  };
  reader.readAsDataURL(file);
}

async function saveLogoSettings() {
  const form = document.getElementById("brandSettingsForm");
  const status = document.getElementById("brandSettingsStatus");
  if (!form) return;
  const token = new FormData(form).get("token") || "";
  const settings = logoSettingsFromForm();
  saveLogoSettingsLocal(settings);
  if (status) status.textContent = "Saving logo settings...";
  try {
    const response = await fetch("/api/site-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, logo: settings })
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "Logo settings could not be saved.");
    saveLogoSettingsLocal(result.settings.logo);
    if (status) status.textContent = "Logo settings saved for the live site.";
  } catch (error) {
    if (status) status.textContent = error.message;
  }
}

function discountSettingsFromForm() {
  const form = document.getElementById("discountSettingsForm");
  const data = new FormData(form);
  return {
    code: normalizeDiscountCode(data.get("code")),
    percent: Number(data.get("percent")),
    expiresAt: data.get("expiresAt") || "",
    enabled: Boolean(data.get("enabled"))
  };
}

async function saveDiscountSettings() {
  const form = document.getElementById("discountSettingsForm");
  const status = document.getElementById("discountSettingsStatus");
  if (!form) return;
  const data = new FormData(form);
  const token = data.get("token") || "";
  const settings = discountSettingsFromForm();
  saveDiscountSettingsLocal(settings);
  if (status) status.textContent = "Saving discount code...";
  try {
    const response = await fetch("/api/site-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, discount: settings })
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "Discount code could not be saved.");
    saveDiscountSettingsLocal(result.settings.discount);
    if (!result.settings.discount.enabled) saveAppliedDiscount(null);
    if (status) status.textContent = "Discount code saved for the live site.";
  } catch (error) {
    if (status) status.textContent = error.message;
  }
}

async function confirmManualDeposit() {
  const form = document.getElementById("manualDepositConfirmForm");
  const status = document.getElementById("manualDepositConfirmStatus");
  const button = form?.querySelector("[data-confirm-manual-deposit]");
  if (!form) return;
  const data = new FormData(form);
  const booking = String(data.get("booking") || "").trim();
  const token = String(data.get("token") || "").trim();
  const method = String(data.get("method") || "manual").trim();
  if (!booking || !token) {
    if (status) status.textContent = "Enter the booking ID and admin token.";
    return;
  }
  if (status) status.textContent = `Confirming deposit for ${booking}...`;
  if (button) {
    button.disabled = true;
    button.textContent = "Confirming...";
  }
  try {
    const url = `/api/manual-payment/confirm?booking=${encodeURIComponent(booking)}&method=${encodeURIComponent(method)}&token=${encodeURIComponent(token)}&format=json`;
    const response = await fetch(url, { method: "POST" });
    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(`The server response was interrupted for ${booking}. Press the button again safely; completed confirmations will not be duplicated.`);
    }
    if (!response.ok || !result.ok) throw new Error(result.error || "Deposit confirmation failed.");
    const heading = result.alreadyConfirmed
      ? `${escapeAttr(booking)} was already confirmed. No duplicate messages were sent.`
      : `${escapeAttr(booking)} is confirmed.`;
    if (status) status.innerHTML = `${heading}<br>${notificationResultsHtml(result.notificationResults)}`;
  } catch (error) {
    if (status) status.textContent = `${error.message} The booking is not shown as confirmed until this panel displays a success result.`;
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Confirm Deposit & Send Client Confirmation";
    }
  }
}

async function releaseUnpaidHold() {
  const form = document.getElementById("manualDepositConfirmForm");
  const status = document.getElementById("manualDepositConfirmStatus");
  const button = form?.querySelector("[data-release-unpaid-hold]");
  if (!form) return;
  const data = new FormData(form);
  const booking = String(data.get("booking") || "").trim();
  const token = String(data.get("token") || "").trim();
  if (!booking || !token) {
    if (status) status.textContent = "Enter the booking ID and admin token.";
    return;
  }
  if (status) status.textContent = `Releasing unpaid hold for ${booking}...`;
  if (button) {
    button.disabled = true;
    button.textContent = "Releasing...";
  }
  try {
    const response = await fetch("/api/manual-payment/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking,
        token,
        reason: "Deposit was not received, so the unpaid hold was released by the owner."
      })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Unpaid hold could not be released.");
    const appointment = result.appointment?.date && result.appointment?.time
      ? ` ${result.appointment.date} at ${result.appointment.time} is open for booking again.`
      : " The appointment time is open for booking again.";
    const heading = result.alreadyReleased
      ? `${escapeAttr(booking)} was already released as unpaid.`
      : `${escapeAttr(booking)} was released as unpaid.`;
    if (status) status.textContent = `${heading}${appointment}`;
  } catch (error) {
    if (status) status.textContent = error.message;
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Deposit Not Received - Release Slot";
    }
  }
}

async function resendClientConfirmation() {
  const form = document.getElementById("confirmationResendForm");
  const status = document.getElementById("confirmationResendStatus");
  if (!form) return;
  if (!form.reportValidity()) {
    if (status) status.textContent = "Complete the client email and appointment details.";
    return;
  }
  const data = new FormData(form);
  const payload = {
    token: String(data.get("token") || "").trim(),
    bookingId: String(data.get("bookingId") || "").trim(),
    email: String(data.get("email") || "").trim(),
    fullName: String(data.get("fullName") || "").trim(),
    date: String(data.get("date") || "").trim(),
    time: String(data.get("time") || "").trim(),
    deposit: Number(data.get("deposit") || 0),
    total: Number(data.get("total") || 0),
  };
  if (!payload.token) {
    if (status) status.textContent = "Enter the admin token first.";
    return;
  }
  if (status) status.textContent = "Resending confirmation...";
  try {
    const response = await fetch("/api/admin/confirmation/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Confirmation email could not be resent.");
    if (status) {
      status.innerHTML = `Confirmation resend submitted.<br>${notificationResultsHtml(result.notificationResults)}<br>Accepted means Resend received the message; verify Delivered or Bounced in the Resend dashboard.`;
    }
  } catch (error) {
    if (status) status.textContent = error.message;
  }
}

function notificationResultsHtml(results = []) {
  if (!results.length) return "No notification tasks were returned.";
  return results.map(result => {
    const label = escapeAttr(result.channel || "notification");
    if (result.failed) {
      const deliveryLabel = result.channel === "clientEmail" ? "clientEmail: not delivered automatically" : `${label}: failed`;
      const fallback = result.fallback ? `<br><span>${escapeAttr(result.fallback)}</span>` : "";
      const draft = result.gmailDraftUrl ? `<br><a href="${escapeAttr(result.gmailDraftUrl)}" target="_blank" rel="noopener">Open email draft for client confirmation</a>` : "";
      return `<span>${deliveryLabel} - ${escapeAttr(result.error || "Unknown error")}${fallback}${draft}</span>`;
    }
    if (result.skipped) return `<span>${label}: skipped - ${escapeAttr(result.reason || "Provider not ready")}</span>`;
    const parts = [`${label}: accepted by ${escapeAttr(result.provider || "provider")} (not yet proof of inbox delivery)`];
    if (result.id) parts.push(`email id ${escapeAttr(result.id)}`);
    if (result.sid) parts.push(`sms sid ${escapeAttr(result.sid)}`);
    if (result.status) parts.push(`status ${escapeAttr(result.status)}`);
    return `<span>${parts.join(" - ")}</span>`;
  }).join("<br>");
}

function notificationResultsText(results = []) {
  if (!results.length) return "No notification tasks were returned.";
  return results.map(result => {
    const label = result.channel || "notification";
    if (result.failed) return `${label}: failed - ${result.error || "Unknown error"}`;
    if (result.skipped) return `${label}: skipped - ${result.reason || "Provider not ready"}`;
    const parts = [`${label}: accepted by ${result.provider || "provider"}`];
    if (result.id) parts.push(`email id ${result.id}`);
    if (result.sid) parts.push(`sms sid ${result.sid}`);
    if (result.status) parts.push(`status ${result.status}`);
    return parts.join(" - ");
  }).join("\n");
}

async function sendNotificationTest() {
  const form = document.getElementById("notificationTestForm");
  const status = document.getElementById("notificationTestStatus");
  if (!form) return;
  const data = new FormData(form);
  const token = String(data.get("token") || "").trim();
  const email = String(data.get("email") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const channel = String(data.get("channel") || "email").trim();
  if (!token) {
    if (status) status.textContent = "Enter the admin token first.";
    return;
  }
  if (status) status.textContent = "Sending notification test...";
  try {
    const response = await fetch("/api/notifications/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, phone, channel })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Notification test failed.");
    if (status) status.textContent = notificationResultsText(result.results);
  } catch (error) {
    if (status) status.textContent = error.message;
  }
}

function readinessLine(label, ready, detail) {
  return `<div class="readiness-line ${ready ? "ready" : "blocked"}"><strong>${label}</strong><span>${ready ? "Ready" : "Needs attention"}</span><p>${escapeAttr(detail || "")}</p></div>`;
}

async function loadAdminNotificationStatus() {
  const target = document.getElementById("adminNotificationStatus");
  if (!target) return;
  target.innerHTML = "<p>Loading notification status...</p>";
  try {
    const response = await fetch("/api/notification-status");
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Notification status could not load.");
    target.innerHTML = [
      readinessLine("Owner Email", Boolean(result.emailConfigured), result.emailConfigured ? `Owner email target: ${result.ownerEmail}` : result.emailReadinessReason),
      readinessLine("Client Confirmation Email", Boolean(result.emailReadyForClients), result.emailReadinessReason),
      readinessLine("Email Delivery Tracking", Boolean(result.emailDeliveryTrackingConfigured), result.emailDeliveryTrackingReason),
      readinessLine("SMS", Boolean(result.smsReady), result.smsBlockedReason || (result.smsConfigured ? "SMS provider is configured." : "Twilio env vars are not configured.")),
      readinessLine("Admin Token", Boolean(result.automation?.tokenConfigured), result.automation?.tokenConfigured ? "Admin actions and automations have a token configured." : "Set AUTOMATION_RUN_TOKEN or MANUAL_DEPOSIT_CONFIRM_TOKEN.")
    ].join("");
  } catch (error) {
    target.innerHTML = `<p class="form-error">${escapeAttr(error.message)}</p>`;
  }
}

function setPromoStatus(message, kind = "") {
  const status = document.getElementById("promoStatus");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("success", kind === "success");
  status.classList.toggle("error", kind === "error");
}

async function applyPromoCode() {
  const input = document.getElementById("promoCodeInput");
  const code = normalizeDiscountCode(input?.value || "");
  if (!code) {
    setPromoStatus("Enter a promo code first.", "error");
    return;
  }
  setPromoStatus("Checking promo code...");
  try {
    const response = await fetch("/api/discount/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "Promo code could not be applied.");
    saveAppliedDiscount({ code: result.code, percent: result.percent, expiresAt: result.expiresAt || "" });
    render(currentRoute());
    openCart();
  } catch (error) {
    saveAppliedDiscount(null);
    setPromoStatus(error.message, "error");
  }
}

function clearPromoCode() {
  saveAppliedDiscount(null);
  render(currentRoute());
  openCart();
}

async function emailPromoCode() {
  const status = document.getElementById("promoEmailStatus");
  const email = document.getElementById("promoEmailInput")?.value || "";
  const code = normalizeDiscountCode(appliedDiscount?.code || document.getElementById("promoCodeInput")?.value || "");
  if (!email || !code) {
    if (status) status.textContent = "Add an email and an active promo code first.";
    return;
  }
  if (status) status.textContent = "Sending promo code...";
  try {
    const response = await fetch("/api/discount/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "Promo code could not be emailed.");
    if (status) status.textContent = result.message || "Promo code email was queued.";
  } catch (error) {
    if (status) status.textContent = error.message;
  }
}

function bookingSummaryFromForm(form) {
  const booking = bookingPayloadFromForm(form);
  const { client, selectedServices, addOns, total, deposit } = booking;
  const serviceLines = selectedServices.map(item => {
    const details = [
      item.duration ? `Time: ${item.duration}` : "",
      item.baseProduct ? `Base product: ${item.baseProduct}` : "",
      item.partingPreference ? `Parting: ${item.partingPreference}${item.partingFee ? ` (+${money(item.partingFee)})` : ""}` : ""
    ].filter(Boolean).join("; ");
    return `- ${item.name} (${money(item.price)}${details ? ` | ${details}` : ""})`;
  });
  const addOnLines = addOns.map(item => `- ${item.name} (${money(item.price)})`);

  return [
    "Lovely Locs appointment request",
    "",
    `Client: ${client.fullName}`,
    `Email: ${client.email}`,
    `Phone: ${client.phone}`,
    `Appointment date: ${client.date}`,
    `Appointment time: ${timeLabel(client.time)}`,
    client.birthday ? `Birthday credit date: ${client.birthday}` : "",
    `Appointment type: ${client.emergencySlot ? "Emergency proposal" : "Regular appointment"}`,
    `Preferred contact: ${contactPreferenceLabel(client.preferredContact)}`,
    `Optional communications opt-in: ${client.smsOptIn ? "Yes" : "No"}`,
    client.referredByCode ? `Referred by code: ${client.referredByCode}` : "",
    "",
    "Services:",
    serviceLines.length ? serviceLines.join("\n") : "- No service selected",
    addOnLines.length ? `\nAdd-ons / products:\n${addOnLines.join("\n")}` : "",
    "",
    appliedDiscount ? `Promo code: ${appliedDiscount.code} (${appliedDiscount.percent}% off)` : "",
    `Estimated total: ${money(total)}`,
    `Deposit required: ${money(deposit)}`,
    "",
    `Notes: ${client.specialRequests || "No special requests added."}`,
    "",
    "Policy acknowledgement: Client confirmed they read the Lovely Locs policies.",
    "Studio note: Address is shared after booking and deposit are confirmed."
  ].filter(line => line !== "").join("\n");
}

function bookingPayloadFromForm(form) {
  const data = new FormData(form);
  const selectedServices = cart.filter(item => item.type === "service");
  const addOns = cart.filter(item => item.type !== "service");
  const total = discountedCartTotal();
  const deposit = bookingDeposit(total, cart);
  const communicationsOptIn = Boolean(data.get("smsOptIn"));
  return {
    ...(isAdminTestBooking(cart) ? { adminToken: data.get("adminToken") || "" } : {}),
    client: {
      fullName: data.get("fullName") || "",
      email: data.get("email") || "",
      phone: data.get("phone") || "",
      birthday: data.get("birthday") || savedClientProfile?.birthday || "",
      locJourneyLength: savedClientProfile?.locJourneyLength || "",
      onboardingCompleted: Boolean(savedClientProfile?.onboardingCompleted),
      date: data.get("date") || "",
      time: data.get("time") || "",
      emergencySlot: Boolean(data.get("emergencySlot")),
      preferredContact: data.get("preferredContact") || "email",
      smsOptIn: communicationsOptIn,
      marketingEmailOptIn: false,
      referralOptIn: false,
      referredByCode: normalizeReferralCode(data.get("referredByCode") || ""),
      specialRequests: data.get("specialRequests") || ""
    },
    cart,
    selectedServices,
    addOns,
    total,
    deposit,
    discountCode: appliedDiscount?.code || "",
    policyAcknowledgement: Boolean(data.get("policyAcknowledgement")),
    friendTest: friendTestSnapshot(true)
  };
}

function contactPreferenceLabel(value) {
  if (value === "text") return "Text";
  if (value === "email") return "Email";
  return "Text + Email";
}

function confirmationLinks(summary) {
  const subject = encodeURIComponent("Lovely Locs Appointment Request");
  const body = encodeURIComponent(summary);
  const phone = business.phone.replace(/[^0-9]/g, "");
  return {
    mailto: `mailto:${business.email}?subject=${subject}&body=${body}`,
    sms: `sms:${phone}?&body=${body}`
  };
}

function openPayOptionsRoute(payOptionsUrl) {
  const fallbackUrl = String(payOptionsUrl || "");
  try {
    const base = window.location.href || window.location.origin || "http://127.0.0.1:4175/";
    const target = new URL(fallbackUrl, base);
    const targetHash = target.hash || "#payment-options";
    const targetPath = `${target.pathname || "/"}${target.search}${targetHash}`;
    if (window.history?.pushState) {
      window.history.pushState(null, "", targetPath);
      closeBooking();
      closeCart();
      render("payment-options");
      scrollRouteToTop("payment-options");
      return true;
    }
  } catch {
    // Fall back to normal navigation below.
  }
  window.location.href = fallbackUrl;
  return false;
}

async function submitBooking() {
  const form = document.getElementById("bookingForm");
  const error = document.getElementById("bookingError");
  const policyAcknowledgement = document.getElementById("policyAcknowledgement");
  const submitButton = document.querySelector("[data-submit-booking]");
  if (!form) return;
  if (!form.reportValidity()) {
    if (error) error.textContent = "Please complete the required fields before submitting your appointment request.";
    return;
  }
  if (policyAcknowledgement && !policyAcknowledgement.checked) {
    if (error) error.textContent = "Please confirm that you have read the Lovely Locs policies before submitting your appointment request.";
    return;
  }
  const timeInput = document.getElementById("bookingTime");
  if (timeInput && !timeInput.value) {
    if (error) error.textContent = "Please choose an open appointment time before submitting your request.";
    return;
  }
  if (error) error.textContent = "";
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.dataset.originalText = submitButton.textContent;
    submitButton.textContent = isAdminTestBooking(cart) ? "Saving Test Booking..." : "Opening Pay Options...";
  }
  try {
    const bookingPayload = bookingPayloadFromForm(form);
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingPayload)
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "Booking could not be submitted.");
    if (!result.noCharge) {
      saveClientProfile({
        ...bookingPayload.client,
        referralCode: result.referralCode || referralCodeForName(bookingPayload.client.fullName)
      });
    }
    clearBookingDraft();
    if (result.noCharge) {
      bookingConfirmation = {
        message: result.message || "Free admin test booking saved. No deposit was requested."
      };
      render(currentRoute());
      openBooking();
      return;
    }
    if (!result.payOptionsUrl) throw new Error(result.error || "Pay options could not be opened.");
    localStorage.setItem("lovelyLocsPendingPayment", JSON.stringify({
      id: result.id,
      deposit: result.deposit,
      total: result.total,
      fullName: bookingPayload.client.fullName,
      referralCode: result.referralCode || referralCodeForName(bookingPayload.client.fullName),
      referralShareUrl: result.referralShareUrl || referralShareUrlForCode(result.referralCode || referralCodeForName(bookingPayload.client.fullName)),
      friendTest: result.friendTest || bookingPayload.friendTest,
      paymentOptions: publicPaymentOptions(result.paymentOptions)
    }));
    bookingConfirmation = {
      message: "Your appointment request was saved, but it is not finalized yet. Redirecting to the Lovely Locs pay options page for the required deposit. You will receive the official confirmation once Lovely Locs confirms the deposit was received."
    };
    openPayOptionsRoute(result.payOptionsUrl);
    return;
  } catch (bookingError) {
    if (error) error.textContent = bookingError.message;
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.originalText || "Submit Request & View Pay Options";
    }
  }
}

document.getElementById("menuButton").addEventListener("click", () => drawer.classList.add("open"));
document.getElementById("closeDrawer").addEventListener("click", () => drawer.classList.remove("open"));
drawer.addEventListener("click", event => {
  if (event.target === drawer) drawer.classList.remove("open");
});
document.querySelectorAll(".drawer a").forEach(link => {
  link.addEventListener("click", () => {
    drawer.classList.remove("open");
    const anchor = link.dataset.anchor;
    if (anchor) setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  });
});

document.querySelectorAll("[data-route]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    const route = link.dataset.route || "home";
    drawer.classList.remove("open");
    closeBooking();
    closeCart();
    closeAdvisory();
    closeProductPreference();
    closePartingPreference();
    pendingAnchor = null;
    window.location.hash = route;
    render(route);
    scrollRouteToTop(route);
  });
});

document.querySelector("[data-header-booking]").addEventListener("click", () => {
  goToServices();
});

document.querySelector("[data-drawer-booking]").addEventListener("click", () => {
  goToServices();
});

const themeToggle = document.getElementById("themeToggle");

function syncThemeToggle() {
  const isDark = document.documentElement.classList.contains("dark");
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  themeToggle.textContent = isDark ? String.fromCharCode(9728) : String.fromCharCode(9790);
  themeToggle.setAttribute?.("aria-label", label);
  themeToggle.setAttribute?.("title", label);
}

themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("darkMode", document.documentElement.classList.contains("dark") ? "true" : "false");
  syncThemeToggle();
});

if (localStorage.getItem("darkMode") !== "false") document.documentElement.classList.add("dark");
syncThemeToggle();
applyLogoSettings();
syncOwnerAdminAccess();
fetchLogoSettings();
function applyVisualVersion(versionId) {
  visualVersions.forEach(version => document.documentElement.classList.remove(`visual-${version.id}`));
  document.documentElement.classList.add(`visual-${versionId}`);
}

applyVisualVersion(localStorage.getItem("visualVersion") || "v0");
window.addEventListener("hashchange", () => render(currentRoute()));
render();

