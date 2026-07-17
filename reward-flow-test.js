const fs = require("fs");
const http = require("http");
const net = require("net");
const path = require("path");
const { spawn } = require("child_process");

const root = __dirname;
const node = process.execPath;
let port = Number(process.env.REWARD_FLOW_TEST_PORT || 0);
let baseUrl = "";
const token = process.env.REWARD_FLOW_TEST_TOKEN || "local-reward-test-token";
const filesToRestore = ["bookings.jsonl", "site-settings.json", ".env.local"];
const backups = new Map();
const results = [];

function snapshotFiles() {
  for (const name of filesToRestore) {
    const filePath = path.join(root, name);
    backups.set(name, fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null);
  }
}

function restoreFiles() {
  for (const [name, content] of backups) {
    const filePath = path.join(root, name);
    if (content === null) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } else {
      fs.writeFileSync(filePath, content, "utf8");
    }
  }
}

function reservePort(preferredPort = 0) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(preferredPort, "127.0.0.1", () => {
      const address = server.address();
      const selectedPort = typeof address === "object" && address ? address.port : preferredPort;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(selectedPort);
      });
    });
  });
}
function assert(condition, message, detail = {}) {
  if (!condition) {
    const error = new Error(message);
    error.detail = detail;
    throw error;
  }
  results.push({ ok: true, message, detail });
}

