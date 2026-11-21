import coiffure from '../assets/categories/coiffure.webp';
import manucure from '../assets/categories/manucure.webp';
import pedicure from '../assets/categories/pedicure.webp';
import epilation from '../assets/categories/epilation.webp';
import soinVisage from '../assets/categories/soin-visage.webp';
import maquillage from '../assets/categories/maquillage.webp';
import massage from '../assets/categories/massage.webp';
import packsMariee from '../assets/categories/packs-mariee.webp';

/**
 * Local category images, imported as .webp so Vite fingerprints and bundles them.
 * Every category that has an image is listed here; the card only uses its
 * decorative fallback when a category is genuinely missing from this map.
 */
export const categoryImages = {
  coiffure,
  manucure,
  pedicure,
  epilation,
  'soin-visage': soinVisage,
  maquillage,
  massage,
  'packs-mariee': packsMariee
};
