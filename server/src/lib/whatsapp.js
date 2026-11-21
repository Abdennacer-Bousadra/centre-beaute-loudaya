import { env } from '../env.js';

/**
 * Options adicionales (finitions / soins) : le prix est imposé par le serveur,
 * le client ne peut jamais envoyer son propre tarif.
 */
export const EXTRA_OPTIONS = {
  'opt-deco': {
    slug: 'opt-deco',
    nameFr: 'Option Nail Art & Finitions (French, Chrome, Baby-Boomer, Cat Eye, Ongle 3D)',
    nameAr: 'إضافات نيل آرت وتزيين (فرينش، كروم، بيبي بومر، كات آي، ظفر 3D)',
    price: 50
  },
  'opt-paraffine-jelly': {
    slug: 'opt-paraffine-jelly',
    nameFr: 'Option Soins Paraffine / Soins Jelly',
    nameAr: 'عناية إضافية بالبرافين أو الجيلي المرطب (Paraffine / Jelly)',
    price: 60
  }
};

export const EXTRA_OPTION_SLUGS = Object.keys(EXTRA_OPTIONS);

export function resolveExtraOption(slug) {
  if (!slug) return null;
  return EXTRA_OPTIONS[slug] || null;
}

export const SALON_WHATSAPP_INTL = env.SALON_WHATSAPP.replace(/\D/g, '');

const formatFrDate = (dateString) => {
  const [y, m, d] = dateString.split('-');
  return `${d}/${m}/${y}`;
};

const formatArDate = (dateString) => {
  const [y, m, d] = dateString.split('-');
  return `${d}/${m}/${y}`;
};

/**
 * Construit le lien WhatsApp (wa.me) envoyé au salon avec le récapitulatif
 * de la réservation (cliente, service, date, heure).
 *
 * @returns {string} URL wa.me prête à ouvrir
 */
export function buildBookingWhatsAppLink({ booking, lang = 'fr' }) {
  const isArabic = lang === 'ar';
  const ref = booking.ref;
  const names = booking.items.map((item) => (isArabic ? item.nameAr : item.nameFr));
  const servicesList = names.map((name, index) => `  ${index + 1}. *${name}*`).join('\n');
  const extra = resolveExtraOption(booking.extraOptionSlug);
  const extraLine = extra
    ? `\n*${isArabic ? 'إضافة' : 'Option'} :* ${isArabic ? extra.nameAr : extra.nameFr}`
    : '';
  const dateLabel = formatArDate(booking.date);

  const separator = '---';

  const text = isArabic
    ? `السلام عليكم مركز التجميل الوداية
طلب حجز جديد رقم *${ref}* :
${separator.repeat(17)}
*العميلة :* ${booking.clientName}
*الهاتف :* ${booking.phone}
*الخدمات :*
${servicesList}${extraLine}
*المجموع :* ${booking.totalPrice} درهم
*المدة :* ${booking.durationMinutes} دقيقة
*التاريخ :* ${dateLabel}
*الوقت :* ${booking.time}
${separator.repeat(17)}
في انتظار تأكيدكم، شكراً لكم!`
    : `Bonjour Centre Beauté Loudaya
Nouvelle demande de réservation n° *${ref}* :
${separator.repeat(17)}
*Cliente :* ${booking.clientName}
*Téléphone :* ${booking.phone}
*Prestations :*
${servicesList}${extraLine}
*Total :* ${booking.totalPrice} DH
*Durée :* ${booking.durationMinutes} min
*Date :* ${formatFrDate(booking.date)}
*Heure :* ${booking.time}
${separator.repeat(17)}
Dans l'attente de votre confirmation, merci !`;

  return `https://wa.me/${SALON_WHATSAPP_INTL}?text=${encodeURIComponent(text)}`;
}