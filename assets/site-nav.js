/**
 * navPage values: "home" | "overview" | "all-docs"
 */

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "overview", label: "Overview" },
  { id: "all-docs", label: "All docs" },
];

function prefix() {
  const path = window.location.pathname;
  if (path.endsWith("/docs/index.html") || path.endsWith("/docs/overview.html") || path.endsWith("/docs/")) {
    return "../";
  }
  if (path.includes("/docs/")) {
    return "../";
  }
  return "";
}

function resolveHref(itemId) {
  const p = prefix();
  switch (itemId) {
    case "home":
      return p + "index.html";
    case "overview":
      return p + "docs/overview.html";
    case "all-docs":
      return p + "docs/index.html";
    default:
      return p + "index.html";
  }
}

function resolveCurrentPage() {
  const fromBody = document.body.dataset.navPage;
  if (
    fromBody === "home" ||
    fromBody === "overview" ||
    fromBody === "all-docs"
  ) {
    return fromBody;
  }
  return undefined;
}

function initSiteNav() {
  const actions = document.querySelector("[data-site-header-actions]");
  if (!actions) return;

  const currentPage = resolveCurrentPage();

  const nav = document.createElement("nav");
  nav.className = "site-nav docs-nav";
  nav.setAttribute("aria-label", "Site");

  for (const item of NAV_ITEMS) {
    const link = document.createElement("a");
    link.className = "docs-nav__link";
    link.href = resolveHref(item.id);
    link.textContent = item.label;

    if (currentPage === item.id) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }

    nav.appendChild(link);
  }

  const githubLink = document.createElement("a");
  githubLink.className = "btn";
  githubLink.href = "https://github.com/pactia-lang";
  githubLink.target = "_blank";
  githubLink.rel = "noopener noreferrer";
  githubLink.textContent = "GitHub";

  actions.replaceChildren(nav, githubLink);

  const brand = document.querySelector("[data-site-brand]");
  if (brand) {
    brand.href = resolveHref("home");
  }
}
