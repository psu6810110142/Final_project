import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomePage.css'; 
import { Home, Book, User, LogOut, Plus, Edit, Trash2, X, Settings, Clock, AlertCircle } from 'lucide-react';
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
  instructor_id: number; // ถ้ายังไม่มีระบบ Instructor ให้ใส่ 1 ไว้ก่อน
}

// ข้อมูลสำหรับ Dropdown (ในอนาคตควรดึงจาก API เช่นกัน)
const mockLevels = [
  { level_id: 1, level_name: 'ป.4' },
  { level_id: 2, level_name: 'ป.5' },
  { level_id: 3, level_name: 'ป.6' },
  { level_id: 4, level_name: 'ม.1' },
  { level_id: 5, level_name: 'ม.2' },
  { level_id: 6, level_name: 'ม.3' },
];

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
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
    instructor_id: 1, // Default ไว้ก่อน
    cover_image_url: '', 
    material_file_url: '', 
    exercise_file_url: ''
  });

  // 1. ดึงข้อมูล (GET) เมื่อเข้าหน้าเว็บ
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/courses', {
        headers: { Authorization: `Bearer ${token}` } // ต้องแนบ Token เพราะเป็นหน้า Admin
      });
      setCourses(response.data);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('ไม่สามารถดึงข้อมูลคอร์สได้ กรุณาตรวจสอบ Server');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    // เคลียร์ค่าฟอร์ม
    setFormData({ 
      course_id: 0, title: '', description: '', price: 0, duration_weeks: 0, 
      level_id: 0, instructor_id: 1, cover_image_url: '', material_file_url: '', exercise_file_url: '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: CourseData) => {
    setModalMode('edit');
    setFormData(course);
    setIsModalOpen(true);
  };

  // 2. ลบข้อมูล (DELETE)
  const handleDelete = async (id: number) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคอร์สนี้? (ไม่สามารถกู้คืนได้)')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('ลบคอร์สเรียบร้อยแล้ว');
      fetchCourses(); // ดึงข้อมูลใหม่
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  // 3. บันทึกข้อมูล (POST / PUT)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.level_id === 0) {
      alert("กรุณาเลือกระดับชั้น");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (modalMode === 'add') {
        // สร้างใหม่ (POST)
        // ตัด course_id ออกเพราะ Database จะสร้างให้เอง
        const { course_id, ...dataToSend } = formData;
        await axios.post('http://localhost:3001/courses', dataToSend, config);
        alert('เพิ่มคอร์สสำเร็จ!');
      } else {
        // แก้ไข (PUT/PATCH)
        await axios.put(`http://localhost:3001/courses/${formData.course_id}`, formData, config);
        alert('แก้ไขข้อมูลสำเร็จ!');
      }

      setIsModalOpen(false);
      fetchCourses(); // รีโหลดข้อมูลใหม่
    } catch (err) {
      console.error('Save Error:', err);
      alert('บันทึกไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  // Helper function แปลง ID เป็นชื่อ (ใช้ชั่วคราว)
  const getLevelName = (id: number) => mockLevels.find(l => l.level_id === id)?.level_name || 'ไม่ระบุ';

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
          
          {/* Loading State */}
          {loading && <div style={{textAlign: 'center', padding: '50px'}}>กำลังโหลดข้อมูล...</div>}

          {/* Error State */}
          {error && !loading && (
            <div style={{textAlign: 'center', color: 'red', padding: '20px'}}>
              <AlertCircle style={{display:'inline', marginBottom:-3}}/> {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && courses.length === 0 && (
            <div className="empty-state">ยังไม่มีข้อมูลคอร์สเรียนในระบบ</div>
          )}

          {/* Courses Grid */}
          <div className="courses-grid">
            {courses.map((course) => (
              <div className="course-card" key={course.course_id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="course-image">
                  <img 
                    src={course.cover_image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400"} 
                    alt={course.title} 
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                    onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x200?text=No+Image"; }} // กันภาพเสีย
                  />
                  <span className="badge">{getLevelName(course.level_id)}</span>
                </div>
                <div className="course-content course-content-flex">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-desc desc-clamp">{course.description}</p>
                  
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