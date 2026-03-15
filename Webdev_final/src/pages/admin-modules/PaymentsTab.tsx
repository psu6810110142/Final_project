import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, X, Search } from 'lucide-react';
import api from '../../api';
import { useConfirm } from './ConfirmDialog';

import { getImageUrl } from './types';

interface PaymentData {
  payment_id: number;
  amount: number;
  slip_image_url: string;
  payment_date: string;
  status: 'PENDING' | 'PAID' | 'REJECTED';
  order: {
    order_id: number;
    total_amount: number;
    status: string;
    user: {
      user_id: number;
      full_name: string;
      email: string;
      phone: string;
    };
    order_details?: {
      course: { title: string; price: number };
    }[];
  };
}

const statusConfig = {
  PENDING:  { label: 'รอตรวจสอบ', color: '#92400e', bg: '#fef3c7', icon: Clock },
  PAID:     { label: 'ยืนยันแล้ว', color: '#065f46', bg: '#d1fae5', icon: CheckCircle },
  REJECTED: { label: 'ปฏิเสธ',     color: '#991b1b', bg: '#fee2e2', icon: XCircle },
};

const PaymentsTab: React.FC = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'PAID' | 'REJECTED'>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch { 
      console.error('fetch payments failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (paymentId: number, newStatus: 'PAID' | 'REJECTED') => {
    const ok = await confirm({ title: newStatus === 'PAID' ? 'อนุมัติการชำระเงิน' : 'ปฏิเสธการชำระเงิน', message: newStatus === 'PAID' ? 'ยืนยันการอนุมัติ? นักเรียนจะสามารถเข้าเรียนได้ทันที' : 'ยืนยันการปฏิเสธ? นักเรียนจะไม่สามารถเข้าเรียนได้', confirmText: newStatus === 'PAID' ? 'อนุมัติ' : 'ปฏิเสธ', variant: newStatus === 'PAID' ? 'success' : 'danger' });
    if (!ok) return;
    setProcessing(true);
    try {
      // Step 1: อัปเดต payment status
      const res = await api.patch(`/payments/${paymentId}`, { status: newStatus });
      console.log('payment update result:', res.data);

      // Step 2: sync order status ให้ตรงกับ payment เสมอ
      if (selectedPayment) {
        const orderId = selectedPayment.order?.order_id;
        if (orderId) {
          const orderStatus = newStatus === 'PAID' ? 'COMPLETED' : 'REJECTED';
          await api.patch(`/orders/${orderId}`, { status: orderStatus });
        }
      }

      await fetchPayments();
      // อัปเดต selectedPayment ให้แสดงสถานะใหม่
      setSelectedPayment(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err: any) {
      console.error('update error:', err.response?.data || err);
      alert('ดำเนินการไม่สำเร็จ: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const filtered = payments.filter(p => {
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchSearch = !searchText ||
      p.order?.user?.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      p.order?.user?.email?.toLowerCase().includes(searchText.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>กำลังโหลด...</div>;

  return (
    <div className="animate-fade-in">
      {ConfirmDialogComponent}
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>
            ตรวจสอบการชำระเงิน
          </h1>
          {pendingCount > 0 && (
            <div onClick={() => setFilterStatus('PENDING')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fef3c7', border: '1.5px solid #f59e0b', color: '#92400e', fontSize: '14px', fontWeight: '700', padding: '8px 16px', borderRadius: '999px', cursor: 'pointer', animation: 'pulse 2s infinite' }}>
              <Clock size={15} />
              <span>รอตรวจสอบ <strong>{pendingCount}</strong> รายการ — คลิกเพื่อดู</span>
            </div>
          )}
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text" placeholder="ค้นหาชื่อ / อีเมล..."
              value={searchText} onChange={e => setSearchText(e.target.value)}
              style={{ padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', width: '220px', outline: 'none' }}
            />
          </div>
          <select
            value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="ALL">ทุกสถานะ</option>
            <option value="PENDING">รอตรวจสอบ</option>
            <option value="PAID">ยืนยันแล้ว</option>
            <option value="REJECTED">ปฏิเสธ</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '14px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>ผู้ชำระเงิน</th>
              <th style={{ padding: '14px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>คอร์ส</th>
              <th style={{ padding: '14px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>ยอดเงิน</th>
              <th style={{ padding: '14px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>วันที่แจ้ง</th>
              <th style={{ padding: '14px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>สถานะ</th>
              <th style={{ padding: '14px 18px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>ไม่มีรายการชำระเงิน</td></tr>
            )}
            {filtered.map(payment => {
              const cfg = statusConfig[payment.status];
              const StatusIcon = cfg.icon;
              const courseName = payment.order?.order_details?.[0]?.course?.title || 'ไม่ระบุ';
              return (
                <tr key={payment.payment_id}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={{ padding: '16px 18px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                      {payment.order?.user?.full_name || 'ไม่ระบุ'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{payment.order?.user?.email}</div>
                  </td>
                  <td style={{ padding: '16px 18px', fontSize: '13px', color: '#475569', maxWidth: '180px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{courseName}</div>
                  </td>
                  <td style={{ padding: '16px 18px' }}>
                    <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '15px' }}>
                      ฿{Number(payment.amount).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ padding: '16px 18px', fontSize: '13px', color: '#64748b' }}>
                    {new Date(payment.payment_date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '16px 18px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: cfg.bg, color: cfg.color, padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
                      <StatusIcon size={12} /> {cfg.label}
                    </span>
                  </td>
                  <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#334155' }}>
                      <Eye size={14} /> ดูสลิป
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: ดูสลิป + อนุมัติ/ปฏิเสธ */}
      {selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2>ตรวจสอบสลิปการชำระเงิน</h2>
              <button onClick={() => setSelectedPayment(null)} className="btn-close"><X /></button>
            </div>
            <div style={{ padding: '24px' }}>
              {/* ข้อมูลผู้ชำระ */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '2px' }}>ชื่อผู้ชำระ</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{selectedPayment.order?.user?.full_name}</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '2px' }}>อีเมล</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{selectedPayment.order?.user?.email}</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '2px' }}>คอร์สที่สมัคร</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                      {selectedPayment.order?.order_details?.[0]?.course?.title || 'ไม่ระบุ'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '2px' }}>ยอดเงิน</div>
                    <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '16px' }}>
                      ฿{Number(selectedPayment.amount).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* รูปสลิป */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '10px' }}>
                  รูปสลิปการโอนเงิน
                </div>
                {selectedPayment.slip_image_url ? (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={getImageUrl(selectedPayment.slip_image_url)}
                      alt="slip"
                      style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                      onClick={() => window.open(getImageUrl(selectedPayment.slip_image_url), '_blank')}
                    />
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>คลิกที่รูปเพื่อดูขนาดเต็ม</div>
                  </div>
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    ไม่มีรูปสลิป
                  </div>
                )}
              </div>

              {/* สถานะปัจจุบัน */}
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>สถานะปัจจุบัน:</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  backgroundColor: statusConfig[selectedPayment.status].bg,
                  color: statusConfig[selectedPayment.status].color,
                  padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '600'
                }}>
                  {statusConfig[selectedPayment.status].label}
                </span>
              </div>

              {/* Action buttons — แสดงเฉพาะเมื่อยังเป็น PENDING */}
              {selectedPayment.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => handleUpdateStatus(selectedPayment.payment_id, 'PAID')}
                    disabled={processing}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', fontSize: '14px', cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: processing ? 0.7 : 1 }}>
                    <CheckCircle size={18} /> {processing ? 'กำลังดำเนินการ...' : 'อนุมัติการชำระเงิน'}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedPayment.payment_id, 'REJECTED')}
                    disabled={processing}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#ef4444', fontWeight: 'bold', fontSize: '14px', cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: processing ? 0.7 : 1 }}>
                    <XCircle size={18} /> ปฏิเสธ
                  </button>
                </div>
              )}

              {selectedPayment.status !== 'PENDING' && (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  รายการนี้ดำเนินการแล้ว
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTab;