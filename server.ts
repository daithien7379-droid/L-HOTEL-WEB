import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { BRANCHES, HOTEL_INFO } from './src/data/branches';
import { INITIAL_DEMO_BOOKINGS } from './src/data/initialData';
import { Booking, BookingStatus, SafeGuestBooking, AuditLog, AdminStats } from './src/types/index';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database with Seed Data
let bookings: Booking[] = JSON.parse(JSON.stringify(INITIAL_DEMO_BOOKINGS));
let auditLogs: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: new Date().toISOString(),
    action: 'SEED_DEMO',
    actor: 'system',
    details: 'Đã khởi tạo 10 dữ liệu đặt phòng mẫu cho hệ thống Lá Hotel',
    status: 'SUCCESS',
  },
];

// Guest Temporary Sessions (15 minutes expiration)
interface GuestSession {
  token: string;
  bookingId: string;
  safeData: SafeGuestBooking;
  expiresAt: number;
}
const guestSessions = new Map<string, GuestSession>();

// Rate Limiting Map: IP -> { count: number, resetAt: number }
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimits = new Map<string, RateLimitRecord>();
const MAX_VERIFY_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// Admin Session Tokens
const adminTokens = new Set<string>();

// Helper: Mask identity number for security
function maskIdentity(id: string): string {
  if (!id) return '';
  const trimmed = id.trim();
  if (trimmed.length <= 4) return '****';
  const prefix = trimmed.slice(0, Math.min(4, Math.floor(trimmed.length / 2)));
  const suffix = trimmed.slice(-4);
  return `${prefix}${'*'.repeat(Math.max(4, trimmed.length - prefix.length - suffix.length))}${suffix}`;
}

// Helper: Standardize date to YYYY-MM-DD
function normalizeDate(dStr: string): string {
  if (!dStr) return '';
  const trimmed = dStr.trim();
  // If DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const parts = trimmed.split('/');
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return trimmed;
}

// Helper: Normalize string for matching (case-insensitive, trims accents/extra spaces)
function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

// Helper: Log audit trail
function addAuditLog(
  action: AuditLog['action'],
  actor: string,
  details: string,
  status: 'SUCCESS' | 'FAILED',
  ip?: string
) {
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    actor,
    details,
    ip: ip || 'client',
    status,
  };
  auditLogs.unshift(log);
  if (auditLogs.length > 500) auditLogs.pop();
}

// Middleware: Admin Auth Check
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string);

  if (!token || !adminTokens.has(token)) {
    res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập quản trị viên' });
    return;
  }
  next();
}

// ==========================================
// 1. PUBLIC & CUSTOMER API
// ==========================================

// Get Branches Info
app.get('/api/branches', (_req: Request, res: Response) => {
  res.json({ success: true, branches: BRANCHES, hotelInfo: HOTEL_INFO });
});

