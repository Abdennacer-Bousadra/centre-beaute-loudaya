import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  ArrowRight,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { scrollToSection } from '../../utils/scroll';
import heroMobile from '../../assets/hero-mobile.webp';
import heroWide from '../../assets/hero-wide.webp';

export const Hero = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const isArabic = i18n.language === 'ar';
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const handleSectionClick = (event, href, scrollId) => {
    // Même URL : on garde l'URL propre et on scrolle manuellement.
    if (pathname === href) {
      event.preventDefault();
      scrollToSection(scrollId);
    }
  };

  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[80svh] w-full items-center justify-center overflow-hidden bg-plum-950 lg:min-h-[85vh]"
    >
      {/* Full-bleed background: portrait on mobile, landscape from 768px */}
      <picture>
        <source media="(min-width: 768px)" srcSet={heroWide} />
        <img
          src={heroMobile}
          alt="Centre Beauté Loudaya, salon de beauté et spa à Loudaya"
          fetchpriority="high"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
      </picture>

      {/* Plum/prune veil: denser behind the centred copy, lighter at the edges */}
      <div aria-hidden="true" className="hero-veil absolute inset-0 -z-10" />

      <div className="relative z-10 w-full max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col items-center gap-5 sm:gap-6">
          <h1
            className={`hero-title font-black text-white ${
              isArabic ? 'font-arabic' : 'font-serif'
            }`}
          >
            {isArabic ? (
              <>
                أبرزي <span className="hero-gold">جمالكِ الطبيعي</span> ودللي نفسكِ في{' '}
                <span className="whitespace-nowrap hero-gold">عالمكِ الخاص</span>
              </>
            ) : (
              <>
                Révélez Votre <span className="hero-gold">Éclat</span> &amp; Prenez Soin de{' '}
                <span className="whitespace-nowrap hero-gold">Vous</span>
              </>
            )}
          </h1>

          <p className="hero-copy-shadow mx-auto max-w-2xl text-sm font-medium leading-relaxed text-white sm:text-base lg:text-lg">
            {t('hero.subtitle')}
          </p>

          {/* CTAs: side by side on desktop, stacked on mobile */}
          <div className="flex w-full max-w-md flex-col items-stretch justify-center gap-3 pt-2 sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
            <Link
              to="/booking-section"
              onClick={(event) => handleSectionClick(event, '/booking-section', 'booking-section')}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-plum-800 via-plum-700 to-roseGold-600 px-7 py-3.5 text-sm font-bold text-white shadow-luxury transition-all duration-300 hover:-translate-y-0.5 hover:from-plum-900 hover:to-roseGold-700 hover:shadow-luxury-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-plum-900 active:translate-y-0 sm:px-8 sm:py-4 sm:text-base"
            >
              <Calendar className="h-5 w-5 text-gold-300" aria-hidden="true" />
              <span>{t('hero.ctaBook')}</span>
              <ArrowIcon className="h-4 w-4 text-gold-300" aria-hidden="true" />
            </Link>

            <Link
              to="/services-categories"
              onClick={(event) => handleSectionClick(event, '/services-categories', 'services-categories')}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/85 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-plum-900 active:translate-y-0 sm:px-8 sm:py-4 sm:text-base"
            >
              <span>{t('hero.ctaServices')}</span>
            </Link>
          </div>

          {/* Discreet opening-hours chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-medium text-white/75 sm:text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-plum-950/20 px-3 py-1.5 backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5 text-gold-300" aria-hidden="true" />
              {t('nav.openHours')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-plum-950/15 px-3 py-1.5 text-white/65 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-roseGold-300" aria-hidden="true" />
              {t('nav.sundayClosed')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
