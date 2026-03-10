import { useEffect } from 'react';
import api from './api';

// ส่ง ping ทุก 30 วินาที เพื่อบอก backend ว่า user ยังออนไลน์
const usePing = () => {
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const ping = () => api.post('/users/ping').catch(() => {});

    ping(); // ping ทันทีที่ mount
    const interval = setInterval(ping, 30_000);
    return () => clearInterval(interval);
  }, []);
};

export default usePing;