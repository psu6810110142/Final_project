import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
      TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // สร้าง Table อัตโนมัติ (ใช้สำหรับ Dev เท่านั้น)
      }),
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
