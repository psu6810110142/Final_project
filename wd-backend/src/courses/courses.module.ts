import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity'; // อย่าลืม Import Entity

@Module({
  imports: [TypeOrmModule.forFeature([Course])], // ✨ ผูก Entity กับ Module
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
