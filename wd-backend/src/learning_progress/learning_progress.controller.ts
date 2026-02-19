import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LearningProgressService } from './learning_progress.service';
import { CreateLearningProgressDto } from './dto/create-learning_progress.dto';
import { UpdateLearningProgressDto } from './dto/update-learning_progress.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard'; // เช็ค Path ให้ตรงกับของคุณนะครับ
import { Roles } from '../auth/roles.decorator';

@Controller('learning-progress')
export class LearningProgressController {
  constructor(private readonly learningProgressService: LearningProgressService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createLearningProgressDto: CreateLearningProgressDto) {
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

  // ✨ เส้นพิเศษ: ดึงประวัติการเรียนทั้งหมดของ User คนนี้
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.learningProgressService.findByUser(+userId);
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