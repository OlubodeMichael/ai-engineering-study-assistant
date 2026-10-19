/**
 * Opens the "Course references" section containing an entry, scrolls the
 * entry into view, and moves focus to it.
 */
export function revealReference(anchorId: string): void {
  const element = document.getElementById(anchorId);
  if (!element) return;

  const section = element.closest("details");
  if (section) section.open = true;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
  element.focus({ preventScroll: true });
}
