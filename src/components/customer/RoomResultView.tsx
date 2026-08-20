import React, { useState, useEffect } from 'react';
import { SafeGuestBooking } from '../../types';
import { HOTEL_INFO } from '../../data/branches';
import {
  Sparkles,
  MapPin,
  Calendar,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  QrCode,
  Phone,
  Printer,
  RotateCcw,
  Footprints,
  Compass,
  Car,
  Gift,
  Wifi,
  BedDouble,
  Info,
  Clock,
  Building,
  AlertTriangle,
} from 'lucide-react';

interface RoomResultViewProps {
  booking: SafeGuestBooking;
  sessionToken: string;
  expiresAt: string;
  onReset: () => void;
}

export const RoomResultView: React.FC<RoomResultViewProps> = ({
  booking,
  expiresAt,
  onReset,
}) => {
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);

  // 15-minute countdown timer
  useEffect(() => {
    const target = new Date(expiresAt).getTime();
    const updateCountdown = () => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setSecondsRemaining(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyWifi = () => {
    if (booking.instructions.wifiPassword) {
      navigator.clipboard.writeText(booking.instructions.wifiPassword);
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2500);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const isCheckedOut = booking.status === 'CHECKED_OUT';

  return (
    <div id="room-result-container" className="max-w-4xl mx-auto px-4 py-8 pb-16 space-y-6">
      {/* 15-minute session security banner */}
      <div
        id="session-timer-banner"
        className="no-print bg-[#E8F1EC] border border-[#C2DBCB] rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#0F5B43] shadow-xs"
      >
        <div className="flex items-center gap-2 font-medium">
          <Clock className="w-4 h-4 text-[#0F5B43] shrink-0" />
          <span>
            Phiên tra cứu bảo mật tự động kết thúc sau:{' '}
            <strong className="font-mono text-sm text-[#0F5B43]">{formatTimer(secondsRemaining)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#486B5A] hidden md:inline">Không lưu thông tin cá nhân trên trình duyệt</span>
          <button
            type="button"
            onClick={onReset}
            className="font-bold underline hover:text-[#124C3B] transition-colors text-xs"
          >
            Tra cứu mới
          </button>
        </div>
      </div>

      {/* Checked Out Warning if applicable */}
      {isCheckedOut && (
        <div
          id="checked-out-notice"
          className="bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E] p-4 rounded-2xl flex items-center gap-3 text-sm"
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <strong className="font-bold">Lưu ý:</strong> Booking này đã kết thúc (Đã Check-out). Cảm ơn quý khách đã đồng hành cùng Lá Hotel!
          </div>
        </div>
      )}

      {/* Top Welcome Banner */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F1EC] text-[#0F5B43] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>🌿 LÁ HOTEL</span>
        </div>
        <h1 id="welcome-guest-heading" className="text-2xl sm:text-3xl font-bold text-[#0F5B43] font-display">
          Chào mừng quý khách, {booking.guestName}
        </h1>
        <p id="welcome-verified-status" className="text-sm sm:text-base text-[#466053]">
          Thông tin phòng của bạn đã được xác nhận tại <strong>{booking.branchName}</strong>
        </p>
      </div>

      {/* Grand Room Card */}
      <div
        id="grand-room-card"
        className="bg-gradient-to-br from-[#0F5B43] to-[#124C3B] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-[#2B8268]"
      >
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Room Number Hero */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8CD1B0] uppercase tracking-widest">
              <KeyRound className="w-4 h-4" />
              <span>PHÒNG CỦA BẠN</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span id="display-room-number" className="text-5xl sm:text-6xl font-extrabold tracking-tight font-display text-white">
                #{booking.roomNumber}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#C4E5D4] pt-1">
              <Building className="w-4 h-4 shrink-0 text-[#8CD1B0]" />
              <span>{booking.branchName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#A1C9B3]">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#8CD1B0]" />
              <span>{booking.branchAddress}</span>
            </div>
          </div>

          {/* Dates & Quick Meta */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-white/15 space-y-3 min-w-[240px]">
            <div className="flex items-center justify-between gap-4 text-xs pb-2 border-b border-white/10">
              <span className="text-[#A1C9B3] uppercase font-semibold">Check-In</span>
              <span id="display-checkin-date" className="font-bold text-sm text-white flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#8CD1B0]" />
                {formatDateDisplay(booking.checkInDate)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-[#A1C9B3] uppercase font-semibold">Check-Out</span>
              <span id="display-checkout-date" className="font-bold text-sm text-white flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#8CD1B0]" />
                {formatDateDisplay(booking.checkOutDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            id="btn-print-guide"
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D5E4DC] hover:border-[#0F5B43] text-[#2C483B] text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-[#0F5B43]" />
            <span>In hướng dẫn</span>
          </button>
          <a
            id="btn-call-hotel-help"
            href={`tel:${HOTEL_INFO.hotline}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F5B43] hover:bg-[#166E53] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Gọi hỗ trợ ({HOTEL_INFO.hotlineFormatted})</span>
          </a>
        </div>

        <button
          id="btn-lookup-again"
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF9F4] border border-[#D5E4DC] text-[#4A6456] hover:text-[#0F5B43] text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Tra cứu phòng khác</span>
        </button>
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* 1. HƯỚNG DẪN ĐẾN PHÒNG */}
        <div
          id="section-direction-guide"
          className="bg-white rounded-3xl p-6 shadow-sm border border-[#E0ECE4] space-y-3"
        >
          <div className="flex items-center gap-2.5 text-[#0F5B43] pb-2 border-b border-[#EEF5F1]">
            <div className="p-2 rounded-xl bg-[#E8F1EC]">
              <Footprints className="w-5 h-5 text-[#0F5B43]" />
            </div>
            <h3 className="font-bold text-base text-[#0F5B43]">🚶 Hướng dẫn đến phòng</h3>
          </div>
          <div className="text-sm text-[#2D4539] leading-relaxed whitespace-pre-line font-normal">
            {booking.instructions.directionToRoom || (
              <p className="text-[#7A9386] italic">Liên hệ quầy lễ tân để được hướng dẫn chi tiết.</p>
            )}
          </div>
        </div>

        {/* 2. WI-FI */}
        <div
          id="section-wifi-guide"
          className="bg-white rounded-3xl p-6 shadow-sm border border-[#E0ECE4] space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#EEF5F1]">
            <div className="flex items-center gap-2.5 text-[#0F5B43]">
              <div className="p-2 rounded-xl bg-[#E8F1EC]">
                <Wifi className="w-5 h-5 text-[#0F5B43]" />
              </div>
              <h3 className="font-bold text-base text-[#0F5B43]">📶 Kết nối Wi-Fi Miễn Phí</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="no-print inline-flex items-center gap-1 text-xs text-[#0F5B43] font-semibold hover:underline"
              title="Xem mã QR kết nối"
            >
              <QrCode className="w-4 h-4" />
              <span>Mã QR</span>
            </button>
          </div>

          <div className="space-y-3 bg-[#FAF9F4] p-4 rounded-2xl border border-[#E4EFE8]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5A7366] uppercase">Tên Wi-Fi:</span>
              <span id="wifi-name-text" className="font-mono font-bold text-sm text-[#0F5B43]">
                {booking.instructions.wifiName || 'LA_HOTEL_GUEST'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E8F1EC]">
              <span className="text-xs font-semibold text-[#5A7366] uppercase">Mật khẩu:</span>
              <div className="flex items-center gap-2">
                <span id="wifi-password-text" className="font-mono font-bold text-sm text-[#1F2924]">
                  {showWifiPassword ? booking.instructions.wifiPassword || 'lahotel2026' : '••••••••••••'}
                </span>
                <button
                  id="btn-toggle-wifi-pass"
                  type="button"
                  onClick={() => setShowWifiPassword(!showWifiPassword)}
                  className="p-1 rounded-md text-[#5A7366] hover:text-[#0F5B43] transition-colors"
                  title={showWifiPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showWifiPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="no-print flex items-center gap-2">
            <button
              id="btn-copy-wifi"
              type="button"
              onClick={handleCopyWifi}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#E8F1EC] hover:bg-[#D6E8DD] text-[#0F5B43] text-xs font-bold transition-colors"
            >
              {copiedWifi ? (
                <>
                  <Check className="w-4 h-4 text-[#0F5B43]" />
                  <span>Đã sao chép mật khẩu!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao chép mật khẩu Wi-Fi</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. THANG MÁY & CẦU THANG */}
        <div
          id="section-elevator-guide"
          className="bg-white rounded-3xl p-6 shadow-sm border border-[#E0ECE4] space-y-3"
        >
          <div className="flex items-center gap-2.5 text-[#0F5B43] pb-2 border-b border-[#EEF5F1]">
            <div className="p-2 rounded-xl bg-[#E8F1EC]">
              <Compass className="w-5 h-5 text-[#0F5B43]" />
            </div>
            <h3 className="font-bold text-base text-[#0F5B43]">🛗 Thang máy & Cầu thang</h3>
          </div>
          <div className="text-sm text-[#2D4539] leading-relaxed space-y-2">
            {booking.instructions.elevator && (
              <p>
                <strong>Thang máy:</strong> {booking.instructions.elevator}
              </p>
            )}
            {booking.instructions.stairs && (
              <p>
                <strong>Cầu thang:</strong> {booking.instructions.stairs}
              </p>
            )}
            {!booking.instructions.elevator && !booking.instructions.stairs && (
              <p className="text-[#7A9386] italic">Sử dụng thang máy tại sảnh trung tâm.</p>
            )}
          </div>
        </div>

        {/* 4. HƯỚNG DẪN BÃI XE */}
        <div
          id="section-parking-guide"
          className="bg-white rounded-3xl p-6 shadow-sm border border-[#E0ECE4] space-y-3"
        >
          <div className="flex items-center gap-2.5 text-[#0F5B43] pb-2 border-b border-[#EEF5F1]">
            <div className="p-2 rounded-xl bg-[#E8F1EC]">
              <Car className="w-5 h-5 text-[#0F5B43]" />
            </div>
            <h3 className="font-bold text-base text-[#0F5B43]">🚗 Hướng dẫn bãi xe</h3>
          </div>
          <div className="text-sm text-[#2D4539] leading-relaxed whitespace-pre-line">
            {booking.instructions.parking || (
              <p className="text-[#7A9386] italic">Bãi đỗ xe máy tại tầng hầm. Ô tô xin liên hệ bảo vệ trước cổng.</p>
            )}
          </div>
        </div>

        {/* 5. QUÀ TẶNG / ĐỒ MIỄN PHÍ */}
        <div
          id="section-complimentary-guide"
          className="bg-white rounded-3xl p-6 shadow-sm border border-[#E0ECE4] space-y-3"
        >
          <div className="flex items-center gap-2.5 text-[#0F5B43] pb-2 border-b border-[#EEF5F1]">
            <div className="p-2 rounded-xl bg-[#E8F1EC]">
              <Gift className="w-5 h-5 text-[#0F5B43]" />
            </div>
            <h3 className="font-bold text-base text-[#0F5B43]">🎁 Lá Hotel dành tặng bạn</h3>
          </div>
          <div className="text-sm text-[#2D4539] leading-relaxed whitespace-pre-line">
            {booking.instructions.complimentaryItems || (
              <p className="text-[#7A9386] italic">Nước khoáng, trà và tiện ích miễn phí có sẵn trong phòng.</p>
            )}
          </div>
        </div>

        {/* 6. THÔNG TIN TRONG PHÒNG */}
        <div
          id="section-room-guide"
          className="bg-white rounded-3xl p-6 shadow-sm border border-[#E0ECE4] space-y-3"
        >
          <div className="flex items-center gap-2.5 text-[#0F5B43] pb-2 border-b border-[#EEF5F1]">
            <div className="p-2 rounded-xl bg-[#E8F1EC]">
              <BedDouble className="w-5 h-5 text-[#0F5B43]" />
            </div>
            <h3 className="font-bold text-base text-[#0F5B43]">🛏 Thông tin trong phòng</h3>
          </div>
          <div className="text-sm text-[#2D4539] leading-relaxed whitespace-pre-line">
            {booking.instructions.roomInstructions || (
              <p className="text-[#7A9386] italic">Trang thiết bị điều hòa, nước nóng và Smart TV đã sẵn sàng phục vụ.</p>
            )}
          </div>
        </div>
      </div>

      {/* 7. LƯU Ý QUAN TRỌNG */}
      {booking.instructions.importantNotes && (
        <div
          id="section-important-notes"
          className="bg-[#FAF9F4] rounded-3xl p-6 border border-[#DFECE3] space-y-2"
        >
          <div className="flex items-center gap-2 text-[#0F5B43]">
            <Info className="w-5 h-5 text-[#0F5B43]" />
            <h4 className="font-bold text-sm sm:text-base">📌 Lưu ý quan trọng</h4>
          </div>
          <div className="text-sm text-[#385144] leading-relaxed whitespace-pre-line pl-7">
            {booking.instructions.importantNotes}
          </div>
        </div>
      )}

      {/* QR Code Modal for Wi-Fi */}
      {showQrModal && (
        <div
          id="wifi-qr-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-[#D5E4DC]">
            <div className="p-3 bg-[#E8F1EC] rounded-2xl inline-block text-[#0F5B43]">
              <Wifi className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-[#0F5B43]">Kết Nối Wi-Fi Nhanh</h3>
            <p className="text-xs text-[#526D5F]">
              Mở máy ảnh điện thoại và quét mã QR bên dưới để tự động kết nối Wi-Fi phòng:
            </p>

            {/* Generated QR Code display */}
            <div className="p-4 bg-[#FAF9F4] rounded-2xl inline-block border border-[#E0ECE4]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=WIFI:T:WPA;S:${encodeURIComponent(
                  booking.instructions.wifiName || 'LA_HOTEL_GUEST'
                )};P:${encodeURIComponent(booking.instructions.wifiPassword || 'lahotel2026')};;`}
                alt="Wi-Fi QR Code"
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <div className="text-xs text-[#385144]">
              SSID: <strong>{booking.instructions.wifiName || 'LA_HOTEL_GUEST'}</strong>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#0F5B43] text-white text-xs font-bold hover:bg-[#156E52] transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
