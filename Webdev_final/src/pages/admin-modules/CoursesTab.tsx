import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react';
import api from '../../api';
import { useConfirm } from './ConfirmDialog';

import type { CourseData, InstructorData } from './types';
import { mockLevels, getImageUrl } from './types';

interface Props {
  courses: CourseData[];
  instructors: InstructorData[];
  onRefresh: () => void;
}

const emptyCourse: CourseData = {
  course_id: 0, title: '', description: '', price: 0,
  duration_weeks: 0, level_id: 0, instructor_id: 0,
  cover_image_file: null, material_file: null, exercise_file: null,
};

const CoursesTab: React.FC<Props> = ({ courses, instructors, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<CourseData>(emptyCourse);
  // ✅ preview URLs for immediate display after file selection
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const openAdd = () => {
    setModalMode('add');
    setFormData(emptyCourse);
    setCoverPreview(null);
    setIsModalOpen(true);
  };

  const openEdit = (course: CourseData) => {
    setModalMode('edit');
    setFormData({ ...course, level_id: course.level?.level_id || 0, instructor_id: course.instructor?.instructor_id || 0, cover_image_file: null, material_file: null, exercise_file: null });
    setCoverPreview(null); // will fall back to existing URL
    setIsModalOpen(true);
  };

  const handleCoverChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, cover_image_file: file }));
    if (file) {
      // ✅ สร้าง object URL เพื่อ preview ทันที
      const objectUrl = URL.createObjectURL(file);
      setCoverPreview(objectUrl);
    } else {
      setCoverPreview(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('price', String(formData.price));
      fd.append('duration_weeks', String(formData.duration_weeks));
      if (formData.level_id && formData.level_id > 0) fd.append('level_id', String(formData.level_id));
      if (formData.instructor_id && formData.instructor_id > 0) fd.append('instructor_id', String(formData.instructor_id));
      if (formData.cover_image_file) fd.append('cover_image', formData.cover_image_file);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (modalMode === 'add') await api.post('/courses', fd, config);
      else await api.patch(`/courses/${formData.course_id}`, fd, config);

      setIsModalOpen(false);
      onRefresh();
    } catch {
      alert('บันทึกคอร์สไม่สำเร็จ');
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({ title: 'ลบคอร์ส', message: 'คุณแน่ใจหรือไม่? การลบคอร์สจะลบบทเรียนทั้งหมดด้วย', confirmText: 'ลบเลย', variant: 'danger' });
    if (!ok) return;
    try { await api.delete(`/courses/${id}`); onRefresh(); }
    catch { alert('ลบไม่สำเร็จ'); }
  };

  // ✅ ฟังก์ชันหา URL รูปที่ถูกต้อง: ถ้ามี preview ใช้ preview, ไม่งั้นใช้จาก server
  const getCoverDisplayUrl = (course: CourseData) => getImageUrl(course.cover_image_url);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b' }}>จัดการคอร์สเรียน ({courses.length})</h1>
        <button onClick={openAdd} className="btn-hero" style={{ padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> เพิ่มคอร์สใหม่
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {courses.map(course => (
          <div key={course.course_id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {/* ✅ รูปหน้าปกคอร์ส */}
            <div style={{
              height: '160px',
              backgroundColor: '#e2e8f0',
              backgroundImage: getCoverDisplayUrl(course) ? `url(${getCoverDisplayUrl(course)})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              fontSize: '13px',
            }}>
              {!getCoverDisplayUrl(course) && 'ไม่มีรูปหน้าปก'}
            </div>
            <div style={{ padding: '16px' }}>
              <span style={{ fontSize: '10px', backgroundColor: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px', marginBottom: '8px', display: 'inline-block' }}>
                {course.level?.level_name || '-'}
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px', color: '#1e293b' }}>{course.title}</h3>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>สอนโดย: {course.instructor?.name || 'ไม่ระบุ'}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{course.duration_weeks} สัปดาห์</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>฿{Number(course.price).toLocaleString()}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEdit(course)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', background: 'white', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                    <Edit size={14} /> แก้ไข
                  </button>
                  <button onClick={() => handleDelete(course.course_id)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #fecaca', cursor: 'pointer', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'เพิ่มคอร์สใหม่' : 'แก้ไขคอร์ส'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-close"><X /></button>
            </div>
            <form onSubmit={handleSave} className="form-wrapper">
              <div className="form-group">
                <label>ชื่อคอร์ส *</label>
                <input className="form-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>รายละเอียด</label>
                <textarea className="form-textarea" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>ราคา (บาท)</label>
                  <input type="number" className="form-input" value={formData.price} onChange={e => setFormData({ ...formData, price: +e.target.value })} />
                </div>
                <div className="form-group">
                  <label>ระยะเวลา (สัปดาห์)</label>
                  <input type="number" className="form-input" value={formData.duration_weeks} onChange={e => setFormData({ ...formData, duration_weeks: +e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>ระดับชั้น</label>
                  <select className="form-select" value={formData.level_id} onChange={e => setFormData({ ...formData, level_id: +e.target.value })}>
                    <option value={0}>เลือก...</option>
                    {mockLevels.map(l => <option key={l.level_id} value={l.level_id}>{l.level_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>อาจารย์ผู้สอน</label>
                  <select className="form-select" value={formData.instructor_id} onChange={e => setFormData({ ...formData, instructor_id: +e.target.value })}>
                    <option value={0}>เลือก...</option>
                    {instructors.map(inst => <option key={inst.instructor_id} value={inst.instructor_id}>{inst.name}</option>)}
                  </select>
                </div>
              </div>

              {/* ✅ Upload section with preview */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px dashed #cbd5e1', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={15} /> อัปโหลดไฟล์
                </h4>
                <div className="form-group">
                  <label>รูปหน้าปก</label>
                  {/* ✅ Preview ทันทีหลังเลือกไฟล์ */}
                  {(coverPreview || formData.cover_image_url) && (
                    <div style={{ marginBottom: '8px' }}>
                      <img
                        src={coverPreview || getImageUrl(formData.cover_image_url)}
                        alt="preview"
                        style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                    </div>
                  )}
                  <input type="file" accept="image/*" className="form-input"
                    onChange={e => handleCoverChange(e.target.files?.[0] || null)}
                  />
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 0' }}>
                  📁 ไฟล์เอกสารและแบบฝึกหัดจัดการได้ที่เมนู "จัดการบทเรียน"
                </p>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">ยกเลิก</button>
                <button type="submit" className="btn-save">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {ConfirmDialogComponent}
    </div>
  );
};

export default CoursesTab;