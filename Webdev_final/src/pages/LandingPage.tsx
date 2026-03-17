import React, { useEffect, useState, useRef } from 'react';
import './HomeTheme.css';
import './OceanTheme.css';
import { Home, BookOpen, Users, ArrowRight, Clock, LogIn, UserPlus, Book, ChevronUp } from 'lucide-react';
import logoImage from '../assets/Logo.png';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import GrayLogo from '../assets/Graylogo.png';
import ChulaLogo from '../assets/chula-logo.png';
import ThammasatLogo from '../assets/thammasat-logo.png';
import PSULogo from '../assets/psu-logo.png';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { useTheme } from '../contexts/ThemeContext';
import { getImageUrl } from '../utils/getImageUrl';

interface CourseData {
  course_id: number; title: string; description: string; price: number;
  duration_weeks: number; cover_image_url?: string;
  level?: { level_name: string };
  instructor?: { name: string; profile_image_url: string };
}

interface InstructorData {
  instructor_id: number;
  name: string;
  profile_image_url?: string;
  bio?: string;
  expertise?: string;
}

/* ---- Reveal animation component ---- */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; dir?: 'up' | 'left' | 'right' | 'none' }> = ({
  children, delay = 0, dir = 'up'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    // ใช้ rootMargin넓게 เพื่อให้ trigger ก่อน element เข้า viewport
    // threshold 0 = trigger ทันทีที่ pixel แรกเข้ามา
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );
    if (ref.current) obs.observe(ref.current);
    // trigger ทันทีถ้า element อยู่ใน viewport แล้ว (เช่น 2 section แรก)
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setTimeout(() => setVis(true), delay);
      }
    }
    return () => obs.disconnect();
  }, []);
  const t: Record<string, string> = { up: 'translateY(48px)', left: 'translateX(-48px)', right: 'translateX(48px)', none: 'none' };
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : t[dir], transition: `opacity .65s ease ${delay}ms, transform .65s ease ${delay}ms`, pointerEvents: vis ? 'auto' : 'none' }}>
      {children}
    </div>
  );
};

/* ============================================================
   LANDING PAGE
   ============================================================ */
