import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Video, ChevronLeft, Play, Paperclip, FileText, ClipboardList } from 'lucide-react';
import QuizCreator from './QuizCreator';
import api from '../../api';
import { useConfirm } from './ConfirmDialog';
import type { CourseData } from './types';
import { getImageUrl } from './types';

interface LessonData {
  lesson_id: number;
  title: string;
  video_url?: string;
  attachment_url?: string;
  sequence: number;
  course?: { course_id: number; title: string };
}

interface Props {
  courses: CourseData[];
}

const emptyLesson = {
  lesson_id: 0,
  title: '',
  sequence: 1,
  video_url: '',
  attachment_url: '',
  video_file: null as File | null,
  attachment_file: null as File | null,
};

const LessonsTab: React.FC<Props> = ({ courses }) => {
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState(emptyLesson);
  const [saving, setSaving] = useState(false);
  const [quizLesson, setQuizLesson] = useState<{ lesson_id: number; title: string } | null>(null);

  const fetchLessons = async (courseId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/lessons/course/${courseId}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setLessons(data.sort((a: LessonData, b: LessonData) => a.sequence - b.sequence));
    } catch {
      console.error('fetch lessons failed');
    } finally {
      setLoading(false);
    }
  };

  const selectCourse = (course: CourseData) => {
    setSelectedCourse(course);
    fetchLessons(course.course_id);
  };

  const openAdd = () => {
    setModalMode('add');
    setFormData({ ...emptyLesson, sequence: lessons.length + 1 });
    setIsModalOpen(true);
  };

  const openEdit = (lesson: LessonData) => {
    setModalMode('edit');
    setFormData({
      lesson_id: lesson.lesson_id,
      title: lesson.title,
      sequence: lesson.sequence,
      video_url: lesson.video_url || '',
      attachment_url: lesson.attachment_url || '',
      video_file: null,
      attachment_file: null,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('sequence', String(formData.sequence));
      if (formData.video_file) fd.append('video_file', formData.video_file);
      if (formData.attachment_file) fd.append('attachment_file', formData.attachment_file);

      if (modalMode === 'add') {
        fd.append('course_id', String(selectedCourse.course_id));
        await api.post('/lessons', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.patch(`/lessons/${formData.lesson_id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setIsModalOpen(false);
      fetchLessons(selectedCourse.course_id);
    } catch {
      alert('บันทึกบทเรียนไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lessonId: number) => {
    const ok = await confirm({ title: 'ลบบทเรียน', message: 'คุณแน่ใจหรือไม่? บทเรียนและไฟล์จะถูกลบถาวร', confirmText: 'ลบเลย', variant: 'danger' });
    if (!ok) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      fetchLessons(selectedCourse!.course_id);
    } catch { alert('ลบไม่สำเร็จ'); }
  };

  // ===== COURSE LIST VIEW =====
  if (!selectedCourse) {
    return (
      <div className="animate-fade-in">
        {ConfirmDialogComponent}
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>จัดการบทเรียน</h1>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>เลือกคอร์สที่ต้องการจัดการบทเรียน</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {courses.map(course => (
            <div key={course.course_id}
              onClick={() => selectCourse(course)}
              style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ height: '140px', backgroundImage: course.cover_image_url ? `url(${getImageUrl(course.cover_image_url)})` : undefined, backgroundColor: '#e2e8f0', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!course.cover_image_url && <Video size={32} color="#94a3b8" />}
              </div>
              <div style={{ padding: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>{course.title}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>สอนโดย: {course.instructor?.name || 'ไม่ระบุ'}</p>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6', fontSize: '13px', fontWeight: '500' }}>
                  <Play size={14} /> คลิกเพื่อจัดการบทเรียน
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ===== LESSON LIST VIEW =====
  return (
    <div className="animate-fade-in">
      {ConfirmDialogComponent}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setSelectedCourse(null)}
          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569' }}>
          <ChevronLeft size={16} /> กลับ
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{selectedCourse.title}</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>บทเรียนทั้งหมด {lessons.length} บท</p>
        </div>
        <button onClick={openAdd} className="btn-hero"
          style={{ marginLeft: 'auto', padding: '10px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <Plus size={16} /> เพิ่มบทเรียน
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>กำลังโหลด...</div>
      ) : lessons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <Video size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p>ยังไม่มีบทเรียน กด "เพิ่มบทเรียน" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {lessons.map((lesson) => (
            <div key={lesson.lesson_id}
              style={{ background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>
                {lesson.sequence}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px' }}>{lesson.title}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {lesson.video_url
                      ? <><Video size={12} color="#10b981" /> <span style={{ color: '#10b981' }}>มีวิดีโอ</span></>
                      : <><Video size={12} color="#cbd5e1" /> ไม่มีวิดีโอ</>}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {lesson.attachment_url
                      ? <><Paperclip size={12} color="#f59e0b" /> <span style={{ color: '#f59e0b' }}>มีไฟล์แนบ</span></>
                      : <><Paperclip size={12} color="#cbd5e1" /> ไม่มีไฟล์แนบ</>}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(lesson)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#334155' }}>
                  <Edit size={13} /> แก้ไข
                </button>
                <button onClick={() => setQuizLesson({ lesson_id: lesson.lesson_id, title: lesson.title })}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #a5b4fc', background: '#eef2ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#4f46e5' }}>
                  <ClipboardList size={13} /> ข้อสอบ
                </button>
                <button onClick={() => handleDelete(lesson.lesson_id)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#ef4444' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'เพิ่มบทเรียนใหม่' : 'แก้ไขบทเรียน'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-close"><X /></button>
            </div>
            <form onSubmit={handleSave} className="form-wrapper">
              <div className="form-group">
                <label>ชื่อบทเรียน *</label>
                <input className="form-input" value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>ลำดับที่</label>
                <input type="number" className="form-input" min={1} value={formData.sequence}
                  onChange={e => setFormData({ ...formData, sequence: +e.target.value })} />
              </div>

              {/* Video Upload */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px dashed #cbd5e1', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Video size={15} color="#3b82f6" /> อัปโหลดวิดีโอ
                </h4>
                <input type="file" accept="video/mp4,video/avi,video/mov,video/mkv" className="form-input"
                  onChange={e => setFormData({ ...formData, video_file: e.target.files?.[0] || null })}
                />
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>รองรับ: mp4, avi, mov, mkv (สูงสุด 100MB)</p>
                {formData.video_url && !formData.video_file && (
                  <div style={{ marginTop: '6px', fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Video size={12} /> มีวิดีโออยู่แล้ว (เลือกไฟล์ใหม่เพื่อแทนที่)
                  </div>
                )}
              </div>

              {/* Attachment Upload */}
              <div style={{ backgroundColor: '#fffbeb', padding: '16px', borderRadius: '10px', border: '1px dashed #fcd34d', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Paperclip size={15} color="#f59e0b" /> แนบไฟล์เอกสาร
                </h4>
                <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg" className="form-input"
                  onChange={e => setFormData({ ...formData, attachment_file: e.target.files?.[0] || null })}
                />
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>รองรับ: PDF, Word, PowerPoint, Excel, รูปภาพ</p>
                {formData.attachment_url && !formData.attachment_file && (
                  <div style={{ marginTop: '6px', fontSize: '12px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={12} /> มีไฟล์แนบอยู่แล้ว (เลือกไฟล์ใหม่เพื่อแทนที่)
                  </div>
                )}
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
      {quizLesson && (
        <QuizCreator
          lessonId={quizLesson.lesson_id}
          lessonTitle={quizLesson.title}
          onClose={() => setQuizLesson(null)}
        />
      )}

      {/* QuizCreator Modal */}
      {quizLesson && (
        <QuizCreator
          lessonId={quizLesson.lesson_id}
          lessonTitle={quizLesson.title}
          onClose={() => setQuizLesson(null)}
        />
      )}
    </div>
  );
};

export default LessonsTab;