import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Lesson } from '../lessons/entities/lesson.entity';
import { OrderDetail } from '../order_details/entities/order_detail.entity';
import { CartItem } from '../cart_items/entities/cart_item.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepo: Repository<OrderDetail>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
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
    return this.courseRepo.find({
      relations: ['level', 'instructor'], 
    });
  }

  // ดึงคอร์สของอาจารย์คนนี้ (กรองตาม user_id)
  async findByInstructorUserId(userId: number) {
    return this.courseRepo.find({
      where: { instructor: { user_id: userId } as any },
      relations: ['level', 'instructor'],
      order: { course_id: 'DESC' },
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

  // ✨ แก้ไขฟังก์ชันนี้ใหม่ทั้งหมด ให้บันทึก Relation ได้ชัวร์ 100%
  async update(id: number, updateCourseDto: UpdateCourseDto) {
    await this.findOne(id); // เช็คก่อนว่ามีคอร์สนี้อยู่จริงไหม
    
    // แยก level_id กับ instructor_id ออกมาจากข้อมูลทั่วไป
    const { level_id, instructor_id, ...updateData } = updateCourseDto;
    
    // สร้าง Payload สำหรับอัปเดต
    const payload: any = { ...updateData };
    
    // ผูก Relation ใหม่ถ้ามีการเปลี่ยนค่า
    if (level_id) payload.level = { level_id };
    if (instructor_id) payload.instructor = { instructor_id };

    // ใช้คำสั่ง .update() บังคับเขียนลง Database ตรงๆ
    await this.courseRepo.update(id, payload);
    
    // ดึงข้อมูลใหม่ที่อัปเดตเสร็จแล้วส่งกลับไป
    return this.findOne(id); 
  }

  async remove(id: number) {
    const course = await this.findOne(id);

    // ลบ child records ก่อนเพื่อหลีกเลี่ยง FK constraint
    await this.lessonRepo.delete({ course: { course_id: id } });
    await this.cartItemRepo.delete({ course: { course_id: id } });
    // order_details ไม่ลบเพราะเป็นประวัติการซื้อ — set null แทน
    await this.orderDetailRepo
      .createQueryBuilder()
      .update()
      .set({ course: null as any })
      .where('course_id = :id', { id })
      .execute();

    return this.courseRepo.remove(course);
  }
}