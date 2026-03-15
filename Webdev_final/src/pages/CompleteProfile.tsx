import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import logoImage from '../assets/Logo.png';

const CompleteProfile = () => {
const navigate = useNavigate();
const params = new URLSearchParams(window.location.search);
const email = params.get('email') || '';
const firstName = params.get('firstName') || '';
const lastName = params.get('lastName') || '';
const picture = params.get('picture') ? decodeURIComponent(params.get('picture')!) : '';

const [username, setUsername] = useState('');
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
        alert('กรุณากรอก username');
        return;
    }
    setLoading(true);
    try {
        const response = await api.post('/auth/google/complete', {
        email, username, firstName, lastName, picture,
    });

    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    navigate('/home');
    } catch (error: any) {
        alert(error.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
        setLoading(false);
    }
};

return (
    <div className="page-wrapper">
        <nav className="navbar">
            <div className="container navbar-container">
                <div className="navbar-left">
                    <img src={logoImage} alt="Logo" className="navbar-logo" />
                    <span className="brand-title">New Learning Academy</span>
                </div>
            </div>
        </nav>

    <div className="auth-container page-header-white">
        <div className="auth-card">
            <div className="auth-header">
                {picture && (
                <img
                    src={picture}
                    alt="profile"
                    referrerPolicy="no-referrer"
                    style={{ width: '72px', height: '72px', borderRadius: '50%', marginBottom: '12px' }}
                />
                )}
                <h2>ยินดีต้อนรับ! 👋</h2>
                <p>สวัสดี {firstName} กรุณาตั้ง Username เพื่อเริ่มใช้งาน</p>
            </div>

        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">อีเมล</label>
                <input type="text" className="form-input" value={email} disabled />
            </div>
            <div className="form-group">
                <label className="form-label">Username <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                    type="text"
                    className="form-input"
                    placeholder="กรอก username ที่ต้องการ"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    />
                </div>
                <button
                type="submit"
                className="btn-submit"
                disabled={loading}
                style={{ width: '100%', marginTop: '8px' }}
                >
                {loading ? 'กำลังสร้างบัญชี...' : 'เริ่มต้นใช้งาน'}
                </button>
            </form>
        </div>
    </div>
</div>
);
};

export default CompleteProfile;