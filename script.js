const creditsButton = document.querySelector("#creditsButton");
const creditsModal = document.querySelector("#creditsModal");
const creditsPages = document.querySelectorAll(".credits-page");
const creditsPrev = document.querySelector("#creditsPrev");
const creditsNext = document.querySelector("#creditsNext");
const closeCreditsTargets = document.querySelectorAll("[data-close-credits]");

let activeCreditsPage = 0;

function renderCreditsPage() {
  creditsPages.forEach((page, index) => {
    page.classList.toggle("is-active", index === activeCreditsPage);
  });

  creditsPrev.hidden = activeCreditsPage === 0;
  creditsNext.hidden = activeCreditsPage === creditsPages.length - 1;
}

function openCredits() {
  activeCreditsPage = 0;
  renderCreditsPage();
  creditsModal.classList.add("is-open");
  creditsModal.setAttribute("aria-hidden", "false");
}

function closeCredits() {
  creditsModal.classList.remove("is-open");
  creditsModal.setAttribute("aria-hidden", "true");
}

creditsButton.addEventListener("click", openCredits);
creditsPrev.addEventListener("click", () => {
  activeCreditsPage = Math.max(0, activeCreditsPage - 1);
  renderCreditsPage();
});
creditsNext.addEventListener("click", () => {
  activeCreditsPage = Math.min(creditsPages.length - 1, activeCreditsPage + 1);
  renderCreditsPage();
});

closeCreditsTargets.forEach((target) => {
  target.addEventListener("click", closeCredits);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCredits();
  }
});

renderCreditsPage();
