import React, { useState } from 'react';
import { GuestVerificationRequest, SafeGuestBooking } from '../../types';
import { verifyGuest } from '../../services/api';
import { HOTEL_INFO } from '../../data/branches';
import { DemoSelectorModal } from './DemoSelectorModal';
import {
  Search,
  User,
  Hash,
  CreditCard,
  Calendar,
  AlertCircle,
  Loader2,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface LookupFormProps {
  onSuccess: (booking: SafeGuestBooking, sessionToken: string, expiresAt: string) => void;
}

export const LookupForm: React.FC<LookupFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<GuestVerificationRequest>({
    guestName: '',
    bookingCode: '',
    identityNumber: '',
    checkInDate: '',
    checkOutDate: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleChange = (field: keyof GuestVerificationRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleQuickFillPrimaryDemo = () => {
    setFormData({
      guestName: 'Nguyễn Văn A',
      bookingCode: 'LA20260819001',
      identityNumber: 'DEMO-079123456789',
      checkInDate: '2026-08-19',
      checkOutDate: '2026-08-20',
    });
    setErrorMessage(null);
  };

  const handleApplyDemoBooking = (demo: GuestVerificationRequest) => {
    setFormData(demo);
    setErrorMessage(null);
  };

  const handleResetForm = () => {
    setFormData({
      guestName: '',
      bookingCode: '',
      identityNumber: '',
      checkInDate: '',
      checkOutDate: '',
    });
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side quick check
    if (
      !formData.guestName.trim() ||
      !formData.bookingCode.trim() ||
      !formData.identityNumber.trim() ||
      !formData.checkInDate ||
      !formData.checkOutDate
    ) {
      setErrorMessage('Vui lòng nhập đầy đủ tất cả 5 thông tin tra cứu bên dưới.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifyGuest(formData);

      if (res.success && res.data && res.sessionToken && res.expiresAt) {
        onSuccess(res.data, res.sessionToken, res.expiresAt);
      } else {
        setIsRateLimited(!!res.isRateLimited);
        setErrorMessage(
          res.message ||
            'Thông tin chưa khớp. Vui lòng kiểm tra lại thông tin hoặc liên hệ Lá Hotel để được hỗ trợ.'
        );
      }
    } catch {
      setErrorMessage('Hệ thống đang bận. Vui lòng thử lại sau giây lát hoặc liên hệ hotline Lá Hotel.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="lookup-form-container" className="max-w-xl mx-auto px-4 pb-12">
      {/* Card wrapper */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#DFECE4] relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8F1EC] rounded-bl-full -z-0 opacity-60 pointer-events-none"></div>

        {/* Top Header inside Form */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-6 pb-4 border-b border-[#EEF5F1]">
          <div>
            <h2 id="lookup-card-title" className="text-lg sm:text-xl font-bold text-[#0F5B43] flex items-center gap-2">
              <Search className="w-5 h-5 text-[#0F5B43]" />
              Tra Cứu Thông Tin Nhận Phòng
            </h2>
            <p className="text-xs text-[#627A6E] mt-0.5">Nhập chính xác 5 trường thông tin để xác thực</p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="btn-open-demo-selector"
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#E8F1EC] hover:bg-[#D7E8DD] text-[#0F5B43] text-xs font-semibold border border-[#C6DDD0] transition-colors shadow-xs"
              title="Xem danh sách 10 booking mẫu"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0F5B43]" />
              <span className="hidden sm:inline">Dữ liệu</span> Mẫu
            </button>
          </div>
        </div>

        {/* Demo Fast-Fill Alert Pill */}
        <div className="relative z-10 mb-6 p-3 rounded-2xl bg-[#FAF9F4] border border-[#E2EAE5] flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 text-[#466052]">
            <ShieldCheck className="w-4 h-4 text-[#0F5B43] shrink-0" />
            <span>
              Mẫu thử nhanh: <strong>Nguyễn Văn A</strong> (Mã: <strong>LA20260819001</strong>)
            </span>
          </div>
          <button
            id="btn-quick-fill-sample"
            type="button"
            onClick={handleQuickFillPrimaryDemo}
            className="font-bold text-[#0F5B43] hover:underline whitespace-nowrap px-2 py-1 rounded bg-[#E8F1EC]"
          >
            Điền nhanh
          </button>
        </div>

        {/* Generic or Rate Limit Error Banner */}
        {errorMessage && (
          <div
            id="lookup-error-banner"
            className={`relative z-10 mb-6 p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
              isRateLimited
                ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]'
                : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
            }`}
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-current" />
            <div className="text-sm space-y-2 flex-1">
              <p className="font-semibold">{errorMessage}</p>
              <div className="flex items-center gap-3 pt-1">
                <a
                  id="btn-error-call-hotline"
                  href={`tel:${HOTEL_INFO.hotline}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white shadow-xs border border-current text-xs font-bold hover:bg-black/5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Gọi Hotline: {HOTEL_INFO.hotlineFormatted}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Main 5-Field Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          {/* 1. HỌ VÀ TÊN */}
          <div>
            <label htmlFor="guestName" className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1.5">
              1. Họ và Tên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D9487]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="guestName"
                type="text"
                value={formData.guestName}
                onChange={(e) => handleChange('guestName', e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                autoComplete="name"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white focus:ring-2 focus:ring-[#0F5B43]/15 rounded-xl text-sm font-medium text-[#1F2924] placeholder-[#90A79B] transition-all outline-none"
              />
            </div>
          </div>

          {/* 2. MÃ ĐẶT PHÒNG */}
          <div>
            <label htmlFor="bookingCode" className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1.5">
              2. Mã Đặt Phòng (Booking Code) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D9487]">
                <Hash className="w-4 h-4" />
              </div>
              <input
                id="bookingCode"
                type="text"
                value={formData.bookingCode}
                onChange={(e) => handleChange('bookingCode', e.target.value.toUpperCase())}
                placeholder="Ví dụ: LA20260819001"
                autoCapitalize="characters"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white focus:ring-2 focus:ring-[#0F5B43]/15 rounded-xl text-sm font-mono font-bold text-[#0F5B43] placeholder-[#90A79B] transition-all outline-none uppercase"
              />
            </div>
            <p className="text-[11px] text-[#7A9386] mt-1">Mã đặt phòng do khách sạn gửi qua tin nhắn / email / OTA</p>
          </div>

          {/* 3. CCCD / PASSPORT */}
          <div>
            <label htmlFor="identityNumber" className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1.5">
              3. Số CCCD / Hộ Chiếu (Passport) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D9487]">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                id="identityNumber"
                type="text"
                value={formData.identityNumber}
                onChange={(e) => handleChange('identityNumber', e.target.value)}
                placeholder="Nhập số CCCD hoặc Passport đã đăng ký"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white focus:ring-2 focus:ring-[#0F5B43]/15 rounded-xl text-sm font-mono text-[#1F2924] placeholder-[#90A79B] transition-all outline-none"
              />
            </div>
            <p className="text-[11px] text-[#7A9386] mt-1">Hệ thống chỉ dùng để đối chiếu server-side, cam kết bảo mật tuyệt đối</p>
          </div>

          {/* 4 & 5. CHECK-IN & CHECK-OUT DATES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Check-in */}
            <div>
              <label htmlFor="checkInDate" className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1.5">
                4. Ngày Check-In <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D9487]">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="checkInDate"
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => handleChange('checkInDate', e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white focus:ring-2 focus:ring-[#0F5B43]/15 rounded-xl text-sm font-medium text-[#1F2924] transition-all outline-none"
                />
              </div>
            </div>

            {/* Check-out */}
            <div>
              <label htmlFor="checkOutDate" className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1.5">
                5. Ngày Check-Out <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D9487]">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="checkOutDate"
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => handleChange('checkOutDate', e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white focus:ring-2 focus:ring-[#0F5B43]/15 rounded-xl text-sm font-medium text-[#1F2924] transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
            <button
              id="btn-submit-lookup"
              type="submit"
              disabled={isLoading}
              className="w-full flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F5B43] hover:bg-[#156E52] text-white font-bold text-base tracking-wide shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang kiểm tra thông tin...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>TRA CỨU THÔNG TIN PHÒNG</span>
                </>
              )}
            </button>

            <button
              id="btn-reset-form"
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto px-4 py-3.5 rounded-xl border border-[#D5E2DA] hover:bg-[#FAF9F4] text-[#526D60] hover:text-[#0F5B43] text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="Xóa trắng form"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="sm:hidden">Làm mới</span>
            </button>
          </div>
        </form>
      </div>

      {/* Demo Selector Modal */}
      <DemoSelectorModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectBooking={handleApplyDemoBooking}
      />
    </div>
  );
};
