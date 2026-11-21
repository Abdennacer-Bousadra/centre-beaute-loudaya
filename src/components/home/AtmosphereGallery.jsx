import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Instagram, Eye } from 'lucide-react';
import { salonAtmosphere, salonInfo } from '../../data/salonInfo';

export const AtmosphereGallery = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <section id="atmosphere" className="py-20 bg-cream-50/50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-roseGold-100 border border-roseGold-300 text-plum-900 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>{t('atmosphere.badge')}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-plum-950">
              {t('atmosphere.title')}
            </h2>

            <p className="text-sm text-charcoal-800/80 leading-relaxed font-light">
              {t('atmosphere.subtitle')}
            </p>
          </div>

          <a
            href={salonInfo.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-roseGold-300 hover:border-plum-800 text-plum-900 font-bold text-xs shadow-sm hover:shadow-md transition-all shrink-0"
          >
            <Instagram className="w-4 h-4 text-pink-600" />
            <span>@{salonInfo.instagramUsername}</span>
          </a>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {salonAtmosphere.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-3xl overflow-hidden shadow-md aspect-[4/3] bg-plum-950"
            >
              <img
                src={item.image}
                alt={isArabic ? item.titleAr : item.titleFr}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum-950/90 via-plum-950/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300"></div>

              {/* Caption Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-1 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-[10px] font-bold text-gold-300 uppercase tracking-widest block">
                  Centre Beauté Loudaya
                </span>
                <h3 className="font-serif text-lg font-bold">
                  {isArabic ? item.titleAr : item.titleFr}
                </h3>
                <p className="text-xs text-cream-200/80 font-light line-clamp-1">
                  {isArabic ? item.subtitleAr : item.subtitleFr}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
