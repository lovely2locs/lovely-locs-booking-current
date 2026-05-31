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
  services: new FakeElement("services")
};
elements.bookingForm.reportValidity = () => true;

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
    location: { hash: "", href: "" },
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
    setItem(key, value) { localStore.set(key, value); }
  },
  console,
  fetch: async (url, options) => {
    context.lastFetch = { url, options };
    return {
      ok: true,
      json: async () => ({ ok: true, id: "LL-TEST", checkoutUrl: "https://checkout.stripe.com/c/pay/cs_test_123", total: 100, deposit: 30 })
    };
  },
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
  assert(html.includes("Referral Rewards"), "referral share section missing");
  assert(html.includes("data-share-booking"), "share booking button missing");
  assert(html.includes("ios-share-icon"), "iphone-style share icon missing");
  assert(html.includes("data-copy-booking"), "copy booking button missing");
});

test("policies route renders FAQ and policies", () => {
  context.window.location.hash = "#policies";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("Policies &amp; FAQ"), "policy hero missing");
  assert(html.includes("Lovely Locs Booking Standards"), "booking standards missing");
  assert(html.includes("Prices, add-ons, advisory changes"), "clear pricing policy copy missing");
  assert(html.includes("Frequently Asked Questions"), "FAQ missing");
  assert(html.includes("Are deposits refundable?"), "deposit FAQ missing");
});

test("products route renders products and cart", () => {
  context.window.location.hash = "#products";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("Products"), "products page missing");
  assert(html.includes("Recommended Hair Products"), "recommended hair products section missing");
  assert(html.includes("Loc Jewels &amp; Accessories"), "accessories section missing");
  assert(html.includes("Review source"), "review source links missing");
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
  context.window.location.hash = "#admin";
  context.render(context.currentRoute());
  let html = appHtml();
  assert(html.includes("Admin Test Booking"), "admin test page missing");
  assert(html.includes("Free Admin Test Booking"), "free test service missing");
  assert(html.includes("No Stripe deposit"), "no-charge Stripe note missing");
  context.addAdminTestBooking();
  html = appHtml();
  assert(html.includes("Cart (1)"), "admin test booking should replace cart with one item");
  assert(html.includes("Deposit Required to Hold Slot: $0"), "admin test deposit should be zero");
  assert(html.includes("Submit No-Charge Test Booking"), "admin no-charge submit button missing");
});

test("payment success route renders Stripe deposit confirmation", () => {
  context.window.location.hash = "#payment-success";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("Deposit Received"), "payment success heading missing");
  assert(html.includes("Stripe deposit was submitted"), "payment success copy missing");
  assert(html.includes("pending final availability confirmation"), "manual confirmation language missing");
});

test("contact route renders public business contact", () => {
  context.window.location.hash = "#contact";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("lovely2locs@gmail.com"), "email missing");
  assert(html.includes("(336)-471-1098"), "phone missing");
  assert(html.includes("Piedmont Triad"), "location missing");
});

test("privacy and terms routes render SMS safeguards", () => {
  context.window.location.hash = "#privacy";
  context.render(context.currentRoute());
  let html = appHtml();
  assert(html.includes("Privacy Policy"), "privacy page missing");
  assert(html.includes("does not sell, rent, or share SMS opt-in data"), "SMS no-sharing privacy language missing");
  assert(html.includes("replying STOP"), "privacy opt-out language missing");

  context.window.location.hash = "#terms";
  context.render(context.currentRoute());
  html = appHtml();
  assert(html.includes("Terms &amp; Conditions"), "terms page missing");
  assert(html.includes("Rewards, Discounts &amp; Free Product Offers"), "offer safeguards missing");
  assert(html.includes("not guaranteed for every client"), "non-guarantee terms missing");
});

test("sms opt-in route renders consent proof form", () => {
  context.window.location.hash = "#sms-opt-in";
  context.render(context.currentRoute());
  const html = appHtml();
  assert(html.includes("SMS Opt-In"), "sms opt-in page missing");
  assert(html.includes("Lovely Locs Text Message Opt-In"), "sms consent form heading missing");
  assert(html.includes('name="smsConsent" type="checkbox"'), "sms consent checkbox missing");
  assert(!html.includes('name="smsConsent" type="checkbox" checked'), "sms consent checkbox must not be preselected");
  assert(html.includes("Message frequency may vary"), "message frequency disclosure missing");
  assert(html.includes("Reply STOP to opt out"), "STOP disclosure missing");
  assert(html.includes("HELP for help"), "HELP disclosure missing");
});

