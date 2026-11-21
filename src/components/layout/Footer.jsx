import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { 
  Phone, 
  Instagram, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Heart,
  ChevronRight
} from 'lucide-react';
import { salonInfo } from '../../data/salonInfo';
import { scrollToSection } from '../../utils/scroll';
import logoImg from '../../assets/Logo_CentreBeauteLoudaya.jpg';

const footerCategoryIds = [
  'coiffure',
  'manucure',
  'pedicure',
  'epilation',
  'soin-visage',
  'maquillage',
  'massage',
  'packs-mariee'
];

export const Footer = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const isArabic = i18n.language === 'ar';

  const handleCategoriesClick = (event) => {
    if (pathname === '/services-categories') {
      event.preventDefault();
      scrollToSection('services-categories');
    }
  };

  return (
    <footer id="contact" className="bg-gradient-to-b from-plum-950 via-plum-900 to-plum-950 text-cream-100 pt-16 pb-8 border-t-2 border-gold-500/40 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-roseGold-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow-md ring-2 ring-gold-400/60 hover:ring-gold-300 hover:shadow-gold-glow transition-all duration-300 shrink-0">
                <img
                  src={logoImg}
                  alt="Centre Beauté Loudaya - مركز التجميل الوداية"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                  width="112"
                  height="112"
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-white tracking-wide">
                  {isArabic ? salonInfo.nameAr : salonInfo.name}
                </h3>
                <p className="text-xs text-gold-300 font-medium tracking-wider">
                  {isArabic ? 'مركز العناية والتجميل النسائي' : 'Institut de Beauté Féminin'}
                </p>
              </div>
            </div>

            <p className="text-sm text-cream-200/80 leading-relaxed font-light">
              {t('brand.description')}
            </p>



            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={salonInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-plum-800/80 border border-roseGold-400/40 flex items-center justify-center text-roseGold-300 hover:text-white hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-500 hover:border-transparent transition-all duration-300 transform hover:-translate-y-1"
                aria-label="Instagram Centre Beauté Loudaya"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a
                href={`https://wa.me/${salonInfo.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-plum-800/80 border border-emerald-400/40 flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-600 hover:border-transparent transition-all duration-300 transform hover:-translate-y-1"
                aria-label="WhatsApp Centre Beauté Loudaya"
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              <a
                href={`tel:${salonInfo.phone}`}
                className="w-10 h-10 rounded-full bg-plum-800/80 border border-gold-400/40 flex items-center justify-center text-gold-300 hover:text-white hover:bg-gold-500 hover:border-transparent transition-all duration-300 transform hover:-translate-y-1"
                aria-label="Appeler le Centre Beauté Loudaya"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Col 2: Services Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-400"></span>
              {t('services.title')}
            </h4>
            <ul className="space-y-2.5 text-sm text-cream-200/80">
              {footerCategoryIds.map((categoryId) => (
                <li key={categoryId}>
                  <Link to="/services-categories" onClick={handleCategoriesClick} className="hover:text-gold-300 transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-roseGold-400" />
                    {t(`services.categories.${categoryId}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Working Hours & Location */}
          <div>
            <h4 className="font-serif text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-400"></span>
              {t('contact.hoursTitle')}
            </h4>
            <div className="space-y-3 text-sm">
              <div className="bg-plum-900/60 border border-roseGold-400/20 rounded-xl p-3.5">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-5 h-5 text-gold-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">
                      {isArabic ? salonInfo.workingHours.daysAr : salonInfo.workingHours.daysFr}
                    </p>
                    <p className="text-gold-300 font-mono text-xs mt-0.5">
                      {isArabic ? salonInfo.workingHours.timeAr : salonInfo.workingHours.timeFr}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sunday closed emphasis */}
              <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                  <span>{isArabic ? salonInfo.workingHours.sundayAr : salonInfo.workingHours.sundayFr}</span>
                </div>
                <p className="text-[11px] text-cream-200/70 mt-1">
                  {isArabic ? 'الراحة الأسبوعية لفريق العمل للتجدد والتألق' : 'Jour de repos hebdomadaire de l\'équipe'}
                </p>
              </div>

              <div className="flex items-start gap-2 text-cream-200/80 text-xs pt-1">
                <MapPin className="w-4 h-4 text-roseGold-400 shrink-0 mt-0.5" />
                <span>{isArabic ? salonInfo.addressAr : salonInfo.addressFr}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Direct WhatsApp Booking */}
          <div>
            <h4 className="font-serif text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-400"></span>
              {t('contact.phoneTitle')}
            </h4>
            <div className="space-y-3">
              <a
                href={`tel:${salonInfo.phone}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-plum-800/50 hover:bg-plum-800 border border-gold-400/30 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-cream-200/70">{t('contact.btnCall')}</p>
                  <p className="font-mono font-bold text-white text-base tracking-wider" dir="ltr" style={{ unicodeBidi: 'embed', direction: 'ltr' }}>{salonInfo.phone}</p>
                </div>
              </a>

              <a
                href={`https://wa.me/${salonInfo.whatsappNumber}?text=${encodeURIComponent(
                  isArabic ? 'السلام عليكم مركز التجميل الوداية' : 'Bonjour Centre Beauté Loudaya'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-emerald-300">{t('contact.btnWhatsApp')}</p>
                  <p className="font-mono font-bold text-white text-sm" dir="ltr" style={{ unicodeBidi: 'embed', direction: 'ltr' }}>{salonInfo.whatsappNumber}</p>
                </div>
              </a>

              <a
                href={salonInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-roseGold-400/30 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-roseGold-500/20 flex items-center justify-center text-roseGold-300 group-hover:scale-110 transition-transform">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-roseGold-300">Instagram</p>
                  <p className="font-medium text-white text-xs">@{salonInfo.instagramUsername}</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Admin Portal */}
        <div className="pt-8 mt-8 border-t border-roseGold-400/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-200/60">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} {isArabic ? salonInfo.nameAr : salonInfo.name}.</span>
            <span>{t('footer.rights')}</span>
          </div>

          <div className="flex items-center gap-1.5 text-roseGold-300 font-medium">
            <span>{t('footer.heartText')}</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          </div>
        </div>
      </div>
    </footer>
  );
};
