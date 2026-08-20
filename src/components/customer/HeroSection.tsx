import React from 'react';
import { HOTEL_INFO } from '../../data/branches';
import { Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div id="customer-hero-section" className="text-center pt-6 pb-4 sm:pt-8 sm:pb-6 max-w-2xl mx-auto px-4">
      {/* Subtle green indicator */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F1EC] text-[#0F5B43] text-xs font-semibold uppercase tracking-wider mb-3 border border-[#CDE0D5]">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Tra Cứu Thông Tin Phòng</span>
      </div>

      {/* Main Headline */}
      <h1
        id="hero-main-title"
        className="text-2xl sm:text-4xl font-bold text-[#0F5B43] tracking-tight leading-tight mb-2 font-display"
      >
        Chào mừng bạn đến với Lá Hotel
      </h1>

      {/* Slogan */}
      <p id="hero-slogan-text" className="text-[#3A5348] text-base sm:text-lg font-serif italic mb-3">
        &ldquo;{HOTEL_INFO.slogan}&rdquo;
      </p>

      {/* Direct Subtitle */}
      <p id="hero-subheadline-desc" className="text-[#52635A] text-sm sm:text-base leading-relaxed">
        Nhập bất kỳ <strong>2 trong 4</strong> thông tin đặt phòng bên dưới để xác thực và xem chi tiết phòng nghỉ của bạn.
      </p>
    </div>
  );
};
