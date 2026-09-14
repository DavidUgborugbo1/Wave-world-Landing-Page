(function () {
  "use strict";

  const toggle = document.getElementById("navToggle");
  const panel = document.getElementById("mobileNav");
  const backdrop = document.getElementById("mobileNavBackdrop");

  if (!toggle || !panel) return; // page hasn't got a mobile nav

  function openNav() {
    panel.classList.add("open");
    if (backdrop) backdrop.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeNav() {
    panel.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function toggleNav() {
    const isOpen = panel.classList.contains("open");
    isOpen ? closeNav() : openNav();
  }

  toggle.addEventListener("click", toggleNav);
  if (backdrop) backdrop.addEventListener("click", closeNav);

  // Close on ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("open")) closeNav();
  });

  // Close when a mobile nav link is tapped
  panel.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });
})();
