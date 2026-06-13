(() => {
  const codeKey = "lovelyLocsFriendThankYouCode";
  const submittedKey = "lovelyLocsFriendBookingSubmitted";
  const codePattern = /^LL-FRIEND-(0[1-9]|10)$/;

  function inviteCode() {
    const queryCode = String(new URLSearchParams(window.location.search).get("friend-test") || "").trim().toUpperCase();
    if (codePattern.test(queryCode)) {
      localStorage.setItem(codeKey, queryCode);
      return queryCode;
    }
    const savedCode = String(localStorage.getItem(codeKey) || "").trim().toUpperCase();
    return codePattern.test(savedCode) ? savedCode : "";
  }

  function submittedTest() {
    try {
      const submitted = JSON.parse(localStorage.getItem(submittedKey) || "null");
      return submitted && codePattern.test(submitted.code) ? submitted : null;
    } catch {
      return null;
    }
  }

  function showThankYou() {
    if (window.location.hash.replace("#", "").split("?")[0] !== "payment-options") return;
    const submitted = submittedTest();
    if (!submitted || document.querySelector(".friend-test-finish")) return;
    const container = document.querySelector(".payment-options-section .container");
    if (!container) return;

    const panel = document.createElement("div");
    panel.className = "friend-test-finish complete";
    panel.style.cssText = "margin:0 0 24px;padding:26px;border:1px dashed rgba(169,122,31,.65);border-radius:18px;background:linear-gradient(135deg,rgba(255,249,224,.98),rgba(247,239,250,.98));box-shadow:0 14px 34px rgba(61,32,72,.08)";
    panel.innerHTML = `
      <p class="eyebrow">Friends Website Test</p>
      <h2 style="margin:4px 0 10px">Thank you for testing the Lovely Locs booking service for me.</h2>
      <p>Your full appointment request went through successfully. Your honest feedback will help make the website easier and clearer for future clients.</p>
      <p style="margin-bottom:0;font-size:.9rem">Tester code: <strong>${submitted.code}</strong></p>
    `;
    container.prepend(panel);
  }

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    const requestUrl = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
    const method = String(args[1]?.method || args[0]?.method || "GET").toUpperCase();
    const code = inviteCode();
    if (code && method === "POST" && /\/api\/bookings(?:$|\?)/.test(requestUrl)) {
      try {
        const result = await response.clone().json();
        if (result.ok && !result.noCharge) {
          localStorage.setItem(submittedKey, JSON.stringify({
            code,
            bookingId: result.id || "",
            submittedAt: new Date().toISOString()
          }));
        }
      } catch {
        // The normal booking flow handles malformed responses.
      }
    }
    return response;
  };

  inviteCode();
  window.addEventListener("hashchange", () => setTimeout(showThankYou, 50));
  window.addEventListener("load", () => setTimeout(showThankYou, 50));
  new MutationObserver(showThankYou).observe(document.getElementById("app"), { childList: true });
  showThankYou();
})();
