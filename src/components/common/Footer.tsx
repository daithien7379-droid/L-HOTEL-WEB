import React from 'react';
import { HOTEL_INFO } from '../../data/branches';
import { Phone, Mail, Globe, MapPin, Sparkles } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer id="main-app-footer" className="bg-[#124C3B] text-white border-t border-[#0F5B43] mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="bg-[#FAF9F4] p-3 rounded-2xl inline-block shadow-sm">
              <Logo size="md" />
            </div>
            <p id="footer-slogan" className="text-[#C8DFD4] text-sm leading-relaxed italic font-serif">
              &ldquo;{HOTEL_INFO.slogan}&rdquo;
            </p>
            <div className="flex items-center gap-2 text-xs text-[#9BBBAA]">
              <Sparkles className="w-4 h-4 text-[#8CD1B0]" />
              <span>Chuỗi 13 chi nhánh không gian xanh tại TP. Hồ Chí Minh</span>
            </div>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 id="footer-contact-title" className="text-sm font-semibold uppercase tracking-wider text-[#8CD1B0]">
              Thông Tin Liên Hệ
            </h4>
            <ul className="space-y-2.5 text-sm text-[#E2EFE8]">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#8CD1B0] shrink-0" />
                <span>
                  Hotline 24/7:{' '}
                  <a href={`tel:${HOTEL_INFO.hotline}`} className="font-bold text-white hover:underline">
                    {HOTEL_INFO.hotlineFormatted}
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#8CD1B0] shrink-0" />
                <a href={`mailto:${HOTEL_INFO.email}`} className="hover:underline break-all">
                  {HOTEL_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#8CD1B0] shrink-0" />
                <a
                  href={HOTEL_INFO.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8CD1B0] hover:underline font-medium"
                >
                  {HOTEL_INFO.websiteDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#8CD1B0] shrink-0 mt-0.5" />
                <span className="text-xs text-[#A8C7B7]">
                  Phủ sóng: Phú Nhuận, Bình Thạnh, Gò Vấp, Quận 10, Quận 3, Tân Bình, Tân Phú, Bình Tân.
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Call Action */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <h4 id="footer-support-title" className="text-sm font-semibold uppercase tracking-wider text-[#8CD1B0] mb-2">
                Cần Hỗ Trợ Nhận Phòng?
              </h4>
              <p className="text-xs text-[#C8DFD4] leading-relaxed mb-4">
                Nếu bạn cần hướng dẫn đường đi, gia hạn giờ nhận phòng hoặc hỗ trợ đặc biệt, đừng ngần ngại gọi trực tiếp cho lễ tân.
              </p>
              <a
                id="btn-footer-call-hotel"
                href={`tel:${HOTEL_INFO.hotline}`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0F5B43] hover:bg-[#166E53] border border-[#2B8268] text-white font-bold text-sm tracking-wide shadow-md transition-all active:scale-[0.99]"
              >
                <Phone className="w-4 h-4 text-[#8CD1B0] animate-bounce" />
                <span>GỌI LÁ HOTEL ({HOTEL_INFO.hotlineFormatted})</span>
              </a>
            </div>
            <div className="pt-4 border-t border-[#1D5E4A] text-[11px] text-[#85A896]">
              © {new Date().getFullYear()} Lá Hotel Group. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
