import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { salonInfo } from '../../data/salonInfo';

export const FloatingWhatsApp = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isArabic = i18n.language === 'ar';

  const defaultMsg = isArabic
    ? 'السلام عليكم مركز التجميل الوداية، أرغب في الاستفسار وحجز موعد.'
    : 'Bonjour Centre Beauté Loudaya, je souhaite réserver un créneau.';

  const whatsappUrl = `https://wa.me/${salonInfo.whatsappNumber}?text=${encodeURIComponent(defaultMsg)}`;

  return (
    <div className={`fixed bottom-6 ${isArabic ? 'left-6' : 'right-6'} z-40 flex flex-col items-end`}>
      {/* Mini popup card */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 p-4 rounded-2xl bg-white shadow-2xl border border-roseGold-300 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between pb-3 border-b border-roseGold-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-plum-800 to-roseGold-500 flex items-center justify-center text-white shadow">
                <Sparkles className="w-5 h-5 text-gold-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-plum-900">
                  {isArabic ? salonInfo.nameAr : salonInfo.name}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{isArabic ? 'متاحون للرد السريع' : 'En ligne pour vous répondre'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-charcoal-800/60 hover:text-charcoal-900 hover:bg-cream-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-charcoal-800/80 my-3 leading-relaxed">
            {isArabic
              ? 'أهلاً بكِ في مركز التجميل الوداية! تفضلي بمراسلتنا مباشرة على واتساب لأي سؤال أو لحجز موعدكِ الفوري.'
              : 'Bienvenue au Centre Beauté Loudaya ! Discutez directement avec nous sur WhatsApp pour réserver votre soin.'}
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-xs shadow-md transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>{isArabic ? 'ابدئي المحادثة الآن' : 'Démarrer la discussion'}</span>
          </a>
        </div>
      )}

      {/* Main floating button */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white shadow-xl border border-roseGold-200 text-xs font-bold text-plum-900 hover:bg-roseGold-50 transition-all transform hover:-translate-y-0.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{isArabic ? 'حجز فوري عبر واتساب' : 'Réservation WhatsApp'}</span>
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white flex items-center justify-center shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 group focus:outline-none"
          aria-label="Contacter sur WhatsApp"
        >
          <MessageCircle className="w-7 h-7 fill-white/20 group-hover:rotate-12 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};