test("adding a service updates cart and booking modal", () => {
  context.window.location.hash = "";
  context.clearCart();
  context.addToCart({ id: "qa-service", type: "service", name: "QA Service", price: 100, duration: "1h" });
  const html = appHtml();
  assert(html.includes("Cart (1)"), "cart count did not update");
  assert(html.includes("Services: QA Service"), "booking modal did not use selected service");
  assert(html.includes("Submit Request &amp; Pay $30"), "deposit button missing");
  assert(html.includes("Finalize Cart &amp; Enter Details"), "final cart CTA missing");
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
  assert(html.includes('name="preferredContact"'), "preferred contact selector missing");
  assert(html.includes('name="smsOptIn"'), "optional SMS opt-in checkbox missing");
  assert(html.includes('value="text"'), "text contact option missing");
  assert(html.includes('value="email"'), "email contact option missing");
  assert(html.includes('Text + Email'), "text plus email contact option missing");
  assert(!html.includes('name="address"'), "address field should not be shown for studio-only bookings");
  assert(html.includes("All services are held at the private Lovely Locs home studio"), "studio-only note missing");
  assert(html.includes('name="policyAcknowledgement"'), "policy acknowledgement checkbox missing");
  assert(html.includes("Privacy Policy"), "checkout should link to privacy policy");
  assert(html.includes("Terms &amp; Conditions"), "checkout should link to terms");
});

test("anchor route maps to home for section navigation", () => {
  context.window.location.hash = "#services";
  assert(context.currentRoute() === "home", "services hash should render home");
  context.render(context.currentRoute());
  assert(elements.services.scrolled, "services anchor did not scroll after render");
});

test("dark mode toggle stores and applies client preference", () => {
  elements.themeToggle.listeners.click();
  assert(document.documentElement.classList.contains("dark"), "dark class not applied");
  assert(localStore.get("darkMode") === "true", "dark preference not stored");
  elements.themeToggle.listeners.click();
  assert(!document.documentElement.classList.contains("dark"), "dark class not removed");
  assert(localStore.get("darkMode") === "false", "light preference not stored");
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
  assert(context.lastFetch.options.body.includes("text_email"), "booking backend payload should include preferred contact");
  assert(context.lastFetch.options.body.includes("smsOptIn"), "booking backend payload should include sms opt-in status");
  assert(context.window.location.href === "https://checkout.stripe.com/c/pay/cs_test_123", "valid booking should redirect to Stripe Checkout");
  assert(localStore.get("lovelyLocsCart") !== "[]", "cart should stay available until Stripe deposit is paid");
});

test("admin no-charge booking submission does not require Stripe checkout URL", async () => {
  const previousFetch = context.fetch;
  context.fetch = async (url, options) => {
    context.lastFetch = { url, options };
    return {
      ok: true,
      json: async () => ({ ok: true, id: "LL-TEST-FREE", noCharge: true, total: 0, deposit: 0, message: "Free admin test booking saved." })
    };
  };
  context.window.location.hash = "#admin";
  context.window.location.href = "";
  context.addAdminTestBooking();
  elements.policyAcknowledgement.checked = true;
  await context.submitBooking();
  assert(context.lastFetch.url === "/api/bookings", "admin test should post to booking backend");
  assert(context.lastFetch.options.body.includes("admin-test-booking"), "admin test payload missing service id");
  assert(context.lastFetch.options.body.includes('"deposit":0'), "admin test payload should carry zero deposit");
  assert(context.window.location.href === "", "admin test should not redirect to Stripe");
  assert(appHtml().includes("Free admin test booking saved."), "admin test confirmation message missing");
  context.fetch = previousFetch;
});

test("server includes Stripe Checkout and webhook endpoints", () => {
  const server = fs.readFileSync("local-server.js", "utf8");
  assert(server.includes('require("stripe")'), "Stripe dependency should be loaded by the backend");
  assert(server.includes("createCheckoutSession"), "Stripe Checkout Session helper missing");
  assert(server.includes("/api/stripe/webhook"), "Stripe webhook endpoint missing");
  assert(server.includes("checkout.session.completed"), "Stripe completed event handling missing");
  assert(server.includes("priceBooking"), "trusted server-side pricing helper missing");
  assert(server.includes("notifyNoChargeTestBooking"), "no-charge test booking notifier missing");
  assert(server.includes("no_charge_test"), "no-charge test status missing");
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
  context.addToCart({ id: "product-Gold Sparkle Sprinkles", type: "product", name: "Gold Sparkle Sprinkles", price: 12 });
  context.addToCart({ id: "product-Gold Sparkle Sprinkles", type: "product", name: "Gold Sparkle Sprinkles", price: 12 });
  const html = appHtml();
  const storedItems = JSON.parse(localStore.get("lovelyLocsCart") || "[]");
  const goldItems = storedItems.filter(item => item.id === "product-Gold Sparkle Sprinkles");
  assert(html.includes("Added"), "product added state missing");
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