// Guest Verification Endpoint (Strict 5-Field Match)
app.post('/api/verify-guest', (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();

  // Rate Limiting Check
  let rateRecord = rateLimits.get(clientIp);
  if (rateRecord && now > rateRecord.resetAt) {
    rateLimits.delete(clientIp);
    rateRecord = undefined;
  }

  if (rateRecord && rateRecord.count >= MAX_VERIFY_ATTEMPTS) {
    const minutesLeft = Math.ceil((rateRecord.resetAt - now) / (60 * 1000));
    addAuditLog('VERIFY_FAILED', 'guest', `IP ${clientIp} bị chặn do vượt quá ${MAX_VERIFY_ATTEMPTS} lần thử sai`, 'FAILED', clientIp);
    res.status(429).json({
      success: false,
      isRateLimited: true,
      message: `Bạn đã thử quá nhiều lần (${MAX_VERIFY_ATTEMPTS} lần). Vui lòng đợi ${minutesLeft} phút hoặc liên hệ Lá Hotel (Hotline: ${HOTEL_INFO.hotline}) để được hỗ trợ.`,
    });
    return;
  }

  const { guestName, bookingCode, identityNumber, checkInDate, checkOutDate } = req.body || {};

  // Validate presence
  if (!guestName || !bookingCode || !identityNumber || !checkInDate || !checkOutDate) {
    res.status(400).json({
      success: false,
      message: 'Vui lòng điền đầy đủ tất cả 5 thông tin tra cứu.',
    });
    return;
  }

  const normGuestName = normalizeString(guestName);
  const normBookingCode = String(bookingCode).trim().toUpperCase();
  const normIdentity = String(identityNumber).trim().toUpperCase().replace(/[\s-]/g, '');
  const normCheckIn = normalizeDate(String(checkInDate));
  const normCheckOut = normalizeDate(String(checkOutDate));

  // Search matching booking
  const matched = bookings.find((b) => {
    const bName = normalizeString(b.guestName);
    const bCode = b.bookingCode.trim().toUpperCase();
    const bIdentity = b.identityNumber.trim().toUpperCase().replace(/[\s-]/g, '');
    const bCheckIn = normalizeDate(b.checkInDate);
    const bCheckOut = normalizeDate(b.checkOutDate);

    return (
      bName === normGuestName &&
      bCode === normBookingCode &&
      bIdentity === normIdentity &&
      bCheckIn === normCheckIn &&
      bCheckOut === normCheckOut
    );
  });

  // Check if no match or cancelled
  if (!matched || matched.status === 'CANCELLED') {
    // Record failed attempt
    const currentCount = (rateRecord?.count || 0) + 1;
    rateLimits.set(clientIp, {
      count: currentCount,
      resetAt: rateRecord ? rateRecord.resetAt : now + RATE_LIMIT_WINDOW_MS,
    });

    addAuditLog(
      'VERIFY_FAILED',
      'guest',
      `Tra cứu không khớp: Mã [${normBookingCode}], Tên [${guestName}], CCCD [${maskIdentity(identityNumber)}]`,
      'FAILED',
      clientIp
    );

    res.status(400).json({
      success: false,
      message: 'Thông tin chưa khớp. Vui lòng kiểm tra lại thông tin hoặc liên hệ Lá Hotel để được hỗ trợ.',
      attemptsLeft: Math.max(0, MAX_VERIFY_ATTEMPTS - currentCount),
    });
    return;
  }

  // Reset rate limits upon successful verification
  rateLimits.delete(clientIp);

  // Find Branch Info
  const branch = BRANCHES.find((br) => br.id === matched.branchId) || BRANCHES[0];

  // Construct Safe Guest Response (NO CCCD, NO INTERNAL NOTES)
  const safeData: SafeGuestBooking = {
    guestName: matched.guestName,
    branchName: branch.name,
    branchAddress: branch.address,
    branchPhone: branch.phone,
    roomNumber: matched.roomNumber,
    checkInDate: matched.checkInDate,
    checkOutDate: matched.checkOutDate,
    status: matched.status,
    instructions: {
      directionToRoom: matched.instructions?.directionToRoom || '',
      elevator: matched.instructions?.elevator || '',
      stairs: matched.instructions?.stairs || '',
      parking: matched.instructions?.parking || '',
      complimentaryItems: matched.instructions?.complimentaryItems || '',
      roomInstructions: matched.instructions?.roomInstructions || '',
      wifiName: matched.instructions?.wifiName || 'LA_HOTEL_GUEST',
      wifiPassword: matched.instructions?.wifiPassword || 'lahotel2026',
      importantNotes: matched.instructions?.importantNotes || '',
    },
  };

  // Generate 15-minute temporary session token
  const sessionToken = crypto.randomBytes(24).toString('hex');
  const expiresAt = now + 15 * 60 * 1000;

  guestSessions.set(sessionToken, {
    token: sessionToken,
    bookingId: matched.id,
    safeData,
    expiresAt,
  });

  addAuditLog(
    'VERIFY_SUCCESS',
    'guest',
    `Khách [${matched.guestName}] đã tra cứu thành công phòng [${matched.roomNumber}] tại [${branch.name}]`,
    'SUCCESS',
    clientIp
  );

  res.json({
    success: true,
    message: 'Thông tin phòng của bạn đã được xác nhận.',
    sessionToken,
    expiresAt: new Date(expiresAt).toISOString(),
    data: safeData,
  });
});

// Retrieve Active Guest Session
app.get('/api/guest-session/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  const session = guestSessions.get(token);

  if (!session) {
    res.status(404).json({ success: false, message: 'Phiên tra cứu không tồn tại hoặc đã hết hạn.' });
    return;
  }

  if (Date.now() > session.expiresAt) {
    guestSessions.delete(token);
    res.status(410).json({ success: false, message: 'Phiên tra cứu đã hết hạn (15 phút). Vui lòng tra cứu lại để bảo mật.' });
    return;
  }

  res.json({
    success: true,
    data: session.safeData,
    expiresAt: new Date(session.expiresAt).toISOString(),
    remainingSeconds: Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000)),
  });
});

