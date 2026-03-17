import React, { useState, useEffect } from 'react';
import { Edit, Trash2, X, Search, ShoppingCart, BookOpen, ChevronDown, ChevronUp, Package, TrendingUp } from 'lucide-react';
import api from '../../api';
import { useConfirm } from './ConfirmDialog';
import { mockLevels, mockSubjects, getImageUrl, getLevelName } from './types';
import type { UserData, OrderData, CourseData, LearningProgressData } from './types';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<any>({});
  const { confirm, ConfirmDialogComponent } = useConfirm();

  // expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // cart data per user
  const [cartData, setCartData] = useState<Record<number, any[]>>({});
  const [cartLoading, setCartLoading] = useState<Set<number>>(new Set());

  // orders per user (raw with details)
  const [userOrdersData, setUserOrdersData] = useState<Record<number, any[]>>({});

  useEffect(() => {
    if (userRole !== 'ADMIN' || !users.length) return;
    fetchAllCarts();
  }, [users, userRole]);

  const fetchAllCarts = async () => {
    try {
      const res = await api.get('/cart-items');
      const all: any[] = Array.isArray(res.data) ? res.data : [];
      // group by user_id
      const grouped: Record<number, any[]> = {};
      all.forEach((item: any) => {
        const uid = item.user?.user_id ?? item.user_id;
        if (!uid) return;
        if (!grouped[uid]) grouped[uid] = [];
        grouped[uid].push(item);
      });
      setCartData(grouped);
    } catch { setCartData({}); }
  };

  const fetchUserOrders = async (userId: number) => {
    if (userOrdersData[userId]) return;
    try {
      const res = await api.get(`/orders/user/${userId}`);
      setUserOrdersData(prev => ({ ...prev, [userId]: Array.isArray(res.data) ? res.data : [] }));
    } catch {
      setUserOrdersData(prev => ({ ...prev, [userId]: [] }));
    }
  };

  const toggleRow = (userId: number) => {
    const next = new Set(expandedRows);
    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
      fetchUserOrders(userId);
    }
    setExpandedRows(next);
  };

  const openEdit = (student: UserData) => {
    setSelectedStudent(student);
    setFormData({
      ...student,
      level_id: (student as any).level?.level_id || student.level_id || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== undefined && k !== 'level' && k !== 'orders') {
          fd.append(k, String(v));
        }
      });
      await api.patch(`/users/${formData.user_id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsModalOpen(false);
      onRefresh();
    } catch { alert('บันทึกไม่สำเร็จ'); }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({ title: 'ลบนักเรียน', message: 'คุณแน่ใจหรือไม่?', confirmText: 'ลบเลย', variant: 'danger' });
    if (!ok) return;
    try { await api.delete(`/users/${id}`); onRefresh(); }
    catch { alert('ลบไม่สำเร็จ'); }
  };

  const filtered = users.filter(s =>
    s.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const getStudentProgress = (userId: number) => {
    const userOrders = userOrdersData[userId] || [];
    const completedOrders = userOrders.filter((o: any) => o.status === 'COMPLETED');
    const allLessonIds = new Set<number>();
    const completedLessonIds = new Set<number>();

    progressData.forEach((p: any) => {
      const pUserId = p.user?.user_id ?? p.user_id;
      if (pUserId !== userId) return;
      const lessonId = p.lesson?.lesson_id ?? p.lesson_id;
      if (lessonId) {
        allLessonIds.add(lessonId);
        if (p.is_completed) completedLessonIds.add(lessonId);
      }
    });

    return { completedOrders: completedOrders.length, completedLessons: completedLessonIds.size, totalLessons: allLessonIds.size };
  };

  const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
    COMPLETED:       { label: 'ชำระแล้ว',    color: '#065f46', bg: '#d1fae5' },
    WAITING_PAYMENT: { label: 'รอตรวจสอบ',  color: '#854d0e', bg: '#fef9c3' },
    REJECTED:        { label: 'ปฏิเสธ',      color: '#991b1b', bg: '#fee2e2' },
  };

  return (
    <div className="animate-fade-in">
      {ConfirmDialogComponent}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>รายชื่อนักเรียน</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>ทั้งหมด {filtered.length} คน</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input placeholder="ค้นหาชื่อ หรือ อีเมล..."
            value={searchText} onChange={e => setSearchText(e.target.value)}
            style={{ padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', width: '260px', outline: 'none' }} />
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '14px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>นักเรียน</th>
              <th style={{ padding: '14px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>คอร์ส & ความคืบหน้า</th>
              {userRole === 'ADMIN' && (
                <th style={{ padding: '14px 18px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>ตะกร้า</th>
              )}
              <th style={{ padding: '14px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>ระดับชั้น</th>
              <th style={{ padding: '14px 18px', textAlign: 'right', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={userRole === 'ADMIN' ? 5 : 4} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>ไม่มีนักเรียน</td></tr>
            )}
            {filtered.map((student) => {
              const cartItems = cartData[student.user_id] || [];
              const cartCount = cartItems.length;
              const isExpanded = expandedRows.has(student.user_id);
              const studentOrders = userOrdersData[student.user_id] || [];
              const progressStats = getStudentProgress(student.user_id);
              const completedCount = studentOrders.filter((o: any) => o.status === 'COMPLETED').length;

              return (
                <React.Fragment key={student.user_id}>
                  <tr style={{ borderTop: '1px solid #f1f5f9', transition: 'background .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>

                    {/* นักเรียน */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {(student as any).profile_picture_url ? (
                          <img src={(student as any).profile_picture_url.startsWith('http') ? (student as any).profile_picture_url : `http://localhost:3001${(student as any).profile_picture_url}`} alt={student.full_name}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>
                            {student.full_name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{student.full_name}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{student.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* คอร์ส & ความคืบหน้า */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#eff6ff', color: '#3b82f6', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
                          <BookOpen size={11} /> {completedCount} คอร์ส
                        </span>
                        {progressStats.totalLessons > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
                            <TrendingUp size={11} /> {progressStats.completedLessons}/{progressStats.totalLessons} บท
                          </span>
                        )}
                        {userRole === 'ADMIN' && (
                          <button onClick={() => toggleRow(student.user_id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '3px', backgroundColor: isExpanded ? '#f1f5f9' : 'transparent', color: '#64748b', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            {isExpanded ? 'ซ่อน' : 'ดูรายละเอียด'}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* ตะกร้า */}
                    {userRole === 'ADMIN' && (
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: cartCount > 0 ? '#ecfdf5' : '#f8fafc', color: cartCount > 0 ? '#059669' : '#94a3b8', border: `1px solid ${cartCount > 0 ? '#a7f3d0' : '#e2e8f0'}`, padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
                          <ShoppingCart size={12} />
                          {cartCount > 0 ? `${cartCount} รายการ` : 'ว่าง'}
                        </div>
                      </td>
                    )}

                    {/* ระดับชั้น */}
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569' }}>
                      {(student as any).level?.level_name || getLevelName(student.level_id) || '-'}
                    </td>

                    {/* จัดการ */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openEdit(student)}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#334155' }}>
                          <Edit size={13} /> แก้ไข
                        </button>
                        <button onClick={() => handleDelete(student.user_id)}
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', color: '#ef4444' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && userRole === 'ADMIN' && (
                    <tr style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                      <td colSpan={5} style={{ padding: '0' }}>
                        <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                          {/* ตะกร้าสินค้า */}
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <ShoppingCart size={14} color="#059669" /> ตะกร้าสินค้า ({cartItems.length} รายการ)
                            </h4>
                            {cartItems.length === 0 ? (
                              <div style={{ fontSize: '13px', color: '#94a3b8', padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>ตะกร้าว่าง</div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {cartItems.map((item: any, i: number) => (
                                  <div key={i} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{item.course?.title || 'ไม่ระบุ'}</div>
                                    <div style={{ fontSize: '13px', color: '#10b981', fontWeight: '700' }}>฿{Number(item.course?.price || 0).toLocaleString()}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* ประวัติคำสั่งซื้อ */}
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Package size={14} color="#3b82f6" /> ประวัติการเรียน & คำสั่งซื้อ
                            </h4>
                            {studentOrders.length === 0 ? (
                              <div style={{ fontSize: '13px', color: '#94a3b8', padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>ยังไม่มีคำสั่งซื้อ</div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                                {studentOrders.map((order: any) => {
                                  const cfg = statusLabel[order.status] || { label: order.status, color: '#475569', bg: '#f1f5f9' };
                                  return (
                                    <div key={order.order_id} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px 12px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>#{order.order_id}</span>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: cfg.color, backgroundColor: cfg.bg, padding: '2px 8px', borderRadius: '999px' }}>{cfg.label}</span>
                                      </div>
                                      {order.order_details?.map((d: any, i: number) => {
                                        // หา progress ของ lesson ในคอร์สนี้
                                        const courseId = d.course?.course_id;
                                        const courseLessons = progressData.filter((p: any) => {
                                          const pUserId = p.user?.user_id ?? p.user_id;
                                          const pCourseId = p.lesson?.course?.course_id;
                                          return pUserId === student.user_id && pCourseId === courseId;
                                        });
                                        const done = courseLessons.filter((p: any) => p.is_completed).length;
                                        const total = courseLessons.length;
                                        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                                        return (
                                          <div key={i} style={{ marginTop: '4px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                              <span style={{ fontWeight: '600', color: '#1e293b' }}>{d.course?.title || 'ไม่ระบุ'}</span>
                                              {order.status === 'COMPLETED' && (
                                                <span style={{ fontSize: '12px', color: pct === 100 ? '#16a34a' : '#64748b', fontWeight: '600' }}>
                                                  {pct === 100 ? 'จบแล้ว ✓' : `${pct}%`}
                                                </span>
                                              )}
                                            </div>
                                            {order.status === 'COMPLETED' && total > 0 && (
                                              <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '99px', marginTop: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct === 100 ? '#10b981' : '#3b82f6', borderRadius: '99px' }} />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
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
                <select className="form-input" value={formData.level_id || ''}
                  onChange={e => setFormData({ ...formData, level_id: e.target.value ? +e.target.value : '' })}>
                  <option value="">-- ไม่ระบุ --</option>
                  {mockLevels.map(l => (
                    <option key={l.level_id} value={l.level_id}>{l.level_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>วิชาที่สนใจ</label>
                <select className="form-input" value={formData.interesting_subject || ''}
                  onChange={e => setFormData({ ...formData, interesting_subject: e.target.value })}>
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