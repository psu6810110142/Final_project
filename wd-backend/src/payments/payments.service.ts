import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Order } from '../orders/entities/order.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly notifService: NotificationsService,
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

  // อัปเดตสถานะ (Admin กดยืนยัน หรือ ปฏิเสธ) + sync order อัตโนมัติ
  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.paymentRepo.findOne({
      where: { payment_id: id },
      relations: ['order'],
    });
    if (!payment) throw new NotFoundException(`ไม่พบรายการชำระเงินรหัส ${id}`);

    if (updatePaymentDto.status) {
      payment.status = updatePaymentDto.status;

      // sync order status อัตโนมัติ — ไม่ต้องพึ่ง frontend อีกต่อไป
      if (payment.order?.order_id) {
        const orderStatus = updatePaymentDto.status === 'PAID' ? 'COMPLETED' : 'REJECTED';
        await this.orderRepo.update(
          { order_id: payment.order.order_id },
          { status: orderStatus }
        );
        console.log(`Order ${payment.order.order_id} synced → ${orderStatus}`);

        // ดึง user_id จาก order
        const order = await this.orderRepo.findOne({
          where: { order_id: payment.order.order_id },
          relations: ['user', 'order_details', 'order_details.course'],
        });

        if (order?.user?.user_id) {
          const courseName = order.order_details?.[0]?.course?.title || 'คอร์สเรียน';
          if (updatePaymentDto.status === 'PAID') {
            await this.notifService.create({
              user_id: order.user.user_id,
              title: 'การชำระเงินได้รับการยืนยันแล้ว',
              message: `คำสั่งซื้อ #${order.order_id} สำหรับ "${courseName}" ได้รับการอนุมัติเรียบร้อย คุณสามารถเข้าเรียนได้ทันที`,
              type: 'payment_approved',
              order_id: order.order_id,
            });
          } else {
            await this.notifService.create({
              user_id: order.user.user_id,
              title: 'การชำระเงินถูกปฏิเสธ',
              message: `คำสั่งซื้อ #${order.order_id} สำหรับ "${courseName}" ถูกปฏิเสธ กรุณาส่งหลักฐานใหม่หรือติดต่อแอดมิน`,
              type: 'payment_rejected',
              order_id: order.order_id,
            });
          }
        }
      }
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