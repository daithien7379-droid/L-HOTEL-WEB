import React from 'react';
import { Booking } from '../../types';
import { X, ShieldCheck, FileText, Calendar, User, KeyRound } from 'lucide-react';

interface AdminDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const AdminDocumentModal: React.FC<AdminDocumentModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  if (!isOpen || !booking) return null;

  const docs = booking.identityDocuments;
  const isPassport = booking.identityType === 'PASSPORT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#D5E4DC] animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#0F5B43] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Hồ Sơ Giấy Tờ Tùy Thân</h3>
              <p className="text-xs text-white/80">
                {isPassport ? 'Hộ Chiếu (Passport)' : 'Căn Cước Công Dân (CCCD)'} • Khách: {booking.guestName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info summary strip */}
        <div className="bg-[#FAF9F4] px-6 py-3 border-b border-[#EEF5F1] flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 text-[#354D41]">
            <User className="w-3.5 h-3.5 text-[#0F5B43]" />
            <span>Mã Booking: <strong className="font-mono text-[#0F5B43]">{booking.bookingCode}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-[#354D41]">
            <KeyRound className="w-3.5 h-3.5 text-[#0F5B43]" />
            <span>Phòng: <strong>#{booking.roomNumber}</strong></span>
          </div>
          {docs?.uploadedAt && (
            <div className="flex items-center gap-2 text-[#6B8577]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Tải lên lúc: {new Date(docs.uploadedAt).toLocaleString('vi-VN')}</span>
            </div>
          )}
        </div>

        {/* Photos display */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {!docs || (!docs.frontImageUrl && !docs.backImageUrl && !docs.passportImageUrl) ? (
            <div className="text-center py-10 text-[#718B7D]">
              <FileText className="w-12 h-12 mx-auto mb-3 text-[#A2B8AC] stroke-[1.5]" />
              <p className="font-semibold text-sm">Chưa có ảnh giấy tờ tùy thân được tải lên.</p>
              <p className="text-xs mt-1">Khách hàng chưa thực hiện bước chụp ảnh CCCD / Passport.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {isPassport ? (
                /* Passport View */
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0F5B43]">
                      Trang Thông Tin Hộ Chiếu (Passport)
                    </span>
                    <span className="text-[11px] text-[#6A8577] bg-[#E8F1EC] px-2 py-0.5 rounded-md font-medium">
                      Bản chụp trực tiếp
                    </span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-[#D5E4DC] bg-slate-900 flex items-center justify-center min-h-[220px]">
                    <img
                      src={docs.passportImageUrl || docs.frontImageUrl}
                      alt="Passport"
                      referrerPolicy="no-referrer"
                      className="max-h-[380px] w-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                /* CCCD 2 Sides View */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Front Side */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0F5B43]">
                        CCCD Mặt Trước
                      </span>
                      <span className="text-[11px] text-[#6A8577] bg-[#E8F1EC] px-2 py-0.5 rounded-md font-medium">
                        Có ảnh chân dung
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-[#D5E4DC] bg-slate-900 flex items-center justify-center min-h-[180px]">
                      {docs.frontImageUrl ? (
                        <img
                          src={docs.frontImageUrl}
                          alt="CCCD Mặt trước"
                          referrerPolicy="no-referrer"
                          className="max-h-[260px] w-full object-contain"
                        />
                      ) : (
                        <div className="text-white/60 text-xs py-8">Chưa có ảnh mặt trước</div>
                      )}
                    </div>
                  </div>

                  {/* Back Side */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0F5B43]">
                        CCCD Mặt Sau
                      </span>
                      <span className="text-[11px] text-[#6A8577] bg-[#E8F1EC] px-2 py-0.5 rounded-md font-medium">
                        Có chip / đặc điểm
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-[#D5E4DC] bg-slate-900 flex items-center justify-center min-h-[180px]">
                      {docs.backImageUrl ? (
                        <img
                          src={docs.backImageUrl}
                          alt="CCCD Mặt sau"
                          referrerPolicy="no-referrer"
                          className="max-h-[260px] w-full object-contain"
                        />
                      ) : (
                        <div className="text-white/60 text-xs py-8">Chưa có ảnh mặt sau</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#0F5B43] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <p>
                  Thông tin hình ảnh được bảo mật theo tiêu chuẩn quy định lưu trú khách sạn Lá Hotel và chỉ quản trị viên có quyền truy cập.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF9F4] px-6 py-3.5 border-t border-[#EEF5F1] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0F5B43] hover:bg-[#0D4E3A] text-white text-xs font-bold transition-colors"
          >
            Đóng Lại
          </button>
        </div>
      </div>
    </div>
  );
};
