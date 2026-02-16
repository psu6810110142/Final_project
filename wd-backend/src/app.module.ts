import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { LevelsModule } from './levels/levels.module';
import { InstructorsModule } from './instructors/instructors.module';
import { CoursesModule } from './courses/courses.module';
import { OrdersModule } from './orders/orders.module';
import { CartItemsModule } from './cart_items/cart_items.module';
import { LessonsModule } from './lessons/lessons.module';
import { PaymentsModule } from './payments/payments.module';
import { OrderDetailsModule } from './order_details/order_details.module';
import { LearningProgressModule } from './learning_progress/learning_progress.module';

@Module({
  imports: [
      TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'password123',
      database: 'NewLearningAcademy_dev',
      entities: [], // เราจะเพมิ่ Entities ทนี่ ี่ในภายหลัง
      synchronize: true, // สรา้ง Table อัตโนมตั ิ(ใชสำ้ สำ หรบั Dev เทา่ นั้น)
}),
      UsersModule,
      LevelsModule,
      InstructorsModule,
      CoursesModule,
      OrdersModule,
      CartItemsModule,
      LessonsModule,
      PaymentsModule,
      OrderDetailsModule,
      LearningProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
