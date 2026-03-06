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
        user: { user_id: user_id },
        lesson: { lesson_id: lesson_id }
      }
    });

    if (existing) {
      // ถ้าสถานะเหมือนเดิมเป๊ะๆ ให้ข้ามการเซฟไปเลย (ป้องกัน TypeORM Error)
      if (existing.is_completed === Boolean(is_completed)) {
        return existing;
      }

      // ถ้ามีการเปลี่ยนค่า (เช่น จาก false เป็น true) ถึงจะยอมให้เซฟ
      existing.is_completed = Boolean(is_completed);
      return this.progressRepo.save(existing);
    }

    // ถ้ายังไม่เคยมีประวัติเลย ก็สร้างใหม่
    const newProgress = this.progressRepo.create({
      is_completed: is_completed,
      user: { user_id: user_id },
      lesson: { lesson_id: lesson_id }
    });
    return this.progressRepo.save(newProgress);
  }


  findAll() {
    return this.progressRepo.find({
      relations: ['user', 'lesson'],
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
    return this.progressRepo.find({
      where: { user: { user_id: userId } },
      relations: ['lesson', 'lesson.course']
    });
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