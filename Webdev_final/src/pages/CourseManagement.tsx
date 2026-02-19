import React, { useState } from 'react';
import './HomePage.css'; 
import { Home, Book, User, LogOut, Plus, Edit, Trash2, X, Settings, Clock } from 'lucide-react';
import logoImage from '../assets/Logo.png'; 

interface CourseData {
  course_id: number;
  title: string;
  description: string;
  price: number;
  duration_weeks: number;
  cover_image_url?: string;
  material_file_url?: string;
  exercise_file_url?: string;
  level_id: number;
  instructor_id: number;
}

const mockLevels = [
  { level_id: 1, level_name: 'ป.5' },
  { level_id: 2, level_name: 'ป.6' },
  { level_id: 3, level_name: 'ม.1' },
];

const mockInstructors = [
  { instructor_id: 1, name: 'อ.สมชาย (คณิตศาสตร์)' },
  { instructor_id: 2, name: 'อ.สมหญิง (วิทยาศาสตร์)' },
];

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<CourseData[]>([
    { 
      course_id: 1, 
      title: 'คณิตศาสตร์ ป.5', 
      description: 'เรียนรู้พื้นฐานคณิตศาสตร์และเทคนิคสำคัญ ครอบคลุมทุกหัวข้อ', 
      price: 1500, 
      duration_weeks: 12, 
      level_id: 1,
      instructor_id: 1,
      cover_image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400'
    },
    { 
      course_id: 2, 
      title: 'วิทยาศาสตร์ ม.1', 
      description: 'วิทย์พื้นฐานเพื่อการต่อยอด เน้นการทดลองและความเข้าใจ', 
      price: 1800, 
      duration_weeks: 10, 
      level_id: 3,
      instructor_id: 2,
      cover_image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400'
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  
  const [formData, setFormData] = useState<CourseData>({
    course_id: 0, title: '', description: '', price: 0, duration_weeks: 0, level_id: 0, instructor_id: 0, cover_image_url: '', material_file_url: '', exercise_file_url: ''
  });

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({ course_id: Date.now(), title: '', description: '', price: 0, duration_weeks: 0, level_id: 0, instructor_id: 0, cover_image_url: '', material_file_url: '', exercise_file_url: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: CourseData) => {
    setModalMode('edit');
    setFormData(course);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคอร์สนี้?')) {
      setCourses(courses.filter(c => c.course_id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.level_id === 0 || formData.instructor_id === 0) {
      alert("กรุณาเลือกระดับชั้นและอาจารย์ผู้สอน");
      return;
    }

    if (modalMode === 'add') {
      setCourses([...courses, { ...formData, cover_image_url: formData.cover_image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400' }]);
    } else {
      setCourses(courses.map(c => c.course_id === formData.course_id ? formData : c));
    }
    setIsModalOpen(false);
  };

  const getLevelName = (id: number) => mockLevels.find(l => l.level_id === id)?.level_name || 'ไม่ระบุ';
  const getInstructorName = (id: number) => mockInstructors.find(i => i.instructor_id === id)?.name || 'ไม่ระบุ';

  return (
    <div className="page-wrapper">
      {/* ================= Navbar ================= */}
      <nav className="navbar">
        <div className="container navbar-container">
          <a href="/" className="navbar-left">
            <img src={logoImage} alt="Logo" className="navbar-logo" />
            <div className="brand-text">
              <span className="brand-title">New Learning Academy</span>
              <span className="brand-subtitle">สถาบันกวดวิชานิวเลิร์นนิง</span>
            </div>
          </a>
          <div className="navbar-menu">
            <a href="/home" className="menu-item"><Home size={18} /> หน้าหลัก</a>
            <a href="/courses" className="menu-item"><Book size={18} /> คอร์สเรียน</a>
            <a href="/my-courses" className="menu-item"><User size={18} /> คอร์สของฉัน</a>
            <a href="/manage-courses" className="menu-item active"><Settings size={18} /> จัดการคอร์ส</a>
            <a href="/logout" className="menu-item"><LogOut size={18} /> ออกจากระบบ</a>
          </div>
        </div>
      </nav>

      {/* ================= Header ================= */}
      <div className="page-header" style={{ padding: '40px 0 20px', textAlign: 'left' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>จัดการคอร์สเรียน</h1>
            <p style={{ opacity: 0.8 }}>เพิ่ม ลบ หรือแก้ไขข้อมูลคอร์สเรียนในระบบ</p>
          </div>
          <button onClick={handleOpenAdd} className="btn-hero" style={{ padding: '12px 24px', borderRadius: '8px' }}>
            <Plus size={20} /> เพิ่มคอร์สใหม่
          </button>
        </div>
      </div>

      {/* ================= Grid Section ================= */}
      <section className="section" style={{ backgroundColor: '#f9fafb', minHeight: '60vh', paddingTop: '20px' }}>
        <div className="container">
          {courses.length === 0 ? (
            <div className="empty-state">ยังไม่มีข้อมูลคอร์สเรียนในระบบ</div>
          ) : (
            <div className="courses-grid">
              {courses.map((course) => (
                <div className="course-card" key={course.course_id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="course-image">
                    <img src={course.cover_image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400"} alt={course.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    <span className="badge">{getLevelName(course.level_id)}</span>
                  </div>
                  <div className="course-content course-content-flex">
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-desc desc-clamp">{course.description}</p>
                    <div className="instructor-text">ผู้สอน: {getInstructorName(course.instructor_id)}</div>
                    
                    <div className="course-meta meta-bottom">
                      <div><Clock size={14} /> {course.duration_weeks} สัปดาห์</div>
                      <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>฿{course.price.toLocaleString()}</div>
                    </div>

                    <div className="action-buttons">
                      <button onClick={() => handleOpenEdit(course)} className="btn-edit">
                        <Edit size={16} /> แก้ไข
                      </button>
                      <button onClick={() => handleDelete(course.course_id)} className="btn-delete">
                        <Trash2 size={16} /> ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= Modal (Pop-up) ================= */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'add' ? 'เพิ่มคอร์สเรียนใหม่' : 'แก้ไขข้อมูลคอร์ส'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-close">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="form-wrapper">
              <div className="form-group">
                <label>ชื่อคอร์สเรียน</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="form-input" />
              </div>

              <div className="form-group">
                <label>รายละเอียด</label>
                <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="form-textarea" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ราคา (บาท)</label>
                  <input type="number" required min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="form-input" />
                </div>
                <div className="form-group">
                  <label>ระยะเวลา (สัปดาห์)</label>
                  <input type="number" required min="1" value={formData.duration_weeks} onChange={(e) => setFormData({...formData, duration_weeks: Number(e.target.value)})} className="form-input" />
                </div>
              </div>

              <div className="form-row form-section-box">
                <div className="form-group">
                  <label>ระดับชั้น</label>
                  <select required value={formData.level_id} onChange={(e) => setFormData({...formData, level_id: Number(e.target.value)})} className="form-select">
                    <option value={0} disabled>-- เลือกระดับชั้น --</option>
                    {mockLevels.map(level => (
                      <option key={level.level_id} value={level.level_id}>{level.level_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>อาจารย์ผู้สอน</label>
                  <select required value={formData.instructor_id} onChange={(e) => setFormData({...formData, instructor_id: Number(e.target.value)})} className="form-select">
                    <option value={0} disabled>-- เลือกอาจารย์ --</option>
                    {mockInstructors.map(inst => (
                      <option key={inst.instructor_id} value={inst.instructor_id}>{inst.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>URL รูปภาพหน้าปก (Cover Image)</label>
                <input type="text" placeholder="https://..." value={formData.cover_image_url} onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})} className="form-input" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>URL เอกสารประกอบ (Material)</label>
                  <input type="text" placeholder="https://..." value={formData.material_file_url} onChange={(e) => setFormData({...formData, material_file_url: e.target.value})} className="form-input" />
                </div>
                <div className="form-group">
                  <label>URL แบบฝึกหัด (Exercise)</label>
                  <input type="text" placeholder="https://..." value={formData.exercise_file_url} onChange={(e) => setFormData({...formData, exercise_file_url: e.target.value})} className="form-input" />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">ยกเลิก</button>
                <button type="submit" className="btn-save">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="container">
          <div className="copyright" style={{ paddingTop: '20px', borderTop: 'none' }}>
            © 2026 New Learning Academy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CourseManagement;