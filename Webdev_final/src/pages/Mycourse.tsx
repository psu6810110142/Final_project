import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './HomePage.css'; 
import { Home, Book, User, LogOut, PlayCircle, CheckCircle } from 'lucide-react';
import logoImage from '../assets/Logo.png'; 
import api from '../api'; // ✨ นำเข้า api ของเรา

const MyCourses: React.FC = () => {
  const navigate = useNavigate(); 
  const [filter, setFilter] = useState("all"); 
  
  // ✨ State สำหรับเก็บข้อมูลจริง
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 👮‍♂️ 1. ยามเฝ้าประตู (ตรวจสอบการ Login)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (!token || !storedUser) {
      window.location.replace('/landing');
      return; 
    }
    setCurrentUser(JSON.parse(storedUser));
  }, []);

  // 📡 2. ดึงข้อมูลคอร์สที่ซื้อแล้วจาก Backend
  useEffect(() => {
    if (!currentUser) return; // รอให้โหลดข้อมูล User เสร็จก่อน

    const fetchMyCourses = async () => {
      // 1. หา userId ของคนที่ล็อกอินอยู่
      const userId = currentUser?.user_id || currentUser?.id || currentUser?.userId || currentUser?.sub;
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // 2. ดึงข้อมูลออเดอร์ทั้งหมด
        const response = await api.get(`/orders/user/${userId}`);
        let purchasedCourses: any[] = [];
        
        // 3. วนลูปสกัดเอาเฉพาะคอร์สที่จ่ายเงินแล้ว
        response.data.forEach((order: any) => {
          if (order.status === 'COMPLETED' && order.order_details) {
            
            order.order_details.forEach((detail: any) => {
              const course = detail.course;
              if (course) {
                purchasedCourses.push({
                  // --- 🟢 ข้อมูลหลัก: ดึงจาก Database 100% ---
                  id: course.course_id,
                  title: course.title,
                  subject: course.level?.level_name || 'ไม่ระบุระดับชั้น',
                  
                  // --- 🟡 ข้อมูลสำรอง (Fallback): ดึงจาก DB ก่อน ถ้าไม่มีถึงจะใช้ภาพ Default ---
                  imgSrc: course.cover_image_url || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400",
                  
                  // --- 🟠 ข้อมูลเฉพาะ UI: ยังไม่มีในตาราง Courses หรือรอทำ API เพิ่ม ---
                  progress: 0,       // 🚧 รอเชื่อมต่อกับตาราง Learning Progress
                  tagColor: "#dbeafe", 
                  textColor: "#1e40af", 
                });
              }
            });
            
          }
        });

        // 4. ลบวิชาที่ซ้ำกัน (กรณี User ซื้อคอร์สเดิมซ้ำ) แล้วอัปเดตลง State
        const uniqueCourses = Array.from(new Map(purchasedCourses.map(item => [item.id, item])).values());
        setMyCourses(uniqueCourses);

      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส:', error);
      } finally {
        setLoading(false); // ปิดสถานะโหลดเสมอไม่ว่าจะสำเร็จหรือพัง
      }
    };

    fetchMyCourses();
  }, [currentUser]);

  // 🚪 ฟังก์ชันออกจากระบบ (เคลียร์ Session)
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); 
    localStorage.clear(); 
    setCurrentUser(null);
    window.location.replace('/landing'); 
  };

  const filteredCourses = myCourses.filter(course => {
    if (filter === "in-progress") return course.progress < 100;
    if (filter === "completed") return course.progress === 100;
    return true; 
  });

  return (
    <div className="page-wrapper">
      {/* ================= Navbar ================= */}
      <nav className="navbar">
        <div className="container navbar-container">
          <a href="/home" className="navbar-left">
            <img src={logoImage} alt="Logo" className="navbar-logo" />
            <div className="brand-text">
              <span className="brand-title">New Learning Academy</span>
              <span className="brand-subtitle">สถาบันกวดวิชานิวเลิร์นนิง</span>
            </div>
          </a>
          
          <div className="navbar-menu">
            <a href="/home" className="menu-item"><Home size={18} /> หน้าหลัก</a>
            <a href="/courses" className="menu-item"><Book size={18} /> คอร์สเรียน</a>
            <a href="/mycourse" className="menu-item active"><User size={18} /> คอร์สของฉัน</a>
            <a onClick={handleLogout} className="menu-item" style={{ cursor: 'pointer' }}><LogOut size={18} /> ออกจากระบบ</a>
            <div className="user-pill">{currentUser?.full_name || currentUser?.username}</div>
          </div>
        </div>
      </nav>

      {/* ================= Header ================= */}
      <div className="page-header">
        <div className="container">
          <h1 style={{ fontSize: '2rem', margin: 0 }}>คอร์สเรียนของฉัน</h1>
          <p style={{ opacity: 0.8, marginTop: '10px' }}>ยินดีต้อนรับกลับมา! ลุยต่อให้จบกันเถอะ</p>
        </div>
      </div>

      {/* ================= My Courses Content ================= */}
      <section className="section" style={{ backgroundColor: '#f9fafb', minHeight: '60vh' }}>
        <div className="container">
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            <button onClick={() => setFilter("all")} style={tabStyle(filter === "all")}>ทั้งหมด</button>
            <button onClick={() => setFilter("in-progress")} style={tabStyle(filter === "in-progress")}>กำลังเรียน</button>
            <button onClick={() => setFilter("completed")} style={tabStyle(filter === "completed")}>เรียนจบแล้ว</button>
          </div>

          {loading ? (
             <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280' }}>กำลังโหลดข้อมูลคอร์สเรียนของคุณ... ⏳</div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div key={course.id} onClick={() => navigate(`/learn/${course.id}`)} style={{ cursor: 'pointer' }}>
                    <MyCourseCard course={course} />
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#6b7280' }}>
                  คุณยังไม่มีคอร์สในหมวดหมู่นี้ เริ่มต้นค้นหาคอร์สที่ใช่เลย!
                </div>
              )}
            </div>
          )}
          
        </div>
      </section>

      {/* ================= Footer ================= */}
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

