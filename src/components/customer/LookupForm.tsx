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
  RotateCcw,
  CheckCircle,
} from 'lucide-react';

interface LookupFormProps {
  onSuccess: (booking: SafeGuestBooking, sessionToken: string, expiresAt: string) => void;
  onRequiresIdentity: (sessionToken: string, guestName: string, bookingCode: string, expiresAt: string) => void;
}

export const LookupForm: React.FC<LookupFormProps> = ({ onSuccess, onRequiresIdentity }) => {
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

  const hasName = Boolean(formData.guestName && formData.guestName.trim());
  const hasCode = Boolean(formData.bookingCode && formData.bookingCode.trim());
  const hasIdentity = Boolean(formData.identityNumber && formData.identityNumber.trim());
  const hasCheckIn = Boolean(formData.checkInDate && formData.checkInDate.trim());
  const hasCheckOut = Boolean(formData.checkOutDate && formData.checkOutDate.trim());
  const hasDates = hasCheckIn && hasCheckOut;

  const filledGroupsCount =
    (hasName ? 1 : 0) +
    (hasCode ? 1 : 0) +
    (hasIdentity ? 1 : 0) +
    (hasDates ? 1 : 0);

  const handleQuickFillPrimaryDemo = (mode: 'full' | 'name_code' | 'code_dates') => {
    if (mode === 'name_code') {
      setFormData({
        guestName: 'Nguyễn Văn A',
        bookingCode: 'LA20260819001',
        identityNumber: '',
        checkInDate: '',
        checkOutDate: '',
      });
    } else if (mode === 'code_dates') {
      setFormData({
        guestName: '',
        bookingCode: 'LA20260819001',
        identityNumber: '',
        checkInDate: '2026-08-19',
        checkOutDate: '2026-08-20',
      });
    } else {
      setFormData({
        guestName: 'Nguyễn Văn A',
        bookingCode: 'LA20260819001',
        identityNumber: 'DEMO-079123456789',
        checkInDate: '2026-08-19',
        checkOutDate: '2026-08-20',
      });
    }
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

    // Check date group consistency
    if ((hasCheckIn && !hasCheckOut) || (!hasCheckIn && hasCheckOut)) {
      setErrorMessage('Nếu sử dụng thông tin ngày lưu trú, vui lòng nhập cả ngày Check-in và Check-out.');
      return;
    }

    // Check at least 2 groups
    if (filledGroupsCount < 2) {
      setErrorMessage('Vui lòng nhập ít nhất 2 trong 4 nhóm thông tin bên dưới để tra cứu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload: GuestVerificationRequest = {};
      if (hasName) payload.guestName = formData.guestName;
      if (hasCode) payload.bookingCode = formData.bookingCode;
      if (hasIdentity) payload.identityNumber = formData.identityNumber;
      if (hasDates) {
        payload.checkInDate = formData.checkInDate;
        payload.checkOutDate = formData.checkOutDate;
      }

      const res = await verifyGuest(payload);

      if (res.success) {
        if (res.requiresIdentity && res.sessionToken && res.expiresAt) {
          onRequiresIdentity(
            res.sessionToken,
            res.guestName || formData.guestName || 'Quý khách',
            res.bookingCode || formData.bookingCode || '',
            res.expiresAt
          );
        } else if (res.data && res.sessionToken && res.expiresAt) {
          onSuccess(res.data, res.sessionToken, res.expiresAt);
        } else {
          setErrorMessage(res.message || 'Thông tin tra cứu chưa hợp lệ.');
        }
      } else {
        setIsRateLimited(Boolean(res.isRateLimited));
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
        {/* Top Header inside Form */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-5 pb-4 border-b border-[#EEF5F1]">
          <div>
            <h2 id="lookup-card-title" className="text-lg sm:text-xl font-bold text-[#0F5B43] flex items-center gap-2">
              <Search className="w-5 h-5 text-[#0F5B43]" />
              Tra Cứu Thông Tin Nhận Phòng
            </h2>
            <p className="text-xs text-[#627A6E] mt-0.5">
              Nhập bất kỳ <strong>2 trong 4</strong> thông tin bên dưới
            </p>
          </div>

          <button
            id="btn-open-demo-selector"
            type="button"
            onClick={() => setIsDemoModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E8F1EC] hover:bg-[#D7E8DD] text-[#0F5B43] text-xs font-semibold border border-[#C6DDD0] transition-colors shadow-xs"
            title="Xem danh sách 10 booking mẫu"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0F5B43]" />
            <span>Dữ liệu mẫu</span>
          </button>
        </div>

        {/* 2/4 Requirement Status Indicator Bar */}
        <div className="relative z-10 mb-5 p-3 rounded-2xl bg-[#FAF9F4] border border-[#E2EAE5]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-[#2E4A3D] flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${filledGroupsCount >= 2 ? 'bg-[#0F5B43]' : 'bg-[#D97706]'}`}></span>
              Tiến độ nhập: {filledGroupsCount}/4 nhóm thông tin
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              filledGroupsCount >= 2
                ? 'bg-[#E8F1EC] text-[#0F5B43]'
                : 'bg-[#FEF3C7] text-[#92400E]'
            }`}>
              {filledGroupsCount >= 2 ? '✓ Đủ điều kiện tra cứu' : 'Cần tối thiểu 2 nhóm'}
            </span>
          </div>

          {/* Quick test buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E8F0EB] text-[11px]">
            <span className="text-[#6C8477]">Thử nhanh 2 nhóm:</span>
            <button
              type="button"
              onClick={() => handleQuickFillPrimaryDemo('name_code')}
              className="px-2 py-0.5 rounded bg-white border border-[#D5E4DC] text-[#0F5B43] font-medium hover:bg-[#E8F1EC]"
            >
              Tên + Mã Đặt Phòng
            </button>
            <button
              type="button"
              onClick={() => handleQuickFillPrimaryDemo('code_dates')}
              className="px-2 py-0.5 rounded bg-white border border-[#D5E4DC] text-[#0F5B43] font-medium hover:bg-[#E8F1EC]"
            >
              Mã + Ngày Lưu Trú
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div
            id="lookup-error-banner"
            className={`relative z-10 mb-5 p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
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

        {/* 4 Groups Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          {/* Nhóm 1: TÊN KHÁCH */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            hasName ? 'bg-[#F4F9F6] border-[#0F5B43]/30' : 'bg-[#FAF9F4] border-[#E2EAE5]'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="guestName" className="text-xs font-bold uppercase tracking-wider text-[#354D41]">
                1. Họ và Tên Khách
              </label>
              {hasName && (
                <span className="text-[11px] font-semibold text-[#0F5B43] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Đã nhập
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D9487]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="guestName"
                type="text"
                value={formData.guestName || ''}
                onChange={(e) => handleChange('guestName', e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                autoComplete="name"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5E4DC] focus:border-[#0F5B43] focus:ring-2 focus:ring-[#0F5B43]/15 rounded-xl text-sm font-medium text-[#1F2924] placeholder-[#90A79B] transition-all outline-none"
              />
            </div>
          </div>

          {/* Nhóm 2: MÃ ĐẶT PHÒNG */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            hasCode ? 'bg-[#F4F9F6] border-[#0F5B43]/30' : 'bg-[#FAF9F4] border-[#E2EAE5]'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="bookingCode" className="text-xs font-bold uppercase tracking-wider text-[#354D41]">
                2. Mã Đặt Phòng (Booking Code)
              </label>
              {hasCode && (
                <span className="text-[11px] font-semibold text-[#0F5B43] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Đã nhập
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D9487]">
                <Hash className="w-4 h-4" />
              </div>
              <input
                id="bookingCode"
                type="text"
                value={formData.bookingCode || ''}
                onChange={(e) => handleChange('bookingCode', e.target.value.toUpperCase())}
                placeholder="Ví dụ: LA20260819001"
                autoCapitalize="characters"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5E4DC] focus:border-[#0F5B43] focus:ring-2 focus:ring-[#0F5B43]/15 rounded-xl text-sm font-mono font-bold text-[#0F5B43] placeholder-[#90A79B] transition-all outline-none uppercase"
              />
            </div>
          </div>

          {/* Nhóm 3: CCCD / PASSPORT */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            hasIdentity ? 'bg-[#F4F9F6] border-[#0F5B43]/30' : 'bg-[#FAF9F4] border-[#E2EAE5]'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="identityNumber" className="text-xs font-bold uppercase tracking-wider text-[#354D41]">
                3. Số CCCD / Hộ Chiếu (Passport)
              </label>
              {hasIdentity && (
                <span className="text-[11px] font-semibold text-[#0F5B43] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Đã nhập
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D9487]">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                id="identityNumber"
                type="text"
                value={formData.identityNumber || ''}
                onChange={(e) => handleChange('identityNumber', e.target.value)}
                placeholder="Ví dụ: 079123456789 hoặc Passport"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5E4DC] focus:border-[#0F5B43] focus:ring-2 focus:ring-[#0F5B43]/15 rounded-xl text-sm font-mono text-[#1F2924] placeholder-[#90A79B] transition-all outline-none"
              />
            </div>
          </div>

          {/* Nhóm 4: NGÀY LƯU TRÚ (Check-in & Check-out) */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            hasDates ? 'bg-[#F4F9F6] border-[#0F5B43]/30' : 'bg-[#FAF9F4] border-[#E2EAE5]'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#354D41]">
                4. Ngày Lưu Trú (Check-In & Check-Out)
              </span>
              {hasDates ? (
                <span className="text-[11px] font-semibold text-[#0F5B43] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Đã nhập đủ 2 ngày
                </span>
              ) : (hasCheckIn || hasCheckOut) ? (
                <span className="text-[11px] font-semibold text-[#D97706]">
                  Cần nhập cả 2 ngày
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Check-in */}
              <div>
                <label htmlFor="checkInDate" className="block text-[11px] font-medium text-[#526D60] mb-1">
                  Ngày Check-In
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7D9487]">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="checkInDate"
                    type="date"
                    value={formData.checkInDate || ''}
                    onChange={(e) => handleChange('checkInDate', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#D5E4DC] focus:border-[#0F5B43] focus:ring-2 focus:ring-[#0F5B43]/15 rounded-xl text-xs sm:text-sm font-medium text-[#1F2924] transition-all outline-none"
                  />
                </div>
              </div>

              {/* Check-out */}
              <div>
                <label htmlFor="checkOutDate" className="block text-[11px] font-medium text-[#526D60] mb-1">
                  Ngày Check-Out
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7D9487]">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="checkOutDate"
                    type="date"
                    value={formData.checkOutDate || ''}
                    onChange={(e) => handleChange('checkOutDate', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#D5E4DC] focus:border-[#0F5B43] focus:ring-2 focus:ring-[#0F5B43]/15 rounded-xl text-xs sm:text-sm font-medium text-[#1F2924] transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              id="btn-submit-lookup"
              type="submit"
              disabled={isLoading || filledGroupsCount < 2}
              className="w-full flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F5B43] hover:bg-[#156E52] text-white font-bold text-sm sm:text-base tracking-wide shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang kiểm tra thông tin...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>TRA CỨU THÔNG TIN NHẬN PHÒNG</span>
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
              <span>Làm mới</span>
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
