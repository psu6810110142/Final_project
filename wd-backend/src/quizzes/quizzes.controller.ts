import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('quizzes')
@UseGuards(AuthGuard('jwt'))
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  // อาจารย์/แอดมิน สร้าง quiz
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  @Post()
  create(@Body() dto: any) {
    return this.quizzesService.createQuiz(dto);
  }

  // ดึง quiz ของ lesson (นักเรียนและอาจารย์)
  @Get('lesson/:lessonId')
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.quizzesService.findByLesson(+lessonId);
  }

  // นักเรียนส่งคำตอบ
  @Post(':quizId/submit')
  submit(@Param('quizId') quizId: string, @Body() body: { answers: number[] }, @Req() req: any) {
    const userId = req.user?.userId || req.user?.sub;
    return this.quizzesService.submitQuiz(+quizId, Number(userId), body.answers);
  }

  // ดู submission ของตัวเอง
  @Get(':quizId/my-result')
  myResult(@Param('quizId') quizId: string, @Req() req: any) {
    const userId = req.user?.userId || req.user?.sub;
    return this.quizzesService.getMySubmission(+quizId, Number(userId));
  }

  // อาจารย์ดูผลทุกคน
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  @Get(':quizId/submissions')
  submissions(@Param('quizId') quizId: string) {
    return this.quizzesService.getSubmissions(+quizId);
  }

  // ลบ quiz
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  @Delete(':quizId')
  remove(@Param('quizId') quizId: string) {
    return this.quizzesService.deleteQuiz(+quizId);
  }
}
