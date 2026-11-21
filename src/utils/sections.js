// Routes publiques de l'accueil : chaque URL pointe vers une section de la
// page d'accueil, sans utiliser de hash (#).
export const SECTION_ROUTES = {
  '/': 'hero',
  '/services-categories': 'services-categories',
  '/booking-section': 'booking-section',
  '/pourquoi-nous': 'why-us',
  '/ambiance': 'atmosphere',
  '/contact': 'contact'
};

// Anciennes URL avec hash (/#services-categories, /#booking-section, ...).
// Elles sont redirigées vers les nouvelles URL propres pour ne rien casser.
export const HASH_ROUTES = {
  'services-categories': '/services-categories',
  services: '/services-categories',
  'booking-section': '/booking-section',
  reservation: '/booking-section',
  'why-us': '/pourquoi-nous',
  'pourquoi-nous': '/pourquoi-nous',
  atmosphere: '/ambiance',
  ambiance: '/ambiance',
  contact: '/contact'
};

// Identifiants de sections observés par la navbar pour l'état actif.
export const NAV_SECTIONS = [
  'hero',
  'services-categories',
  'booking-section',
  'why-us',
  'atmosphere',
  'contact'
];
