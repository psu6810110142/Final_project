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
      relations: ['user'],
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

        const maxWeeks = order.order_details?.reduce((max, detail) => {
          return Math.max(max, detail.course?.duration_weeks ?? 0);
        }, 0) ?? 0;

        const expireDate = new Date(startDate);
        expireDate.setDate(expireDate.getDate() + maxWeeks * 7);
        order.access_expire_date = expireDate;
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
}