// ==========================================
// 2. ADMIN API
// ==========================================

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};

  // Standard demo credentials: admin / lahotel@2026 or admin@lahotel.vn / lahotel@2026
  const isValid =
    (username === 'admin' || username === 'admin@lahotel.vn' || username === 'letan@lahotel.vn') &&
    (password === 'lahotel@2026' || password === 'admin123');

  if (!isValid) {
    addAuditLog('ADMIN_LOGIN', username || 'unknown', 'Đăng nhập thất bại (sai thông tin)', 'FAILED');
    res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    return;
  }

  const token = `adm_${crypto.randomBytes(24).toString('hex')}`;
  adminTokens.add(token);

  addAuditLog('ADMIN_LOGIN', username, 'Đăng nhập thành công vào trang quản trị', 'SUCCESS');

  res.json({
    success: true,
    token,
    user: {
      username,
      name: 'Quản Trị Viên Lá Hotel',
      role: 'SUPER_ADMIN',
    },
  });
});

// Admin Logout
app.post('/api/admin/logout', requireAdmin, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string);
  if (token) adminTokens.delete(token);
  addAuditLog('ADMIN_LOGOUT', 'admin', 'Đã đăng xuất khỏi hệ thống', 'SUCCESS');
  res.json({ success: true, message: 'Đăng xuất thành công' });
});

// Admin Profile Check
app.get('/api/admin/me', requireAdmin, (_req: Request, res: Response) => {
  res.json({
    success: true,
    user: {
      username: 'admin@lahotel.vn',
      name: 'Quản Trị Viên Lá Hotel',
      role: 'SUPER_ADMIN',
    },
  });
});

// Admin Bookings List (with search & filters)
app.get('/api/admin/bookings', requireAdmin, (req: Request, res: Response) => {
  const { search, branchId, status, checkInDate } = req.query;

  let result = [...bookings];

  if (branchId && branchId !== 'ALL') {
    result = result.filter((b) => b.branchId === branchId);
  }

  if (status && status !== 'ALL') {
    result = result.filter((b) => b.status === status);
  }

  if (checkInDate) {
    const targetDate = normalizeDate(String(checkInDate));
    result = result.filter((b) => normalizeDate(b.checkInDate) === targetDate);
  }

  if (search) {
    const q = normalizeString(String(search));
    result = result.filter((b) => {
      const name = normalizeString(b.guestName);
      const code = b.bookingCode.toLowerCase();
      const room = b.roomNumber.toLowerCase();
      const cccd = b.identityNumber.toLowerCase();
      return name.includes(q) || code.includes(q) || room.includes(q) || cccd.includes(q);
    });
  }

  // Sort by createdAt descending
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, bookings: result, total: result.length });
});

