import React from 'react';
import { HOTEL_INFO } from '../../data/branches';
import { Sparkles, ShieldCheck, Clock, KeyRound } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div id="customer-hero-section" className="text-center pt-8 pb-6 sm:py-10 max-w-3xl mx-auto px-4">
      {/* Botanical badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F1EC] text-[#0F5B43] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#CDE0D5] shadow-xs">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Tra Cứu Thông Tin Nhận Phòng</span>
      </div>

      {/* Main Headline */}
      <h1
        id="hero-main-title"
        className="text-2xl sm:text-4xl lg:text-[40px] font-bold text-[#0F5B43] tracking-tight leading-tight mb-3 font-display"
      >
        Chào mừng bạn đến với Lá Hotel
      </h1>

      {/* Slogan */}
      <p id="hero-slogan-text" className="text-[#3A5348] text-sm sm:text-base font-serif italic mb-2">
        &ldquo;{HOTEL_INFO.slogan}&rdquo;
      </p>

      {/* Subheadline */}
      <p id="hero-subheadline-desc" className="text-[#52635A] text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6">
        Nhập thông tin đặt phòng để xem phòng và hướng dẫn nhận phòng chi tiết của bạn.
      </p>

      {/* Feature tags */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-[#3C564A]">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/70 border border-[#E2ECE6]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0F5B43]" />
          Bảo mật thông tin
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/70 border border-[#E2ECE6]">
          <KeyRound className="w-3.5 h-3.5 text-[#0F5B43]" />
          Nhận phòng nhanh chóng
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/70 border border-[#E2ECE6]">
          <Clock className="w-3.5 h-3.5 text-[#0F5B43]" />
          Hỗ trợ 24/7
        </span>
      </div>
    </div>
  );
};
