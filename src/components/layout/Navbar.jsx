import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  Globe, 
  Menu, 
  X, 
  Calendar,
  Clock
} from 'lucide-react';
import { salonInfo } from '../../data/salonInfo';
import { scrollToSection, scrollToTop } from '../../utils/scroll';
import { NAV_SECTIONS, SECTION_ROUTES } from '../../utils/sections';
import logoImg from '../../assets/Logo_CentreBeauteLoudaya.jpg';

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('hero');

  const currentLang = i18n.language || 'fr';
  const isArabic = currentLang === 'ar';
  const isHomeRoute = Boolean(SECTION_ROUTES[pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Met en évidence la section actuellement visible sur la page d'accueil.
  useEffect(() => {
    if (!isHomeRoute) return undefined;

    const updateActiveSection = () => {
      const offset = 160;
      let current = 'hero';

      NAV_SECTIONS.forEach((id) => {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= offset) {
          current = id;
        }
      });

      // En bas de page, le footer/contact est la section active.
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8
      ) {
        current = 'contact';
      }

      setActiveSectionId((previous) => (previous === current ? previous : current));
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [pathname, isHomeRoute]);

  const toggleLanguage = () => {
    const nextLang = currentLang === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(nextLang);
  };

  const handleSectionLink = (event, href, scrollId) => {
    setMobileMenuOpen(false);

    // Même URL : le routeur ne rescrolle pas, on le fait manuellement.
    if (pathname === href) {
      event.preventDefault();
      if (scrollId === 'hero') {
        scrollToTop();
      } else {
        scrollToSection(scrollId);
      }
    }
  };

  const isLinkActive = (link) => {
    if (isHomeRoute) return link.scrollId === activeSectionId;

    // Les pages catégories (/services/massage, ...) gardent "Services" actif.
    if (link.scrollId === 'services-categories') {
      return pathname === '/services' || pathname.startsWith('/services/');
    }

    return pathname === link.href;
  };

  const navLinks = [
    { label: t('nav.home'), href: '/', scrollId: 'hero' },
    { label: t('nav.services'), href: '/services-categories', scrollId: 'services-categories' },
    { label: t('nav.booking'), href: '/booking-section', scrollId: 'booking-section' },
    { label: t('nav.experience'), href: '/pourquoi-nous', scrollId: 'why-us' },
    { label: t('atmosphere.badge'), href: '/ambiance', scrollId: 'atmosphere' },
    { label: t('nav.contact'), href: '/contact', scrollId: 'contact' },
  ];

  return (
    <>
      {/* Top Banner Notice (Working Hours & Sunday Closed notice) */}
      <div className="bg-gradient-to-r from-plum-900 via-plum-800 to-plum-900 text-cream-100 text-xs py-2 px-4 shadow-sm border-b border-roseGold-400/20">
        <div className="w-full flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-medium text-gold-400">
              <Clock className="w-3.5 h-3.5 text-gold-400 animate-pulseSlow" />
              {t('nav.openHours')}
            </span>
            <span className="hidden sm:inline text-roseGold-300">•</span>
            <span className="inline-flex items-center gap-1 text-roseGold-200 bg-plum-950/60 px-2 py-0.5 rounded-full border border-roseGold-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              {t('nav.sundayClosed')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-cream-100/95 backdrop-blur-md shadow-luxury py-3 border-b border-roseGold-200'
            : 'bg-cream-100/80 backdrop-blur-sm py-4'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1 lg:flex-none">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-white shadow-md ring-2 ring-gold-400/50 group-hover:ring-gold-400 group-hover:shadow-lg transition-all duration-300 shrink-0">
                <img
                  src={logoImg}
                  alt="Centre Beauté Loudaya - مركز التجميل الوداية"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  width="112"
                  height="112"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif text-base sm:text-xl font-bold tracking-tight text-plum-900 leading-tight truncate group-hover:text-roseGold-600 transition-colors">
                  {isArabic ? salonInfo.nameAr : salonInfo.name}
                </span>
                <span className="text-[10px] sm:text-xs text-roseGold-600 font-medium tracking-wide truncate">
                  {isArabic ? 'صالون التجميل والسبا الفاخر' : 'Salon & Spa de Luxe'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link, idx) => {
                const active = isLinkActive(link);
                return (
                  <Link
                    key={idx}
                    to={link.href}
                    onClick={(event) => handleSectionLink(event, link.href, link.scrollId)}
                    aria-current={active ? 'page' : undefined}
                    className={`text-sm font-semibold transition-all duration-200 py-1 border-b-2 ${
                      active
                        ? 'text-plum-900 border-roseGold-500'
                        : 'text-charcoal-900/80 border-transparent hover:text-plum-800 hover:border-roseGold-500'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions: Lang Switcher, WhatsApp CTA, Admin */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-roseGold-300 text-plum-900 hover:bg-roseGold-100 text-xs font-bold transition-all shadow-sm active:scale-95"
                title={isArabic ? 'Changer en Français' : 'تغيير إلى العربية'}
              >
                <Globe className="w-3.5 h-3.5 text-roseGold-600" />
                <span>{isArabic ? 'FR' : 'العربية'}</span>
              </button>

              {/* WhatsApp Quick CTA */}
              <a
                href={`https://wa.me/${salonInfo.whatsappNumber}?text=${encodeURIComponent(
                  isArabic 
                    ? 'السلام عليكم، أرغب في حجز موعد في مركز التجميل الوداية.' 
                    : 'Bonjour, je souhaite réserver un rendez-vous au Centre Beauté Loudaya.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>WhatsApp</span>
              </a>

              {/* Book Button */}
              <Link
                to="/booking-section"
                onClick={(event) => handleSectionLink(event, '/booking-section', 'booking-section')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-plum-800 to-roseGold-600 hover:from-plum-900 hover:to-roseGold-700 text-white text-xs font-bold shadow-md hover:shadow-rose-glow transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Calendar className="w-3.5 h-3.5 text-gold-300" />
                <span>{t('nav.bookNow')}</span>
              </Link>

              {/* Admin Button - hidden from UI; accessible via direct URL /admin */}
            </div>

            {/* Mobile Menu & Language Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 lg:hidden">
              <button
                onClick={toggleLanguage}
                className="shrink-0 whitespace-nowrap ms-1 px-2.5 py-1 rounded-full border border-roseGold-300 text-plum-900 text-xs font-bold"
              >
                {isArabic ? 'FR' : 'العربية'}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-plum-900 hover:bg-roseGold-100 focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-roseGold-200 bg-cream-100 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link, idx) => {
                const active = isLinkActive(link);
                return (
                  <Link
                    key={idx}
                    to={link.href}
                    onClick={(event) => handleSectionLink(event, link.href, link.scrollId)}
                    aria-current={active ? 'page' : undefined}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-roseGold-100 text-plum-900'
                        : 'text-charcoal-900 hover:bg-roseGold-100 hover:text-plum-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-roseGold-200/60 flex flex-col gap-2">
                <Link
                  to="/booking-section"
                  onClick={(event) => handleSectionLink(event, '/booking-section', 'booking-section')}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-gradient-to-r from-plum-800 to-roseGold-600 text-white font-bold text-sm shadow-md"
                >
                  <Calendar className="w-4 h-4 text-gold-300" />
                  <span>{t('nav.bookNow')}</span>
                </Link>

                <a
                  href={`https://wa.me/${salonInfo.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-emerald-600 text-white font-bold text-sm shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp ({salonInfo.phone})</span>
                </a>


              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
