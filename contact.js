// WaveWorld Contact Page — Form Validation, FAQ Accordion, Toast
document.addEventListener("DOMContentLoaded", () => {

  // ---- HELPERS ----
  const $ = (id) => document.getElementById(id);

  const setError = (inputEl, msgEl, message) => {
    inputEl.classList.add("cf-error");
    if (msgEl) msgEl.textContent = message;
  };

  const clearError = (inputEl, msgEl) => {
    inputEl.classList.remove("cf-error");
    if (msgEl) msgEl.textContent = "";
  };

  // ---- CHARACTER COUNTER ----
  const messageInput = $("message");
  const charCount    = $("charCount");

  if (messageInput && charCount) {
    messageInput.addEventListener("input", () => {
      const len = messageInput.value.length;
      charCount.textContent = len;

      const countEl = charCount.closest(".cf-char-count");
      if (!countEl) return;
      countEl.classList.remove("cf-near-limit", "cf-at-limit");
      if (len >= 1000) countEl.classList.add("cf-at-limit");
      else if (len >= 800) countEl.classList.add("cf-near-limit");
    });
  }

  // ---- FORM VALIDATION ----
  const validateForm = () => {
    let valid = true;

    // Full name
    const fullName  = $("fullName");
    const errName   = $("errFullName");
    if (!fullName.value.trim() || fullName.value.trim().length < 2) {
      setError(fullName, errName, "Please enter your full name.");
      valid = false;
    } else {
      clearError(fullName, errName);
    }

    // Email
    const emailInput = $("contactEmail");
    const errEmail   = $("errEmail");
    const emailRx    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRx.test(emailInput.value.trim())) {
      setError(emailInput, errEmail, "Please enter a valid email address.");
      valid = false;
    } else {
      clearError(emailInput, errEmail);
    }

    // Mobile number (digits only with optional leading + and clean formatting)
    const phoneInput = $("mobileNumber");
    const errPhone   = $("errPhone");
    const rawDigits  = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";
    if (!phoneInput || !phoneInput.value.trim()) {
      setError(phoneInput, errPhone, "Please enter your mobile number.");
      valid = false;
    } else if (rawDigits.length < 7 || rawDigits.length > 15) {
      setError(phoneInput, errPhone, "Please enter a valid phone number (7 to 15 digits).");
      valid = false;
    } else {
      clearError(phoneInput, errPhone);
    }

    // Message
    const msgInput = $("message");
    const errMsg   = $("errMessage");
    if (!msgInput.value.trim() || msgInput.value.trim().length < 10) {
      setError(msgInput, errMsg, "Please write a message (at least 10 characters).");
      valid = false;
    } else {
      clearError(msgInput, errMsg);
    }

    return valid;
  };

  // ---- MOBILE NUMBER NUMERIC-ONLY INPUT FILTER ----
  const phoneField = $("mobileNumber");
  if (phoneField) {
    // Block letter keypresses immediately
    phoneField.addEventListener("keydown", (e) => {
      // Allow navigation and modification control keys
      const controlKeys = [
        "Backspace", "Delete", "Tab", "Escape", "Enter",
        "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
        "Home", "End"
      ];
      if (controlKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
        return;
      }

      // Allow digits
      if (/^[0-9]$/.test(e.key)) {
        return;
      }

      // Allow '+' only as the very first character
      if (e.key === "+" && phoneField.selectionStart === 0 && !phoneField.value.includes("+")) {
        return;
      }

      // Allow space and dash for formatting
      if (e.key === " " || e.key === "-" || e.key === "(" || e.key === ")") {
        return;
      }

      // Block all letters and any other symbol
      e.preventDefault();
    });

    // Sanitize any paste or autofill to ensure no letters slip through
    phoneField.addEventListener("input", () => {
      const startsWithPlus = phoneField.value.trim().startsWith("+");
      let cleaned = phoneField.value.replace(/[^\d\s\-()]/g, "");
      if (startsWithPlus) {
        cleaned = "+" + cleaned.replace(/\+/g, "");
      } else {
        cleaned = cleaned.replace(/\+/g, "");
      }
      phoneField.value = cleaned;
    });
  }

  // Clear errors on input to give immediate feedback
  ["fullName", "contactEmail", "mobileNumber", "message"].forEach((id) => {
    const el = $(id);
    if (!el) return;
    const errId = { fullName: "errFullName", contactEmail: "errEmail", mobileNumber: "errPhone", message: "errMessage" }[id];
    el.addEventListener("input", () => clearError(el, $(errId)));
  });

  // ---- TOAST ----
  const toast    = $("contactToast");
  const toastClose = $("toastClose");

  const showToast = () => {
    if (!toast) return;
    toast.classList.add("is-visible");
    setTimeout(() => hideToast(), 6000);
  };
  const hideToast = () => {
    if (!toast) return;
    toast.classList.remove("is-visible");
  };
  if (toastClose) toastClose.addEventListener("click", hideToast);

  // ---- FORM SUBMIT ----
  const form      = $("contactForm");
  const submitBtn = $("contactSubmitBtn");
  const btnText   = submitBtn ? submitBtn.querySelector(".cf-btn-text") : null;

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!validateForm()) {
        // Focus the first errored field
        const firstErr = form.querySelector(".cf-error");
        if (firstErr) firstErr.focus();
        return;
      }

      // Simulate sending (loading state for 1.8 s, then success)
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
      if (btnText) btnText.textContent = "Sending...";

      setTimeout(() => {
        submitBtn.classList.remove("is-loading");
        submitBtn.classList.add("is-sent");
        if (btnText) btnText.textContent = "Message Sent!";

        // Reset form
        form.reset();
        if (charCount) charCount.textContent = "0";
        const countEl = charCount ? charCount.closest(".cf-char-count") : null;
        if (countEl) countEl.classList.remove("cf-near-limit", "cf-at-limit");

        // Show toast
        showToast();

        // Re-enable button after a pause
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.classList.remove("is-sent");
          if (btnText) btnText.textContent = "Send Message";
        }, 4000);

      }, 1800);
    });
  }

  // ---- FAQ ACCORDION ----
  const faqBtns = document.querySelectorAll(".faq-toggle");
  faqBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const bodyId = btn.getAttribute("aria-controls");
      const body   = document.getElementById(bodyId);
      if (!body) return;

      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // Close all others first
      faqBtns.forEach((other) => {
        if (other === btn) return;
        other.setAttribute("aria-expanded", "false");
        const otherBodyId = other.getAttribute("aria-controls");
        const otherBody   = document.getElementById(otherBodyId);
        if (otherBody) otherBody.hidden = true;
      });

      // Toggle current
      btn.setAttribute("aria-expanded", String(!isOpen));
      body.hidden = isOpen;
    });
  });

});
