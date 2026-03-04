import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HomePage.css';
import { ArrowLeft, PlayCircle, CheckCircle, Lock, User } from 'lucide-react';
import logoImage from '../assets/Logo.png';

// ข้อมูลจำลองของบทเรียน (Playlist)
const MOCK_LESSONS = [
  { id: 1, title: "บทที่ 1: แนะนำคณิตศาสตร์เบื้องต้น", duration: "10:30", status: "completed" },
  { id: 2, title: "บทที่ 2: การบวกและการลบ", duration: "15:45", status: "completed" },
  { id: 3, title: "บทที่ 3: การคูณและการหาร", duration: "22:10", status: "playing" },
  { id: 4, title: "บทที่ 4: เศษส่วนเบื้องต้น", duration: "18:20", status: "locked" },
  { id: 5, title: "บทที่ 5: ทศนิยมและการแปลงค่า", duration: "20:00", status: "locked" },
  { id: 6, title: "แบบทดสอบท้ายบทเรียน", duration: "30:00", status: "locked" },
];

const LearningPage: React.FC = () => {
  const { courseId } = useParams(); // ดึง ID คอร์สมาจาก URL (เช่น /learn/1)
  const navigate = useNavigate();
  const [currentLessonId, setCurrentLessonId] = useState(3); // สมมติว่ากำลังเรียนบทที่ 3

  // ดึงข้อมูลบทเรียนที่กำลัง Active อยู่
  const currentLesson = MOCK_LESSONS.find(l => l.id === currentLessonId) || MOCK_LESSONS[0];

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>

      {/* ================= Minimal Navbar ================= */}
      {/* Navbar สำหรับห้องเรียน จะเรียบง่ายกว่าปกติ เพื่อให้โฟกัสที่เนื้อหา */}
      <nav className="navbar" style={{ padding: '10px 0' }}>
        <div className="container navbar-container">
          <div className="navbar-left" style={{ gap: '20px' }}>
            {/* ปุ่มย้อนกลับไปหน้า My Courses */}
            <button onClick={() => navigate('/my-courses')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
              <ArrowLeft size={20} /> กลับ
            </button>
            <div style={{ height: '24px', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
            <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>คณิตศาสตร์ ป.5 ตะลุยโจทย์</span>
          </div>

          <div className="navbar-menu">
            <div className="user-pill">User</div>
          </div>
        </div>
      </nav>

      {/* ================= Main Learning Area ================= */}
      <div className="container">
        <div className="learning-layout">

          {/* ----- ฝั่งซ้าย: Video Player ----- */}
          <div>
            <div className="video-section">
              <div className="video-wrapper">
                {/* จำลองใส่ Video ของ YouTube หรือใส่ Video 태그 HTML5 ก็ได้ */}
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&showinfo=0"
                  title="Course Video Player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="video-info">
                <h2>{currentLesson.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px', color: '#64748b', fontSize: '0.95rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={16} /> อ.สมชาย สอนดี</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>• ความยาว {currentLesson.duration} นาที</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />
                <p>
                  รายละเอียดบทเรียน: ในบทเรียนนี้เราจะมาเรียนรู้เกี่ยวกับเนื้อหาของ {currentLesson.title}
                  รวมถึงเทคนิคการจำและการทำโจทย์เบื้องต้น ขอให้นักเรียนเตรียมสมุดจดและทำความเข้าใจไปพร้อมๆ กันครับ
                </p>
              </div>
            </div>
          </div>

          {/* ----- ฝั่งขวา: Playlist & Progress ----- */}
          <div>
            <div className="playlist-section">
              <div className="playlist-header">
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#1e293b' }}>เนื้อหาหลักสูตร</h3>
                {/* Progress Bar เล็กๆ */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '5px' }}>
                  <span>ความคืบหน้า</span>
                  <span>33%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '33%', height: '100%', backgroundColor: '#16a34a' }}></div>
                </div>
              </div>

              <div className="playlist-content">
                {MOCK_LESSONS.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`lesson-item ${lesson.id === currentLessonId ? 'active' : ''} ${lesson.status === 'locked' ? 'locked' : ''}`}
                    onClick={() => {
                      if (lesson.status !== 'locked') setCurrentLessonId(lesson.id);
                    }}
                  >
                    {/* ไอคอนบอกสถานะ */}
                    <div style={{ marginTop: '2px' }}>
                      {lesson.status === 'completed' && <CheckCircle size={18} color="#16a34a" />}
                      {lesson.status === 'playing' && <PlayCircle size={18} color="#2563eb" />}
                      {lesson.status === 'locked' && <Lock size={18} color="#94a3b8" />}
                    </div>

                    <div>
                      <div className="lesson-title" style={{ color: lesson.id === currentLessonId ? '#1d4ed8' : '' }}>
                        {lesson.title}
                      </div>
                      <div className="lesson-duration">{lesson.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LearningPage;