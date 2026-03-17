import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, User, BookOpen, Briefcase, Phone, UserPlus, KeyRound, Eye, EyeOff } from 'lucide-react';
import api from '../../api';
import { useConfirm } from './ConfirmDialog';
import type { InstructorData } from './types';
import { getImageUrl } from './types';

interface Props {
  instructors: InstructorData[];
  onRefresh: () => void;
}

const emptyInstructor: InstructorData = {
  instructor_id: 0, name: '', bio: '', education: '',
  experience: '', subject_taught: '', contact_info: '',
  profile_image_url: '', is_active: true, profile_image_file: null,
};

const emptyAccount = {
  username: '', email: '', password: '', confirmPassword: '',
  full_name: '', phone: '', instructor_id: 0,
};

const InstructorsTab: React.FC<Props> = ({ instructors, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkingInstructor, setLinkingInstructor] = useState<InstructorData | null>(null);
  const [instructorUsers, setInstructorUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [linking, setLinking] = useState(false);
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<InstructorData>(emptyInstructor);
  const [accountForm, setAccountForm] = useState(emptyAccount);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const openLinkModal = async (instructor: InstructorData) => {
    setLinkingInstructor(instructor);
    setSelectedUserId(instructor.user_id || 0);
    setIsLinkModalOpen(true);
    try {
      const res = await api.get('/users');
      const users = Array.isArray(res.data) ? res.data : [];
      setInstructorUsers(users.filter((u: any) => u.role === 'INSTRUCTOR'));
    } catch {
      setInstructorUsers([]);
    }
  };

  const handleLinkUser = async () => {
    if (!linkingInstructor) return;
    setLinking(true);
    try {
      const fd = new FormData();
      fd.append('user_id', selectedUserId ? String(selectedUserId) : '');
      await api.patch(`/instructors/${linkingInstructor.instructor_id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(selectedUserId
        ? `✅ ผูกบัญชีสำเร็จ! อาจารย์ "${linkingInstructor.name}" ผูกกับ account แล้ว`
        : `✅ ยกเลิกการผูกบัญชีสำเร็จ`);
      setIsLinkModalOpen(false);
      onRefresh();
    } catch {
      alert('ผูกบัญชีไม่สำเร็จ');
    } finally {
      setLinking(false);
    }
  };

  const openAdd = () => {
    setModalMode('add');
    setFormData(emptyInstructor);
    setProfilePreview(null);
    setIsModalOpen(true);
  };

  const openEdit = (instructor: InstructorData) => {
    setModalMode('edit');
    setFormData({ ...instructor, profile_image_file: null });
    setProfilePreview(null);
    setIsModalOpen(true);
  };

  const handleProfileImageChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, profile_image_file: file }));
    if (file) setProfilePreview(URL.createObjectURL(file));
    else setProfilePreview(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'add') {
        const createRes = await api.post('/instructors', {
          name: formData.name,
          bio: formData.bio || '',
          education: formData.education || '',
          experience: formData.experience || '',
          subject_taught: formData.subject_taught || '',
          contact_info: formData.contact_info || '',
          is_active: formData.is_active,
        });
        if (formData.profile_image_file && createRes.data?.instructor_id) {
          const fd = new FormData();
          fd.append('profile_picture', formData.profile_image_file);
          await api.patch(`/instructors/${createRes.data.instructor_id}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('bio', formData.bio || '');
        fd.append('education', formData.education || '');
        fd.append('experience', formData.experience || '');
        fd.append('subject_taught', formData.subject_taught || '');
        fd.append('contact_info', formData.contact_info || '');
        fd.append('is_active', String(formData.is_active));
        if (formData.profile_image_file) {
          fd.append('profile_picture', formData.profile_image_file);
        }
        await api.patch(`/instructors/${formData.instructor_id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setIsModalOpen(false);
      onRefresh();
    } catch {
      alert('บันทึกข้อมูลครูไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountForm.password !== accountForm.confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน');
      return;
    }
    if (accountForm.password.length < 6) {
      alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    setSaving(true);
    try {
      // 1. สร้าง user account
      const userRes = await api.post('/users/create-instructor', {
        username: accountForm.username,
        email: accountForm.email,
        password_hash: accountForm.password,
        full_name: accountForm.full_name,
        phone: accountForm.phone,
        role: 'INSTRUCTOR',
      });
      const newUserId = userRes.data?.user_id;

      // 2. ผูก user_id เข้า instructor profile ทันที เพื่อให้ filter คอร์สได้ถูกต้อง
      if (newUserId && accountForm.instructor_id) {
        const fd = new FormData();
        fd.append('user_id', String(newUserId));
        await api.patch(`/instructors/${accountForm.instructor_id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      alert(`✅ สร้างบัญชีอาจารย์ "${accountForm.full_name}" สำเร็จ!\nUsername: ${accountForm.username}\nPassword: ${accountForm.password}`);
      setAccountForm(emptyAccount);
      setIsAccountModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'สร้างบัญชีไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({ title: 'ลบผู้สอน', message: 'คุณแน่ใจหรือไม่? ข้อมูลผู้สอนจะถูกลบถาวร', confirmText: 'ลบเลย', variant: 'danger' });
    if (!ok) return;
    try { await api.delete(`/instructors/${id}`); onRefresh(); }
    catch { alert('ไม่สามารถลบได้ อาจมีคอร์สที่ผูกอยู่'); }
  };

  const getDisplayAvatar = (instructor: InstructorData) => getImageUrl(instructor.profile_image_url);

  return (
    <div className="animate-fade-in">
      {ConfirmDialogComponent}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b' }}>จัดการผู้สอน ({instructors.length})</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsAccountModalOpen(true)}
            style={{ padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
            <UserPlus size={18} /> สร้างบัญชีอาจารย์
          </button>
          <button onClick={openAdd} className="btn-hero" style={{ padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> เพิ่มโปรไฟล์ผู้สอน
          </button>
        </div>
      </div>

      {/* Instructor cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {instructors.map(instructor => (
          <div key={instructor.instructor_id} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '24px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{
                width: '80px', height: '80px', margin: '0 auto 12px', borderRadius: '50%',
                border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                backgroundColor: '#e2e8f0',
                backgroundImage: getDisplayAvatar(instructor) ? `url(${getDisplayAvatar(instructor)})` : undefined,
                backgroundSize: 'cover', backgroundPosition: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', fontWeight: 'bold', color: '#64748b',
              }}>
                {!getDisplayAvatar(instructor) && instructor.name.charAt(0).toUpperCase()}
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px' }}>{instructor.name}</h3>
              {instructor.subject_taught && (
                <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#3b82f6', padding: '2px 10px', borderRadius: '999px' }}>
                  {instructor.subject_taught}
                </span>
              )}
            </div>
            <div style={{ padding: '16px' }}>
              {instructor.education && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '13px', color: '#475569' }}>
                  <BookOpen size={14} style={{ marginTop: '2px', flexShrink: 0, color: '#8b5cf6' }} />
                  <span>{instructor.education}</span>
                </div>
              )}
              {instructor.experience && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '13px', color: '#475569' }}>
                  <Briefcase size={14} style={{ marginTop: '2px', flexShrink: 0, color: '#f59e0b' }} />
                  <span>{instructor.experience}</span>
                </div>
              )}
              {instructor.contact_info && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '13px', color: '#475569' }}>
                  <Phone size={14} style={{ marginTop: '2px', flexShrink: 0, color: '#10b981' }} />
                  <span>{instructor.contact_info}</span>
                </div>
              )}
              {instructor.bio && (
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 0', lineHeight: 1.5, borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  {instructor.bio}
                </p>
              )}
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
              <button onClick={() => openLinkModal(instructor)}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${instructor.user_id ? '#bbf7d0' : '#ddd6fe'}`, cursor: 'pointer', background: instructor.user_id ? '#f0fdf4' : '#f5f3ff', color: instructor.user_id ? '#16a34a' : '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                {instructor.user_id ? '🔗 มีบัญชี' : '🔑 ผูกบัญชี'}
              </button>
              <button onClick={() => openEdit(instructor)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', background: 'white', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}>
                <Edit size={14} /> แก้ไข
              </button>
              <button onClick={() => handleDelete(instructor.instructor_id)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #fecaca', cursor: 'pointer', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}>
                <Trash2 size={14} /> ลบ
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Modal สร้างบัญชีอาจารย์ ===== */}
      {isAccountModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="#8b5cf6" /> สร้างบัญชีอาจารย์
              </h2>
              <button onClick={() => setIsAccountModalOpen(false)} className="btn-close"><X /></button>
            </div>

            {/* แจ้งเตือน */}
            <div style={{ margin: '0 24px 16px', padding: '12px 16px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', fontSize: '13px', color: '#6d28d9' }}>
              💡 อาจารย์จะสามารถ login ด้วย Username/Password นี้ได้ทันที และมีสิทธิ์จัดการบทเรียน ข้อสอบ และให้เกรดได้
            </div>

            <form onSubmit={handleCreateAccount} className="form-wrapper">
              <div className="form-group">
                <label>เลือกอาจารย์จากระบบ *</label>
                <select className="form-input"
                  value={accountForm.instructor_id}
                  onChange={e => {
                    const id = Number(e.target.value);
                    const selected = instructors.find(i => i.instructor_id === id);
                    setAccountForm({
                      ...accountForm,
                      instructor_id: id,
                      full_name: selected?.name || '',
                      phone: selected?.contact_info || '',
                    });
                  }} required>
                  <option value={0}>-- เลือกอาจารย์ --</option>
                  {instructors.map(i => (
                    <option key={i.instructor_id} value={i.instructor_id}>{i.name}{i.subject_taught ? ` (${i.subject_taught})` : ''}</option>
                  ))}
                </select>
                {accountForm.full_name && (
                  <div style={{ marginTop: '6px', fontSize: '13px', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✅ เลือก: <strong>{accountForm.full_name}</strong>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input className="form-input" placeholder="เช่น teacher_somchai"
                    value={accountForm.username}
                    onChange={e => setAccountForm({ ...accountForm, username: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>อีเมล *</label>
                  <input className="form-input" type="email" placeholder="teacher@school.com"
                    value={accountForm.email}
                    onChange={e => setAccountForm({ ...accountForm, email: e.target.value })} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>รหัสผ่าน * (อย่างน้อย 6 ตัว)</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showPassword ? 'text' : 'password'}
                      placeholder="รหัสผ่านสำหรับ login"
                      value={accountForm.password}
                      onChange={e => setAccountForm({ ...accountForm, password: e.target.value })} required
                      style={{ paddingRight: '40px' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>ยืนยันรหัสผ่าน *</label>
                  <input className="form-input" type={showPassword ? 'text' : 'password'}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    value={accountForm.confirmPassword}
                    onChange={e => setAccountForm({ ...accountForm, confirmPassword: e.target.value })} required />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsAccountModalOpen(false)} className="btn-cancel">ยกเลิก</button>
                <button type="submit" disabled={saving}
                  style={{ padding: '10px 24px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'กำลังสร้าง...' : '✅ สร้างบัญชีอาจารย์'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Modal เพิ่ม/แก้ไขโปรไฟล์ผู้สอน ===== */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'เพิ่มโปรไฟล์ผู้สอน' : 'แก้ไขข้อมูลผู้สอน'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-close"><X /></button>
            </div>
            <form onSubmit={handleSave} className="form-wrapper">
              <div className="form-group">
                <label>รูปโปรไฟล์</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: '#e2e8f0',
                    backgroundImage: profilePreview ? `url(${profilePreview})` : formData.profile_image_url ? `url(${getImageUrl(formData.profile_image_url)})` : undefined,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e2e8f0',
                  }}>
                    {!profilePreview && !formData.profile_image_url && <User size={28} color="#94a3b8" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="file" accept="image/jpg,image/jpeg,image/png,image/gif" className="form-input"
                      onChange={e => handleProfileImageChange(e.target.files?.[0] || null)} />
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>JPG, PNG, GIF (max 2MB)</div>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>ชื่อ - นามสกุล *</label>
                <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>วิชาที่สอน</label>
                  <input className="form-input" placeholder="เช่น คณิตศาสตร์" value={formData.subject_taught} onChange={e => setFormData({ ...formData, subject_taught: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>ช่องทางติดต่อ</label>
                  <input className="form-input" placeholder="เบอร์โทร / อีเมล" value={formData.contact_info} onChange={e => setFormData({ ...formData, contact_info: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>ประวัติการศึกษา</label>
                <textarea className="form-textarea" rows={2} value={formData.education} onChange={e => setFormData({ ...formData, education: e.target.value })} />
              </div>
              <div className="form-group">
                <label>ประสบการณ์การสอน</label>
                <textarea className="form-textarea" rows={2} value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} />
              </div>
              <div className="form-group">
                <label>แนะนำตัว</label>
                <textarea className="form-textarea" rows={3} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                  เปิดใช้งาน (แสดงให้นักเรียนเห็น)
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">ยกเลิก</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Modal ผูกบัญชี ===== */}
      {isLinkModalOpen && linkingInstructor && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>🔗 ผูกบัญชีอาจารย์</h2>
              <button onClick={() => setIsLinkModalOpen(false)} className="btn-close"><X /></button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{linkingInstructor.name}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{linkingInstructor.subject_taught}</div>
                {linkingInstructor.user_id ? (
                  <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '6px' }}>✅ ผูกบัญชีอยู่แล้ว (user_id: {linkingInstructor.user_id})</div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '6px' }}>⚠️ ยังไม่มีบัญชี</div>
                )}
              </div>

              <div className="form-group">
                <label>เลือก Account อาจารย์ที่จะผูก</label>
                <select className="form-input" value={selectedUserId}
                  onChange={e => setSelectedUserId(Number(e.target.value))}>
                  <option value={0}>-- ไม่ผูกบัญชี (ยกเลิก) --</option>
                  {instructorUsers.map(u => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name || u.username} ({u.username}) — {u.email}
                    </option>
                  ))}
                </select>
                {instructorUsers.length === 0 && (
                  <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '6px' }}>
                    ⚠️ ยังไม่มี account role INSTRUCTOR ในระบบ กรุณาสร้างบัญชีอาจารย์ก่อน
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setIsLinkModalOpen(false)} className="btn-cancel">ยกเลิก</button>
              <button onClick={handleLinkUser} disabled={linking}
                style={{ padding: '10px 24px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: linking ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: linking ? 0.7 : 1 }}>
                {linking ? 'กำลังบันทึก...' : '🔗 ผูกบัญชี'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorsTab;