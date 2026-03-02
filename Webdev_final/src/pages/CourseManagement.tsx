import React, { useState, useEffect } from 'react';
import api from '../api'; // ✨ เปลี่ยนมาใช้ api ของเราเอง
import './HomePage.css'; 
import { LogOut, Plus, Edit, Trash2, X, Settings, Clock, AlertCircle } from 'lucide-react';
import logoImage from '../assets/Logo.png'; 

// Interface ให้ตรงกับ Database จริง
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
  level?: any;
  instructor?: any;
  name?: string;
}

// ✨ สร้าง Interface มารองรับข้อมูล Levels และ Instructors
interface LevelData {
  level_id: number;
  level_name: string;
}

interface InstructorData {
  instructor_id: number;
  name: string;
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  // ✨ เพิ่ม State มารับข้อมูล Dropdown
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  
  // State สำหรับฟอร์ม
  const [formData, setFormData] = useState<CourseData>({
    course_id: 0, 
    title: '', 
    description: '', 
    price: 0, 
    duration_weeks: 0, 
    level_id: 0, 
    name: '',
    instructor_id: 0, // ✨ เปลี่ยนค่า Default เป็น 0 เพื่อบังคับให้ผู้ใช้เลือกอาจารย์
    cover_image_url: '', 
    material_file_url: '', 
    exercise_file_url: ''
  });

  // 1. ดึงข้อมูลทั้งหมดเมื่อเข้าหน้าเว็บ
  useEffect(() => {
    fetchAllData();
  }, []);

