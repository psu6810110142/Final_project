import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDetail } from './entities/order_detail.entity';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order_detail.dto';

@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepo: Repository<OrderDetail>,
  ) {}

  // เพิ่มรายการลงในบิล
  create(createOrderDetailDto: CreateOrderDetailDto) {
    const detail = this.orderDetailRepo.create({
      price_at_purchase: createOrderDetailDto.price_at_purchase,
      order: { order_id: createOrderDetailDto.order_id },    // ผูกกับ Order
      course: { course_id: createOrderDetailDto.course_id }  // ผูกกับ Course
    });
    return this.orderDetailRepo.save(detail);
  }

  findAll() {
    return this.orderDetailRepo.find({ relations: ['order', 'course'] });
  }

  // ✨ ดูรายการสินค้าทั้งหมดในบิลใบนี้ (เช่น บิล #1 ซื้ออะไรไปบ้าง)
  findByOrder(orderId: number) {
    return this.orderDetailRepo.find({
      where: { order: { order_id: orderId } },
      relations: ['course'] // ดึงข้อมูลคอร์สมาโชว์ด้วย (ชื่อคอร์ส, รูปปก)
    });
  }

  findOne(id: number) {
    return this.orderDetailRepo.findOne({ where: { order_detail_id: id } });
  }

  // ปกติรายการในบิลจะไม่แก้ไข (Update) หรือลบ (Remove) กันง่ายๆ ยกเว้นยกเลิกบิล
  update(id: number, updateOrderDetailDto: UpdateOrderDetailDto) {
    return `This action updates a #${id} orderDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderDetail`;
  }
}