function request(method, pathname, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : "";
    const req = http.request(`${baseUrl}${pathname}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        let parsed = data;
        try {
          parsed = data ? JSON.parse(data) : {};
        } catch {}
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function waitForServer(child) {
  const started = Date.now();
  while (Date.now() - started < 8000) {
    if (child.exitCode !== null) break;
    try {
      const response = await request("GET", "/healthz");
      if (response.status === 200) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error("Local reward-flow server did not start.");
}

function client(overrides = {}) {
  return {
    fullName: overrides.fullName || "Reward Tester",
    email: overrides.email || "reward.tester@example.test",
    phone: overrides.phone || "3364711098",
    birthday: overrides.birthday || "1998-07-31",
    date: overrides.date,
    time: overrides.time || "",
    preferredContact: "email",
    smsOptIn: false,
    marketingEmailOptIn: overrides.marketingEmailOptIn !== false,
    referralOptIn: true,
    referredByCode: overrides.referredByCode || "",
    specialRequests: "Automated local reward-flow test.",
  };
}

async function openTimeForDate(date, preferredTime = "") {
  const response = await request("GET", `/api/availability?date=${encodeURIComponent(date)}`);
  assert(response.status === 200 && response.body.ok, `Availability endpoint returned booking slots for ${date}.`, response.body);
  const openSlots = Array.isArray(response.body.slots)
    ? response.body.slots.filter(slot => slot && slot.status === "open" && slot.time)
    : [];
  const matched = openSlots.find(slot => slot.time === preferredTime);
  const selected = matched || openSlots[0];
  assert(Boolean(selected?.time), `An open appointment time exists for ${date}.`, response.body);
  return selected.time;
}


async function firstOpenDate(dates, preferredTime = "") {
  for (const date of dates) {
    const response = await request("GET", `/api/availability?date=${encodeURIComponent(date)}`);
    assert(response.status === 200 && response.body.ok, `Availability endpoint returned booking slots for ${date}.`, response.body);
    const openSlots = Array.isArray(response.body.slots)
      ? response.body.slots.filter(slot => slot && slot.status === "open" && slot.time)
      : [];
    if (preferredTime) {
      if (openSlots.some(slot => slot.time === preferredTime)) return date;
    } else if (openSlots.length) {
      return date;
    }
  }
  throw new Error(`No open appointment date found in candidates: ${dates.join(", ")}`);
}

function isoDatePlusDays(date, days) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString();
}

async function createBooking(clientData, overrides = {}) {
  const bookingClient = {
    ...clientData,
    time: await openTimeForDate(clientData.date, clientData.time || ""),
  };
  const response = await request("POST", "/api/bookings", {
    client: bookingClient,
    cart: overrides.cart || [{ id: "adult-retwist", baseProduct: "Foam" }],
    discountCode: overrides.discountCode || "",
    policyAcknowledgement: true,
    shampooDeclineAcknowledgement: overrides.shampooDeclineAcknowledgement !== false,
  });
  assert(response.status === 200 && response.body.ok, "Booking endpoint accepted the test booking.", response.body);
  return response.body;
}

async function clientSettings(clientData) {
  const response = await request("POST", "/api/client-settings", {
    email: clientData.email,
    phone: clientData.phone,
  });
  assert(response.status === 200 && response.body.ok, "Client settings loaded for test client.", {
    email: clientData.email,
    referralCode: response.body.referralCode,
  });
  return response.body;
}

async function confirmDeposit(bookingId) {
  const response = await request("GET", `/api/manual-payment/confirm?booking=${encodeURIComponent(bookingId)}&method=venmo&token=${encodeURIComponent(token)}&format=json`);
  assert(response.status === 200 && response.body.ok, "Admin deposit confirmation endpoint accepted the booking.", response.body);
  return response.body;
}

async function runAutomation(type, now = "") {
  const query = new URLSearchParams({ type, token });
  if (now) query.set("now", now);
  const response = await request("GET", `/api/automations/run?${query.toString()}`);
  assert(response.status === 200 && response.body.ok, `${type} automation endpoint ran successfully.`, response.body);
  return response.body;
}

async function runBirthdayAutomation(now = "") {
  return runAutomation("birthday", now);
}

async function main() {
  snapshotFiles();
  let child;
  try {
    port = await reservePort(port);
    baseUrl = `http://127.0.0.1:${port}`;
    fs.writeFileSync(path.join(root, "bookings.jsonl"), "", "utf8");
    fs.writeFileSync(path.join(root, "site-settings.json"), JSON.stringify({
      discount: {
        code: "TEST20",
        percent: 20,
        enabled: true,
        expiresAt: "2026-12-31",
      },
    }, null, 2), "utf8");
    if (fs.existsSync(path.join(root, ".env.local"))) fs.unlinkSync(path.join(root, ".env.local"));

    child = spawn(node, ["local-server.js"], {
      cwd: root,
      env: {
        ...process.env,
        PORT: String(port),
        HOST: "127.0.0.1",
        PUBLIC_SITE_URL: baseUrl,
        MANUAL_DEPOSIT_CONFIRM_TOKEN: token,
        AUTOMATION_RUN_TOKEN: token,
        AUTOMATION_AUTO_RUN: "false",
        BOOKING_OWNER_EMAIL: "owner@example.test",
        BOOKING_OWNER_PHONE: "3364711098",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    await waitForServer(child);

    const promo = await request("POST", "/api/discount/validate", { code: "TEST20" });
    assert(promo.status === 200 && promo.body.percent === 20, "Temporary TEST20 promo validates at 20 percent off.", promo.body);

    const saleClient = client({ fullName: "Sale Tester", email: "sale.tester@example.test", date: "2026-08-05" });
    const saleOne = await createBooking(saleClient, { discountCode: "TEST20" });
    assert(saleOne.discountCode === "TEST20" && saleOne.discountAmount === 18 && saleOne.total === 72, "TEST20 applies once on a booking total.", saleOne);

    const saleTwo = await createBooking({ ...saleClient, date: "2026-08-12", time: "18:30" }, { discountCode: "TEST20" });
    assert(saleTwo.discountCode === "TEST20" && saleTwo.discountAmount === 18 && saleTwo.total === 72, "Same client can use TEST20 on another booking before the deadline.", saleTwo);

    const futureBirthdayClient = client({ fullName: "Future Birthday", email: "future.bday@example.test", birthday: "1998-07-31", date: "2026-08-19" });
    await createBooking(futureBirthdayClient);
    await runBirthdayAutomation("2026-06-03T12:00:00");
    const futureBirthdaySettings = await clientSettings(futureBirthdayClient);
    assert(!futureBirthdaySettings.credits.some(credit => credit.type === "birthday"), "July 31 birthday credit is not issued early on June 3.", futureBirthdaySettings.credits);

    const activeBirthdayClient = client({ fullName: "Active Birthday", email: "active.bday@example.test", birthday: "1998-06-17", date: "2026-08-26" });
    await createBooking(activeBirthdayClient);
    await runBirthdayAutomation("2026-06-17T12:00:00");
    const activeBirthdaySettings = await clientSettings(activeBirthdayClient);
    const birthdayCredit = activeBirthdaySettings.credits.find(credit => credit.type === "birthday" && credit.status === "available");
    assert(Boolean(birthdayCredit) && birthdayCredit.amountOff === 15, "Active birthday-window client receives an available annual birthday credit.", activeBirthdaySettings.credits);

    const birthdayRedeem = await createBooking({ ...activeBirthdayClient, date: "2026-09-02" });
    assert(String(birthdayRedeem.discountCode || "").startsWith("BDAY-") && birthdayRedeem.discountAmount === 15, "Birthday credit automatically applies to the next booking.", birthdayRedeem);
    const birthdayConfirm = await confirmDeposit(birthdayRedeem.id);
    assert(birthdayConfirm.redeemedCredit?.creditType === "birthday", "Birthday credit is redeemed after deposit confirmation.", birthdayConfirm);

    const returningFirstVisitDate = await firstOpenDate(["2026-09-23", "2026-09-24", "2026-09-25"]);
    const returningClient = client({ fullName: "Returning Client", email: "returning.client@example.test", phone: "3364711105", date: returningFirstVisitDate });
    const returningFirstVisit = await createBooking(returningClient);
    await confirmDeposit(returningFirstVisit.id);
    await runAutomation("returning", isoDatePlusDays(returningFirstVisitDate, 1));
    const returningSettings = await clientSettings(returningClient);
    const returningCredit = returningSettings.credits.find(credit => credit.type === "returning" && credit.status === "available");
    assert(Boolean(returningCredit) && returningCredit.amountOff === 5, "Returning client receives the one-time $5 credit after the first completed visit.", returningSettings.credits);
    assert(returningSettings.pastVisits.some(visit => visit.bookingId === returningFirstVisit.id), "Past Visits lists the completed first appointment.", returningSettings.pastVisits);
    const returningRebook = await createBooking({ ...returningClient, date: "2026-09-30" });
    assert(String(returningRebook.discountCode || "").startsWith("RETURN5-") && returningRebook.discountAmount === 5 && returningRebook.total === 85, "Returning client credit automatically applies to the next booking.", returningRebook);
    const returningRebookConfirm = await confirmDeposit(returningRebook.id);
    assert(returningRebookConfirm.redeemedCredit?.creditType === "returning", "Returning client credit is redeemed after the next deposit confirmation.", returningRebookConfirm);

    const referrer = client({ fullName: "Referral Owner", email: "referrer@example.test", phone: "3364711100", date: "2026-09-09" });
    await createBooking(referrer);
    const referrerSettings = await clientSettings(referrer);
    const sharedReferralCode = new URL(referrerSettings.shareUrl).searchParams.get("ref");
    assert(Boolean(referrerSettings.referralCode && sharedReferralCode === referrerSettings.referralCode), "Logged-in client settings show a referral code and share link.", referrerSettings);
    assert(referrerSettings.referralCode === "LOVELYLOCS/REFERRALOWNER", "Referral code uses LOVELYLOCS plus the client's name as the username.", referrerSettings);

    const referred = client({
      fullName: "Referred New Client",
      email: "referred@example.test",
      phone: "3364711101",
      birthday: "1998-10-10",
      date: "2026-09-16",
      referredByCode: referrerSettings.referralCode,
    });
    const referredBooking = await createBooking(referred);
    assert(String(referredBooking.discountCode || "").startsWith(`NEW-${referrerSettings.referralCode}`) && referredBooking.discountAmount === 15 && referredBooking.total === 75, "Referred new client receives the new-client referral rate on their booking.", referredBooking);

    const overdueReferred = client({
      fullName: "Overdue Referral Client",
      email: "overdue.referred@example.test",
      phone: "3364711102",
      birthday: "1998-10-11",
      date: "2026-09-17",
      referredByCode: referrerSettings.referralCode,
    });
    const overdueReferredBooking = await createBooking(overdueReferred, {
      cart: [{ id: "overdue-retwist", baseProduct: "Gel" }],
    });
    assert(String(overdueReferredBooking.discountCode || "").startsWith(`NEW-${referrerSettings.referralCode}`) && overdueReferredBooking.discountAmount === 15 && overdueReferredBooking.total === 110, "Referred overdue retwist bookings over $75 receive the $15 first-service discount.", overdueReferredBooking);

    const nonQualifyingReferred = client({
      fullName: "Children Retwist Referral",
      email: "children.referred@example.test",
      phone: "3364711103",
      birthday: "1998-10-12",
      date: "2026-09-18",
      referredByCode: referrerSettings.referralCode,
    });
    const nonQualifyingReferredBooking = await createBooking(nonQualifyingReferred, {
      cart: [{ id: "children-retwist", baseProduct: "Gel" }],
    });
    assert(!nonQualifyingReferredBooking.discountCode && nonQualifyingReferredBooking.discountAmount === 0 && nonQualifyingReferredBooking.total === 75, "Referred first-service discount does not apply when the booked service is $75 or less.", nonQualifyingReferredBooking);

    const pendingSettings = await clientSettings(referrer);
    assert(pendingSettings.referrals.pending.some(item => item.referredBookingId === referredBooking.id), "Referrer sees the referral as pending until the referred client's deposit is confirmed.", pendingSettings.referrals);

    const referredConfirm = await confirmDeposit(referredBooking.id);
    assert(referredConfirm.referralReward?.amountOff === 15, "Referral reward is approved after the referred client's deposit is confirmed.", referredConfirm);
    assert(referredConfirm.referralRewardNotification?.notificationResults?.some(result => result.channel === "referrerEmail"), "Referrer reward email is attempted when the referral reward is approved.", referredConfirm);
    const approvedSettings = await clientSettings(referrer);
    assert(approvedSettings.referrals.approved.some(item => item.referredBookingId === referredBooking.id), "Referrer settings show the approved referral reward.", approvedSettings.referrals);
    assert(approvedSettings.credits.some(credit => credit.type === "referral" && credit.status === "available"), "Referrer has an available referral credit.", approvedSettings.credits);

    const secondReferred = client({
      fullName: "Second Referred Client",
      email: "second.referred@example.test",
      phone: "3364711104",
      birthday: "1998-10-13",
      date: "2026-09-19",
      referredByCode: referrerSettings.referralCode,
    });
    const secondReferredBooking = await createBooking(secondReferred);
    assert(secondReferredBooking.discountAmount === 15 && secondReferredBooking.total === 75, "Second referred new client also receives the $15 first-service discount.", secondReferredBooking);
    await confirmDeposit(secondReferredBooking.id);
    const stackedSettings = await clientSettings(referrer);
    assert(stackedSettings.credits.filter(credit => credit.type === "referral" && credit.status === "available").length === 2, "Referrer can stack multiple available referral credits.", stackedSettings.credits);

    const referralRedeem = await createBooking({ ...referrer, date: "2026-09-23" });
    assert(referralRedeem.discountCode === "REF-STACK-2" && referralRedeem.discountAmount === 30 && referralRedeem.total === 60, "Stacked referral credits automatically apply to the referrer's next booking.", referralRedeem);
    const referralRedeemConfirm = await confirmDeposit(referralRedeem.id);
    assert(referralRedeemConfirm.redeemedCredit?.creditType === "referral" && referralRedeemConfirm.redeemedCredit?.events?.length === 2, "Stacked referral credits are redeemed after the referrer's deposit confirmation.", referralRedeemConfirm);

    const referredSettings = await clientSettings(referred);
    assert(referredSettings.clientFound, "Referred new client can log in with saved details after booking.", referredSettings.client);

    const laterReferred = client({
      fullName: "Later Referral Client",
      email: "later.referred@example.test",
      phone: "3364711199",
      birthday: "1998-11-10",
      date: "2027-03-10",
      referredByCode: referrerSettings.referralCode,
    });
    const laterReferredBooking = await createBooking(laterReferred);
    assert(
      String(laterReferredBooking.discountCode || "").startsWith(`NEW-${referrerSettings.referralCode}`)
      && laterReferredBooking.discountAmount === 15
      && laterReferredBooking.total === 75,
      "Personal referral codes stay active for future bookings and still apply months later.",
      laterReferredBooking
    );

    console.log(JSON.stringify({
      ok: true,
      testedAt: new Date().toISOString(),
      discountCode: "TEST20",
      note: "Local app data and env were restored after this test.",
      results,
    }, null, 2));
  } finally {
    if (child && child.exitCode === null) child.kill();
    restoreFiles();
  }
}

main().catch((error) => {
  restoreFiles();
  console.error(JSON.stringify({
    ok: false,
    error: error.message,
    detail: error.detail || {},
    results,
  }, null, 2));
  process.exit(1);
});




