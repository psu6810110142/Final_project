import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { getStorageConfig, videoFileFilter } from 'src/utils/file-upload.config';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) { }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  @UseInterceptors(
    FileInterceptor('video_file', { // ✨ ชื่อ Key ใน Postman คือ video_file
      storage: getStorageConfig('lessons'), // เก็บไว้ในโฟลเดอร์ uploads/lessons
      limits: { fileSize: 100 * 1024 * 1024 }, // ✨ กำหนดขนาดสูงสุด 100MB (100 * 1024 KB * 1024 Bytes)
      fileFilter: videoFileFilter,
    }),
  )
  create(
    @Body() createLessonDto: CreateLessonDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      // ✨ เช็คชื่อฟิลด์ใน Lesson Entity ของคุณด้วยนะครับ ว่าใช้ชื่อ video_url หรือไม่
      createLessonDto.video_url = `/uploads/lessons/${file.filename}`;
    }
    return this.lessonsService.create(createLessonDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string, @Req() req: any) {
    const user = req.user;
    return this.lessonsService.findByCourse(+courseId, user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonsService.update(+id, updateLessonDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(+id);
  }
}