// --- Component: การ์ดสำหรับคอร์สที่ซื้อแล้ว ---
const MyCourseCard = ({ course }: { course: any }) => (
  <div className="course-card" style={{ transition: 'transform 0.2s, boxShadow 0.2s', display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div className="course-image">
      <img src={course.imgSrc} alt={course.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
      {course.progress === 100 && (
        <span style={{ position: 'absolute', top: 15, right: 15, background: '#16a34a', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle size={14} /> เรียนจบแล้ว
        </span>
      )}
    </div>
    
    <div className="course-content" style={{ display: 'flex', flexDirection: 'column', padding: '0px 20px 20px', flexGrow: 1 }}>
      <span className="course-tag" style={{ backgroundColor: course.tagColor, 
        color: course.textColor, 
        marginBottom: '10px',
        padding: '6px 14px',
        borderRadius: '50px',
        fontSize: '0.85rem',
        fontWeight: '600',
        display: 'inline-block',
        width: 'fit-content' }}>
        {course.subject}
      </span>
      <h3 className="course-title" style={{ fontSize: '1.2rem' }}>{course.title}</h3>
      
      {/* Progress Bar */}
      <div style={{ marginTop: 'auto', paddingTop: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px' }}>
          <span>ความคืบหน้า</span>
          <span style={{ fontWeight: 'bold', color: course.progress === 100 ? '#16a34a' : '#2563eb' }}>{course.progress}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${course.progress}%`, height: '100%', backgroundColor: course.progress === 100 ? '#16a34a' : '#2563eb', transition: 'width 0.5s ease-in-out' }}></div>
        </div>
      </div>

      <button style={{ width: '100%', marginTop: '20px', padding: '10px', backgroundColor: course.progress === 100 ? '#f3f4f6' : '#eff6ff', color: course.progress === 100 ? '#4b5563' : '#2563eb', border: course.progress === 100 ? '1px solid #d1d5db' : '1px solid #bfdbfe', borderRadius: '8px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        {course.progress === 100 ? 'ทบทวนเนื้อหา' : <><PlayCircle size={18} /> เรียนต่อ</>}
      </button>
    </div>
  </div>
);

// สไตล์จำลองสำหรับ Tab
const tabStyle = (isActive: boolean) => ({
  background: 'none',
  border: 'none',
  padding: '10px 15px',
  fontSize: '1rem',
  fontWeight: isActive ? 'bold' : 'normal',
  color: isActive ? '#2563eb' : '#6b7280',
  borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent',
  cursor: 'pointer',
  marginBottom: '-12px' 
});

export default MyCourses;