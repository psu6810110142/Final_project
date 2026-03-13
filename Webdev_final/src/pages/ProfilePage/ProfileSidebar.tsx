import React from 'react';

type ActiveTab = 'personal' | 'account' | 'history';

interface Props {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  currentLevelName: string;
  avatarSrc: string;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogout: () => void;
}

const TABS: { id: ActiveTab; label: string }[] = [
  { id: 'personal', label: '👤 ข้อมูลส่วนตัว' },
  { id: 'account',  label: '🔒 จัดการบัญชี' },
  { id: 'history',  label: '🧾 ประวัติการสั่งซื้อ' },
];

const ProfileSidebar: React.FC<Props> = ({
  firstName,
  lastName,
  email,
  username,
  currentLevelName,
  avatarSrc,
  activeTab,
  onTabChange,
  onFileChange,
  onLogout,
}) => {
  return (
    <div className="profile-card profile-sidebar">
      {/* รูปโปรไฟล์ */}
      <div className="profile-avatar-container">
        <img src={avatarSrc} alt="Avatar" className="profile-avatar" />
        <label className="avatar-edit-btn" title="เปลี่ยนรูปโปรไฟล์">
          📷
          <input type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
        </label>
      </div>

      {/* ชื่อและข้อมูลพื้นฐาน */}
      <h2 className="profile-name">
        {firstName || username || 'ผู้ใช้งาน'} {lastName}
      </h2>
      <p className="profile-role">นักเรียน / Student</p>
      <p className="profile-email">{email}</p>

      <div style={{
        margin: '8px 0 16px',
        display: 'inline-block',
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        padding: '4px 16px',
        borderRadius: '50px',
        fontSize: '0.85rem',
        fontWeight: 600,
      }}>
        🎓 {currentLevelName}
      </div>

      <div className="profile-divider" />

      {/* ปุ่ม Tab */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={activeTab === tab.id ? 'btn-save' : 'btn-outline-primary'}
            style={{ fontFamily: 'inherit' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="profile-divider" />

      {/* ปุ่ม Logout */}
      <button
        onClick={onLogout}
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
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#ef4444';
          (e.currentTarget as HTMLButtonElement).style.color = 'white';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
        }}
      >
        🚪 ออกจากระบบ
      </button>
    </div>
  );
};

export default ProfileSidebar;