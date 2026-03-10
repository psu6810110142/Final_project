import React, { useEffect, useRef, useState, useCallback } from 'react';

type DialogVariant = 'danger' | 'warning' | 'success' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

const icons: Record<DialogVariant, React.ReactNode> = {
  danger: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

const variantStyles: Record<DialogVariant, { iconBg: string; iconColor: string; confirmBg: string; ring: string }> = {
  danger:  { iconBg: '#fef2f2', iconColor: '#ef4444', confirmBg: '#ef4444', ring: 'rgba(239,68,68,0.2)' },
  warning: { iconBg: '#fffbeb', iconColor: '#f59e0b', confirmBg: '#f59e0b', ring: 'rgba(245,158,11,0.2)' },
  success: { iconBg: '#f0fdf4', iconColor: '#10b981', confirmBg: '#10b981', ring: 'rgba(16,185,129,0.2)' },
  info:    { iconBg: '#eff6ff', iconColor: '#3b82f6', confirmBg: '#3b82f6', ring: 'rgba(59,130,246,0.2)' },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, title, message,
  confirmText = 'ยืนยัน', cancelText = 'ยกเลิก',
  variant = 'danger', onConfirm, onCancel,
}) => {
  const s = variantStyles[variant];

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes cdOverlay { from { opacity:0 } to { opacity:1 } }
        @keyframes cdSlide   { from { opacity:0; transform:translateY(16px) scale(.96) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes cdIcon    { 0%{transform:scale(.4);opacity:0} 70%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
        .cd-overlay { position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.6);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;animation:cdOverlay .18s ease }
        .cd-box { background:#fff;border-radius:20px;box-shadow:0 32px 80px rgba(0,0,0,.22),0 0 0 1px rgba(0,0,0,.05);width:100%;max-width:400px;animation:cdSlide .22s cubic-bezier(.34,1.4,.64,1);overflow:hidden }
        .cd-body { padding:32px 28px 20px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center }
        .cd-icon { width:68px;height:68px;border-radius:50%;display:flex;align-items:center;justify-content:center;animation:cdIcon .3s cubic-bezier(.34,1.4,.64,1) .08s both }
        .cd-icon svg { width:30px;height:30px }
        .cd-title { font-size:18px;font-weight:700;color:#0f172a;letter-spacing:-.3px;margin:0 }
        .cd-msg { font-size:14px;color:#64748b;line-height:1.65;margin:0 }
        .cd-hr { height:1px;background:#f1f5f9;margin:0 }
        .cd-footer { display:flex;gap:10px;padding:16px 24px 20px }
        .cd-btn { flex:1;padding:11px 16px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;border:none;transition:all .15s }
        .cd-cancel { background:#f1f5f9;color:#475569 }
        .cd-cancel:hover { background:#e2e8f0 }
        .cd-ok { color:#fff }
        .cd-ok:hover { filter:brightness(1.1);transform:translateY(-1px) }
        .cd-ok:active { transform:translateY(0) }
      `}</style>
      <div className="cd-overlay" onClick={onCancel}>
        <div className="cd-box" onClick={e => e.stopPropagation()}>
          <div className="cd-body">
            <div className="cd-icon" style={{ backgroundColor: s.iconBg, color: s.iconColor, boxShadow: `0 0 0 10px ${s.ring}` }}>
              {icons[variant]}
            </div>
            <p className="cd-title">{title}</p>
            <p className="cd-msg">{message}</p>
          </div>
          <div className="cd-hr" />
          <div className="cd-footer">
            <button className="cd-btn cd-cancel" onClick={onCancel}>{cancelText}</button>
            <button className="cd-btn cd-ok" style={{ backgroundColor: s.confirmBg, boxShadow: `0 4px 14px ${s.ring}` }} onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ===== useConfirm hook =====
interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
}

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ title: '', message: '' });
  const resolveRef = useRef<((val: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise(resolve => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(false);
  }, []);

  const ConfirmDialogComponent = (
    <ConfirmDialog
      isOpen={isOpen}
      title={options.title}
      message={options.message}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmDialogComponent };
};

export default ConfirmDialog;