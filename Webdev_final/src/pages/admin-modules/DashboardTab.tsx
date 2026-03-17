import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Briefcase, DollarSign, TrendingUp, CreditCard, GraduationCap, Clock, XCircle, CheckCircle, BarChart2, PlayCircle, Award, PauseCircle } from 'lucide-react';
import api from '../../api';
import type { CourseData, OrderData, InstructorData, LearningProgressData } from './types';
import { getImageUrl } from '../../utils/getImageUrl';

interface Props {
  courses: CourseData[];
  users: any[];
  orders: OrderData[];
  instructors: InstructorData[];
  progressData: LearningProgressData[];
  getCourseEnrolledCount: (course: CourseData) => number;
}

/* ---- Mini card ---- */
const MiniCard = ({ icon, label, value, color, bg, border, pulse = false }: any) => (
  <div style={{ backgroundColor: bg, border: `1.5px solid ${border}`, borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform .2s' }}
    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
    onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
    <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '12px', color, position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      {icon}
      {pulse && <span style={{ position: 'absolute', top: 4, right: 4, width: 9, height: 9, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,.3)', display: 'inline-block' }} />}
    </div>
    <div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px', fontWeight: '500' }}>{label}</div>
    </div>
  </div>
);

/* ---- Section wrapper ---- */
const Section = ({ title, icon, color, children }: any) => (
  <div style={{ backgroundColor: 'white', borderRadius: '18px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
    <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fafafa' }}>
      <div style={{ backgroundColor: color + '18', padding: '8px', borderRadius: '10px', color, display: 'flex' }}>{icon}</div>
      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{title}</h3>
    </div>
    <div style={{ padding: '20px 22px' }}>{children}</div>
  </div>
);

/* ---- Status badge ---- */
const StatusBadge = ({ count, label, color, bg, icon }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', backgroundColor: bg, marginBottom: '10px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{label}</span>
    </div>
    <span style={{ fontSize: '20px', fontWeight: '800', color }}>{count}</span>
  </div>
);

/* ---- Progress bar ---- */
const ProgressBar = ({ label, value, max, color }: any) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>{label}</span>
        <span style={{ fontSize: '13px', color, fontWeight: '700' }}>{value} <span style={{ color: '#94a3b8', fontWeight: '400' }}>({pct}%)</span></span>
      </div>
      <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '99px', transition: 'width .8s ease' }} />
      </div>
    </div>
  );
};

/* ============================================================
   DASHBOARD TAB
   ============================================================ */
const DashboardTab: React.FC<Props> = ({ courses, users, orders, instructors, progressData, getCourseEnrolledCount }) => {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchOnline = () => api.get('/users/online').then(r => setOnlineUsers(r.data)).catch(() => {});
    fetchOnline();
    const interval = setInterval(fetchOnline, 30_000);
    return () => clearInterval(interval);
  }, []);

  /* ---- คำนวณตัวเลข ---- */
  const totalRevenue    = orders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingRevenue  = orders.filter(o => o.status === 'WAITING_PAYMENT').reduce((s, o) => s + Number(o.total_amount), 0);

  // สถานะการเรียน
  const learning_active    = orders.filter(o => o.status === 'COMPLETED').length;
  const learning_completed = progressData.filter(p => p.is_completed).length;
  const learning_total     = learning_active;

  // สถานะการจ่ายเงิน
  const pay_completed = orders.filter(o => o.status === 'COMPLETED').length;
  const pay_waiting   = orders.filter(o => o.status === 'WAITING_PAYMENT').length;
  const pay_rejected  = orders.filter(o => o.status === 'REJECTED' || o.status === 'CANCELLED').length;
  const pay_total     = orders.length;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>

      {/* ===== HEADER ===== */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', margin: 0 }}>ภาพรวมระบบ</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>Dashboard — อัปเดตแบบ real-time</p>
      </div>

      {/* ===== SECTION A — สรุปภาพรวม ===== */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <BarChart2 size={18} color="#6366f1" />
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#6366f1' }}>ภาพรวมทั้งหมด</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <MiniCard icon={<Users size={24}/>}     label="นักเรียนทั้งหมด"    value={users.length}                      color="#3b82f6" bg="#eff6ff"  border="#bfdbfe" />
          <MiniCard icon={<BookOpen size={24}/>}  label="คอร์สเรียน"         value={courses.length}                    color="#10b981" bg="#ecfdf5"  border="#a7f3d0" />
          <MiniCard icon={<Briefcase size={24}/>} label="อาจารย์ผู้สอน"      value={instructors.length}                color="#8b5cf6" bg="#f5f3ff"  border="#ddd6fe" />
          <MiniCard icon={<DollarSign size={24}/>} label="รายได้รวม"         value={`฿${totalRevenue.toLocaleString()}`} color="#ec4899" bg="#fdf2f8"  border="#fbcfe8" />
          <MiniCard icon={<Users size={24}/>}     label="ออนไลน์ขณะนี้"     value={onlineUsers.length}                color="#10b981" bg="#f0fdf4"  border="#bbf7d0" pulse />
        </div>
      </div>

      {/* ===== SECTION B — 3 คอลัมน์หลัก ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '28px' }}>

        {/* B1 — สถานะการเรียนรู้ */}
        <Section title="สถานะการเรียนรู้" icon={<GraduationCap size={18}/>} color="#3b82f6">
          <StatusBadge icon={<PlayCircle size={16}/>} label="กำลังเรียนอยู่"   count={learning_active}    color="#3b82f6" bg="#eff6ff" />
          <StatusBadge icon={<Award size={16}/>} label="เรียนจบแล้ว"      count={learning_completed} color="#10b981" bg="#f0fdf4" />
          <StatusBadge icon={<PauseCircle size={16}/>} label="ยังไม่เริ่มเรียน" count={Math.max(0, learning_active - learning_completed)} color="#f59e0b" bg="#fffbeb" />
          <div style={{ marginTop: '18px' }}>
            <ProgressBar label="อัตราเรียนจบ" value={learning_completed} max={learning_total} color="#10b981" />
          </div>
        </Section>

        {/* B2 — สถานะการชำระเงิน */}
        <Section title="สถานะการชำระเงิน" icon={<CreditCard size={18}/>} color="#ec4899">
          <StatusBadge icon={<CheckCircle size={16}/>} label="ชำระเงินสำเร็จ"  count={pay_completed} color="#10b981" bg="#f0fdf4" />
          <StatusBadge icon={<Clock size={16}/>} label="รอการอนุมัติ"    count={pay_waiting}   color="#f59e0b" bg="#fffbeb" />
          <StatusBadge icon={<XCircle size={16}/>} label="ถูกปฏิเสธ/ยกเลิก" count={pay_rejected} color="#ef4444" bg="#fef2f2" />
          <div style={{ marginTop: '18px', padding: '14px', backgroundColor: '#fdf2f8', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>รายได้รอดำเนินการ</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#ec4899' }}>฿{pendingRevenue.toLocaleString()}</div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <ProgressBar label="อัตราสำเร็จ" value={pay_completed} max={pay_total} color="#10b981" />
          </div>
        </Section>

        {/* B3 — คอร์สยอดนิยม */}
        <Section title="คอร์สยอดนิยม" icon={<TrendingUp size={18}/>} color="#f59e0b">
          {[...courses]
            .sort((a, b) => getCourseEnrolledCount(b) - getCourseEnrolledCount(a))
            .slice(0, 5)
            .map((course, idx) => {
              const count = getCourseEnrolledCount(course);
              const max   = getCourseEnrolledCount(courses[0]) || 1;
              const pct   = Math.round((count / max) * 100);
              return (
                <div key={idx} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                      {idx + 1}. {course.title}
                    </span>
                    <span style={{ fontSize: '12px', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '99px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                      {count} คน
                    </span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, #f59e0b, #fbbf24)`, borderRadius: '99px', transition: 'width .8s ease' }} />
                  </div>
                </div>
              );
            })}
        </Section>
      </div>

      {/* ===== SECTION C — ออนไลน์ขณะนี้ ===== */}
      <div style={{ marginTop: '20px' }}>
        <Section title={`นักเรียนออนไลน์ขณะนี้ · ${onlineUsers.length} คน`} icon={<Users size={18}/>} color="#10b981">
          {onlineUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px', color: '#94a3b8', fontSize: '14px' }}>
              ไม่มีนักเรียนออนไลน์ขณะนี้
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {onlineUsers.map((u: any) => (
                <div key={u.user_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px' }}>
                  <div style={{ position: 'relative' }}>
                    {u.profile_picture_url ? (
                      <img src={getImageUrl(u.profile_picture_url, 'user')} alt={u.full_name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                        {u.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', border: '2px solid white' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{u.full_name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{u.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

    </div>
  );
};

export default DashboardTab;