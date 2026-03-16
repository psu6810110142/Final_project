import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, CheckCircle } from 'lucide-react';
import api from '../../api';

interface Props {
  lessonId: number;
  lessonTitle: string;
  onClose: () => void;
}

interface Question {
  question_text: string;
  choices: string[];
  correct_answer: number;
}

const QuizCreator: React.FC<Props> = ({ lessonId, lessonTitle, onClose }) => {
  const [title, setTitle] = useState(`ข้อสอบท้ายบท: ${lessonTitle}`);
  const [passScore, setPassScore] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([
    { question_text: '', choices: ['', '', '', ''], correct_answer: 0 }
  ]);
  const [saving, setSaving] = useState(false);
  const [existingQuiz, setExistingQuiz] = useState<any>(null);

  useEffect(() => {
    // เช็คว่ามี quiz อยู่แล้วไหม
    api.get(`/quizzes/lesson/${lessonId}`).then(r => {
      if (r.data) {
        setExistingQuiz(r.data);
        setTitle(r.data.title);
        setPassScore(r.data.pass_score);
        setQuestions(r.data.questions.map((q: any) => ({
          question_text: q.question_text,
          choices: q.choices,
          correct_answer: q.correct_answer,
        })));
      }
    }).catch(() => {});
  }, [lessonId]);

  const addQuestion = () => {
    setQuestions([...questions, { question_text: '', choices: ['', '', '', ''], correct_answer: 0 }]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    (updated[idx] as any)[field] = value;
    setQuestions(updated);
  };

  const updateChoice = (qIdx: number, cIdx: number, value: string) => {
    const updated = [...questions];
    updated[qIdx].choices[cIdx] = value;
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) { alert('กรุณาใส่ชื่อข้อสอบ'); return; }
    if (questions.some(q => !q.question_text.trim())) { alert('กรุณาใส่คำถามให้ครบ'); return; }
    if (questions.some(q => q.choices.some(c => !c.trim()))) { alert('กรุณาใส่ตัวเลือกให้ครบ'); return; }

    setSaving(true);
    try {
      // ถ้ามี quiz เดิม ลบก่อน
      if (existingQuiz) await api.delete(`/quizzes/${existingQuiz.quiz_id}`);
      await api.post('/quizzes', { lesson_id: lessonId, title, pass_score: passScore, questions });
      alert('บันทึกข้อสอบเรียบร้อย!');
      onClose();
    } catch { alert('บันทึกไม่สำเร็จ'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" style={{ overflowY: 'auto', padding: '20px 0' }}>
      <div className="modal-content" style={{ maxWidth: '680px', margin: 'auto' }}>
        <div className="modal-header">
          <h2>สร้างข้อสอบท้ายบท</h2>
          <button onClick={onClose} className="btn-close"><X /></button>
        </div>
        <div className="form-wrapper">
          {/* ชื่อข้อสอบ */}
          <div className="form-group">
            <label>ชื่อข้อสอบ</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label>คะแนนผ่าน (%)</label>
            <input type="number" className="form-input" min={1} max={100} value={passScore}
              onChange={e => setPassScore(+e.target.value)} style={{ width: '120px' }} />
          </div>

          {/* คำถาม */}
          <div style={{ marginTop: '8px' }}>
            {questions.map((q, qi) => (
              <div key={qi} style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>ข้อ {qi + 1}</span>
                  {questions.length > 1 && (
                    <button onClick={() => removeQuestion(qi)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <textarea className="form-input" rows={2} placeholder="คำถาม..."
                  value={q.question_text} onChange={e => updateQuestion(qi, 'question_text', e.target.value)}
                  style={{ resize: 'vertical', marginBottom: '10px' }} />
                {q.choices.map((c, ci) => (
                  <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <input type="radio" name={`correct-${qi}`} checked={q.correct_answer === ci}
                      onChange={() => updateQuestion(qi, 'correct_answer', ci)} title="เฉลย" />
                    <input className="form-input" placeholder={`ตัวเลือก ${ci + 1}`}
                      value={c} onChange={e => updateChoice(qi, ci, e.target.value)}
                      style={{ margin: 0, borderColor: q.correct_answer === ci ? '#10b981' : '#e2e8f0' }} />
                    {q.correct_answer === ci && <CheckCircle size={16} color="#10b981" />}
                  </div>
                ))}
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  คลิกวงกลมซ้ายเพื่อเลือกเฉลย
                </div>
              </div>
            ))}
          </div>

          <button onClick={addQuestion}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px dashed #cbd5e1', background: 'white', cursor: 'pointer', color: '#64748b', marginBottom: '16px' }}>
            <Plus size={16} /> เพิ่มคำถาม
          </button>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">ยกเลิก</button>
            <button onClick={handleSave} className="btn-save" disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={16} /> {saving ? 'กำลังบันทึก...' : 'บันทึกข้อสอบ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCreator;
