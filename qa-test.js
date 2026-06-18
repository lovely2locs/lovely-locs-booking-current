const fs = require("fs");
const vm = require("vm");

class FakeClassList {
  constructor() {
    this.values = new Set();
  }
  add(...names) { names.forEach(name => this.values.add(name)); }
  remove(...names) { names.forEach(name => this.values.delete(name)); }
  toggle(name, force) {
    if (force === true) {
      this.values.add(name);
      return true;
    }
    if (force === false) {
      this.values.delete(name);
      return false;
    }
    if (this.values.has(name)) {
      this.values.delete(name);
      return false;
    }
    this.values.add(name);
    return true;
  }
  contains(name) { return this.values.has(name); }
}

class FakeElement {
  constructor(id = "") {
    this.id = id;
    this.innerHTML = "";
    this.textContent = "";
    this.classList = new FakeClassList();
    this.listeners = {};
    this.dataset = {};
    this.parentElement = null;
    this.checked = false;
  }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  querySelector() { return new FakeElement(); }
  querySelectorAll() { return []; }
  scrollIntoView() { this.scrolled = true; }
}

const elements = {
  app: new FakeElement("app"),
  drawer: new FakeElement("drawer"),
  menuButton: new FakeElement("menuButton"),
  closeDrawer: new FakeElement("closeDrawer"),
  themeToggle: new FakeElement("themeToggle"),
  bookingModal: new FakeElement("bookingModal"),
  advisoryModal: new FakeElement("advisoryModal"),
  productPreferenceModal: new FakeElement("productPreferenceModal"),
  partingPreferenceModal: new FakeElement("partingPreferenceModal"),
  cart: new FakeElement("cart"),
  bookingForm: new FakeElement("bookingForm"),
  bookingError: new FakeElement("bookingError"),
  policyAcknowledgement: new FakeElement("policyAcknowledgement"),
  bookingTime: new FakeElement("bookingTime"),
  bookingEmergencySlot: new FakeElement("bookingEmergencySlot"),
  services: new FakeElement("services")
};
elements.bookingForm.reportValidity = () => true;
elements.bookingTime.value = "18:30";

const document = {
  documentElement: new FakeElement("html"),
  getElementById(id) {
    return elements[id] || new FakeElement(id);
  },
  querySelector() { return new FakeElement(); },
  querySelectorAll() { return []; }
};

const localStore = new Map();
const context = {
  document,
  window: {
    location: { hash: "", href: "", search: "" },
    addEventListener() {},
    scrollTo(options) { context.lastScrollTo = options; },
    localStorage: null
  },
  navigator: {
    clipboard: {
      async writeText(text) { context.lastCopiedText = text; }
    }
  },
  localStorage: {
    getItem(key) { return localStore.get(key) || null; },
    setItem(key, value) { localStore.set(key, value); },
    removeItem(key) { localStore.delete(key); }
  },
  console,
  fetch: async (url, options) => {
    context.lastFetch = { url, options };
    if (url === "/api/discount/validate") {
      return {
        ok: true,
        json: async () => ({ ok: true, code: "LOVELY10", percent: 10, expiresAt: "2026-12-31", message: "LOVELY10 applied for 10% off." })
      };
    }
    if (url === "/api/discount/email") {
      return {
        ok: true,
        json: async () => ({ ok: true, message: "Promo code email was sent." })
      };
    }
    return {
      ok: true,
      json: async () => ({
        ok: true,
        id: "LL-TEST",
        payOptionsUrl: "http://127.0.0.1:4175/?booking=LL-TEST&deposit=30#payment-options",
        paymentOptions: [
          { id: "venmo", label: "Venmo", handle: "@LovelyLocs", note: "Include your booking ID." },
          { id: "apple-pay", label: "Apple Pay", handle: "lovely2locs@gmail.com", note: "Include your booking ID." }
        ],
        total: 100,
        deposit: 30,
        friendTest: {
          code: "LL-FRIEND-01",
          campaign: "friends-booking-test-2026-06",
          slot: 1,
          automatic: true,
          completedCheckpoints: 0,
          totalCheckpoints: 8,
          percentComplete: 0,
          complete: false,
          missing: ["home", "services", "products", "policies", "contact", "privacy", "sms-opt-in", "terms"],
          bookingSubmitted: true
        },
        referralCode: "LOVELYLOCS/TESTCLIENT",
        referralShareUrl: "http://127.0.0.1:4175/?ref=LOVELYLOCS%2FTESTCLIENT#services"
      })
    };
  },
  URLSearchParams,
  setTimeout(fn) { fn(); },
  alert(message) { context.lastAlert = message; }
};
context.window.localStorage = context.localStorage;
context.FormData = class {
  constructor() {
    this.values = new Map([
      ["fullName", "Test Client"],
      ["email", "client@example.com"],
      ["phone", "(555) 123-4567"],
      ["date", "2026-06-01"],
      ["time", "18:30"],
      ["birthday", "1998-07-31"],
      ["adminToken", "OWNER-TEST-TOKEN"],
      ["referredByCode", "lovelylocs/Test Client"],
      ["emergencySlot", ""],
      ["preferredContact", "text_email"],
      ["smsOptIn", "on"],
      ["specialRequests", "Test booking notes"],
      ["policyAcknowledgement", "on"]
    ]);
  }
  get(key) {
    return this.values.get(key) || "";
  }
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function appHtml() {
  return elements.app.innerHTML;
}

vm.createContext(context);
vm.runInContext(fs.readFileSync("script.js", "utf8"), context);

const tests = [];
function test(name, fn) { tests.push([name, fn]); }

test("home renders core client sections", () => {
  context.window.location.hash = "";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("Lovely Locs"), "brand missing");
  assert(html.includes("Which Service Should I Book?"), "service guide missing");
  assert(html.includes("Service Menu"), "service menu missing");
  assert(html.includes("Portfolio Preview"), "portfolio missing");
  assert(html.includes("Client Notes"), "testimonials missing");
  assert(html.includes("How Booking Works"), "booking process missing");
  assert(html.includes("Booking Prep Checklist"), "prep checklist missing");
  assert(html.includes("Mini Service Quiz"), "service quiz missing");
  assert(html.includes("On schedule (6 to 8 weeks since last retwist)"), "on-schedule timing clarification missing");
  assert(html.includes("Loc accessories only"), "loc-accessories quiz option missing");
  assert(!html.includes("Style or sparkle too"), "outdated style-or-sparkle quiz option still shown");
  assert(html.includes("Referral Rewards"), "referral share section missing");
  assert(html.includes("data-share-booking"), "share booking button missing");
  assert(html.includes("ios-share-icon"), "iphone-style share icon missing");
  assert(html.includes("data-copy-booking"), "copy booking button missing");
});

test("site shell loads the deployed mini-quiz wording patch", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const patch = fs.readFileSync("quiz-copy-hotfix.js", "utf8");
  assert(html.includes("quiz-copy-hotfix.js?v=20260613-timing-labels"), "mini-quiz wording patch is not loaded");
  assert(patch.includes("On schedule (6 to 8 weeks since last retwist)"), "deployed on-schedule wording missing");
  assert(patch.includes("Loc accessories only"), "deployed accessories-only wording missing");
});