  // ✨ สร้างฟังก์ชันดึงข้อมูลแบบรวดเดียวพร้อมกัน 3 เส้น
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // ใช้ Promise.all เพื่อยิง API พร้อมกัน ช่วยให้หน้าเว็บโหลดเร็วขึ้น
      const [coursesRes, levelsRes, instructorsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/levels'),
        api.get('/instructors')
      ]);
      
      setCourses(coursesRes.data);
      setLevels(levelsRes.data);
      setInstructors(instructorsRes.data);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อกับ Server');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    // เคลียร์ค่าฟอร์ม
    setFormData({ 
      course_id: 0, title: '', description: '', price: 0, duration_weeks: 0, 
      level_id: 0, instructor_id: 0, cover_image_url: '', material_file_url: '', exercise_file_url: '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: CourseData) => {
    setModalMode('edit');
    // ✨ ดึงแค่ ID ของ level และ instructor มาใส่ฟอร์ม (กันกรณี Backend ส่งมาเป็น Object)
    setFormData({
      ...course,
      level_id: typeof course.level === 'object' ? (course.level as any).level_id : course.level_id,
      instructor_id: typeof course.instructor === 'object' ? (course.instructor as any).instructor_id : course.instructor_id,
    } as any);
    setIsModalOpen(true);
  };

  // 2. ลบข้อมูล (DELETE)
  const handleDelete = async (id: number) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคอร์สนี้? (ไม่สามารถกู้คืนได้)')) return;

    try {
      await api.delete(`/courses/${id}`); // ✨ ใช้ api สั้นๆ ได้เลย Token แนบให้อัตโนมัติ
      alert('ลบคอร์สเรียบร้อยแล้ว');
      
      // ดึงแค่ข้อมูลคอร์สใหม่ (ไม่จำเป็นต้องดึง Level/Instructor ใหม่)
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  // 3. บันทึกข้อมูล (POST / PATCH)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✨ ดักจับว่าเลือก Dropdown ครบไหม
    if (formData.level_id === 0 || formData.instructor_id === 0) {
      alert("กรุณาเลือกระดับชั้นและอาจารย์ผู้สอนให้ครบถ้วน");
      return;
    }

    try {
      if (modalMode === 'add') {
        const { course_id, ...dataToSend } = formData;
        await api.post('/courses', dataToSend);
        alert('เพิ่มคอร์สสำเร็จ!');
      } else {
        // ✨ ตอนแก้ไข NestJS ส่วนใหญ่ใช้ PATCH
        await api.patch(`/courses/${formData.course_id}`, formData);
        alert('แก้ไขข้อมูลสำเร็จ!');
      }

      setIsModalOpen(false);
      // โหลดข้อมูลคอร์สใหม่หลังเซฟเสร็จ
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error('Save Error:', err);
      alert('บันทึกไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  // Helper function แปลง ID เป็นชื่อ จาก State ที่ดึงมา (ไม่ใช่ Mock แล้ว)
  const getLevelName = (id: number) => levels.find(l => l.level_id === id)?.level_name || 'ไม่ระบุระดับชั้น';

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
            <a href="/manage-courses" className="menu-item active"><Settings size={18} /> จัดการคอร์ส</a>
            <a href="/login" onClick={() => { localStorage.clear() }} className="menu-item"><LogOut size={18} /> ออกจากระบบ</a>
          </div>
        </div>
      </nav>

      {/* ================= Header ================= */}
      <div className="page-header" style={{ padding: '40px 0 20px', textAlign: 'left' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>จัดการคอร์สเรียน (Admin)</h1>
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
          
          {loading && <div style={{textAlign: 'center', padding: '50px'}}>กำลังโหลดข้อมูล...</div>}

          {error && !loading && (
            <div style={{textAlign: 'center', color: 'red', padding: '20px'}}>
              <AlertCircle style={{display:'inline', marginBottom:-3}}/> {error}
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <div className="empty-state">ยังไม่มีข้อมูลคอร์สเรียนในระบบ</div>
          )}

          <div className="courses-grid">
            {courses.map((course: any) => (
              <div className="course-card" key={course.course_id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="course-image">
                  <img 
                    src={course.cover_image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400"} 
                    alt={course.title} 
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                    onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x200?text=No+Image"; }}
                  />
                  {/* ✨ ดึง Level ID ออกมาจาก object ถ้า backend ส่งมาเป็น object (relation) */}
                  <span className="badge">{getLevelName(course.level?.level_id || course.level_id)}</span>
                </div>
                <div className="course-content course-content-flex">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-desc desc-clamp">{course.description}</p>
                  
                  {/* ✨ โชว์ชื่ออาจารย์ผู้สอนในกล่องคอร์สด้วยเลย */}
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>
                     👨‍🏫 โดย: {course.instructor?.name}
                  </div>

                  <div className="course-meta meta-bottom">
                    <div><Clock size={14} /> {course.duration_weeks} สัปดาห์</div>
                    <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>฿{Number(course.price).toLocaleString()}</div>
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
        </div>
      </section>

      {/* ================= Modal ================= */}
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

              {/* ✨ Dropdown ระดับชั้นและอาจารย์ผู้สอน */}
              <div className="form-row form-section-box">
                <div className="form-group">
                  <label>ระดับชั้น</label>
                  <select required value={formData.level_id} onChange={(e) => setFormData({...formData, level_id: Number(e.target.value)})} className="form-select">
                    <option value={0} disabled>-- เลือกระดับชั้น --</option>
                    {levels.map(level => (
                      <option key={level.level_id} value={level.level_id}>{level.level_name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>อาจารย์ผู้สอน</label>
                  <select required value={formData.instructor_id} onChange={(e) => setFormData({...formData, instructor_id: Number(e.target.value)})} className="form-select">
                    <option value={0} disabled>-- เลือกอาจารย์ผู้สอน --</option>
                    {instructors.map(instructor => (
                      <option key={instructor.instructor_id} value={instructor.instructor_id}>
                        {instructor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>URL รูปภาพหน้าปก</label>
                <input type="text" placeholder="https://..." value={formData.cover_image_url} onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})} className="form-input" />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">ยกเลิก</button>
                <button type="submit" className="btn-save">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;