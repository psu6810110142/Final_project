import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Users, LogOut, Plus, Edit, Trash2, 
  X, Search, ChevronRight, GraduationCap, 
  ShoppingBag, DollarSign, Settings, Phone, Mail, User, AlertCircle, Loader2
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
  level_id: number;
  instructor_id: number;
}

// ✅ 1. แก้ Interface UserData ให้รองรับ Nested Object 'level'
interface UserData {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  level_id?: number; // เก็บไว้สำหรับ Form
  // เพิ่มตัวนี้เข้ามารับของจาก Backend
  level?: {
    level_id: number;
    level_name: string;
  };
  interesting_subject?: string;
}

interface OrderData {
  order_id: number;
  user_id: number; 
  status: string;
  total_amount: number;
}

// ข้อมูลจำลองสำหรับ Dropdown
const mockLevels = [
  { level_id: 1, level_name: 'ป.4' }, { level_id: 2, level_name: 'ป.5' },
  { level_id: 3, level_name: 'ป.6' }, { level_id: 4, level_name: 'ม.1' },
  { level_id: 5, level_name: 'ม.2' }, { level_id: 6, level_name: 'ม.3' },
];

const mockSubjects = [
  { value: 'math', label: 'คณิตศาสตร์' },
  { value: 'science', label: 'วิทยาศาสตร์' },
  { value: 'english', label: 'ภาษาอังกฤษ' },
  { value: 'thai', label: 'ภาษาไทย' },
  { value: 'social', label: 'สังคมศึกษา' },
];

