import React, { useState, useEffect, useCallback } from 'react';
import { Booking, BookingStatus, AdminStats } from '../../types';
import { BRANCHES } from '../../data/branches';
import {
  fetchAdminBookings,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  seedDemoData,
  fetchAdminStats,
  logoutAdmin,
} from '../../services/api';
import { BookingFormModal } from './BookingFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { AuditLogsModal } from './AuditLogsModal';
import {
  Users,
  CalendarCheck,
  Hotel,
  LogOut,
  Plus,
  RefreshCw,
  Sparkles,
  Search,
  Building,
  Filter,
  Trash2,
  Edit,
  Eye,
  Shield,
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  Ban,
  Phone,
} from 'lucide-react';

interface AdminDashboardViewProps {
  onLogout: () => void;
  onPreviewAsCustomer: (bookingCode: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onLogout,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Status message
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        fetchAdminBookings({
          search: searchTerm,
          branchId: selectedBranch,
          status: selectedStatus,
          checkInDate: selectedDate,
        }),
        fetchAdminStats(),
      ]);

      if (bookingsRes.success && bookingsRes.bookings) {
        setBookings(bookingsRes.bookings);
      }
      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch {
      // error handled
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedBranch, selectedStatus, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showBanner = (text: string, type: 'success' | 'info' = 'success') => {
    setBannerMessage({ text, type });
    setTimeout(() => setBannerMessage(null), 4000);
  };

  const handleSaveBooking = async (payload: Partial<Booking>): Promise<boolean> => {
    try {
      if (editingBooking) {
        const res = await updateBooking(editingBooking.id, payload);
        if (res.success) {
          showBanner('Đã cập nhật thông tin booking thành công!');
          await loadData();
          return true;
        }
      } else {
        const res = await createBooking(payload);
        if (res.success) {
          showBanner('Đã tạo mới thông tin khách thành công!');
          await loadData();
          return true;
        }
      }
    } catch {
      // error
    }
    return false;
  };

  const handleConfirmDelete = async (id: string): Promise<boolean> => {
    try {
      const res = await deleteBooking(id);
      if (res.success) {
        showBanner('Đã xóa booking thành công!', 'info');
        await loadData();
        return true;
      }
    } catch {
      // error
    }
    return false;
  };

  const handleQuickStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      const res = await updateBookingStatus(id, newStatus);
      if (res.success) {
        showBanner(`Đã đổi trạng thái thành ${newStatus}`);
        await loadData();
      }
    } catch {
      // error
    }
  };

  const handleSeedDemo = async () => {
    setIsLoading(true);
    try {
      const res = await seedDemoData();
      if (res.success) {
        showBanner('Đã nạp lại 10 dữ liệu đặt phòng demo mẫu!');
        await loadData();
      }
    } catch {
      // error
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    onLogout();
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">ACTIVE</span>;
      case 'CHECKED_IN':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">CHECKED_IN</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">PENDING</span>;
      case 'CHECKED_OUT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">CHECKED_OUT</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">CANCELLED</span>;
    }
  };

  return (
    <div id="admin-dashboard-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-20">
      {/* Top Banner Alert */}
      {bannerMessage && (
        <div
          id="admin-alert-banner"
          className="p-4 rounded-2xl bg-[#E8F1EC] border border-[#C0DACB] text-[#0F5B43] text-sm font-bold flex items-center justify-between shadow-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#0F5B43]" />
            <span>{bannerMessage.text}</span>
          </div>
          <button type="button" onClick={() => setBannerMessage(null)} className="text-xs underline font-semibold">
            Đóng
          </button>
        </div>
      )}

      {/* Top Navigation / Title Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DFECE4] shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F1EC] text-[#0F5B43] text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Bảng Điều Khiển Quản Lý</span>
          </div>
          <h1 id="dashboard-heading" className="text-xl sm:text-2xl font-bold text-[#0F5B43] font-display">
            Quản Lý Thông Tin Đặt Phòng & Tra Cứu
          </h1>
          <p className="text-xs text-[#5C7769]">
            Hệ thống Lá Hotel — Nhập thông tin phòng và hướng dẫn nhận phòng bảo mật
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-admin-add-guest"
            type="button"
            onClick={() => {
              setEditingBooking(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F5B43] hover:bg-[#156E52] text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ THÊM THÔNG TIN KHÁCH</span>
          </button>

          <button
            id="btn-admin-seed-demo"
            type="button"
            onClick={handleSeedDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FAF9F4] border border-[#D5E2DA] hover:border-[#0F5B43] text-[#2D483B] text-xs sm:text-sm font-semibold transition-colors"
            title="Khôi phục lại 10 booking demo"
          >
            <Sparkles className="w-4 h-4 text-[#0F5B43]" />
            <span>THÊM DỮ LIỆU DEMO</span>
          </button>

          <button
            id="btn-admin-audit-logs"
            type="button"
            onClick={() => setIsAuditOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FAF9F4] border border-[#D5E2DA] hover:border-[#0F5B43] text-[#2D483B] text-xs sm:text-sm font-semibold transition-colors"
          >
            <Activity className="w-4 h-4 text-[#0F5B43]" />
            <span>NHẬT KÝ (Audit Logs)</span>
          </button>

          <button
            id="btn-admin-logout"
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* 5 Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* 1. TỔNG KHÁCH */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DFECE4] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#688274]">
            <span className="text-[11px] font-bold uppercase tracking-wider">TỔNG KHÁCH</span>
            <Users className="w-4 h-4 text-[#0F5B43]" />
          </div>
          <div id="stat-total-guests" className="text-2xl sm:text-3xl font-bold font-display text-[#0F5B43]">
            {stats ? stats.totalGuests : bookings.length}
          </div>
          <span className="text-[10px] text-[#80988C]">Toàn bộ danh sách</span>
        </div>

        {/* 2. CHECK-IN HÔM NAY */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DFECE4] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#688274]">
            <span className="text-[11px] font-bold uppercase tracking-wider">CHECK-IN HÔM NAY</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div id="stat-checkin-today" className="text-2xl sm:text-3xl font-bold font-display text-emerald-700">
            {stats ? stats.checkInToday : 0}
          </div>
          <span className="text-[10px] text-[#80988C]">Đến trong ngày</span>
        </div>

        {/* 3. ĐANG LƯU TRÚ */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DFECE4] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#688274]">
            <span className="text-[11px] font-bold uppercase tracking-wider">ĐANG LƯU TRÚ</span>
            <Hotel className="w-4 h-4 text-blue-600" />
          </div>
          <div id="stat-currently-staying" className="text-2xl sm:text-3xl font-bold font-display text-blue-700">
            {stats ? stats.currentlyStaying : 0}
          </div>
          <span className="text-[10px] text-[#80988C]">Active & Checked-in</span>
        </div>

        {/* 4. SẮP CHECK-OUT */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DFECE4] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#688274]">
            <span className="text-[11px] font-bold uppercase tracking-wider">SẮP CHECK-OUT</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div id="stat-upcoming-checkout" className="text-2xl sm:text-3xl font-bold font-display text-amber-700">
            {stats ? stats.upcomingCheckOut : 0}
          </div>
          <span className="text-[10px] text-[#80988C]">Hôm nay trả phòng</span>
        </div>

        {/* 5. ĐÃ CHECK-OUT */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DFECE4] shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[#688274]">
            <span className="text-[11px] font-bold uppercase tracking-wider">ĐÃ CHECK-OUT</span>
            <CheckCircle className="w-4 h-4 text-gray-500" />
          </div>
          <div id="stat-checked-out" className="text-2xl sm:text-3xl font-bold font-display text-gray-700">
            {stats ? stats.checkedOut : 0}
          </div>
          <span className="text-[10px] text-[#80988C]">Đã hoàn tất lưu trú</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#DFECE4] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#354D41]">
          <Filter className="w-4 h-4 text-[#0F5B43]" />
          <span>Bộ Lọc & Tìm Kiếm</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#7A9386] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tên khách, mã booking, phòng..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAF9F4] border border-[#D5E2DA] focus:border-[#0F5B43] rounded-xl text-xs font-medium outline-none"
            />
          </div>

          {/* Branch Filter */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F4] border border-[#D5E2DA] focus:border-[#0F5B43] rounded-xl text-xs font-medium outline-none"
            >
              <option value="ALL">Tất cả chi nhánh ({BRANCHES.length} chi nhánh)</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F4] border border-[#D5E2DA] focus:border-[#0F5B43] rounded-xl text-xs font-medium outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
              <option value="CHECKED_IN">CHECKED_IN (Đã nhận phòng)</option>
              <option value="PENDING">PENDING (Chờ xác nhận)</option>
              <option value="CHECKED_OUT">CHECKED_OUT (Đã trả phòng)</option>
              <option value="CANCELLED">CANCELLED (Đã hủy)</option>
            </select>
          </div>

          {/* Check-In Date */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F4] border border-[#D5E2DA] focus:border-[#0F5B43] rounded-xl text-xs font-medium outline-none"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="text-xs text-red-600 font-bold px-2 py-1 bg-red-50 rounded-lg hover:bg-red-100"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Data Table */}
      <div className="bg-white rounded-3xl border border-[#DFECE4] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#EEF5F1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm sm:text-base text-[#0F5B43]">
              Danh Sách Đặt Phòng ({bookings.length})
            </h2>
            {isLoading && <RefreshCw className="w-4 h-4 text-[#0F5B43] animate-spin" />}
          </div>
          <span className="text-xs text-[#6F897B]">
            Dữ liệu đối soát bảo mật server-side
          </span>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F4] border-b border-[#EEF5F1] text-[#385244] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Tên Khách</th>
                <th className="px-4 py-3.5">Mã Booking</th>
                <th className="px-4 py-3.5">CCCD (Ẩn)</th>
                <th className="px-4 py-3.5">Chi Nhánh</th>
                <th className="px-4 py-3.5">Phòng</th>
                <th className="px-4 py-3.5">Check-In</th>
                <th className="px-4 py-3.5">Check-Out</th>
                <th className="px-4 py-3.5">Trạng Thái</th>
                <th className="px-4 py-3.5 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F7F4] text-[#2C4638]">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-[#7F9A8C]">
                    Chưa có thông tin đặt phòng phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const branch = BRANCHES.find((br) => br.id === b.branchId);

                  return (
                    <tr key={b.id} className="hover:bg-[#FAF9F4] transition-colors">
                      {/* Tên khách */}
                      <td className="px-4 py-3.5 font-bold text-[#1F2924]">
                        {b.guestName}
                      </td>

                      {/* Mã Booking */}
                      <td className="px-4 py-3.5 font-mono font-bold text-[#0F5B43]">
                        {b.bookingCode}
                      </td>

                      {/* CCCD Masked */}
                      <td className="px-4 py-3.5 font-mono text-[#6A8476]">
                        {b.identityNumberMasked || '••••••••'}
                      </td>

                      {/* Chi Nhánh */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold">{branch?.code || 'CN'}</span>
                        <span className="block text-[11px] text-[#718B7D] truncate max-w-[150px]">
                          {branch?.name}
                        </span>
                      </td>

                      {/* Số Phòng */}
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#E8F1EC] text-[#0F5B43] font-bold">
                          #{b.roomNumber}
                        </span>
                      </td>

                      {/* Check-in */}
                      <td className="px-4 py-3.5 text-[#3A5446]">
                        {b.checkInDate}
                      </td>

                      {/* Check-out */}
                      <td className="px-4 py-3.5 text-[#3A5446]">
                        {b.checkOutDate}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {getStatusBadge(b.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Preview / View Edit */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBooking(b);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-[#D5E2DA] hover:bg-[#E8F1EC] text-[#0F5B43] transition-colors"
                            title="Chỉnh sửa / Xem chi tiết"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Cancel if active */}
                          {b.status !== 'CANCELLED' ? (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(b.id, 'CANCELLED')}
                              className="p-1.5 rounded-lg border border-[#D5E2DA] hover:bg-red-50 text-amber-600 hover:text-red-700 transition-colors"
                              title="Hủy booking (CANCELLED)"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(b.id, 'ACTIVE')}
                              className="p-1.5 rounded-lg border border-[#D5E2DA] hover:bg-emerald-50 text-emerald-600 transition-colors"
                              title="Kích hoạt lại (ACTIVE)"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingBooking(b);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-[#D5E2DA] hover:bg-red-50 text-red-600 transition-colors"
                            title="Xóa booking"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal (Add / Edit) */}
      <BookingFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBooking(null);
        }}
        onSave={handleSaveBooking}
        initialBooking={editingBooking}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        booking={deletingBooking}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingBooking(null);
        }}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Audit Logs Modal */}
      <AuditLogsModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />
    </div>
  );
};
