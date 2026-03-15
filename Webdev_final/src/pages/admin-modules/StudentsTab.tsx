import React, { useState } from 'react';
import { Search, ChevronRight, X, Edit, Trash2, CheckCircle, ShoppingCart } from 'lucide-react';
import api from '../../api';
import { useConfirm } from './ConfirmDialog';

import type { UserData, OrderData, CourseData, LearningProgressData } from './types';
import { mockLevels, mockSubjects, getImageUrl, getLevelName } from './types';

interface Props {
  users: UserData[];
  orders: OrderData[];
  courses: CourseData[];
  progressData: LearningProgressData[];
  onRefresh: () => void;
}

const StudentsTab: React.FC<Props> = ({ users, orders, courses, progressData, onRefresh }) => {
  const [searchText, setSearchText] = useState('');
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [formData, setFormData] = useState<UserData | null>(null);
  // ✅ preview URL สำหรับรูปที่เพิ่งเลือก
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [localOrders, setLocalOrders] = useState<OrderData[]>(orders);

  // sync orders from props
  React.useEffect(() => { setLocalOrders(orders); }, [orders]);

  const getStudentCourses = (userId: number) => {
  return localOrders
    .filter(o => o.user_id === userId && o.status === 'COMPLETED')
    .map(order => {
      const matchedCourse = courses.find(c => Number(c.price) === Number(order.total_amount));
      const courseId = matchedCourse?.course_id ?? 0;

      const completedLessons = progressData.filter(p => {
        const pUserId = (p as any).user?.user_id;
        const pCourseId = (p as any).lesson?.course?.course_id;
        return pUserId === userId && pCourseId === courseId && p.is_completed;
      });

      const allLessonsInCourse = progressData.filter(p => {
        const pCourseId = (p as any).lesson?.course?.course_id;
        return pCourseId === courseId;
      });

      const totalKnown = allLessonsInCourse.length;
      const progressPercent = totalKnown > 0
        ? Math.round((completedLessons.length / totalKnown) * 100)
        : 0;

      return {
        order_id: order.order_id,
        course: matchedCourse || { title: 'คอร์สไม่ระบุ', price: order.total_amount, course_id: 0 } as Partial<CourseData>,
        progress: progressPercent,
        is_completed: progressPercent === 100,
      };
    });
};

  const fetchCart = async (userId: number) => {
    setCartLoading(true);
    try {
      const res = await api.get(`/cart-items/user/${userId}`);
      setCartItems(Array.isArray(res.data) ? res.data : []);
    } catch { setCartItems([]); }
    finally { setCartLoading(false); }
  };

  const openDetail = (student: UserData) => {
    setSelectedStudent(student);
    setFormData({ ...student, level_id: student.level?.level_id || 0, profile_image_file: null });
    setIsEditing(false);
    setShowCart(false);
    setCartItems([]);
    setProfilePreview(null);
    setIsModalOpen(true);
    fetchCart(student.user_id);
  };

  const handleProfileImageChange = (file: File | null) => {
    if (!formData) return;
    setFormData(prev => prev ? { ...prev, profile_image_file: file } : prev);
    if (file) {
      // ✅ แสดง preview ทันที
      setProfilePreview(URL.createObjectURL(file));
    } else {
      setProfilePreview(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    try {
      const fd = new FormData();
      fd.append('full_name', formData.full_name);
      fd.append('phone', formData.phone || '');
      fd.append('email', formData.email);
      if (formData.level_id && formData.level_id > 0) fd.append('level_id', String(formData.level_id));
      fd.append('interesting_subject', formData.interesting_subject || '');
      if (formData.profile_image_file) fd.append('profile_picture', formData.profile_image_file);

      await api.patch(`/users/${formData.user_id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('อัปเดตสำเร็จ');
      setIsEditing(false);
      onRefresh();
    } catch { alert('แก้ไขไม่สำเร็จ'); }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({ title: 'ลบนักเรียน', message: 'คุณแน่ใจหรือไม่? ข้อมูลนักเรียนจะถูกลบถาวร', confirmText: 'ลบเลย', variant: 'danger' });
    if (!ok) return;
    try { await api.delete(`/users/${id}`); setIsModalOpen(false); onRefresh(); }
    catch { alert('ลบไม่สำเร็จ'); }
  };

  const handleCancelCourse = async (orderId: number) => {
    const ok2 = await confirm({ title: 'ยกเลิกสิทธิ์คอร์ส', message: 'ยืนยันการยกเลิกสิทธิ์คอร์สนี้?', confirmText: 'ยกเลิกสิทธิ์', variant: 'warning' });
    if (!ok2) return;
    try {
      await api.delete(`/orders/${orderId}`);
      setLocalOrders(prev => prev.filter(o => o.order_id !== orderId));
    } catch { alert('ยกเลิกไม่สำเร็จ'); }
  };

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
    u.email.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b' }}>รายชื่อนักเรียน ({users.length})</h1>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ อีเมล..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box', // ✅ เพิ่มบรรทัดนี้
              padding: '10px 12px 10px 38px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              fontSize: '14px',
            }}
          />
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>นักเรียน</th>
              <th style={{ padding: '16px 18px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>ตะกร้า</th>
              <th style={{ padding: '16px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>ระดับชั้น</th>
              <th style={{ padding: '16px 18px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>ความคืบหน้า</th>
              <th style={{ padding: '16px 18px', textAlign: 'right', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(student => {
              const stdCourses = getStudentCourses(student.user_id);
              const completed = stdCourses.filter(c => c.is_completed).length;
              return (
                <tr key={student.user_id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => openDetail(student)}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                        backgroundColor: '#e2e8f0',
                        backgroundImage: student.profile_picture_url ? `url(${getImageUrl(student.profile_picture_url)})` : undefined,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', color: '#64748b', fontSize: '16px',
                      }}>
                        {!student.profile_picture_url && student.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#334155' }}>{student.full_name}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 18px', textAlign: 'center' }} onClick={e => { e.stopPropagation(); openDetail(student); setTimeout(() => setShowCart(true), 0); }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', cursor: 'pointer' }}
                      title="ดูตะกร้าสินค้า">
                      <ShoppingCart size={16} color="#10b981" />
                    </div>
                  </td>
                  <td style={{ padding: '16px 18px' }}>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
                      {student.level?.level_name || getLevelName(student.level_id)}
                    </span>
                  </td>
                  <td style={{ padding: '16px 18px', fontSize: '13px', color: '#64748b' }}>
                    จบแล้ว: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{completed}</span> / {stdCourses.length} คอร์ส
                  </td>
                  <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                    <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#3b82f6', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      ดูโปรไฟล์ <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ Student Detail Modal */}
      {isModalOpen && selectedStudent && formData && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '860px', padding: '0', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#1e293b', padding: '28px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  border: '3px solid #334155',
                  // ✅ ใช้ preview ถ้ามี ไม่งั้นใช้จาก server
                  backgroundImage: profilePreview
                    ? `url(${profilePreview})`
                    : selectedStudent.profile_picture_url
                      ? `url(${getImageUrl(selectedStudent.profile_picture_url)})`
                      : undefined,
                  backgroundColor: '#334155',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '28px', fontWeight: 'bold',
                }}>
                  {!profilePreview && !selectedStudent.profile_picture_url && selectedStudent.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: '0', color: 'white', fontSize: '20px' }}>{selectedStudent.full_name}</h2>
                  <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>{selectedStudent.email}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={26} /></button>
            </div>

            {/* Body */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', minHeight: '400px', backgroundColor: '#f8fafc' }}>
              {/* Left: Course history */}
              <div style={{ padding: '28px', borderRight: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                    {showCart ? `ตะกร้าสินค้า (${cartItems.length})` : `ประวัติการเรียนรู้ (${getStudentCourses(selectedStudent.user_id).length} คอร์ส)`}
                  </h3>
                  <button onClick={() => setShowCart(p => !p)}
                    style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: showCart ? '#eff6ff' : '#f8fafc', color: showCart ? '#3b82f6' : '#475569', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>
                    {showCart ? '📚 ประวัติ' : '🛒 ตะกร้า'}
                  </button>
                </div>
                <div style={{ maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
                  {showCart ? (
                    cartLoading ? (
                      <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>กำลังโหลด...</div>
                    ) : cartItems.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '14px' }}>ตะกร้าว่างเปล่า</div>
                    ) : cartItems.map((item: any, idx: number) => (
                      <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e2e8f0', backgroundImage: item.course?.cover_image_url ? `url(http://localhost:3001${item.course.cover_image_url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>{item.course?.title || 'ไม่ระบุ'}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>฿{Number(item.course?.price || 0).toLocaleString()}</div>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {new Date(item.added_at).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    ))
                  ) : (
                  <>
                  {getStudentCourses(selectedStudent.user_id).length === 0 && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '14px' }}>ยังไม่มีคอร์สที่ลงทะเบียน</div>
                  )}
                  {getStudentCourses(selectedStudent.user_id).map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b', flex: 1, paddingRight: '8px' }}>{item.course.title}</div>
                        {item.is_completed && <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />}
                      </div>
                      <div style={{ width: '100%', backgroundColor: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${item.progress}%`, backgroundColor: item.is_completed ? '#10b981' : '#3b82f6', height: '100%', borderRadius: '3px', transition: 'width 0.3s' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '6px', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>Progress: <strong>{item.progress}%</strong></span>
                        <button onClick={() => handleCancelCourse(item.order_id)}
                          style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}>
                          ยกเลิกคอร์ส
                        </button>
                      </div>
                    </div>
                  ))}
                  </>
                  )}
                </div>
              </div>

              {/* Right: Info / Edit form */}
              <div style={{ padding: '28px', backgroundColor: 'white' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b' }}>ข้อมูลส่วนตัว</h3>
                {isEditing ? (
                  <form onSubmit={handleUpdate}>
                    <div className="form-group">
                      <label style={{ fontSize: '12px' }}>รูปโปรไฟล์</label>
                      {/* ✅ Preview รูปใหม่ที่กำลังจะอัปโหลด */}
                      {(profilePreview || formData.profile_picture_url) && (
                        <div style={{ marginBottom: '8px' }}>
                          <img
                            src={profilePreview || getImageUrl(formData.profile_picture_url)}
                            alt="preview"
                            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                          />
                        </div>
                      )}
                      <input type="file" accept="image/*" className="form-input" style={{ marginBottom: '12px' }}
                        onChange={e => handleProfileImageChange(e.target.files?.[0] || null)} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '12px' }}>ชื่อ-นามสกุล</label>
                      <input className="form-input" style={{ marginBottom: '12px' }} value={formData.full_name}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '12px' }}>เบอร์โทรศัพท์</label>
                      <input className="form-input" style={{ marginBottom: '12px' }} value={formData.phone || ''}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '12px' }}>ระดับชั้น</label>
                      <select className="form-select" style={{ marginBottom: '16px' }} value={formData.level_id}
                        onChange={e => setFormData({ ...formData, level_id: +e.target.value })}>
                        <option value={0}>เลือก...</option>
                        {mockLevels.map(l => <option key={l.level_id} value={l.level_id}>{l.level_name}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" className="btn-save" style={{ flex: 1 }}>บันทึก</button>
                      <button type="button" onClick={() => { setIsEditing(false); setProfilePreview(null); }} className="btn-cancel" style={{ flex: 1 }}>ยกเลิก</button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>ระดับชั้น</div>
                      <strong style={{ color: '#334155' }}>{selectedStudent.level?.level_name || getLevelName(selectedStudent.level_id)}</strong>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>เบอร์โทรศัพท์</div>
                      <strong style={{ color: '#334155' }}>{selectedStudent.phone || '-'}</strong>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>วิชาที่สนใจ</div>
                      <strong style={{ color: '#334155' }}>
                        {mockSubjects.find(s => s.value === selectedStudent.interesting_subject)?.label || selectedStudent.interesting_subject || '-'}
                      </strong>
                    </div>
                    <button onClick={() => setIsEditing(true)} className="btn-hero" style={{ width: '100%', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Edit size={15} /> แก้ไขข้อมูล
                    </button>
                    <button onClick={() => handleDelete(selectedStudent.user_id)}
                      style={{ width: '100%', padding: '10px', color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px' }}>
                      <Trash2 size={15} /> ลบนักเรียน
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {ConfirmDialogComponent}
    </div>
  );
};

export default StudentsTab;