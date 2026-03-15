import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../api';
import '../HomeTheme.css';
import ProfileSidebar from '../ProfilePage/ProfileSidebar';
import ProfileTabs from '../ProfilePage/ProfileTabs';
import '../OceanTheme.css';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggleButton from '../../components/ThemeToggleButton';
import OceanAnimations from '../../components/OceanAnimations';

// ==================== Types ====================
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  profilePictureUrl: string;
  levelId: number | null;
}
 
interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
 
interface OrderItem {
  order_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  order_details: { course: { title: string } }[];
}
 
interface Level {
  level_id: number;
  level_name: string;
}
 
type ActiveTab = 'personal' | 'account' | 'history';
 
// ==================== Main Component ====================
const ProfilePage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
 
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = storedUser?.sub || storedUser?.user_id || storedUser?.id || null;
 
  const [activeTab, setActiveTab] = useState<ActiveTab>('personal');
 
  const [userData, setUserData] = useState<UserData>({
    firstName: '', lastName: '', email: '', phone: '', bio: '',
    profilePictureUrl: '', levelId: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
 
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
 
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
 
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [levelSuccess, setLevelSuccess] = useState('');
 
  // ==================== Guard ====================
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) navigate('/landing');
  }, [navigate]);
 
  // ==================== Fetch: ข้อมูลผู้ใช้ ====================
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) { setIsLoadingProfile(false); return; }
      try {
        const response = await api.get(`/users/${userId}`);
        const data = response.data;
        const lvlId = data.level?.level_id || null;
        setUserData({
          firstName: data.firstName || data.first_name || '',
          lastName: data.lastName || data.last_name || '',
          email: data.email || '',
          phone: data.phone || data.phoneNumber || data.phone_number || '',
          bio: data.bio || '',
          profilePictureUrl: data.profile_picture_url
            ? (data.profile_picture_url.startsWith('http')
                ? data.profile_picture_url                          // ✅ Google URL ใช้ตรงๆ
                : `http://localhost:3001${data.profile_picture_url}`) // ✅ รูปที่อัปโหลดเอง
            : '',
          levelId: lvlId,
        });
        setSelectedLevelId(lvlId);
      } catch (error) {
        console.error('ดึงข้อมูลผู้ใช้ล้มเหลว:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchUserData();
  }, [userId]);
 
  // ==================== Fetch: Levels ====================
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await api.get('/levels');
        setLevels(response.data);
      } catch (error) {
        console.error('ดึงข้อมูล levels ล้มเหลว:', error);
      }
    };
    fetchLevels();
  }, []);
 
  // ==================== Fetch: Orders ====================
  useEffect(() => {
    if (activeTab !== 'history' || !userId) return;
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const response = await api.get(`/orders/user/${userId}`);
        setOrders(response.data);
      } catch (error) {
        console.error('ดึงข้อมูล orders ล้มเหลว:', error);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [activeTab, userId]);
 
  // ==================== Handlers ====================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };
 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };
 
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return alert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
    try {
      const formData = new FormData();
      formData.append('firstName', userData.firstName);
      formData.append('lastName', userData.lastName);
      formData.append('phone', userData.phone);
      formData.append('bio', userData.bio);
      if (selectedLevelId !== null) formData.append('level_id', String(selectedLevelId));
      if (selectedFile) formData.append('profile_picture', selectedFile);
      await api.patch(`/users/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = { ...storedUser, full_name: `${userData.firstName} ${userData.lastName}` };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData({ ...userData, levelId: selectedLevelId });
      setLevelSuccess('บันทึกข้อมูลเรียบร้อยแล้ว ✅');
      alert('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว ✅');
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };
 
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };
 
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(''); setPasswordSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('รหัสผ่านใหม่ไม่ตรงกัน'); return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร'); return;
    }
    try {
      await api.patch(`/users/${userId}/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว ✅');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordError(error?.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };
 
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/landing');
  };
  
  // ==================== Helpers ====================
  const getAvatarSrc = () => {
    if (previewImage) return previewImage;
    if (userData.profilePictureUrl) return userData.profilePictureUrl;
    const name = encodeURIComponent(
      `${userData.firstName || storedUser?.username || 'U'} ${userData.lastName || ''}`.trim()
    );
    return `https://ui-avatars.com/api/?name=${name}&background=3b82f6&color=fff&size=150`;
  };
 
  const currentLevelName =
    levels.find(l => l.level_id === userData.levelId)?.level_name || 'ยังไม่ได้ระบุ';
 
  // ==================== Loading State ====================
  if (isLoadingProfile) {
    return (
      <div className={theme === 'ocean' ? 'ocean-page' : ''}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 0', color: '#6b7280' }}>
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }
 
  // ==================== Render ====================
  return (
    <div className={theme === 'ocean' ? 'ocean-page' : ''}>
      <Navbar />
      <div className="profile-wrapper">
 
        <div className="page-header">
          <div className="container">
            <button className="btn-back" onClick={() => navigate(-1)}>&#8592; ย้อนกลับ</button>
            <h1>ตั้งค่าโปรไฟล์</h1>
            <p>จัดการข้อมูลส่วนตัว ระดับชั้น รหัสผ่าน และประวัติการสั่งซื้อ</p>
          </div>
          <OceanAnimations/>
        </div>
 
        <div className="container">
          <div className="profile-layout">
 
            {/* ===== Component 1: Sidebar ===== */}
            <ProfileSidebar
              firstName={userData.firstName}
              lastName={userData.lastName}
              email={userData.email}
              username={storedUser?.username || ''}
              currentLevelName={currentLevelName}
              avatarSrc={getAvatarSrc()}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onFileChange={handleFileChange}
              onLogout={handleLogout}
            />
 
            {/* ===== Component 2: Tab Content ===== */}
            <ProfileTabs
              activeTab={activeTab}
              userData={userData}
              onInputChange={handleInputChange}
              onUpdateProfile={handleUpdateProfile}
              levels={levels}
              selectedLevelId={selectedLevelId}
              levelSuccess={levelSuccess}
              onSelectLevel={(id) => { setSelectedLevelId(id); setLevelSuccess(''); }}
              passwordData={passwordData}
              passwordError={passwordError}
              passwordSuccess={passwordSuccess}
              onPasswordChange={handlePasswordChange}
              onChangePassword={handleChangePassword}
              orders={orders}
              isLoadingOrders={isLoadingOrders}
            />
 
          </div>
        </div>
      </div>
      <ThemeToggleButton />
    </div>
  );
};
 
export default ProfilePage;