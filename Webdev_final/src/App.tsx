import usePing from './Useping';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './contexts/ThemeContext';

// Import หน้าทั้งหมดเข้ามา
import LandingPage from './pages/LandingPage'; // หน้าแรก (ยังไม่ล็อกอิน)
import HomePage from './pages/HomePage';       // หน้าหลัก (ล็อกอินแล้ว)
import LoginPage from './pages/LoginPage';     // หน้าเข้าสู่ระบบ
import RegisterPage from './pages/Register';   // หน้าสมัครสมาชิก
import CourseList from './pages/CourseList';  // หน้าคอร์สลิส
import CourseManagement from './pages/admin-modules/AdminDashboard';
import MyCourses from './pages/Mycourse';
import CourseDetail from './pages/CourseDetail';
import LearningPage from './pages/LearningPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import PaymentPage from './pages/PaymentPage'; // ✨ 1. Import หน้า Payment เข้ามา
import CompleteProfile from './pages/CompleteProfile';
import AuthCallback from './pages/AuthCallback';
import { CartProvider } from './contexts/CartContext';


function App() {
  usePing();
  return (
    <ThemeProvider>
      <BrowserRouter>
        <CartProvider>
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

            {/* หน้าแสดงคอร์สลิส (localhost:5173/courses) -> ให้แสดง Courselist */}
            <Route path="/courses" element={<CourseList />} />

            {/* หน้าแสดงจัดการคอร์ส (localhost:5173/manage-course) -> ให้แสดง CourseManagement */}
            <Route path="/manage-courses" element={<CourseManagement />} />

            {/* หน้าแสดงรายละเอียดคอร์ส (ใช้ :id เพื่อรับค่า Parameter) */}
            <Route path="/course/:id" element={<CourseDetail />} />

            {/* เพิ่ม Route สำหรับหน้าชำระเงินหลายอันจากตะกร้า (รับ parameter courseId ด้วย) */}
            <Route path="/payment" element={<PaymentPage />} />

            {/* เพิ่ม Route สำหรับหน้าชำระเงินอันเดียว (รับ parameter courseId ด้วย) */}
            <Route path="/payment/:courseId" element={<PaymentPage />} />

            {/* หน้าแสดงคอร์สของฉัน (localhost:5173/my-courses) -> ให้แสดง MyCourses */}
            <Route path="/my-courses" element={<MyCourses />} />

            {/* หน้าแสดงห้องเรียน (localhost:5173/learn) -> ให้แสดง LearningPage */}
            <Route path="/learn/:courseId" element={<LearningPage />} />

            <Route path="/profile" element={<ProfilePage />} />

          {/* กรณีพิมพ์มั่ว ให้เด้งกลับหน้าแรก */}
          <Route path="*" element={<LandingPage />} />
          
          {/* OAuth System */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />

          </Routes>
        </CartProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;