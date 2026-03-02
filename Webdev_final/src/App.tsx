import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Import หน้าทั้งหมดเข้ามา
import LandingPage from './pages/LandingPage'; // หน้าแรก (ยังไม่ล็อกอิน)
import HomePage from './pages/HomePage';       // หน้าหลัก (ล็อกอินแล้ว)
import LoginPage from './pages/LoginPage';     // หน้าเข้าสู่ระบบ
import RegisterPage from './pages/Register';   // หน้าสมัครสมาชิก
import CourseList from './pages/CourseList';  // หน้าคอร์สลิส
import CourseManagement from './pages/CourseManagement';
import MyCourses from './pages/Mycourse';
import CourseDetail from './pages/CourseDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === กำหนดเส้นทาง (Route) === */}
        
        {/* หน้าแรกสุด (localhost:5173/) -> ให้แสดง LandingPage */}
        <Route path="/" element={<LandingPage />} />

        {/* หน้าล็อกอิน (localhost:5173/login) -> ให้แสดง LoginPage */}
        <Route path="/login" element={<LoginPage />} />

        {/* หน้าสมัครสมาชิก (localhost:5173/register) -> ให้แสดง RegisterPage */}
        <Route path="/register" element={<RegisterPage />} />

        {/* หน้าหลักหลังล็อกอิน (localhost:5173/home) -> ให้แสดง HomePage */}
        <Route path="/home" element={<HomePage />} />

        {/* หน้าแสดงคอร์สลิส (localhost:5173/home) -> ให้แสดง Courselist */}
        <Route path="/courses" element={<CourseList />} />

        {/* หน้าแสดงจัดการคอร์ส (localhost:5173/home) -> ให้แสดง CourseManagement */}
        <Route path="/manage-courses" element={<CourseManagement />} />

        {/* 🌟 เพิ่ม Route นี้สำหรับการดูรายละเอียดคอร์ส (ใช้ :id เพื่อรับค่า Parameter) */}
        <Route path="/course/:id" element={<CourseDetail />} />

        <Route path="/my-courses" element={<MyCourses />} />

        {/* กรณีพิมพ์มั่ว ให้เด้งกลับหน้าแรก */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;