test("site shell keeps public policy links in the left menu and hides owner admin by default", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const nav = html.slice(html.indexOf('<div class="nav-actions">'), html.indexOf("</nav>"));
  const drawerMarkup = html.slice(html.indexOf('<aside class="drawer"'), html.indexOf("</aside>"));
  assert(html.includes('href="#products" data-route="products">Products'), "products link missing from site shell");
  assert(html.includes('href="#client-settings" data-route="client-settings">Client Login'), "client login link missing from site shell");
  for (const route of ["policies", "contact", "privacy", "sms-opt-in"]) {
    assert(!nav.includes(`data-route="${route}"`), `${route} should not remain in the top navigation`);
    assert(drawerMarkup.includes(`data-route="${route}"`), `${route} should remain in the left menu`);
  }
  assert(html.includes('data-route="admin" data-owner-admin hidden'), "owner admin link should be hidden by default");
});

test("policies route renders FAQ and policies", () => {
  context.window.location.hash = "#policies";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("Policies &amp; FAQ"), "policy hero missing");
  assert(html.includes("Lovely Locs Booking Standards"), "booking standards missing");
  assert(html.includes("Prices, add-ons, advisory changes"), "clear pricing policy copy missing");
  assert(html.includes("quality loc work cannot be rushed"), "unrushed quality work policy missing");
  assert(html.includes("Frequently Asked Questions"), "FAQ missing");
  assert(html.includes("Are deposits refundable?"), "deposit FAQ missing");
});

test("products route renders products and cart", () => {
  context.window.location.hash = "#products";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("Products"), "products page missing");
  assert(html.includes("Recommended Hair Products"), "recommended hair products section missing");
  assert(html.includes("Worth Stocking Soon"), "stocking shortlist missing");
  assert(html.includes("Quality first, margin second."), "stocking strategy headline missing");
  assert(html.includes("Loc Jewels &amp; Accessories"), "accessories section missing");
  assert(html.includes("Review source"), "review source links missing");
  assert(html.includes("data-product-filter"), "product filter controls missing");
  assert(html.includes("product-visual"), "product visual badges missing");
  assert(html.includes("Locsanity Rosewater & Peppermint Spray"), "recommended loc product missing");
  assert((html.match(/Add to Cart/g) || []).length >= 4, "product add buttons missing");
  assert(html.includes("Your Cart"), "cart markup missing");
});

test("version route renders rollback options", () => {
  context.window.location.hash = "#versions";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("Version History"), "version page missing");
  assert((html.match(/data-version=/g) || []).length >= 8, "version buttons missing");
});

test("admin route offers free no-charge test booking", () => {
  context.saveClientProfile({
    username: "LOVELY2LOCS",
    email: "lovely2locs@gmail.com",
    referralCode: "LOVELYLOCS/LOVELY2LOCS"
  });
  context.window.location.hash = "#admin";
  context.render(context.currentRoute());
  let html = appHtml();
  assert(html.includes("Admin Test Booking"), "admin test page missing");
  assert(html.includes("Free Admin Test Booking"), "free test service missing");
  assert(html.includes("No deposit"), "no-charge deposit note missing");
  assert(html.includes("Logo size and centering"), "admin logo settings section missing");
  assert(html.includes("data-save-logo-settings"), "admin logo save control missing");
  assert(html.includes("Discount Code Settings"), "admin discount settings section missing");
  assert(html.includes("data-save-discount-settings"), "admin discount save control missing");
  assert(html.includes("Notification Status"), "launch readiness notification status missing");
  assert(html.includes("data-refresh-notification-status"), "notification status refresh control missing");
  assert(html.includes("Confirm a Client Deposit"), "manual deposit confirmation section missing");
  assert(html.includes("data-confirm-manual-deposit"), "manual deposit confirmation control missing");
  assert(html.includes("Deposit Not Received - Release Slot"), "unpaid hold release control missing");
  assert(html.includes("data-release-unpaid-hold"), "unpaid hold release button binding missing");
  assert(html.includes("Resend Client Confirmation"), "client confirmation recovery section missing");
  assert(html.includes("data-resend-client-confirmation"), "client confirmation resend control missing");
  assert(html.includes("Send Notification Test"), "admin notification test section missing");
  assert(html.includes("data-send-notification-test"), "admin notification test control missing");
  context.addAdminTestBooking();
  html = appHtml();
  assert(html.includes("Cart (1)"), "admin test booking should replace cart with one item");
  assert(html.includes("Deposit Required Before Confirmation: $0"), "admin test deposit should be zero");
  assert(html.includes('name="adminToken"'), "admin no-charge booking should require the owner token");
  assert(html.includes("Submit No-Charge Test Booking"), "admin no-charge submit button missing");
});

test("non-owner accounts cannot render admin features", () => {
  context.saveClientProfile({
    fullName: "Regular Client",
    email: "client@example.com",
    referralCode: "LOVELYLOCS/REGULARCLIENT"
  });
  context.window.location.hash = "#admin";
  context.render("admin");
  const html = appHtml();
  assert(html.includes("Owner Admin is available only when the LOVELY2LOCS account is signed in."), "non-owner admin access notice missing");
  assert(!html.includes("data-save-logo-settings"), "non-owner account should not receive admin controls");
  assert(context.window.location.hash === "client-settings", "non-owner admin route should return to client login");
});

test("payment options route renders manual deposit instructions", () => {
  context.window.location.hash = "#payment-options";
  context.window.location.search = "?booking=LL-TEST&deposit=30";
  localStore.set("lovelyLocsPendingPayment", JSON.stringify({
    id: "LL-TEST",
    deposit: 30,
    fullName: "Test Client",
    referralCode: "LOVELYLOCS/TESTCLIENT",
    referralShareUrl: "http://127.0.0.1:4175/?ref=LOVELYLOCS%2FTESTCLIENT#services",
    paymentOptions: [
      { id: "venmo", label: "Venmo", handle: "@LovelyLocs", note: "Include your booking ID." },
      { id: "apple-pay", label: "Apple Pay", handle: "lovely2locs@gmail.com", note: "Include your booking ID." }
    ]
  }));
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("Pay Your Lovely Locs Deposit"), "payment options heading missing");
  assert(html.includes("Venmo"), "Venmo option missing");
  assert(!html.includes("Cash App"), "Cash App should be hidden until re-enabled");
  assert(html.includes("Apple Pay"), "Apple Pay option missing");
  assert(html.includes("not finalized yet"), "payment page should clarify appointment is not finalized before deposit");
  assert(html.includes("official confirmation once the deposit is confirmed as received"), "manual verification confirmation language missing");
  assert(html.includes("LOVELYLOCS/TESTCLIENT"), "payment page should show the client's referral code");
  assert(html.includes("data-copy-personal-referral-code"), "payment page referral code copy button missing");
  assert(html.includes("data-copy-personal-referral-link"), "payment page referral link copy button missing");
  assert(html.includes("data-share-personal-referral"), "payment page referral share button missing");
  assert(!html.includes("Friends Website Test"), "regular clients should not see the friend-test thank-you");
  context.window.location.search = "";
});

