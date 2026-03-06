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
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // Frontend จะเรียกผ่าน http://localhost:3000/uploads/...
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // ✨ ใส่ || เพื่อกำหนดค่าเริ่มต้น ถ้าหาใน .env ไม่เจอ
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5436,
        username: configService.get<string>('DB_USERNAME') || 'admin',
        password: configService.get<string>('DB_PASSWORD') || 'password123', // 👈 จุดสำคัญที่แก้ Error
        database: configService.get<string>('DB_NAME') || 'NewLearningAcademy_dev',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
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
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}