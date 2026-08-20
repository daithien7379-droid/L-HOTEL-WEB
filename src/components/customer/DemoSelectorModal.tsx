import React from 'react';
import { INITIAL_DEMO_BOOKINGS } from '../../data/initialData';
import { BRANCHES } from '../../data/branches';
import { Booking, GuestVerificationRequest } from '../../types';
import { Sparkles, X, CheckCircle2, ArrowRight, User, Calendar, Hash, FileText } from 'lucide-react';

interface DemoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBooking: (req: GuestVerificationRequest) => void;
}

export const DemoSelectorModal: React.FC<DemoSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectBooking,
}) => {
  if (!isOpen) return null;

  const handleSelect = (b: Booking) => {
    onSelectBooking({
      guestName: b.guestName,
      bookingCode: b.bookingCode,
      identityNumber: b.identityNumber,
      checkInDate: b.checkInDate,
      checkOutDate: b.checkOutDate,
    });
    onClose();
  };

  return (
    <div
      id="demo-selector-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="demo-selector-modal"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#D8E6DE] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0F5B43] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10">
              <Sparkles className="w-5 h-5 text-[#8CD1B0]" />
            </div>
            <div>
              <h3 id="demo-modal-title" className="font-bold text-base sm:text-lg">
                Dữ Liệu Đặt Phòng Mẫu (Demo)
              </h3>
              <p className="text-xs text-[#C5E2D4]">
                Chọn một booking mẫu để tự động điền nhanh 5 trường thông tin kiểm tra
              </p>
            </div>
          </div>
          <button
            id="btn-close-demo-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#C5E2D4] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 overflow-y-auto divide-y divide-[#EBF2EE] space-y-3">
          <div className="p-3 bg-[#FAF9F4] rounded-xl border border-[#E0ECE5] text-xs text-[#3E564A] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0F5B43] shrink-0" />
            <span>
              Tất cả 10 booking dưới đây đã được nạp sẵn trên máy chủ để bạn kiểm tra toàn bộ luồng tra cứu.
            </span>
          </div>

          <div className="pt-2 space-y-2.5">
            {INITIAL_DEMO_BOOKINGS.map((b) => {
              const branch = BRANCHES.find((br) => br.id === b.branchId);
              const isSampleTarget = b.bookingCode === 'LA20260819001';

              return (
                <div
                  key={b.id}
                  id={`demo-card-${b.bookingCode}`}
                  onClick={() => handleSelect(b)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSampleTarget
                      ? 'border-[#0F5B43] bg-[#F2F8F4] ring-1 ring-[#0F5B43]'
                      : 'border-[#E0ECE5] bg-white hover:border-[#0F5B43]'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#1F2924] flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#0F5B43]" />
                        {b.guestName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E8F1EC] text-[#0F5B43]">
                        Phòng {b.roomNumber}
                      </span>
                      {isSampleTarget && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#0F5B43] text-white">
                          ★ Booking Mẫu Chuẩn
                        </span>
                      )}
                      <span className="text-xs text-[#6A8275]">{branch?.code}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-[#4F675B]">
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-[#7B9588]" />
                        <span className="font-mono">{b.bookingCode}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[#7B9588]" />
                        <span className="font-mono">{b.identityNumber}</span>
                      </div>
                      <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
                        <Calendar className="w-3 h-3 text-[#7B9588]" />
                        <span>
                          {b.checkInDate} → {b.checkOutDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F5B43] text-white text-xs font-semibold hover:bg-[#166E53] shrink-0 self-end sm:self-center"
                  >
                    <span>Điền mẫu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#FAF9F4] border-t border-[#E8F1EC] text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#52635A] hover:bg-[#EAE8DE] transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
