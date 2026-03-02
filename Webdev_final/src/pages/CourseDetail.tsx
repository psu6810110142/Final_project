import { useNavigate } from 'react-router-dom';
import './HomePage.css'; 

// 🌟 นำเข้าไฟล์รูปโลโก้จากโฟลเดอร์ assets (เปลี่ยน logo.png เป็นชื่อไฟล์ของคุณ)
import logoImg from '../assets/logo.png'; 

export default function CourseDetail() {
  const navigate = useNavigate();

  return (
    <div className="cd-page-wrapper">
      
      {/* 🟢 แถบเมนูด้านบน (Navbar) - ไล่สีตาม Figma */}
      <nav className="cd-navbar">
        <div className="cd-nav-container">
          <div className="cd-logo" onClick={() => navigate('/home')}>
            {/* 🌟 แสดงรูปโลโก้ที่ดึงมาจาก assets */}
            <img src={logoImg} alt="New Learning Academy Logo" className="cd-logo-img" />
            <div className="cd-logo-text">
              <h2>New Learning Academy</h2>
              <p>เรียนออนไลน์ ง่าย สนุก ได้ผล</p>
            </div>
          </div>

          <ul className="cd-nav-links">
            <li onClick={() => navigate('/home')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              หน้าหลัก
            </li>
            <li className="active" onClick={() => navigate('/courses')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              คอร์สเรียน
            </li>
            <li onClick={() => navigate('/mycourse')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              คอร์สของฉัน
            </li>
            <li onClick={() => navigate('/')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              ออกจากระบบ
            </li>
          </ul>

          <div className="cd-user-btn">User</div>
        </div>
      </nav>

      {/* 🔵 เนื้อหาหน้าเว็บ */}
      <div className="cd-page-container">
        
        {/* Banner สีฟ้าพร้อมรูปลายน้ำ */}
        <div className="cd-banner">
          <div className="cd-banner-content">
            
            <div className="cd-banner-info">
              <div className="cd-tags">
                <span className="cd-tag white-bg">ม.1</span>
                <span className="cd-tag outline">วิทยาศาสตร์</span>
              </div>
              
              <h1 className="cd-title">วิทยาศาสตร์ ม.1</h1>
              <p className="cd-subtitle">
                วิทยาศาสตร์เบื้องต้นสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 1<br/>
                เน้นการทดลองและเข้าใจหลักการ
              </p>
              
              <div className="cd-stats-top">
                <div className="cd-stat-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  128 คน
                </div>
                <div className="cd-stat-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  16 สัปดาห์
                </div>
              </div>

              {/* ป้ายชื่ออาจารย์ */}
              <div className="cd-instructor-badge">
                <span className="cd-instructor-name">สอนโดย : อาจารย์สุดา ทองมณี</span>
                <span className="cd-instructor-sub">เกียรตินิยมอันดับหนึ่ง</span>
                <span className="cd-instructor-sub">คณะวิทยาศาสตร์และวิทยาศาสตร์ประยุกต์</span>
              </div>
            </div>

            {/* รูปวิดีโอ */}
            <div className="cd-banner-video">
              <img 
                src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80" 
                alt="Video Preview" 
              />
              <div className="cd-play-button">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
            </div>

          </div>
        </div>

        {/* ⚪️ เนื้อหาด้านล่าง แบ่ง 2 คอลัมน์ */}
        <div className="cd-main-content">
          
          {/* ฝั่งซ้าย: รายละเอียดคอร์ส */}
          <div className="cd-left-column">
            
            <div className="cd-card">
              <h2 className="cd-card-title">รายละเอียดคอร์ส</h2>
              <div className="cd-feature-list">
                <div className="cd-feature-item">
                  <div className="cd-check-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div>
                    <h4>เรียนรู้แบบทีละขั้นตอน</h4>
                    <p>เนื้อหาครอบคลุมตามหลักสูตร จัดเรียงลำดับการเรียนอย่างเป็นระบบ</p>
                  </div>
                </div>
                <div className="cd-feature-item">
                  <div className="cd-check-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div>
                    <h4>วิดีโอคุณภาพสูง</h4>
                    <p>ความละเอียดชัด เสียงดัง ไม่มีสะดุด</p>
                  </div>
                </div>
                <div className="cd-feature-item">
                  <div className="cd-check-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div>
                    <h4>ดูซ้ำได้ไม่จำกัด</h4>
                    <p>เมื่อซื้อคอร์สแล้ว สามารถดูซ้ำได้ไม่จำกัดจำนวนครั้ง</p>
                  </div>
                </div>
                <div className="cd-feature-item">
                  <div className="cd-check-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div>
                    <h4>แบบฝึกหัดและการบ้าน</h4>
                    <p>มีแบบฝึกหัดให้ทำเพื่อทบทวนความเข้าใจ</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="cd-card">
              <h2 className="cd-card-title">เนื้อหาในคอร์ส</h2>
              <div className="cd-lesson-list">
                <div className="cd-lesson-item">
                  <div className="cd-lesson-name">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    บทที่ 1
                  </div>
                  <div className="cd-lesson-time">15 นาที</div>
                </div>
                <div className="cd-lesson-item">
                  <div className="cd-lesson-name">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    บทที่ 2
                  </div>
                  <div className="cd-lesson-time">15 นาที</div>
                </div>
                <div className="cd-lesson-item">
                  <div className="cd-lesson-name">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    บทที่ 3
                  </div>
                  <div className="cd-lesson-time">15 นาที</div>
                </div>
              </div>
            </div>

          </div>

          {/* ฝั่งขวา: ราคาสินค้า */}
          <div className="cd-right-column">
            <div className="cd-price-card">
              <h1 className="cd-price-amount">฿1,800</h1>
              <p className="cd-price-subtitle">ครั้งเดียว เรียนได้ไม่จำกัด</p>
              
              <button className="cd-enroll-btn" onClick={() => navigate('/payment')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                ลงทะเบียนเรียน
              </button>

              <div className="cd-course-includes">
                <div className="cd-include-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                  32 บทเรียน
                </div>
                <div className="cd-include-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  ระยะเวลา 16 สัปดาห์
                </div>
                <div className="cd-include-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00c4b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  128 นักเรียน
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🟢 ส่วนท้าย (Footer) */}
      <footer className="cd-footer">
        <div className="cd-footer-content">
          <div className="cd-footer-col">
            <h3>เกี่ยวกับเรา</h3>
            <p>New Learning Academy<br/>เป็นแพลตฟอร์มการเรียนออนไลน์ที่ออกแบบมาเพื่อนักเรียนระดับประถมและมัธยมต้น</p>
          </div>
          <div className="cd-footer-col">
            <h3>ติดต่อเรา</h3>
            <p>อีเมล: info@newlearning.com<br/>โทร: 02-XXX-XXXX</p>
          </div>
          <div className="cd-footer-col">
            <h3>เวลาทำการ</h3>
            <p>จันทร์ - ศุกร์: 09:00 - 18:00<br/>เสาร์ - อาทิตย์: 10:00 - 16:00</p>
          </div>
        </div>
        <div className="cd-footer-bottom">
          <p>© 2026 New Learning Academy. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}