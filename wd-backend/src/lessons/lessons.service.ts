import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
  ) {}

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
  
  async findByCourse(courseId: number) {
      return this.lessonRepo.find({
          where: { course: { course_id: courseId } },
          order: { sequence: 'ASC' }
      });
  }

  async update(id: number, updateLessonDto: UpdateLessonDto) {
    const lesson = await this.findOne(id);
    
    Object.assign(lesson, updateLessonDto);

    if (updateLessonDto.course_id) {
        lesson.course = { course_id: updateLessonDto.course_id } as any;
    }

    return this.lessonRepo.save(lesson);
  }

  async remove(id: number) {
    const lesson = await this.findOne(id);
    return this.lessonRepo.remove(lesson);
  }
}