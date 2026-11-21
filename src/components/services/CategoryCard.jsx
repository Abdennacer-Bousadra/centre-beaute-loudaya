import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Crown,
  Droplets,
  Footprints,
  Hand,
  HeartHandshake,
  Palette,
  Scissors,
  Sparkles
} from 'lucide-react';
import { categoryImages } from '../../data/categoryImages';

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

export const CategoryCard = ({ category, serviceCount = 0 }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const Icon = categoryIcons[category.id] || Sparkles;
  const image = categoryImages[category.id];
  const name = isArabic ? (category.nameAr || category.nameFr) : category.nameFr;
  const description = isArabic
    ? (category.descriptionAr || category.descriptionFr)
    : category.descriptionFr;

  return (
    <Link
      to={`/services/${category.id}`}
      className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-3xl border border-roseGold-200/80 bg-plum-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold-400 hover:shadow-luxury-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
      aria-label={`${t('services.openCategory')} ${name}`}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          width="800"
          height="600"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-plum-800 via-plum-700 to-roseGold-600" aria-hidden="true" />
      )}

      {/* Readability gradient over the photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-plum-950 via-plum-950/55 to-plum-950/5" aria-hidden="true" />

      <div className="relative z-10 flex flex-col gap-2 p-5 text-white sm:p-6">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-gold-300 backdrop-blur-sm">
          <Icon className="h-4 w-4" />
        </span>

        <h3 className="font-serif text-lg font-bold leading-snug sm:text-xl">
          {name}
        </h3>

        {description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-cream-100/85 sm:text-sm">
            {description}
          </p>
        )}

        <div className="mt-1 flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wider text-gold-300">
          <span>
            {serviceCount} {isArabic ? 'خدمات' : 'soins'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            {t('services.openCategory')}
            <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300" />
          </span>
        </div>
      </div>
    </Link>
  );
};
