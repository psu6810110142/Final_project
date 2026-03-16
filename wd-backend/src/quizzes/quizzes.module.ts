import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { Quiz, QuizQuestion, QuizSubmission } from './entities/quiz.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizQuestion, QuizSubmission])],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
