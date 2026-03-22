import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningProgress } from './entities/learning_progress.entity';
import { CreateLearningProgressDto } from './dto/create-learning_progress.dto';
import { UpdateLearningProgressDto } from './dto/update-learning_progress.dto';

@Injectable()
export class LearningProgressService {
  constructor(
    @InjectRepository(LearningProgress)
    private readonly progressRepo: Repository<LearningProgress>,
  ) { }

  async create(createLearningProgressDto: CreateLearningProgressDto) {
  const { user_id, lesson_id, is_completed = true } = createLearningProgressDto;

  // เช็คว่าเคยเรียนบทนี้ไปหรือยัง
  const existing = await this.progressRepo.findOne({
    where: {
      user: { user_id },
      lesson: { lesson_id }
    }
  });

  if (existing) {
    // ถ้าสถานะเหมือนเดิม ข้ามได้เลย
    if (existing.is_completed === Boolean(is_completed)) {
      return existing;
    }
    // ถ้าเปลี่ยนค่า ให้ update
    await this.progressRepo.update(existing.progress_id, {
      is_completed: Boolean(is_completed)
    });
    return this.progressRepo.findOne({ where: { progress_id: existing.progress_id } });
  }

  // ยังไม่เคยมี → INSERT ใหม่
  const result = await this.progressRepo.insert({
    is_completed: Boolean(is_completed),
    user: { user_id } as any,
    lesson: { lesson_id } as any,
  });

  const newId = result.identifiers[0].progress_id;
  return this.progressRepo.findOne({ where: { progress_id: newId } });
}


  findAll() {
    return this.progressRepo.find({
      relations: ['user', 'lesson', 'lesson.course'],
    });
  }

  async findOne(id: number) {
    const progress = await this.progressRepo.findOne({
      where: { progress_id: id },
      relations: ['user', 'lesson'],
    });
    if (!progress) throw new NotFoundException(`ไม่พบข้อมูล Progress ID ${id}`);
    return progress;
  }

  async findByUser(userId: number) {
    // ใช้ QueryBuilder เพื่อ force join lesson.course ให้ครบทุก record
    return this.progressRepo
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.lesson', 'lesson')
      .leftJoinAndSelect('lesson.course', 'course')
      .where('progress.user_id = :userId', { userId })
      .orderBy('progress.progress_id', 'ASC')
      .getMany();
  }

  async update(id: number, updateDto: UpdateLearningProgressDto) {
    const progress = await this.findOne(id);
    Object.assign(progress, updateDto);
    return this.progressRepo.save(progress);
  }

  async remove(id: number) {
    const progress = await this.findOne(id);
    return this.progressRepo.remove(progress);
  }
}