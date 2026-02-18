import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LearningProgressService } from './learning_progress.service';
import { CreateLearningProgressDto } from './dto/create-learning_progress.dto';
import { UpdateLearningProgressDto } from './dto/update-learning_progress.dto';

@Controller('learning-progress')
export class LearningProgressController {
  constructor(private readonly learningProgressService: LearningProgressService) {}

  @Post()
  create(@Body() createLearningProgressDto: CreateLearningProgressDto) {
    return this.learningProgressService.create(createLearningProgressDto);
  }

  @Get()
  findAll() {
    return this.learningProgressService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningProgressService.findOne(+id);
  }

  // ✨ เส้นพิเศษ: ดึงประวัติการเรียนทั้งหมดของ User คนนี้
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.learningProgressService.findByUser(+userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLearningProgressDto: UpdateLearningProgressDto) {
    return this.learningProgressService.update(+id, updateLearningProgressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.learningProgressService.remove(+id);
  }
}