test("friend test invite tracks checkpoints and unlocks the checkout Easter egg", () => {
  context.window.location.search = "?friend-test=LL-FRIEND-01";
  context.window.location.hash = "#home";
  vm.runInContext("friendTestState = loadFriendTestState()", context);
  context.render(context.currentRoute());

  context.window.location.hash = "#services";
  context.render(context.currentRoute());
  for (const route of ["products", "policies", "contact", "privacy", "sms-opt-in", "terms"]) {
    context.window.location.hash = `#${route}`;
    context.render(context.currentRoute());
  }

  const state = JSON.parse(localStore.get("lovelyLocsFriendTest") || "{}");
  assert(state.code === "LL-FRIEND-01", "friend-test invite code was not stored");
  assert(state.visited.length === 8, "all friend-test checkpoints should be recorded once");
  const snapshot = context.friendTestSnapshot(true);
  assert(snapshot.complete, "complete friend-test journey should be recognized");
  assert(snapshot.percentComplete === 100, "complete friend-test journey should report 100 percent");

  localStore.set("lovelyLocsPendingPayment", JSON.stringify({
    id: "LL-FRIEND-TEST",
    deposit: 30,
    fullName: "Friend Tester",
    referralCode: "LOVELYLOCS/FRIENDTESTER",
    referralShareUrl: "http://127.0.0.1:4175/?ref=LOVELYLOCS%2FFRIENDTESTER#services",
    friendTest: snapshot,
    paymentOptions: [
      { id: "venmo", label: "Venmo", handle: "@LovelyLocs", note: "Include your booking ID." }
    ]
  }));
  context.window.location.search = "?booking=LL-FRIEND-TEST&deposit=30";
  context.window.location.hash = "#payment-options";
  context.render(context.currentRoute());
  assert(appHtml().includes("Thank you for testing the Lovely Locs booking service for me."), "completed friend tester should see the testing thank-you");
  assert(appHtml().includes("You also found the Golden Loc."), "completed friend tester should see the Easter egg");
  assert(appHtml().includes("LL-FRIEND-01"), "friend-test completion should show the tester code");

  context.window.location.search = "";
  context.window.location.hash = "#home";
  localStore.delete("lovelyLocsFriendTest");
  localStore.delete("lovelyLocsPendingPayment");
  vm.runInContext("friendTestState = null", context);
  context.render(context.currentRoute());
});

test("contact route renders public business contact", () => {
  context.window.location.hash = "#contact";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("lvlc.support@lovelylocsnc.com"), "email missing");
  assert(html.includes("(336)-471-1098"), "phone missing");
  assert(html.includes("Piedmont Triad"), "location missing");
});

test("privacy and terms routes render SMS safeguards", () => {
  context.window.location.hash = "#privacy";
  context.render(context.currentRoute());
  let html = appHtml();
  assert(html.includes("Privacy Policy"), "privacy page missing");
  assert(html.includes("does not sell, rent, or share SMS opt-in data"), "SMS no-sharing privacy language missing");
  assert(html.includes("appointment confirmations, deposit/payment updates, appointment reminders, and service-related updates"), "privacy transactional SMS scope missing");
  assert(html.includes("replying STOP"), "privacy opt-out language missing");

  context.window.location.hash = "#terms";
  context.render(context.currentRoute());
  html = appHtml();
  assert(html.includes("Terms &amp; Conditions"), "terms page missing");
  assert(html.includes("Referral Rewards"), "referral reward safeguards missing");
  assert(html.includes("not guaranteed for every client"), "non-guarantee terms missing");
  assert(html.includes("Lovely Locs does not provide medical care"), "service-scope terms missing");
  assert(html.includes("quality work cannot be rushed"), "unrushed timing terms missing");
  assert(html.includes("including appointment confirmations, deposit/payment updates, appointment reminders, and service-related updates"), "terms transactional SMS scope missing");
  assert(!html.includes("campaign messages"), "terms should not include SMS campaign consent");
});

test("sms opt-in route renders consent proof form", () => {
  context.window.location.hash = "#sms-opt-in";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("SMS Opt-In"), "sms opt-in page missing");
  assert(html.includes("Lovely Locs Text Message Opt-In"), "sms consent form heading missing");
  assert(html.includes("Coming Soon"), "sms opt-in page should mark text messaging as coming soon");
  assert(html.includes("Text service is not active yet"), "sms opt-in page should explain current text availability");
  assert(html.includes("appointment confirmations, deposit/payment updates, appointment reminders, and service-related updates"), "transactional opt-in scope missing");
  assert(html.includes('name="smsConsent" type="checkbox"'), "sms consent checkbox missing");
  assert(!html.includes('name="smsConsent" type="checkbox" checked'), "sms consent checkbox must not be preselected");
  assert(html.includes("Message frequency varies"), "message frequency disclosure missing");
  assert(html.includes("Reply STOP to opt out"), "STOP disclosure missing");
  assert(html.includes("HELP for help"), "HELP disclosure missing");
  assert(!html.includes("loc care tips"), "sms opt-in proof should not include loc care marketing language");
  assert(!html.includes("referral updates"), "sms opt-in proof should not include referral marketing language");
});

test("adding a service updates cart and booking modal", () => {
  context.clearClientProfile();
  context.window.location.hash = "";
  context.clearCart();
  context.addToCart({ id: "qa-service", type: "service", name: "QA Service", price: 100, duration: "1h" });
  const html = appHtml();
  assert(html.includes("Cart (1)"), "cart count did not update");
  assert(html.includes("Services: QA Service"), "booking modal did not use selected service");
  assert(html.includes("Submit Request &amp; View Pay Options"), "pay options button missing");
  assert(html.includes("I agree to receive text messages from Lovely Locs about my booking"), "booking modal SMS consent wording missing");
  assert(html.includes("deposit/payment updates"), "booking modal SMS payment-update scope missing");
  assert(html.includes("Finalize Cart &amp; Enter Details"), "final cart CTA missing");
  assert(html.includes("Client sign in / saved details"), "cart saved-details link missing");
  assert(html.includes("Promo Code"), "cart promo field missing");
  assert(html.includes("data-email-promo"), "promo email control missing");
});

test("promo code can be applied and included in booking payload", async () => {
  context.window.location.hash = "";
  context.clearCart();
  context.addToCart({ id: "qa-service", type: "service", name: "QA Service", price: 100, duration: "1h" });
  elements.promoCodeInput = new FakeElement("promoCodeInput");
  elements.promoCodeInput.value = "lovely10";
  await context.applyPromoCode();
  assert(localStore.get("lovelyLocsAppliedDiscount").includes("LOVELY10"), "applied discount should be stored");
  const payload = context.bookingPayloadFromForm(elements.bookingForm);
  assert(payload.discountCode === "LOVELY10", "booking payload should include applied promo code");
  assert(payload.total === 90, "booking payload should show discounted client preview total");
  context.saveAppliedDiscount(null);
});

