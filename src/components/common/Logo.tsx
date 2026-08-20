import React, { useState } from 'react';
import { HOTEL_INFO } from '../../data/branches';

interface LogoProps {
  variant?: 'light' | 'dark' | 'auto';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 text-lg',
    md: 'h-10 text-xl',
    lg: 'h-14 text-2xl',
  };

  return (
    <div id="brand-logo-container" className={`flex items-center gap-2.5 select-none ${className}`}>
      {!imgError ? (
        <img
          id="lahotel-logo-img"
          src={HOTEL_INFO.logoUrl}
          alt="Lá Hotel Logo"
          className={`${sizeClasses[size].split(' ')[0]} w-auto object-contain transition-transform duration-200 hover:scale-105`}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div
          id="lahotel-fallback-badge"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#0F5B43] text-white shadow-sm"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
          </svg>
        </div>
      )}

      <div className="flex flex-col">
        <span
          id="brand-name-title"
          className="font-bold tracking-wider text-[#0F5B43] font-display text-lg sm:text-xl leading-none flex items-center gap-1.5"
        >
          LÁ HOTEL
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0F5B43]"></span>
        </span>
        <span id="brand-slogan-sub" className="text-[10px] sm:text-xs text-[#52635A] font-medium tracking-tight mt-0.5 hidden sm:inline-block">
          Không gian xanh thư giãn
        </span>
      </div>
    </div>
  );
};
