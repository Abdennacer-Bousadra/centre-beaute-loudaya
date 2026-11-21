// Hauteur approximative du header sticky (+ bandeau horaires) pour ne jamais
// masquer le haut de la cible lors d'un scroll programmatique.
export const HEADER_OFFSET = 96;

const scrollWindowTo = (top, behavior) => {
  const safeTop = Math.max(0, top);

  if (behavior === 'instant') {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, safeTop);
    root.style.scrollBehavior = previousBehavior;
    return;
  }

  window.scrollTo({ top: safeTop, behavior: 'smooth' });
};

export const scrollToElement = (
  element,
  { behavior = 'smooth', offset = HEADER_OFFSET, block = 'start' } = {}
) => {
  if (!element) return;

  const rect = element.getBoundingClientRect();

  if (block === 'center') {
    const centeredTop =
      rect.top + window.scrollY - (window.innerHeight - rect.height) / 2;
    scrollWindowTo(centeredTop, behavior);
    return;
  }

  scrollWindowTo(rect.top + window.scrollY - offset, behavior);
};

export const scrollToSection = (id, options = {}) =>
  scrollToElement(document.getElementById(id), options);

export const scrollToTop = (behavior = 'smooth') => scrollWindowTo(0, behavior);
