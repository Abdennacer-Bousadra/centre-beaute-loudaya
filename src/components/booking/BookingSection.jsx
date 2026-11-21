import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  MessageCircle, 
  ArrowRight, 
  ArrowLeft, 
  ShieldAlert, 
  Check, 
  X, 
  Trash2, 
  ShoppingBag,
  Lock,
  AlertTriangle,
  Info,
  CalendarCheck2,
  Loader2
} from 'lucide-react';
import { useServices } from '../../context/ServicesContext';
import { useBooking } from '../../context/BookingContext';
import { salonInfo } from '../../data/salonInfo';
import { formatServicePrice, getServiceMinPrice } from '../../data/servicesData';
import { scrollToElement } from '../../utils/scroll';

export const BookingSection = () => {
  const { t, i18n } = useTranslation();
  const { categories, services } = useServices();
  const { 
    selectedServices, 
    toggleServiceForBooking, 
    removeServiceForBooking, 
    clearSelectedServices, 
    bookings,
    addBooking 
  } = useBooking();

  const isArabic = i18n.language === 'ar';
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  // Step 1 (Services) -> Step 2 (Date & Time) -> Step 3 (Client Infos) -> Step 4 (WhatsApp Confirmation)
  const [currentStep, setCurrentStep] = useState(1);

  // Category navigation in Step 1
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories[0]?.id || 'coiffure'
  );

  // Date & Time
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeSlotNotice, setTimeSlotNotice] = useState('');

  // Client Details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Finished booking ref
  const [submittedBooking, setSubmittedBooking] = useState(null);

  // Scroll targets (carte, confirmation, erreur) : évite les remontées parasites
  const cardRef = useRef(null);
  const successRef = useRef(null);
  const submitErrorRef = useRef(null);
  const previousStepRef = useRef(1);
  const isFirstRenderRef = useRef(true);

  // Helper: Convert "HH:MM" string to total minutes from midnight
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Helper: Convert minutes from midnight to "HH:MM"
  const minutesToTime = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Helper: Extract minutes from a service duration string like "60 min", "45 min"
  const getServiceDurationMinutes = (service) => {
    if (!service || !service.duration) return 30;
    const match = service.duration.match(/\d+/);
    return match ? parseInt(match[0], 10) : 30;
  };

  // Total Duration in raw minutes for all selected services
  const totalDurationMinutes = useMemo(() => {
    if (!selectedServices || selectedServices.length === 0) return 30;
    const sum = selectedServices.reduce(
      (acc, s) => acc + getServiceDurationMinutes(s),
      0
    );
    return Math.max(sum, 15); // Minimum 15 min
  }, [selectedServices]);

  // Formatted duration string for display (e.g. "1h 30min" or "45 min")
  const formattedDuration = useMemo(() => {
    const hours = Math.floor(totalDurationMinutes / 60);
    const mins = totalDurationMinutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins} min`;
  }, [totalDurationMinutes]);

  // Today min date string (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Filter services by category
  const categoryServices = useMemo(() => {
    return services.filter(
      (s) => s.categoryId === selectedCategoryId && s.active === true
    );
  }, [services, selectedCategoryId]);

  // Total Price calculation (minimum price for ranges / "from" prices)
  const servicesTotal = useMemo(() => {
    return selectedServices.reduce((acc, curr) => acc + getServiceMinPrice(curr), 0);
  }, [selectedServices]);

  const grandTotal = servicesTotal;

  const hasIndicativePrice = useMemo(() => {
    return selectedServices.some(
      (s) => Number(s.priceMax) > Number(s.price)
    );
  }, [selectedServices]);

  // Generate the next 14 upcoming days for quick & user-friendly selection
  const upcomingDays = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayOfWeek = d.getDay(); // 0 is Sunday
      const isSunday = dayOfWeek === 0;
      const isToday = i === 0;
      const isTomorrow = i === 1;

      list.push({
        date: d,
        dateString,
        dayOfWeek,
        dayOfMonth: d.getDate(),
        isSunday,
        isToday,
        isTomorrow,
        monthNameFr: d.toLocaleDateString('fr-FR', { month: 'short' }),
        monthNameAr: d.toLocaleDateString('ar-MA', { month: 'short' }),
        dayNameFr: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNameAr: d.toLocaleDateString('ar-MA', { weekday: 'short' })
      });
    }
    return list;
  }, []);

  // Pre-select first valid open day if no date is set
  useEffect(() => {
    if (!appointmentDate) {
      const firstOpenDay = upcomingDays.find((day) => !day.isSunday);
      if (firstOpenDay) {
        setAppointmentDate(firstOpenDay.dateString);
      }
    }
  }, [upcomingDays, appointmentDate]);

  // Handle Date Selection with Sunday and Past Date validation
  const handleSelectDate = (dateVal) => {
    setDateError('');
    if (!dateVal) {
      setAppointmentDate('');
      return;
    }

    if (dateVal < todayStr) {
      setDateError(
        isArabic
          ? '⚠️ لا يمكن اختيار تاريخ مضى. يرجى اختيار تاريخ حالي أو مستقبلي.'
          : '⚠️ Impossible de sélectionner une date passée.'
      );
      return;
    }

    const dateObj = new Date(dateVal + 'T00:00:00');
    if (dateObj.getDay() === 0) {
      setDateError(
        isArabic
          ? '⚠️ نعتذر، المركز مغلق كل يوم أحد للراحة الأسبوعية. يرجى اختيار موعد من الإثنين إلى السبت.'
          : '⚠️ Le centre est fermé le dimanche pour le repos hebdomadaire. Veuillez choisir du lundi au samedi.'
      );
      return;
    }

    setAppointmentDate(dateVal);
  };

  // Base Time Slots (from 10:00 to 19:30 every 30 minutes)
  const baseTimeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 10; hour < 20; hour++) {
      const hStr = hour < 10 ? `0${hour}` : `${hour}`;
      slots.push(`${hStr}:00`);
      if (hour < 19) {
        slots.push(`${hStr}:30`);
      }
    }
    return slots;
  }, []);

  // Salon closing time in minutes (20:00 = 1200 minutes)
  const SALON_CLOSING_MINUTES = 20 * 60; // 20:00 (1200)

  // Find all existing bookings for the selected date to prevent double-booking
  const existingBookingsOnDate = useMemo(() => {
    if (!appointmentDate || !bookings) return [];

    return bookings
      .filter((b) => b.date === appointmentDate && b.status !== 'cancelled')
      .map((b) => {
        const startMin = timeToMinutes(b.time);
        let durMin = 45;

        if (b.services && b.services.length > 0) {
          durMin = b.services.reduce(
            (sum, s) => sum + getServiceDurationMinutes(s),
            0
          );
        } else if (b.estimatedDuration) {
          const match = b.estimatedDuration.match(/\d+/);
          if (match) durMin = parseInt(match[0], 10);
        }

        return {
          id: b.id,
          clientName: b.clientName,
          time: b.time,
          startMin,
          endMin: startMin + durMin
        };
      });
  }, [bookings, appointmentDate]);

  // Compute availability and status for every slot dynamically
  const evaluatedSlots = useMemo(() => {
    if (!appointmentDate) return [];

    const now = new Date();
    const isToday = appointmentDate === todayStr;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return baseTimeSlots.map((slotTime) => {
      const slotStartMin = timeToMinutes(slotTime);
      const slotEndMin = slotStartMin + totalDurationMinutes;
      const formattedEndTime = minutesToTime(slotEndMin);

      // Check 1: Exceeds Closing Time (20:00)
      if (slotEndMin > SALON_CLOSING_MINUTES) {
        return {
          time: slotTime,
          endTime: formattedEndTime,
          isAvailable: false,
          reasonCode: 'exceeds_closing',
          reasonFr: `Fin à ${formattedEndTime} (Dépasse 20h00)`,
          reasonAr: `ينتهي في ${formattedEndTime} (يتجاوز 20:00)`
        };
      }

      // Check 2: Past slot (if date is today, slot must be at least 15 min in future)
      if (isToday && slotStartMin <= currentMinutes + 15) {
        return {
          time: slotTime,
          endTime: formattedEndTime,
          isAvailable: false,
          reasonCode: 'past',
          reasonFr: 'Créneau passé',
          reasonAr: 'وقت مضى'
        };
      }

      // Check 3: Collides with an existing booking on this date (Prevent Double Booking)
      const collision = existingBookingsOnDate.find((existing) => {
        // Two intervals [A_start, A_end) and [B_start, B_end) overlap if:
        // max(A_start, B_start) < min(A_end, B_end)
        return (
          Math.max(slotStartMin, existing.startMin) <
          Math.min(slotEndMin, existing.endMin)
        );
      });

      if (collision) {
        return {
          time: slotTime,
          endTime: formattedEndTime,
          isAvailable: false,
          reasonCode: 'booked',
          reasonFr: 'Déjà réservé',
          reasonAr: 'محجوز مسبقاً'
        };
      }

      // Slot is 100% available!
      return {
        time: slotTime,
        endTime: formattedEndTime,
        isAvailable: true,
        reasonCode: 'available',
        reasonFr: `Disponible jusqu'à ${formattedEndTime}`,
        reasonAr: `متاح حتى ${formattedEndTime}`
      };
    });
  }, [
    appointmentDate,
    todayStr,
    baseTimeSlots,
    totalDurationMinutes,
    SALON_CLOSING_MINUTES,
    existingBookingsOnDate
  ]);

  // If currently selected appointmentTime is now unavailable (e.g. user changed date or added services), clear it
  useEffect(() => {
    if (appointmentTime) {
      const currentSlotObj = evaluatedSlots.find((s) => s.time === appointmentTime);
      if (!currentSlotObj || !currentSlotObj.isAvailable) {
        setAppointmentTime('');
        setTimeSlotNotice(
          isArabic
            ? '⚠️ تم تحديث الأوقات المتاحة بما يتوافق مع مدة الخدمات وتوقيت الإغلاق. يرجى اختيار موعد متاح.'
            : '⚠️ Les créneaux ont été recalculés selon la durée totale. Veuillez choisir un horaire disponible.'
        );
      } else {
        setTimeSlotNotice('');
      }
    }
  }, [evaluatedSlots, appointmentTime, isArabic]);

  // Step 1 Validation
  const handleStep1Next = () => {
    if (selectedServices.length === 0) {
      alert(
        isArabic
          ? 'يرجى اختيار خدمة واحدة على الأقل للمتابعة.'
          : 'Veuillez sélectionner au moins un soin pour continuer.'
      );
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 Validation
  const handleStep2Next = () => {
    if (!appointmentDate) {
      setDateError(
        isArabic ? 'يرجى اختيار تاريخ الموعد' : 'Veuillez sélectionner une date'
      );
      return;
    }
    if (!appointmentTime) {
      alert(
        isArabic ? 'يرجى اختيار توقيت متاح للموعد' : 'Veuillez choisir un créneau horaire disponible'
      );
      return;
    }
    setCurrentStep(3);
  };

  // Step 3 Validation & Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Un seul scroll par changement d'étape : on recale la carte sous le header.
  // Aucun scroll au premier rendu (la navigation gère déjà l'arrivée sur la section).
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousStepRef.current = currentStep;
      return;
    }

    if (previousStepRef.current === currentStep) return;
    previousStepRef.current = currentStep;

    if (currentStep === 4) {
      scrollToElement(successRef.current, { block: 'center' });
    } else {
      scrollToElement(cardRef.current);
    }
  }, [currentStep]);

  // En cas d'échec de réservation, amener l'erreur dans le viewport.
  useEffect(() => {
    if (!submitError) return;
    scrollToElement(submitErrorRef.current, { block: 'center' });
  }, [submitError]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    const errors = {};

    const cleanName = (clientName || '').replace(/[<>]/g, '').trim();
    const cleanPhone = (clientPhone || '').replace(/\s+/g, '').trim();
    const cleanNotes = (clientNotes || '').replace(/[<>]/g, '').trim();

    if (!cleanName || cleanName.length < 3) {
      errors.name = isArabic
        ? 'يرجى إدخال اسم صحيح (3 أحرف على الأقل)'
        : 'Veuillez saisir un nom valide (min 3 caractères)';
    }

    const phoneRegex = /^(?:(?:\+|00)212|0)[67]\d{8}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      errors.phone = isArabic
        ? 'يرجى إدخال رقم هاتف مغربي صالح (مثال: 0666923910)'
        : 'Numéro marocain invalide (ex: 0666923910 ou 07...)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setSubmitError('');
    setSubmitting(true);

    const selectedSlotObj = evaluatedSlots.find((s) => s.time === appointmentTime);
    const endTimeStr = selectedSlotObj ? selectedSlotObj.endTime : '';

    const serviceIds = selectedServices.map((s) => s.id);

    const bookingPayload = {
      clientName: cleanName,
      phone: cleanPhone,
      serviceIds,
      date: appointmentDate,
      time: appointmentTime,
      notes: cleanNotes,
      lang: isArabic ? 'ar' : 'fr'
    };

    try {
      const data = await addBooking(bookingPayload);
      setSubmittedBooking(data);
      setCurrentStep(4);

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#E8A0BF', '#581845', '#E5C158']
        });
      } catch {
        // safe fallback
      }

      if (data.whatsappLink) {
        window.open(data.whatsappLink, '_blank');
      }
    } catch (err) {
      const msg = err.message || (isArabic ? 'فشل الحجز. يرجى المحاولة مرة أخرى.' : 'Échec de la réservation. Veuillez réessayer.');
      setSubmitError(msg);
      console.error('[BookingSection] Booking failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp formatted string generator
  const triggerWhatsAppRedirect = (booking) => {
    const items = booking.items || booking.services || [];
    const servicesListFr = items.length > 0
      ? items.map((s, idx) => `  ${idx + 1}. *${s.nameFr}* — ${formatServicePrice(s, 'fr')}`).join('\n')
      : `  • *${booking.serviceNameFr || booking.service?.nameFr}* — ${formatServicePrice({ price: booking.totalPrice || booking.price }, 'fr')}`;

    const servicesListAr = items.length > 0
      ? items.map((s, idx) => `  ${idx + 1}. *${s.nameAr || s.nameFr}* — ${formatServicePrice(s, 'ar')}`).join('\n')
      : `  • *${booking.serviceNameAr || booking.service?.nameAr || booking.service?.nameFr}* — ${formatServicePrice({ price: booking.totalPrice || booking.price }, 'ar')}`;

    const clock = '\u{23F1}';
    const memo = '\u{1F4DD}';
    const flower = '\u{1F338}';
    const separator = '\u{2501}';
    const heart = '\u{1F495}';

    const durationStr = booking.estimatedDuration || booking.durationMinutes ? `\n${clock} *Dur\u00E9e Estim\u00E9e :* ~${booking.estimatedDuration || booking.durationMinutes} min (${booking.time} \u2192 ${booking.endTime || 'Fin de s\u00E9ance'})` : '';
    const durationStrAr = booking.estimatedDuration || booking.durationMinutes ? `\n${clock} *\u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0631\u064A\u0629 :* \u062D\u0648\u0627\u0644\u064A ${booking.estimatedDuration || booking.durationMinutes} \u062F\u0642\u064A\u0642\u0629 (${booking.time} \u0625\u0644\u0649 ${booking.endTime || '\u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u062C\u0644\u0633\u0629'})` : '';
    const notesStr = booking.notes || booking.clientNotes ? `\n${memo} *Notes :* ${booking.notes || booking.clientNotes}` : '';
    const count = items.length > 0 ? items.length : 1;

    const text = isArabic
      ? `\u{1F64A} \u{1F64A} ${'\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u0645\u0631\u0643\u0632 \u0627\u0644\u062A\u062C\u0645\u064A\u0644 \u0627\u0644\u0648\u062F\u0627\u064A\u0627 '}${flower}
\u0623\u0648\u062F \u062A\u0623\u0643\u064A\u062F \u062D\u062C\u0632 \u0645\u0648\u0639\u062F \u062C\u062F\u064A\u062F \u0644\u0628\u0627\u0642\u0629 \u0645\u0646 \u0627\u0644\u062E\u062F\u0645\u0627\u062A:
${separator.repeat(17)}
\u0627\u0644\u0627\u0633\u0645 :* ${booking.clientName}
\u0627\u0644\u0647\u0627\u062A\u0641 :* ${booking.phone || booking.clientPhone}
\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629 (${count}) :*
${servicesListAr}
\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u062A\u0642\u062F\u064A\u0631\u064A :* ${booking.totalPrice || booking.price} \u062F\u0631\u0647\u0645${durationStrAr}
\u0627\u0644\u062A\u0627\u0631\u064A\u062E :* ${booking.date}
\u0627\u0644\u0648\u0642\u062A :* ${booking.time}${notesStr}
${separator.repeat(17)}
\u0641\u064A \u0627\u0646\u062A\u0638\u0627\u0631 \u062A\u0623\u0643\u064A\u062F\u0643\u0645 \u0627\u0644\u0643\u0631\u064A\u0645\u200E، \u0634\u0643\u0631\u0627\u064B \u0644\u0643\u0645! ${heart}`
      : `Bonjour Centre Beauté Loudaya ${flower}
Je souhaite confirmer ma r\u00E9servation pour plusieurs prestations :
${separator.repeat(17)}
Cliente :* ${booking.clientName}
T\u00E9l\u00E9phone :* ${booking.phone || booking.clientPhone}
Prestations Choisies (${count}) :*
${servicesListFr}
TOTAL ESTIM\u00C9 :* ${booking.totalPrice || booking.price} DH${durationStr}
Date :* ${booking.date}
Heure :* ${booking.time}${notesStr}
${separator.repeat(17)}
Merci de me confirmer la disponibilit\u00E9 ! ${heart}`;

    const url = `https://wa.me/${salonInfo.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="py-20 bg-gradient-to-b from-cream-50 via-roseGold-50/20 to-cream-100 relative">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-roseGold-200/80 border border-roseGold-300 text-plum-900 text-xs font-bold uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5 text-plum-800" />
            <span>{t('booking.badge')}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-plum-950">
            {t('booking.title')}
          </h2>

          <p className="text-sm text-charcoal-800/80 leading-relaxed font-light">
            {isArabic 
              ? 'اختاري خدماتكِ، وحددي التاريخ والوقت المناسب بنظام حجز فوري وذكي يمنع التعارض ويضمن راحتكِ التامة.'
              : 'Choisissez vos soins, sélectionnez une date et un créneau garanti sans double-réservation.'}
          </p>
        </div>

        {/* Multi-step progress bar */}
        <div className="mb-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-roseGold-200 -translate-y-1/2 -z-0"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-plum-800 to-roseGold-500 -translate-y-1/2 -z-0 transition-all duration-300"
              style={{
                width: `${((currentStep - 1) / 3) * 100}%`
              }}
            ></div>

            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`relative z-10 flex flex-col items-center gap-1.5 ${
                  currentStep >= stepNum ? 'text-plum-900' : 'text-charcoal-800/40'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    currentStep === stepNum
                      ? 'bg-gradient-to-r from-plum-800 to-roseGold-600 text-white shadow-luxury ring-4 ring-roseGold-200'
                      : currentStep > stepNum
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border-2 border-roseGold-200 text-charcoal-800/60'
                  }`}
                >
                  {currentStep > stepNum ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
                </div>
                <span className="hidden sm:inline text-xs font-semibold">
                  {stepNum === 1 && (isArabic ? 'اختيار الخدمات' : 'Choix des Soins')}
                  {stepNum === 2 && (isArabic ? 'الموعد الذكي' : 'Date & Heure')}
                  {stepNum === 3 && (isArabic ? 'بياناتك' : 'Infos')}
                  {stepNum === 4 && (isArabic ? 'التأكيد' : 'Validation')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Container Card */}
        <div ref={cardRef} className="bg-white rounded-3xl border border-roseGold-200 shadow-xl p-6 sm:p-10 relative overflow-hidden scroll-mt-28">
          
          {/* STEP 1: Select Multiple Services Across Categories */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Category tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-plum-950">
                    {t('booking.selectCategory')}
                  </h3>
                  <span className="text-xs text-roseGold-600 font-medium">
                    {isArabic ? 'اختيار متعدد متاح' : 'Sélection multiple autorisée'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    const catCount = selectedServices.filter((s) => s.categoryId === cat.id).length;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`relative p-3.5 rounded-2xl text-center border transition-all duration-200 ${
                          isSelected
                            ? 'border-plum-800 bg-plum-900 text-white shadow-md'
                            : 'border-roseGold-200 bg-cream-50 hover:bg-roseGold-50 text-charcoal-900'
                        }`}
                      >
                        <p className="text-xs sm:text-sm font-bold">
                          {isArabic ? cat.nameAr : cat.nameFr}
                        </p>
                        {catCount > 0 && (
                          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gold-400 text-plum-950 text-[10px] font-bold flex items-center justify-center shadow">
                            {catCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Services in Category with Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-plum-950">
                    {isArabic ? 'الخدمات المتاحة في هذا القسم :' : 'Prestations disponibles :'}
                  </h3>
                  <span className="text-xs text-charcoal-800/60">
                    {isArabic ? 'اضغطي لاختيار أو إلغاء الخدمة' : 'Cliquez pour sélectionner / désélectionner'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {categoryServices.map((service) => {
                    const isChecked = selectedServices.some((s) => s.id === service.id);

                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleServiceForBooking(service)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                          isChecked
                            ? 'border-plum-800 bg-roseGold-50 shadow-md ring-2 ring-roseGold-400'
                            : 'border-roseGold-200 hover:border-roseGold-400 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                              isChecked
                                ? 'bg-plum-900 border-plum-900 text-white'
                                : 'border-roseGold-300 bg-white text-transparent'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-plum-950">
                              {isArabic ? service.nameAr : service.nameFr}
                            </h4>
                            <p className="text-xs text-charcoal-800/70 line-clamp-1">
                              {isArabic ? service.descriptionAr : service.descriptionFr}
                            </p>
                            {service.duration && (
                              <span className="inline-block text-[11px] text-roseGold-600 font-medium">
                                ⏱ {service.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-end shrink-0 pl-2">
                          <span className="font-serif text-sm sm:text-base font-bold text-plum-900">
                            {formatServicePrice(service, i18n.language)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Selection Live Cart Summary Bar */}
              <div className="rounded-2xl bg-gradient-to-r from-plum-950 via-plum-900 to-roseGold-900 text-white p-5 border border-gold-400/40 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-400/20 text-gold-300 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gold-300 uppercase tracking-wider">
                        {isArabic ? 'سلة الخدمات المختارة' : 'Vos Soins Sélectionnés'}
                      </p>
                      <p className="font-serif text-lg font-bold">
                        {selectedServices.length}{' '}
                        {isArabic ? 'خدمة تم اختيارها' : 'prestation(s) sélectionnée(s)'}
                      </p>
                    </div>
                  </div>

                  {selectedServices.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSelectedServices}
                      className="text-xs text-rose-300 hover:text-white flex items-center gap-1 transition-colors self-end sm:self-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'مسح الكل' : 'Tout effacer'}</span>
                    </button>
                  )}
                </div>

                {selectedServices.length > 0 ? (
                  <div className="pt-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedServices.map((srv) => (
                        <span
                          key={srv.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold"
                        >
                          <span>{isArabic ? srv.nameAr : srv.nameFr}</span>
                          <span className="font-serif text-gold-300 font-bold">{formatServicePrice(srv, i18n.language)}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeServiceForBooking(srv.id);
                            }}
                            className="hover:text-rose-400 p-0.5 rounded-full"
                            title="Supprimer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 text-sm">
                      <div className="flex items-center gap-4 text-xs text-cream-200/80">
                        {formattedDuration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gold-400" />
                            <span>{isArabic ? `المدة الإجمالية: ~${formattedDuration}` : `Durée totale: ~${formattedDuration}`}</span>
                          </span>
                        )}
                      </div>

                      <div className="text-end">
                        <span className="text-xs text-gold-300 block">
                          {isArabic ? 'المجموع التقديري' : 'Total Estimé'}
                          {hasIndicativePrice && (
                            <span className="text-[10px] font-normal text-cream-200/70"> ({t('booking.indicativePrice')})</span>
                          )}
                        </span>
                        <span className="font-serif text-2xl font-black text-white">
                          {grandTotal} <span className="text-sm font-mono text-gold-400">{isArabic ? 'درهم' : 'DH'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-cream-200/60 pt-3">
                    {isArabic
                      ? 'لم تقومي باختيار أي خدمة بعد. تفضلي باختيار الخدمات التي ترغبين بها من القائمة أعلاه.'
                      : 'Aucun soin sélectionné pour l\'instant. Cochez les prestations souhaitées ci-dessus.'}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t border-roseGold-100">
                <button
                  type="button"
                  onClick={handleStep1Next}
                  disabled={selectedServices.length === 0}
                  className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm shadow-md transition-all ${
                    selectedServices.length > 0
                      ? 'bg-gradient-to-r from-plum-800 to-roseGold-600 hover:from-plum-900 hover:to-roseGold-700 text-white transform hover:-translate-y-0.5'
                      : 'bg-charcoal-800/20 text-charcoal-800/40 cursor-not-allowed'
                  }`}
                >
                  <span>{isArabic ? 'متابعة لاختيار التاريخ والوقت' : 'Continuer (Date & Heure)'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Intelligent Date & Time Picker */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Selected Services Recap Banner */}
              <div className="p-4 rounded-2xl bg-roseGold-50 border border-roseGold-200 space-y-3">
                <div className="flex items-center justify-between border-b border-roseGold-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-plum-800" />
                    <span className="text-xs text-roseGold-700 font-bold uppercase tracking-wider">
                      {isArabic ? `الخدمات المختارة (${selectedServices.length})` : `Prestations Choisies (${selectedServices.length})`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-plum-900 hover:text-plum-700 font-bold underline"
                  >
                    {isArabic ? 'تعديل الخدمات' : 'Modifier les soins'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {selectedServices.map((s) => (
                    <span key={s.id} className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-roseGold-200 text-plum-950 font-medium">
                      <span>{isArabic ? s.nameAr : s.nameFr}</span>
                      <span className="font-bold text-plum-900 font-serif">({formatServicePrice(s, i18n.language)})</span>
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between pt-1 text-xs border-t border-roseGold-200/60">
                  <div className="flex items-center gap-2 text-plum-900 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-roseGold-600" />
                    <span>
                      {isArabic 
                        ? `المدة المحسوبة للجلسة : حوالي ${formattedDuration}` 
                        : `Durée calculée de la séance : ~${formattedDuration}`}
                    </span>
                  </div>
                  <span className="font-serif text-lg font-black text-plum-900">
                    Total : {grandTotal} {isArabic ? 'درهم' : 'DH'}
                    {hasIndicativePrice && (
                      <span className="text-[11px] font-normal text-charcoal-800/60"> ({t('booking.indicativePrice')})</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Time slot dynamic notice (if a slot was automatically reset) */}
              {timeSlotNotice && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{timeSlotNotice}</span>
                </div>
              )}

              {/* SECTION: User-friendly Date Picker */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-plum-950 flex items-center gap-2">
                    <CalendarCheck2 className="w-4 h-4 text-plum-800" />
                    <span>{t('booking.dateLabel')}</span>
                  </label>
                  <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    {t('nav.sundayClosed')}
                  </span>
                </div>

                {/* Quick Date Selection Cards (Next 14 Days) */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {upcomingDays.map((day) => {
                    const isSelected = appointmentDate === day.dateString;
                    const isSunday = day.isSunday;

                    return (
                      <button
                        key={day.dateString}
                        type="button"
                        disabled={isSunday}
                        onClick={() => handleSelectDate(day.dateString)}
                        className={`min-w-[85px] sm:min-w-[95px] p-3 rounded-2xl text-center border transition-all duration-200 flex flex-col items-center justify-center shrink-0 ${
                          isSunday
                            ? 'bg-charcoal-800/5 border-charcoal-800/10 text-charcoal-800/35 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-gradient-to-b from-plum-900 to-plum-800 text-white border-plum-950 shadow-md ring-2 ring-gold-400'
                            : 'bg-white hover:bg-roseGold-50 text-charcoal-900 border-roseGold-200 hover:border-roseGold-400'
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-gold-300' : 'text-roseGold-600'}`}>
                          {isArabic ? day.dayNameAr : day.dayNameFr}
                        </span>

                        <span className="font-serif text-xl sm:text-2xl font-black my-0.5">
                          {day.dayOfMonth}
                        </span>

                        <span className="text-[10px] font-medium opacity-80">
                          {isSunday ? (
                            <span className="text-rose-500 font-bold flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" />
                              {isArabic ? 'مغلق' : 'Fermé'}
                            </span>
                          ) : day.isToday ? (
                            <span className="text-emerald-500 font-bold">
                              {isArabic ? 'اليوم' : "Auj."}
                            </span>
                          ) : (
                            isArabic ? day.monthNameAr : day.monthNameFr
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Manual date input fallback / picker */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <div className="relative w-full sm:w-auto flex-1">
                    <input
                      type="date"
                      min={todayStr}
                      value={appointmentDate}
                      onChange={(e) => handleSelectDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-roseGold-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-plum-800"
                    />
                  </div>

                  <p className="text-[11px] text-charcoal-800/70 shrink-0">
                    {isArabic 
                      ? 'أو حددي تاريخاً آخر من التقويم (الأحد مغلق تلقائياً)'
                      : 'Ou sélectionnez une autre date (dimanches bloqués automatiquement)'}
                  </p>
                </div>

                {dateError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{dateError}</span>
                  </div>
                )}
              </div>

              {/* SECTION: Intelligent Time Slot Picker */}
              <div className="space-y-4 pt-4 border-t border-roseGold-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-sm font-bold text-plum-950 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-plum-800" />
                    <span>{t('booking.timeLabel')}</span>
                    <span className="text-xs font-normal text-charcoal-800/60 font-mono">
                      (10h00 - 20h00)
                    </span>
                  </label>

                  {/* Legend */}
                  <div className="flex items-center gap-3 text-[11px] text-charcoal-800/70 flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>{isArabic ? 'متاح' : 'Disponible'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                      <span>{isArabic ? 'محجوز' : 'Réservé'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <span>{isArabic ? 'يتجاوز 20h' : 'Dépasse 20h'}</span>
                    </span>
                  </div>
                </div>

                {/* Active selection feedback banner */}
                {appointmentTime && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-plum-900 to-roseGold-700 text-white flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-gold-300" />
                      <div>
                        <p className="text-xs font-bold text-gold-300">
                          {isArabic ? 'الموعد المحدد بنجاح :' : 'Créneau sélectionné avec succès :'}
                        </p>
                        <p className="text-sm font-mono font-bold">
                          {appointmentTime} → {evaluatedSlots.find((s) => s.time === appointmentTime)?.endTime || ''}{' '}
                          <span className="font-sans text-xs opacity-90 font-normal">
                            ({isArabic ? `مدة الجلسة ${formattedDuration}` : `séance de ${formattedDuration}`})
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAppointmentTime('')}
                      className="text-xs text-rose-200 hover:text-white underline font-semibold"
                    >
                      {isArabic ? 'تغيير' : 'Changer'}
                    </button>
                  </div>
                )}

                {/* Grid of Dynamic Time Slots */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {evaluatedSlots.map((slot) => {
                    const isSelected = appointmentTime === slot.time;
                    const isAvailable = slot.isAvailable;

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setAppointmentTime(slot.time)}
                        className={`p-3 rounded-2xl text-start border transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-plum-900 text-white border-plum-950 shadow-lg ring-2 ring-gold-400 scale-[1.02]'
                            : !isAvailable
                            ? 'bg-charcoal-800/5 border-charcoal-800/10 text-charcoal-800/40 cursor-not-allowed opacity-60'
                            : 'bg-cream-50 hover:bg-roseGold-100 text-charcoal-900 border-roseGold-200 hover:border-plum-800'
                        }`}
                        title={isArabic ? slot.reasonAr : slot.reasonFr}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`font-mono text-sm font-extrabold ${isSelected ? 'text-gold-300' : 'text-plum-950'}`}>
                            {slot.time}
                          </span>
                          {!isAvailable && (
                            <span className="text-[10px] text-charcoal-800/50">
                              <Lock className="w-3 h-3" />
                            </span>
                          )}
                          {isSelected && (
                            <Check className="w-4 h-4 text-gold-300 stroke-[3]" />
                          )}
                        </div>

                        <div className="mt-1">
                          <span
                            className={`text-[10px] font-semibold block truncate ${
                              isSelected
                                ? 'text-cream-200 font-bold'
                                : isAvailable
                                ? 'text-emerald-700'
                                : slot.reasonCode === 'booked'
                                ? 'text-rose-600'
                                : slot.reasonCode === 'exceeds_closing'
                                ? 'text-amber-700'
                                : 'text-charcoal-800/50'
                            }`}
                          >
                            {isSelected 
                              ? (isArabic ? `ينتهي ${slot.endTime}` : `Fin : ${slot.endTime}`)
                              : (isArabic ? slot.reasonAr : slot.reasonFr)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Duration warning note */}
                <div className="p-3 rounded-xl bg-cream-100 border border-gold-300/80 text-[11px] text-charcoal-800/80 flex items-start gap-2">
                  <Info className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                  <p>
                    {isArabic
                      ? `نظام الحجز يضمن تلقائياً عدم تجاوز موعد الإغلاق (20:00). بالنسبة للباقة المختارة (${formattedDuration})، يتم إيقاف وتظليل الأوقات المتأخرة أو المحجوزة مسبقاً.`
                      : `Les créneaux s'adaptent automatiquement à votre durée totale (${formattedDuration}). Les heures trop proches de la fermeture (20h00) ou déjà réservées sont désactivées pour garantir votre confort.`}
                  </p>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-roseGold-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 rounded-full text-xs font-bold text-charcoal-800 hover:bg-roseGold-100 transition-colors"
                >
                  {isArabic ? 'رجوع للخدمات' : 'Retour aux soins'}
                </button>

                <button
                  type="button"
                  onClick={handleStep2Next}
                  disabled={!appointmentDate || !appointmentTime}
                  className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm shadow-md transition-all ${
                    appointmentDate && appointmentTime
                      ? 'bg-gradient-to-r from-plum-800 to-roseGold-600 hover:from-plum-900 hover:to-roseGold-700 text-white transform hover:-translate-y-0.5'
                      : 'bg-charcoal-800/20 text-charcoal-800/40 cursor-not-allowed'
                  }`}
                >
                  <span>{isArabic ? 'متابعة للبيانات الشخصية' : 'Vos coordonnées'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Client Details & WhatsApp Confirmation */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmitBooking} noValidate className="space-y-6 animate-in fade-in duration-300">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-plum-950">
                    {t('booking.nameLabel')} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className={`w-4 h-4 text-roseGold-500 absolute top-1/2 -translate-y-1/2 ${isArabic ? 'right-4' : 'left-4'}`} />
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={t('booking.namePlaceholder')}
                      className={`w-full py-3 ${isArabic ? 'pr-11 pl-4' : 'pl-11 pr-4'} rounded-2xl border ${
                        formErrors.name ? 'border-rose-500 bg-rose-50/30' : 'border-roseGold-300'
                      } text-sm focus:outline-none focus:ring-2 focus:ring-plum-800`}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-xs text-rose-600 font-semibold">{formErrors.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-plum-950">
                    {t('booking.phoneLabel')} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className={`w-4 h-4 text-roseGold-500 absolute top-1/2 -translate-y-1/2 ${isArabic ? 'right-4' : 'left-4'}`} />
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder={t('booking.phonePlaceholder')}
                      className={`w-full py-3 ${isArabic ? 'pr-11 pl-4' : 'pl-11 pr-4'} rounded-2xl border ${
                        formErrors.phone ? 'border-rose-500 bg-rose-50/30' : 'border-roseGold-300'
                      } text-sm focus:outline-none focus:ring-2 focus:ring-plum-800 font-mono`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-xs text-rose-600 font-semibold">{formErrors.phone}</p>
                  )}
                </div>

              </div>

              {/* Special Notes */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-plum-950">
                  {t('booking.notesLabel')}
                </label>
                <div className="relative">
                  <FileText className={`w-4 h-4 text-roseGold-500 absolute top-4 ${isArabic ? 'right-4' : 'left-4'}`} />
                  <textarea
                    rows={3}
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder={t('booking.notesPlaceholder')}
                    className={`w-full p-3 ${isArabic ? 'pr-11 pl-4' : 'pl-11 pr-4'} rounded-2xl border border-roseGold-300 text-sm focus:outline-none focus:ring-2 focus:ring-plum-800`}
                  />
                </div>
              </div>

              {/* Summary Ticket Breakdown */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-cream-100 to-roseGold-50 border border-gold-300/80 space-y-4">
                <div className="flex items-center justify-between border-b border-roseGold-200 pb-2">
                  <h4 className="font-serif text-sm font-bold text-plum-950">
                    {t('booking.summaryTitle')}
                  </h4>
                  <span className="text-xs font-mono font-bold text-gold-600">
                    {selectedServices.length} prestation(s)
                  </span>
                </div>
                
                {/* Services List Table */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                  {selectedServices.map((srv, idx) => (
                    <div key={srv.id} className="flex justify-between items-center py-1 border-b border-roseGold-100/60">
                      <span className="text-charcoal-900 font-semibold">
                        {idx + 1}. {isArabic ? srv.nameAr : srv.nameFr}
                      </span>
                      <span className="font-serif font-black text-plum-900 text-end">
                        {formatServicePrice(srv, i18n.language)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-roseGold-200">
                  <div>
                    <span className="text-charcoal-800/60 block">{t('booking.dateTime')}</span>
                    <span className="font-bold text-plum-900 font-mono">
                      {appointmentDate} @ {appointmentTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-charcoal-800/60 block">Durée Totale :</span>
                    <span className="font-bold text-plum-900">
                      ~{formattedDuration} ({appointmentTime} → {evaluatedSlots.find((s) => s.time === appointmentTime)?.endTime || ''})
                    </span>
                  </div>

                  <div>
                    <span className="text-charcoal-800/60 block">{t('booking.priceSelected')}</span>
                    <span className="font-serif text-xl font-black text-plum-900">
                      {grandTotal} {isArabic ? 'درهم' : 'DH'}
                      {hasIndicativePrice && (
                        <span className="text-[10px] font-normal text-charcoal-800/60 block">({t('booking.indicativePrice')})</span>
                      )}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-charcoal-800/70 pt-1">
                  {t('booking.whatsappRedirectNotice')}
                </p>
              </div>

              {submitError && (
                <div ref={submitErrorRef} className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-roseGold-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 rounded-full text-xs font-bold text-charcoal-800 hover:bg-roseGold-100 transition-colors"
                >
                  {isArabic ? 'رجوع' : 'Retour'}
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-extrabold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 ${
                    submitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isArabic ? 'جاري الحجز...' : 'Réservation en cours...'}</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5 fill-white/20" />
                      <span>{t('booking.confirmBtn')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success Ticket & Instant WhatsApp Link */}
          {currentStep === 4 && submittedBooking && (
            <div ref={successRef} className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-plum-950">
                  {t('booking.successTitle')}
                </h3>
                <p className="text-sm text-charcoal-800/80 max-w-md mx-auto">
                  {t('booking.successSubtitle')}
                </p>
              </div>

              {/* Receipt Ticket Box */}
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-cream-50 border border-gold-300 shadow-sm text-start space-y-3">
                <div className="flex justify-between items-center border-b border-roseGold-200 pb-2">
                  <span className="font-mono text-xs font-bold text-roseGold-600">{submittedBooking.ref || submittedBooking.id}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold-100 text-plum-900 font-bold">
                    {(submittedBooking.status || 'PENDING').toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <p><strong className="text-plum-950">Cliente :</strong> {submittedBooking.clientName} ({submittedBooking.phone || submittedBooking.clientPhone})</p>
                  
                  <div>
                    <strong className="text-plum-950">Prestations ({(submittedBooking.items || submittedBooking.services || []).length}) :</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 pl-1 text-charcoal-800">
                      {(submittedBooking.items || submittedBooking.services || []).map((s, i) => (
                        <li key={i}>
                          {isArabic ? (s.nameAr || s.nameFr) : s.nameFr} — <strong className="font-serif">{formatServicePrice(s, i18n.language)}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {(submittedBooking.estimatedDuration || submittedBooking.durationMinutes) && (
                    <p><strong className="text-plum-950">Durée :</strong> ~{submittedBooking.estimatedDuration || submittedBooking.durationMinutes} min ({submittedBooking.time} → {submittedBooking.endTime})</p>
                  )}
                  <p><strong className="text-plum-950">Date & Heure :</strong> {submittedBooking.date} à {submittedBooking.time}</p>
                  <p className="border-t border-roseGold-200 pt-2 font-serif text-base">
                    <strong className="text-plum-950">TOTAL :</strong> <span className="font-black text-plum-900">{submittedBooking.totalPrice || submittedBooking.price} {isArabic ? 'درهم' : 'DH'}</span>
                    {hasIndicativePrice && (
                      <span className="text-[10px] font-normal text-charcoal-800/60"> ({t('booking.indicativePrice')})</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => triggerWhatsAppRedirect(submittedBooking)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('booking.openWhatsAppNow')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setSubmittedBooking(null);
                    setAppointmentDate('');
                    setAppointmentTime('');
                    clearSelectedServices();
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-roseGold-300 text-plum-900 hover:bg-roseGold-100 font-bold text-sm transition-all"
                >
                  {t('booking.newBooking')}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
};