const LandingPage: React.FC = () => {
  const { theme } = useTheme();
  const [courses, setCourses]         = useState<CourseData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data)).catch(() => {}).finally(() => setIsLoading(false));
    api.get('/instructors').then(r => setInstructors(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const scrollToTop = () => {
    // ocean-page คือ div.page-wrapper ที่มี overflow-y: scroll
    const page = document.querySelector('.ocean-page') as HTMLElement;
    if (page) {
      page.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const degreeMap: Record<number, { university: string; universityLogo: string; faculty: string; honor: string; exp: string }> = {
    1: { university: 'จุฬาลงกรณ์มหาวิทยาลัย',   universityLogo: ChulaLogo,     faculty: 'คณะวิทยาศาสตร์ สาขาคณิตศาสตร์', honor: '🏅 เกียรตินิยมอันดับ 1', exp: 'อดีตติวเตอร์ PAT1 ประสบการณ์ 10 ปี' },
    2: { university: 'มหาวิทยาลัยธรรมศาสตร์',    universityLogo: ThammasatLogo, faculty: 'คณะศิลปศาสตร์ สาขาภาษาไทย',    honor: '🏅 เกียรตินิยมอันดับ 1', exp: 'เขียนตำราภาษาไทยระดับมัธยม 12 ปี' },
    3: { university: 'มหาวิทยาลัยสงขลานครินทร์', universityLogo: PSULogo,       faculty: 'คณะครุศาสตร์ สาขาสังคมศึกษา',  honor: '🏅 เกียรตินิยมอันดับ 1', exp: 'ครูดีเด่นระดับประเทศ' },
  };

  return (
    <div className={`page-wrapper ${theme === 'ocean' ? 'ocean-page' : ''}`}>

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
            <a href="/" className="menu-item active"><Home size={18} /> หน้าหลัก</a>
            <a href="/courses" className="menu-item"><Book size={18} /> คอร์สเรียน</a>
            <div className="nav-auth-buttons">
              <a href="/login" className="btn-nav-login"><LogIn size={18} /> เข้าสู่ระบบ</a>
              <a href="/register" className="btn-nav-register"><UserPlus size={18} /> สมัครสมาชิก</a>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= Hero Section ================= */}
      <header className={theme === 'ocean' ? 'landing-hero snap-section' : 'page-header snap-section'}>
        {theme === 'ocean' ? (
          <>
            {/* ดวงดาว + พระจันทร์ */}
            <div className="stars-layer" />
            <div className="moon" />
            {/* ชายหาด + คลื่น + ปาล์ม */}
            <div className="ocean-bubbles">{[...Array(8)].map((_, i) => <div key={i} className="bubble" />)}</div>
            <span className="fish fish-1">🐠</span>
            <span className="fish fish-2">🐟</span>
            <span className="fish fish-3">🦑</span>
            <div className="wave-layer-1" />
            <div className="wave-layer-2" />
            <div className="wave-layer-3" />
            <div className="wave-layer-sand" />
            <span className="palm-left">🌴</span>
            <span className="palm-right">🌴</span>
          </>
        ) : (
          <div className="wave-bottom" />
        )}
        <div className="container landing-hero-content">
          <Reveal dir="left" delay={0}>
          <div className="hero-text" style={{ marginLeft: '5%' }}>
            <h1>เรียนออนไลน์ <br />ที่บ้าน สะดวก สบาย</h1>
            <p style={{ marginBottom: '30px' }}>แพลตฟอร์มการเรียนออนไลน์สำหรับนักเรียนชั้นประถมและมัธยมต้น เรียนได้ทุกที่ทุกเวลา พร้อมครูผู้สอนที่มีคุณภาพ</p>
            <a href="/register" className="btn-hero" style={{ textDecoration: 'none' }}>
              <BookOpen size={20} /> เริ่มต้นใช้งานฟรี
            </a>
          </div>
          </Reveal>
          <Reveal dir="right" delay={200}>
          <div className="stats-grid">
            <StatCard number="500+" label="นักเรียน" />
            <StatCard number="50+" label="คอร์สเรียน" />
            <StatCard number="20+" label="อาจารย์" />
            <StatCard number="4.8" label="คะแนนเฉลี่ย" />
          </div>
          </Reveal>
        </div>
        <div className="scroll-hint">
          <span>เลื่อนลงเพื่อดูเพิ่มเติม</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </header>

      {/* ===== 2. WHY US ===== */}
      <section className="snap-section features-snap">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '6px' }}>
              <span className="section-eyebrow section-eyebrow-lg">ทำไมต้องเรา?</span>
            </div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>เรียนกับเรา ได้อะไรมากกว่าที่คิด</h2>
          </Reveal>
          <Reveal dir="up" delay={100}>
          <div className="why-grid why-grid-lg">
            {[
              { icon: '🏆', color: '#1565c0', bg: 'linear-gradient(135deg,#e3f2fd,#bbdefb)', title: 'การันตีคุณภาพผู้สอน',    bullets: ['ดีกรีระดับปริญญาโทขึ้นไป', 'ประสบการณ์สอนกว่า 10 ปี', 'ผ่านการคัดเลือกเข้มข้น'] },
              { icon: '💰', color: '#2e7d32', bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', title: 'ประหยัดกว่าเรียนพิเศษ',   bullets: ['ลดค่าใช้จ่ายเดินทาง 100%', 'ราคาถูกกว่าติวเตอร์ที่บ้าน 60%', 'จ่ายครั้งเดียวดูได้ตลอด'] },
              { icon: '📱', color: '#e65100', bg: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', title: 'เรียนได้ทุกที่ทุกเวลา',   bullets: ['รองรับมือถือ แท็บเล็ต คอม', 'ดูซ้ำได้ไม่จำกัดครั้ง', 'ไม่มีวันหมดอายุ'] },
              { icon: '🏅', color: '#6a1b9a', bg: 'linear-gradient(135deg,#f3e5f5,#e1bee7)', title: 'รับใบเซอร์ทุกคอร์ส',      bullets: ['ใบรับรองจากสถาบัน NLA', 'เพิ่มพอร์ตโฟลิโอนักเรียน', 'ออกให้ทุกคอร์สที่เรียนจบ'] },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 100} dir={i % 2 === 0 ? 'left' : 'right'}>
                <div className="why-card why-card-lg">
                  <div className="why-icon-wrap why-icon-wrap-lg" style={{ background: f.bg }}>
                    <span style={{ fontSize: '2.4rem' }}>{f.icon}</span>
                  </div>
                  <h3 style={{ color: f.color, fontSize: '1.1rem', fontWeight: 800, margin: '14px 0 10px' }}>{f.title}</h3>
                  <ul className="why-bullets">
                    {f.bullets.map((b, j) => <li key={j}><span className="why-check">✓</span>{b}</li>)}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
          </Reveal>
        </div>
      </section>

      {/* ===== 3. INSTRUCTORS ===== */}
      <section className="snap-section instructors-snap">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '6px' }}>
              <span className="section-eyebrow section-eyebrow-lg">ทีมผู้สอน</span>
            </div>
            <h2 className="section-title" style={{ textAlign: 'center', color: 'white' }}>อาจารย์มืออาชีพ การันตีด้วยดีกรี</h2>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.75)', marginBottom: '36px' }}>ทุกคนผ่านการคัดเลือกและมีประสบการณ์การสอนจริง</p>
          </Reveal>
          <div className="instructors-grid">
            {instructors.length > 0 ? instructors.slice(0, 4).map((inst, i) => {
              const d = degreeMap[inst.instructor_id] || {
                university: 'มหาวิทยาลัยสงขลานครินทร์', universityLogo: PSULogo,
                faculty: 'คณะศึกษาศาสตร์', honor: '🏅 เกียรตินิยมอันดับ 1', exp: 'ประสบการณ์สอนกว่า 8 ปี',
              };
              return (
                <Reveal key={inst.instructor_id} delay={i * 120} dir="up">
                  <div className="instructor-card instructor-card-white">
                    <div className="instructor-avatar-wrap">
                      <img src={getImageUrl(inst.profile_image_url)} alt={inst.name}
                        className="instructor-avatar" onError={e => (e.currentTarget.src = GrayLogo)} />
                      <div className="instructor-verified">✓</div>
                    </div>
                    <h3 className="instructor-name instructor-name-dark">{inst.name}</h3>
                    <p className="instructor-subject">{inst.expertise || 'ผู้สอนประจำสถาบัน'}</p>
                    <div className="instructor-divider instructor-divider-light" />
                    <div className="instructor-univ-row">
                      <img src={d.universityLogo} alt={d.university} className="univ-logo-lg" />
                      <span className="univ-name-lg">{d.university}</span>
                    </div>
                    <div className="instructor-honor-lg">{d.honor}</div>
                    <p className="instructor-faculty-sm">📚 {d.faculty}</p>
                  </div>
                </Reveal>
              );
            }) : (
              <p style={{ color: 'rgba(255,255,255,.6)', textAlign: 'center', gridColumn: '1/-1' }}>ยังไม่มีข้อมูลอาจารย์</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== 4. HOW IT WORKS + PROMO ===== */}
      <section className="snap-section how-snap">
        <div className="container">
          <Reveal>
            <div className="promo-banner">
              <div className="promo-left">
                <span className="promo-tag promo-tag-visible">🎁 โปรโมชั่นพิเศษ</span>
                <h3>สมัครครั้งแรก รับส่วนลด <span className="promo-highlight">20%</span></h3>
                <p>สำหรับคอร์สแรกที่ลงทะเบียน เฉพาะสมาชิกใหม่เท่านั้น</p>
              </div>
              <div className="promo-right">
                <div className="promo-countdown promo-countdown-visible">⏰ ข้อเสนอจำกัด</div>
                <a href="/register" className="promo-btn">รับส่วนลดเลย →</a>
              </div>
            </div>
          </Reveal>
          <Reveal><h2 className="section-title" style={{ textAlign: 'center', marginTop: '32px' }}>เรียนกับเราง่ายแค่ 3 ขั้นตอน</h2></Reveal>
          <div className="how-steps">
            {[
              { num: '1', icon: '📝', title: 'สมัครสมาชิกฟรี',    desc: 'สร้างบัญชีใน 1 นาที ไม่มีค่าธรรมเนียมสมัคร', delay: 0 },
              { num: '2', icon: '🎯', title: 'เลือกคอร์สที่ใช่',  desc: 'คอร์สครบทุกระดับชั้น ป.1 ถึง ม.3',          delay: 200 },
              { num: '3', icon: '🚀', title: 'เริ่มเรียนได้เลย!', desc: 'ดูวิดีโอซ้ำได้ไม่จำกัด เรียนตามสะดวก',      delay: 400 },
            ].map((s, i) => (
              <React.Fragment key={i}>
                <Reveal delay={s.delay} dir={i === 0 ? 'left' : i === 2 ? 'right' : 'up'}>
                  <div className="how-step">
                    <div className="how-step-num">{s.num}</div>
                    <div className="how-step-icon">{s.icon}</div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                </Reveal>
                {i < 2 && <div className="how-arrow">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. POPULAR COURSES ===== */}
      <section className="snap-section popular-snap">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <span className="popular-badge-big popular-badge-xl">🔥 คอร์สยอดนิยม</span>
            </div>
            <h2 className="section-title" style={{ textAlign: 'center' }}>คอร์สที่คนเลือกเรียนมากที่สุด</h2>
          </Reveal>
          <div className="popular-grid-big">
            {[
              { icon: '🧮', subject: 'คณิตศาสตร์', grade: 'ม.1-3', students: 128, hot: true,  color: '#1565c0', bg: '#e3f2fd' },
              { icon: '🔬', subject: 'วิทยาศาสตร์', grade: 'ป.4-6', students: 96,  hot: false, color: '#2e7d32', bg: '#e8f5e9' },
              { icon: '📖', subject: 'ภาษาไทย',    grade: 'ป.1-3', students: 84,  hot: false, color: '#e65100', bg: '#fff3e0' },
              { icon: '🌍', subject: 'สังคมศึกษา', grade: 'ม.1-2', students: 72,  hot: false, color: '#6a1b9a', bg: '#f3e5f5' },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 100} dir="up">
                <div className="popular-card-big">
                  {c.hot && <div className="popular-hot-tag">🔥 HOT</div>}
                  <div className="popular-icon-wrap-big" style={{ background: c.bg }}>
                    <span style={{ fontSize: '3rem' }}>{c.icon}</span>
                  </div>
                  <h3 style={{ color: c.color, fontSize: '1.2rem', fontWeight: 800, margin: '14px 0 4px' }}>{c.subject}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '.9rem', margin: '0 0 10px' }}>ระดับ {c.grade}</p>
                  <div className="popular-meta-big">
                    <span>👥 {c.students}+ คน</span>
                    <span className="cert-badge-big">🏅 มีใบเซอร์</span>
                  </div>
                  <a href="/courses" className="popular-btn-big">ดูคอร์ส →</a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6. REVIEWS ===== */}
      <section className="snap-section reviews-snap">
        <div className="container">
          <Reveal>
            <h2 className="section-title" style={{ textAlign: 'center' }}>เสียงจากนักเรียนของเรา 💬</h2>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.7)', marginBottom: '36px' }}>รีวิวจริงจากนักเรียนและผู้ปกครอง</p>
          </Reveal>
          <div className="reviews-grid">
            {[
              { name: 'สมศรี วงศ์ใหญ่', grade: 'นักเรียน ป.6',  text: 'เรียนสนุกมาก วิดีโออธิบายชัดเจน ดูซ้ำได้เรื่อยๆ คะแนนสอบดีขึ้นเลย!',                              stars: 5, result: 'คณิต +20 คะแนน',     seed: 10 },
              { name: 'อรุณี ทองดี',     grade: 'ผู้ปกครอง',    text: 'ลูกชอบมากเพราะเรียนได้ที่บ้าน ประหยัดค่าเดินทาง ราคาคุ้มมากเมื่อเทียบกับติวเตอร์',              stars: 5, result: 'ประหยัดค่าเรียน 60%', seed: 20 },
              { name: 'ธนกร ภูมิใจ',     grade: 'นักเรียน ม.2', text: 'ครูสอนเข้าใจง่ายกว่าในห้องเรียนอีก แถมดูซ้ำกี่รอบก็ได้ ได้ใบเซอร์ด้วย!',                       stars: 5, result: 'ได้ใบเซอร์ 3 วิชา',  seed: 30 },
            ].map((r, i) => (
              <Reveal key={i} delay={i * 150} dir="up">
                <div className="review-card">
                  <div className="review-result-tag">✅ {r.result}</div>
                  <div className="review-stars">{'⭐'.repeat(r.stars)}</div>
                  <p className="review-text">"{r.text}"</p>
                  <div className="review-author">
                    <img src={`https://i.pravatar.cc/60?img=${r.seed}`} alt={r.name}
                      className="review-real-avatar" onError={e => { e.currentTarget.style.display = 'none'; }} />
                    <div>
                      <div className="review-name">{r.name}</div>
                      <div className="review-grade">{r.grade}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. COURSES ===== */}
      <section className="snap-section courses-snap">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <h2 className="section-title" style={{ margin: 0 }}>คอร์สแนะนำ</h2>
              <a href="/courses" className="btn-link">ดูทั้งหมด <ArrowRight size={18} /></a>
            </div>
          </Reveal>
          {isLoading ? (
            <p style={{ textAlign: 'center', padding: '2rem 0' }}>กำลังโหลด...</p>
          ) : (
            <div className="courses-scroll-container">
              {courses.length > 0 ? courses.map(course => (
                <Link to={`/course/${course.course_id}`} key={course.course_id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <CourseCard
                    grade={course.level?.level_name || '-'} subject={course.level?.level_name || 'ทั่วไป'}
                    title={course.title} price={`฿${course.price.toLocaleString()}`}
                    tagColor="#dbeafe" textColor="#1e40af"
                    imgSrc={getImageUrl(course.cover_image_url)}
                    instructorName={course.instructor?.name || 'ไม่ระบุ'}
                    instructorImage={getImageUrl(course.instructor?.profile_image_url)}
                    duration={course.duration_weeks || 12} description={course.description}
                  />
                </Link>
              )) : <p style={{ width: '100%', textAlign: 'center' }}>ยังไม่มีคอร์สแนะนำ</p>}
            </div>
          )}
        </div>
      </section>

      {/* ===== 8. CTA ===== */}
      <section className="snap-section cta-snap">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
          <Reveal dir="up">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <h1 style={{ color: 'white', fontSize: '2.4rem' }}>พร้อมเริ่มต้นการเรียนรู้แล้วหรือยัง? 🚀</h1>
              <p style={{ color: 'rgba(255,255,255,.85)', marginBottom: '32px', fontSize: '1.1rem' }}>สมัครวันนี้ เริ่มเรียนได้ทันที ไม่มีค่าสมัคร</p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
                <button onClick={() => navigate('/register')} className="btn-hero" style={{ border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={20} /> สมัครสมาชิกฟรี
                </button>
                <button onClick={() => navigate('/courses')} style={{ padding: '14px 28px', borderRadius: '50px', border: '2px solid rgba(255,255,255,.6)', color: 'white', background: 'transparent', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit', fontSize: '1rem' }}>
                  <Book size={18} /> ดูคอร์สทั้งหมด
                </button>
              </div>
              <button onClick={scrollToTop} className="back-to-top-btn">
                <ChevronUp size={18} /> กลับขึ้นบนสุด
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer snap-section footer-snap">
        <div className="container">
          <div className="footer-grid">
            <div><h3>เกี่ยวกับเรา</h3><p>New Learning Academy แพลตฟอร์มการเรียนรู้ออนไลน์ชั้นนำ</p></div>
            <div><h3>ติดต่อเรา</h3><p>อีเมล: info@newlearning.com</p><p>โทร: 02-123-4567</p></div>
            <div><h3>เวลาทำการ</h3><p>จันทร์ - ศุกร์: 09:00 - 18:00</p><p>เสาร์ - อาทิตย์: 10:00 - 16:00</p></div>
          </div>
          <div className="copyright">© 2026 New Learning Academy. All rights reserved.</div>
        </div>
      </footer>

      <ThemeToggleButton />
    </div>
  );
};

/* ---- CourseCard ---- */
const CourseCard = ({ subject, grade, title, price, tagColor, textColor, imgSrc, instructorName, instructorImage, duration, description }: any) => (
  <div className="course-card">
    <div className="course-image">
      <img src={imgSrc} alt={title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
      <span className="badge">{grade}</span>
    </div>
    <div className="course-content">
      <span className="course-tag" style={{ backgroundColor: tagColor, color: textColor }}>{subject}</span>
      <h3 className="course-title">{title}</h3>
      <p className="course-desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{description}</p>
      <div className="course-meta">
        <div><Users size={14} /> 100 คน</div>
        <div><Clock size={14} /> {duration} สัปดาห์</div>
      </div>
      <div className="course-footer">
        <div className="instructor">
          <div className="avatar" style={{ overflow: 'hidden', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={instructorImage} alt="instructor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span>{instructorName}</span>
        </div>
        <div className="course-price" style={{ color: '#e74c3c', fontWeight: 'bold' }}>{price}</div>
      </div>
    </div>
  </div>
);

export default LandingPage;

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div className="stat-card">
    <div className="stat-number">{number}</div>
    <div className="stat-label">{label}</div>
  </div>
);