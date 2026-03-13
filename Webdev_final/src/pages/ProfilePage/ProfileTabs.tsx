import React from 'react';

// ==================== Types ====================
type ActiveTab = 'personal' | 'account' | 'history';

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

interface Props {
  activeTab: ActiveTab;

  // personal tab (รวมระดับชั้นด้วย)
  userData: UserData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onUpdateProfile: (e: React.FormEvent<HTMLFormElement>) => void;
  levels: Level[];
  selectedLevelId: number | null;
  levelSuccess: string;
  onSelectLevel: (id: number) => void;

  // account tab
  passwordData: PasswordData;
  passwordError: string;
  passwordSuccess: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePassword: (e: React.FormEvent<HTMLFormElement>) => void;

  // history tab
  orders: OrderItem[];
  isLoadingOrders: boolean;
}

// ==================== Helper: Status Badge ====================
const getStatusBadge = (status: string) => {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    COMPLETED:       { label: 'ชำระแล้ว',   color: '#065f46', bg: '#d1fae5' },
    WAITING_PAYMENT: { label: 'รอชำระเงิน', color: '#92400e', bg: '#fef3c7' },
    CANCELLED:       { label: 'ยกเลิก',      color: '#6b7280', bg: '#f3f4f6' },
  };
  const s = map[status] || { label: status, color: '#374151', bg: '#f3f4f6' };
  return (
    <span style={{
      backgroundColor: s.bg,
      color: s.color,
      padding: '4px 12px',
      borderRadius: '50px',
      fontSize: '0.8rem',
      fontWeight: 600,
    }}>
      {s.label}
    </span>
  );
};

