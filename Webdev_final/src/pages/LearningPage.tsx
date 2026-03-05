import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HomePage.css';
import { ArrowLeft, PlayCircle, User, CheckCircle, Download, FileText } from 'lucide-react'; // ลบ Lock, CheckCircle ออกก่อนชั่วคราว
import logoImage from '../assets/Logo.png';
import api from '../api';

const LearningPage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [courseDetail, setCourseDetail] = useState<any>(null);

  const handleVideoEnd = async () => {
    if (!currentLessonId) return;

    try {
      // ยิง API ไปบันทึกว่าเรียนจบแล้ว
      await api.post('/learning-progress', {
        lesson_id: currentLessonId,
        is_completed: true
      });

      // ถ้าบันทึกสำเร็จ ให้อัปเดต State หน้าจอให้เป็นติ๊กถูก (โดยไม่ต้องรีเฟรชหน้า)
      if (!completedLessons.includes(currentLessonId)) {
        setCompletedLessons(prev => [...prev, currentLessonId]);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleDownload = (fileUrl: string | null | undefined) => {
    if (!fileUrl) {
      alert('อาจารย์ยังไม่ได้อัปโหลดไฟล์สำหรับคอร์สนี้');
      return;
    }
    // เปิดไฟล์ในแท็บใหม่ (ถ้าเป็น PDF เบราว์เซอร์จะเปิดให้ดู / ถ้าเป็น Zip จะดาวน์โหลดลงเครื่องทันที)
    window.open(`http://localhost:3000${fileUrl}`, '_blank');
  };

  // ยามเฝ้าประตู 
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (!token || !storedUser) {
      window.location.replace('/landing');
      return;
    }
    setCurrentUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        // ดึงรายชื่อบทเรียน
        const lessonsRes = await api.get(`/lessons/course/${courseId}`);
        const fetchedLessons = lessonsRes.data;
        setLessons(fetchedLessons);

        // ดึงคอร์สเรียน เอาชื่อและรูปอาจารย์
        const courseRes = await api.get(`/courses/${courseId}`);
        setCourseDetail(courseRes.data);

        if (fetchedLessons.length > 0) {
          setCurrentLessonId(fetchedLessons[0].lesson_id);
        }

        // ดึงประวัติการเรียนของฉัน
        const progressRes = await api.get('/learning-progress/user/my-progress');
        const myProgress = progressRes.data;

        // กรองเอาเฉพาะ ID บทเรียนที่ is_completed เป็น true
        const completedIds = myProgress
          .filter((p: any) => p.is_completed === true)
          .map((p: any) => p.lesson?.lesson_id);

        setCompletedLessons(completedIds);

      } catch (error: any) {
        console.error('Error fetching data:', error);
        if (error.response && error.response.status === 403) {
          alert('คุณยังไม่ได้ซื้อคอร์สเรียนนี้ กรุณาสั่งซื้อก่อนเข้าเรียนครับ');
          window.location.replace('/my-courses');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, currentUser]);

  // 3. ดักจับสถานะ Loading (ป้องกัน Error หน้าขาว)
  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
        <h2 style={{ color: '#64748b' }}>กำลังโหลดห้องเรียน... ⏳</h2>
      </div>
    );
  }

  const currentLesson = lessons.find(l => l.lesson_id === currentLessonId) || null;

  return (
    <div className="page-wrapper" >
      {/* ================= Minimal Navbar ================= */}
      <nav className="navbar" style={{ padding: '10px 0' }}>
        <div className="container navbar-container">
          <div className="navbar-left" style={{ gap: '20px' }}>
            <button onClick={() => navigate('/my-courses')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
              <ArrowLeft size={20} /> กลับ
            </button>
            <div style={{ height: '24px', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
            <img src={logoImage} alt="Logo" className="navbar-logo" />
            <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
              {courseDetail?.title || 'ห้องเรียนออนไลน์'}
            </span>
          </div>

          <div className="navbar-menu">
            <div className="user-pill">{currentUser?.full_name || currentUser?.username}</div>
          </div>
        </div>
      </nav>

      {/* ================= Main Learning Area ================= */}
      <section className="section" style={{ backgroundColor: '#f1f5f9', minHeight: '75vh', padding: '0px 0' }}>
        <div className="container">
          <div className="learning-layout">

            {/* ----- ฝั่งซ้าย: Video Player ----- */}
            <div>
              <div className="video-section">
                <div className="video-wrapper">
                  <video
                    key={currentLesson.lesson_id}
                    src={`http://localhost:3000${currentLesson.video_url}`}
                    controls
                    onEnded={handleVideoEnd}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div className="video-info">
                  {/* ใช้ Optional Chaining (?.) ป้องกัน Error */}
                  <h2>{currentLesson?.title || 'ไม่มีข้อมูลบทเรียน'}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px', color: '#64748b', fontSize: '0.95rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {courseDetail.instructor.profile_image_url ? (
                        <img
                          src={`http://localhost:3000${courseDetail.instructor.profile_image_url}`}
                          alt={courseDetail.instructor.name}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <User size={18} />
                      )}
                      {/* ดึงชื่ออาจารย์มาแสดง */}
                      {courseDetail?.instructor?.name || 'อ.ผู้สอน'}
                    </span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: '#1e293b', marginBottom: '10px' }}>รายละเอียดคอร์สเรียน</h3>
                    <p style={{ lineHeight: '1.6', color: '#475569', fontSize: '0.95rem', marginBottom: '25px' }}>
                      {/* ดึงรายละเอียดจาก courseDetail แทน currentLesson */}
                      {courseDetail?.description || 'ไม่มีรายละเอียดสำหรับคอร์สเรียนนี้'}
                    </p>

                    <h3 style={{ fontSize: '1.05rem', color: '#1e293b', marginBottom: '10px' }}>เอกสารประกอบการเรียน</h3>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>

                      {/* ปุ่มโหลดเอกสาร */}
                      <button
                        onClick={() => handleDownload(courseDetail?.material_file_url)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      >
                        <FileText size={18} color="#2563eb" />
                        เอกสารประกอบการเรียน
                        <Download size={16} style={{ marginLeft: '4px' }} />
                      </button>

                      {/* ปุ่มโหลดแบบฝึกหัด */}
                      <button
                        onClick={() => handleDownload(courseDetail?.exercise_file_url)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      >
                        <FileText size={18} color="#16a34a" />
                        ไฟล์แบบฝึกหัด
                        <Download size={16} style={{ marginLeft: '4px' }} />
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ----- ฝั่งขวา: Playlist & Progress ----- */}
            <div>
              <div className="playlist-section">
                <div className="playlist-header">
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#1e293b' }}>เนื้อหาหลักสูตร</h3>
                </div>

                <div className="playlist-content">
                  {/* ✨ ตรวจสอบว่ามีบทเรียนไหม ถ้าไม่มีให้ขึ้นข้อความ */}
                  {lessons.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                      ยังไม่มีบทเรียนในคอร์สนี้
                    </div>
                  ) : (
                    // วนลูปจาก State 'lessons'
                    lessons.map((lesson) => (
                      <div
                        key={lesson.lesson_id}
                        className={`lesson-item ${lesson.lesson_id === currentLessonId ? 'active' : ''}`}
                        onClick={() => setCurrentLessonId(lesson.lesson_id)}
                      >
                        <div style={{ marginTop: '2px' }}>
                          {completedLessons.includes(lesson.lesson_id) ? (
                            <CheckCircle size={18} color="#16a34a" />
                          ) : (
                            <PlayCircle size={18} color={lesson.lesson_id === currentLessonId ? "#2563eb" : "#94a3b8"} />
                          )}
                        </div>
                        <div>
                          <div className="lesson-title" style={{ color: lesson.lesson_id === currentLessonId ? '#1d4ed8' : '' }}>
                            {lesson.sequence}. {lesson.title}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3>เกี่ยวกับเรา</h3>
              <p>New Learning Academy เป็นแพลตฟอร์มการเรียนรู้<br />ออนไลน์ชั้นนำ มุ่งเน้นพัฒนาศักยภาพผู้เรียน</p>
            </div>
            <div>
              <h3>ติดต่อเรา</h3>
              <p>อีเมล: info@newlearning.com</p>
              <p>โทร: 02-123-4567</p>
            </div>
            <div>
              <h3>เวลาทำการ</h3>
              <p>จันทร์ - ศุกร์: 09:00 - 18:00</p>
              <p>เสาร์ - อาทิตย์: 10:00 - 16:00</p>
            </div>
          </div>
          <div className="copyright">
            © 2026 New Learning Academy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LearningPage;