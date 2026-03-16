import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import './HomeTheme.css';
import { ChevronLeft, ChevronRight, CheckCircle, PlayCircle, Lock, FileText, ClipboardList, Award } from 'lucide-react';
import QuizPlayer from './QuizPlayer';

interface Lesson {
  lesson_id: number;
  title: string;
  video_url?: string;
  attachment_url?: string;
  sequence: number;
}

interface Progress {
  progress_id?: number;
  lesson_id: number;
  is_completed: boolean;
}

const getVideoUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:3001${url}`;
};

// Wrapper เพื่อป้องกัน infinite re-render จาก onPassed
const QuizPlayerWrapper: React.FC<{ lessonId: number; userId: number; onMarkComplete: (id: number) => Promise<void> }> = 
  React.memo(({ lessonId, userId, onMarkComplete }) => {
    const handlePassed = useCallback(async () => {
      await onMarkComplete(lessonId);
    }, [lessonId]);
    // หมายเหตุ: quizPassed จะถูกอัปเดตใน fetchData หลัง markComplete
    return <QuizPlayer lessonId={lessonId} userId={userId} onPassed={handlePassed} />;
  });


const LearningPage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizByLesson, setQuizByLesson] = useState<Record<number, boolean>>({}); // lesson_id -> มีquizไหม
  const [quizPassed, setQuizPassed] = useState<Record<number, boolean>>({}); // lesson_id -> ผ่านquizไหม

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = Number(currentUser?.sub || currentUser?.user_id);

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lessonsRes, courseRes, progressRes] = await Promise.all([
        api.get(`/lessons/course/${courseId}`),
        api.get(`/courses/${courseId}`),
        api.get('/learning-progress/user/my-progress').catch(() => ({ data: [] })),
      ]);

      const fetchedLessons: Lesson[] = Array.isArray(lessonsRes.data)
        ? lessonsRes.data.sort((a: Lesson, b: Lesson) => a.sequence - b.sequence)
        : [];
      setLessons(fetchedLessons);
      setCourseTitle(courseRes.data?.title || 'คอร์สเรียน');

      const allProgress = Array.isArray(progressRes.data) ? progressRes.data : [];
      // normalize ให้ progress มี lesson_id ที่ใช้งานได้
      const myProgress: Progress[] = allProgress
        .filter((p: any) => {
          const lessonCourseId = p.lesson?.course?.course_id;
          return String(lessonCourseId) === String(courseId);
        })
        .map((p: any) => ({
          progress_id: p.progress_id,
          lesson_id: p.lesson?.lesson_id ?? p.lesson_id,
          is_completed: p.is_completed,
        }));
      setProgress(myProgress);

      // เช็คว่าแต่ละ lesson มี quiz ไหม
      const quizInfo: Record<number, boolean> = {};
      const passedInfo: Record<number, boolean> = {};
      await Promise.all(
        fetchedLessons.map(async (lesson: Lesson) => {
          try {
            const qRes = await api.get(`/quizzes/lesson/${lesson.lesson_id}`);
            if (qRes.data?.quiz_id) {
              quizInfo[lesson.lesson_id] = true;
              // เช็คว่าผ่านแล้วไหม
              const subRes = await api.get(`/quizzes/${qRes.data.quiz_id}/my-result`).catch(() => null);
              passedInfo[lesson.lesson_id] = !!subRes?.data?.passed;
            } else {
              quizInfo[lesson.lesson_id] = false;
            }
          } catch {
            quizInfo[lesson.lesson_id] = false;
          }
        })
      );
      setQuizByLesson(quizInfo);
      setQuizPassed(passedInfo);
      console.log('[DEBUG] raw progress from API:', allProgress.slice(0,3));
      console.log('[DEBUG] filtered progress:', myProgress);
      console.log('[DEBUG] lesson ids:', fetchedLessons.map((l: any) => l.lesson_id));
      console.log('[DEBUG] courseId:', courseId);
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert('คุณยังไม่ได้ซื้อคอร์สนี้');
        navigate('/my-courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = (lessonId: number) =>
    progress.some(p => Number(p.lesson_id) === Number(lessonId) && p.is_completed);

  // ทุกบทมี video + quiz เสมอ → 2 tasks/บท
  // video done = isCompleted, quiz done = quizPassed
  const calcProgress = () => {
    if (lessons.length === 0) return 0;
    const totalTasks = lessons.length * 2;
    const doneTasks = lessons.reduce((sum, l) => {
      const videoDone = isCompleted(l.lesson_id) ? 1 : 0;
      const quizDone = quizPassed[l.lesson_id] ? 1 : 0;
      return sum + videoDone + quizDone;
    }, 0);
    return Math.round((doneTasks / totalTasks) * 100);
  };
  const totalProgress = calcProgress();
  const completedCount = lessons.filter(l => isCompleted(l.lesson_id) && quizPassed[l.lesson_id]).length;

  const markComplete = async (lessonId: number) => {
    if (marking) return;
    setMarking(true);
    try {
      // เช็คว่ามี progress record อยู่แล้วไหม
      const existingProgress = progress.find(p => Number(p.lesson_id) === Number(lessonId));
      if (existingProgress?.is_completed) {
        setMarking(false);
        return;
      }
      if (existingProgress?.progress_id) {
        // update existing
        await api.patch(`/learning-progress/${existingProgress.progress_id}`, { is_completed: true });
      } else {
        // create new
        await api.post('/learning-progress', {
          lesson_id: lessonId,
          is_completed: true,
        });
      }
      await fetchData(); // refetch เพื่ออัปเดต sidebar + progress bar
    } catch (e: any) {
      // ถ้า duplicate key ก็ refetch แค่นั้นพอ
      await fetchData();
    } finally {
      setMarking(false);
    }
  };

  const currentLesson = lessons[currentIdx];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#64748b' }}>
      กำลังโหลดบทเรียน...
    </div>
  );

  if (lessons.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
      <PlayCircle size={48} color="#94a3b8" />
      <p style={{ color: '#64748b' }}>ยังไม่มีบทเรียนในคอร์สนี้</p>
      <button onClick={() => navigate('/my-courses')}
        style={{ padding: '10px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
        กลับหน้าคอร์ส
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>

        {/* Sidebar */}
        <div style={{ width: '300px', flexShrink: 0, backgroundColor: '#1e293b', color: 'white', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
            <button onClick={() => navigate('/my-courses')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', marginBottom: '10px' }}>
              <ChevronLeft size={14} /> กลับไปคอร์สของฉัน
            </button>
            <h2 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 8px', color: 'white', lineHeight: 1.4 }}>{courseTitle}</h2>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
              {completedCount}/{lessons.length} บทเรียน
            </div>
            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,.1)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${totalProgress}%`, backgroundColor: '#10b981', borderRadius: '2px', transition: 'width .3s' }} />
            </div>
            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>{totalProgress}%</div>
          </div>

          {/* Lesson list */}
          <div style={{ flex: 1, padding: '8px 0' }}>
            {lessons.map((lesson, idx) => (
              <div key={lesson.lesson_id}
                onClick={() => { setCurrentIdx(idx); setShowQuiz(false); }}
                style={{ padding: '12px 16px', cursor: 'pointer', backgroundColor: currentIdx === idx ? 'rgba(59,130,246,.2)' : 'transparent', borderLeft: currentIdx === idx ? '3px solid #3b82f6' : '3px solid transparent', transition: 'all .15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isCompleted(lesson.lesson_id)
                    ? <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0 }} />
                    : <PlayCircle size={16} color="#64748b" style={{ flexShrink: 0 }} />
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: currentIdx === idx ? 'white' : '#cbd5e1', fontWeight: currentIdx === idx ? '600' : '400', lineHeight: 1.3 }}>
                      {lesson.sequence}. {lesson.title}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {currentLesson && (
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
              {/* Title */}
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>
                บทที่ {currentLesson.sequence}: {currentLesson.title}
              </h1>

              {/* Video */}
              {currentLesson.video_url ? (
                <div style={{ backgroundColor: 'black', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', aspectRatio: '16/9' }}>
                  <video
                    key={currentLesson.lesson_id}
                    controls
                    style={{ width: '100%', height: '100%' }}
                    onEnded={() => markComplete(currentLesson.lesson_id)}>
                    <source src={getVideoUrl(currentLesson.video_url) || ''} />
                    เบราว์เซอร์ไม่รองรับวิดีโอ
                  </video>
                </div>
              ) : (
                <div style={{ backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '48px', textAlign: 'center', marginBottom: '20px', color: '#94a3b8' }}>
                  <PlayCircle size={48} style={{ marginBottom: '8px', opacity: .4 }} />
                  <p>ยังไม่มีวิดีโอสำหรับบทเรียนนี้</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {/* ปุ่มทำเครื่องหมายเรียนจบ — แสดงเฉพาะบทที่ไม่มีข้อสอบ */}
                {isCompleted(currentLesson.lesson_id) ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }}>
                    <CheckCircle size={16} /> เรียนจบบทนี้แล้ว
                  </div>
                ) : !quizByLesson[currentLesson.lesson_id] ? (
                  // ไม่มีข้อสอบ → กดปุ่มได้เลย
                  <button onClick={() => markComplete(currentLesson.lesson_id)} disabled={marking}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: marking ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px', opacity: marking ? .7 : 1 }}>
                    <CheckCircle size={16} /> {marking ? 'กำลังบันทึก...' : 'ทำเครื่องหมายว่าเรียนแล้ว'}
                  </button>
                ) : (
                  // มีข้อสอบ → ต้องทำผ่านก่อน
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }}>
                    <Lock size={16} /> ทำข้อสอบให้ผ่านเพื่อจบบทนี้
                  </div>
                )}

                {/* ปุ่มดาวน์โหลดไฟล์แนบ */}
                {currentLesson.attachment_url && (
                  <a href={`http://localhost:3001${currentLesson.attachment_url}`} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                    <FileText size={16} /> ดาวน์โหลดเอกสาร
                  </a>
                )}

                {/* ปุ่มทำข้อสอบ */}
                <button onClick={() => setShowQuiz(!showQuiz)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: showQuiz ? '#4f46e5' : '#eef2ff', color: showQuiz ? 'white' : '#4f46e5', border: '1px solid #a5b4fc', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  <ClipboardList size={16} /> {showQuiz ? 'ซ่อนข้อสอบ' : 'ทำข้อสอบท้ายบท'}
                </button>
              </div>

              {/* Quiz */}
              {showQuiz && (
                <div style={{ marginBottom: '20px' }}>
                  <QuizPlayerWrapper
                    lessonId={currentLesson.lesson_id}
                    userId={userId}
                    onMarkComplete={markComplete}
                  />
                </div>
              )}

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button onClick={() => { setCurrentIdx(i => Math.max(0, i - 1)); setShowQuiz(false); }}
                  disabled={currentIdx === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', color: currentIdx === 0 ? '#cbd5e1' : '#475569', fontWeight: '600' }}>
                  <ChevronLeft size={16} /> บทก่อนหน้า
                </button>

                {currentIdx < lessons.length - 1 ? (
                  <button onClick={() => { setCurrentIdx(i => i + 1); setShowQuiz(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#3b82f6', cursor: 'pointer', color: 'white', fontWeight: '600' }}>
                    บทถัดไป <ChevronRight size={16} />
                  </button>
                ) : totalProgress === 100 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', fontWeight: '700' }}>
                    <Award size={18} /> เรียนจบคอร์สแล้ว!
                  </div>
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: '13px', alignSelf: 'center' }}>บทสุดท้าย</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPage;