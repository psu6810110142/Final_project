import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, X, ShoppingBag, CheckCircle } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = async (notif: any) => {
    if (!notif.is_read) await markRead(notif.notification_id);
    setOpen(false);
    if (notif.order_id) navigate('/my-courses');
  };

  const typeConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
    payment_approved: { color: '#065f46', bg: '#d1fae5', icon: <CheckCircle size={16} color="#10b981" /> },
    payment_rejected: { color: '#991b1b', bg: '#fee2e2', icon: <X size={16} color="#ef4444" /> },
    general:          { color: '#1e40af', bg: '#dbeafe', icon: <Bell size={16} color="#3b82f6" /> },
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button onClick={() => setOpen(o => !o)}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'background .2s' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.15)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
        <Bell size={22} />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: '2px', right: '2px', minWidth: '18px', height: '18px', backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: '800', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid #1e293b' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ position: 'absolute', top: '48px', right: 0, width: '340px', backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 10px 40px rgba(0,0,0,.18)', border: '1px solid #e2e8f0', zIndex: 9999, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} color="#3b82f6" /> การแจ้งเตือน
              {unreadCount > 0 && (
                <span style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: '800', padding: '2px 7px', borderRadius: '999px' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                style={{ fontSize: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                <CheckCheck size={14} /> อ่านทั้งหมด
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                <Bell size={32} style={{ opacity: .3, marginBottom: '8px' }} />
                <div>ไม่มีการแจ้งเตือน</div>
              </div>
            ) : notifications.map(notif => {
              const cfg = typeConfig[notif.type] || typeConfig.general;
              return (
                <div key={notif.notification_id}
                  onClick={() => handleClick(notif)}
                  style={{ padding: '14px 16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', backgroundColor: notif.is_read ? 'white' : '#eff6ff', transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = notif.is_read ? 'white' : '#eff6ff')}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: notif.is_read ? '500' : '700', color: '#1e293b', fontSize: '13px', marginBottom: '3px' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>{notif.message}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                        {new Date(notif.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {!notif.is_read && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0, marginTop: '6px' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
              <button onClick={() => { navigate('/my-courses'); setOpen(false); }}
                style={{ fontSize: '13px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ShoppingBag size={14} /> ดูคอร์สของฉัน
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
