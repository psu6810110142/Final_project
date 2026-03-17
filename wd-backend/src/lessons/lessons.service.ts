import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { OrderDetail } from 'src/order_details/entities/order_detail.entity';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepo: Repository<OrderDetail>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) { }

  create(createLessonDto: CreateLessonDto) {
    const newLesson = this.lessonRepo.create({
      ...createLessonDto,
      course: { course_id: createLessonDto.course_id }
    });
    return this.lessonRepo.save(newLesson);
  }

  findAll() {
    return this.lessonRepo.find({
      relations: ['course'],
      order: { sequence: 'ASC' }
    });
  }

  async findOne(id: number) {
    const lesson = await this.lessonRepo.findOne({
      where: { lesson_id: id },
      relations: ['course']
    });

    if (!lesson) {
      throw new NotFoundException(`ไม่พบบทเรียนรหัส ${id}`);
    }

    return lesson;
  }

  async findByCourse(courseId: number, user: any) {
    // ถ้าไม่ได้ login → คืนแค่ชื่อ+ลำดับ (ไม่มี video_url) เพื่อให้ frontend แสดง syllabus แบบ locked
    if (!user) {
      const lessons = await this.lessonRepo.find({
        where: { course: { course_id: courseId } },
        order: { sequence: 'ASC' }
      });
      return lessons.map(({ lesson_id, title, sequence }) => ({ lesson_id, title, sequence }));
    }

    // ADMIN / INSTRUCTOR → เห็นทุกอย่าง
    if (user.role === 'ADMIN' || user.role === 'INSTRUCTOR') {
      return this.lessonRepo.find({
        where: { course: { course_id: courseId } },
        order: { sequence: 'ASC' }
      });
    }

    // User ทั่วไป → เช็คว่าซื้อคอร์สแล้วหรือยัง
    const userId = user.sub || user.user_id || user.userId || user.id;
    const hasPurchased = await this.orderDetailRepo.findOne({
      where: {
        course: { course_id: courseId },
        order: {
          user: { user_id: userId },
          status: 'COMPLETED'
        }
      },
      relations: ['order', 'course']
    });

    if (!hasPurchased) {
      // ยังไม่จ่ายเงิน → คืนแค่ชื่อ+ลำดับ (locked)
      const lessons = await this.lessonRepo.find({
        where: { course: { course_id: courseId } },
        order: { sequence: 'ASC' }
      });
      return lessons.map(({ lesson_id, title, sequence }) => ({ lesson_id, title, sequence }));
    }

    // จ่ายเงินแล้ว → คืนข้อมูลเต็ม
    return this.lessonRepo.find({
      where: { course: { course_id: courseId } },
      order: { sequence: 'ASC' }
    });
  }

  async update(id: number, updateLessonDto: UpdateLessonDto) {
    const lesson = await this.findOne(id);

    Object.assign(lesson, updateLessonDto);

    if (updateLessonDto) {
      Object.assign(lesson, updateLessonDto);

      if (updateLessonDto.course_id) {
        lesson.course = { course_id: updateLessonDto.course_id } as any;
      }
    }

    return this.lessonRepo.save(lesson);
  }

  async remove(id: number) {
    const lesson = await this.findOne(id);
    return this.lessonRepo.remove(lesson);
  }
}