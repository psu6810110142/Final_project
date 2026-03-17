import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, Req } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { getStorageConfig } from 'src/utils/file-upload.config';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) { }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'video_file', maxCount: 1 },
      { name: 'attachment_file', maxCount: 1 },
    ], {
      storage: getStorageConfig('lessons'),
      limits: { fileSize: 100 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (file.fieldname === 'video_file') {
          if (!file.originalname.match(/\.(mp4|avi|mov|mkv)$/i)) {
            return cb(new Error('อนุญาตเฉพาะไฟล์วิดีโอ (mp4, avi, mov, mkv)'), false);
          }
        }
        if (file.fieldname === 'attachment_file') {
          if (!file.originalname.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|png|jpg|jpeg)$/i)) {
            return cb(new Error('อนุญาตเฉพาะ PDF, Word, PowerPoint, Excel, รูปภาพ'), false);
          }
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Body() createLessonDto: CreateLessonDto,
    @UploadedFiles() files: { video_file?: Express.Multer.File[]; attachment_file?: Express.Multer.File[] },
  ) {
    if (files?.video_file?.[0]) {
      createLessonDto.video_url = `/uploads/lessons/${files.video_file[0].filename}`;
    }
    if (files?.attachment_file?.[0]) {
      createLessonDto.attachment_url = `/uploads/lessons/${files.attachment_file[0].filename}`;
    }
    return this.lessonsService.create(createLessonDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  // ⚠️ ต้องอยู่ก่อน @Get(':id') เพื่อป้องกัน NestJS parse 'course' เป็น :id
  // ใช้ jwt-optional — ถ้า login จะ decode user ให้, ถ้าไม่มี token จะไม่ throw 401
  @UseGuards(AuthGuard('jwt-optional'))
  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string, @Req() req: Request & { user?: any }) {
    const user = req.user ?? null;
    return this.lessonsService.findByCourse(+courseId, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'video_file', maxCount: 1 },
      { name: 'attachment_file', maxCount: 1 },
    ], {
      storage: getStorageConfig('lessons'),
      limits: { fileSize: 100 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (file.fieldname === 'video_file') {
          if (!file.originalname.match(/\.(mp4|avi|mov|mkv)$/i)) {
            return cb(new Error('อนุญาตเฉพาะไฟล์วิดีโอ'), false);
          }
        }
        if (file.fieldname === 'attachment_file') {
          if (!file.originalname.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|png|jpg|jpeg)$/i)) {
            return cb(new Error('อนุญาตเฉพาะ PDF, Word, PowerPoint, Excel, รูปภาพ'), false);
          }
        }
        cb(null, true);
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @UploadedFiles() files: { video_file?: Express.Multer.File[]; attachment_file?: Express.Multer.File[] },
  ) {
    if (files?.video_file?.[0]) {
      updateLessonDto.video_url = `/uploads/lessons/${files.video_file[0].filename}`;
    }
    if (files?.attachment_file?.[0]) {
      updateLessonDto.attachment_url = `/uploads/lessons/${files.attachment_file[0].filename}`;
    }
    return this.lessonsService.update(+id, updateLessonDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(+id);
  }
}