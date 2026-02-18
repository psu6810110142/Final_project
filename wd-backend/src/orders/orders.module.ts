import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity'; // Import Entity

@Module({
  imports: [TypeOrmModule.forFeature([Order])], // ✨ นำ Entity เข้ามา
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}