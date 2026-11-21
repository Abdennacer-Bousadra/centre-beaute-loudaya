import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Sparkles, Quote, CheckCircle2 } from 'lucide-react';
import { clientReviews } from '../../data/salonInfo';

export const Testimonials = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <section id="reviews" className="py-20 bg-cream-100">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-roseGold-100 border border-roseGold-300 text-plum-900 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>{t('reviews.badge')}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-plum-950">
            {t('reviews.title')}
          </h2>

          <p className="text-sm text-charcoal-800/80 leading-relaxed font-light">
            {t('reviews.subtitle')}
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clientReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 border border-roseGold-200/80 shadow-sm hover:shadow-luxury transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Rating stars & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-roseGold-300/60" />
                </div>

                <p className="text-xs sm:text-sm text-charcoal-900/80 italic leading-relaxed mb-6 font-light">
                  "{isArabic ? rev.textAr : rev.textFr}"
                </p>
              </div>

              {/* Reviewer Info */}
              <div className="pt-4 border-t border-roseGold-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-plum-950">
                    {rev.name}
                  </h4>
                  <p className="text-[11px] text-roseGold-600 font-medium">
                    {rev.city}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Avis vérifié</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
