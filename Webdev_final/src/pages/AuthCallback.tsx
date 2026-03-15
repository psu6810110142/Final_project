import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
const navigate = useNavigate();

useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (!token || !userStr) {
        return; // ← หยุดถ้าไม่มีค่า ไม่ต้อง navigate ไป login
    }

    localStorage.setItem('access_token', token);
    localStorage.setItem('user', decodeURIComponent(userStr));

    const user = JSON.parse(decodeURIComponent(userStr));
    if (user.role === 'ADMIN') {
        navigate('/manage-courses');
    } else {
        navigate('/home');
    }
}, [navigate]);

return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
    <h2 style={{ color: '#64748b' }}>กำลังเข้าสู่ระบบ... ⏳</h2>
    </div>
);
};

export default AuthCallback;