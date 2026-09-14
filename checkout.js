// WaveWorld Checkout Interactions: Ticket Selection, Quantity & Payment Methods
document.addEventListener("DOMContentLoaded", () => {
  const PASSES = {
    day: {
      park: "WAVEWORLD · ADM",
      name: "Single Day Pass",
      price: 42,
      fee: 3.5,
    },
    season: {
      park: "WAVEWORLD · ADM",
      name: "Season Pass",
      price: 119,
      fee: 3.5,
    },
    family: {
      park: "WAVEWORLD · ADM",
      name: "Family 4-Pack",
      price: 149,
      fee: 5.0,
    },
    vip: {
      park: "WAVEWORLD · VIP",
      name: "VIP FastTrack",
      price: 79,
      fee: 4.0,
    },
    twilight: {
      park: "WAVEWORLD · ADM",
      name: "Sunset Twilight",
      price: 28,
      fee: 2.5,
    },
    cabana: {
      park: "WAVEWORLD · LUX",
      name: "Cabana Oasis",
      price: 199,
      fee: 6.0,
    },
  };

  const urlParams = new URLSearchParams(window.location.search);
  const passId = urlParams.get("pass") || "day";
  const selectedPass = PASSES[passId] || PASSES.day;

  // Populate the order summary stub with the selected ticket's details
  const ticketParkEl = document.getElementById("ticketPark");
  const ticketNameEl = document.getElementById("ticketName");
  const ticketPriceEl = document.getElementById("ticketPriceVal");
  if (ticketParkEl) ticketParkEl.textContent = selectedPass.park;
  if (ticketNameEl) ticketNameEl.textContent = selectedPass.name;
  if (ticketPriceEl) ticketPriceEl.textContent = `$${selectedPass.price}`;
  document.title = `Checkout — ${selectedPass.name} — WaveWorld Water Park`;

  // --- 1. QUANTITY & DYNAMIC PRICING ---
  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");
  const qtyNum = document.getElementById("qtyNum");
  const subtotalVal = document.getElementById("subtotalVal");
  const bookingFeeVal = document.getElementById("bookingFeeVal");
  const totalDueVal = document.getElementById("totalDueVal");
  const cardPayBtn = document.getElementById("payBtn");
  const bankPayBtn = document.getElementById("bankPayBtn");
  const transferAmountVal = document.getElementById("transferAmountVal");

  const unitPrice = selectedPass.price;
  const bookingFee = selectedPass.fee;
  let currentQty = 1;

  const updateTotals = () => {
    const subtotal = unitPrice * currentQty;
    const totalFee = bookingFee * currentQty;
    const totalDue = subtotal + totalFee;

    if (qtyNum) qtyNum.textContent = currentQty;
    if (subtotalVal) subtotalVal.textContent = `$${subtotal.toFixed(2)}`;
    if (bookingFeeVal) bookingFeeVal.textContent = `$${totalFee.toFixed(2)}`;
    if (totalDueVal) totalDueVal.textContent = `$${totalDue.toFixed(2)}`;
    if (transferAmountVal)
      transferAmountVal.textContent = `$${totalDue.toFixed(2)}`;
    if (cardPayBtn)
      cardPayBtn.textContent = `💳 Pay $${totalDue.toFixed(2)} with Card`;
    if (bankPayBtn)
      bankPayBtn.textContent = `✅ I Have Transferred $${totalDue.toFixed(2)}`;
  };

  // Render immediately on load so the totals reflect the selected pass,
  // not just the default $42 Day Pass markup baked into the HTML.
  updateTotals();

  if (qtyMinus && qtyPlus) {
    qtyMinus.addEventListener("click", () => {
      if (currentQty > 1) {
        currentQty--;
        updateTotals();
      }
    });

    qtyPlus.addEventListener("click", () => {
      if (currentQty < 20) {
        currentQty++;
        updateTotals();
      }
    });
  }

  // Set default date to tomorrow
  const visitDateInput = document.getElementById("visitDate");
  if (visitDateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    visitDateInput.value = tomorrow.toISOString().split("T")[0];
    visitDateInput.min = new Date().toISOString().split("T")[0];
  }

  // --- CARD NUMBER FORMATTING (space every 4 digits, capped at 16 digits) ---
  const cardNumberInput = document.getElementById("cardNumber");
  if (cardNumberInput) {
    cardNumberInput.setAttribute("maxlength", "19"); // 16 digits + 3 spaces
    cardNumberInput.addEventListener("input", (e) => {
      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 16);
      const grouped = digitsOnly.replace(/(.{4})(?=.)/g, "$1 ");
      e.target.value = grouped;
    });
  }

  // --- FIELD VALIDATION HELPERS ---
  const markInvalid = (input, message) => {
    if (!input) return;
    input.classList.add("input-error");
    let errorEl = input.parentElement.querySelector(".field-error-msg");
    if (!errorEl) {
      errorEl = document.createElement("span");
      errorEl.className = "field-error-msg";
      input.insertAdjacentElement("afterend", errorEl);
    }
    errorEl.textContent = message;
  };

  const clearInvalid = (input) => {
    if (!input) return;
    input.classList.remove("input-error");
    const errorEl = input.parentElement.querySelector(".field-error-msg");
    if (errorEl) errorEl.remove();
  };

  // Digits-only fields: strip non-digits as the user types, so a field
  // meant to hold "12" can never end up holding letters or symbols.
  const restrictToDigits = (input, maxLen) => {
    if (!input) return;
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, maxLen);
    });
  };

  const expMonthInput = document.getElementById("expMonth");
  const expYearInput = document.getElementById("expYear");
  const cvvInput = document.getElementById("cvv");
  const zipInput = document.getElementById("zip");
  const cardNameInput = document.getElementById("cardName");

  restrictToDigits(expMonthInput, 2);
  restrictToDigits(expYearInput, 2);
  restrictToDigits(cvvInput, 3);

  const isAllZeros = (val) => /^0+$/.test(val);

  const validateCardForm = () => {
    let valid = true;

    // Card number: must be 16 digits and not all zeros
    const cardDigits = (cardNumberInput?.value || "").replace(/\D/g, "");
    if (cardDigits.length !== 16 || isAllZeros(cardDigits)) {
      markInvalid(cardNumberInput, "Enter a valid 16-digit card number.");
      valid = false;
    } else {
      clearInvalid(cardNumberInput);
    }

    // Card name: can't be empty
    if (!cardNameInput?.value.trim()) {
      markInvalid(cardNameInput, "Enter the name on the card.");
      valid = false;
    } else {
      clearInvalid(cardNameInput);
    }

    // Expiry month: 01–12, can't be 00 or blank
    const month = parseInt(expMonthInput?.value || "", 10);
    if (!expMonthInput?.value || isNaN(month) || month < 1 || month > 12) {
      markInvalid(expMonthInput, "Enter a valid month (01–12).");
      valid = false;
    } else {
      clearInvalid(expMonthInput);
    }

    // Expiry year: 2 digits, can't be blank or all zeros
    const yearVal = expYearInput?.value || "";
    if (!/^\d{2}$/.test(yearVal) || isAllZeros(yearVal)) {
      markInvalid(expYearInput, "Enter a valid year (e.g. 27).");
      valid = false;
    } else {
      clearInvalid(expYearInput);
    }

    // CVV: 3 digits, can't be all zeros
    const cvvVal = cvvInput?.value || "";
    if (!/^\d{3}$/.test(cvvVal) || isAllZeros(cvvVal)) {
      markInvalid(cvvInput, "Enter a valid CVV.");
      valid = false;
    } else {
      clearInvalid(cvvInput);
    }

    // ZIP: can't be blank or all zeros
    const zipVal = (zipInput?.value || "").trim();
    if (!zipVal || isAllZeros(zipVal)) {
      markInvalid(zipInput, "Enter a valid ZIP/postal code.");
      valid = false;
    } else {
      clearInvalid(zipInput);
    }

    return valid;
  };

  // --- 2. PAYMENT METHOD SWITCHER ---
  const tabCard = document.getElementById("tabCard");
  const tabBank = document.getElementById("tabBank");
  const cardPanel = document.getElementById("cardPaymentPanel");
  const bankPanel = document.getElementById("bankPaymentPanel");

  const switchPaymentMethod = (method) => {
    if (method === "card") {
      tabCard.classList.add("active");
      tabBank.classList.remove("active");
      tabCard.setAttribute("aria-selected", "true");
      tabBank.setAttribute("aria-selected", "false");
      cardPanel.classList.remove("hidden");
      bankPanel.classList.add("hidden");
    } else {
      tabBank.classList.add("active");
      tabCard.classList.remove("active");
      tabBank.setAttribute("aria-selected", "true");
      tabCard.setAttribute("aria-selected", "false");
      bankPanel.classList.remove("hidden");
      cardPanel.classList.add("hidden");
    }
  };

  if (tabCard && tabBank) {
    tabCard.addEventListener("click", () => switchPaymentMethod("card"));
    tabBank.addEventListener("click", () => switchPaymentMethod("bank"));
  }

  // --- 3. COPY BANK DETAILS HELPERS ---
  const setupCopyBtn = (btnId, textToCopy) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener("click", () => {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          const originalText = btn.innerHTML;
          btn.innerHTML = "✓ Copied!";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove("copied");
          }, 2000);
        })
        .catch(() => {
          alert(`Copied: ${textToCopy}`);
        });
    });
  };

  setupCopyBtn("copyAccBtn", "0123456789");
  setupCopyBtn(
    "copyRefBtn",
    document.getElementById("refCodeVal")?.textContent || "WW-84920-ADM",
  );

  // --- 4. PAYMENT PROCESSING MODAL (Confirming Payment → Payment Successful) ---
  const paymentModal = document.getElementById("paymentModal");
  const payModalLoading = document.getElementById("payModalLoading");
  const payModalSuccess = document.getElementById("payModalSuccess");
  const paySuccessTitle = document.getElementById("paySuccessTitle");
  const paySuccessMessage = document.getElementById("paySuccessMessage");
  const payModalCloseBtn = document.getElementById("payModalCloseBtn");
  const paymentModalBackdrop = document.getElementById("paymentModalBackdrop");

  const closePaymentModal = () => {
    if (paymentModal) {
      paymentModal.classList.remove("is-active");
      paymentModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }
  };

  /**
   * Opens the payment modal:
   *  1. Shows the spinner with "Confirming Payment…" immediately.
   *  2. After ~2.8 seconds, transitions to "Payment Successful!" with animated checkmark.
   */
  const showPaymentModal = (successTitle, successMsg) => {
    if (!paymentModal) return;

    // Reset to loading phase
    payModalLoading.classList.remove("hidden", "phase-out");
    payModalSuccess.classList.add("hidden");
    payModalSuccess.classList.remove("phase-in");

    // Open modal
    paymentModal.classList.add("is-active");
    paymentModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    // After 2.8 s transition to success
    setTimeout(() => {
      // Fade out the loading phase
      payModalLoading.classList.add("phase-out");

      setTimeout(() => {
        payModalLoading.classList.add("hidden");

        // Fill in the success content
        if (paySuccessTitle) paySuccessTitle.textContent = successTitle;
        if (paySuccessMessage) paySuccessMessage.innerHTML = successMsg;

        // Reveal success phase with animation
        payModalSuccess.classList.remove("hidden");
        void payModalSuccess.offsetWidth;
        payModalSuccess.classList.add("phase-in");
      }, 350);
    }, 2800);
  };

  if (payModalCloseBtn) {
    payModalCloseBtn.addEventListener("click", closePaymentModal);
  }
  if (paymentModalBackdrop) {
    paymentModalBackdrop.addEventListener("click", () => {
      if (!payModalSuccess.classList.contains("hidden")) {
        window.location.href = "index.html";
      }
    });
  }

  // --- CARD FORM SUBMIT ---
  const cardForm = document.getElementById("cardForm");
  if (cardForm) {
    cardForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!validateCardForm()) {
        const firstError = cardForm.querySelector(".input-error");
        if (firstError) firstError.focus();
        return;
      }

      const email = document.getElementById("email")?.value || "your email";
      showPaymentModal(
        "Payment Successful!",
        `Your card transaction was processed successfully.<br><br>
         We have issued your <strong>${currentQty}× ${selectedPass.name}</strong> wristband barcode.
         Confirmation details have been sent to <strong>${email}</strong>.`,
      );
    });
  }

  // --- BANK FORM SUBMIT ---
  const bankForm = document.getElementById("bankForm");
  if (bankForm) {
    bankForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const bankEmail =
        document.getElementById("bankEmail")?.value || "your email";
      showPaymentModal(
        "Transfer Received!",
        `Thank you! We've logged your bank transfer for
         <strong>${currentQty}× ${selectedPass.name}</strong>.<br><br>
         Your e-tickets will be sent to <strong>${bankEmail}</strong> within 5–10 minutes.`,
      );
    });
  }
});
