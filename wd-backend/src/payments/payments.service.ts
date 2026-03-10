import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  // แจ้งโอนเงิน (แนบสลิป)
  create(createPaymentDto: CreatePaymentDto) {
    const payment = this.paymentRepo.create({
      amount: createPaymentDto.amount,
      slip_image_url: createPaymentDto.slip_image_url,
      payment_date: createPaymentDto.payment_date,
      order: { order_id: createPaymentDto.order_id }, // ผูกกับ Order
      status: 'PENDING' // ✨ สถานะเริ่มต้นคือ "รอตรวจสอบ"
    });
    return this.paymentRepo.save(payment);
  }

  // ดูรายการแจ้งโอนทั้งหมด (Admin)
  findAll() {
    return this.paymentRepo.find({
      relations: ['order', 'order.user', 'order.order_details', 'order.order_details.course'], // ดึงข้อมูลครบ
      order: { payment_date: 'DESC' }
    });
  }

  async findOne(id: number) {
    const payment = await this.paymentRepo.findOne({ 
      where: { payment_id: id },
      relations: ['order']
    });
    if (!payment) throw new NotFoundException(`ไม่พบรายการชำระเงินรหัส ${id}`);
    return payment;
  }

  // อัปเดตสถานะ (Admin กดยืนยัน หรือ ปฏิเสธ)
  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.findOne(id);

    if (updatePaymentDto.status) {
      payment.status = updatePaymentDto.status;
    }

    const saved = await this.paymentRepo.save(payment);
    console.log('Payment saved:', saved.payment_id, 'status:', saved.status);
    return saved;
  }

  async remove(id: number) {
    const payment = await this.findOne(id);
    return this.paymentRepo.remove(payment);
  }
}