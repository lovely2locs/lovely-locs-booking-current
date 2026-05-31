const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6978dfbb416a772de9813cbb/da2605355_ModernBeigeBuyOneCoffeeGetOneFreeHalfPageAd.png";

const categories = [
  { id: "loc-maintenance", label: "Loc Maintenance", icon: "Retwist" },
  { id: "starter-locs", label: "Starter Locs", icon: "Start" },
  { id: "instant-crochet", label: "Instant / Crochet", icon: "Crochet" },
  { id: "add-ons", label: "Add-Ons & More", icon: "Add-On" }
];

const business = {
  name: "Lovely Locs",
  email: "lovely2locs@gmail.com",
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

const adminTestService = {
  id: "admin-test-booking",
  duration: "15 min",
  featured: false,
  price: 0,
  name: "Free Admin Test Booking",
  description: "Owner-only test service for checking the booking form and confirmation messages without charging a Stripe deposit.",
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
  deposit: "A non-refundable Stripe deposit is required before an appointment request can be reviewed for final confirmation. The deposit is 30% of the selected services and products, with a $30 minimum. Remaining balance is due after the service is completed.",
  cancellation: "Lovely Locs does not provide any refunds for cancellations made after your booking is confirmed. Cancelling your booking at any time will result in the loss of your deposit fee.",
  booking_rules: "Only in-home studio service appointments are accepted. Deposits are non-refundable under all circumstances.",
  emergency_fee: "Clients must add the Emergency Fee ($45) if booking within 24 hours, on Sundays, or on holidays and key dates outside of regular availability. Visit our policies to know when this applies to your appointment.",
  payment_options: "Deposits are paid online through Stripe Checkout. Remaining balances are handled directly with Lovely Locs after service."
};

const faq = [
  { question: "Do you repair locs?", answer: "Yes. Please contact us at lovely2locs@gmail.com to discuss your specific needs and schedule a consultation." },
  { question: "How long do services take?", answer: "Service durations vary from 1.5 to 6.5 hours depending on the type and complexity of service." },
  { question: "Are deposits refundable?", answer: "No. All deposits are non-refundable under all circumstances. Cancelling will result in the loss of your deposit." },
  { question: "Where are appointments held?", answer: "All appointments are at our private in-home studio in the Piedmont Triad, NC. Studio address is shared after booking is confirmed." },
  { question: "What payment methods do you accept?", answer: "Appointment deposits are paid through Stripe Checkout. Remaining balances are handled directly with Lovely Locs after service." },
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
    ["3", "Pay your Stripe deposit", "Your request is sent to Stripe Checkout for the required non-refundable deposit."],
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
        <div class="product-shelf-stack">
          ${productShelfGroups.map(group => `
            <div class="product-shelf-group">
              <div class="group-title product-group-title">
                <span>${group.name === "Cleanse" ? "Wash" : group.name === "Hydrate" ? "Mist" : group.name === "Retwist" ? "Hold" : "Care"}</span>
                <h3>${group.name}</h3>
              </div>
              <p class="product-group-summary">${group.summary}</p>
              <div class="recommended-products-grid">
                ${recommendedHairProducts.filter(product => product.shelf === group.name).map(product => `
                  <article class="card product-card recommended-product-card">
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
          <p>Lovely Locs may collect your name, email address, phone number, preferred appointment date, selected services, product or parting preferences, special requests, referral notes, SMS opt-in status, and message history related to your appointment.</p>
        </div>
        <div class="policy-box">
          <h2>How We Use Information</h2>
          <p>Your information is used to process appointment requests, confirm booking details, send service-related updates, answer questions, provide loc care follow-up messages, manage referrals, and share occasional opt-in offers or chances for bonuses, discounts, or product promotions.</p>
          <p>Promotional opportunities are not guaranteed and may vary based on availability, eligibility, timing, and active promotions.</p>
        </div>
        <div class="policy-box">
          <h2>SMS Privacy &amp; Consent</h2>
          <p>By choosing to receive texts from Lovely Locs, you consent to receive appointment updates, booking reminders, follow-up messages, care tips, and occasional promotional or referral-related messages from Lovely Locs. Message frequency may vary. Message and data rates may apply.</p>
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
          <p>Submitting a request does not guarantee an appointment. Your appointment is pending until Lovely Locs reviews the request, confirms availability, and receives the required deposit or payment when applicable.</p>
        </div>
        <div class="policy-box">
          <h2>Deposits, Payments &amp; Cancellations</h2>
          <p>${policies.deposit}</p>
          <p>${policies.cancellation}</p>
          <p>${policies.emergency_fee}</p>
        </div>
        <div class="policy-box">
          <h2>Client Accuracy &amp; Service Fit</h2>
          <p>Clients are responsible for providing accurate hair history, timing, contact information, preferred dates, product preferences, and service notes. Lovely Locs may recommend a different service or price if the selected service does not match the condition, timing, or needs of the client's hair.</p>
        </div>
        <div class="policy-box">
          <h2>SMS Terms</h2>
          <p>By opting in to Lovely Locs SMS messages, you agree to receive appointment updates, booking confirmations, reminders, follow-up messages, loc care tips, and occasional promotional or referral-related messages. Message frequency may vary. Message and data rates may apply.</p>
          <p>Reply STOP to opt out. Reply HELP for help. Opting out of promotional messages may limit our ability to send some text-based updates, but you may still contact Lovely Locs directly by email or other available methods.</p>
        </div>
        <div class="policy-box">
          <h2>Rewards, Discounts &amp; Free Product Offers</h2>
          <p>Referral bonuses, discounts, rewards, and free product offers are occasional opportunities only. They are not guaranteed for every client, service, booking, referral, or opt-in. Offers may vary based on availability, eligibility, timing, promotion rules, and Lovely Locs discretion.</p>
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
      <p class="subtitle">Choose whether you want Lovely Locs text updates, care tips, and occasional offer opportunities.</p>
    </section>
    <section class="section">
      <div class="narrow legal-stack">
        <div class="policy-box sms-optin-proof">
          <p class="eyebrow">Consent Form</p>
          <h2>Lovely Locs Text Message Opt-In</h2>
          <p>Complete this form if you would like to receive text messages from Lovely Locs. Texts may include appointment updates, booking reminders, service follow-ups, loc care tips, referral updates, and occasional chances for discounts, rewards, or free product offers.</p>
          <p>Offers are not guaranteed and may vary by availability, eligibility, timing, and active promotion rules.</p>
          <form class="sms-optin-form">
            <label>Full Name<input name="smsOptInName" placeholder="Your name"></label>
            <label>Mobile Number<input name="smsOptInPhone" placeholder="(555) 123-4567"></label>
            <label class="full policy-ack sms-consent"><input name="smsConsent" type="checkbox"><span>Yes, I agree to receive recurring text messages from Lovely Locs at the phone number provided. Message frequency may vary. Message and data rates may apply. Reply STOP to opt out and HELP for help. I agree to the <a href="#privacy" data-route="privacy">Privacy Policy</a> and <a href="#terms" data-route="terms">Terms &amp; Conditions</a>.</span></label>
            <button class="primary-btn" type="button" data-copy-optin-proof>Copy Opt-In Link</button>
          </form>
          <p class="duration">This opt-in checkbox is intentionally not preselected. Clients must choose it themselves.</p>
        </div>
        <div class="policy-box">
          <h2>For Twilio Proof of Consent</h2>
          <p>Use this page as the consent form URL after your public Render website is live. You can also screenshot this form showing the unchecked consent box and disclosures.</p>
          <p>Public opt-in URL format: <strong>https://your-render-url.onrender.com/#sms-opt-in</strong></p>
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

function paymentSuccessPage() {
  return `
    <section class="hero route-page" id="payment-success-page">
      <h1>Deposit Received</h1>
      <p class="subtitle">Thank you. Your Stripe deposit was submitted and your appointment request is pending final availability confirmation.</p>
    </section>
    <section class="section">
      <div class="narrow policy-stack">
        <div class="policy-box">
          <p class="eyebrow">Next Step</p>
          <h2>Lovely Locs will review your request.</h2>
          <p>Your appointment is not fully confirmed until Lovely Locs verifies availability and sends final confirmation. Keep your Stripe receipt for your records.</p>
        </div>
        ${contactCard()}
      </div>
    </section>
  `;
}

function adminPage() {
  const alreadyAdded = cart.some(item => item.id === adminTestService.id);
  return `
    <section class="hero route-page" id="admin-page">
      <h1>Admin Test Booking</h1>
      <p class="subtitle">Run a no-charge booking test without sending the client to Stripe Checkout.</p>
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
            <div class="service-meta"><span>${adminTestService.duration}</span><span>No Stripe deposit</span></div>
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
          ${addOns.length ? `<p>Add-ons / products: ${addOns.map(item => item.name).join(", ")}</p>` : ""}
          <p>Estimated Total: ${money(total)}</p>
          <p>Deposit Required to Hold Slot: ${money(deposit)}</p>
          ${adminTest ? `<p class="advisory-copy">Admin test mode: no Stripe payment will be requested for this booking.</p>` : ""}
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
          <label class="full policy-ack sms-consent"><input name="smsOptIn" type="checkbox"><span>I agree to receive Lovely Locs text messages for appointment updates, reminders, follow-ups, loc care tips, and occasional chances for referral bonuses, discounts, or free product offers. Offers are not guaranteed. Message frequency may vary. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help. See our <a href="#sms-opt-in" data-route="sms-opt-in">SMS Opt-In</a>, <a href="#privacy" data-route="privacy">Privacy Policy</a>, and <a href="#terms" data-route="terms">Terms</a>.</span></label>
          <label class="full">Special Requests<textarea name="specialRequests" placeholder="Retwist product preference, style ideas, hair history, or notes..."></textarea></label>
          <label class="full policy-ack"><input id="policyAcknowledgement" name="policyAcknowledgement" type="checkbox"><span>I have read and agree to the Lovely Locs <a href="#policies" data-route="policies">booking policies</a>, <a href="#privacy" data-route="privacy">Privacy Policy</a>, and <a href="#terms" data-route="terms">Terms &amp; Conditions</a> before submitting this appointment request.</span></label>
        </form>
        <p class="form-error" id="bookingError" aria-live="polite"></p>
        ${confirmationMarkup}
        <div class="modal-summary">
          <strong>Before You Submit</strong>
          ${adminTest
            ? `<p>This is an admin-only test booking. It saves the request and tests confirmation messages without creating a Stripe Checkout deposit.</p>`
            : `<p>Deposits are non-refundable. Same-day, Sunday, and holiday bookings may require the $45 emergency fee. All services are held at the private Lovely Locs home studio; the exact studio address is shared after your booking is confirmed.</p><p>After submitting, you will be sent to Stripe Checkout to pay the required deposit. Your appointment request is pending until the Stripe deposit is paid and Lovely Locs confirms availability.</p>`}
        </div>
        <div class="modal-actions">
          <button class="outline-btn" data-close-booking>Back</button>
          <button class="primary-btn" type="button" data-submit-booking>${adminTest ? "Submit No-Charge Test Booking" : `Submit Request &amp; Pay ${money(deposit)}`}</button>
        </div>
      </div>
    </div>
  `;
}

function render(route = currentRoute()) {
  if (route === "policies") app.innerHTML = policiesPage();
  else if (route === "products") app.innerHTML = productsPage();
  else if (route === "contact") app.innerHTML = contactPage();
  else if (route === "sms-opt-in") app.innerHTML = smsOptInPage();
  else if (route === "privacy") app.innerHTML = privacyPage();
  else if (route === "terms") app.innerHTML = termsPage();
  else if (route === "payment-success") app.innerHTML = paymentSuccessPage();
  else if (route === "admin") app.innerHTML = adminPage();
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
  const route = ["policies", "products", "contact", "sms-opt-in", "privacy", "terms", "payment-success", "admin", "versions"].includes(hash) ? hash : "home";
  if (!["policies", "products", "contact", "sms-opt-in", "privacy", "terms", "payment-success", "admin", "versions", "home", ""].includes(hash)) {
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

function clearCart() {
  cart = [];
  selectedService = null;
  bookingConfirmation = null;
  saveCart();
  render(currentRoute());
}

function addAdminTestBooking() {
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
  document.querySelectorAll("[data-share-booking]").forEach(button => button.addEventListener("click", shareBookingSite));
  document.querySelectorAll("[data-copy-booking]").forEach(button => button.addEventListener("click", copyBookingLink));
  document.querySelectorAll("[data-copy-optin-proof]").forEach(button => button.addEventListener("click", copySmsOptInLink));
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
  const deposit = bookingDeposit(total, cart);
  return {
    client: {
      fullName: data.get("fullName") || "",
      email: data.get("email") || "",
      phone: data.get("phone") || "",
      date: data.get("date") || "",
      preferredContact: data.get("preferredContact") || "text_email",
      smsOptIn: Boolean(data.get("smsOptIn")),
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
    submitButton.dataset.originalText = submitButton.textContent;
    submitButton.textContent = isAdminTestBooking(cart) ? "Saving Test Booking..." : "Opening Stripe Checkout...";
  }
  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingPayloadFromForm(form))
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "Booking could not be submitted.");
    if (result.noCharge) {
      bookingConfirmation = {
        message: result.message || "Free admin test booking saved. No Stripe deposit was requested."
      };
      render(currentRoute());
      openBooking();
      return;
    }
    if (!result.checkoutUrl) throw new Error(result.error || "Stripe Checkout could not be opened.");
    bookingConfirmation = {
      message: "Your appointment request was saved. Redirecting to Stripe Checkout for the required deposit."
    };
    window.location.href = result.checkoutUrl;
    return;
  } catch (bookingError) {
    if (error) error.textContent = bookingError.message;
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.originalText || "Submit Request & Pay Deposit";
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