test("referral codes use the LOVELYLOCS username format", () => {
  const payload = context.bookingPayloadFromForm(elements.bookingForm);
  assert(payload.client.referredByCode === "LOVELYLOCS/TESTCLIENT", "referral code should preserve the LOVELYLOCS/USERNAME format");
  assert(context.normalizeReferralCode(" lovelylocs / Referral Owner ") === "LOVELYLOCS/REFERRALOWNER", "referral code normalizer should remove username spaces");
  assert(context.referralCodeForName("Fatima Diallo") === "LOVELYLOCS/FATIMADIALLO", "client name should create the visible personal referral code");
  const card = context.personalReferralCard({ fullName: "Fatima Diallo", preview: true });
  assert(card.includes("LOVELYLOCS/FATIMADIALLO"), "personal referral preview should plug in the supplied client name");
  assert(card.includes("Copy Code") && card.includes("Copy Link") && card.includes("Share"), "personal referral preview should offer one-click sharing controls");
});

test("service selection opens cart before client details", () => {
  const script = fs.readFileSync("script.js", "utf8");
  const handlerStart = script.indexOf('document.querySelectorAll("[data-add-service]")');
  const handlerEnd = script.indexOf('document.querySelectorAll("[data-add-product]")');
  const handler = script.slice(handlerStart, handlerEnd);
  assert(handler.includes("addServiceFromAdvisory(service);"), "service add should use the cart-first service flow");
  assert(!handler.includes("openBooking();"), "service add should not force client details immediately");
});

test("adult retwist advisory can switch overdue clients to overdue retwist", () => {
  context.openAdvisory({ id: "adult-retwist", type: "service", name: "Adult Retwist (Maintenance)", price: 90, duration: "3h 30min" });
  assert(elements.advisoryModal.classList.contains("open"), "advisory modal did not open");
  context.handleRetwistAnswer("overdue");
  assert(elements.productPreferenceModal.classList.contains("open"), "product preference should open after overdue answer");
  context.handleProductPreference("Foam");
  const html = appHtml();
  assert(!elements.advisoryModal.classList.contains("open"), "advisory modal did not close");
  assert(!elements.productPreferenceModal.classList.contains("open"), "product preference modal did not close");
  assert(html.includes("Overdue Retwist (4+ Months)"), "overdue retwist was not selected");
  assert(html.includes("$125"), "overdue retwist price was not applied");
  assert(html.includes("Because your last retwist was 4+ months ago"), "price-change explanation missing");
  assert(html.includes("Base product: Foam"), "base product preference missing from cart");
  assert(html.includes("Base Product Preferences: Overdue Retwist (4+ Months) - Foam"), "base product preference missing from booking summary");
});

test("maintenance services ask for base product preference before cart", () => {
  context.openProductPreference({ id: "children-retwist", type: "service", name: "Children Retwist (Maintenance)", price: 75, duration: "3h", category: "loc-maintenance" });
  assert(elements.productPreferenceModal.classList.contains("open"), "product preference modal did not open");
  context.handleProductPreference("Oil and Water");
  const html = appHtml();
  assert(html.includes("Children Retwist (Maintenance)"), "maintenance service was not added after product choice");
  assert(html.includes("Base product: Oil and Water"), "selected base product missing from cart");
  assert(html.includes("Children Retwist (Maintenance) - Oil and Water"), "selected base product missing from summary");
});

test("starter locs ask parting preference and triangle parts add forty dollars", () => {
  context.openPartingPreference({ id: "medium-adult-starter", type: "service", name: "Medium Adult Starter Locs", price: 150, duration: "6h 30min", category: "starter-locs" });
  assert(elements.partingPreferenceModal.classList.contains("open"), "parting preference modal did not open");
  context.handlePartingPreference("Triangle Parts", "40");
  const html = appHtml();
  assert(!elements.partingPreferenceModal.classList.contains("open"), "parting preference modal did not close");
  assert(html.includes("Medium Adult Starter Locs + Triangle Parts"), "triangle starter service missing from cart");
  assert(html.includes("Parting: Triangle Parts (+$40)"), "triangle parting fee note missing from cart");
  assert(html.includes("Parting Preferences: Medium Adult Starter Locs + Triangle Parts - Triangle Parts (+$40)"), "parting preference missing from summary");
  assert(html.includes("$190"), "triangle parting total price missing");
});

test("top booking buttons route clients to services instead of default checkout", () => {
  const script = fs.readFileSync("script.js", "utf8");
  assert(script.includes("function goToServices()"), "service routing helper missing");
  assert(script.includes('document.querySelector("[data-header-booking]").addEventListener("click", () => {\n  goToServices();'), "header booking should route to services");
  assert(script.includes('document.querySelector("[data-drawer-booking]").addEventListener("click", () => {\n  goToServices();'), "drawer booking should route to services");
  const modalStart = script.indexOf("function bookingModal()");
  const modalEnd = script.indexOf("function render", modalStart);
  const modal = script.slice(modalStart, modalEnd);
  assert(!modal.includes('services.find(item => item.id === "adult-retwist")'), "checkout should not default to adult retwist");
});

test("route links include policies and explicit route handling", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const script = fs.readFileSync("script.js", "utf8");
  assert(html.includes('href="#policies" data-route="policies"'), "header policies link should have explicit route data");
  assert(html.includes('href="#privacy" data-route="privacy"'), "privacy link should have explicit route data");
  assert(html.includes('href="#terms" data-route="terms"'), "terms link should have explicit route data");
  assert(html.includes('href="#sms-opt-in" data-route="sms-opt-in"'), "sms opt-in link should have explicit route data");
  assert(script.includes('document.querySelectorAll("[data-route]")'), "route link handler missing");
  context.window.location.hash = "#policies";
  context.render(context.currentRoute());
  assert(appHtml().includes("Policies &amp; FAQ"), "policies route did not render policies page");
  assert(!appHtml().startsWith("<section class=\"hero\">\n      <h1>Contact"), "policies route should not render contact page");
});

test("second service stays in cart with first main service", () => {
  context.window.location.hash = "";
  context.addToCart({ id: "qa-service-2", type: "service", name: "Second QA Service", price: 200, duration: "2h" });
  const html = appHtml();
  assert(html.includes("Services: QA Service, Overdue Retwist (4+ Months), Children Retwist (Maintenance), Medium Adult Starter Locs + Triangle Parts, Second QA Service"), "services were not preserved together");
  assert(html.includes("Estimated Service Time: 1h + 4-5 hours + 3h + 6h 30min + 2h"), "combined service time missing");
  assert(html.includes("Cart (5)"), "cart should contain all main services");
});

test("add-on can be added alongside service", () => {
  context.window.location.hash = "";
  context.addToCart({ id: "qa-addon", type: "product", name: "QA Add-on", price: 15 });
  const html = appHtml();
  assert(html.includes("Cart (6)"), "cart should contain services and add-on");
  assert(html.includes("Add-ons / products: QA Add-on"), "add-on not shown in booking summary");
  assert(html.includes("Estimated Total: $705"), "estimated total incorrect");
});

