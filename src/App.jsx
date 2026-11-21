import React, { useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ServicesProvider } from './context/ServicesContext';
import { BookingProvider } from './context/BookingContext';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/home/Hero';
import { ServicesMenu } from './components/services/ServicesMenu';
import { ServiceCategoryPage } from './components/services/ServiceCategoryPage';
import { BookingSection } from './components/booking/BookingSection';
import { WhyChooseUs } from './components/home/WhyChooseUs';
import { AtmosphereGallery } from './components/home/AtmosphereGallery';
import { FAQ } from './components/home/FAQ';
import { Footer } from './components/layout/Footer';
import { FloatingWhatsApp } from './components/layout/FloatingWhatsApp';
import { AdminPage } from './components/admin/AdminPage';
import { scrollToSection, scrollToTop } from './utils/scroll';
import { SECTION_ROUTES, HASH_ROUTES } from './utils/sections';

const HomePage = () => {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  // Un seul scroll par changement de route. L'accueil est positionné en haut
  // instantanément au chargement direct ; les sections utilisent un scroll doux.
  // Les anciennes URL avec hash sont converties en URL propres.
  useEffect(() => {
    if (hash) {
      const cleanPath = HASH_ROUTES[hash.replace(/^#/, '')];
      if (cleanPath) {
        navigate(cleanPath, { replace: true });
        return;
      }
    }

    const targetId = SECTION_ROUTES[pathname] || 'hero';
    // Au premier rendu, on reste en haut instantanément pour l'accueil.
    // Pour une URL de section directe (ex: /services-categories), on scrolle
    // doucement vers la section demandée.
    const behavior =
      isFirstRender.current && (targetId === 'hero' || targetId === 'top')
        ? 'instant'
        : 'smooth';
    isFirstRender.current = false;

    if (targetId === 'hero' || targetId === 'top') {
      scrollToTop(behavior);
      return;
    }

    scrollToSection(targetId, { behavior });
  }, [pathname, hash, navigate]);

  return (
    <main className="flex-1">
      <section id="hero" className="scroll-mt-28"><Hero /></section>
      <section id="services" className="scroll-mt-28"><ServicesMenu /></section>
      <section id="booking-section" className="scroll-mt-28"><BookingSection /></section>
      <section id="why-us" className="scroll-mt-28"><WhyChooseUs /></section>
      <section id="atmosphere" className="scroll-mt-28"><AtmosphereGallery /></section>
      <section id="contact" className="scroll-mt-28"><FAQ /></section>
      <Outlet />
    </main>
  );
};

// Public layout with Navbar, Footer, FloatingWhatsApp
const PublicLayout = () => (
  <div className="min-h-screen flex flex-col bg-cream-100 selection:bg-roseGold-400 selection:text-white">
    <Navbar />
    <Outlet />
    <Footer />
    <FloatingWhatsApp />
  </div>
);

// Admin layout - minimal, no navbar/footer/whatsapp
const AdminLayout = () => (
  <div className="min-h-screen bg-cream-100 selection:bg-roseGold-400 selection:text-white">
    <Outlet />
  </div>
);

const MainApp = () => (
  <Routes>
    {/* Public routes with public layout */}
    <Route element={<PublicLayout />}>
      {/* HomePage reste monté entre les sections : pas de remount de la
          réservation (étape, date, créneau et formulaire conservés). */}
      <Route path="/" element={<HomePage />}>
        <Route index />
        {/* URL propres : /services-categories, /booking-section, etc. */}
        <Route path="services-categories" />
        <Route path="booking-section" />
        <Route path="pourquoi-nous" />
        <Route path="ambiance" />
        <Route path="contact" />
        {/* Anciennes URL conservées : redirection vers les URL propres. */}
        <Route path="services" element={<Navigate to="/services-categories" replace />} />
        <Route path="reservation" element={<Navigate to="/booking-section" replace />} />
      </Route>
      <Route path="/services/:slug" element={<ServiceCategoryPage />} />
    </Route>
    {/* Admin routes with minimal layout (no navbar/footer/whatsapp) */}
    <Route element={<AdminLayout />}>
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/*" element={<AdminPage />} />
    </Route>
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <ServicesProvider>
        <BookingProvider>
          <MainApp />
        </BookingProvider>
      </ServicesProvider>
    </AuthProvider>
  );
}
