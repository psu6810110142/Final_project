import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetailsService } from './order_details.service';
import { OrderDetailsController } from './order_details.controller';
import { OrderDetail } from './entities/order_detail.entity'; // Import Entity

@Module({
  imports: [TypeOrmModule.forFeature([OrderDetail])], // ✨ นำ Entity เข้ามา
  controllers: [OrderDetailsController],
  providers: [OrderDetailsService],
})
export class OrderDetailsModule {}