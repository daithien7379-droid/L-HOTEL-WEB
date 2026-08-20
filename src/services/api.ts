import {
  Booking,
  BookingStatus,
  SafeGuestBooking,
  Branch,
  GuestVerificationRequest,
  GuestVerificationResponse,
  AuditLog,
  AdminStats,
} from '../types';

const ADMIN_TOKEN_KEY = 'lahotel_admin_token';

export function getStoredAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string): void {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearStoredAdminToken(): void {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // ignore
  }
}

// 1. Guest Verification
export async function verifyGuest(payload: GuestVerificationRequest): Promise<GuestVerificationResponse> {
  try {
    const response = await fetch('/api/verify-guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch {
    return {
      success: false,
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng hoặc liên hệ Lá Hotel.',
    };
  }
}

// 1.1 Provide Guest Identity (Text number)
export async function provideGuestIdentity(
  sessionToken: string,
  identityNumber: string,
  identityType?: 'CCCD' | 'PASSPORT'
): Promise<{ success: boolean; message?: string; data?: SafeGuestBooking }> {
  try {
    const response = await fetch('/api/guest/provide-identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken, identityNumber, identityType }),
    });
    return await response.json();
  } catch {
    return {
      success: false,
      message: 'Không thể kết nối máy chủ để lưu thông tin CCCD / Passport. Vui lòng thử lại.',
    };
  }
}

// 1.2 Provide Guest Identity Document (Camera photos)
export async function provideGuestIdentityDocument(
  sessionToken: string,
  payload: {
    identityType: 'CCCD' | 'PASSPORT';
    frontImage?: string;
    backImage?: string;
    passportImage?: string;
  }
): Promise<{ success: boolean; message?: string; data?: SafeGuestBooking }> {
  try {
    const response = await fetch('/api/guest/provide-identity-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken, ...payload }),
    });
    return await response.json();
  } catch {
    return {
      success: false,
      message: 'Không thể tải ảnh giấy tờ lên. Vui lòng thử lại.',
    };
  }
}

// 2. Fetch Active Guest Session
export async function getGuestSession(token: string) {
  try {
    const response = await fetch(`/api/guest-session/${token}`);
    return await response.json();
  } catch {
    return { success: false, message: 'Lỗi tải phiên làm việc.' };
  }
}

// 3. Branches List
export async function fetchBranches(): Promise<{ success: boolean; branches: Branch[] }> {
  try {
    const res = await fetch('/api/branches');
    return await res.json();
  } catch {
    return { success: false, branches: [] };
  }
}

// 4. Admin Auth
export async function loginAdmin(username: string, password: string) {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      setStoredAdminToken(data.token);
    }
    return data;
  } catch {
    return { success: false, message: 'Lỗi mạng khi đăng nhập quản trị.' };
  }
}

export async function logoutAdmin() {
  const token = getStoredAdminToken();
  try {
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    // ignore
  } finally {
    clearStoredAdminToken();
  }
}

export async function checkAdminAuth() {
  const token = getStoredAdminToken();
  if (!token) return { success: false };
  try {
    const res = await fetch('/api/admin/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

// 5. Admin Bookings CRUD
export async function fetchAdminBookings(filters?: {
  search?: string;
  branchId?: string;
  status?: string;
  checkInDate?: string;
}): Promise<{ success: boolean; bookings: Booking[] }> {
  const token = getStoredAdminToken();
  try {
    const query = new URLSearchParams();
    if (filters?.search) query.append('search', filters.search);
    if (filters?.branchId) query.append('branchId', filters.branchId);
    if (filters?.status) query.append('status', filters.status);
    if (filters?.checkInDate) query.append('checkInDate', filters.checkInDate);

    const res = await fetch(`/api/admin/bookings?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false, bookings: [] };
  }
}

export async function createBooking(data: Partial<Booking>): Promise<{ success: boolean; booking?: Booking; message?: string }> {
  const token = getStoredAdminToken();
  try {
    const res = await fetch('/api/admin/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Lỗi tạo thông tin booking.' };
  }
}

export async function updateBooking(id: string, data: Partial<Booking>): Promise<{ success: boolean; booking?: Booking; message?: string }> {
  const token = getStoredAdminToken();
  try {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Lỗi cập nhật thông tin booking.' };
  }
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<{ success: boolean; message?: string }> {
  const token = getStoredAdminToken();
  try {
    const res = await fetch(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Lỗi đổi trạng thái.' };
  }
}

export async function deleteBooking(id: string): Promise<{ success: boolean; message?: string }> {
  const token = getStoredAdminToken();
  try {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Lỗi xóa booking.' };
  }
}

export async function seedDemoData(): Promise<{ success: boolean; message?: string }> {
  const token = getStoredAdminToken();
  try {
    const res = await fetch('/api/admin/seed-demo', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Lỗi tạo dữ liệu mẫu.' };
  }
}

export async function fetchAdminStats(): Promise<{ success: boolean; stats?: AdminStats }> {
  const token = getStoredAdminToken();
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function fetchAdminAuditLogs(): Promise<{ success: boolean; logs?: AuditLog[] }> {
  const token = getStoredAdminToken();
  try {
    const res = await fetch('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}