test("booking form has required client fields", () => {
  context.window.location.hash = "";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes('name="fullName" required'), "full name not required");
  assert(html.includes('name="email" required'), "email not required");
  assert(html.includes('name="phone" required'), "phone not required");
  assert(html.includes('name="date" required'), "date not required");
  assert(html.includes("Appointment Date"), "appointment date label missing");
  assert(!html.includes("Preferred Date"), "checkout should not show a preferred date label");
  assert(html.includes('name="birthday" type="date"'), "optional guest birthday field missing");
  assert(html.includes("Guest clients can enter only their birthday"), "guest birthday guidance missing");
  assert(html.includes("2 weeks before your birthday"), "birthday credit start window missing");
  assert(html.includes("expires 1 month after it"), "birthday credit expiration window missing");
  assert(html.includes("No separate preferred redemption date is needed"), "birthday redemption-date guidance missing");
  assert(html.includes("For scheduling this appointment only"), "appointment-date purpose guidance missing");
  assert(html.includes("Your details save automatically"), "booking autosave notice missing");
  assert(html.includes('name="referredByCode"'), "referral code field missing");
  assert(html.includes('id="bookingTime" name="time"'), "appointment time slot input missing");
  assert(html.includes("Appointment Time"), "appointment time label missing");
  assert(html.includes("time-slot-grid"), "time slot picker missing");
  assert(html.includes('aria-pressed="false"') || html.includes("time-slot-placeholder"), "time slots should expose selected state accessibly");
  assert(html.includes("Emergency proposal"), "emergency slot legend missing");
  assert(html.includes('name="preferredContact"'), "preferred contact selector missing");
  assert(html.includes('name="smsOptIn"'), "optional communications opt-in checkbox missing");
  assert(html.includes("I agree to receive text messages from Lovely Locs about my booking"), "transactional SMS consent copy missing");
  assert(!html.includes('name="marketingEmailOptIn"'), "marketing email checkbox should stay separate from SMS booking consent");
  assert(!html.includes('name="referralOptIn"'), "referral reminder checkbox should stay separate from SMS booking consent");
  assert(html.includes("Good People Know Good People"), "referral campaign headline missing");
  assert(html.includes('value="text"'), "text contact option missing");
  assert(html.includes('value="email"'), "email contact option missing");
  assert(html.includes('Text + Email'), "text plus email contact option missing");
  assert(html.includes("Text messaging is coming soon while carrier approval is completed"), "checkout should explain that text messaging is coming soon");
  assert((html.match(/Coming Soon/g) || []).length >= 2, "checkout should mark both text contact choices as coming soon");
  assert(html.includes('value="email" checked'), "new bookings should default to the active email contact option");
  assert(!html.includes('name="address"'), "address field should not be shown for studio-only bookings");
  assert(html.includes("All services are held at the private Lovely Locs home studio"), "studio-only note missing");
  assert(html.includes('name="policyAcknowledgement"'), "policy acknowledgement checkbox missing");
  assert(html.includes("outside the listed loc/natural-hair scope"), "service scope acknowledgement missing");
  assert((html.match(/type="checkbox"/g) || []).length === 2, "checkout should use exactly two checkboxes");
  assert(html.includes("Privacy Policy"), "checkout should link to privacy policy");
  assert(html.includes("Terms &amp; Conditions"), "checkout should link to terms");
});

test("client settings route shows referral tracking surface", () => {
  context.window.location.hash = "#client-settings";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("Referral code and reward status"), "client settings heading missing");
  assert(html.includes("data-client-settings-login"), "client settings lookup control missing");
  assert(html.includes('id="googleSignInButton"'), "Google sign-in button container missing");
  assert(html.includes("New clients will complete a short one-time profile"), "Google signup guidance missing");
  assert(html.includes("data-switch-google-account"), "Google account switch control missing");
  assert(html.includes("pending referrals"), "client settings pending referral copy missing");
});

test("new Google clients receive one-time profile onboarding", async () => {
  const originalFetch = context.fetch;
  const cartBeforeSignup = localStore.get("lovelyLocsCart") || "";
  context.fetch = async url => {
    if (url === "/api/auth/google") {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          needsSignup: true,
          signup: { email: "newclient@gmail.com", fullName: "New Client" }
        })
      };
    }
    if (url === "/api/auth/google/config") {
      return { ok: true, json: async () => ({ ok: true, configured: false, clientId: "" }) };
    }
    if (url === "/api/auth/google/signup") {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          client: {
            fullName: "New Client",
            email: "newclient@gmail.com",
            phone: "(336) 555-3434",
            birthday: "",
            locJourneyLength: "",
            onboardingCompleted: true
          },
          referralCode: "LOVELYLOCS/NEWCLIENT",
          referrals: { pending: [], approved: [] },
          credits: []
        })
      };
    }
    return originalFetch(url);
  };
  await context.handleGoogleCredential({ credential: "test-google-credential" });
  const html = appHtml();
  assert(html.includes('id="googleSignupForm"'), "one-time Google signup form missing");
  assert(html.includes('name="birthday"'), "optional signup birthday missing");
  assert(html.includes('name="locJourneyLength"'), "optional loc journey question missing");
  assert(html.includes("Prefer not to answer"), "optional journey skip choice missing");
  await context.saveGoogleSignupProfile({
    fullName: "New Client",
    email: "newclient@gmail.com",
    phone: "(336) 555-3434",
    birthday: "",
    locJourneyLength: ""
  });
  const savedProfile = JSON.parse(localStore.get("lovelyLocsClientProfile") || "{}");
  assert(savedProfile.onboardingCompleted === true, "completed onboarding was not saved");
  assert(savedProfile.googleLinked === true, "Google-linked profile flag was not saved");
  const connectedHtml = appHtml();
  assert(connectedHtml.includes("Connected Google Account"), "connected Google account status missing");
  assert(connectedHtml.includes("newclient@gmail.com"), "connected Google account should show the verified email");
  assert(!connectedHtml.includes('id="googleSignInButton"'), "Google button should be hidden after an account is connected");
  assert((localStore.get("lovelyLocsCart") || "") === cartBeforeSignup, "Google signup should not clear the saved cart");
  context.switchGoogleAccount();
  assert(appHtml().includes('id="googleSignInButton"'), "Google button should return when switching accounts");
  assert((localStore.get("lovelyLocsCart") || "") === cartBeforeSignup, "switching Google accounts should preserve the cart");
  context.fetch = originalFetch;
});

test("saved client profile pre-fills booking basics", () => {
  context.saveClientProfile({
    fullName: "Saved Client",
    email: "saved@example.com",
    phone: "(336) 555-1212",
    birthday: "1998-07-31",
    birthday: "1998-07-31",
    locJourneyLength: "3_to_5_years",
    onboardingCompleted: true,
    preferredContact: "email",
    smsOptIn: true,
    marketingEmailOptIn: true,
    referralOptIn: true,
    specialRequests: "Saved notes"
  });
  context.window.location.hash = "";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes('value="Saved Client"'), "saved full name did not prefill");
  assert(html.includes('value="saved@example.com"'), "saved email did not prefill");
  assert(html.includes('value="(336) 555-1212"'), "saved phone did not prefill");
  assert(html.includes('value="1998-07-31"'), "saved birthday did not prefill");
  assert(html.includes('value="email" checked'), "saved preferred contact did not preselect");
  assert(html.includes('name="smsOptIn" type="checkbox" checked'), "saved SMS opt-in did not precheck");
  assert(html.includes("Saved notes"), "saved notes did not prefill");
  const payload = context.bookingPayloadFromForm(elements.bookingForm);
  assert(payload.client.birthday === "1998-07-31", "saved birthday should travel with future booking records");
  assert(payload.client.locJourneyLength === "3_to_5_years", "saved loc journey should travel with future booking records");
  context.clearClientProfile();
});

