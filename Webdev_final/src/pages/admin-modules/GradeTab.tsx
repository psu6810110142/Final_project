import React, { useState, useEffect } from 'react';
import { Award, Search, Save } from 'lucide-react';
import api from '../../api';

interface Props {
  courses: any[];
}

const gradeFromScore = (score: number) => {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

const GradeTab: React.FC<Props> = ({ courses }) => {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<Record<number, any[]>>({});
  const [grades, setGrades] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStudentResults = async (course: any) => {
    setLoading(true);
    setSelectedCourse(course);
    try {
      // ดึงนักเรียนในคอร์ส
      const ordersRes = await api.get('/orders');
      const completed = ordersRes.data.filter((o: any) =>
        o.status === 'COMPLETED' &&
        o.order_details?.some((d: any) => d.course?.course_id === course.course_id)
      );
      const studentList = completed.map((o: any) => o.user).filter(Boolean);
      // dedup
      const unique = Array.from(new Map(studentList.map((s: any) => [s.user_id, s])).values());
      setStudents(unique);

      // ดึง lessons ของคอร์ส
      const lessonsRes = await api.get(`/lessons/course/${course.course_id}`);
      const lessons = Array.isArray(lessonsRes.data) ? lessonsRes.data : [];

      // ดึง quiz submissions สำหรับแต่ละ lesson
      const results: Record<number, any[]> = {};
      for (const lesson of lessons) {
        try {
          const quizRes = await api.get(`/quizzes/lesson/${lesson.lesson_id}`);
          if (quizRes.data?.quiz_id) {
            const subsRes = await api.get(`/quizzes/${quizRes.data.quiz_id}/submissions`);
            results[lesson.lesson_id] = Array.isArray(subsRes.data) ? subsRes.data : [];
          }
        } catch {}
      }
      setQuizResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getTotalScore = (userId: number) => {
    const allSubmissions = Object.values(quizResults).flat();
    const userSubs = allSubmissions.filter((s: any) => s.user_id === userId);
    if (userSubs.length === 0) return null;
    const avg = Math.round(userSubs.reduce((sum: number, s: any) => sum + s.score, 0) / userSubs.length);
    return avg;
  };

  const saveGrade = async (userId: number, grade: string) => {
    setSaving(userId);
    // เก็บใน localStorage เพราะยังไม่มี grade table (สำหรับ demo)
    const key = `grade_${selectedCourse?.course_id}_${userId}`;
    localStorage.setItem(key, grade);
    setGrades(prev => ({ ...prev, [userId]: grade }));
    setTimeout(() => setSaving(null), 500);
  };

  // โหลด grade เดิมจาก localStorage
  useEffect(() => {
    if (!selectedCourse || students.length === 0) return;
    const saved: Record<number, string> = {};
    students.forEach((s: any) => {
      const key = `grade_${selectedCourse.course_id}_${s.user_id}`;
      const g = localStorage.getItem(key);
      if (g) saved[s.user_id] = g;
    });
    setGrades(saved);
  }, [students, selectedCourse]);

  const filtered = students.filter(s =>
    (s.full_name || s.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (!selectedCourse) {
    return (
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>ให้เกรดนักเรียน</h1>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>เลือกคอร์สที่ต้องการให้เกรด</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {courses.map(course => (
            <div key={course.course_id} onClick={() => fetchStudentResults(course)}
              style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all .2s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.1)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
              <Award size={24} color="#4f46e5" style={{ marginBottom: '10px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{course.title}</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>คลิกเพื่อให้เกรด</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setSelectedCourse(null)}
          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#475569' }}>
          ← กลับ
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
          ให้เกรด: {selectedCourse.title}
        </h1>
      </div>

      <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#92400e' }}>
        คะแนนเฉลี่ยจากข้อสอบทุกบทของนักเรียน — ถ้าต่ำกว่า 50% ถือว่าไม่ผ่าน
      </div>

      <div style={{ position: 'relative', marginBottom: '20px', width: '300px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input placeholder="ค้นหานักเรียน..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>กำลังโหลดข้อมูล...</div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>นักเรียน</th>
                <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>คะแนนเฉลี่ย</th>
                <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>เกรดแนะนำ</th>
                <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>เกรดที่ให้</th>
                <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>ไม่มีนักเรียน</td></tr>
              )}
              {filtered.map((student: any) => {
                const totalScore = getTotalScore(student.user_id);
                const suggested = totalScore !== null ? gradeFromScore(totalScore) : '-';
                const currentGrade = grades[student.user_id] || suggested;
                const isPassed = totalScore !== null && totalScore >= 50;
                return (
                  <tr key={student.user_id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{student.full_name || student.username}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{student.email}</div>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      {totalScore !== null ? (
                        <span style={{ fontWeight: '700', fontSize: '16px', color: isPassed ? '#10b981' : '#ef4444' }}>
                          {totalScore}%
                        </span>
                      ) : <span style={{ color: '#94a3b8', fontSize: '13px' }}>ยังไม่ทำข้อสอบ</span>}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <span style={{ fontWeight: '800', fontSize: '18px', color: isPassed ? '#3b82f6' : '#ef4444' }}>{suggested}</span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <select value={grades[student.user_id] || ''}
                        onChange={e => setGrades(prev => ({ ...prev, [student.user_id]: e.target.value }))}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                        <option value="">-- เลือก --</option>
                        {['A', 'B', 'C', 'D', 'F'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <button onClick={() => saveGrade(student.user_id, grades[student.user_id] || suggested)}
                        disabled={saving === student.user_id}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '7px 14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', opacity: saving === student.user_id ? .7 : 1 }}>
                        <Save size={13} /> {saving === student.user_id ? 'บันทึก...' : 'บันทึก'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GradeTab;
