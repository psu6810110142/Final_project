import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Briefcase, DollarSign, ListChecks } from 'lucide-react';
import api from '../../api';
import type { CourseData, OrderData, InstructorData, LearningProgressData } from './types';

interface Props {
  courses: CourseData[];
  users: any[];
  orders: OrderData[];
  instructors: InstructorData[];
  progressData: LearningProgressData[];
  getCourseEnrolledCount: (course: CourseData) => number;
}

const DashboardTab: React.FC<Props> = ({ courses, users, orders, instructors, progressData, getCourseEnrolledCount }) => {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchOnline = () => api.get('/users/online').then(r => setOnlineUsers(r.data)).catch(() => {});
    fetchOnline();
    const interval = setInterval(fetchOnline, 30_000); // refresh ทุก 30 วิ
    return () => clearInterval(interval);
  }, []);

  const totalRevenue = orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + Number(o.total_amount), 0);

  const stats = [
    { label: 'นักเรียนทั้งหมด', value: users.length, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'คอร์สเรียนเปิดสอน', value: courses.length, icon: BookOpen, color: '#10b981', bg: '#ecfdf5' },
    { label: 'อาจารย์ผู้สอน', value: instructors.length, icon: Briefcase, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'รายได้รวม (ยอดขาย)', value: `฿${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#ec4899', bg: '#fdf2f8' },
    { label: 'ออนไลน์ขณะนี้', value: onlineUsers.length, icon: Users, color: '#10b981', bg: '#f0fdf4', pulse: true },
  ];

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '28px', marginBottom: '30px', fontWeight: 'bold', color: '#1e293b' }}>
        ภาพรวมระบบ (Dashboard)
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: `1px solid ${(stat as any).pulse ? '#bbf7d0' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ backgroundColor: stat.bg, padding: '16px', borderRadius: '12px', color: stat.color, position: 'relative' }}>
              <stat.icon size={28} />
              {(stat as any).pulse && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.3)', display: 'inline-block' }} />
              )}
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>{stat.value}</div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Online Users List */}
      {onlineUsers.length > 0 && (
        <div style={{ marginTop: '24px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #bbf7d0', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 0 3px rgba(16,185,129,0.3)' }} />
            ผู้เรียนออนไลน์ขณะนี้
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {onlineUsers.map((u: any) => (
              <div key={u.user_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '999px', padding: '6px 14px 6px 6px' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                  {u.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{u.full_name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{u.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ListChecks size={20} color="#3b82f6" /> คอร์สยอดนิยม
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[...courses]
              .sort((a, b) => getCourseEnrolledCount(b) - getCourseEnrolledCount(a))
              .slice(0, 5)
              .map((course, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontWeight: '500', color: '#334155' }}>{course.title}</span>
                  <span style={{ backgroundColor: '#eff6ff', color: '#3b82f6', fontSize: '12px', padding: '4px 10px', borderRadius: '999px' }}>
                    {getCourseEnrolledCount(course)} คน
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b' }}>สถานะการเรียนรู้</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              {
                label: 'กำลังเรียน',
                value: orders.filter(o => o.status === 'COMPLETED').length,
                color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe',
                icon: '📖',
              },
              {
                label: 'เรียนจบแล้ว',
                value: progressData.filter(p => p.is_completed).length,
                color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0',
                icon: '🎓',
              },
              {
                label: 'รออนุมัติ',
                value: orders.filter(o => o.status === 'WAITING_PAYMENT').length,
                color: '#f59e0b', bg: '#fffbeb', border: '#fde68a',
                icon: '⏳',
              },
              {
                label: 'ถูกปฏิเสธ',
                value: orders.filter(o => o.status === 'REJECTED' || o.status === 'CANCELLED').length,
                color: '#ef4444', bg: '#fef2f2', border: '#fecaca',
                icon: '❌',
              },
            ].map((item, i) => (
              <div key={i} style={{ backgroundColor: item.bg, border: `1px solid ${item.border}`, borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: item.color, lineHeight: 1 }}>{item.value}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Online Users */}
      <div style={{ marginTop: '24px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Users size={20} color="#10b981" />
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
            นักเรียนออนไลน์ขณะนี้
          </h3>
          <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: '700', padding: '2px 10px', borderRadius: '999px' }}>
            {onlineUsers.length} คน
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: 'auto' }}>อัปเดตทุก 15 วินาที</span>
        </div>

        {onlineUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '14px' }}>
            ไม่มีนักเรียนออนไลน์ขณะนี้
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {onlineUsers.map((u: any) => (
              <div key={u.user_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px' }}>
                <div style={{ position: 'relative' }}>
                  {u.profile_picture_url ? (
                    <img src={`http://localhost:3001${u.profile_picture_url}`} alt={u.full_name}
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
      </div>
    </div>
  );
};

export default DashboardTab;