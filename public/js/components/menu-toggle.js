//menu-toggle.js
function attachMenuToggle() {
  const toggleBtn = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (toggleBtn && !toggleBtn.hasAttribute('data-listener')) {
    toggleBtn.addEventListener("click", () => {
      const isVisible = navMenu.classList.toggle("visible");
      console.log('Menu visibility toggled:', isVisible);
      navMenu.setAttribute("aria-hidden", !isVisible);
    });
    toggleBtn.setAttribute('data-listener', 'true');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  attachMenuToggle();

  // Cierra el menú si se hace click fuera
  document.addEventListener("click", e => {
    const toggleBtn = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    if (navMenu && toggleBtn && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      navMenu.classList.remove("visible");
      navMenu.setAttribute("aria-hidden", "true");
    }
  });

  window.addEventListener("resize", attachMenuToggle);

  // Use MutationObserver to detect changes in the DOM
  const observer = new MutationObserver(attachMenuToggle);
  observer.observe(document.body, { childList: true, subtree: true });
});