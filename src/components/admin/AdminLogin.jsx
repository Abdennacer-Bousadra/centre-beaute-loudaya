import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin = ({ onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const isArabic = i18n.language === 'ar';

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const res = login(password);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(
        isArabic
          ? 'كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.'
          : 'Mot de passe incorrect. Veuillez réessayer.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-roseGold-300 shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={isArabic ? 'إغلاق' : 'Fermer'}
          className="absolute top-4 right-4 p-2 rounded-full text-charcoal-800/60 hover:text-charcoal-900 hover:bg-roseGold-100 transition-colors focus:outline-none focus:ring-2 focus:ring-plum-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-plum-800 to-roseGold-500 text-gold-300 flex items-center justify-center mx-auto mb-4 shadow-md ring-4 ring-roseGold-200">
          <Lock className="w-7 h-7" />
        </div>

        <div className="text-center space-y-2 mb-6">
          <h3 className="font-serif text-2xl font-bold text-plum-950">
            {t('admin.loginTitle')}
          </h3>
          <p className="text-xs text-charcoal-800/70">
            {t('admin.loginSubtitle')}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="block text-xs font-bold text-plum-900">
              {t('admin.passwordLabel')}
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                autoCapitalize="off"
                spellCheck={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('admin.passwordPlaceholder')}
                className="w-full py-3 px-4 rounded-xl border border-roseGold-300 text-sm focus:outline-none focus:ring-2 focus:ring-plum-800 pr-10"
                aria-describedby={error ? 'admin-password-error' : undefined}
                aria-invalid={error ? 'true' : 'false'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? isArabic
                      ? 'إخفاء كلمة المرور'
                      : 'Masquer le mot de passe'
                    : isArabic
                      ? 'إظهار كلمة المرور'
                      : 'Afficher le mot de passe'
                }
                className="absolute top-1/2 -translate-y-1/2 right-3 text-charcoal-800/50 hover:text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-plum-800 rounded-md p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p
                id="admin-password-error"
                role="alert"
                className="text-xs text-rose-600 font-semibold pt-1"
              >
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!password.trim()}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-plum-800 to-roseGold-600 hover:from-plum-900 hover:to-roseGold-700 text-white font-bold text-sm shadow-md transition-all transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-plum-800 focus:ring-offset-2"
          >
            {t('admin.loginBtn')}
          </button>
        </form>
      </div>
    </div>
  );
};
