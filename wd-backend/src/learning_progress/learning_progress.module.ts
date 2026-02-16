import { Module } from '@nestjs/common';
import { LearningProgressService } from './learning_progress.service';
import { LearningProgressController } from './learning_progress.controller';

@Module({
  controllers: [LearningProgressController],
  providers: [LearningProgressService],
})
export class LearningProgressModule {}
