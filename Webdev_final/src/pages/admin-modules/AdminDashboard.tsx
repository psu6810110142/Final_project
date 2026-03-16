import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, GraduationCap, Briefcase, LogOut, Loader2, DollarSign, Video, Award } from 'lucide-react';
import logoImage from '../../assets/Logo.png';
import '../HomeTheme.css';

import DashboardTab from './DashboardTab';
import CoursesTab from './CoursesTab';
import InstructorsTab from './InstructorsTab';
import StudentsTab from './StudentsTab';
import GradeTab from './GradeTab';
import PaymentsTab from './PaymentsTab';
import LessonsTab from './LessonsTab';

import type {
  CourseData, UserData, InstructorData, OrderData, LearningProgressData
} from './types';

type Tab = 'dashboard' | 'courses' | 'instructors' | 'students' | 'payments' | 'lessons' | 'grades';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole: string = storedUser?.role || 'STUDENT';
  const isAdmin = userRole === 'ADMIN';
  const [activeTab, setActiveTab] = useState<Tab>(userRole === 'INSTRUCTOR' ? 'lessons' : 'dashboard');

  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState<CourseData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [progressData, setProgressData] = useState<LearningProgressData[]>([]);
  const [pendingPaymentCount, setPendingPaymentCount] = useState(0);

  useEffect(() => {
    // redirect ถ้าไม่ใช่ ADMIN หรือ INSTRUCTOR
    if (!['ADMIN', 'INSTRUCTOR'].includes(userRole)) {
      navigate('/home');
      return;
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // ✅ courses และ instructors ไม่ต้องใช้ token (public)
      // ✅ users, orders, learning-progress ต้องใช้ token (ADMIN)
      // api.ts ควร attach Authorization header อัตโนมัติจาก localStorage
      const [coursesRes, usersRes, ordersRes, instructorsRes, progressRes] = await Promise.all([
        api.get('/courses/manage').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/orders').catch(() => ({ data: [] })),
        api.get('/instructors').catch(() => ({ data: [] })),
        api.get('/learning-progress').catch(() => ({ data: [] })),
      ]);

      const fetchedCourses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
      setCourses(fetchedCourses);
      setInstructors(Array.isArray(instructorsRes.data) ? instructorsRes.data : []);

      // กรอง STUDENT — INSTRUCTOR เห็นเฉพาะนักเรียนในคอร์สตัวเอง
      const allUsers = Array.isArray(usersRes.data) ? usersRes.data as UserData[] : [];
      const allStudents = allUsers.filter(u => u.role === 'STUDENT');

      if (userRole === 'INSTRUCTOR') {
        // ดึง student_ids จาก orders COMPLETED ในคอร์สของอาจารย์
        const rawOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const myCourseIds = new Set(fetchedCourses.map((c: any) => c.course_id));
        // ลอง fetch orders พร้อม order_details
        try {
          const detailOrders = await Promise.all(
            rawOrders
              .filter((o: any) => o.status === 'COMPLETED')
              .map((o: any) => api.get(`/orders/${o.order_id}`).catch(() => null))
          );
          const myStudentIds = new Set<number>();
          detailOrders.forEach(r => {
            if (!r) return;
            const o = r.data;
            const hasMatch = o.order_details?.some((d: any) => myCourseIds.has(d.course?.course_id));
            if (hasMatch && o.user?.user_id) myStudentIds.add(o.user.user_id);
          });
          const filtered = myStudentIds.size > 0
            ? allStudents.filter(u => myStudentIds.has(u.user_id))
            : allStudents;
          setUsers(filtered.sort((a: any, b: any) => (a.full_name || '').localeCompare(b.full_name || '', 'th')));
        } catch {
          setUsers(allStudents.sort((a: any, b: any) => (a.full_name || '').localeCompare(b.full_name || '', 'th')));
        }
      } else {
        setUsers(allStudents.sort((a: any, b: any) => (a.full_name || '').localeCompare(b.full_name || '', 'th')));
      }

      // ✅ orders จาก backend มี structure: { order_id, total_amount, status, user: { user_id, ... } }
      // ต้อง normalize ให้มี user_id ตรงๆ
      const rawOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const normalizedOrders: OrderData[] = rawOrders.map((o: any) => ({
        order_id: o.order_id,
        user_id: o.user?.user_id ?? o.user_id ?? 0,
        status: o.status,
        total_amount: Number(o.total_amount),
      }));
      setOrders(normalizedOrders);

      setProgressData(Array.isArray(progressRes.data) ? progressRes.data : []);

      // โหลด pending payments count เฉพาะ ADMIN
      if (userRole === 'ADMIN') {
        try {
          const paymentsRes = await api.get('/payments');
          const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];
          setPendingPaymentCount(payments.filter((p: any) => p.status === 'PENDING').length);
        } catch {}
      }

    } catch (err) {
      console.error('fetchAllData error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ นับจำนวนผู้เรียนต่อคอร์สจาก order_details (ถูกต้องกว่าเทียบราคา)
  const getCourseEnrolledCount = (course: CourseData) => {
    if (course.total_enrolled !== undefined && course.total_enrolled > 0) return course.total_enrolled;
    return orders.filter(o => Number(o.total_amount) === Number(course.price)).length;
  };

  const menuItem = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', padding: '12px 24px', cursor: 'pointer',
    backgroundColor: active ? '#334155' : 'transparent',
    color: active ? '#38bdf8' : '#94a3b8',
    borderLeft: active ? '4px solid #38bdf8' : '4px solid transparent',
    transition: 'all 0.2s', marginBottom: '4px', fontWeight: active ? 600 : 400,
    fontSize: '14px',
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
        <Loader2 className="spin" size={48} color="#3b82f6" />
      </div>
    );
  }

  // กำหนด tab ตาม role
  const allNavItems: { tab: Tab; label: string; Icon: React.ElementType; roles: string[] }[] = [
    { tab: 'dashboard',   label: 'ภาพรวมระบบ',           Icon: LayoutDashboard, roles: ['ADMIN'] },
    { tab: 'courses',     label: 'จัดการคอร์สเรียน',      Icon: BookOpen,        roles: ['ADMIN'] },
    { tab: 'lessons',     label: 'จัดการบทเรียน',         Icon: Video,           roles: ['ADMIN', 'INSTRUCTOR'] },
    { tab: 'instructors', label: 'จัดการผู้สอน',          Icon: Briefcase,       roles: ['ADMIN'] },
    { tab: 'students',    label: 'รายชื่อนักเรียน',       Icon: GraduationCap,   roles: ['ADMIN', 'INSTRUCTOR'] },
    { tab: 'grades',      label: 'ให้เกรดนักเรียน',        Icon: Award,           roles: ['INSTRUCTOR'] },
    { tab: 'payments',    label: 'ตรวจสอบการชำระเงิน',   Icon: DollarSign,      roles: ['ADMIN'] },
  ];
  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Prompt", sans-serif' }}>
      <aside style={{ width: '260px', backgroundColor: '#1e293b', color: '#f1f5f9', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100%', left: 0, top: 0, zIndex: 50 }}>
        <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #334155' }}>
          <img src={logoImage} alt="Logo" style={{ width: '32px', height: '32px' }} />
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>
            {isAdmin ? 'ADMIN PANEL' : 'INSTRUCTOR PANEL'}
          </div>
        </div>
        <nav style={{ padding: '20px 0', flex: 1 }}>
          {navItems.map(({ tab, label, Icon }) => (
            <div key={tab} onClick={() => setActiveTab(tab)} style={{ ...menuItem(activeTab === tab), justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon size={20} style={{ marginRight: '12px' }} />
                {label}
              </div>
              {tab === 'payments' && pendingPaymentCount > 0 && (
                <span style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: '800', minWidth: '20px', height: '20px', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', animation: 'pulse 2s infinite' }}>
                  {pendingPaymentCount}
                </span>
              )}
            </div>
          ))}
        </nav>
        <div style={{ padding: '24px', borderTop: '1px solid #334155' }}>
          <div onClick={() => { localStorage.clear(); navigate('/login'); }}
            style={{ ...menuItem(false), color: '#ef4444', padding: '10px 0' }}>
            <LogOut size={20} style={{ marginRight: '12px' }} />
            ออกจากระบบ
          </div>
        </div>
      </aside>

      <main style={{ marginLeft: '260px', flex: 1, padding: '40px', width: 'calc(100% - 260px)' }}>
        {activeTab === 'dashboard' && (
          <DashboardTab courses={courses} users={users} orders={orders} instructors={instructors} progressData={progressData} getCourseEnrolledCount={getCourseEnrolledCount} />
        )}
        {activeTab === 'courses' && (
          <CoursesTab courses={courses} instructors={instructors} onRefresh={fetchAllData} userRole={userRole} />
        )}
        {activeTab === 'instructors' && (
          <InstructorsTab instructors={instructors} onRefresh={fetchAllData} />
        )}
        {activeTab === 'students' && (
          <StudentsTab users={users} orders={orders} courses={courses} progressData={progressData} onRefresh={fetchAllData} userRole={userRole} />
        )}
        {activeTab === 'grades' && (
          <GradeTab courses={courses} />
        )}
        {activeTab === 'payments' && (
          <PaymentsTab />
        )}
        {activeTab === 'lessons' && (
          <LessonsTab courses={courses} />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;