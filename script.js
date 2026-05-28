const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6978dfbb416a772de9813cbb/da2605355_ModernBeigeBuyOneCoffeeGetOneFreeHalfPageAd.png";

const categories = [
  { id: "loc-maintenance", label: "Loc Maintenance", icon: "Retwist" },
  { id: "starter-locs", label: "Starter Locs", icon: "Start" },
  { id: "instant-crochet", label: "Instant / Crochet", icon: "Crochet" },
  { id: "add-ons", label: "Add-Ons & More", icon: "Add-On" }
];

const business = {
  name: "Lovely Locs",
  email: "timaslovelylocs@gmail.com",
  phone: "(336)-471-1098",
  area: "Piedmont Triad, North Carolina",
  studio: "Private in-home studio"
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

const products = [
  { name: "Gold Sparkle Sprinkles", price: 12, description: "Premium gold glitter loc accessories for a touch of elegance." },
  { name: "Silver Shimmer Sprinkles", price: 12, description: "Shimmering silver loc charms perfect for any occasion." },
  { name: "Rose Gold Sprinkles", price: 12, description: "Soft rose gold accents that complement any loc style." },
  { name: "Custom Color Sprinkles", price: 15, description: "Choose your custom color to match your unique style." }
];

const testimonials = [
  {
    name: "Starter loc client",
    service: "Starter Locs",
    quote: "The appointment felt calm and personal. I left understanding how to care for my new locs and what to expect next."
  },
  {
    name: "Maintenance client",
    service: "Adult Retwist",
    quote: "My retwist looked neat without feeling tight. The private studio setup made the whole appointment comfortable."
  },
  {
    name: "Style add-on client",
    service: "Retwist + Style",
    quote: "I loved being able to explain the style I wanted and get a clean finish that still felt like me."
  }
];

const serviceGuide = [
  {
    id: "new-locs",
    label: "I am starting locs",
    recommendation: "Start with a Consultation if you are unsure about size, parting, or method. If you are ready, choose Children's Starter Locs, Medium Adult Starter Locs, or Small Adult Starter Locs based on your desired size."
  },
  {
    id: "maintenance",
    label: "I need a fresh retwist",
    recommendation: "Choose Adult Retwist or Children Retwist. If it has been more than 3 months, choose Overdue Retwist so enough time is reserved."
  },
  {
    id: "instant",
    label: "I want instant/crochet work",
    recommendation: "Choose Adult Instant Locs or Children's Instant Loc. These services use crochet needle work and need a longer appointment window."
  },
  {
    id: "extra-style",
    label: "I want accessories or a style",
    recommendation: "Add Style, Loc Sprinkle Installation, or Loc Sprinkles alongside your main service. Add color/style preferences in your booking notes."
  }
];

const visualVersions = [
  { id: "v0", label: "Today", note: "Polished conversion layout with featured services, client guide, portfolio preview, and testimonials." },
  { id: "v1", label: "1 Day Ago", note: "Clean business site with booking process, service menu, and stronger brand copy." },
  { id: "v2", label: "2 Days Ago", note: "Original warm Lovely Locs layout with simple services, policies, products, and contact pages." },
  { id: "v3", label: "3 Days Ago", note: "Softer classic look with less shadow and a quieter service menu." },
  { id: "v4", label: "4 Days Ago", note: "High-contrast salon look with darker browns and stronger buttons." },
  { id: "v5", label: "5 Days Ago", note: "Simple booking-first layout with compact sections and fewer decorative elements." },
  { id: "v6", label: "6 Days Ago", note: "Portfolio-forward layout emphasizing visual proof and client preparation." },
  { id: "v7", label: "7 Days Ago", note: "Minimal fallback look closest to the early static clone." }
];

const policies = {
  deposit: "A non-refundable deposit is required to secure all appointments. Deposits are due at the time of booking. Remaining balance is due after the service is completed. No refunds for cancellations after booking is confirmed.",
  cancellation: "Lovely Locs does not provide any refunds for cancellations made after your booking is confirmed. Cancelling your booking at any time will result in the loss of your deposit fee.",
  booking_rules: "Only in-home studio service appointments are accepted. Deposits are non-refundable under all circumstances.",
  emergency_fee: "Clients must add the Emergency Fee ($45) if booking within 24 hours, on Sundays, or on holidays and key dates outside of regular availability. Visit our policies to know when this applies to your appointment.",
  payment_options: "Buy Now, Apple Pay, and Venmo are available. All connected to the following number: (336)-471-1098."
};

const faq = [
  { question: "Do you repair locs?", answer: "Yes. Please contact us at timaslovelylocs@gmail.com to discuss your specific needs and schedule a consultation." },
  { question: "How long do services take?", answer: "Service durations vary from 1.5 to 6.5 hours depending on the type and complexity of service." },
  { question: "Are deposits refundable?", answer: "No. All deposits are non-refundable under all circumstances. Cancelling will result in the loss of your deposit." },
  { question: "Where are appointments held?", answer: "All appointments are at our private in-home studio in the Piedmont Triad, NC. Studio address is shared after booking is confirmed." },
  { question: "What payment methods do you accept?", answer: "Buy Now, Apple Pay, and Venmo are available through (336)-471-1098." },
  { question: "What about emergency or holiday appointments?", answer: "A $45 Emergency Fee applies for same-day bookings, Sunday bookings, and major holidays. Your appointment is subject to being declined if not pre-cleared." }
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

let cart = loadCart();
let selectedService = cart.find(item => item.type === "service") || null;
let pendingAnchor = null;
let pendingAdvisoryService = null;
let pendingProductService = null;
let pendingPartingService = null;
let advisoryMessage = "";
let baseProductMessage = "";
let partingMessage = "";
let bookingConfirmation = null;
let lastRoute = null;

const app = document.getElementById("app");
const drawer = document.getElementById("drawer");

function money(value) {
  return `$${Number(value).toFixed(0)}`;
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
          <div class="hero-logo"><img src="${logoUrl}" alt="Lovely Locs Logo"></div>
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
          <h2>Share Lovely Locs with a friend.</h2>
          <p>Send the booking page to someone starting or maintaining their locs. Ask them to add your name in their booking notes so referral bonuses are easy to track.</p>
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

function serviceGuideSection() {
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
            ${serviceGuide.map((item, index) => `<button class="${index === 0 ? "active" : ""}" data-guide="${item.id}">${item.label}</button>`).join("")}
          </div>
          <div class="guide-result" id="guideResult">
            <span>Recommended next step</span>
            <p>${serviceGuide[0].recommendation}</p>
            <button class="primary-btn" data-view-services>View Matching Services</button>
          </div>
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
        <h2 class="section-title">Portfolio Preview</h2>
        <p class="section-subtitle">Replace these polished placeholders with real client photos as you build your gallery. This section is built to show retwists, starter locs, crochet work, and accessories clearly.</p>
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
        <h2 class="section-title">Client Notes</h2>
        <p class="section-subtitle">A review section gives new clients reassurance before they book. Replace these draft reviews with real testimonials when you have them.</p>
        <div class="testimonial-grid">
          ${testimonials.map(item => `
            <article class="testimonial-card">
              <p>"${item.quote}"</p>
              <div>
                <strong>${item.name}</strong>
                <span>${item.service}</span>
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
    ["3", "Confirm your deposit", "Your appointment is secured after the required non-refundable deposit is confirmed."],
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
    ["Prepared", "Client notes, product preferences, and parting preferences are reviewed before confirmation."]
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

function productsPage() {
  return `
    <section class="hero route-page" id="products-page">
      <h1>Products</h1>
      <p class="subtitle">Premium loc accessories to enhance your style</p>
    </section>
    <section class="section">
      <div class="container">
        <h2 class="section-title">Loc Sprinkles</h2>
        <p class="section-subtitle">Add sparkle and personality to your locs with our premium loc sprinkles.</p>
        <div class="products-grid">
          ${products.map(product => `
            <article class="card product-card">
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
  const total = cart.reduce((sum, item) => sum + item.price, 0);
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
              <div><strong>${item.name}</strong><p class="duration">${item.duration || "Accessory"}</p>${item.baseProduct ? `<p class="duration">Base product: ${item.baseProduct}</p>` : ""}${item.partingPreference ? `<p class="duration">Parting: ${item.partingPreference}${item.partingFee ? ` (+${money(item.partingFee)})` : ""}</p>` : ""}<p>${money(item.price)}</p></div>
              <button class="modal-close" data-remove="${item.id}">x</button>
            </div>
          `).join("") : `<p class="section-subtitle">Your cart is empty.</p>`}
        </div>
        ${cart.length ? `<div class="cart-total"><div class="service-top"><strong>Total</strong><strong>${money(total)}</strong></div><button class="primary-btn" data-open-booking>Finalize Cart &amp; Enter Details</button></div>` : ""}
      </aside>
    </div>
  `;
}

function bookingModal() {
  const selectedServices = cart.filter(item => item.type === "service");
  const addOns = cart.filter(item => item.type !== "service");
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const deposit = cart.length ? Math.max(Math.round(total * 0.3), 30) : 30;
  const confirmationMarkup = bookingConfirmation ? `
        <div class="confirmation-panel">
          <strong>Confirmation ready</strong>
          <p>${bookingConfirmation.message}</p>
          <div class="confirmation-actions">
            <a class="primary-btn" href="${bookingConfirmation.mailto}">Send Email Confirmation</a>
            <a class="outline-btn" href="${bookingConfirmation.sms}">Send Text Confirmation</a>
          </div>
          <p class="duration">If SMS/email provider keys are not connected yet, use these fallback buttons so the request can still be sent manually.</p>
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
          ${addOns.length ? `<p>Add-ons / products: ${addOns.map(item => item.name).join(", ")}</p>` : ""}
          <p>Estimated Total: ${money(total)}</p>
          <p>Deposit Required to Hold Slot: ${money(deposit)}</p>
        </div>
        <form class="form-grid" id="bookingForm">
          <label>Full Name<input name="fullName" required placeholder="Your name"></label>
          <label>Email Address<input name="email" required type="email" placeholder="you@example.com"></label>
          <label>Phone Number<input name="phone" required placeholder="(555) 123-4567"></label>
          <label>Preferred Date<input name="date" required type="date"></label>
          <fieldset class="full contact-preference">
            <legend>Preferred Point of Contact</legend>
            <label><input name="preferredContact" type="radio" value="text_email" checked> Text + Email</label>
            <label><input name="preferredContact" type="radio" value="text"> Text</label>
            <label><input name="preferredContact" type="radio" value="email"> Email</label>
            <p>Lovely Locs will still send both confirmation types when text and email providers are connected.</p>
          </fieldset>
          <label class="full">Special Requests<textarea name="specialRequests" placeholder="Retwist product preference, style ideas, hair history, or notes..."></textarea></label>
          <label class="full policy-ack"><input id="policyAcknowledgement" name="policyAcknowledgement" type="checkbox"><span>I have read and agree to the Lovely Locs policies before submitting this appointment request. <a href="#policies" data-route="policies">Revisit policies</a></span></label>
        </form>
        <p class="form-error" id="bookingError" aria-live="polite"></p>
        ${confirmationMarkup}
        <div class="modal-summary">
          <strong>Before You Submit</strong>
          <p>Deposits are non-refundable. Same-day, Sunday, and holiday bookings may require the $45 emergency fee. All services are held at the private Lovely Locs home studio; the exact studio address is shared after your booking is confirmed.</p>
          <p>After submitting, Lovely Locs will attempt to send automatic email/text confirmations. Your booking is not fully confirmed until the message and deposit are received.</p>
        </div>
        <div class="modal-actions">
          <button class="outline-btn" data-close-booking>Back</button>
          <button class="primary-btn" type="button" data-submit-booking>Submit Request &amp; Pay ${money(deposit)}</button>
        </div>
      </div>
    </div>
  `;
}

function render(route = currentRoute()) {
  if (route === "policies") app.innerHTML = policiesPage();
  else if (route === "products") app.innerHTML = productsPage();
  else if (route === "contact") app.innerHTML = contactPage();
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
  const hash = window.location.hash.replace("#", "");
  const route = ["policies", "products", "contact", "versions"].includes(hash) ? hash : "home";
  if (!["policies", "products", "contact", "versions", "home", ""].includes(hash)) {
    pendingAnchor = hash;
  }
  return route;
}

function addToCart(item) {
  bookingConfirmation = null;
  if (!cart.some(existing => existing.id === item.id)) cart.push(item);
  saveCart();
  render(currentRoute());
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
  document.querySelectorAll("[data-share-booking]").forEach(button => button.addEventListener("click", shareBookingSite));
  document.querySelectorAll("[data-copy-booking]").forEach(button => button.addEventListener("click", copyBookingLink));
  document.getElementById("cartButton")?.addEventListener("click", openCart);
  document.querySelectorAll("[data-close-cart]").forEach(item => item.addEventListener("click", closeCart));
  document.querySelectorAll(".faq-item button").forEach(button => button.addEventListener("click", () => button.parentElement.classList.toggle("open")));

  document.querySelectorAll("[data-guide]").forEach(button => {
    button.addEventListener("click", () => {
      const item = serviceGuide.find(option => option.id === button.dataset.guide);
      document.querySelectorAll("[data-guide]").forEach(option => option.classList.remove("active"));
      button.classList.add("active");
      const result = document.getElementById("guideResult");
      if (result && item) {
        result.querySelector("p").textContent = item.recommendation;
      }
    });
  });

  document.querySelectorAll("[data-version]").forEach(button => {
    button.addEventListener("click", () => {
      applyVisualVersion(button.dataset.version);
      localStorage.setItem("visualVersion", button.dataset.version);
      if (currentRoute() === "versions") render("versions");
    });
  });

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
    `Preferred date: ${client.date}`,
    `Preferred contact: ${contactPreferenceLabel(client.preferredContact)}`,
    "",
    "Services:",
    serviceLines.length ? serviceLines.join("\n") : "- No service selected",
    addOnLines.length ? `\nAdd-ons / products:\n${addOnLines.join("\n")}` : "",
    "",
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
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const deposit = cart.length ? Math.max(Math.round(total * 0.3), 30) : 30;
  return {
    client: {
      fullName: data.get("fullName") || "",
      email: data.get("email") || "",
      phone: data.get("phone") || "",
      date: data.get("date") || "",
      preferredContact: data.get("preferredContact") || "text_email",
      specialRequests: data.get("specialRequests") || ""
    },
    cart,
    selectedServices,
    addOns,
    total,
    deposit,
    policyAcknowledgement: Boolean(data.get("policyAcknowledgement"))
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
  if (error) error.textContent = "";
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
  }
  const summary = bookingSummaryFromForm(form);
  const links = confirmationLinks(summary);
  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingPayloadFromForm(form))
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "Booking could not be sent.");
    bookingConfirmation = {
      ...links,
      message: result.sent
        ? "Appointment request sent. Lovely Locs and the client should receive confirmation through the connected message system."
        : "Appointment request saved. Automatic SMS is not turned on yet because the Twilio SMS account keys still need to be added in the backend settings. Use the fallback buttons below until those keys are connected."
    };
  } catch (bookingError) {
    bookingConfirmation = {
      ...links,
      message: "The automatic message system could not complete this request. Use the email/text buttons below while the provider connection is checked."
    };
    if (error) error.textContent = bookingError.message;
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.originalText || submitButton.textContent.replace("Sending...", "Submit Request");
    }
  }
  render(currentRoute());
  openBooking();
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

document.getElementById("themeToggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("darkMode", document.documentElement.classList.contains("dark") ? "true" : "false");
});

if (localStorage.getItem("darkMode") === "true") document.documentElement.classList.add("dark");
function applyVisualVersion(versionId) {
  visualVersions.forEach(version => document.documentElement.classList.remove(`visual-${version.id}`));
  document.documentElement.classList.add(`visual-${versionId}`);
}

applyVisualVersion(localStorage.getItem("visualVersion") || "v0");
window.addEventListener("hashchange", () => render(currentRoute()));
render();
