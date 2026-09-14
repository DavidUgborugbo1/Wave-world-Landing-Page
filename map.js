// WaveWorld Park Map: In-page image modal (replaces the old new-tab link)
document.addEventListener("DOMContentLoaded", () => {
  const mapImg = document.getElementById("mapPreviewImg");
  const openFullViewBtn = document.getElementById("openFullViewBtn");
  const modal = document.getElementById("mapImageModal");
  const modalBackdrop = document.getElementById("mapModalBackdrop");
  const modalClose = document.getElementById("mapModalClose");

  if (!modal) return;

  const openModal = (e) => {
    if (e) e.preventDefault(); // stop the link from navigating/opening a new tab
    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    modal.classList.remove("is-active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  // Clicking the map thumbnail itself also opens the full view
  if (mapImg) {
    mapImg.style.cursor = "zoom-in";
    mapImg.addEventListener("click", openModal);
  }

  // "Open Full View" button opens the modal instead of navigating away.
  // href is left intact as a fallback in case JS fails to load.
  if (openFullViewBtn) openFullViewBtn.addEventListener("click", openModal);

  if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);
  if (modalClose) modalClose.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-active"))
      closeModal();
  });
});
