import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson } from './entities/lesson.entity'; // อย่าลืม Import Entity
import { OrderDetail } from 'src/order_details/entities/order_detail.entity';
import { Order } from 'src/orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, OrderDetail, Order])], // ✨ ผูก Lesson Entity
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule { }