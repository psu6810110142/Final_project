import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  create(createCourseDto: CreateCourseDto) {
    const newCourse = this.courseRepo.create({
      ...createCourseDto,
      level: { level_id: createCourseDto.level_id },
      instructor: { instructor_id: createCourseDto.instructor_id }
    });
    return this.courseRepo.save(newCourse);
  }

  findAll() {
    // ✨ สั่งดึงข้อมูล level และ instructor มาด้วยผ่าน relations
    return this.courseRepo.find({
      relations: ['level', 'instructor'], 
    });
  }

  async findOne(id: number) {
    const course = await this.courseRepo.findOne({ 
      where: { course_id: id },
      relations: ['level', 'instructor'], 
    });
    if (!course) throw new NotFoundException(`ไม่พบคอร์สเรียนรหัส ${id}`);
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    const course = await this.findOne(id);
    
    Object.assign(course, updateCourseDto);
    
    // อัปเดต Foreign Keys ถ้ามีการส่ง ID มาใหม่
    if (updateCourseDto.level_id) course.level = { level_id: updateCourseDto.level_id } as any;
    if (updateCourseDto.instructor_id) course.instructor = { instructor_id: updateCourseDto.instructor_id } as any;

    return this.courseRepo.save(course);
  }

  async remove(id: number) {
    const course = await this.findOne(id);
    return this.courseRepo.remove(course);
  }
}