import React, { useState, useEffect } from 'react';
import { Award, ChevronLeft, Save, Search, BookOpen, ClipboardList, TrendingUp } from 'lucide-react';
import api from '../../api';

interface Props {
  courses: any[];
}

const GRADE_OPTIONS = ['A', 'B', 'C', 'D', 'F'];

const gradeColor = (g: string) => {
  if (g === 'A') return '#16a34a';
  if (g === 'B') return '#2563eb';
  if (g === 'C') return '#d97706';
  if (g === 'D') return '#ea580c';
  return '#dc2626';
};

const GradeTab: React.FC<Props> = ({ courses }) => {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizData, setQuizData] = useState<Record<number, { quiz_id: number; pass_score: number }>>({});
  // quizSubs: { [lesson_id]: { [user_id]: submission } }
  const [quizSubs, setQuizSubs] = useState<Record<number, Record<number, any>>>({});
  // progress: { [user_id]: { done: number; total: number } }
  const [progressMap, setProgressMap] = useState<Record<number, { done: number; total: number }>>({});
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const gradeKey = (courseId: number, userId: number) => `${courseId}_${userId}`;

  const loadCourse = async (course: any) => {
    setLoading(true);
    setSelectedCourse(course);
    setStudents([]);
    setLessons([]);
    setQuizData({});
    setQuizSubs({});
    setProgressMap({});

    try {
      // 1. ดึง orders ที่ COMPLETED ของคอร์สนี้
      const ordersRes = await api.get('/orders');
      console.log('[GradeTab] orders count:', ordersRes.data?.length);
      if (ordersRes.data?.length > 0) {
        console.log('[GradeTab] first order sample:', JSON.stringify(ordersRes.data[0]).substring(0, 300));
      }
      const completed = (Array.isArray(ordersRes.data) ? ordersRes.data : []).filter((o: any) =>
        o.status === 'COMPLETED' &&
        o.order_details?.some((d: any) => d.course?.course_id === course.course_id)
      );
      const uniqueStudents = Array.from(
        new Map(completed.map((o: any) => o.user).filter(Boolean).map((u: any) => [u.user_id, u])).values()
      ) as any[];
      console.log('[GradeTab] students found:', uniqueStudents.length, 'for course:', course.course_id);
      setStudents(uniqueStudents);

      // 2. ดึง lessons
      const lessonsRes = await api.get(`/lessons/course/${course.course_id}`);
      const fetchedLessons: any[] = Array.isArray(lessonsRes.data)
        ? [...lessonsRes.data].sort((a, b) => a.sequence - b.sequence)
        : [];
      setLessons(fetchedLessons);

      // 3. ดึง quiz สำหรับแต่ละ lesson + submissions
      const qData: Record<number, { quiz_id: number; pass_score: number }> = {};
      const qSubs: Record<number, Record<number, any>> = {};

      await Promise.all(fetchedLessons.map(async (lesson) => {
        try {
          const qRes = await api.get(`/quizzes/lesson/${lesson.lesson_id}`);
          if (qRes.data?.quiz_id) {
            qData[lesson.lesson_id] = { quiz_id: qRes.data.quiz_id, pass_score: qRes.data.pass_score ?? 50 };
            const subsRes = await api.get(`/quizzes/${qRes.data.quiz_id}/submissions`);
            const subs = Array.isArray(subsRes.data) ? subsRes.data : [];
            const byUser: Record<number, any> = {};
            subs.forEach((s: any) => {
              const uid = s.user_id ?? s.user?.user_id;
              if (uid) byUser[uid] = s;
            });
            qSubs[lesson.lesson_id] = byUser;
          }
        } catch {}
      }));

      setQuizData(qData);
      setQuizSubs(qSubs);

      // 4. ดึง learning progress ทุก user ในคอร์สนี้
      const progRes = await api.get('/learning-progress');
      const allProg = Array.isArray(progRes.data) ? progRes.data : [];
      const progByCourseUser: Record<number, { done: number; total: number }> = {};

      uniqueStudents.forEach((student) => {
        const userProg = allProg.filter((p: any) => {
          const pUserId = p.user?.user_id ?? p.user_id;
          const pCourseId = p.lesson?.course?.course_id;
          return pUserId === student.user_id && pCourseId === course.course_id;
        });
        progByCourseUser[student.user_id] = {
          done: userProg.filter((p: any) => p.is_completed).length,
          total: fetchedLessons.length,
        };
      });
      setProgressMap(progByCourseUser);

      // 5. โหลด grades จาก API
      const gradesRes = await api.get(`/grades/course/${course.course_id}`).catch(() => ({ data: [] }));
      const savedGrades: Record<string, string> = {};
      (Array.isArray(gradesRes.data) ? gradesRes.data : []).forEach((g: any) => {
        const key = gradeKey(course.course_id, g.user?.user_id);
        if (g.grade) savedGrades[key] = g.grade;
      });
      setGrades(savedGrades);

    } catch (e: any) {
      console.error('GradeTab loadCourse error:', e?.response?.status, e?.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  const saveGrade = async (courseId: number, userId: number, grade: string) => {
    const key = gradeKey(courseId, userId);
    if (!grade) { alert('กรุณาเลือกเกรดก่อน'); return; }
    setSaving(key);
    try {
      await api.post('/grades', { user_id: userId, course_id: courseId, grade });
      setGrades(prev => ({ ...prev, [key]: grade }));
    } catch {
      alert('บันทึกเกรดไม่สำเร็จ');
    } finally {
      setSaving(null);
    }
  };

  // คำนวณคะแนนเฉลี่ยจากข้อสอบ
  const getAvgScore = (userId: number) => {
    const allSubs = Object.entries(quizSubs)
      .map(([, byUser]) => (byUser as any)[userId])
      .filter(Boolean);
    if (allSubs.length === 0) return null;
    return Math.round(allSubs.reduce((sum: number, s: any) => sum + (s.score ?? 0), 0) / allSubs.length);
  };

  const suggestGrade = (avg: number | null) => {
    if (avg === null) return '-';
    if (avg >= 80) return 'A';
    if (avg >= 70) return 'B';
    if (avg >= 60) return 'C';
    if (avg >= 50) return 'D';
    return 'F';
  };

  const filtered = students.filter(s =>
    (s.full_name || s.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  // ===== Course List =====
  if (!selectedCourse) {
    return (
      <div className="animate-fade-in">
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>ให้เกรดนักเรียน</h1>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>เลือกคอร์สที่ต้องการให้เกรด</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {courses.map(course => (
            <div key={course.course_id} onClick={() => loadCourse(course)}
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

  // ===== Student Grade Table =====
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => setSelectedCourse(null)}
          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#475569' }}>
          ← กลับ
        </button>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{selectedCourse.title}</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            {students.length} นักเรียน • {lessons.length} บทเรียน • {Object.keys(quizData).length} ข้อสอบ
          </p>
        </div>
      </div>

      {/* หมายเหตุ */}
      <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#92400e' }}>
        คะแนนเฉลี่ยจากข้อสอบทุกบท — ต่ำกว่า 50% ถือว่าไม่ผ่าน (F) | เกรดที่แนะนำคำนวณอัตโนมัติ แต่อาจารย์สามารถเปลี่ยนได้
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px', width: '300px' }}>
        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input placeholder="ค้นหานักเรียน..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>กำลังโหลด...</div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '13px 16px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>นักเรียน</th>
                <th style={{ padding: '13px 16px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                    <TrendingUp size={13} /> ความคืบหน้า
                  </div>
                </th>
                <th style={{ padding: '13px 16px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                    <ClipboardList size={13} /> คะแนนข้อสอบ (เฉลี่ย)
                  </div>
                </th>
                <th style={{ padding: '13px 16px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>รายละเอียดแต่ละบท</th>
                <th style={{ padding: '13px 16px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>เกรดแนะนำ</th>
                <th style={{ padding: '13px 16px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>เกรดที่ให้</th>
                <th style={{ padding: '13px 16px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                  {students.length === 0 ? 'ยังไม่มีนักเรียนในคอร์สนี้' : 'ไม่พบนักเรียน'}
                </td></tr>
              )}
              {filtered.map((student: any) => {
                const key = gradeKey(selectedCourse.course_id, student.user_id);
                const prog = progressMap[student.user_id] || { done: 0, total: lessons.length };
                const progPct = prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0;
                const avgScore = getAvgScore(student.user_id);
                const suggested = suggestGrade(avgScore);
                const currentGrade = grades[key] || '';
                const isSaving = saving === key;

                return (
                  <tr key={student.user_id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    {/* นักเรียน */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {student.profile_picture_url ? (
                          <img src={`http://localhost:3001${student.profile_picture_url}`}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 'bold' }}>
                            {(student.full_name || student.username || '?').charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>{student.full_name || student.username}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{student.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* ความคืบหน้า */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '15px', color: progPct === 100 ? '#16a34a' : '#3b82f6' }}>{progPct}%</span>
                        <div style={{ width: '80px', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: `${progPct}%`, height: '100%', backgroundColor: progPct === 100 ? '#10b981' : '#3b82f6', borderRadius: '99px' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{prog.done}/{prog.total} บท</span>
                      </div>
                    </td>

                    {/* คะแนนเฉลี่ย */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {avgScore !== null ? (
                        <span style={{ fontWeight: '800', fontSize: '18px', color: avgScore >= 50 ? '#16a34a' : '#dc2626' }}>
                          {avgScore}%
                        </span>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>ยังไม่ทำข้อสอบ</span>
                      )}
                    </td>

                    {/* รายละเอียดแต่ละบท */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {lessons.map((lesson) => {
                          const hasSub = quizData[lesson.lesson_id];
                          const sub = quizSubs[lesson.lesson_id]?.[student.user_id];
                          const score = sub?.score;
                          return (
                            <div key={lesson.lesson_id}
                              title={`บทที่ ${lesson.sequence}: ${lesson.title}${hasSub ? ` | คะแนน: ${score ?? 'ยังไม่ทำ'}%` : ' | ไม่มีข้อสอบ'}`}
                              style={{
                                width: '28px', height: '28px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: !hasSub ? '#f1f5f9' : score === undefined ? '#fef3c7' : score >= 50 ? '#dcfce7' : '#fee2e2',
                                color: !hasSub ? '#94a3b8' : score === undefined ? '#854d0e' : score >= 50 ? '#16a34a' : '#dc2626',
                                border: `1px solid ${!hasSub ? '#e2e8f0' : score === undefined ? '#fde68a' : score >= 50 ? '#bbf7d0' : '#fecaca'}`,
                                cursor: 'default',
                              }}>
                              {lesson.sequence}
                            </div>
                          );
                        })}
                        <div style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '2px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#dcfce7', borderRadius: '2px' }}></span>ผ่าน
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#fee2e2', borderRadius: '2px' }}></span>ไม่ผ่าน
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#fef3c7', borderRadius: '2px' }}></span>ยังไม่ทำ
                        </div>
                      </div>
                    </td>

                    {/* เกรดแนะนำ */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{ fontWeight: '900', fontSize: '20px', color: gradeColor(suggested) }}>{suggested}</span>
                    </td>

                    {/* เกรดที่ให้ */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <select value={currentGrade}
                        onChange={e => setGrades(prev => ({ ...prev, [key]: e.target.value }))}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: '700', cursor: 'pointer', color: currentGrade ? gradeColor(currentGrade) : '#94a3b8' }}>
                        <option value="">-- เลือก --</option>
                        {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </td>

                    {/* บันทึก */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => saveGrade(selectedCourse.course_id, student.user_id, currentGrade || suggested)}
                        disabled={isSaving}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '7px 14px', backgroundColor: isSaving ? '#94a3b8' : '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600' }}>
                        <Save size={13} /> {isSaving ? 'บันทึก...' : 'บันทึก'}
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