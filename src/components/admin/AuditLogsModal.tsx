import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types';
import { fetchAdminAuditLogs } from '../../services/api';
import { X, Shield, Activity, RefreshCw, CheckCircle2, XCircle, Search } from 'lucide-react';

interface AuditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogsModal: React.FC<AuditLogsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminAuditLogs();
      if (res.success && res.logs) {
        setLogs(res.logs);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((l) => {
    const q = searchTerm.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.actor.toLowerCase().includes(q) ||
      (l.ip && l.ip.includes(q))
    );
  });

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN')}`;
    } catch {
      return ts;
    }
  };

  return (
    <div
      id="audit-logs-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="audit-logs-modal"
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#D5E4DC] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#124C3B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10">
              <Activity className="w-5 h-5 text-[#8CD1B0]" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Nhật Ký Hoạt Động & Bảo Mật (Audit Logs)</h3>
              <p className="text-xs text-[#C5E2D4]">
                Theo dõi tất cả thao tác quản trị và các lượt tra cứu khách hàng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[#C5E2D4] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-[#FAF9F4] border-b border-[#E8F1EC] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#7A9386] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm nhật ký..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#D5E2DA] rounded-xl text-xs outline-none focus:border-[#0F5B43]"
            />
          </div>

          <button
            type="button"
            onClick={loadLogs}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5E2DA] hover:bg-[#FAF9F4] text-xs font-semibold text-[#3C5648] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>

        {/* List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 divide-y divide-[#EEF5F1] space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#7A9386]">
              {isLoading ? 'Đang tải nhật ký...' : 'Không có bản ghi nhật ký nào.'}
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="pt-2 pb-2 text-xs flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1">
                  {log.status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#0F5B43] bg-[#E8F1EC] px-1.5 py-0.5 rounded text-[10px]">
                        {log.action}
                      </span>
                      <span className="text-[#657E71]">{log.actor}</span>
                      {log.ip && <span className="text-[10px] text-[#8EA69A]">({log.ip})</span>}
                    </div>
                    <p className="text-[#2C4638] font-medium leading-relaxed">{log.details}</p>
                  </div>
                </div>

                <div className="text-[11px] text-[#7A9386] whitespace-nowrap">
                  {formatTimestamp(log.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#FAF9F4] border-t border-[#E8F1EC] text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#52635A] hover:bg-[#EAE8DE]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
