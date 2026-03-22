import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { GradesService } from './grades.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Controller('grades')
export class GradesController {
  constructor(
    private readonly gradesService: GradesService,
    @InjectEntityManager() private readonly manager: EntityManager,
  ) {}

  // INSTRUCTOR/ADMIN ให้เกรด
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  @Post()
  upsert(@Body() body: { user_id: number; course_id: number; grade: string }) {
    return this.gradesService.upsert(body.user_id, body.course_id, body.grade);
  }

  // นักเรียนดูเกรดตัวเอง
  @UseGuards(AuthGuard('jwt'))
  @Get('my-grades')
  myGrades(@Req() req: any) {
    const userId = req.user.userId || req.user.user_id || req.user.sub;
    return this.gradesService.findByUser(userId);
  }

  // INSTRUCTOR/ADMIN ดูเกรดทั้งหมดในคอร์ส
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.gradesService.findByCourse(+courseId);
  }

  // นักเรียนดูเกรดของคอร์สนี้
  @UseGuards(AuthGuard('jwt'))
  @Get('my-grade/:courseId')
  myGrade(@Req() req: any, @Param('courseId') courseId: string) {
    const userId = req.user.userId || req.user.user_id || req.user.sub;
    return this.gradesService.findOne(userId, +courseId);
  }

  // ✅ ออกใบเซอร์ — คำนวณเกรดอัตโนมัติ + ตรวจสอบสิทธิ์
  @UseGuards(AuthGuard('jwt'))
  @Get('certificate/:courseId')
  getCertificate(@Req() req: any, @Param('courseId') courseId: string) {
    const userId = req.user.userId || req.user.user_id || req.user.sub;
    return this.gradesService.getCertificateData(userId, +courseId, this.manager);
  }
}