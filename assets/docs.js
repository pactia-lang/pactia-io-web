/**
 * Documentation pages JS.
 * Builds table of contents from headings + scroll-spy.
 */

const TOC_HEADING_SELECTOR = "h1, h2, h3";
const BOTTOM_SCROLL_THRESHOLD_PX = 8;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getScrollSpyOffsetPx() {
  const rootStyles = getComputedStyle(document.documentElement);
  const navHeight = Number.parseFloat(rootStyles.getPropertyValue("--nav-h")) || 56;
  const sampleHeading = document.querySelector(
    "#docs-content h2, #docs-content h3"
  );
  if (sampleHeading) {
    const marginTop = Number.parseFloat(
      getComputedStyle(sampleHeading).scrollMarginTop
    );
    if (!Number.isNaN(marginTop) && marginTop > 0) {
      return marginTop;
    }
  }
  return navHeight + 24;
}

function headingLevelClass(tagName) {
  return tagName === "H3"
    ? "docs-toc__item docs-toc__item--sub"
    : "docs-toc__item";
}

function headingLabel(heading) {
  return heading.textContent?.replace(/\s+/g, " ").trim() ?? heading.id;
}

function buildToc() {
  const content = document.getElementById("docs-content");
  const tocRoot = document.getElementById("docs-toc");
  if (!content || !tocRoot) return;

  const headings = content.querySelectorAll(TOC_HEADING_SELECTOR);
  if (headings.length === 0) return;

  const list = document.createElement("ul");
  list.className = "docs-toc__list";

  const entries = [];

  for (const heading of headings) {
    if (!heading.id) continue;

    const item = document.createElement("li");
    item.className = headingLevelClass(heading.tagName);
    item.dataset.sectionId = heading.id;

    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = headingLabel(heading);
    item.appendChild(link);
    list.appendChild(item);
    entries.push({ id: heading.id, element: item, heading });
  }

  tocRoot.replaceChildren(list);
  initTocScrollSpy(entries);
}

function isNearPageBottom() {
  return (
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - BOTTOM_SCROLL_THRESHOLD_PX
  );
}

function resolveActiveHeadingId(entries, offsetPx) {
  if (entries.length === 0) return "";

  if (isNearPageBottom()) {
    const lastEntry = entries.at(-1);
    return lastEntry?.id ?? "";
  }

  const firstEntry = entries[0];
  if (!firstEntry) return "";

  let activeId = firstEntry.id;
  for (const entry of entries) {
    if (entry.heading.getBoundingClientRect().top <= offsetPx) {
      activeId = entry.id;
      continue;
    }
    break;
  }

  return activeId;
}

function scrollTocItemIntoView(item) {
  const sidebar = item.closest(".docs-sidebar");
  if (!sidebar) return;

  const itemRect = item.getBoundingClientRect();
  const sidebarRect = sidebar.getBoundingClientRect();

  if (itemRect.top < sidebarRect.top) {
    sidebar.scrollTop -= sidebarRect.top - itemRect.top;
    return;
  }

  if (itemRect.bottom > sidebarRect.bottom) {
    sidebar.scrollTop += itemRect.bottom - sidebarRect.bottom;
  }
}

function initTocScrollSpy(entries) {
  if (entries.length === 0) return;

  let activeId = "";
  let ticking = false;
  let clickLockUntil = 0;

  const setActive = (id, scrollSidebar) => {
    if (!id || id === activeId) return;

    activeId = id;
    for (const entry of entries) {
      entry.element.classList.toggle("is-active", entry.id === id);
    }

    if (scrollSidebar) {
      const activeItem = entries.find((entry) => entry.id === id)?.element;
      if (activeItem) {
        scrollTocItemIntoView(activeItem);
      }
    }
  };

  const updateFromScroll = () => {
    ticking = false;
    if (Date.now() < clickLockUntil) return;
    const offsetPx = getScrollSpyOffsetPx();
    setActive(resolveActiveHeadingId(entries, offsetPx), true);
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateFromScroll);
    }
  };

  for (const entry of entries) {
    const link = entry.element.querySelector("a");
    if (!link) continue;

    link.addEventListener("click", (event) => {
      event.preventDefault();
      const offsetPx = getScrollSpyOffsetPx();
      const top =
        window.scrollY + entry.heading.getBoundingClientRect().top - offsetPx;

      clickLockUntil = Date.now() + (prefersReducedMotion() ? 0 : 450);
      setActive(entry.id, true);

      window.scrollTo({
        top: Math.max(0, top),
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });

      history.replaceState(null, "", `#${entry.id}`);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  const hash = window.location.hash.slice(1);
  if (hash && entries.some((entry) => entry.id === hash)) {
    const match = entries.find((entry) => entry.id === hash);
    if (match) {
      const offsetPx = getScrollSpyOffsetPx();
      const top =
        window.scrollY + match.heading.getBoundingClientRect().top - offsetPx;
      window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
      setActive(hash, true);
      return;
    }
  }

  updateFromScroll();
}

function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  initSiteNav();
  initHeader();
  buildToc();
});