// Admin Create Booking
app.post('/api/admin/bookings', requireAdmin, (req: Request, res: Response) => {
  const {
    branchId,
    guestName,
    identityNumber,
    bookingCode,
    checkInDate,
    checkOutDate,
    roomNumber,
    status = 'ACTIVE',
    instructions = {},
  } = req.body || {};

  // Validate mandatory fields
  if (!branchId || !guestName || !identityNumber || !bookingCode || !checkInDate || !checkOutDate || !roomNumber) {
    res.status(400).json({
      success: false,
      message: 'Tất cả các trường thông tin đặt phòng cơ bản đều bắt buộc.',
    });
    return;
  }

  const newBooking: Booking = {
    id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    branchId,
    guestName: String(guestName).trim(),
    identityNumber: String(identityNumber).trim(),
    identityNumberMasked: maskIdentity(String(identityNumber)),
    bookingCode: String(bookingCode).trim().toUpperCase(),
    checkInDate: normalizeDate(String(checkInDate)),
    checkOutDate: normalizeDate(String(checkOutDate)),
    roomNumber: String(roomNumber).trim(),
    status: (status as BookingStatus) || 'ACTIVE',
    instructions: {
      directionToRoom: instructions.directionToRoom || '',
      elevator: instructions.elevator || '',
      stairs: instructions.stairs || '',
      parking: instructions.parking || '',
      complimentaryItems: instructions.complimentaryItems || '',
      roomInstructions: instructions.roomInstructions || '',
      wifiName: instructions.wifiName || 'LA_HOTEL_GUEST',
      wifiPassword: instructions.wifiPassword || 'lahotel2026',
      importantNotes: instructions.importantNotes || '',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
  };

  bookings.unshift(newBooking);

  addAuditLog(
    'CREATE_BOOKING',
    'admin',
    `Tạo booking mới [${newBooking.bookingCode}] - Khách: [${newBooking.guestName}], Phòng: [${newBooking.roomNumber}]`,
    'SUCCESS'
  );

  res.json({ success: true, booking: newBooking, message: 'Đã thêm thông tin khách thành công.' });
});

// Admin Update Booking
app.put('/api/admin/bookings/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = bookings.findIndex((b) => b.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Không tìm thấy booking.' });
    return;
  }

  const {
    branchId,
    guestName,
    identityNumber,
    bookingCode,
    checkInDate,
    checkOutDate,
    roomNumber,
    status,
    instructions,
  } = req.body || {};

  const existing = bookings[index];

  const updated: Booking = {
    ...existing,
    branchId: branchId || existing.branchId,
    guestName: guestName ? String(guestName).trim() : existing.guestName,
    identityNumber: identityNumber ? String(identityNumber).trim() : existing.identityNumber,
    identityNumberMasked: identityNumber ? maskIdentity(String(identityNumber)) : existing.identityNumberMasked,
    bookingCode: bookingCode ? String(bookingCode).trim().toUpperCase() : existing.bookingCode,
    checkInDate: checkInDate ? normalizeDate(String(checkInDate)) : existing.checkInDate,
    checkOutDate: checkOutDate ? normalizeDate(String(checkOutDate)) : existing.checkOutDate,
    roomNumber: roomNumber ? String(roomNumber).trim() : existing.roomNumber,
    status: (status as BookingStatus) || existing.status,
    instructions: instructions ? { ...existing.instructions, ...instructions } : existing.instructions,
    updatedAt: new Date().toISOString(),
  };

  bookings[index] = updated;

  addAuditLog(
    'UPDATE_BOOKING',
    'admin',
    `Cập nhật booking [${updated.bookingCode}] - Phòng [${updated.roomNumber}]`,
    'SUCCESS'
  );

  res.json({ success: true, booking: updated, message: 'Đã cập nhật thông tin thành công.' });
});

// Admin Status Change
app.patch('/api/admin/bookings/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const booking = bookings.find((b) => b.id === id);
  if (!booking) {
    res.status(404).json({ success: false, message: 'Không tìm thấy booking.' });
    return;
  }

  booking.status = status;
  booking.updatedAt = new Date().toISOString();

  addAuditLog(
    'STATUS_CHANGE',
    'admin',
    `Đổi trạng thái booking [${booking.bookingCode}] thành [${status}]`,
    'SUCCESS'
  );

  res.json({ success: true, booking, message: `Đã đổi trạng thái thành ${status}` });
});

// Admin Delete Booking (with validation)
app.delete('/api/admin/bookings/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = bookings.findIndex((b) => b.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Không tìm thấy booking.' });
    return;
  }

  const deleted = bookings[index];
  bookings.splice(index, 1);

  addAuditLog(
    'DELETE_BOOKING',
    'admin',
    `Đã xóa booking [${deleted.bookingCode}] - Khách: [${deleted.guestName}]`,
    'SUCCESS'
  );

  res.json({ success: true, message: 'Đã xóa booking thành công.' });
});

// Admin Seed Demo Data
app.post('/api/admin/seed-demo', requireAdmin, (_req: Request, res: Response) => {
  bookings = JSON.parse(JSON.stringify(INITIAL_DEMO_BOOKINGS));
  addAuditLog('SEED_DEMO', 'admin', 'Khôi phục 10 bản ghi demo mặc định', 'SUCCESS');
  res.json({ success: true, count: bookings.length, message: 'Đã thêm lại 10 dữ liệu đặt phòng demo thành công!' });
});

// Admin Stats
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const today = normalizeDate(new Date().toISOString().split('T')[0]);

  const stats: AdminStats = {
    totalGuests: bookings.length,
    checkInToday: bookings.filter((b) => normalizeDate(b.checkInDate) === today && b.status !== 'CANCELLED').length,
    currentlyStaying: bookings.filter((b) => b.status === 'CHECKED_IN' || b.status === 'ACTIVE').length,
    upcomingCheckOut: bookings.filter((b) => normalizeDate(b.checkOutDate) === today && b.status !== 'CHECKED_OUT' && b.status !== 'CANCELLED').length,
    checkedOut: bookings.filter((b) => b.status === 'CHECKED_OUT').length,
    cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  res.json({ success: true, stats });
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, logs: auditLogs });
});

// ==========================================
// 3. VITE INTEGRATION & STATIC ASSETS
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌿 Lá Hotel server is running on port ${PORT}`);
  });
}

startServer();
