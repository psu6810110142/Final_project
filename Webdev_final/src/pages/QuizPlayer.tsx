import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import api from '../api';

interface Props {
  lessonId: number;
  userId: number;
  onPassed: () => void; // callback เมื่อสอบผ่าน
}

const QuizPlayer: React.FC<Props> = ({ lessonId, userId, onPassed }) => {
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const quizRes = await api.get(`/quizzes/lesson/${lessonId}`);
        if (!quizRes.data) { setLoading(false); return; }
        setQuiz(quizRes.data);
        setAnswers(new Array(quizRes.data.questions.length).fill(-1));

        // เช็คว่าเคยทำแล้วไหม
        const resultRes = await api.get(`/quizzes/${quizRes.data.quiz_id}/my-result`);
        if (resultRes.data) {
          setResult(resultRes.data);
          // ไม่เรียก onPassed ตอนโหลดครั้งแรก เพราะ markComplete อาจทำให้ loop
        }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [lessonId]); // ไม่ใส่ onPassed ใน deps เพื่อป้องกัน infinite loop

  const handleSubmit = async () => {
    if (answers.some(a => a === -1)) { alert('กรุณาตอบทุกข้อก่อนส่ง'); return; }
    setSubmitting(true);
    try {
      const res = await api.post(`/quizzes/${quiz.quiz_id}/submit`, { answers });
      setResult(res.data);
      if (res.data.passed) onPassed();
    } catch { alert('ส่งคำตอบไม่สำเร็จ'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>กำลังโหลดข้อสอบ...</div>;
  if (!quiz) return null;

  // แสดงผลลัพธ์
  if (result) {
    const grade = result.score >= 80 ? 'A' : result.score >= 70 ? 'B' : result.score >= 60 ? 'C' : result.score >= 50 ? 'D' : 'F';
    const gradeColor = result.passed ? '#10b981' : '#ef4444';
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
          ผลการทำข้อสอบ
        </h3>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: '10px', padding: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: result.passed ? '#10b981' : '#ef4444' }}>{result.correct}/{result.total}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>ข้อที่ตอบถูก</div>
          </div>
          <div style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: '10px', padding: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: result.passed ? '#10b981' : '#ef4444' }}>{result.score}%</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>คะแนนที่ได้</div>
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: result.passed ? '#f0fdf4' : '#fef2f2', border: `1px solid ${result.passed ? '#bbf7d0' : '#fecaca'}`, marginBottom: '16px', fontSize: '14px', color: result.passed ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
          {result.passed ? 'ผ่านเกณฑ์แล้ว' : `ยังไม่ผ่านเกณฑ์ (ต้องได้ ${result.pass_score}% ขึ้นไป)`}
        </div>

        {!result.passed && (
          <button onClick={() => setResult(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
            <RotateCcw size={15} /> ทำใหม่อีกครั้ง
          </button>
        )}
      </div>
    );
  }

  // แสดงข้อสอบ
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{quiz.title}</h3>
        <span style={{ fontSize: '12px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '20px' }}>
          เกณฑ์ผ่าน {quiz.pass_score}%
        </span>
      </div>

      {quiz.questions.map((q: any, qi: number) => (
        <div key={qi} style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '12px', fontSize: '15px' }}>
            {qi + 1}. {q.question_text}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {q.choices.map((choice: string, ci: number) => (
              <label key={ci} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', border: `2px solid ${answers[qi] === ci ? '#3b82f6' : '#e2e8f0'}`, backgroundColor: answers[qi] === ci ? '#eff6ff' : 'white', transition: 'all .15s' }}>
                <input type="radio" name={`q-${qi}`} checked={answers[qi] === ci}
                  onChange={() => { const a = [...answers]; a[qi] = ci; setAnswers(a); }}
                  style={{ accentColor: '#3b82f6' }} />
                <span style={{ fontSize: '14px', color: answers[qi] === ci ? '#1d4ed8' : '#334155', fontWeight: answers[qi] === ci ? '600' : '400' }}>
                  {choice}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
          ตอบแล้ว {answers.filter(a => a !== -1).length}/{quiz.questions.length} ข้อ
        </span>
        <button onClick={handleSubmit} disabled={submitting}
          style={{ padding: '12px 28px', borderRadius: '20px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '15px', opacity: submitting ? 0.7 : 1 }}>
          {submitting ? 'กำลังส่ง...' : 'ส่งคำตอบ'}
        </button>
      </div>
    </div>
  );
};

export default QuizPlayer;