test("unfinished booking details persist for refresh and cart changes", () => {
  context.saveBookingDraft(elements.bookingForm);
  const storedDraft = JSON.parse(localStore.get("lovelyLocsBookingDraft") || "{}");
  assert(storedDraft.fullName === "Test Client", "unfinished client name was not saved");
  assert(storedDraft.birthday === "1998-07-31", "unfinished birthday was not saved");
  assert(storedDraft.date === "2026-06-01", "unfinished booking date was not saved");
  assert(storedDraft.time === "18:30", "unfinished booking time was not saved");
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes('value="Test Client"'), "saved draft name did not restore");
  assert(html.includes('value="2026-06-01"'), "saved draft date did not restore");
  assert(html.includes("Saved details restored"), "saved draft restoration notice missing");
});

test("anchor route maps to home for section navigation", () => {
  context.window.location.hash = "#services";
  assert(context.currentRoute() === "home", "services hash should render home");
  context.render(context.currentRoute());
  assert(elements.services.scrolled, "services anchor did not scroll after render");
});

test("dark mode toggle stores and applies client preference", () => {
  assert(elements.themeToggle.textContent === String.fromCharCode(9790), "light mode moon icon missing");
  elements.themeToggle.listeners.click();
  assert(document.documentElement.classList.contains("dark"), "dark class not applied");
  assert(localStore.get("darkMode") === "true", "dark preference not stored");
  assert(elements.themeToggle.textContent === String.fromCharCode(9728), "dark mode sun icon missing");
  elements.themeToggle.listeners.click();
  assert(!document.documentElement.classList.contains("dark"), "dark class not removed");
  assert(localStore.get("darkMode") === "false", "light preference not stored");
  assert(elements.themeToggle.textContent === String.fromCharCode(9790), "light mode moon icon not restored");
});

test("drawer menu opens, closes, and closes on backdrop", () => {
  elements.menuButton.listeners.click();
  assert(elements.drawer.classList.contains("open"), "drawer did not open");
  elements.closeDrawer.listeners.click();
  assert(!elements.drawer.classList.contains("open"), "drawer did not close with close button");
  elements.menuButton.listeners.click();
  elements.drawer.listeners.click({ target: elements.drawer });
  assert(!elements.drawer.classList.contains("open"), "drawer did not close from backdrop");
});

test("booking modal open and close states work", () => {
  context.openBooking();
  assert(elements.bookingModal.classList.contains("open"), "booking modal did not open");
  context.closeBooking();
  assert(!elements.bookingModal.classList.contains("open"), "booking modal did not close");
});

test("booking submission blocks missing required details", async () => {
  elements.bookingForm.reportValidity = () => false;
  elements.policyAcknowledgement.checked = false;
  await context.submitBooking();
  assert(elements.bookingError.textContent.includes("Please complete"), "missing form error");
  assert(!context.lastAlert, "invalid booking should not alert success");
  elements.bookingForm.reportValidity = () => true;
});

test("booking submission requires policy acknowledgement", async () => {
  context.lastAlert = "";
  elements.bookingForm.reportValidity = () => true;
  elements.policyAcknowledgement.checked = false;
  await context.submitBooking();
  assert(elements.bookingError.textContent.includes("read the Lovely Locs policies"), "policy acknowledgement error missing");
  assert(!context.lastAlert, "booking should not submit without policy acknowledgement");
});

test("booking submission sends booking to backend and shows confirmation", async () => {
  context.lastAlert = "";
  context.window.location.href = "";
  elements.bookingError.textContent = "previous error";
  elements.policyAcknowledgement.checked = true;
  await context.submitBooking();
  assert(elements.bookingError.textContent === "", "valid booking should clear error");
  assert(context.lastFetch.url === "/api/bookings", "valid booking should post to booking backend");
  assert(context.lastFetch.options.body.includes("Test Client"), "booking backend payload should include client details");
  assert(context.lastFetch.options.body.includes('"time":"18:30"'), "booking backend payload should include selected time");
  assert(context.lastFetch.options.body.includes("text_email"), "booking backend payload should include preferred contact");
  assert(context.lastFetch.options.body.includes("smsOptIn"), "booking backend payload should include sms opt-in status");
  assert(context.lastFetch.options.body.includes("marketingEmailOptIn"), "booking backend payload should include monthly referral campaign opt-in status");
  assert(context.lastFetch.options.body.includes("referralOptIn"), "booking backend payload should include referral reminder opt-in status");
  assert(context.lastFetch.options.body.includes("1998-07-31"), "booking backend payload should include the guest birthday");
  assert(context.lastFetch.options.body.includes("LOVELYLOCS/TESTCLIENT"), "booking backend payload should include referral code used by new client");
  assert(context.window.location.href === "http://127.0.0.1:4175/?booking=LL-TEST&deposit=30#payment-options", "valid booking should redirect to pay options");
  assert(localStore.get("lovelyLocsPendingPayment").includes("LL-TEST"), "manual payment details should be stored for the pay options page");
  assert(localStore.get("lovelyLocsPendingPayment").includes("Thank you") === false, "pending payment should store tester data, not rendered thank-you copy");
  assert(localStore.get("lovelyLocsPendingPayment").includes("LL-FRIEND-01"), "automatic friend-test assignment should be stored for checkout");
  assert(localStore.get("lovelyLocsPendingPayment").includes("LOVELYLOCS/TESTCLIENT"), "pending payment details should preserve the client's personal referral code");
  assert(localStore.get("lovelyLocsCart") !== "[]", "cart should stay available until deposit is confirmed");
  assert(!localStore.get("lovelyLocsBookingDraft"), "completed booking should clear the unfinished draft");
});

test("admin no-charge booking submission does not require pay options URL", async () => {
  const previousFetch = context.fetch;
  context.fetch = async (url, options) => {
    if (url === "/api/bookings") context.lastFetch = { url, options };
    return {
      ok: true,
      json: async () => ({ ok: true, id: "LL-TEST-FREE", noCharge: true, total: 0, deposit: 0, message: "Free admin test booking saved." })
    };
  };
  context.saveClientProfile({
    username: "LOVELY2LOCS",
    email: "lovely2locs@gmail.com",
    referralCode: "LOVELYLOCS/LOVELY2LOCS"
  });
  context.window.location.hash = "#admin";
  context.window.location.href = "";
  context.addAdminTestBooking();
  elements.policyAcknowledgement.checked = true;
  await context.submitBooking();
  assert(context.lastFetch.url === "/api/bookings", "admin test should post to booking backend");
  assert(context.lastFetch.options.body.includes("admin-test-booking"), "admin test payload missing service id");
  assert(context.lastFetch.options.body.includes('"adminToken":"OWNER-TEST-TOKEN"'), "admin test payload missing owner token");
  assert(context.lastFetch.options.body.includes('"deposit":0'), "admin test payload should carry zero deposit");
  assert(context.window.location.href === "", "admin test should not redirect to pay options");
  assert(appHtml().includes("Free admin test booking saved."), "admin test confirmation message missing");
  context.fetch = previousFetch;
});

