import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, User, BookOpen, Briefcase, Phone } from 'lucide-react';
import api from '../../api';
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

const InstructorsTab: React.FC<Props> = ({ instructors, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<InstructorData>(emptyInstructor);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
        // ✅ Backend: POST /instructors ไม่รับ file → สร้างก่อน แล้ว PATCH รูปทีหลัง
        const createRes = await api.post('/instructors', {
          name: formData.name,
          bio: formData.bio || '',
          education: formData.education || '',
          experience: formData.experience || '',
          subject_taught: formData.subject_taught || '',
          contact_info: formData.contact_info || '',
          is_active: formData.is_active,
        });

        // ถ้ามีรูป ให้ PATCH ต่อทันที
        if (formData.profile_image_file && createRes.data?.instructor_id) {
          const fd = new FormData();
          fd.append('profile_picture', formData.profile_image_file);
          await api.patch(`/instructors/${createRes.data.instructor_id}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
        // ✅ PATCH รองรับทั้ง text fields และ file
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

  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันลบผู้สอนนี้?')) return;
    try { await api.delete(`/instructors/${id}`); onRefresh(); }
    catch { alert('ไม่สามารถลบได้ อาจมีคอร์สที่ผูกอยู่'); }
  };

  const getDisplayAvatar = (instructor: InstructorData) => getImageUrl(instructor.profile_image_url);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b' }}>จัดการผู้สอน ({instructors.length})</h1>
        <button onClick={openAdd} className="btn-hero" style={{ padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> เพิ่มผู้สอน
        </button>
      </div>

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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'เพิ่มผู้สอนใหม่' : 'แก้ไขข้อมูลผู้สอน'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-close"><X /></button>
            </div>
            <form onSubmit={handleSave} className="form-wrapper">
              {/* Profile image */}
              <div className="form-group">
                <label>รูปโปรไฟล์</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: '#e2e8f0',
                    backgroundImage: profilePreview
                      ? `url(${profilePreview})`
                      : formData.profile_image_url
                        ? `url(${getImageUrl(formData.profile_image_url)})`
                        : undefined,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #e2e8f0',
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
    </div>
  );
};

export default InstructorsTab;