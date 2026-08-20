import React from 'react';
import { Logo } from './Logo';
import { HOTEL_INFO } from '../../data/branches';
import { Phone, Shield, UserCheck } from 'lucide-react';

interface HeaderProps {
  currentView: 'customer' | 'admin';
  onNavigate: (view: 'customer' | 'admin') => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, isAdminLoggedIn }) => {
  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 bg-[#FAF9F4]/90 backdrop-blur-md border-b border-[#E8F1EC] transition-all"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <button
          id="btn-nav-home"
          type="button"
          onClick={() => onNavigate('customer')}
          className="text-left focus:outline-none focus:ring-2 focus:ring-[#0F5B43]/20 rounded-lg p-1 transition-opacity hover:opacity-90"
        >
          <Logo size="md" />
        </button>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Hotline Quick Call */}
          <a
            id="header-hotline-link"
            href={`tel:${HOTEL_INFO.hotline}`}
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F1EC] text-[#0F5B43] text-sm font-semibold hover:bg-[#D7E6DD] transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Hotline: {HOTEL_INFO.hotlineFormatted}</span>
          </a>

          {/* Switch View Button */}
          {currentView === 'customer' ? (
            <button
              id="btn-switch-to-admin"
              type="button"
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5E2DA] bg-white text-[#2C4A3E] text-xs sm:text-sm font-medium hover:border-[#0F5B43] hover:text-[#0F5B43] shadow-xs transition-all"
            >
              <Shield className="w-4 h-4 text-[#0F5B43]" />
              <span className="hidden sm:inline">Khu vực</span> Quản trị
            </button>
          ) : (
            <button
              id="btn-switch-to-customer"
              type="button"
              onClick={() => onNavigate('customer')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5E2DA] bg-white text-[#2C4A3E] text-xs sm:text-sm font-medium hover:border-[#0F5B43] hover:text-[#0F5B43] shadow-xs transition-all"
            >
              <UserCheck className="w-4 h-4 text-[#0F5B43]" />
              <span>Trang Khách Hàng</span>
            </button>
          )}

          {isAdminLoggedIn && currentView === 'admin' && (
            <span
              id="admin-status-badge"
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8F1EC] text-[#0F5B43] text-xs font-semibold"
            >
              <span className="w-2 h-2 rounded-full bg-[#0F5B43] animate-pulse"></span>
              Đã xác thực
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