test("server includes manual deposit confirmation and legacy Stripe webhook endpoints", () => {
  const server = fs.readFileSync("local-server.js", "utf8");
  assert(server.includes("manualPaymentOptions"), "manual payment options helper missing");
  assert(server.includes("notifyManualPaymentPending"), "manual pending owner notification missing");
  assert(server.includes("notifyManualDepositPaid"), "manual deposit confirmation notifier missing");
  assert(server.includes("brandEmailHtml"), "branded email HTML template missing");
  assert(server.includes("emailLogoUrl"), "email logo asset missing");
  assert(server.includes("Your loc time is confirmed"), "relaxed confirmation email copy missing");
  assert(server.includes("referralEmailCardHtml"), "confirmation email referral card missing");
  assert(server.includes("Share My Referral Link"), "confirmation email referral share button missing");
  assert(server.includes("Your personal referral code:"), "confirmation email referral code text missing");
  assert(server.includes("Take a breath"), "warm confirmation email intro missing");
  assert(server.includes("html: options.html"), "Resend HTML email payload missing");
  assert(server.includes("gmailComposeUrl"), "Gmail compose fallback missing");
  assert(server.includes("gmailDraftUrl"), "client confirmation Gmail draft link missing");
  assert(server.includes("/api/manual-payment/confirm"), "manual confirmation endpoint missing");
  assert(server.includes("/api/manual-payment/release"), "manual unpaid hold release endpoint missing");
  assert(server.includes("/api/admin/booking"), "protected owner booking lookup endpoint missing");
  assert(server.includes("handleAdminBookingLookup"), "protected owner booking lookup handler missing");
  assert(server.includes("/api/admin/bookings"), "protected recent bookings endpoint missing");
  assert(server.includes("handleAdminRecentBookings"), "protected recent bookings handler missing");
  assert(server.includes("sanitizeFriendTest"), "friend-test payload sanitizer missing");
  assert(server.includes("nextAutomaticFriendTest"), "automatic first-ten friend-test assignment missing");
  assert(server.includes("friendTestCampaignLimit = 10"), "friend-test campaign should be limited to ten bookings");
  assert(server.includes("friendTestCheckpoints"), "friend-test checkpoint allowlist missing");
  assert(server.includes("Website coverage:"), "friend-test owner coverage report missing");
  assert(server.includes("booking.friendTest || null"), "admin booking response should include friend-test coverage");
  assert(server.includes("/api/admin/confirmation/resend"), "protected confirmation resend endpoint missing");
  assert(server.includes("handleAdminConfirmationResend"), "confirmation resend handler missing");
  assert(server.includes("containsAdminTestService && !tokenIsValid"), "admin test booking endpoint should require the owner token");
  assert(server.includes("manual.deposit.confirmed"), "manual deposit confirmed event missing");
  assert(server.includes("manual.deposit.released_unpaid"), "manual unpaid hold release event missing");
  assert(server.includes("released_unpaid"), "released unpaid status missing");
  assert(server.includes("alreadyConfirmed"), "manual deposit confirmation retry guard missing");
  assert(server.includes("/api/notifications/test"), "notification test endpoint missing");
  assert(server.includes("handleNotificationTest"), "notification test handler missing");
  assert(server.includes("TWILIO_TOLLFREE_VERIFIED"), "Twilio toll-free verification guard missing");
  assert(server.includes("smsBlockedReason"), "SMS blocked reason helper missing");
  assert(server.includes("smsReady"), "SMS readiness status missing");
  assert(server.includes("/api/availability"), "availability endpoint missing");
  assert(server.includes("classifyAppointmentTime"), "appointment time classifier missing");
  assert(server.includes("emailConfigured"), "email configuration status helper missing");
  assert(server.includes("emailReadyForClients"), "client email readiness status missing");
  assert(server.includes("emailReadinessReason"), "client email readiness reason missing");
  assert(server.includes("/api/site-settings"), "site settings endpoint missing");
  assert(server.includes("sanitizeLogoSettings"), "logo settings sanitizer missing");
  assert(server.includes("sanitizeDiscountSettings"), "discount settings sanitizer missing");
  assert(server.includes("/api/discount/validate"), "discount validation endpoint missing");
  assert(server.includes("/api/discount/email"), "discount email endpoint missing");
  assert(server.includes("activeDiscountForCode"), "server discount validator missing");
  assert(server.includes("discountAmountForTotal"), "trusted server discount calculation missing");
  assert(server.includes("availableClientCredit"), "earned client credit helper missing");
  assert(server.includes("chooseBookingDiscount"), "one-discount-per-booking chooser missing");
  assert(server.includes("recordReferralPending"), "pending referral tracking missing");
  assert(server.includes("approveReferralReward"), "approved referral reward tracking missing");
  assert(server.includes("/api/client-settings"), "client settings endpoint missing");
  assert(server.includes("GOOGLE_CLIENT_ID"), "Google sign-in configuration hook missing");
  assert(server.includes("/api/auth/google/config"), "Google sign-in config endpoint missing");
  assert(server.includes("/api/auth/google"), "Google sign-in endpoint missing");
  assert(server.includes("/api/auth/google/signup"), "Google signup endpoint missing");
  assert(server.includes("verifyGoogleCredential"), "Google ID token verifier missing");
  assert(server.includes("crypto.verify"), "Google token signature verification missing");
  assert(server.includes("latestClientBookingByEmail"), "Google booking email matcher missing");
  assert(server.includes("client.profile.saved"), "persistent client profile record missing");
  assert(server.includes("locJourneyLength"), "loc journey profile field missing");
  assert(server.includes("process.env.DATA_DIR"), "persistent data directory hook missing");
  assert(server.includes("/api/stripe/webhook"), "Stripe webhook endpoint missing");
  assert(server.includes("/api/resend/webhook"), "Resend delivery webhook endpoint missing");
  assert(server.includes("verifyResendWebhook"), "Resend webhook signature verification missing");
  assert(server.includes("crypto.timingSafeEqual"), "constant-time Resend signature comparison missing");
  assert(server.includes("resend.email.event"), "persistent Resend delivery event missing");
  assert(server.includes("emailDeliveryTrackingConfigured"), "Resend delivery readiness status missing");
  assert(server.includes("checkout.session.completed"), "Stripe completed event handling missing");
  assert(server.includes("priceBooking"), "trusted server-side pricing helper missing");
  assert(server.includes("notifyNoChargeTestBooking"), "no-charge test booking notifier missing");
  assert(server.includes("no_charge_test"), "no-charge test status missing");
  assert(server.includes("/api/automations/run"), "automation run endpoint missing");
  assert(server.includes("deposit_reminder"), "deposit reminder automation missing");
  assert(server.includes("appointment_reminder_3_day"), "3-day appointment reminder automation missing");
  assert(server.includes("appointment_reminder_1_day"), "1-day appointment reminder automation missing");
  assert(server.includes("review_request"), "review request automation missing");
  assert(server.includes("monthly_referral_campaign"), "monthly referral campaign automation missing");
  assert(!server.includes("birthday_offer"), "birthday offer automation should not be active");
  assert(server.includes("birthday_credit"), "annual birthday credit automation missing");
  assert(server.includes("if (!booking.client?.birthday) return null;"), "birthday credit should require only a birthday");
  assert(!server.includes("if (!booking.client?.marketingEmailOptIn || !booking.client?.birthday) return null;"), "birthday credit should not require marketing email opt-in");
  assert(server.includes("activeBirthdayWindow"), "birthday credit date window helper missing");
  assert(server.includes("validFrom"), "birthday credit valid-from date missing");
  assert(server.includes("expiresAt"), "birthday credit expiration date missing");
  assert(server.includes("referral_reminder"), "referral reminder automation missing");
  assert(server.includes("automation.notification.sent"), "automation duplicate guard event missing");
  const script = fs.readFileSync("script.js", "utf8");
  const styles = fs.readFileSync("styles.css", "utf8");
  assert(script.includes('setAttribute("aria-pressed", "true")'), "selected time should update aria-pressed");
  assert(script.includes("Selected: ${timeLabel(time)}"), "selected time confirmation text missing");
  assert(styles.includes('content: "Selected \\2713"'), "visible selected time badge missing");
  assert(styles.includes("border: 4px solid var(--dark-brown)"), "prominent selected time border missing");
  assert(script.includes("button_auto_select: false"), "FedCM button auto-selection should be disabled");
  assert(script.includes("use_fedcm_for_button: false"), "FedCM button flow should stay off for explicit account choice");
  assert(script.includes("function switchGoogleAccount"), "Google account switch handler missing");
  assert(script.includes("async function confirmManualDeposit"), "manual deposit confirmation handler missing");
  assert(script.includes("async function releaseUnpaidHold"), "unpaid hold release handler missing");
  assert(script.includes("async function resendClientConfirmation"), "client confirmation resend handler missing");
  assert(script.includes("data-confirm-manual-deposit"), "manual deposit confirmation button binding missing");
  assert(script.includes("data-release-unpaid-hold"), "unpaid hold release button binding missing");
  assert(script.includes("completed confirmations will not be duplicated"), "manual deposit interrupted-response guidance missing");
  assert(script.includes("notificationResultsHtml"), "HTML notification result renderer missing");
  assert(script.includes("Open Gmail draft for client confirmation"), "admin Gmail draft fallback link missing");
  assert(script.includes("clientEmail: not delivered automatically"), "client email blocked status should be explicit");
  assert(script.includes("async function sendNotificationTest"), "notification test handler missing");
  assert(script.includes("notificationResultsText"), "notification result display helper missing");
  assert(script.includes("loadAdminNotificationStatus"), "admin notification readiness loader missing");
});

