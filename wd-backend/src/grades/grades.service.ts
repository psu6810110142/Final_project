import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepo: Repository<Grade>,
  ) {}

  async upsert(userId: number, courseId: number, grade: string) {
    const existing = await this.gradeRepo.findOne({
      where: { user: { user_id: userId }, course: { course_id: courseId } },
    });
    if (existing) {
      existing.grade = grade;
      return this.gradeRepo.save(existing);
    }
    const newGrade = this.gradeRepo.create({
      grade,
      user: { user_id: userId } as any,
      course: { course_id: courseId } as any,
    });
    return this.gradeRepo.save(newGrade);
  }

  findByUser(userId: number) {
    return this.gradeRepo.find({
      where: { user: { user_id: userId } },
      relations: ['course'],
    });
  }

  findByCourse(courseId: number) {
    return this.gradeRepo.find({
      where: { course: { course_id: courseId } },
      relations: ['user'],
    });
  }

  findOne(userId: number, courseId: number) {
    return this.gradeRepo.findOne({
      where: { user: { user_id: userId }, course: { course_id: courseId } },
      relations: ['course'],
    });
  }

  // ✅ คำนวณเกรดอัตโนมัติจาก quiz submissions ของทุกบทในคอร์ส
  // คืน grade object ที่ใช้ออกใบเซอร์ได้
  async getCertificateData(userId: number, courseId: number, manager: any) {
    // 1. ดึง lessons ของคอร์ส
    const lessons = await manager.find('lessons', {
      where: { course: { course_id: courseId } },
      relations: ['course'],
    });

    // 2. ดึง learning_progress ของ user ในคอร์สนี้
    const progresses = await manager.find('learning_progress', {
      where: { user: { user_id: userId } },
      relations: ['lesson', 'lesson.course'],
    });
    const myProgresses = progresses.filter(
      (p: any) => p.lesson?.course?.course_id === courseId
    );
    const completedLessonIds = new Set(
      myProgresses.filter((p: any) => p.is_completed).map((p: any) => p.lesson.lesson_id)
    );

    const totalLessons = lessons.length;
    const completedCount = lessons.filter((l: any) => completedLessonIds.has(l.lesson_id)).length;
    const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // 3. ดึง quiz submissions ของทุก lesson
    const quizScores: number[] = [];
    for (const lesson of lessons) {
      const quiz = await manager.findOne('quizzes', {
        where: { lesson: { lesson_id: lesson.lesson_id }, is_active: true },
      });
      if (!quiz) continue;
      const submission = await manager.findOne('quiz_submissions', {
        where: { quiz: { quiz_id: quiz.quiz_id }, user_id: userId },
        order: { submitted_at: 'DESC' },
      });
      if (submission) quizScores.push(submission.score);
    }

    // 4. คำนวณ avg score
    const avgScore = quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : 0;

    // 5. คำนวณเกรด
    let autoGrade = 'F';
    if (avgScore >= 80) autoGrade = 'A';
    else if (avgScore >= 70) autoGrade = 'B';
    else if (avgScore >= 60) autoGrade = 'C';
    else if (avgScore >= 50) autoGrade = 'D';

    // 6. ดึงเกรดที่อาจารย์ให้ไว้ (ถ้ามี ให้ใช้ของอาจารย์)
    const manualGrade = await this.findOne(userId, courseId);
    const finalGrade = manualGrade?.grade || autoGrade;

    // 7. ดึงข้อมูล course และ user
    const course = await manager.findOne('courses', {
      where: { course_id: courseId },
      relations: ['instructor'],
    });
    const user = await manager.findOne('users', {
      where: { user_id: userId },
    });

    const isEligible = progressPct === 100 && ['A', 'B', 'C'].includes(finalGrade);

    return {
      eligible: isEligible,
      grade: finalGrade,
      avg_score: avgScore,
      progress_pct: progressPct,
      completed_lessons: completedCount,
      total_lessons: totalLessons,
      quiz_scores: quizScores,
      course: {
        course_id: course?.course_id,
        title: course?.title,
        instructor_name: course?.instructor?.name || 'ผู้สอน',
      },
      student: {
        user_id: user?.user_id,
        full_name: user?.full_name || user?.username,
        email: user?.email,
      },
      issued_at: new Date().toISOString(),
    };
  }
}