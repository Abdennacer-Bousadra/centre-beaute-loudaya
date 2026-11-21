import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Sparkles, ArrowRight, ArrowLeft, Check, Plus } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { formatServicePrice } from '../../data/servicesData';

export const ServiceCard = ({ service, onSelectService }) => {
  const { t, i18n } = useTranslation();
  const { selectedServices } = useBooking();
  const isArabic = i18n.language === 'ar';
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const isSelected = selectedServices.some((s) => s.id === service.id);

  return (
    <div className={`group relative bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
      isSelected 
        ? 'border-plum-800 shadow-md ring-2 ring-roseGold-300' 
        : 'border-roseGold-200/80 hover:border-gold-400 shadow-sm hover:shadow-luxury-hover'
    }`}>
      
      {/* Top Tag or Popular Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {service.badge ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-plum-800 to-roseGold-600 text-white shadow-sm">
            <Sparkles className="w-3 h-3 text-gold-300" />
            {service.badge}
          </span>
        ) : service.popular ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold-100 text-plum-900 border border-gold-300">
            ★ Populaire
          </span>
        ) : (
          <span className="text-[11px] text-roseGold-600 font-semibold uppercase tracking-wider">
            {isArabic ? 'خدمة متميزة' : 'Soin Prestige'}
          </span>
        )}

        {service.duration && (
          <span className="inline-flex items-center gap-1 text-xs text-charcoal-800/60 font-medium">
            <Clock className="w-3.5 h-3.5 text-roseGold-500" />
            {service.duration}
          </span>
        )}
      </div>

      {/* Title & Description */}
      <div className="space-y-2 mb-4">
        <h3 className="font-serif text-lg font-bold text-plum-950 group-hover:text-plum-800 transition-colors">
          {isArabic ? (service.nameAr || service.nameFr) : service.nameFr}
        </h3>
        <p className="text-xs text-charcoal-800/70 leading-relaxed min-h-[36px]">
          {isArabic ? (service.descriptionAr || service.descriptionFr) : service.descriptionFr}
        </p>
      </div>

      {/* Pricing & Booking CTA */}
      <div className="pt-4 border-t border-roseGold-100 flex items-center justify-between gap-3 mt-auto">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-xl font-black text-plum-900">
              {formatServicePrice(service, i18n.language)}
            </span>
          </div>
          <span className="text-[10px] text-charcoal-800/60 block">
            {isArabic ? 'شامل التعقيم والعناية' : 'Soin & stérilisation inclus'}
          </span>
        </div>

        <button
          onClick={() => onSelectService(service)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all duration-300 shadow-sm active:scale-95 ${
            isSelected
              ? 'bg-plum-900 text-white hover:bg-plum-950 shadow-md ring-2 ring-gold-400'
              : 'bg-roseGold-100 hover:bg-gradient-to-r hover:from-plum-800 hover:to-roseGold-600 text-plum-900 hover:text-white'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="w-3.5 h-3.5 text-gold-300 stroke-[3]" />
              <span>{isArabic ? 'تمت الإضافة ✓' : 'Sélectionné ✓'}</span>
            </>
          ) : (
            <>
              <span>{t('services.bookThisService')}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
