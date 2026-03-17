import React, { useState, useEffect } from 'react';
import { Edit, Trash2, X, Search, ShoppingCart, BookOpen, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import api from '../../api';
import { useConfirm } from './ConfirmDialog';
import { mockLevels, getLevelName } from './types';
import type { UserData, OrderData, CourseData, LearningProgressData } from './types';

interface Props {
  users: UserData[];
  orders: OrderData[];
  courses: CourseData[];
  progressData: LearningProgressData[];
  onRefresh: () => void;
  userRole?: string;
}

const StudentsTab: React.FC<Props> = ({ users, orders: _orders, courses: _courses, progressData, onRefresh, userRole = 'ADMIN' }) => {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<any>({});
  const { confirm, ConfirmDialogComponent } = useConfirm();

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [cartData, setCartData] = useState<Record<number, any[]>>({});
  const [userOrdersData, setUserOrdersData] = useState<Record<number, any[]>>({});

  useEffect(() => {
    if (userRole !== 'ADMIN' || !users.length) return;
    // โหลด carts และ orders ของทุก student พร้อมกันตอน mount
    fetchAllCarts();
    fetchAllOrders(users);
  }, [users, userRole]);

  const fetchAllCarts = async () => {
    try {
      const res = await api.get('/cart-items');
      const all: any[] = Array.isArray(res.data) ? res.data : [];
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

  // ✅ โหลด orders ทุก student พร้อมกัน เพื่อแสดงจำนวนคอร์สได้ทันที
  const fetchAllOrders = async (studentList: UserData[]) => {
    try {
      const results = await Promise.all(
        studentList.map(s =>
          api.get(`/orders/user/${s.user_id}`)
            .then(r => ({ userId: s.user_id, data: Array.isArray(r.data) ? r.data : [] }))
            .catch(() => ({ userId: s.user_id, data: [] }))
        )
      );
      const grouped: Record<number, any[]> = {};
      results.forEach(({ userId, data }) => { grouped[userId] = data; });
      setUserOrdersData(grouped);
    } catch { }
  };


  const toggleRow = (userId: number) => {
    const next = new Set(expandedRows);
    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
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
        if (v !== null && v !== undefined && k !== 'level' && k !== 'orders' && k !== 'enrolled_courses') {
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

  // ✅ helper: นับคอร์สที่ลงทะเบียนจริง (รองรับทั้ง ADMIN และ INSTRUCTOR)
  const getEnrolledCourses = (student: any): any[] => {
    // INSTRUCTOR mode — ข้อมูลมาจาก enrolled_courses field โดยตรง
    if ((student as any).enrolled_courses) {
      return (student as any).enrolled_courses;
    }
    // ADMIN mode — นับจาก orders
    const studentOrders = userOrdersData[student.user_id] || [];
    const completed = studentOrders.filter((o: any) => o.status === 'COMPLETED');
    const allCourses: any[] = [];
    completed.forEach((o: any) => {
      (o.order_details || []).forEach((d: any) => {
        if (d.course && !allCourses.find((c: any) => c.course_id === d.course.course_id)) {
          allCourses.push({ course_id: d.course.course_id, title: d.course.title });
        }
      });
    });
    return allCourses;
  };

  // ✅ helper: progress ของนักเรียนใน course นี้
  const getCourseProgress = (userId: number, courseId: number) => {
    const courseLessons = progressData.filter((p: any) => {
      const pUserId = p.user?.user_id ?? p.user_id;
      const pCourseId = p.lesson?.course?.course_id;
      return pUserId === userId && pCourseId === courseId;
    });
    const done = courseLessons.filter((p: any) => p.is_completed).length;
    return { done, total: courseLessons.length, pct: courseLessons.length > 0 ? Math.round((done / courseLessons.length) * 100) : 0 };
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
              <th style={{ padding: '14px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>คอร์สที่ลงทะเบียน</th>
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
              const isExpanded = expandedRows.has(student.user_id);
              const enrolledCourses = getEnrolledCourses(student);
              const enrolledCount = enrolledCourses.length;

              // progress รวมทุก course
              let totalDone = 0, totalLessons = 0;
              enrolledCourses.forEach((c: any) => {
                const prog = getCourseProgress(student.user_id, c.course_id);
                totalDone += prog.done;
                totalLessons += prog.total;
              });

              // ระดับชั้น — รองรับทั้ง level object และ level_id
              const levelName = (student as any).level?.level_name
                || getLevelName(student.level_id)
                || '-';

              return (
                <React.Fragment key={student.user_id}>
                  <tr style={{ borderTop: '1px solid #f1f5f9', transition: 'background .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>

                    {/* นักเรียน */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {(student as any).profile_picture_url ? (
                          <img src={`http://localhost:3001${(student as any).profile_picture_url}`} alt={student.full_name}
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

                    {/* คอร์สที่ลงทะเบียน */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#eff6ff', color: '#3b82f6', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
                          <BookOpen size={11} /> {enrolledCount} คอร์ส
                        </span>
                        {totalLessons > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
                            <TrendingUp size={11} /> {totalDone}/{totalLessons} บท
                          </span>
                        )}
                        <button onClick={() => toggleRow(student.user_id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '3px', backgroundColor: isExpanded ? '#f1f5f9' : 'transparent', color: '#64748b', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          {isExpanded ? 'ซ่อน' : 'ดูคอร์ส'}
                        </button>
                      </div>
                    </td>

                    {/* ตะกร้า — ADMIN เท่านั้น */}
                    {userRole === 'ADMIN' && (
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: cartItems.length > 0 ? '#ecfdf5' : '#f8fafc', color: cartItems.length > 0 ? '#059669' : '#94a3b8', border: `1px solid ${cartItems.length > 0 ? '#a7f3d0' : '#e2e8f0'}`, padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' }}>
                          <ShoppingCart size={12} />
                          {cartItems.length > 0 ? `${cartItems.length} รายการ` : 'ว่าง'}
                        </div>
                      </td>
                    )}

                    {/* ระดับชั้น */}
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569' }}>
                      {levelName}
                    </td>

                    {/* จัดการ */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openEdit(student)}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#334155' }}>
                          <Edit size={13} /> แก้ไข
                        </button>
                        {userRole === 'ADMIN' && (
                          <button onClick={() => handleDelete(student.user_id)}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', color: '#ef4444' }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row — คอร์สและความคืบหน้า */}
                  {isExpanded && (
                    <tr style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                      <td colSpan={userRole === 'ADMIN' ? 5 : 4} style={{ padding: '0' }}>
                        <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: userRole === 'ADMIN' ? '1fr 1fr' : '1fr', gap: '16px' }}>

                          {/* คอร์สที่ลงทะเบียน + progress */}
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <BookOpen size={14} color="#3b82f6" /> คอร์สที่ลงทะเบียน ({enrolledCourses.length} คอร์ส)
                            </h4>
                            {enrolledCourses.length === 0 ? (
                              <div style={{ fontSize: '13px', color: '#94a3b8', padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>ยังไม่มีคอร์ส</div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {enrolledCourses.map((course: any) => {
                                  const prog = getCourseProgress(student.user_id, course.course_id);
                                  return (
                                    <div key={course.course_id} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px 14px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: prog.total > 0 ? '6px' : 0 }}>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{course.title}</span>
                                        <span style={{ fontSize: '12px', color: prog.pct === 100 ? '#16a34a' : '#64748b', fontWeight: '600' }}>
                                          {prog.total > 0 ? (prog.pct === 100 ? '✓ จบแล้ว' : `${prog.pct}%`) : 'ยังไม่เริ่ม'}
                                        </span>
                                      </div>
                                      {prog.total > 0 && (
                                        <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                                          <div style={{ width: `${prog.pct}%`, height: '100%', backgroundColor: prog.pct === 100 ? '#10b981' : '#3b82f6', borderRadius: '99px', transition: 'width .3s' }} />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* ตะกร้า — ADMIN เท่านั้น */}
                          {userRole === 'ADMIN' && (
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
                          )}

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