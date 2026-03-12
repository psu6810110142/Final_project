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

  // เปิดบิลใหม่ + ป้องกันลงทะเบียนซ้ำ
  async create(createOrderDto: CreateOrderDto) {
    // ✅ เช็คว่า user คนนี้มี order ที่ COMPLETED หรือ WAITING_PAYMENT สำหรับ course นี้ไหม
    // (ตรวจจาก total_amount เป็น fallback เพราะ course_id อยู่ใน order_details)
    const existingOrders = await this.orderRepo.find({
      where: { user: { user_id: createOrderDto.user_id } },
      relations: ['order_details', 'order_details.course'],
    });

    // ดึง course_id จาก DTO ที่ส่งมา (ถ้ามี)
    if (createOrderDto.course_id) {
      const alreadyEnrolled = existingOrders.some(o =>
        ['COMPLETED', 'WAITING_PAYMENT'].includes(o.status) &&
        o.order_details?.some(d => d.course?.course_id === createOrderDto.course_id)
      );
      if (alreadyEnrolled) {
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

  // ดูออเดอร์ทั้งหมด (Admin)
  findAll() {
    return this.orderRepo.find({
      relations: ['user'], // ดึงข้อมูลคนสั่งมาดูด้วย
      order: { created_at: 'DESC' } // เรียงจากใหม่ไปเก่า
    });
  }

  // ✨ ดูออเดอร์ของ User คนนี้ (ประวัติการสั่งซื้อ)
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

  // อัปเดตสถานะ (เช่น Admin กดยืนยันการโอนเงิน และเริ่มบันทึกเวลาการเรียนเมื่อยืนยีนสลิป)
  async update(id: number, updateOrderDto: UpdateOrderDto) {
  const order = await this.orderRepo.findOne({
    where: { order_id: id },
    relations: ['user', 'order_details', 'order_details.course'],
  });
  if (!order) throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส ${id}`);

  if (updateOrderDto.status) {
    order.status = updateOrderDto.status;

    // ✅ ถ้า Admin อนุมัติ → set วันเริ่มและวันหมดอายุ
    if (updateOrderDto.status === 'COMPLETED') {
      const startDate = new Date();
      order.access_start_date = startDate;

      // หา duration_weeks จาก course ใน order_details (เอา max ถ้ามีหลาย course)
      const maxWeeks = order.order_details?.reduce((max, detail) => {
        return Math.max(max, detail.course?.duration_weeks ?? 0);
      }, 0) ?? 0;

      const expireDate = new Date(startDate);
      expireDate.setDate(expireDate.getDate() + maxWeeks * 7);
      order.access_expire_date = expireDate;
    }
  }

  const saved = await this.orderRepo.save(order);
  console.log('Order saved:', saved.order_id, 'status:', saved.status, 'expires:', saved.access_expire_date);
  return saved;
}

  async remove(id: number) {
    const order = await this.findOne(id);
    return this.orderRepo.remove(order);
  }
}