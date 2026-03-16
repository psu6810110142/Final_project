import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  quiz_id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'int', default: 60 })
  pass_score: number; // คะแนนผ่าน (เปอร์เซ็นต์)

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @OneToMany(() => QuizQuestion, q => q.quiz, { cascade: true, eager: true })
  questions: QuizQuestion[];
}

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn()
  question_id: number;

  @Column({ type: 'text' })
  question_text: string;

  @Column({ type: 'json' })
  choices: string[]; // ['ตัวเลือก A', 'ตัวเลือก B', ...]

  @Column({ type: 'int' })
  correct_answer: number; // index 0-3

  @ManyToOne(() => Quiz, q => q.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;
}

@Entity('quiz_submissions')
export class QuizSubmission {
  @PrimaryGeneratedColumn()
  submission_id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int' })
  score: number; // คะแนนที่ได้ (เปอร์เซ็นต์)

  @Column({ type: 'boolean' })
  passed: boolean;

  @Column({ type: 'json' })
  answers: number[]; // คำตอบของนักเรียน

  @CreateDateColumn()
  submitted_at: Date;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;
}
