import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity'; // Import Entity

@Module({
  imports: [TypeOrmModule.forFeature([Payment])], // ✨ นำ Entity เข้ามา
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}