const mockInstructors = [
  { instructor_id: 1, name: 'อ.สมชาย (คณิต)' },
  { instructor_id: 2, name: 'อ.สมหญิง (วิทย์)' },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'students'>('dashboard');
  const [loading, setLoading] = useState(true);
  
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [courseModalMode, setCourseModalMode] = useState<'add' | 'edit'>('add');
  
  const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
  const [searchText, setSearchText] = useState('');

  const [courseFormData, setCourseFormData] = useState<CourseData>({
    course_id: 0, title: '', description: '', price: 0, duration_weeks: 0, 
    level_id: 0, instructor_id: 1, cover_image_url: ''
  });
  
  const [studentFormData, setStudentFormData] = useState<UserData>({
    user_id: 0, username: '', full_name: '', email: '', phone: '', role: '', created_at: '',
    level_id: 0, interesting_subject: ''
  });

  const getLevelName = (id?: number) => mockLevels.find(l => l.level_id === id)?.level_name || '-';
  const getSubjectName = (val?: string) => mockSubjects.find(s => s.value === val)?.label || val || '-';

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [coursesRes, usersRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:3001/courses', config).catch(() => ({ data: [] })),
        axios.get('http://localhost:3001/users', config).catch(() => ({ data: [] })),
        axios.get('http://localhost:3001/orders', config).catch(() => ({ data: [] }))
      ]);

      setCourses(coursesRes.data);
      
      const sortedUsers = (usersRes.data as UserData[])
        .filter(u => u.role === 'STUDENT')
        .sort((a, b) => a.full_name.localeCompare(b.full_name, 'th'));
      
      setUsers(sortedUsers);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStudentCourses = (userId: number) => {
    const userOrders = orders.filter(o => o.user_id === userId);
    return userOrders.map(order => {
       const matchedCourse = courses.find(c => Number(c.price) === Number(order.total_amount));
       return {
         order_id: order.order_id,
         course: matchedCourse || { title: 'คอร์สไม่ระบุ', price: order.total_amount }
       };
    });
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (courseModalMode === 'add') {
        const { course_id, ...data } = courseFormData;
        await axios.post('http://localhost:3001/courses', data, config);
      } else {
        await axios.put(`http://localhost:3001/courses/${courseFormData.course_id}`, courseFormData, config);
      }
      setIsCourseModalOpen(false);
      fetchAllData();
    } catch (err) { alert('บันทึกไม่สำเร็จ'); }
  };

  const handleDeleteCourse = async (id: number) => {
    if(!confirm('ยืนยันการลบคอร์สนี้?')) return;
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:3001/courses/${id}`, { headers: { Authorization: `Bearer ${token}` }});
    fetchAllData();
  };

  // ✅ 2. แก้จุดนี้: ตอนเปิด Modal ต้องดึง ID ออกมาจาก Object level
  const handleOpenStudentDetail = (student: UserData) => {
    setSelectedStudent(student);
    setStudentFormData({
      ...student,
      // ถ้ามี object level ให้ดึง level_id ออกมาใช้, ถ้าไม่มีให้เป็น 0
      level_id: student.level?.level_id || 0 
    });
    setIsStudentModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3001/users/${studentFormData.user_id}`, {
        full_name: studentFormData.full_name,
        phone: studentFormData.phone,
        email: studentFormData.email,
        level_id: Number(studentFormData.level_id),
        interesting_subject: studentFormData.interesting_subject
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert('แก้ไขข้อมูลนักเรียนสำเร็จ');
      setIsStudentModalOpen(false);
      fetchAllData();
    } catch (err) { alert('แก้ไขไม่สำเร็จ กรุณาลองใหม่'); }
  };

  const handleDeleteStudent = async (id: number) => {
    if(!confirm('⚠️ คำเตือน: การลบผู้ใช้นี้ ข้อมูลประวัติการเรียนทั้งหมดจะหายไป! ยืนยันหรือไม่?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/users/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      alert('ลบนักเรียนออกจากระบบเรียบร้อย');
      setIsStudentModalOpen(false);
      fetchAllData();
    } catch (err) { alert('ลบไม่สำเร็จ (อาจมีข้อมูลค้างในระบบ)'); }
  };

  const handleCancelStudentCourse = async (orderId: number) => {
    if(!confirm('ยืนยันการยกเลิกคอร์สเรียนนี้ให้นักเรียน?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` }});
      alert('ยกเลิกคอร์สเรียบร้อย');
      setOrders(prev => prev.filter(o => o.order_id !== orderId));
    } catch (err) { alert('ยกเลิกไม่สำเร็จ'); }
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
          { label: 'คำสั่งซื้อ', value: orders.length, icon: ShoppingBag, color: '#f59e0b', bg: '#fffbeb' },
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
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือ อีเมล..." 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} 
            />
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
                  
                  {/* ✅ 3. แก้จุดนี้: แสดงชื่อระดับชั้นจาก Object level โดยตรง */}
                  <td style={{ padding: '18px', color: '#64748b' }}>
                    <span className="badge" style={{fontSize:'12px'}}>
                      {student.level?.level_name || '-'}
                    </span>
                  </td>
                  
                  <td style={{ padding: '18px', color: '#64748b' }}>
                    {student.interesting_subject ? getSubjectName(student.interesting_subject) : '-'}
                  </td>
                  <td style={{ padding: '18px', color: '#64748b' }}>{student.phone || '-'}</td>
                  <td style={{ padding: '18px', textAlign: 'right' }}>
                    <button style={{ padding:'6px 12px', borderRadius:'6px', border:'1px solid #e2e8f0', backgroundColor:'white', cursor:'pointer', color:'#64748b', fontSize:'13px', display:'inline-flex', alignItems:'center', gap:'4px' }}>
                      รายละเอียด <ChevronRight size={14} />
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
          <div onClick={() => setActiveTab('students')} style={menuItemStyle(activeTab === 'students')}><GraduationCap size={20} style={{ marginRight: '12px' }} /> รายชื่อนักเรียน</div>
        </div>
        <div style={{ padding: '24px', borderTop: '1px solid #334155' }}>
          <div onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ ...menuItemStyle(false), color: '#ef4444', padding:'0' }}><LogOut size={20} style={{ marginRight: '12px' }} /> ออกจากระบบ</div>
        </div>
      </aside>

      <main style={contentStyle}>
        {activeTab === 'dashboard' && renderDashboard()}
        
        {activeTab === 'courses' && (
          <div className="animate-fade-in">
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b' }}>จัดการคอร์สเรียน</h1>
                <button onClick={() => { setCourseModalMode('add'); setCourseFormData({ course_id: 0, title: '', description: '', price: 0, duration_weeks: 0, level_id: 0, instructor_id: 1, cover_image_url: '' }); setIsCourseModalOpen(true); }} className="btn-hero" style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '14px' }}>
                  <Plus size={18} style={{ marginRight: '6px' }} /> เพิ่มคอร์สใหม่
                </button>
             </div>
             <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px' }}>
                {courses.map(course => (
                  <div key={course.course_id} style={{ background:'white', borderRadius:'12px', overflow:'hidden', border:'1px solid #e2e8f0', transition:'transform 0.2s', boxShadow:'0 2px 5px rgba(0,0,0,0.03)' }}>
                    <div style={{ height:'140px', backgroundColor:'#e2e8f0', backgroundImage:`url(${course.cover_image_url})`, backgroundSize:'cover' }}></div>
                    <div style={{ padding:'16px' }}>
                      <h3 style={{ fontSize:'16px', fontWeight:'bold', marginBottom:'6px', color:'#1e293b' }}>{course.title}</h3>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'10px' }}>
                         <span style={{ fontSize:'18px', fontWeight:'bold', color:'#10b981' }}>฿{Number(course.price).toLocaleString()}</span>
                         <div style={{ display:'flex', gap:'8px' }}>
                           <button onClick={() => { setCourseModalMode('edit'); setCourseFormData(course); setIsCourseModalOpen(true); }} style={{ padding:'6px', borderRadius:'6px', border:'1px solid #cbd5e1', cursor:'pointer', background:'white' }}><Edit size={16} color="#64748b"/></button>
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

      {/* Course Modal */}
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
                 <div className="form-group"><label>ระดับชั้น</label><select className="form-select" value={courseFormData.level_id} onChange={e => setCourseFormData({...courseFormData, level_id: +e.target.value})}>{mockLevels.map(l => <option key={l.level_id} value={l.level_id}>{l.level_name}</option>)}</select></div>
                 <div className="form-group"><label>อาจารย์ผู้สอน</label><select className="form-select" value={courseFormData.instructor_id} onChange={e => setCourseFormData({...courseFormData, instructor_id: +e.target.value})}>{mockInstructors.map(inst => (<option key={inst.instructor_id} value={inst.instructor_id}>{inst.name}</option>))}</select></div>
              </div>
              <div className="form-group"><label>URL รูปภาพหน้าปก</label><input className="form-input" value={courseFormData.cover_image_url} onChange={e => setCourseFormData({...courseFormData, cover_image_url: e.target.value})} /></div>
              <div className="modal-footer"><button type="button" onClick={() => setIsCourseModalOpen(false)} className="btn-cancel">ยกเลิก</button><button type="submit" className="btn-save">บันทึก</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {isStudentModalOpen && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px', padding:'0' }}>
            <div style={{ backgroundColor:'#f8fafc', padding:'24px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold' }}>
                  {selectedStudent.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', color:'#1e293b' }}>{selectedStudent.full_name}</h2>
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px', color:'#64748b', fontSize:'14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}><User size={14}/> {selectedStudent.role} (@{selectedStudent.username || 'no-username'})</div>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}><Mail size={14}/> {selectedStudent.email}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}><Phone size={14}/> {selectedStudent.phone || '-'}</div>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsStudentModalOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}><X size={24}/></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', minHeight:'350px' }}>
              <div style={{ padding: '30px', borderRight: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: '#334155', display:'flex', alignItems:'center', gap:'8px' }}>
                  <Settings size={18}/> แก้ไขข้อมูลส่วนตัว
                </h3>
                <form onSubmit={handleUpdateStudent}>
                  <div className="form-group">
                    <label style={{fontSize:'13px'}}>ชื่อ - นามสกุล</label>
                    <input className="form-input" value={studentFormData.full_name} onChange={e => setStudentFormData({...studentFormData, full_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{fontSize:'13px'}}>อีเมล</label>
                    <input className="form-input" value={studentFormData.email} onChange={e => setStudentFormData({...studentFormData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{fontSize:'13px'}}>เบอร์โทรศัพท์</label>
                    <input className="form-input" value={studentFormData.phone} onChange={e => setStudentFormData({...studentFormData, phone: e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label style={{fontSize:'13px'}}>ระดับชั้น</label>
                    <select className="form-select" value={studentFormData.level_id || 0} onChange={e => setStudentFormData({...studentFormData, level_id: +e.target.value})}>
                      <option value={0}>-- ระบุระดับชั้น --</option>
                      {mockLevels.map(l => <option key={l.level_id} value={l.level_id}>{l.level_name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{fontSize:'13px'}}>วิชาที่สนใจ</label>
                    <select className="form-select" value={studentFormData.interesting_subject || ''} onChange={e => setStudentFormData({...studentFormData, interesting_subject: e.target.value})}>
                      <option value="">-- ระบุวิชา --</option>
                      {mockSubjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  
                  <div style={{ marginTop: '20px', borderTop:'1px solid #e2e8f0', paddingTop:'15px', display:'flex', flexDirection:'column', gap:'10px' }}>
                    <button type="submit" className="btn-save" style={{ width:'100%', justifyContent:'center' }}>บันทึกการแก้ไข</button>
                    <button type="button" onClick={() => handleDeleteStudent(selectedStudent.user_id)} className="btn-cancel" style={{ width:'100%', justifyContent:'center', color:'#ef4444', borderColor:'#fee2e2', backgroundColor:'#fef2f2' }}>
                      <Trash2 size={16} style={{marginRight:'5px'}}/> ลบนักเรียนออกจากระบบ
                    </button>
                  </div>
                </form>
              </div>

              <div style={{ padding: '30px', backgroundColor:'#fcfcfc' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: '#334155', display:'flex', alignItems:'center', gap:'8px' }}>
                  <BookOpen size={18}/> คอร์สที่ลงทะเบียน ({getStudentCourses(selectedStudent.user_id).length})
                </h3>
                <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight:'5px' }}>
                  {getStudentCourses(selectedStudent.user_id).length === 0 ? (
                    <div style={{ textAlign:'center', padding:'40px 20px', color: '#94a3b8', border:'2px dashed #e2e8f0', borderRadius:'12px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
                      <AlertCircle size={32} color="#cbd5e1"/>
                      <span>ยังไม่ได้ลงทะเบียนคอร์สใดๆ</span>
                    </div>
                  ) : (
                    getStudentCourses(selectedStudent.user_id).map((item, idx) => (
                      <div key={idx} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#334155', marginBottom:'4px' }}>
                           {(item.course as any).title || 'ชื่อคอร์สไม่ระบุ'}
                        </div>
                        <div style={{ fontSize: '12px', color:'#64748b' }}>ราคา: ฿{Number((item.course as any).price || 0).toLocaleString()}</div>
                        <div style={{ borderTop:'1px solid #f1f5f9', marginTop:'10px', paddingTop:'10px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleCancelStudentCourse(item.order_id)}
                            style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display:'flex', alignItems:'center', gap:'4px', fontWeight:'500', padding:'4px 8px', borderRadius:'4px' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Trash2 size={12}/> ยกเลิกคอร์สนี้
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