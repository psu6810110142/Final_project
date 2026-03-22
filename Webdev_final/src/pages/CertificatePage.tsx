import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader } from 'lucide-react';
import api from '../api';

interface CertData {
  eligible: boolean;
  grade: string;
  avg_score: number;
  progress_pct: number;
  completed_lessons: number;
  total_lessons: number;
  course: { course_id: number; title: string; instructor_name: string };
  student: { user_id: number; full_name: string; email: string };
  issued_at: string;
}

const gradeInfo: Record<string, { desc: string; descEn: string; color: string; bg: string }> = {
  A: { desc: 'ดีเยี่ยม', descEn: 'Excellent', color: '#065f46', bg: '#d1fae5' },
  B: { desc: 'ดี', descEn: 'Good', color: '#1e40af', bg: '#dbeafe' },
  C: { desc: 'พอใช้', descEn: 'Satisfactory', color: '#92400e', bg: '#fef3c7' },
  D: { desc: 'ต้องปรับปรุง', descEn: 'Needs Improvement', color: '#9a3412', bg: '#ffedd5' },
  F: { desc: 'ไม่ผ่าน', descEn: 'Fail', color: '#991b1b', bg: '#fee2e2' },
};

// SVG ลายเซ็น (stylized)
const SignatureSVG = () => (
  <svg width="160" height="50" viewBox="0 0 160 50" fill="none">
    <path d="M10 35 C20 10, 35 5, 45 25 C55 42, 60 15, 75 20 C88 24, 90 38, 105 30 C118 23, 125 10, 140 18 C150 23, 155 35, 155 35"
      stroke="#1e3a5f" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M15 40 C25 38, 40 42, 55 40 C70 38, 80 41, 100 39 C115 38, 130 41, 148 38"
      stroke="#1e3a5f" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
  </svg>
);

