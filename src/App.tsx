import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HeroSection } from './components/customer/HeroSection';
import { LookupForm } from './components/customer/LookupForm';
import { RoomResultView } from './components/customer/RoomResultView';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { SafeGuestBooking } from './types';
import { getStoredAdminToken, checkAdminAuth } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState<'customer' | 'admin'>('customer');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Customer verified booking state
  const [verifiedBooking, setVerifiedBooking] = useState<SafeGuestBooking | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<string | null>(null);

  // Check URL path/hash on load
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.includes('/admin') || hash === '#admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('customer');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    // Check existing admin token
    const token = getStoredAdminToken();
    if (token) {
      checkAdminAuth().then((res) => {
        if (res.success) {
          setIsAdminLoggedIn(true);
        } else {
          setIsAdminLoggedIn(false);
        }
      });
    }

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleNavigate = (view: 'customer' | 'admin') => {
    setCurrentView(view);
    if (view === 'admin') {
      window.location.hash = '#admin';
    } else {
      window.location.hash = '';
    }
  };

  const handleVerificationSuccess = (
    data: SafeGuestBooking,
    token: string,
    expiresAt: string
  ) => {
    setVerifiedBooking(data);
    setSessionToken(token);
    setSessionExpiresAt(expiresAt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetVerification = () => {
    setVerifiedBooking(null);
    setSessionToken(null);
    setSessionExpiresAt(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="lahotel-app-root" className="min-h-screen flex flex-col bg-[#FAF9F4] text-[#1F2924]">
      {/* Universal Sticky Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'customer' ? (
          <div id="view-customer-portal">
            {verifiedBooking && sessionToken && sessionExpiresAt ? (
              <RoomResultView
                booking={verifiedBooking}
                sessionToken={sessionToken}
                expiresAt={sessionExpiresAt}
                onReset={handleResetVerification}
              />
            ) : (
              <div className="space-y-4">
                <HeroSection />
                <LookupForm onSuccess={handleVerificationSuccess} />
              </div>
            )}
          </div>
        ) : (
          <div id="view-admin-portal">
            {isAdminLoggedIn ? (
              <AdminDashboardView
                onLogout={() => setIsAdminLoggedIn(false)}
                onPreviewAsCustomer={(_code) => {
                  handleNavigate('customer');
                }}
              />
            ) : (
              <AdminLoginView
                onLoginSuccess={() => setIsAdminLoggedIn(true)}
                onBackToCustomer={() => handleNavigate('customer')}
              />
            )}
          </div>
        )}
      </main>

      {/* Universal Luxury Footer */}
      <Footer />
    </div>
  );
}
