import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

export const AdminPage = () => {
  const { t, i18n } = useTranslation();
  const { isAdminLoggedIn, loading, verifyAuth } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const isArabic = i18n.language === 'ar';

  useEffect(() => {
    // Only verify auth on /admin route
    verifyAuth();
  }, [verifyAuth]);

  // If logged in, show dashboard; otherwise show login
  const showDashboard = isAdminLoggedIn && !loading;

  return (
    <div className="min-h-screen bg-cream-100 selection:bg-roseGold-400 selection:text-white">
      {/* Admin SEO: noindex, nofollow */}
      <meta name="robots" content="noindex, nofollow" />
      <title>{isArabic ? 'إدارة مركز التجميل الوداية' : 'Administration Centre Beauté Loudaya'}</title>

      {!showDashboard ? (
        <AdminLogin
          onClose={() => window.location.href = '/'}
          onSuccess={() => setShowLogin(false)}
        />
      ) : (
        <AdminDashboard onClose={() => window.location.href = '/'} />
      )}
    </div>
  );
};