test("live fallback thanks invited testers after a successful booking", () => {
  const fallback = fs.readFileSync("friend-test-thank-you.js", "utf8");
  const html = fs.readFileSync("index.html", "utf8");
  assert(fallback.includes("Thank you for testing the Lovely Locs booking service for me."), "fallback thank-you copy missing");
  assert(fallback.includes("/api\\/bookings"), "fallback should watch successful booking submissions");
  assert(fallback.includes("payment-options"), "fallback should display on the pay-options screen");
  assert(html.includes("friend-test-thank-you.js?v=20260612-live-fallback"), "fallback script is not loaded by the site shell");
});

test("referral share link copies the booking page", async () => {
  context.window.location.origin = "http://127.0.0.1:4175";
  await context.copyBookingLink();
  assert(context.lastCopiedText === "http://127.0.0.1:4175/#services", "booking share link should copy services URL");
});

test("visual version preview updates stored class and route", () => {
  context.applyVisualVersion("v3");
  localStore.set("visualVersion", "v3");
  assert(document.documentElement.classList.contains("visual-v3"), "visual version class missing");
  context.applyVisualVersion("v0");
  assert(document.documentElement.classList.contains("visual-v0"), "current version class missing");
  assert(!document.documentElement.classList.contains("visual-v3"), "old visual version class still present");
});

test("product add button state prevents duplicate cart additions", () => {
  context.window.location.hash = "#products";
  context.addToCart({ id: "product-Gold Sparkle Sprinkles", type: "product", name: "Gold Sparkle Sprinkles", price: 12, description: "Premium gold glitter loc accessories for a touch of elegance." });
  context.addToCart({ id: "product-Gold Sparkle Sprinkles", type: "product", name: "Gold Sparkle Sprinkles", price: 12, description: "Premium gold glitter loc accessories for a touch of elegance." });
  const html = appHtml();
  const storedItems = JSON.parse(localStore.get("lovelyLocsCart") || "[]");
  const goldItems = storedItems.filter(item => item.id === "product-Gold Sparkle Sprinkles");
  assert(html.includes("Added"), "product added state missing");
  assert(html.includes("Premium gold glitter loc accessories for a touch of elegance."), "product description missing from cart item");
  assert(goldItems.length === 1, "duplicate product changed cart storage unexpectedly");
  assert(localStore.get("lovelyLocsCart").includes("Gold Sparkle Sprinkles"), "cart selection should be stored until checkout");
});

test("service cards stay compact while showing details", () => {
  context.window.location.hash = "";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("service-meta"), "service metadata missing");
  assert(html.includes("detail-chips"), "service detail chips missing");
  assert(html.includes("Aftercare guidance") || html.includes("Retwist care"), "service detail text missing");
});

test("mobile cart uses one roomy full-height scroll area", () => {
  const styles = fs.readFileSync("styles.css", "utf8");
  assert(styles.includes("height: 100dvh"), "mobile cart should fill the available phone height");
  assert(styles.includes("overscroll-behavior: contain"), "mobile cart should contain its page scroll");
  assert(styles.includes(".cart-items {\n    flex: none;\n    overflow: visible;"), "mobile cart items should not collapse into a short nested scroller");
  assert(styles.includes("min-height: 112px"), "mobile cart item cards should preserve enough room for item details");
});

test("redesigned hero is proof-led instead of abstract art-led", () => {
  context.window.location.hash = "";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("hero-proof"), "proof-led hero panel missing");
  assert(html.includes("Right service, right timing"), "service guidance proof copy missing");
  assert(!html.includes("<strong>Private</strong><span>Home studio by appointment only</span>"), "old private proof card should move to policies");
  assert(!html.includes("<strong>Clear</strong><span>Prices shown before checkout</span>"), "old clear proof card should move to policies");
  assert(!html.includes("hero-art"), "old abstract hero art should be removed from markup");
});

(async () => {
  let passed = 0;
  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log(`PASS ${name}`);
      passed += 1;
    } catch (error) {
      console.error(`FAIL ${name}: ${error.message}`);
      process.exitCode = 1;
    }
  }
  console.log(`${passed}/${tests.length} tests passed`);
})();
