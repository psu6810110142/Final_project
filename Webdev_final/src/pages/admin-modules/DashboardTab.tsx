import React from 'react';
import { LayoutDashboard, Users, BookOpen, Briefcase, DollarSign, ListChecks } from 'lucide-react';
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
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  const stats = [
    { label: 'นักเรียนทั้งหมด', value: users.length, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'คอร์สเรียนเปิดสอน', value: courses.length, icon: BookOpen, color: '#10b981', bg: '#ecfdf5' },
    { label: 'อาจารย์ผู้สอน', value: instructors.length, icon: Briefcase, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'รายได้รวม (ยอดขาย)', value: `฿${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#ec4899', bg: '#fdf2f8' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '28px', marginBottom: '30px', fontWeight: 'bold', color: '#1e293b' }}>
        ภาพรวมระบบ (Dashboard)
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ backgroundColor: stat.bg, padding: '16px', borderRadius: '12px', color: stat.color }}>
              <stat.icon size={28} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>{stat.value}</div>
              <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

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

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b' }}>สถานะการเรียนรู้</h3>
          <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#10b981', lineHeight: 1 }}>
            {progressData.filter(p => p.is_completed).length}
          </div>
          <div style={{ color: '#64748b', marginTop: '12px' }}>จำนวนครั้งที่เรียนจบหลักสูตร (สะสม)</div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>{progressData.length}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>กำลังเรียน</div>
            </div>
            <div style={{ width: '1px', backgroundColor: '#e2e8f0' }} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                {progressData.filter(p => !p.is_completed && p.completion_percentage > 0).length}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>ยังไม่จบ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;