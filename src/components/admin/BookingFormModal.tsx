import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, Branch } from '../../types';
import { BRANCHES } from '../../data/branches';
import {
  X,
  Save,
  Eye,
  FileEdit,
  Footprints,
  Compass,
  Car,
  Gift,
  Wifi,
  BedDouble,
  Info,
  Calendar,
  Building,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingData: Partial<Booking>) => Promise<boolean>;
  initialBooking?: Booking | null;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBooking,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'instructions' | 'preview'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [branchId, setBranchId] = useState('cn-7');
  const [guestName, setGuestName] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomPassword, setRoomPassword] = useState('8899#');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID'>('PAID');
  const [paymentAmount, setPaymentAmount] = useState<number>(750000);
  const [status, setStatus] = useState<BookingStatus>('ACTIVE');

  // Instructions states
  const [directionToRoom, setDirectionToRoom] = useState('');
  const [elevator, setElevator] = useState('');
  const [stairs, setStairs] = useState('');
  const [parking, setParking] = useState('');
  const [complimentaryItems, setComplimentaryItems] = useState('');
  const [roomInstructions, setRoomInstructions] = useState('');
  const [wifiName, setWifiName] = useState('LA_HOTEL_GUEST');
  const [wifiPassword, setWifiPassword] = useState('lahotel2026');
  const [importantNotes, setImportantNotes] = useState('');

  useEffect(() => {
    if (initialBooking) {
      setBranchId(initialBooking.branchId || 'cn-7');
      setGuestName(initialBooking.guestName || '');
      setIdentityNumber(initialBooking.identityNumber || '');
      setBookingCode(initialBooking.bookingCode || '');
      setCheckInDate(initialBooking.checkInDate || '');
      setCheckOutDate(initialBooking.checkOutDate || '');
      setRoomNumber(initialBooking.roomNumber || '');
      setRoomPassword(initialBooking.roomPassword || '8899#');
      setPaymentStatus(initialBooking.paymentStatus || 'PAID');
      setPaymentAmount(initialBooking.paymentAmount || 750000);
      setStatus(initialBooking.status || 'ACTIVE');

      setDirectionToRoom(initialBooking.instructions?.directionToRoom || '');
      setElevator(initialBooking.instructions?.elevator || '');
      setStairs(initialBooking.instructions?.stairs || '');
      setParking(initialBooking.instructions?.parking || '');
      setComplimentaryItems(initialBooking.instructions?.complimentaryItems || '');
      setRoomInstructions(initialBooking.instructions?.roomInstructions || '');
      setWifiName(initialBooking.instructions?.wifiName || 'LA_HOTEL_GUEST');
      setWifiPassword(initialBooking.instructions?.wifiPassword || 'lahotel2026');
      setImportantNotes(initialBooking.instructions?.importantNotes || '');
    } else {
      // Defaults for new booking
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];
      const randomNum = Math.floor(100 + Math.random() * 900);

      setBranchId('cn-7');
      setGuestName('');
      setIdentityNumber('');
      setBookingCode(`LA${today.replace(/-/g, '')}${randomNum}`);
      setCheckInDate(today);
      setCheckOutDate(tomorrow);
      setRoomNumber('502');
      setRoomPassword('8899#');
      setPaymentStatus('PAID');
      setPaymentAmount(750000);
      setStatus('ACTIVE');

      setDirectionToRoom(
        'Bước 1: Từ sảnh lễ tân, đi thẳng qua hành lang vườn cây xanh.\nBước 2: Sử dụng thang máy chính lên Tầng 5.\nBước 3: Rẽ tay phải, phòng 502 nằm ở cuối hành lang bên trái.'
      );
      setElevator('Thang máy nằm ngay sau quầy sảnh chính bên tay trái.');
      setStairs('Cầu thang bộ thoát hiểm nằm bên cạnh thang máy.');
      setParking('Bãi đỗ xe máy miễn phí tại tầng hầm B1. Ô tô đỗ tại sân trước khách sạn.');
      setComplimentaryItems('• 02 chai nước suối khoáng Lá Eco\n• 01 đĩa bánh quy dừa bến tre đặc sản\n• Trà thảo mộc hoa cúc và cà phê phin cao cấp');
      setRoomInstructions('• Điều hòa: Nhiệt độ tối ưu 24-26°C.\n• Nước nóng: Bật công tắc trước 5 phút.\n• Smart TV: Đã kết nối sẵn YouTube và Netflix.');
      setWifiName('LA_HOTEL_PHUNHUAN_T5');
      setWifiPassword('lahotelphunhuan');
      setImportantNotes('• Khách sạn theo phong cách không gian xanh, xin quý khách không hút thuốc trong phòng.\n• Giờ trả phòng tiêu chuẩn: 12:00 trưa.');
    }
    setFormError(null);
    setActiveTab('basic');
  }, [initialBooking, isOpen]);

  if (!isOpen) return null;

  const currentBranch: Branch = BRANCHES.find((b) => b.id === branchId) || BRANCHES[0];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim() || !bookingCode.trim() || !checkInDate || !checkOutDate || !roomNumber.trim()) {
      setFormError('Vui lòng nhập đầy đủ các thông tin bắt buộc (Tên khách, Mã booking, Ngày lưu trú, Số phòng)!');
      setActiveTab('basic');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const hasId = Boolean(identityNumber.trim());

    const payload: Partial<Booking> = {
      branchId,
      guestName: guestName.trim(),
      identityNumber: identityNumber.trim(),
      identityStatus: hasId
        ? initialBooking?.identityStatus === 'UPLOADED'
          ? 'UPLOADED'
          : 'PROVIDED'
        : 'MISSING',
      bookingCode: bookingCode.trim().toUpperCase(),
      checkInDate,
      checkOutDate,
      roomNumber: roomNumber.trim(),
      roomPassword: roomPassword.trim(),
      paymentStatus,
      paymentAmount: Number(paymentAmount) || 0,
      status,
      instructions: {
        directionToRoom: directionToRoom.trim(),
        elevator: elevator.trim(),
        stairs: stairs.trim(),
        parking: parking.trim(),
        complimentaryItems: complimentaryItems.trim(),
        roomInstructions: roomInstructions.trim(),
        wifiName: wifiName.trim(),
        wifiPassword: wifiPassword.trim(),
        importantNotes: importantNotes.trim(),
      },
    };

    const success = await onSave(payload);
    setIsSaving(false);
    if (success) {
      onClose();
    } else {
      setFormError('Không thể lưu thông tin. Vui lòng kiểm tra lại dữ liệu.');
    }
  };

  // Masked identity for preview
  const previewMaskedCccd =
    identityNumber.length > 4
      ? `${identityNumber.slice(0, 4)}********${identityNumber.slice(-4)}`
      : '****';

  return (
    <div
      id="booking-form-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="booking-form-modal"
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#D5E4DC] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#0F5B43] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10">
              <FileEdit className="w-5 h-5 text-[#8CD1B0]" />
            </div>
            <div>
              <h3 id="booking-modal-title" className="font-bold text-base sm:text-lg">
                {initialBooking ? 'Chỉnh Sửa Thông Tin Đặt Phòng' : 'Tạo Thông Tin Khách & Hướng Dẫn Nhận Phòng'}
              </h3>
              <p className="text-xs text-[#C5E2D4]">
                Thiết lập thông tin 5 trường xác thực và hướng dẫn nhận phòng chi tiết
              </p>
            </div>
          </div>
          <button
            id="btn-close-booking-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#C5E2D4] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#E8F1EC] bg-[#FAF9F4] px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'basic'
                ? 'border-[#0F5B43] text-[#0F5B43] bg-white rounded-t-xl'
                : 'border-transparent text-[#657E71] hover:text-[#0F5B43]'
            }`}
          >
            1. Thông Tin Đặt Phòng (Bắt buộc)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('instructions')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'instructions'
                ? 'border-[#0F5B43] text-[#0F5B43] bg-white rounded-t-xl'
                : 'border-transparent text-[#657E71] hover:text-[#0F5B43]'
            }`}
          >
            2. Hướng Dẫn Dành Cho Khách (8 Mục)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'border-[#0F5B43] text-[#0F5B43] bg-white rounded-t-xl'
                : 'border-transparent text-[#657E71] hover:text-[#0F5B43]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3. Xem Trước (Khách Sẽ Thấy)</span>
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Modal Body Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Branch Selection */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1">
                    Chi Nhánh Khách Sạn <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm font-medium outline-none"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.address}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TÊN KHÁCH */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1">
                    Tên Khách <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm font-medium outline-none"
                  />
                </div>

                {/* CCCD / PASSPORT */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#354D41]">
                      CCCD / Passport
                    </label>
                    <span className="text-[11px] text-[#6E887C] font-normal">(Không bắt buộc)</span>
                  </div>
                  <input
                    type="text"
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    placeholder="Để trống nếu khách sẽ tự bổ sung khi nhận phòng"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm font-mono outline-none"
                  />
                </div>

                {/* MÃ ĐẶT PHÒNG */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1">
                    Mã Đặt Phòng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                    placeholder="Ví dụ: LA20260819001"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm font-mono font-bold uppercase text-[#0F5B43] outline-none"
                  />
                </div>

                {/* SỐ PHÒNG */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1">
                    Số Phòng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Ví dụ: 502"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm font-bold outline-none"
                  />
                </div>

                {/* MẬT KHẨU VÀO PHÒNG */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1">
                    Mật Khẩu Vào Phòng (Khóa cửa)
                  </label>
                  <input
                    type="text"
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    placeholder="Ví dụ: 8899# hoặc 123456"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm font-mono font-bold text-[#0F5B43] outline-none"
                  />
                </div>

                {/* NGÀY CHECK-IN */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1">
                    Ngày Check-In <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm font-medium outline-none"
                  />
                </div>

                {/* NGÀY CHECK-OUT */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1">
                    Ngày Check-Out <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm font-medium outline-none"
                  />
                </div>

                {/* TRẠNG THÁI THANH TOÁN */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1">
                    Tình Trạng Thanh Toán
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as 'PAID' | 'UNPAID')}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm font-bold outline-none"
                  >
                    <option value="PAID">✓ ĐÃ THANH TOÁN</option>
                    <option value="UNPAID">⚠ CHƯA THANH TOÁN</option>
                  </select>
                </div>

                {/* SỐ TIỀN THANH TOÁN */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1">
                    Số Tiền Thanh Toán (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    placeholder="750000"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm font-mono font-bold outline-none"
                  />
                </div>

                {/* TRẠNG THÁI */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1">
                    Trạng Thái Booking
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BookingStatus)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm font-semibold outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Đang hoạt động - Khách tra cứu được)</option>
                    <option value="CHECKED_IN">CHECKED_IN (Khách đã nhận phòng)</option>
                    <option value="PENDING">PENDING (Chờ xác nhận)</option>
                    <option value="CHECKED_OUT">CHECKED_OUT (Đã trả phòng - Hiển thị booking đã kết thúc)</option>
                    <option value="CANCELLED">CANCELLED (Đã hủy - Khách KHÔNG được xem)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTRUCTIONS (8 SECTIONS) */}
          {activeTab === 'instructions' && (
            <div className="space-y-4 animate-in fade-in">
              <p className="text-xs text-[#526D60]">
                Khách sạn tự do nhập các hướng dẫn chi tiết dành cho khách. Khi khách tra cứu thành công, các nội dung này sẽ hiển thị đẹp mắt theo từng mục.
              </p>

              {/* 1. HƯỚNG DẪN ĐI ĐẾN PHÒNG */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F5B43] mb-1 flex items-center gap-1.5">
                  <Footprints className="w-4 h-4" />
                  1. Hướng Dẫn Đi Đến Phòng (Textarea)
                </label>
                <textarea
                  rows={3}
                  value={directionToRoom}
                  onChange={(e) => setDirectionToRoom(e.target.value)}
                  placeholder="Ví dụ: Bước 1: Từ sảnh đi thẳng...\nBước 2: Lên tầng 5...\nBước 3: Rẽ trái phòng 502..."
                  className="w-full p-3 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm outline-none font-normal"
                />
              </div>

              {/* 2 & 3. THANG MÁY & CẦU THANG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0F5B43] mb-1 flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    2. Hướng Dẫn Thang Máy
                  </label>
                  <textarea
                    rows={2}
                    value={elevator}
                    onChange={(e) => setElevator(e.target.value)}
                    placeholder="Ví dụ: Thang máy nằm bên trái sảnh chính..."
                    className="w-full p-3 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm outline-none font-normal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0F5B43] mb-1 flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    3. Hướng Dẫn Cầu Thang
                  </label>
                  <textarea
                    rows={2}
                    value={stairs}
                    onChange={(e) => setStairs(e.target.value)}
                    placeholder="Ví dụ: Cầu thang bộ bên cạnh lối thoát hiểm..."
                    className="w-full p-3 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm outline-none font-normal"
                  />
                </div>
              </div>

              {/* 4. HƯỚNG DẪN BÃI XE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F5B43] mb-1 flex items-center gap-1.5">
                  <Car className="w-4 h-4" />
                  4. Hướng Dẫn Bãi Xe
                </label>
                <textarea
                  rows={2}
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                  placeholder="Ví dụ: Bãi xe máy tại hầm B1, ô tô đỗ sân trước..."
                  className="w-full p-3 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm outline-none font-normal"
                />
              </div>

              {/* 5. NƯỚC / ĐỒ ĂN MIỄN PHÍ */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F5B43] mb-1 flex items-center gap-1.5">
                  <Gift className="w-4 h-4" />
                  5. Nước / Đồ Ăn Miễn Phí (Lá Hotel dành tặng)
                </label>
                <textarea
                  rows={2}
                  value={complimentaryItems}
                  onChange={(e) => setComplimentaryItems(e.target.value)}
                  placeholder="Ví dụ: • 02 chai nước suối Lá Eco\n• Bánh quy dừa đặc sản\n• Trà thảo mộc"
                  className="w-full p-3 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm outline-none font-normal"
                />
              </div>

              {/* 6. HƯỚNG DẪN TRONG PHÒNG */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F5B43] mb-1 flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4" />
                  6. Hướng Dẫn Trong Phòng (Nội quy, Điều hòa, TV, Nước nóng)
                </label>
                <textarea
                  rows={3}
                  value={roomInstructions}
                  onChange={(e) => setRoomInstructions(e.target.value)}
                  placeholder="Ví dụ: • Điều hòa: 24-26°C\n• Nước nóng: Bật trước 5 phút\n• TV: Đã có Netflix..."
                  className="w-full p-3 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm outline-none font-normal"
                />
              </div>

              {/* 7. WIFI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0F5B43] mb-1 flex items-center gap-1.5">
                    <Wifi className="w-4 h-4" />
                    7. Tên Wi-Fi
                  </label>
                  <input
                    type="text"
                    value={wifiName}
                    onChange={(e) => setWifiName(e.target.value)}
                    placeholder="LA_HOTEL_GUEST"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0F5B43] mb-1 flex items-center gap-1.5">
                    <Wifi className="w-4 h-4" />
                    Mật Khẩu Wi-Fi
                  </label>
                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="lahotel2026"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm font-mono outline-none"
                  />
                </div>
              </div>

              {/* 8. LƯU Ý */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F5B43] mb-1 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  8. Lưu Ý Quan Trọng
                </label>
                <textarea
                  rows={2}
                  value={importantNotes}
                  onChange={(e) => setImportantNotes(e.target.value)}
                  placeholder="Ví dụ: Phòng không hút thuốc. Giờ trả phòng 12:00."
                  className="w-full p-3 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white rounded-xl text-sm outline-none font-normal"
                />
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN LIVE PREVIEW (KHÁCH SẼ NHÌN THẤY) */}
          {activeTab === 'preview' && (
            <div className="space-y-4 animate-in fade-in bg-[#FAF9F4] p-4 sm:p-5 rounded-2xl border border-[#DFECE4]">
              <div className="p-3 bg-[#E8F1EC] rounded-xl text-xs text-[#0F5B43] flex items-center justify-between">
                <span>
                  👁 <strong>Xem trước giao diện khách hàng:</strong> Đã che bảo mật CCCD theo quy chuẩn ({previewMaskedCccd})
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0F5B43] text-white text-[10px] font-bold">
                  LIVE PREVIEW
                </span>
              </div>

              {/* Mini Preview Box */}
              <div className="bg-white rounded-2xl p-5 border border-[#E0ECE4] shadow-xs space-y-4">
                <div className="text-center space-y-1 pb-2 border-b border-[#EEF5F1]">
                  <span className="text-xs font-bold text-[#0F5B43]">🌿 LÁ HOTEL</span>
                  <h4 className="text-lg font-bold text-[#1F2924]">Chào mừng bạn, {guestName || '[Tên khách]'}</h4>
                  <p className="text-xs text-[#526D5F]">Thông tin phòng của bạn đã được xác nhận</p>
                </div>

                <div className="p-4 rounded-xl bg-[#0F5B43] text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8CD1B0]">PHÒNG CỦA BẠN</span>
                    <div className="text-3xl font-bold font-display">#{roomNumber || '502'}</div>
                    <div className="text-xs text-[#C5E2D4]">{currentBranch.name}</div>
                  </div>
                  <div className="text-right text-xs space-y-1">
                    <div>Check-in: <strong>{checkInDate || '--'}</strong></div>
                    <div>Check-out: <strong>{checkOutDate || '--'}</strong></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF9F4] border border-[#E4EFE8]">
                    <strong className="block text-[#0F5B43] mb-1">🚶 Hướng dẫn đến phòng:</strong>
                    <p className="text-[#3A5348] whitespace-pre-line">{directionToRoom || 'Chưa nhập hướng dẫn.'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F4] border border-[#E4EFE8]">
                    <strong className="block text-[#0F5B43] mb-1">📶 Wi-Fi:</strong>
                    <div>Tên: <strong>{wifiName}</strong></div>
                    <div>Mật khẩu: <strong>{wifiPassword}</strong></div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F4] border border-[#E4EFE8]">
                    <strong className="block text-[#0F5B43] mb-1">🎁 Quà tặng miễn phí:</strong>
                    <p className="text-[#3A5348] whitespace-pre-line">{complimentaryItems || 'Nước khoáng & trà miễn phí.'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F4] border border-[#E4EFE8]">
                    <strong className="block text-[#0F5B43] mb-1">🚗 Hướng dẫn bãi xe:</strong>
                    <p className="text-[#3A5348] whitespace-pre-line">{parking || 'Bãi xe hầm B1.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-[#EEF5F1] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#D5E2DA] text-[#557163] hover:bg-[#FAF9F4] text-xs font-semibold"
            >
              Hủy bỏ
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'preview' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'basic' ? 'instructions' : 'preview')}
                  className="px-4 py-2.5 rounded-xl bg-[#E8F1EC] text-[#0F5B43] text-xs font-bold hover:bg-[#D6E8DC]"
                >
                  Tiếp theo →
                </button>
              )}

              <button
                id="btn-save-booking-submit"
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0F5B43] hover:bg-[#166E53] text-white text-xs font-bold shadow-md disabled:opacity-70"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Đang lưu...' : 'LƯU THÔNG TIN KHÁCH'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
