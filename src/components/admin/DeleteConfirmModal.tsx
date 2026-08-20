import React, { useState } from 'react';
import { Booking } from '../../types';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
  onConfirmDelete: (id: string) => Promise<boolean>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  booking,
  onClose,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await onConfirmDelete(booking.id);
    setIsDeleting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div
      id="delete-confirm-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="delete-confirm-modal"
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#FCA5A5] text-center space-y-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 id="delete-modal-title" className="text-lg font-bold text-[#1F2924]">
            Bạn có chắc chắn muốn xóa thông tin này?
          </h3>
          <p className="text-xs text-[#526D60]">
            Hành động này sẽ xóa vĩnh viễn dữ liệu đặt phòng của khách:
          </p>
        </div>

        <div className="p-3.5 bg-[#FAF9F4] rounded-2xl border border-[#E8F1EC] text-left text-xs space-y-1">
          <div>
            Khách: <strong>{booking.guestName}</strong>
          </div>
          <div>
            Mã booking: <strong className="font-mono text-[#0F5B43]">{booking.bookingCode}</strong>
          </div>
          <div>
            Phòng: <strong>#{booking.roomNumber}</strong> | Trạng thái: <strong>{booking.status}</strong>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            id="btn-cancel-delete"
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-[#D5E2DA] text-[#526D60] text-xs font-bold hover:bg-[#FAF9F4] transition-colors"
          >
            HỦY
          </button>
          <button
            id="btn-confirm-delete"
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-colors inline-flex items-center justify-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>XÓA</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
