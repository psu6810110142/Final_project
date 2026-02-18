import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningProgressService } from './learning_progress.service';
import { LearningProgressController } from './learning_progress.controller';
import { LearningProgress } from './entities/learning_progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LearningProgress])],
  controllers: [LearningProgressController],
  providers: [LearningProgressService],
  exports: [LearningProgressService],
})
export class LearningProgressModule {}