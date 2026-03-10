import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { OrderDetail } from '../order_details/entities/order_detail.entity';
import { CartItem } from '../cart_items/entities/cart_item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Lesson, OrderDetail, CartItem])],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}