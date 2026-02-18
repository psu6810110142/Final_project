import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson } from './entities/lesson.entity'; // อย่าลืม Import Entity

@Module({
  imports: [TypeOrmModule.forFeature([Lesson])], // ✨ ผูก Lesson Entity
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}