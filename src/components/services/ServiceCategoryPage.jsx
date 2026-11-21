import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Crown,
  Droplets,
  Footprints,
  Hand,
  HeartHandshake,
  Palette,
  Scissors,
  Sparkles
} from 'lucide-react';
import { useServices } from '../../context/ServicesContext';
import { useBooking } from '../../context/BookingContext';
import { initialCategories, initialServices } from '../../data/servicesData';
import { ServiceCard } from '../services/ServiceCard';

const categoryIcons = {
  coiffure: Scissors,
  manucure: Hand,
  pedicure: Footprints,
  epilation: Sparkles,
  'soin-visage': Droplets,
  maquillage: Palette,
  massage: HeartHandshake,
  'packs-mariee': Crown
};

export const ServiceCategoryPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const { categories, services, loading } = useServices();
  const { selectServiceForBooking } = useBooking();
  const isArabic = i18n.language === 'ar';
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const BackIcon = isArabic ? ArrowRight : ArrowLeft;

  const remoteCategory = categories.find(
    (item) => item.id === slug || item.slug === slug
  );
  const localCategory = initialCategories.find(
    (item) => item.id === slug || item.slug === slug
  );
  const category = remoteCategory || localCategory;

  const categoryServices = useMemo(() => {
    if (!category) return [];
    const source = remoteCategory ? services : initialServices;
    return source.filter(
      (service) =>
        service.categoryId === category.id && service.active !== false
    );
  }, [services, remoteCategory, category]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  const name = category
    ? (isArabic ? (category.nameAr || category.nameFr) : category.nameFr)
    : '';
  const description = category
    ? (isArabic
        ? (category.descriptionAr || category.descriptionFr)
        : category.descriptionFr)
    : '';
  const Icon = categoryIcons[category?.id] || Sparkles;

  if (loading && !categories.length) {
    return (
      <main className="flex-1 py-24">
        <div className="mx-auto max-w-xl px-4 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-roseGold-200 border-t-plum-800" />
          <p className="text-sm text-charcoal-800/70">{t('services.loading')}</p>
        </div>
      </main>
    );
  }

  if (!category) {
    return (
      <main className="flex-1 py-24">
        <div className="mx-auto max-w-xl px-4 text-center">
          <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-roseGold-100 text-plum-800">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-plum-950">
            {t('services.categoryNotFound')}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-charcoal-800/70">
            {t('services.categoryNotFoundDesc')}
          </p>
          <Link
            to="/services-categories"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-plum-800 to-roseGold-600 px-5 py-2.5 text-sm font-bold text-white shadow-md"
          >
            <BackIcon className="h-4 w-4" />
            {t('services.backToServices')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      {/* Image-free category header, as requested for the detail pages */}
      <section className="relative overflow-hidden bg-gradient-to-br from-plum-950 via-plum-900 to-roseGold-800 py-14 text-white sm:py-16">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-gold-400/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-roseGold-400/15 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/services-categories"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cream-100/80 transition-colors hover:text-gold-300"
          >
            <BackIcon className="h-4 w-4" />
            {t('services.backToServices')}
          </Link>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-gold-300 backdrop-blur-sm">
                <Icon className="h-6 w-6" />
              </div>
              <h1 className="font-serif text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                {name}
              </h1>
              {description && (
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream-100/85 sm:text-base">
                  {description}
                </p>
              )}
            </div>

            <Link
              to="/booking-section"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-bold text-plum-950 shadow-md transition-transform hover:-translate-y-0.5"
            >
              <Calendar className="h-4 w-4" />
              {t('nav.bookNow')}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-cream-50/60 py-14 sm:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-serif text-2xl font-extrabold text-plum-950 sm:text-3xl">
              {t('services.categoryServicesTitle')}
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-roseGold-600">
              {categoryServices.length} {isArabic ? 'خدمات' : 'soins'}
            </span>
          </div>

          {categoryServices.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categoryServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelectService={selectServiceForBooking}
                />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-3xl border border-roseGold-200 bg-white p-8 text-center">
              <Sparkles className="mx-auto mb-3 h-8 w-8 text-roseGold-400" />
              <p className="text-sm font-bold text-plum-900">
                {isArabic ? 'لا توجد خدمات متاحة حالياً' : 'Aucune prestation disponible pour le moment'}
              </p>
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Link
              to="/services-categories"
              className="inline-flex items-center gap-2 rounded-full border border-roseGold-300 bg-white px-5 py-2.5 text-sm font-bold text-plum-900 transition-colors hover:bg-roseGold-100"
            >
              {t('services.viewAllCategories')}
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
