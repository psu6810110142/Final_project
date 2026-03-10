import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import './HomePage.css';

// ==================== Types ====================
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  profilePictureUrl: string;
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
  order_details: {
    course: {
      title: string;
    };
  }[];
}

type ActiveTab = 'personal' | 'account' | 'history';

// ==================== Main Component ====================
const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  // ดึง userId จาก localStorage (user object ที่เซฟตอน Login)
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = storedUser?.sub || null;

  const [activeTab, setActiveTab] = useState<ActiveTab>('personal');

  // States
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    profilePictureUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // ==================== Guard: redirect ถ้าไม่ได้ Login ====================
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/landing');
    }
  }, [navigate]);

  // ==================== Fetch: ข้อมูลผู้ใช้ ====================
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setIsLoadingProfile(false);
        return;
      }
      try {
        const response = await api.get(`/users/${userId}`);
        const data = response.data;
        setUserData({
          firstName: data.firstName || data.first_name || '',
          lastName: data.lastName || data.last_name || '',
          email: data.email || '',
          phone: data.phone || data.phoneNumber || data.phone_number || '',
          bio: data.bio || '',
          profilePictureUrl: data.profile_picture_url
            ? `http://localhost:3001${data.profile_picture_url}`
            : '',
        });
      } catch (error) {
        console.error('ดึงข้อมูลผู้ใช้ล้มเหลว:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchUserData();
  }, [userId]);

  // ==================== Fetch: ประวัติการสั่งซื้อ ====================
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
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      if (selectedFile) {
        formData.append('profile_picture', selectedFile);
      }

      await api.patch(`/users/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // อัปเดต localStorage ให้ Navbar แสดงชื่อใหม่ด้วย
      const updatedUser = {
        ...storedUser,
        full_name: `${userData.firstName} ${userData.lastName}`,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว ✅');
    } catch (error) {
      console.error('อัปเดตข้อมูลล้มเหลว:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('รหัสผ่านใหม่ไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    try {
      await api.patch(`/users/${userId}/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว ✅');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่';
      setPasswordError(msg);
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
      `${userData.firstName || 'U'} ${userData.lastName || ''}`.trim()
    );
    return `https://ui-avatars.com/api/?name=${name}&background=3b82f6&color=fff&size=150`;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      completed: { label: 'ชำระแล้ว', color: '#065f46', bg: '#d1fae5' },
      pending: { label: 'รอดำเนินการ', color: '#92400e', bg: '#fef3c7' },
      failed: { label: 'ล้มเหลว', color: '#991b1b', bg: '#fee2e2' },
      cancelled: { label: 'ยกเลิก', color: '#6b7280', bg: '#f3f4f6' },
    };
    const s = map[status] || { label: status, color: '#374151', bg: '#f3f4f6' };
    return (
      <span
        style={{
          backgroundColor: s.bg,
          color: s.color,
          padding: '4px 12px',
          borderRadius: '50px',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}
      >
        {s.label}
      </span>
    );
  };

  // ==================== Render ====================
  if (isLoadingProfile) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 0', color: '#6b7280' }}>
          กำลังโหลดข้อมูล...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="profile-wrapper">
        {/* Header */}
        <div className="page-header">
          <div className="container">
            <button className="btn-back" onClick={() => navigate(-1)}>
              &#8592; ย้อนกลับ
            </button>
            <h1>ตั้งค่าโปรไฟล์</h1>
            <p>จัดการข้อมูลส่วนตัว รหัสผ่าน และประวัติการสั่งซื้อ</p>
          </div>
        </div>

        {/* Layout */}
        <div className="container">
          <div className="profile-layout">

            {/* ===== Sidebar ===== */}
            <div className="profile-card profile-sidebar">
              {/* Avatar */}
              <div className="profile-avatar-container">
                <img
                  src={getAvatarSrc()}
                  alt="User Avatar"
                  className="profile-avatar"
                />
                <label className="avatar-edit-btn" title="เปลี่ยนรูปโปรไฟล์">
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <h2 className="profile-name">
                {userData.firstName || storedUser?.username || 'ผู้ใช้งาน'}{' '}
                {userData.lastName}
              </h2>
              <p className="profile-role">นักเรียน / Student</p>
              <p className="profile-email">{userData.email}</p>

              <div className="profile-divider" />

              {/* Tab Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(
                  [
                    { id: 'personal', label: '👤 ข้อมูลส่วนตัว' },
                    { id: 'account', label: '🔒 จัดการบัญชี' },
                    { id: 'history', label: '🧾 ประวัติการสั่งซื้อ' },
                  ] as { id: ActiveTab; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={activeTab === tab.id ? 'btn-save' : 'btn-outline-primary'}
                    style={{ fontFamily: 'inherit' }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="profile-divider" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ef4444',
                  background: 'transparent',
                  color: '#ef4444',
                  borderRadius: '50px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#ef4444';
                  (e.currentTarget as HTMLButtonElement).style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                }}
              >
                🚪 ออกจากระบบ
              </button>
            </div>

            {/* ===== Main Content ===== */}
            <div className="profile-card profile-main">

              {/* ---------- Tab: ข้อมูลส่วนตัว ---------- */}
              {activeTab === 'personal' && (
                <div className="fade-in">
                  <h3 className="profile-section-title">ข้อมูลส่วนตัว</h3>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">ชื่อจริง</label>
                        <input
                          type="text"
                          name="firstName"
                          className="form-input"
                          value={userData.firstName}
                          onChange={handleInputChange}
                          placeholder="ชื่อจริง"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">นามสกุล</label>
                        <input
                          type="text"
                          name="lastName"
                          className="form-input"
                          value={userData.lastName}
                          onChange={handleInputChange}
                          placeholder="นามสกุล"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">อีเมล</label>
                      <input
                        type="email"
                        className="form-input"
                        value={userData.email}
                        disabled
                        style={{
                          backgroundColor: '#f3f4f6',
                          cursor: 'not-allowed',
                          color: '#6b7280',
                        }}
                      />
                      <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                        ไม่สามารถเปลี่ยนอีเมลได้
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label">เบอร์โทรศัพท์</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-input"
                        value={userData.phone}
                        onChange={handleInputChange}
                        placeholder="0xx-xxx-xxxx"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">แนะนำตัวสั้นๆ</label>
                      <textarea
                        name="bio"
                        className="form-textarea"
                        rows={4}
                        value={userData.bio}
                        onChange={handleInputChange}
                        placeholder="เล่าให้ฟังหน่อยว่าคุณเป็นใคร..."
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    <div className="profile-actions">
                      <button type="submit" className="btn-save">
                        💾 บันทึกข้อมูล
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ---------- Tab: จัดการบัญชี ---------- */}
              {activeTab === 'account' && (
                <div className="fade-in">
                  <h3 className="profile-section-title">เปลี่ยนรหัสผ่าน</h3>
                  <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                      <label className="form-label">รหัสผ่านปัจจุบัน</label>
                      <input
                        type="password"
                        className="form-input"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">รหัสผ่านใหม่</label>
                      <input
                        type="password"
                        className="form-input"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        placeholder="อย่างน้อย 8 ตัวอักษร"
                        required
                        minLength={8}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">ยืนยันรหัสผ่านใหม่</label>
                      <input
                        type="password"
                        className="form-input"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    {/* Error / Success */}
                    {passwordError && (
                      <div
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          marginBottom: '16px',
                          fontSize: '0.9rem',
                        }}
                      >
                        ⚠️ {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div
                        style={{
                          backgroundColor: '#d1fae5',
                          color: '#065f46',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          marginBottom: '16px',
                          fontSize: '0.9rem',
                        }}
                      >
                        ✅ {passwordSuccess}
                      </div>
                    )}

                    <div className="profile-actions">
                      <button
                        type="submit"
                        className="btn-save"
                        style={{ backgroundColor: '#ef4444' }}
                      >
                        🔒 เปลี่ยนรหัสผ่าน
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ---------- Tab: ประวัติการสั่งซื้อ ---------- */}
              {activeTab === 'history' && (
                <div className="fade-in">
                  <h3 className="profile-section-title">ประวัติการสั่งซื้อ</h3>

                  {isLoadingOrders ? (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
                      กำลังโหลด...
                    </p>
                  ) : orders.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '60px 0',
                        color: '#9ca3af',
                      }}
                    >
                      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧾</div>
                      <p>ยังไม่มีประวัติการสั่งซื้อ</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '0.9rem',
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              borderBottom: '2px solid #e5e7eb',
                              color: '#6b7280',
                              textAlign: 'left',
                            }}
                          >
                            <th style={{ padding: '12px 8px' }}>คอร์สเรียน</th>
                            <th style={{ padding: '12px 8px' }}>ราคา</th>
                            <th style={{ padding: '12px 8px' }}>สถานะ</th>
                            <th style={{ padding: '12px 8px' }}>วันที่</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr
                              key={order.order_id}
                              style={{ borderBottom: '1px solid #f3f4f6' }}
                            >
                              <td style={{ padding: '14px 8px', fontWeight: 500 }}>
                                {order.order_details?.[0]?.course?.title || '-'}
                              </td>
                              <td style={{ padding: '14px 8px', color: '#e74c3c', fontWeight: 600 }}>
                                ฿{Number(order.total_amount)?.toLocaleString()}
                              </td>
                              <td style={{ padding: '14px 8px' }}>
                                {getStatusBadge(order.status)}
                              </td>
                              <td style={{ padding: '14px 8px', color: '#6b7280' }}>
                                {new Date(order.created_at).toLocaleDateString('th-TH', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;