import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  // สร้าง notification ใหม่ (เรียกจาก PaymentsService)
  async create(dto: CreateNotificationDto) {
    const notif = this.notifRepo.create({
      title: dto.title,
      message: dto.message,
      type: dto.type,
      order_id: dto.order_id || null,
      user: { user_id: dto.user_id } as any,
    });
    return this.notifRepo.save(notif);
  }

  // ดึง notification ของ user คนนี้ (เรียงใหม่สุดก่อน)
  async findByUser(userId: number) {
    return this.notifRepo.find({
      where: { user: { user_id: userId } },
      order: { created_at: 'DESC' },
      take: 20,
    });
  }

  // นับที่ยังไม่ได้อ่าน
  async countUnread(userId: number) {
    return this.notifRepo.count({
      where: { user: { user_id: userId }, is_read: false },
    });
  }

  // mark อ่านแล้ว (ทีละอัน)
  async markRead(notifId: number, userId: number) {
    await this.notifRepo.update(
      { notification_id: notifId, user: { user_id: userId } },
      { is_read: true }
    );
    return { ok: true };
  }

  // mark ทั้งหมดว่าอ่านแล้ว
  async markAllRead(userId: number) {
    await this.notifRepo.update(
      { user: { user_id: userId }, is_read: false },
      { is_read: true }
    );
    return { ok: true };
  }
}
