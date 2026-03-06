import { Injectable, NotFoundException } from '@nestjs/common';
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

  // เปิดบิลใหม่
  create(createOrderDto: CreateOrderDto) {
    const newOrder = this.orderRepo.create({
      total_amount: createOrderDto.total_amount,
      user: { user_id: createOrderDto.user_id }, // ผูกกับ User
      status: 'WAITING_PAYMENT' // ✨ ตั้งค่าเริ่มต้นเป็น "รอจ่ายเงิน" เสมอ
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

  // อัปเดตสถานะ (เช่น Admin กดยืนยันการโอนเงิน)
  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);
    
    // อัปเดตข้อมูลทั่วไป (ถ้ามี)
    Object.assign(order, updateOrderDto);
    
    // เช็คพิเศษ: ถ้าส่ง status มาให้อัปเดตด้วย
    if (updateOrderDto.status) {
        order.status = updateOrderDto.status;
    }

    return this.orderRepo.save(order);
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    return this.orderRepo.remove(order);
  }
}