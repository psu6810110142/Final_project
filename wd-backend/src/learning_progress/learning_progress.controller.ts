import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { LearningProgressService } from './learning_progress.service';
import { CreateLearningProgressDto } from './dto/create-learning_progress.dto';
import { UpdateLearningProgressDto } from './dto/update-learning_progress.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('learning-progress')
export class LearningProgressController {
  constructor(private readonly learningProgressService: LearningProgressService) { }

  //1. อัปเกรดการสร้าง Progress: บังคับใช้ ID จาก Token ป้องกันการโกง
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createLearningProgressDto: CreateLearningProgressDto, @Req() req: any) {
    // แกะ ID จาก Token ให้ครอบคลุมทุกรูปแบบ (เหมือนที่ทำใน Lessons)
    const userId = req.user.sub || req.user.user_id || req.user.userId || req.user.id;

    // ยัด ID ของคนล็อกอินทับลงไปใน DTO เลย (ไม่สนใจว่า Postman จะส่ง user_id อะไรมา)
    createLearningProgressDto.user_id = userId;

    return this.learningProgressService.create(createLearningProgressDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.learningProgressService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningProgressService.findOne(+id);
  }

  //2. เส้นทางใหม่สำหรับนักเรียน: ดึงประวัติการเรียนของตัวเอง
  @UseGuards(AuthGuard('jwt'))
  @Get('user/my-progress')
  findMyProgress(@Req() req: any) {
    const userId = req.user.sub || req.user.user_id || req.user.userId || req.user.id;
    return this.learningProgressService.findByUser(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLearningProgressDto: UpdateLearningProgressDto) {
    return this.learningProgressService.update(+id, updateLearningProgressDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.learningProgressService.remove(+id);
  }
}