import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { loginAdmin } from '../../services/api';
import { Shield, Lock, User, Loader2, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

interface AdminLoginViewProps {
  onLoginSuccess: () => void;
  onBackToCustomer: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onBackToCustomer,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginAdmin(username.trim(), password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    } catch {
      setErrorMessage('Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFillDemo = () => {
    setUsername('admin@lahotel.vn');
    setPassword('lahotel@2026');
    setErrorMessage(null);
  };

  return (
    <div id="admin-login-view" className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl border border-[#DFECE4] relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8F1EC] rounded-bl-full -z-0 opacity-70"></div>

        {/* Top Header */}
        <div className="relative z-10 text-center space-y-3 mb-8">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F1EC] text-[#0F5B43] text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Khu Vực Quản Trị Khách Sạn</span>
          </div>

          <h2 id="admin-login-title" className="text-xl sm:text-2xl font-bold text-[#0F5B43] font-display">
            Tài khoản quản lý
          </h2>
          <p className="text-xs text-[#5C7769]">Đăng nhập để quản lý danh sách đặt phòng và hướng dẫn nhận phòng</p>
        </div>

        {/* Quick Demo Helper */}
        <div className="relative z-10 mb-6 p-3 rounded-2xl bg-[#FAF9F4] border border-[#E2EAE5] flex items-center justify-between text-xs">
          <div className="text-[#466052] space-y-0.5">
            <span className="font-semibold block">Tài khoản demo:</span>
            <span className="font-mono text-[11px] text-[#0F5B43]">admin@lahotel.vn / lahotel@2026</span>
          </div>
          <button
            id="btn-quick-fill-admin"
            type="button"
            onClick={handleQuickFillDemo}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#E8F1EC] text-[#0F5B43] font-bold text-xs hover:bg-[#D7E8DD] transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#0F5B43]" />
            Điền thử
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            id="admin-login-error"
            className="relative z-10 mb-6 p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div>
            <label htmlFor="admin-username" className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1.5">
              Email / Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D9487]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@lahotel.vn hoặc admin"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white focus:ring-2 focus:ring-[#0F5B43]/15 rounded-xl text-sm font-medium text-[#1F2924] placeholder-[#90A79B] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-[#354D41] mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D9487]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#FAF9F4] border border-[#D5E4DC] focus:border-[#0F5B43] focus:bg-white focus:ring-2 focus:ring-[#0F5B43]/15 rounded-xl text-sm font-medium text-[#1F2924] placeholder-[#90A79B] outline-none transition-all"
              />
            </div>
          </div>

          <button
            id="btn-admin-login"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F5B43] hover:bg-[#156E52] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg disabled:opacity-75 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>ĐĂNG NHẬP</span>
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="relative z-10 text-center mt-6 pt-4 border-t border-[#EEF5F1]">
          <button
            type="button"
            onClick={onBackToCustomer}
            className="text-xs text-[#557163] hover:text-[#0F5B43] font-semibold hover:underline"
          >
            ← Quay lại trang tra cứu khách hàng
          </button>
        </div>
      </div>
    </div>
  );
};
