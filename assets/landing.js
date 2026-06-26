/**
 * Landing page JS.
 * Handles scroll-spy header, reveal animations.
 */

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initReveal() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (targets.length === 0) return;

  if (prefersReducedMotion()) {
    for (const el of targets) {
      el.classList.add("is-visible");
    }
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
  );

  for (const el of targets) {
    observer.observe(el);
  }
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
  initReveal();
});
