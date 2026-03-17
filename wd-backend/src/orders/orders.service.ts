import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const existingOrders = await this.orderRepo.find({
      where: { user: { user_id: createOrderDto.user_id } },
      relations: ['order_details', 'order_details.course'],
    });

    if (createOrderDto.course_id) {
      const activeOrder = existingOrders.find(o =>
        ['COMPLETED', 'WAITING_PAYMENT'].includes(o.status) &&
        o.order_details?.some(d => d.course?.course_id === createOrderDto.course_id)
      );
      if (activeOrder) {
        throw new ConflictException('คุณได้ลงทะเบียนคอร์สนี้แล้ว');
      }
    }

    const newOrder = this.orderRepo.create({
      total_amount: createOrderDto.total_amount,
      user: { user_id: createOrderDto.user_id },
      status: 'WAITING_PAYMENT'
    });
    return this.orderRepo.save(newOrder);
  }

  findAll() {
    return this.orderRepo.find({
      relations: ['user', 'order_details', 'order_details.course'],
      order: { created_at: 'DESC' }
    });
  }

  async findByUser(userId: number) {
    return this.orderRepo.find({
      where: { user: { user_id: userId } },
      relations: ['order_details', 'order_details.course', 'order_details.course.level'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({
      where: { order_id: id },
      relations: ['user']
    });
    if (!order) throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส ${id}`);
    return order;
  }

  // ดึง order พร้อม user สำหรับตรวจสิทธิ์
  private async findOrderWithUser(orderId: number) {
    const order = await this.orderRepo.findOne({
      where: { order_id: orderId },
      relations: ['user'],
    });
    if (!order) throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส ${orderId}`);
    return order;
  }

  // User resubmit — REJECTED → WAITING_PAYMENT (เฉพาะ order ของตัวเอง)
  async resubmit(orderId: number, userId: number) {
    const order = await this.findOrderWithUser(orderId);

    console.log('resubmit check — order.user.user_id:', order.user?.user_id, 'userId:', userId);

    if (Number(order.user?.user_id) !== Number(userId)) {
      throw new ConflictException('ไม่มีสิทธิ์แก้ไข order นี้');
    }
    if (order.status !== 'REJECTED') {
      throw new ConflictException('resubmit ได้เฉพาะ order ที่ถูกปฏิเสธ');
    }
    order.status = 'WAITING_PAYMENT';
    return this.orderRepo.save(order);
  }

  // User cancel — ยกเลิกได้เฉพาะ order ของตัวเองที่เป็น WAITING_PAYMENT
  async cancelByUser(orderId: number, userId: number) {
    const order = await this.findOrderWithUser(orderId);

    console.log('cancel check — order.user.user_id:', order.user?.user_id, 'userId:', userId);

    if (Number(order.user?.user_id) !== Number(userId)) {
      throw new ConflictException('ไม่มีสิทธิ์ยกเลิก order นี้');
    }
    if (order.status !== 'WAITING_PAYMENT') {
      throw new ConflictException('ยกเลิกได้เฉพาะ order ที่อยู่ในสถานะรอตรวจสอบเท่านั้น');
    }
    order.status = 'REJECTED';
    return this.orderRepo.save(order);
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderRepo.findOne({
      where: { order_id: id },
      relations: ['user', 'order_details', 'order_details.course'],
    });
    if (!order) throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส ${id}`);

    if (updateOrderDto.status) {
      order.status = updateOrderDto.status;

      if (updateOrderDto.status === 'COMPLETED') {
        const startDate = new Date();
        order.access_start_date = startDate;

        // หา duration_weeks จาก course — ถ้าไม่มีหรือเป็น 0 ใช้ default 12 สัปดาห์
        const maxWeeks = order.order_details?.reduce((max, detail) => {
          const weeks = Number(detail.course?.duration_weeks) || 0;
          return Math.max(max, weeks);
        }, 0) ?? 0;

        const finalWeeks = maxWeeks > 0 ? maxWeeks : 12; // default 12 สัปดาห์

        const expireDate = new Date(startDate);
        expireDate.setDate(expireDate.getDate() + finalWeeks * 7);
        order.access_expire_date = expireDate;

        console.log(`Order ${order.order_id}: duration=${finalWeeks}w, expires=${expireDate.toISOString()}`);
      }
    }

    const saved = await this.orderRepo.save(order);
    console.log('Order saved:', saved.order_id, 'status:', saved.status);
    return saved;
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    return this.orderRepo.remove(order);
  }

  // ดึงนักเรียนที่ลงทะเบียนคอร์สนี้แล้ว (COMPLETED)
  // ดึงนักเรียนทุก course ของ instructor คนนี้ (ใช้ user_id ผูกกับ instructor profile)
  async findStudentsByInstructorUserId(userId: number) {
    // 1. หา instructor profile ของ user นี้
    const instructor = await this.orderRepo.manager.findOne('instructors' as any, {
      where: { user_id: userId }
    });

    if (!instructor) return [];

    const instructorId = (instructor as any).instructor_id;

    // 2. หาทุก course ที่อาจารย์สอน
    const courses = await this.orderRepo.manager.find('courses' as any, {
      where: { instructor: { instructor_id: instructorId } },
      relations: ['instructor']
    });

    if (!courses || courses.length === 0) return [];

    const courseIds = (courses as any[]).map((c: any) => c.course_id);

    // 3. หา orders COMPLETED ที่มี order_details ตรงกับ courseIds เหล่านั้น
    const orders = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('user.level', 'level')         // ✅ join level
      .leftJoinAndSelect('order.order_details', 'detail')
      .leftJoinAndSelect('detail.course', 'course')
      .where('order.status = :status', { status: 'COMPLETED' })
      .andWhere('course.course_id IN (:...courseIds)', { courseIds })
      .getMany();

    // 4. deduplicate users + เพิ่มข้อมูล course ที่ลงทะเบียน
    const studentMap = new Map<number, any>();
    orders.forEach(o => {
      if (!o.user) return;
      const uid = o.user.user_id;
      const enrolledCourses = (o.order_details || [])
        .filter((d: any) => courseIds.includes(d.course?.course_id))
        .map((d: any) => ({
          course_id: d.course?.course_id,
          title: d.course?.title,
          price: d.course?.price,
        }));

      if (!studentMap.has(uid)) {
        studentMap.set(uid, {
          user_id: uid,
          username: o.user.username,
          full_name: o.user.full_name,
          email: o.user.email,
          phone: (o.user as any).phone,
          profile_picture_url: (o.user as any).profile_picture_url,
          role: o.user.role,
          level_id: (o.user as any).level?.level_id ?? null,
          level: (o.user as any).level ?? null,          // ✅ ส่ง level object มาด้วย
          enrolled_courses: enrolledCourses,             // ✅ คอร์สที่ลงทะเบียน
        });
      } else {
        const existing = studentMap.get(uid);
        enrolledCourses.forEach((ec: any) => {
          if (!existing.enrolled_courses.some((c: any) => c.course_id === ec.course_id)) {
            existing.enrolled_courses.push(ec);
          }
        });
      }
    });

    return Array.from(studentMap.values());
  }

  async findStudentsByCourse(courseId: number) {
    const orders = await this.orderRepo.find({
      where: {
        status: 'COMPLETED',
        order_details: { course: { course_id: courseId } },
      },
      relations: ['user', 'order_details', 'order_details.course'],
    });
    // deduplicate users
    const seen = new Set<number>();
    return orders
      .filter(o => {
        if (seen.has(o.user.user_id)) return false;
        seen.add(o.user.user_id);
        return true;
      })
      .map(o => ({
        user_id: o.user.user_id,
        username: o.user.username,
        full_name: o.user.full_name,
        email: o.user.email,
        profile_picture_url: o.user.profile_picture_url,
      }));
  }

}