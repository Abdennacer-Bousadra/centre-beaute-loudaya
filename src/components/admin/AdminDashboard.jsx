import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  MessageCircle, 
  Calendar, 
  Clock, 
  DollarSign, 
  Settings, 
  ShieldCheck, 
  Filter,
  RefreshCw,
  Phone,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useServices } from '../../context/ServicesContext';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/client';

export const AdminDashboard = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const { refreshBookings } = useBooking();
  const { 
    categories: contextCategories, 
    services: contextServices, 
    salonSettings,
    loading: servicesLoading,
    error: servicesError,
    addService, 
    updateService, 
    deleteService, 
    toggleServiceAvailability,
    updateSalonSettings,
    resetToDefaultServices,
    refreshServices
  } = useServices();

  const isArabic = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('services'); // services | bookings | settings
  const [isEditingService, setIsEditingService] = useState(false);
  const [currentEditService, setCurrentEditService] = useState({
    id: '',
    nameFr: '',
    nameAr: '',
    categoryId: 'epilation',
    price: 100,
    priceMax: null,
    priceFrom: false,
    active: true,
    duration: '30 min',
    descriptionFr: '',
    descriptionAr: '',
    available: true,
    popular: false,
    badge: ''
  });

  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');

  const [tempSettings, setTempSettings] = useState({
    phone: salonSettings.phone,
    whatsappNumber: salonSettings.whatsappNumber,
    instagramUsername: salonSettings.instagramUsername,
    sundayOpen: salonSettings.sundayOpen || false,
    openHour: salonSettings.openHour || '10:00',
    closeHour: salonSettings.closeHour || '20:00'
  });
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);
      setBookingsError('');
      const data = await adminApi.getBookings(bookingFilter);
      setBookings(data.bookings || []);
    } catch (err) {
      setBookingsError(err.message);
      console.error('[AdminDashboard] Failed to fetch bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  }, [bookingFilter]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab, fetchBookings]);

  useEffect(() => {
    if (activeTab === 'services') {
      refreshServices();
    }
  }, [activeTab, refreshServices]);

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!currentEditService.nameFr || !currentEditService.price) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }

    const price = Number(currentEditService.price);
    const priceMax =
      currentEditService.priceMax === '' || currentEditService.priceMax == null
        ? null
        : Number(currentEditService.priceMax);

    if (!Number.isInteger(price) || price <= 0) {
      alert('Le prix doit être un entier positif.');
      return;
    }
    if (priceMax !== null && (!Number.isInteger(priceMax) || priceMax < price)) {
      alert('Le prix maximum doit être un entier supérieur ou égal au prix minimum.');
      return;
    }

    const payload = {
      ...currentEditService,
      price,
      priceMax,
      priceFrom: !!currentEditService.priceFrom,
      active: currentEditService.active !== false
    };

    try {
      if (currentEditService.id) {
        await updateService(payload);
      } else {
        await addService(payload);
      }

      setIsEditingService(false);
      setCurrentEditService({
        id: '',
        nameFr: '',
        nameAr: '',
        categoryId: 'epilation',
        price: 100,
        priceMax: null,
        priceFrom: false,
        active: true,
        duration: '30 min',
        descriptionFr: '',
        descriptionAr: '',
        available: true,
        popular: false,
        badge: ''
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenEdit = (service) => {
    setCurrentEditService({ ...service });
    setIsEditingService(true);
  };

  const handleContactClientWhatsApp = (booking) => {
    const servicesList = booking.items && booking.items.length > 0
      ? booking.items.map(s => isArabic ? (s.nameAr || s.nameFr) : s.nameFr).join(', ')
      : (isArabic ? (booking.service?.nameAr || booking.service?.nameFr) : booking.service?.nameFr);

    const text = isArabic
      ? `أهلاً بكِ أختي ${booking.clientName} 🌸\nنتواصل معكِ من مركز التجميل الوداية بخصوص موعدكِ (${servicesList}) ليوم ${booking.date} على الساعة ${booking.time} بمبلغ إجمالي ${booking.totalPrice || booking.price} درهم.`
      : `Bonjour ${booking.clientName} 🌸\nL'équipe du Centre Beauté Loudaya vous contacte concernant votre rendez-vous (${servicesList}) du ${booking.date} à ${booking.time} pour un montant total de ${booking.totalPrice || booking.price} DH.`;

    const phoneClean = booking.phone.replace(/\D/g, '');
    const fullPhone = phoneClean.startsWith('212') ? phoneClean : `212${phoneClean.replace(/^0/, '')}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleBookingStatusChange = async (bookingId, newStatus) => {
    try {
      const data = await adminApi.updateBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? data.booking : b))
      );
    } catch (err) {
      alert(err.message);
      fetchBookings();
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Supprimer cette demande ?')) return;
    try {
      await adminApi.deleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (err) {
      alert(err.message);
      fetchBookings();
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await updateSalonSettings(tempSettings);
      setSavedSettingsMsg(true);
      setTimeout(() => setSavedSettingsMsg(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter.toUpperCase();
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-plum-950/80 backdrop-blur-md flex flex-col">
      
      {/* Top Admin Header */}
      <header className="bg-plum-900 border-b border-roseGold-400/30 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500 to-roseGold-400 flex items-center justify-center text-plum-950 shadow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-white">
              {t('admin.dashboardTitle')}
            </h2>
            <p className="text-xs text-gold-300 font-mono">
              Espace Direction • Loudaya
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              logout();
              if (onClose) onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('admin.logout')}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10"
            title="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-roseGold-300/30 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'services'
                ? 'bg-roseGold-500 text-white shadow-md'
                : 'bg-white/10 text-cream-200 hover:bg-white/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('admin.tabs.services')} ({contextServices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'bookings'
                ? 'bg-roseGold-500 text-white shadow-md'
                : 'bg-white/10 text-cream-200 hover:bg-white/20'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t('admin.tabs.bookings')} ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'settings'
                ? 'bg-roseGold-500 text-white shadow-md'
                : 'bg-white/10 text-cream-200 hover:bg-white/20'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t('admin.tabs.settings')}</span>
          </button>
        </div>

        {/* TAB 1: Services Management */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-roseGold-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-plum-950">
                  {t('admin.tabs.services')}
                </h3>
                <p className="text-xs text-charcoal-800/70">
                  Gérez la carte des soins, modifiez les prix et ajustez la disponibilité en temps réel.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setCurrentEditService({
                      id: '',
                      nameFr: '',
                      nameAr: '',
                      categoryId: 'epilation',
                      price: 100,
                      priceMax: null,
                      priceFrom: false,
                      active: true,
                      duration: '30 min',
                      descriptionFr: '',
                      descriptionAr: '',
                      available: true,
                      popular: false,
                      badge: ''
                    });
                    setIsEditingService(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-plum-800 to-roseGold-600 hover:from-plum-900 hover:to-roseGold-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('admin.servicesTab.addNew')}</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Voulez-vous réinitialiser tous les soins aux prix officiels initiaux ?')) {
                      resetToDefaultServices();
                    }
                  }}
                  className="p-2.5 rounded-full border border-roseGold-300 text-charcoal-800 hover:bg-roseGold-100 transition-colors"
                  title="Réinitialiser les prestations par défaut"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Services Table */}
            {servicesLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-roseGold-200">
                <Loader2 className="w-8 h-8 text-roseGold-500 animate-spin mx-auto mb-3" />
                <p className="text-sm font-bold text-plum-900">Chargement des services...</p>
              </div>
            ) : servicesError ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-rose-300">
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-rose-700">Erreur: {servicesError}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md border border-roseGold-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-cream-100 text-plum-950 font-bold border-b border-roseGold-200">
                      <tr>
                        <th className="p-4">Prestation (FR / AR)</th>
                        <th className="p-4">Catégorie</th>
                        <th className="p-4">Prix</th>
                        <th className="p-4">Durée</th>
                        <th className="p-4 text-center">Disponibilité</th>
                        <th className="p-4 text-center">Statut</th>
                        <th className="p-4 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-roseGold-100">
                      {contextServices.map((s) => (
                        <tr key={s.id} className="hover:bg-cream-50/50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-plum-950">{s.nameFr}</p>
                            <p className="text-xs text-charcoal-800/70 font-arabic">{s.nameAr}</p>
                          </td>

                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-roseGold-100 text-plum-900">
                              {s.categoryId}
                            </span>
                          </td>

                          <td className="p-4 font-serif font-black text-plum-900 text-base whitespace-nowrap">
                            {s.priceFrom ? 'à partir de ' : ''}
                            {s.price}
                            {s.priceMax != null && s.priceMax > s.price ? `–${s.priceMax}` : ''}{' '}
                            <span className="text-xs font-mono text-gold-600">DH</span>
                          </td>

                          <td className="p-4 text-charcoal-800/70">
                            {s.duration || '30 min'}
                          </td>

                          <td className="p-4 text-center">
                            <button
                              onClick={() => toggleServiceAvailability(s.id)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                s.available !== false
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                            >
                              {s.available !== false ? 'Disponible' : 'Indisponible'}
                            </button>
                          </td>

                          <td className="p-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                s.active !== false
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {s.active !== false ? 'Actif' : 'Inactif'}
                            </span>
                          </td>

                          <td className="p-4 text-end">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(s)}
                                className="p-1.5 rounded-lg text-plum-800 hover:bg-roseGold-100"
                                title="Modifier"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(t('admin.servicesTab.deleteConfirm'))) {
                                    deleteService(s.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Edit / Add Service */}
            {isEditingService && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/70 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-3xl border border-roseGold-300 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-roseGold-200 pb-3">
                    <h4 className="font-serif text-xl font-bold text-plum-950">
                      {currentEditService.id ? 'Modifier le Soin' : 'Ajouter un Nouveau Soin'}
                    </h4>
                    <button
                      onClick={() => setIsEditingService(false)}
                      className="p-1.5 rounded-full text-charcoal-800/60 hover:text-charcoal-900"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveService} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-plum-950 mb-1">
                          Nom en Français *
                        </label>
                        <input
                          type="text"
                          required
                          value={currentEditService.nameFr}
                          onChange={(e) =>
                            setCurrentEditService({ ...currentEditService, nameFr: e.target.value })
                          }
                          className="w-full p-2.5 rounded-xl border border-roseGold-300 text-sm focus:ring-2 focus:ring-plum-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-plum-950 mb-1">
                          الاسم بالعربية *
                        </label>
                        <input
                          type="text"
                          required
                          value={currentEditService.nameAr}
                          onChange={(e) =>
                            setCurrentEditService({ ...currentEditService, nameAr: e.target.value })
                          }
                          className="w-full p-2.5 rounded-xl border border-roseGold-300 text-sm focus:ring-2 focus:ring-plum-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-plum-950 mb-1">
                          Catégorie
                        </label>
                        <select
                          value={currentEditService.categoryId}
                          onChange={(e) =>
                            setCurrentEditService({ ...currentEditService, categoryId: e.target.value })
                          }
                          className="w-full p-2.5 rounded-xl border border-roseGold-300 text-sm focus:ring-2 focus:ring-plum-800"
                        >
                          {contextCategories.map((c) => (
                            <option key={c.id} value={c.slug}>
                              {c.nameFr}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-plum-950 mb-1">
                          Prix (DH) *
                        </label>
                        <input
                          type="number"
                          required
                          value={currentEditService.price}
                          onChange={(e) =>
                            setCurrentEditService({
                              ...currentEditService,
                              price: Number(e.target.value)
                            })
                          }
                          className="w-full p-2.5 rounded-xl border border-roseGold-300 text-sm focus:ring-2 focus:ring-plum-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-plum-950 mb-1">
                          Prix maximum (DH)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={currentEditService.priceMax ?? ''}
                          onChange={(e) =>
                            setCurrentEditService({
                              ...currentEditService,
                              priceMax: e.target.value === '' ? null : Number(e.target.value)
                            })
                          }
                          placeholder="Optionnel"
                          className="w-full p-2.5 rounded-xl border border-roseGold-300 text-sm focus:ring-2 focus:ring-plum-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-plum-950 mb-1">
                          Durée
                        </label>
                        <input
                          type="text"
                          value={currentEditService.duration}
                          onChange={(e) =>
                            setCurrentEditService({ ...currentEditService, duration: e.target.value })
                          }
                          placeholder="ex: 45 min"
                          className="w-full p-2.5 rounded-xl border border-roseGold-300 text-sm focus:ring-2 focus:ring-plum-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-plum-950 mb-1">
                        Description (Français)
                      </label>
                      <textarea
                        rows={2}
                        value={currentEditService.descriptionFr}
                        onChange={(e) =>
                          setCurrentEditService({
                            ...currentEditService,
                            descriptionFr: e.target.value
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-roseGold-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-plum-950 mb-1">
                        الوصف (عربي)
                      </label>
                      <textarea
                        rows={2}
                        value={currentEditService.descriptionAr}
                        onChange={(e) =>
                          setCurrentEditService({
                            ...currentEditService,
                            descriptionAr: e.target.value
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-roseGold-300 text-sm font-arabic"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!currentEditService.priceFrom}
                          onChange={(e) =>
                            setCurrentEditService({
                              ...currentEditService,
                              priceFrom: e.target.checked
                            })
                          }
                          className="rounded text-plum-800 focus:ring-plum-800"
                        />
                        <span>À partir de (prix minimum)</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentEditService.active !== false}
                          onChange={(e) =>
                            setCurrentEditService({
                              ...currentEditService,
                              active: e.target.checked
                            })
                          }
                          className="rounded text-plum-800 focus:ring-plum-800"
                        />
                        <span>Actif (visible sur le site)</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentEditService.available}
                          onChange={(e) =>
                            setCurrentEditService({
                              ...currentEditService,
                              available: e.target.checked
                            })
                          }
                          className="rounded text-plum-800 focus:ring-plum-800"
                        />
                        <span>Disponible à la réservation</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentEditService.popular}
                          onChange={(e) =>
                            setCurrentEditService({
                              ...currentEditService,
                              popular: e.target.checked
                            })
                          }
                          className="rounded text-plum-800 focus:ring-plum-800"
                        />
                        <span>Marquer Populaire (★)</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-roseGold-100">
                      <button
                        type="button"
                        onClick={() => setIsEditingService(false)}
                        className="px-5 py-2 rounded-full border border-roseGold-300 text-xs font-bold"
                      >
                        {t('admin.servicesTab.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-full bg-gradient-to-r from-plum-800 to-roseGold-600 text-white text-xs font-bold shadow-md"
                      >
                        {t('admin.servicesTab.save')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: Bookings Management */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter buttons */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-roseGold-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-plum-950">
                  {t('admin.tabs.bookings')} ({bookings.length})
                </h3>
                <p className="text-xs text-charcoal-800/70">
                  Suivez les demandes de rendez-vous enregistrées et confirmez-les avec vos clientes.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setBookingFilter(st);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                      bookingFilter === st
                        ? 'bg-plum-900 text-white shadow-sm'
                        : 'bg-cream-100 text-charcoal-800 hover:bg-roseGold-100 border border-roseGold-200'
                    }`}
                  >
                    {st === 'all' ? 'Toutes' : st.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            {bookingsLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-roseGold-200">
                <Loader2 className="w-8 h-8 text-roseGold-500 animate-spin mx-auto mb-3" />
                <p className="text-sm font-bold text-plum-900">Chargement des réservations...</p>
              </div>
            ) : bookingsError ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-rose-300">
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-rose-700">Erreur: {bookingsError}</p>
                <button
                  onClick={fetchBookings}
                  className="mt-3 px-4 py-2 rounded-full bg-plum-800 text-white text-xs font-bold"
                >
                  Réessayer
                </button>
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-5 border border-roseGold-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-roseGold-100 pb-2">
                        <span className="font-mono text-xs font-bold text-plum-800">{b.ref || b.id}</span>
                        
                        {/* Status badge & selector */}
                        <select
                          value={b.status}
                          onChange={(e) => handleBookingStatusChange(b.id, e.target.value)}
                          className={`text-xs font-bold py-1 px-2.5 rounded-full border-0 focus:ring-2 focus:ring-plum-800 cursor-pointer ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : b.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <option value="PENDING">En attente</option>
                          <option value="CONFIRMED">Confirmé</option>
                          <option value="COMPLETED">Terminé</option>
                          <option value="CANCELLED">Annulé</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <p className="text-sm font-bold text-plum-950">
                          👤 {b.clientName}
                        </p>
                        <p className="font-mono text-charcoal-800">
                          📞 {b.phone}
                        </p>
                        <div className="font-semibold text-roseGold-700">
                          <p className="text-xs font-bold text-plum-950 mb-0.5">💅 Prestations :</p>
                          {b.items && b.items.length > 0 ? (
                            <ul className="list-disc list-inside pl-1 text-[11px] text-charcoal-900 font-medium space-y-0.5">
                              {b.items.map((s, idx) => (
                                <li key={idx}>
                                  {isArabic ? (s.nameAr || s.nameFr) : s.nameFr} — <span className="font-bold text-plum-900">{s.price} DH</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-charcoal-900">{isArabic ? (b.service?.nameAr || b.service?.nameFr) : b.service?.nameFr}</p>
                          )}
                          {(b.extraOption || b.extraOptionName) && (
                            <p className="text-[11px] text-gold-700 font-normal mt-0.5">✨ Option : {b.extraOption || b.extraOptionName}</p>
                          )}
                        </div>
                        <p className="text-charcoal-800 flex items-center gap-1 font-mono">
                          📅 {b.date} à {b.time}
                        </p>
                        <p className="font-serif font-black text-plum-900 text-sm">
                          💰 {b.totalPrice || b.price} DH
                        </p>
                        {b.notes && (
                          <p className="text-charcoal-800/70 italic bg-cream-50 p-2 rounded-lg mt-2">
                            "{b.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-roseGold-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleContactClientWhatsApp(b)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Cliente</span>
                      </button>

                      <button
                        onClick={() => handleDeleteBooking(b.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                        title="Supprimer la réservation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-roseGold-200">
                <Calendar className="w-12 h-12 text-roseGold-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-plum-900">
                  {t('admin.bookingsTab.noBookings')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Salon Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-roseGold-200 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-serif text-xl font-bold text-plum-950">
                {t('admin.tabs.settings')}
              </h3>
              <p className="text-xs text-charcoal-800/70">
                Coordonnées de réception, horaires et politique du dimanche.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-plum-950 mb-1">
                  {t('admin.settingsTab.phone')}
                </label>
                <input
                  type="text"
                  value={tempSettings.phone}
                  onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                  className="w-full p-3 rounded-xl border border-roseGold-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-plum-950 mb-1">
                  Numéro WhatsApp International (ex: 212666923910)
                </label>
                <input
                  type="text"
                  value={tempSettings.whatsappNumber}
                  onChange={(e) => setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })}
                  className="w-full p-3 rounded-xl border border-roseGold-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-plum-950 mb-1">
                  {t('admin.settingsTab.instagram')}
                </label>
                <input
                  type="text"
                  value={tempSettings.instagramUsername}
                  onChange={(e) => setTempSettings({ ...tempSettings, instagramUsername: e.target.value })}
                  className="w-full p-3 rounded-xl border border-roseGold-300 text-sm"
                />
              </div>

              <div className="p-4 rounded-2xl bg-cream-100 border border-gold-300 space-y-2">
                <label className="block text-xs font-bold text-plum-950">
                  {t('admin.settingsTab.sundayStatus')}
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="sunday"
                      checked={!tempSettings.sundayOpen}
                      onChange={() => setTempSettings({ ...tempSettings, sundayOpen: false })}
                    />
                    <span>{t('admin.settingsTab.sundayClosedAlways')}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="sunday"
                      checked={tempSettings.sundayOpen}
                      onChange={() => setTempSettings({ ...tempSettings, sundayOpen: true })}
                    />
                    <span>{t('admin.settingsTab.sundayOpenSpecial')}</span>
                  </label>
                </div>
              </div>

              {savedSettingsMsg && (
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Paramètres enregistrés avec succès !</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className={`w-full py-3.5 rounded-full font-bold text-sm shadow-md transition-all ${
                  savingSettings
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-plum-800 to-roseGold-600 text-white hover:from-plum-900 hover:to-roseGold-700'
                }`}
              >
                {savingSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  t('admin.settingsTab.saveSettings')
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};