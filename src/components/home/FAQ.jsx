import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { salonFaqs } from '../../data/salonInfo';

export const FAQ = () => {
  const { t, i18n } = useTranslation();
  const [openIdx, setOpenIdx] = useState(0);
  const isArabic = i18n.language === 'ar';

  return (
    <section id="faq" className="py-20 bg-cream-50/70">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100 border border-gold-300 text-plum-900 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-gold-600" />
            <span>{t('faq.badge')}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-plum-950">
            {t('faq.title')}
          </h2>

          <p className="text-sm text-charcoal-800/80 leading-relaxed font-light">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Collapsible Accordion */}
        <div className="space-y-4">
          {salonFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-roseGold-200/90 shadow-sm overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full p-5 text-start flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-plum-950 hover:text-plum-800 transition-colors"
                >
                  <span className="flex-1">
                    {isArabic ? faq.qAr : faq.qFr}
                  </span>
                  <div className={`w-7 h-7 rounded-full bg-roseGold-100 flex items-center justify-center text-plum-900 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-plum-900 text-white' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-charcoal-800/80 leading-relaxed border-t border-roseGold-100/60 animate-in fade-in duration-200">
                    {isArabic ? faq.aAr : faq.aFr}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
