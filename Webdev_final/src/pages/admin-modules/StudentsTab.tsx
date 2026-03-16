import { Search, ChevronRight, X, Edit, Trash2, CheckCircle, ShoppingCart } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useConfirm } from './ConfirmDialog';
import type { UserData, OrderData, CourseData, LearningProgressData } from './types';
import { mockLevels, getImageUrl, getLevelName } from './types';

interface Props {
  users: UserData[];
  orders: OrderData[];
  courses: CourseData[];
  progressData: LearningProgressData[];
  onRefresh: () => void;
  userRole?: string;
}

const StudentsTab: React.FC<Props> = ({ users, orders, courses, progressData, onRefresh, userRole = 'ADMIN' }) => {
  const [searchText, setSearchText] = useState('');
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [localOrders, setLocalOrders] = useState<OrderData[]>(orders);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState<UserData | null>(null);
  const [cartCounts, setCartCounts] = useState<Record<number, number>>({});

  // โหลด cart count เฉพาะ ADMIN
  useEffect(() => {
    if (userRole !== 'ADMIN' || !users.length) return;
    const fetchCarts = async () => {
      const results = await Promise.allSettled(users.map(u => api.get(`/cart-items/user/${u.user_id}`)));
      const counts: Record<number, number> = {};
      results.forEach((r, i) => {
        counts[users[i].user_id] = r.status === 'fulfilled' && Array.isArray(r.value.data) ? r.value.data.length : 0;
      });
      setCartCounts(counts);
    };
    fetchCarts();
  }, [users, userRole]);

  React.useEffect(() => { setLocalOrders(orders); }, [orders]);

  const getStudentCourses = (userId: number) => {
    const userOrders = localOrders.filter(o => o.user_id === userId && o.status === 'COMPLETED');
    const courseIds = userOrders.map(o => o.total_amount);
    return progressData.filter(p => (p as any).user?.user_id === userId || (p as any).user_id === userId);
  };

  const openEdit = (student: UserData) => {
    setSelectedStudent(student);
    setFormData({
      ...student,
      level_id: (student as any).level?.level_id || student.level_id || '',
    });
    setIsModalOpen(true);
  };

  const openDetail = (student: UserData) => {
    setDetailStudent(student);
    setDetailOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, String(v)); });
      await api.patch(`/users/${formData.user_id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsModalOpen(false);
      onRefresh();
    } catch { alert('บันทึกไม่สำเร็จ'); }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({ title: 'ลบนักเรียน', message: 'ยืนยันการลบบัญชีนี้?', confirmText: 'ลบ', variant: 'danger' });
    if (!ok) return;
    try { await api.delete(`/users/${id}`); onRefresh(); }
    catch { alert('ลบไม่สำเร็จ'); }
  };

  const filteredUsers = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {ConfirmDialogComponent}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b' }}>รายชื่อนักเรียน ({users.length})</h1>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input type="text" placeholder="ค้นหาชื่อ หรือ อีเมล..." value={searchText} onChange={e => setSearchText(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} />
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>นักเรียน</th>
              {userRole === 'ADMIN' && (
                <th style={{ padding: '16px 18px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>ตะกร้า</th>
              )}
              <th style={{ padding: '16px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>ระดับชั้น</th>
              <th style={{ padding: '16px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>ความคืบหน้า</th>
              <th style={{ padding: '16px 18px', textAlign: 'right', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr><td colSpan={userRole === 'ADMIN' ? 5 : 4} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>ไม่มีนักเรียน</td></tr>
            )}
            {filteredUsers.map(student => {
              const stdProgress = progressData.filter(p => (p as any).user?.user_id === student.user_id || (p as any).user_id === student.user_id);
              const completed = stdProgress.filter(p => p.is_completed).length;
              const total = stdProgress.length;
              return (
                <tr key={student.user_id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => openDetail(student)}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, backgroundColor: '#3b82f6',
                        backgroundImage: student.profile_picture_url ? `url(http://localhost:3001${student.profile_picture_url})` : undefined,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                        {!student.profile_picture_url && (student.full_name?.charAt(0) || '?')}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{student.full_name || student.username || 'ไม่ระบุชื่อ'}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{student.email}</div>
                      </div>
                    </div>
                  </td>
                  {userRole === 'ADMIN' && (
                    <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                      {cartCounts[student.user_id] > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#f0fdf4', color: '#16a34a', padding: '3px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                          <ShoppingCart size={12} /> {cartCounts[student.user_id]}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '12px' }}>-</span>
                      )}
                    </td>
                  )}
                  <td style={{ padding: '16px 18px', fontSize: '13px', color: '#475569' }}>
                    {student.level?.level_name || getLevelName(student.level_id) || '-'}
                  </td>
                  <td style={{ padding: '16px 18px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {total > 0 ? `${completed}/${total} บทเรียน` : 'ยังไม่มีข้อมูล'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(student)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#334155' }}>
                        <Edit size={13} /> แก้ไข
                      </button>
                      <button onClick={() => handleDelete(student.user_id)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#ef4444' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal แก้ไข */}
      {isModalOpen && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>แก้ไขข้อมูลนักเรียน</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-close"><X /></button>
            </div>
            <form onSubmit={handleSave} className="form-wrapper">
              <div className="form-group">
                <label>ชื่อ-นามสกุล</label>
                <input className="form-input" value={formData.full_name || ''} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>อีเมล</label>
                <input className="form-input" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>เบอร์โทร</label>
                <input className="form-input" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>ระดับชั้น</label>
                <select className="form-input" value={formData.level_id || ''} onChange={e => setFormData({ ...formData, level_id: e.target.value ? +e.target.value : '' })}>
                  <option value="">-- ไม่ระบุ --</option>
                  {mockLevels.map(l => (
                    <option key={l.level_id} value={l.level_id}>{l.level_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>วิชาที่สนใจ</label>
                <select className="form-input" value={formData.interesting_subject || ''} onChange={e => setFormData({ ...formData, interesting_subject: e.target.value })}>
                  <option value="">-- ไม่ระบุ --</option>
                  <option value="math">คณิตศาสตร์</option>
                  <option value="science">วิทยาศาสตร์</option>
                  <option value="english">ภาษาอังกฤษ</option>
                  <option value="thai">ภาษาไทย</option>
                  <option value="social">สังคมศึกษา</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">ยกเลิก</button>
                <button type="submit" className="btn-save">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTab;