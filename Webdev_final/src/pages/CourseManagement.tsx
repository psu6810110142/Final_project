import React, { useState, useEffect } from 'react';
import api from '../api'; // ✅ 1. เปลี่ยนมาใช้ api แทน axios ตัวเดิม
import { AxiosError } from 'axios'; // ✅ 2. เอาไว้จัดการ Error แบบไม่มี any
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Users, LogOut, Plus, Edit, Trash2, 
  X, Search, ChevronRight, GraduationCap, Briefcase, 
  ShoppingBag, DollarSign, Settings, Phone, Mail, User, AlertCircle, Loader2,
  ListChecks
} from 'lucide-react';
import logoImage from '../assets/Logo.png'; 
import './HomePage.css'; 

// --- Interfaces ---
interface CourseData {
  course_id: number;
  title: string;
  description: string;
  price: number;
  duration_weeks: number;
  cover_image_url?: string;
  total_enrolled?: number;
  level_id?: number; 
  instructor_id?: number;
  level?: { level_id: number; level_name: string };
  instructor?: { instructor_id: number; name: string };
}

interface UserData {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  level_id?: number;
  interesting_subject?: string;
  level?: {
    level_id: number;
    level_name: string;
  };
}

interface InstructorData {
  instructor_id: number;
  name: string;
  bio: string;
  education: string;
  experience: string;
  subject_taught: string;
  contact_info: string;
  profile_image_url: string;
  is_active: boolean;
}

interface OrderData {
  order_id: number;
  user_id: number; 
  status: string;
  total_amount: number;
}

const mockLevels = [
  { level_id: 1, level_name: 'ป.4' }, { level_id: 2, level_name: 'ป.5' },
  { level_id: 3, level_name: 'ป.6' }, { level_id: 4, level_name: 'ม.1' },
  { level_id: 5, level_name: 'ม.2' }, { level_id: 6, level_name: 'ม.3' },
];

const mockSubjects = [
  { value: 'math', label: 'คณิตศาสตร์' }, { value: 'science', label: 'วิทยาศาสตร์' },
  { value: 'english', label: 'ภาษาอังกฤษ' }, { value: 'thai', label: 'ภาษาไทย' },
  { value: 'social', label: 'สังคมศึกษา' },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'instructors' | 'students'>('dashboard');
  const [loading, setLoading] = useState(true);
  
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [instructors, setInstructors] = useState<InstructorData[]>([]);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseModalMode, setCourseModalMode] = useState<'add' | 'edit'>('add');
  
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [instructorModalMode, setInstructorModalMode] = useState<'add' | 'edit'>('add');

  const [isCourseRosterModalOpen, setIsCourseRosterModalOpen] = useState(false);
  const [selectedCourseForRoster, setSelectedCourseForRoster] = useState<CourseData | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
  const [searchText, setSearchText] = useState('');

  const [courseFormData, setCourseFormData] = useState<CourseData>({
    course_id: 0, title: '', description: '', price: 0, duration_weeks: 0, 
    level_id: 0, instructor_id: 0, cover_image_url: ''
  });
  
  const [studentFormData, setStudentFormData] = useState<UserData>({
    user_id: 0, username: '', full_name: '', email: '', phone: '', role: '', created_at: '',
    level_id: 0, interesting_subject: ''
  });

  const [instructorFormData, setInstructorFormData] = useState<InstructorData>({
    instructor_id: 0, name: '', bio: '', education: '', experience: '', 
    subject_taught: '', contact_info: '', profile_image_url: '', is_active: true
  });

  const getSubjectName = (val?: string) => mockSubjects.find(s => s.value === val)?.label || val || '-';
  const getLevelName = (id?: number) => mockLevels.find(l => l.level_id === id)?.level_name || '-';
  
  const getCourseEnrolledCount = (course: CourseData) => {
    if (course.total_enrolled !== undefined && course.total_enrolled > 0) return course.total_enrolled;
    return orders.filter(o => Number(o.total_amount) === Number(course.price)).length;
  };

  const getStudentsForCourse = (course: CourseData) => {
    const enrolledOrders = orders.filter(o => Number(o.total_amount) === Number(course.price));
    return enrolledOrders
      .map(order => users.find(u => u.user_id === order.user_id))
      .filter((u): u is UserData => u !== undefined);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // ✅ 3. ลบการดึง Token ด้วยตัวเองออก ใช้ api.get แทน axios.get
      const [coursesRes, usersRes, ordersRes, instructorsRes] = await Promise.all([
        api.get('/courses').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/orders').catch(() => ({ data: [] })),
        api.get('/instructors').catch(() => ({ data: [] }))
      ]);

      setCourses(coursesRes.data);
      const sortedUsers = (usersRes.data as UserData[])
        .filter(u => u.role === 'STUDENT')
        .sort((a, b) => a.full_name.localeCompare(b.full_name, 'th'));
      
      setUsers(sortedUsers);
      setOrders(ordersRes.data);
      setInstructors(instructorsRes.data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStudentCourses = (userId: number) => {
    const userOrders = orders.filter(o => o.user_id === userId);
    return userOrders.map(order => {
       const matchedCourse = courses.find(c => Number(c.price) === Number(order.total_amount));
       // ✅ จัดการ Type แทนการใช้ any
       const fallbackCourse: Partial<CourseData> = { title: 'คอร์สไม่ระบุ', price: order.total_amount };
       return {
         order_id: order.order_id,
         course: matchedCourse || fallbackCourse
       };
    });
  };

  const handleOpenEditCourse = (course: CourseData) => {
    setCourseModalMode('edit');
    setCourseFormData({
      ...course,
      level_id: course.level?.level_id || 0,
      instructor_id: course.instructor?.instructor_id || 0,
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if(courseFormData.instructor_id === 0) return alert('กรุณาเลือกผู้สอน');
    if(courseFormData.level_id === 0) return alert('กรุณาเลือกระดับชั้น');

    try {
      const payload = {
        title: courseFormData.title,
        description: courseFormData.description,
        price: Number(courseFormData.price),
        duration_weeks: Number(courseFormData.duration_weeks),
        level_id: Number(courseFormData.level_id),
        instructor_id: Number(courseFormData.instructor_id),
        cover_image_url: courseFormData.cover_image_url
      };

      if (courseModalMode === 'add') {
        await api.post('/courses', payload); // ✅ ใช้ api
      } else {
        await api.patch(`/courses/${courseFormData.course_id}`, payload); // ✅ ใช้ api
      }
      setIsCourseModalOpen(false);
      fetchAllData();
    } catch (err: unknown) { alert('บันทึกคอร์สไม่สำเร็จ'); }
  };

  const handleDeleteCourse = async (id: number) => {
    if(!confirm('ยืนยันการลบคอร์สนี้?')) return;
    try {
      await api.delete(`/courses/${id}`); // ✅ ใช้ api
      fetchAllData();
    } catch (err: unknown) {
      alert('ลบคอร์สไม่สำเร็จ');
    }
  };

  const handleSaveInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (instructorModalMode === 'add') {
        const { instructor_id, ...data } = instructorFormData;
        await api.post('/instructors', data);
      } else {
        await api.patch(`/instructors/${instructorFormData.instructor_id}`, instructorFormData);
      }
      setIsInstructorModalOpen(false);
      fetchAllData();
    } catch (err: unknown) { alert('บันทึกข้อมูลครูไม่สำเร็จ'); }
  };

  const handleDeleteInstructor = async (id: number) => {
    if(!confirm('ยืนยันการลบผู้สอนท่านนี้? (คอร์สที่สอนอยู่อาจได้รับผลกระทบ)')) return;
    try {
      await api.delete(`/instructors/${id}`);
      fetchAllData();
    } catch (err: unknown) { 
      // ✅ ใช้ AxiosError จัดการแทน any
      const axiosError = err as AxiosError<{ message: string }>;
      alert(axiosError.response?.data?.message || 'ไม่สามารถลบได้ กรุณาตรวจสอบว่ามีคอร์สผูกอยู่หรือไม่'); 
    }
  };

  const handleOpenStudentDetail = (student: UserData) => {
    setSelectedStudent(student);
    setStudentFormData({ ...student, level_id: student.level?.level_id || 0 });
    setIsStudentModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/users/${studentFormData.user_id}`, {
        full_name: studentFormData.full_name,
        phone: studentFormData.phone,
        email: studentFormData.email,
        level_id: Number(studentFormData.level_id),
        interesting_subject: studentFormData.interesting_subject
      });
      
      alert('แก้ไขข้อมูลนักเรียนสำเร็จ');
      setIsStudentModalOpen(false);
      fetchAllData();
    } catch (err: unknown) { alert('แก้ไขไม่สำเร็จ กรุณาลองใหม่'); }
  };

  const handleDeleteStudent = async (id: number) => {
    if(!confirm('⚠️ คำเตือน: การลบผู้ใช้นี้ ข้อมูลประวัติการเรียนทั้งหมดจะหายไป! ยืนยันหรือไม่?')) return;
    try {
      await api.delete(`/users/${id}`);
      alert('ลบนักเรียนออกจากระบบเรียบร้อย');
      setIsStudentModalOpen(false);
      fetchAllData();
    } catch (err: unknown) { alert('ลบไม่สำเร็จ'); }
  };

  const handleCancelStudentCourse = async (orderId: number) => {
    if(!confirm('ยืนยันการยกเลิกคอร์สเรียนนี้ให้นักเรียน?')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      setOrders(prev => prev.filter(o => o.order_id !== orderId));
    } catch (err: unknown) { alert('ยกเลิกไม่สำเร็จ'); }
  };

  const layoutStyle: React.CSSProperties = { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: '"Prompt", sans-serif' };
  const sidebarStyle: React.CSSProperties = { width: '260px', backgroundColor: '#1e293b', color: '#f1f5f9', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100%', left: 0, top: 0, zIndex: 50, boxShadow: '2px 0 10px rgba(0,0,0,0.1)' };
  const contentStyle: React.CSSProperties = { marginLeft: '260px', flex: 1, padding: '40px', width: 'calc(100% - 260px)' };
  const menuItemStyle = (isActive: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', padding: '12px 24px', cursor: 'pointer', backgroundColor: isActive ? '#334155' : 'transparent', color: isActive ? '#38bdf8' : '#94a3b8', borderLeft: isActive ? '4px solid #38bdf8' : '4px solid transparent', transition: 'all 0.2s', marginBottom: '4px', fontWeight: isActive ? 600 : 400 });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', color: '#64748b' }}>
          <Loader2 className="spin" size={48} color="#3b82f6" />
          <span style={{ fontSize: '18px', fontWeight: '500' }}>กำลังโหลดข้อมูลระบบ...</span>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '28px', marginBottom: '30px', fontWeight: 'bold', color: '#1e293b' }}>ภาพรวมระบบ (Dashboard)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {[
          { label: 'นักเรียนทั้งหมด', value: users.length, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'คอร์สเรียน', value: courses.length, icon: BookOpen, color: '#10b981', bg: '#ecfdf5' },
          { label: 'ผู้สอน', value: instructors.length, icon: Briefcase, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'รายได้รวม', value: `฿${orders.reduce((sum, o) => sum + Number(o.total_amount), 0).toLocaleString()}`, icon: DollarSign, color: '#ec4899', bg: '#fdf2f8' }
        ].map((stat, idx) => (
          <div key={idx} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border:'1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow:'0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ backgroundColor: stat.bg, padding: '16px', borderRadius: '12px', color: stat.color }}>
              <stat.icon size={28} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>{stat.value}</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInstructors = () => (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b' }}>จัดการผู้สอน ({instructors.length})</h1>
        <button onClick={() => { setInstructorModalMode('add'); setInstructorFormData({ instructor_id: 0, name: '', bio: '', education: '', experience: '', subject_taught: '', contact_info: '', profile_image_url: '', is_active: true }); setIsInstructorModalOpen(true); }} className="btn-hero" style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '14px' }}>
          <Plus size={18} style={{ marginRight: '6px' }} /> เพิ่มผู้สอน
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'20px' }}>
        {instructors.map(instructor => (
          <div key={instructor.instructor_id} style={{ background:'white', borderRadius:'16px', border:'1px solid #e2e8f0', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ width:'80px', height:'80px', borderRadius:'50%', backgroundColor:'#e2e8f0', backgroundImage:`url(${instructor.profile_image_url})`, backgroundSize:'cover', backgroundPosition:'center', marginBottom:'15px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:'bold', color:'#94a3b8' }}>
              {!instructor.profile_image_url && instructor.name.charAt(0)}
            </div>
            <h3 style={{ fontSize:'18px', fontWeight:'bold', color:'#1e293b', margin:'0 0 5px 0' }}>{instructor.name}</h3>
            <span className="badge" style={{ backgroundColor:'#f1f5f9', color:'#64748b', fontSize:'12px', marginBottom:'15px' }}>วิชา: {instructor.subject_taught || 'ไม่ระบุ'}</span>
            
            <div style={{ display:'flex', gap:'10px', width:'100%', marginTop:'auto' }}>
              <button onClick={() => { setInstructorModalMode('edit'); setInstructorFormData(instructor); setIsInstructorModalOpen(true); }} style={{ flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #cbd5e1', cursor:'pointer', background:'white', display:'flex', justifyContent:'center', alignItems:'center', gap:'5px', color:'#475569' }}>
                <Edit size={16}/> แก้ไข
              </button>
              <button onClick={() => handleDeleteInstructor(instructor.instructor_id)} style={{ flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #fecaca', cursor:'pointer', background:'#fef2f2', display:'flex', justifyContent:'center', alignItems:'center', gap:'5px', color:'#ef4444' }}>
                <Trash2 size={16}/> ลบ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStudents = () => {
    const filteredUsers = users.filter(u => 
      u.full_name.toLowerCase().includes(searchText.toLowerCase()) || 
      u.email.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems:'center' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b' }}>รายชื่อนักเรียน ({users.length})</h1>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input type="text" placeholder="ค้นหาชื่อ หรือ อีเมล..." value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '18px', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>ชื่อ - นามสกุล</th>
                <th style={{ padding: '18px', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>ระดับชั้น</th>
                <th style={{ padding: '18px', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>วิชาที่สนใจ</th>
                <th style={{ padding: '18px', textAlign: 'left', color: '#64748b', fontSize: '14px' }}>เบอร์โทร</th>
                <th style={{ padding: '18px', textAlign: 'right', color: '#64748b', fontSize: '14px' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((student, idx) => (
                <tr key={student.user_id} 
                    style={{ borderBottom: idx !== filteredUsers.length -1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', transition: 'background 0.2s' }} 
                    onClick={() => handleOpenStudentDetail(student)} 
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize:'14px', fontWeight:'bold' }}>
                      {student.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#334155' }}>{student.full_name}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{student.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '18px', color: '#64748b' }}>
                    <span className="badge" style={{fontSize:'12px'}}>{student.level?.level_name || getLevelName(student.level_id)}</span>
                  </td>
                  <td style={{ padding: '18px', color: '#64748b' }}>{student.interesting_subject ? getSubjectName(student.interesting_subject) : '-'}</td>
                  <td style={{ padding: '18px', color: '#64748b' }}>{student.phone || '-'}</td>
                  <td style={{ padding: '18px', textAlign: 'right' }}>
                    <button style={{ padding:'6px 12px', borderRadius:'6px', border:'1px solid #e2e8f0', backgroundColor:'white', cursor:'pointer', color:'#64748b', fontSize:'13px', display:'inline-flex', alignItems:'center', gap:'4px' }}>
                      จัดการ <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={layoutStyle}>
      <aside style={sidebarStyle}>
        <div style={{ padding: '30px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #334155' }}>
          <img src={logoImage} alt="Logo" style={{ width: '32px', height:'32px' }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '0.5px', color:'white' }}>ADMIN PANEL</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Management System</div>
          </div>
        </div>
        <div style={{ padding: '20px 0', flex: 1 }}>
          <div onClick={() => setActiveTab('dashboard')} style={menuItemStyle(activeTab === 'dashboard')}><LayoutDashboard size={20} style={{ marginRight: '12px' }} /> ภาพรวมระบบ</div>
          <div onClick={() => setActiveTab('courses')} style={menuItemStyle(activeTab === 'courses')}><BookOpen size={20} style={{ marginRight: '12px' }} /> จัดการคอร์สเรียน</div>
          <div onClick={() => setActiveTab('instructors')} style={menuItemStyle(activeTab === 'instructors')}><Briefcase size={20} style={{ marginRight: '12px' }} /> จัดการผู้สอน</div>
          <div onClick={() => setActiveTab('students')} style={menuItemStyle(activeTab === 'students')}><GraduationCap size={20} style={{ marginRight: '12px' }} /> รายชื่อนักเรียน</div>
        </div>
        <div style={{ padding: '24px', borderTop: '1px solid #334155' }}>
          <div onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ ...menuItemStyle(false), color: '#ef4444', padding:'0' }}><LogOut size={20} style={{ marginRight: '12px' }} /> ออกจากระบบ</div>
        </div>
      </aside>

      <main style={contentStyle}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'instructors' && renderInstructors()}
        
        {activeTab === 'courses' && (
          <div className="animate-fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b' }}>จัดการคอร์สเรียน</h1>
                <button onClick={() => { setCourseModalMode('add'); setCourseFormData({ course_id: 0, title: '', description: '', price: 0, duration_weeks: 0, level_id: 0, instructor_id: 0, cover_image_url: '' }); setIsCourseModalOpen(true); }} className="btn-hero" style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '14px' }}>
                  <Plus size={18} style={{ marginRight: '6px' }} /> เพิ่มคอร์สใหม่
                </button>
             </div>
             <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px' }}>
                {courses.map(course => (
                  <div key={course.course_id} style={{ background:'white', borderRadius:'12px', overflow:'hidden', border:'1px solid #e2e8f0', transition:'transform 0.2s', boxShadow:'0 2px 5px rgba(0,0,0,0.03)' }}>
                    <div style={{ height:'140px', backgroundColor:'#e2e8f0', backgroundImage:`url(${course.cover_image_url})`, backgroundSize:'cover' }}></div>
                    <div style={{ padding:'16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="badge" style={{fontSize:'10px', marginBottom:'8px'}}>{course.level?.level_name || '-'}</span>
                      </div>
                      <h3 style={{ fontSize:'16px', fontWeight:'bold', marginBottom:'6px', color:'#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</h3>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>สอนโดย: {course.instructor?.name || 'ไม่ระบุ'}</div>
                      
                      <div style={{ fontSize: '13px', color: '#3b82f6', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
                        <Users size={14} /> ผู้เรียนลงทะเบียน: {getCourseEnrolledCount(course)} คน
                      </div>

                      <button 
                        onClick={() => { setSelectedCourseForRoster(course); setIsCourseRosterModalOpen(true); }}
                        style={{ width: '100%', marginTop: '10px', padding: '8px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                        <ListChecks size={14} /> ดูรายชื่อผู้เรียน
                      </button>

                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'12px', borderTop:'1px solid #f1f5f9', paddingTop:'12px' }}>
                         <span style={{ fontSize:'18px', fontWeight:'bold', color:'#10b981' }}>฿{Number(course.price).toLocaleString()}</span>
                         <div style={{ display:'flex', gap:'8px' }}>
                           <button onClick={() => handleOpenEditCourse(course)} style={{ padding:'6px', borderRadius:'6px', border:'1px solid #cbd5e1', cursor:'pointer', background:'white' }}><Edit size={16} color="#64748b"/></button>
                           <button onClick={() => handleDeleteCourse(course.course_id)} style={{ padding:'6px', borderRadius:'6px', border:'1px solid #cbd5e1', cursor:'pointer', background:'white' }}><Trash2 size={16} color="#ef4444"/></button>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'students' && renderStudents()}
      </main>

      {/* Modal: ดูรายชื่อนักเรียนที่ลงทะเบียน */}
      {isCourseRosterModalOpen && selectedCourseForRoster && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px', padding: 0 }}>
            <div style={{ backgroundColor:'#1e293b', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', color: 'white' }}>
              <div>
                <h2 style={{ fontSize: '18px', margin: 0 }}>รายชื่อผู้เรียน: {selectedCourseForRoster.title}</h2>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>จำนวนผู้ลงทะเบียนทั้งหมด: {getCourseEnrolledCount(selectedCourseForRoster)} คน</div>
              </div>
              <button onClick={() => setIsCourseRosterModalOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'white' }}><X size={24}/></button>
            </div>
            <div style={{ padding: '24px', maxHeight: '400px', overflowY: 'auto' }}>
              {getStudentsForCourse(selectedCourseForRoster).length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>ยังไม่มีผู้ลงทะเบียนในคอร์สนี้</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '14px', textAlign: 'left' }}>
                      <th style={{ paddingBottom: '10px' }}>ชื่อ - นามสกุล</th>
                      <th style={{ paddingBottom: '10px' }}>อีเมล</th>
                      <th style={{ paddingBottom: '10px' }}>เบอร์โทรศัพท์</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getStudentsForCourse(selectedCourseForRoster).map(student => (
                      <tr key={student.user_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 0', fontWeight: '500', color: '#1e293b' }}>{student.full_name}</td>
                        <td style={{ padding: '12px 0', color: '#64748b' }}>{student.email}</td>
                        <td style={{ padding: '12px 0', color: '#64748b' }}>{student.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Modal: Add/Edit Course --- */}
      {isCourseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{courseModalMode === 'add' ? 'เพิ่มคอร์สใหม่' : 'แก้ไขคอร์ส'}</h2>
              <button onClick={() => setIsCourseModalOpen(false)} className="btn-close"><X/></button>
            </div>
            <form onSubmit={handleSaveCourse} className="form-wrapper">
              <div className="form-group"><label>ชื่อคอร์ส</label><input className="form-input" value={courseFormData.title} onChange={e => setCourseFormData({...courseFormData, title: e.target.value})} required /></div>
              <div className="form-group"><label>รายละเอียด</label><textarea className="form-textarea" rows={3} value={courseFormData.description} onChange={e => setCourseFormData({...courseFormData, description: e.target.value})} /></div>
              <div className="form-row">
                 <div className="form-group"><label>ราคา</label><input type="number" className="form-input" value={courseFormData.price} onChange={e => setCourseFormData({...courseFormData, price: +e.target.value})} /></div>
                 <div className="form-group"><label>ระยะเวลา (สัปดาห์)</label><input type="number" className="form-input" value={courseFormData.duration_weeks} onChange={e => setCourseFormData({...courseFormData, duration_weeks: +e.target.value})} /></div>
              </div>
              <div className="form-row">
                 <div className="form-group"><label>ระดับชั้น</label><select className="form-select" value={courseFormData.level_id} onChange={e => setCourseFormData({...courseFormData, level_id: +e.target.value})}><option value={0}>เลือก...</option>{mockLevels.map(l => <option key={l.level_id} value={l.level_id}>{l.level_name}</option>)}</select></div>
                 <div className="form-group"><label>อาจารย์ผู้สอน</label><select className="form-select" value={courseFormData.instructor_id} onChange={e => setCourseFormData({...courseFormData, instructor_id: +e.target.value})}><option value={0}>เลือก...</option>{instructors.map(inst => (<option key={inst.instructor_id} value={inst.instructor_id}>{inst.name}</option>))}</select></div>
              </div>
              <div className="form-group"><label>URL รูปภาพหน้าปก</label><input className="form-input" value={courseFormData.cover_image_url} onChange={e => setCourseFormData({...courseFormData, cover_image_url: e.target.value})} /></div>
              <div className="modal-footer"><button type="button" onClick={() => setIsCourseModalOpen(false)} className="btn-cancel">ยกเลิก</button><button type="submit" className="btn-save">บันทึก</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Instructor */}
      {isInstructorModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>{instructorModalMode === 'add' ? 'เพิ่มข้อมูลผู้สอน' : 'แก้ไขข้อมูลผู้สอน'}</h2>
              <button onClick={() => setIsInstructorModalOpen(false)} className="btn-close"><X/></button>
            </div>
            <form onSubmit={handleSaveInstructor} className="form-wrapper">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}><label>ชื่อ - นามสกุล *</label><input className="form-input" value={instructorFormData.name} onChange={e => setInstructorFormData({...instructorFormData, name: e.target.value})} required /></div>
                <div className="form-group" style={{ flex: 1 }}><label>วิชาที่สอน</label><input className="form-input" placeholder="เช่น คณิตศาสตร์" value={instructorFormData.subject_taught} onChange={e => setInstructorFormData({...instructorFormData, subject_taught: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>ประวัติย่อ (Bio)</label><textarea className="form-textarea" rows={2} value={instructorFormData.bio} onChange={e => setInstructorFormData({...instructorFormData, bio: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}><label>ประวัติการศึกษา</label><input className="form-input" value={instructorFormData.education} onChange={e => setInstructorFormData({...instructorFormData, education: e.target.value})} /></div>
                <div className="form-group" style={{ flex: 1 }}><label>ประสบการณ์</label><input className="form-input" value={instructorFormData.experience} onChange={e => setInstructorFormData({...instructorFormData, experience: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>ข้อมูลติดต่อ (อีเมล / เบอร์โทร)</label><input className="form-input" value={instructorFormData.contact_info} onChange={e => setInstructorFormData({...instructorFormData, contact_info: e.target.value})} /></div>
              <div className="form-group"><label>URL รูปโปรไฟล์</label><input className="form-input" placeholder="https://..." value={instructorFormData.profile_image_url} onChange={e => setInstructorFormData({...instructorFormData, profile_image_url: e.target.value})} /></div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsInstructorModalOpen(false)} className="btn-cancel">ยกเลิก</button>
                <button type="submit" className="btn-save">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student Detail */}
      {isStudentModalOpen && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px', padding:'0', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ backgroundColor:'#1e293b', padding:'30px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', color: 'white' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', border: '4px solid #334155' }}>
                  {selectedStudent.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>{selectedStudent.full_name}</h2>
                  <div style={{ display:'flex', gap:'15px', color:'#94a3b8', fontSize:'14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}><User size={16}/> @{selectedStudent.username || 'no-username'}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}><Mail size={16}/> {selectedStudent.email}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}><Phone size={16}/> {selectedStudent.phone || '-'}</div>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsStudentModalOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}><X size={28}/></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight:'400px', backgroundColor: '#f8fafc' }}>
              <div style={{ padding: '30px', borderRight: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom: '25px', color: '#1e293b' }}>
                  <Settings size={20} color="#3b82f6" />
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>ตั้งค่าข้อมูลผู้เรียน</h3>
                </div>
                
                <form onSubmit={handleUpdateStudent}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                    <div>
                      <label style={{fontSize:'13px', fontWeight: '500', color: '#64748b', marginBottom: '6px', display: 'block'}}>ชื่อ - นามสกุล</label>
                      <input className="form-input" style={{ backgroundColor: '#f8fafc' }} value={studentFormData.full_name} onChange={e => setStudentFormData({...studentFormData, full_name: e.target.value})} />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <label style={{fontSize:'13px', fontWeight: '500', color: '#64748b', marginBottom: '6px', display: 'block'}}>ระดับชั้น</label>
                        <select className="form-select" style={{ backgroundColor: '#f8fafc' }} value={studentFormData.level_id || 0} onChange={e => setStudentFormData({...studentFormData, level_id: +e.target.value})}>
                          <option value={0}>-- เลือกระดับ --</option>
                          {mockLevels.map(l => <option key={l.level_id} value={l.level_id}>{l.level_name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{fontSize:'13px', fontWeight: '500', color: '#64748b', marginBottom: '6px', display: 'block'}}>วิชาที่สนใจ</label>
                        <select className="form-select" style={{ backgroundColor: '#f8fafc' }} value={studentFormData.interesting_subject || ''} onChange={e => setStudentFormData({...studentFormData, interesting_subject: e.target.value})}>
                          <option value="">-- เลือกวิชา --</option>
                          {mockSubjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <label style={{fontSize:'13px', fontWeight: '500', color: '#64748b', marginBottom: '6px', display: 'block'}}>เบอร์โทรศัพท์</label>
                        <input className="form-input" style={{ backgroundColor: '#f8fafc' }} value={studentFormData.phone} onChange={e => setStudentFormData({...studentFormData, phone: e.target.value})} />
                      </div>
                      <div>
                        <label style={{fontSize:'13px', fontWeight: '500', color: '#64748b', marginBottom: '6px', display: 'block'}}>อีเมล</label>
                        <input className="form-input" style={{ backgroundColor: '#f8fafc' }} value={studentFormData.email} onChange={e => setStudentFormData({...studentFormData, email: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '30px', paddingTop:'20px', borderTop: '1px solid #f1f5f9', display:'flex', gap:'10px' }}>
                    <button type="submit" className="btn-save" style={{ flex: 2, justifyContent:'center', padding: '12px' }}>อัปเดตข้อมูล</button>
                    <button type="button" onClick={() => handleDeleteStudent(selectedStudent.user_id)} className="btn-cancel" style={{ flex: 1, justifyContent:'center', color:'#ef4444', borderColor:'#fee2e2', backgroundColor:'#fef2f2', padding: '12px' }}>
                      <Trash2 size={16} /> ลบ
                    </button>
                  </div>
                </form>
              </div>

              <div style={{ padding: '30px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom: '25px', color: '#1e293b' }}>
                  <BookOpen size={20} color="#10b981" />
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>คอร์สเรียนปัจจุบัน ({getStudentCourses(selectedStudent.user_id).length})</h3>
                </div>
                
                <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight:'5px' }}>
                  {getStudentCourses(selectedStudent.user_id).length === 0 ? (
                    <div style={{ textAlign:'center', padding:'40px 20px', color: '#94a3b8', border:'2px dashed #cbd5e1', borderRadius:'12px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', backgroundColor: 'white' }}>
                      <AlertCircle size={32} color="#cbd5e1"/>
                      <span>ยังไม่มีประวัติการลงทะเบียน</span>
                    </div>
                  ) : (
                    getStudentCourses(selectedStudent.user_id).map((item, idx) => (
                      <div key={idx} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #e2e8f0', boxShadow:'0 2px 4px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#10b981' }}></div>
                        <div style={{ fontWeight: '600', fontSize: '15px', color: '#334155', marginBottom:'6px' }}>
                           {item.course.title || 'ชื่อคอร์สไม่ระบุ'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '13px', color:'#64748b', fontWeight: '500' }}>฿{Number(item.course.price || 0).toLocaleString()}</div>
                          <button 
                            onClick={() => handleCancelStudentCourse(item.order_id)}
                            style={{ fontSize: '12px', color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', cursor: 'pointer', display:'flex', alignItems:'center', gap:'4px', fontWeight:'500', padding:'6px 10px', borderRadius:'6px', transition: 'all 0.2s' }}
                          >
                            <Trash2 size={14}/> ยกเลิกสิทธิ์
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;