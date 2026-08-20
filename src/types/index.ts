export type BookingStatus = 'PENDING' | 'ACTIVE' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'UNPAID';
export type IdentityType = 'CCCD' | 'PASSPORT';
export type IdentityStatus = 'MISSING' | 'PROVIDED' | 'UPLOADED';

export interface IdentityDocuments {
  frontImageUrl?: string;
  backImageUrl?: string;
  passportImageUrl?: string;
  uploadedAt?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
}

export interface BookingInstructions {
  directionToRoom: string;
  elevator: string;
  stairs: string;
  parking: string;
  complimentaryItems: string;
  roomInstructions: string;
  wifiName: string;
  wifiPassword: string;
  importantNotes: string;
}

export interface Booking {
  id: string;
  branchId: string;
  guestName: string;
  identityNumber: string; // Plaintext on server only, masked for preview
  identityType?: IdentityType;
  identityStatus?: IdentityStatus;
  identityDocuments?: IdentityDocuments;
  identityNumberHash?: string;
  identityNumberMasked?: string;
  bookingCode: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  roomNumber: string;
  roomPassword?: string;
  paymentStatus?: PaymentStatus;
  paymentAmount?: number;
  status: BookingStatus;
  instructions: BookingInstructions;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface SafeGuestBooking {
  guestName: string;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  roomNumber: string;
  roomPassword?: string;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  paymentAmount?: number;
  instructions: {
    directionToRoom: string;
    elevator: string;
    stairs: string;
    parking: string;
    complimentaryItems: string;
    roomInstructions: string;
    wifiName: string;
    wifiPassword: string;
    importantNotes: string;
  };
}

export interface GuestVerificationRequest {
  guestName?: string;
  bookingCode?: string;
  identityNumber?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export interface GuestVerificationResponse {
  success: boolean;
  message?: string;
  sessionToken?: string;
  expiresAt?: string;
  data?: SafeGuestBooking;
  requiresIdentity?: boolean;
  guestName?: string;
  bookingCode?: string;
  isRateLimited?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'ADMIN_LOGIN' | 'ADMIN_LOGOUT' | 'CREATE_BOOKING' | 'UPDATE_BOOKING' | 'DELETE_BOOKING' | 'STATUS_CHANGE' | 'VERIFY_SUCCESS' | 'VERIFY_FAILED' | 'SEED_DEMO';
  actor: string;
  details: string;
  ip?: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface AdminStats {
  totalGuests: number;
  checkInToday: number;
  currentlyStaying: number;
  upcomingCheckOut: number;
  checkedOut: number;
  cancelled: number;
}
