// ./js/layout.js
window.CPATheme?.init();

function normalizePath(p) {
  const parts = (p || "").split("/").filter(Boolean);
  return (parts[parts.length - 1] || "").toLowerCase();
}

function setActiveNav() {
  const current = normalizePath(window.location.pathname) || "index.html";
  const pills = document.querySelectorAll('header .links a.pill');

  pills.forEach(a => {
    a.removeAttribute("aria-current");
    const href = (a.getAttribute("href") || "").toLowerCase();
    const target = normalizePath(href);
    if (target === current) a.setAttribute("aria-current", "page");
  });
}

async function loadLayout() {
  const res = await fetch("./partials/layout.html");
  const html = await res.text();

  const temp = document.createElement("div");
  temp.innerHTML = html;

  const header = temp.querySelector("header");
  const footer = temp.querySelector("footer");

  if (header) document.body.prepend(header);
  if (footer) document.body.appendChild(footer);

  setActiveNav();

  // liga o modal/eventos do botão
  window.CPATheme?.initSettingsUI();
}

document.addEventListener("DOMContentLoaded", loadLayout);
