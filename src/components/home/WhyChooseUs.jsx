import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Sparkles, Heart, Users, CheckCircle, Award } from 'lucide-react';

export const WhyChooseUs = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const features = [
    {
      icon: ShieldCheck,
      title: t('whyUs.item1Title'),
      desc: t('whyUs.item1Desc'),
      badge: isArabic ? 'أمان وصحة' : 'Normes Médicales',
      accent: 'from-amber-500 to-gold-500'
    },
    {
      icon: Award,
      title: t('whyUs.item2Title'),
      desc: t('whyUs.item2Desc'),
      badge: isArabic ? 'جودة معتمدة' : 'Marques Certifiées',
      accent: 'from-roseGold-500 to-roseGold-600'
    },
    {
      icon: Heart,
      title: t('whyUs.item3Title'),
      desc: t('whyUs.item3Desc'),
      badge: isArabic ? 'راحة وسكينة' : 'Intimité Féminine',
      accent: 'from-plum-800 to-plum-900'
    },
    {
      icon: Users,
      title: t('whyUs.item4Title'),
      desc: t('whyUs.item4Desc'),
      badge: isArabic ? 'خبرة وبشاشة' : 'Équipe Experte',
      accent: 'from-plum-900 to-roseGold-500'
    }
  ];

  return (
    <section id="why-us" className="py-20 bg-cream-100 relative overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100 border border-gold-300 text-plum-900 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>{t('whyUs.badge')}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-plum-950">
            {t('whyUs.title')}
          </h2>

          <p className="text-sm sm:text-base text-charcoal-800/80 leading-relaxed font-light">
            {t('whyUs.subtitle')}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group bg-white rounded-3xl p-8 border border-roseGold-200/90 hover:border-gold-400 shadow-sm hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.accent} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cream-100 text-plum-900 border border-roseGold-200">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-plum-950 mb-3 group-hover:text-plum-800 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-charcoal-800/70 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-roseGold-100 flex items-center gap-2 text-xs font-bold text-roseGold-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{isArabic ? 'معيار أساسي لدينا' : 'Engagement garanti'}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