// ดาว
const StarIcon = ({ size = 16, color = '#c9a84c' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const CertificatePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const certRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/grades/certificate/${courseId}`)
      .then(r => setData(r.data))
      .catch(() => setError('ไม่สามารถโหลดข้อมูลใบเซอร์ได้'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleDownloadPDF = async () => {
    if (!certRef.current || !data) return;
    setDownloading(true);
    try {
      // dynamic import เพื่อไม่ให้ bundle ใหญ่เกิน
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);

      const fileName = `certificate_${data.student.full_name.replace(/\s+/g, '_')}_${data.course.course_id}.pdf`;
      pdf.save(fileName);
    } catch (e) {
      console.error(e);
      alert('ไม่สามารถสร้าง PDF ได้ กรุณาลองอีกครั้ง');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px', backgroundColor: '#f1f5f9' }}>
      <Loader size={40} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#64748b' }}>กำลังโหลดใบประกาศ...</p>
    </div>
  );

  if (error || !data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px', backgroundColor: '#f1f5f9' }}>
      <p style={{ color: '#ef4444', fontSize: '18px' }}>{error || 'ไม่พบข้อมูล'}</p>
      <button onClick={() => navigate('/my-courses')} style={{ padding: '10px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>กลับ</button>
    </div>
  );

  if (!data.eligible) {
    const gi = gradeInfo[data.grade] || gradeInfo['F'];
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '460px', background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>ยังไม่สามารถออกใบเซอร์ได้</h2>
          <p style={{ color: '#64748b', lineHeight: '1.7', marginBottom: '24px' }}>
            ต้องเรียนจบทุกบทเรียน (100%) และได้เกรด <strong>A, B หรือ C</strong>
          </p>
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
            {[
              { label: 'ความคืบหน้า', value: `${data.progress_pct}%`, ok: data.progress_pct === 100 },
              { label: 'คะแนนเฉลี่ย', value: data.avg_score > 0 ? `${data.avg_score}%` : 'ยังไม่มี', ok: data.avg_score >= 60 },
              { label: 'เกรด', value: `${data.grade} — ${gi.desc}`, ok: ['A','B','C'].includes(data.grade) },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: '#64748b' }}>{r.label}</span>
                <span style={{ fontWeight: '700', color: r.ok ? '#16a34a' : '#ef4444' }}>
                  {r.ok ? '✓ ' : '✗ '}{r.value}
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/my-courses')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', margin: '0 auto' }}>
            <ArrowLeft size={16} /> กลับหน้าคอร์ส
          </button>
        </div>
      </div>
    );
  }

  const gi = gradeInfo[data.grade] || gradeInfo['C'];
  const certNo = `NLA-${String(data.course.course_id).padStart(3,'0')}-${String(data.student.user_id).padStart(5,'0')}-${new Date(data.issued_at).getFullYear()}`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1e293b' }}>
      {/* Toolbar */}
      <div style={{ backgroundColor: '#0f172a', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => navigate('/my-courses')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', color: '#cbd5e1', fontSize: '14px' }}>
          <ArrowLeft size={16} /> กลับ
        </button>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'white', margin: 0 }}>ใบประกาศนียบัตร</h2>
        <button onClick={handleDownloadPDF} disabled={downloading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', backgroundColor: downloading ? '#64748b' : '#c9a84c', color: 'white', border: 'none', borderRadius: '8px', cursor: downloading ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: downloading ? 'none' : '0 4px 12px rgba(201,168,76,0.4)' }}>
          {downloading ? <><Loader size={16} /> กำลังสร้าง PDF...</> : <><Download size={16} /> ดาวน์โหลด PDF</>}
        </button>
      </div>

      {/* Certificate Preview */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 24px', minHeight: 'calc(100vh - 60px)' }}>
        {/* A4 Landscape: 297mm × 210mm → 1122px × 794px at 96dpi */}
        <div ref={certRef} style={{
          width: '1000px',
          height: '708px',
          backgroundColor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Sarabun', 'Noto Sans Thai', 'Helvetica Neue', sans-serif",
          boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
        }}>

          {/* ===== BACKGROUND ===== */}
          {/* Gradient base */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #fefaf0 0%, #ffffff 40%, #f0f4ff 100%)' }} />

          {/* Corner ornaments TL */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '200px', height: '200px' }}>
            <div style={{ position: 'absolute', top: '20px', left: '20px', width: '160px', height: '160px', borderTop: '4px solid #c9a84c', borderLeft: '4px solid #c9a84c', borderRadius: '4px 0 0 0' }} />
            <div style={{ position: 'absolute', top: '28px', left: '28px', width: '144px', height: '144px', borderTop: '1px solid rgba(201,168,76,0.4)', borderLeft: '1px solid rgba(201,168,76,0.4)' }} />
          </div>
          {/* Corner ornaments TR */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px' }}>
            <div style={{ position: 'absolute', top: '20px', right: '20px', width: '160px', height: '160px', borderTop: '4px solid #c9a84c', borderRight: '4px solid #c9a84c', borderRadius: '0 4px 0 0' }} />
            <div style={{ position: 'absolute', top: '28px', right: '28px', width: '144px', height: '144px', borderTop: '1px solid rgba(201,168,76,0.4)', borderRight: '1px solid rgba(201,168,76,0.4)' }} />
          </div>
          {/* Corner ornaments BL */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '200px', height: '200px' }}>
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '160px', height: '160px', borderBottom: '4px solid #c9a84c', borderLeft: '4px solid #c9a84c', borderRadius: '0 0 0 4px' }} />
          </div>
          {/* Corner ornaments BR */}
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '200px', height: '200px' }}>
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '160px', height: '160px', borderBottom: '4px solid #c9a84c', borderRight: '4px solid #c9a84c', borderRadius: '0 0 4px 0' }} />
          </div>

          {/* Outer border */}
          <div style={{ position: 'absolute', inset: '14px', border: '2px solid #1e3a5f', pointerEvents: 'none' }} />

          {/* Watermark */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-30deg)', fontSize: '160px', fontWeight: '900', color: 'rgba(30,58,95,0.03)', userSelect: 'none', whiteSpace: 'nowrap', letterSpacing: '-4px' }}>NLA</div>

          {/* Left side blue bar */}
          <div style={{ position: 'absolute', left: '24px', top: '80px', bottom: '80px', width: '6px', background: 'linear-gradient(to bottom, #c9a84c, #1e3a5f, #c9a84c)', borderRadius: '99px' }} />
          {/* Right side blue bar */}
          <div style={{ position: 'absolute', right: '24px', top: '80px', bottom: '80px', width: '6px', background: 'linear-gradient(to bottom, #c9a84c, #1e3a5f, #c9a84c)', borderRadius: '99px' }} />

          {/* ===== CONTENT ===== */}
          <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 90px' }}>

            {/* Institution name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <StarIcon size={14} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#c9a84c', letterSpacing: '4px', textTransform: 'uppercase' }}>New Learning Academy</span>
              <StarIcon size={14} />
            </div>

            {/* Title */}
            <h1 style={{ fontSize: '44px', fontWeight: '900', color: '#1e3a5f', margin: '0 0 2px', letterSpacing: '2px', textAlign: 'center' }}>
              ใบประกาศนียบัตร
            </h1>
            <p style={{ fontSize: '15px', color: '#94a3b8', margin: '0 0 20px', letterSpacing: '3px', textTransform: 'uppercase' }}>
              Certificate of Completion
            </p>

            {/* Gold divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', width: '100%', maxWidth: '600px' }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #c9a84c)' }} />
              <StarIcon size={18} />
              <StarIcon size={22} color="#1e3a5f" />
              <StarIcon size={18} />
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #c9a84c)' }} />
            </div>

            {/* Presented to */}
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px', letterSpacing: '1px' }}>
              ขอมอบเกียรติบัตรนี้เพื่อรับรองว่า &nbsp;•&nbsp; This certifies that
            </p>

            {/* Student name */}
            <div style={{ position: 'relative', marginBottom: '6px', padding: '4px 48px 10px' }}>
              <h2 style={{ fontSize: '38px', fontWeight: '900', color: '#1e3a5f', margin: 0, textAlign: 'center', letterSpacing: '1px' }}>
                {data.student.full_name}
              </h2>
              <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '2px', background: 'linear-gradient(to right, transparent, #c9a84c 30%, #c9a84c 70%, transparent)' }} />
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 18px' }}>{data.student.email}</p>

            <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 8px' }}>
              ได้ผ่านการศึกษาหลักสูตร &nbsp;•&nbsp; has successfully completed the course
            </p>

            {/* Course name */}
            <div style={{ backgroundColor: '#1e3a5f', borderRadius: '10px', padding: '10px 40px', marginBottom: '6px', maxWidth: '720px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: 0 }}>
                {data.course.title}
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>
              สอนโดย / Instructor: <strong style={{ color: '#334155' }}>{data.course.instructor_name}</strong>
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              {[
                { label: 'บทเรียน / Lessons', value: `${data.completed_lessons}/${data.total_lessons}`, sub: 'บท' },
                { label: 'คะแนนเฉลี่ย / Score', value: `${data.avg_score}%`, sub: 'คะแนน' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '12px 32px', textAlign: 'center', borderRight: i < 1 ? '1px solid #e2e8f0' : undefined }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e3a5f' }}>{item.value}</div>
                </div>
              ))}
              {/* Grade */}
              <div style={{ padding: '12px 32px', textAlign: 'center', backgroundColor: gi.bg }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '2px' }}>ระดับผล / Grade</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <span style={{ fontSize: '32px', fontWeight: '900', color: gi.color, lineHeight: 1 }}>{data.grade}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: gi.color }}>{gi.desc}</div>
                    <div style={{ fontSize: '11px', color: gi.color, opacity: 0.8 }}>{gi.descEn}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer: cert no + signature + date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
              {/* Cert no */}
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '1px', marginBottom: '2px' }}>CERTIFICATE NO.</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', fontFamily: 'monospace', letterSpacing: '1px' }}>{certNo}</div>
              </div>

              {/* Signature */}
              <div style={{ textAlign: 'center' }}>
                <SignatureSVG />
                <div style={{ width: '160px', height: '1px', backgroundColor: '#94a3b8', margin: '4px auto 4px' }} />
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e3a5f' }}>ผู้อำนวยการ / Director</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>New Learning Academy</div>
              </div>

              {/* Date */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '1px', marginBottom: '2px' }}>ISSUED DATE</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>{formatDate(data.issued_at)}</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CertificatePage;