// ==================== ProfileTabs Component ====================
const ProfileTabs: React.FC<Props> = ({
  activeTab,
  userData,
  onInputChange,
  onUpdateProfile,
  levels,
  selectedLevelId,
  levelSuccess,
  onSelectLevel,
  passwordData,
  passwordError,
  passwordSuccess,
  onPasswordChange,
  onChangePassword,
  orders,
  isLoadingOrders,
}) => {
  return (
    <div className="profile-card profile-main">

      {/* ---------- Tab: ข้อมูลส่วนตัว ---------- */}
      {activeTab === 'personal' && (
        <div className="fade-in">
          <h3 className="profile-section-title">ข้อมูลส่วนตัว</h3>
          <form onSubmit={onUpdateProfile}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">ชื่อจริง</label>
                <input
                  type="text" name="firstName" className="form-input"
                  value={userData.firstName} onChange={onInputChange} placeholder="ชื่อจริง"
                />
              </div>
              <div className="form-group">
                <label className="form-label">นามสกุล</label>
                <input
                  type="text" name="lastName" className="form-input"
                  value={userData.lastName} onChange={onInputChange} placeholder="นามสกุล"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">อีเมล</label>
              <input
                type="email" className="form-input" value={userData.email} disabled
                style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' }}
              />
              <small style={{ color: '#9ca3af', fontSize: '0.8rem' }}>ไม่สามารถเปลี่ยนอีเมลได้</small>
            </div>
            <div className="form-group">
              <label className="form-label">เบอร์โทรศัพท์</label>
              <input
                type="tel" name="phone" className="form-input"
                value={userData.phone} onChange={onInputChange} placeholder="0xx-xxx-xxxx"
              />
            </div>
            <div className="form-group">
              <label className="form-label">แนะนำตัวสั้นๆ</label>
              <textarea
                name="bio" className="form-textarea" rows={4}
                value={userData.bio} onChange={onInputChange}
                placeholder="เล่าให้ฟังหน่อยว่าคุณเป็นใคร..."
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* ===== ระดับชั้นเรียน (ย้ายมารวมในฟอร์มนี้) ===== */}
            <div className="form-group">
              <label className="form-label">ระดับชั้นเรียน</label>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '12px', marginTop: '-4px' }}>
                เลือกระดับชั้นของคุณ เพื่อให้ระบบแนะนำคอร์สที่เหมาะสม
              </p>
              {levels.length === 0 ? (
                <p style={{ color: '#9ca3af' }}>กำลังโหลด...</p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '10px',
                }}>
                  {[...levels].sort((a, b) => a.level_id - b.level_id).map((level) => {
                    const isSelected = selectedLevelId === level.level_id;
                    return (
                      <button
                        key={level.level_id}
                        type="button"
                        onClick={() => onSelectLevel(level.level_id)}
                        style={{
                          padding: '16px 8px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                          backgroundColor: isSelected ? '#eff6ff' : 'white',
                          color: isSelected ? '#1e40af' : '#374151',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'inherit',
                          boxShadow: isSelected ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
                          textAlign: 'center',
                        }}
                      >
                        {isSelected && <div style={{ fontSize: '1rem', marginBottom: '2px' }}>✅</div>}
                        {level.level_name}
                      </button>
                    );
                  })}
                </div>
              )}
              {levelSuccess && (
                <div style={{
                  backgroundColor: '#d1fae5', color: '#065f46',
                  padding: '10px 14px', borderRadius: '8px',
                  marginTop: '12px', fontSize: '0.9rem',
                }}>
                  {levelSuccess}
                </div>
              )}
            </div>

            <div className="profile-actions">
              <button type="submit" className="btn-save">💾 บันทึกข้อมูล</button>
            </div>
          </form>
        </div>
      )}

      {/* ---------- Tab: จัดการบัญชี ---------- */}
      {activeTab === 'account' && (
        <div className="fade-in">
          <h3 className="profile-section-title">เปลี่ยนรหัสผ่าน</h3>
          <form onSubmit={onChangePassword}>
            <div className="form-group">
              <label className="form-label">รหัสผ่านปัจจุบัน</label>
              <input
                type="password" className="form-input"
                value={passwordData.currentPassword}
                onChange={onPasswordChange}
                name="currentPassword"
                placeholder="••••••••" required
              />
            </div>
            <div className="form-group">
              <label className="form-label">รหัสผ่านใหม่</label>
              <input
                type="password" className="form-input"
                value={passwordData.newPassword}
                onChange={onPasswordChange}
                name="newPassword"
                placeholder="อย่างน้อย 8 ตัวอักษร" required minLength={8}
              />
            </div>
            <div className="form-group">
              <label className="form-label">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password" className="form-input"
                value={passwordData.confirmPassword}
                onChange={onPasswordChange}
                name="confirmPassword"
                placeholder="••••••••" required
              />
            </div>

            {passwordError && (
              <div style={{
                backgroundColor: '#fee2e2', color: '#991b1b',
                padding: '12px 16px', borderRadius: '8px',
                marginBottom: '16px', fontSize: '0.9rem',
              }}>
                ⚠️ {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div style={{
                backgroundColor: '#d1fae5', color: '#065f46',
                padding: '12px 16px', borderRadius: '8px',
                marginBottom: '16px', fontSize: '0.9rem',
              }}>
                {passwordSuccess}
              </div>
            )}

            <div className="profile-actions">
              <button type="submit" className="btn-save" style={{ backgroundColor: '#ef4444' }}>
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
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>กำลังโหลด...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧾</div>
              <p>ยังไม่มีประวัติการสั่งซื้อ</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px' }}>คอร์สเรียน</th>
                    <th style={{ padding: '12px 8px' }}>ราคา</th>
                    <th style={{ padding: '12px 8px' }}>สถานะ</th>
                    <th style={{ padding: '12px 8px' }}>วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.order_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '14px 8px', fontWeight: 500 }}>
                        {order.order_details?.[0]?.course?.title || '-'}
                      </td>
                      <td style={{ padding: '14px 8px', color: '#e74c3c', fontWeight: 600 }}>
                        ฿{Number(order.total_amount)?.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 8px' }}>{getStatusBadge(order.status)}</td>
                      <td style={{ padding: '14px 8px', color: '#6b7280' }}>
                        {new Date(order.created_at).toLocaleDateString('th-TH', {
                          year: 'numeric', month: 'long', day: 'numeric',
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
  );
};

export default ProfileTabs;