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
}
