import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz, QuizQuestion, QuizSubmission } from './entities/quiz.entity';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepo: Repository<Quiz>,
    @InjectRepository(QuizQuestion)
    private readonly questionRepo: Repository<QuizQuestion>,
    @InjectRepository(QuizSubmission)
    private readonly submissionRepo: Repository<QuizSubmission>,
  ) {}

  // อาจารย์สร้าง quiz พร้อม questions
  async createQuiz(dto: { lesson_id: number; title: string; pass_score: number; questions: { question_text: string; choices: string[]; correct_answer: number }[] }) {
    const quiz = this.quizRepo.create({
      title: dto.title,
      pass_score: dto.pass_score || 60,
      lesson: { lesson_id: dto.lesson_id } as any,
    });
    const saved = await this.quizRepo.save(quiz);

    const questions = dto.questions.map(q =>
      this.questionRepo.create({ ...q, quiz: { quiz_id: saved.quiz_id } as any })
    );
    await this.questionRepo.save(questions);
    return this.findByLesson(dto.lesson_id);
  }

  // ดึง quiz ของ lesson นี้
  async findByLesson(lessonId: number) {
    return this.quizRepo.findOne({
      where: { lesson: { lesson_id: lessonId }, is_active: true },
      relations: ['questions'],
    });
  }

  // นักเรียนส่งคำตอบ
  async submitQuiz(quizId: number, userId: number, answers: number[]) {
    const quiz = await this.quizRepo.findOne({
      where: { quiz_id: quizId },
      relations: ['questions'],
    });
    if (!quiz) throw new NotFoundException('ไม่พบข้อสอบ');

    // คำนวณคะแนน
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correct_answer) correct++;
    });
    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.pass_score;

    // บันทึก submission
    const submission = this.submissionRepo.create({
      user_id: userId,
      score,
      passed,
      answers,
      quiz: { quiz_id: quizId } as any,
    });
    await this.submissionRepo.save(submission);

    return { score, passed, correct, total: quiz.questions.length, pass_score: quiz.pass_score };
  }

  // ดู submission ของนักเรียนใน quiz นี้ — คืน correct/total ด้วยเพื่อให้ frontend แสดงได้
  async getMySubmission(quizId: number, userId: number) {
    const submission = await this.submissionRepo.findOne({
      where: { quiz: { quiz_id: quizId }, user_id: userId },
      order: { submitted_at: 'DESC' },
    });

    if (!submission) return null;

    // ดึง quiz เพื่อคำนวณ correct จาก answers ที่บันทึกไว้
    const quiz = await this.quizRepo.findOne({
      where: { quiz_id: quizId },
      relations: ['questions'],
    });

    if (!quiz) return submission;

    const answers: number[] = Array.isArray(submission.answers) ? submission.answers : [];
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correct_answer) correct++;
    });

    return {
      ...submission,
      correct,
      total: quiz.questions.length,
      pass_score: quiz.pass_score,
    };
  }

  // อาจารย์ดูผลทุกคน
  async getSubmissions(quizId: number) {
    return this.submissionRepo.find({
      where: { quiz: { quiz_id: quizId } },
      order: { submitted_at: 'DESC' },
    });
  }

  // ลบ quiz
  async deleteQuiz(quizId: number) {
    const quiz = await this.quizRepo.findOne({ where: { quiz_id: quizId } });
    if (!quiz) throw new NotFoundException('ไม่พบข้อสอบ');
    return this.quizRepo.remove(quiz);
  }
}