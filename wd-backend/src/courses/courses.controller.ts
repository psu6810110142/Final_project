import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { getStorageConfig, mixedFileFilter } from 'src/utils/file-upload.config';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cover_image', maxCount: 1 },
      { name: 'material_file', maxCount: 1 },
      { name: 'exercise_file', maxCount: 1 },
      { name: 'promo_video', maxCount: 1 },
    ], {
      storage: getStorageConfig('courses'),
      limits: { fileSize: 100 * 1024 * 1024 },
      fileFilter: mixedFileFilter,
    })
  )
  create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFiles() files: {
      cover_image?: Express.Multer.File[],
      material_file?: Express.Multer.File[],
      exercise_file?: Express.Multer.File[],
      promo_video?: Express.Multer.File[]
    },
  ) {

    if (files?.cover_image) {
      createCourseDto.cover_image_url = `/uploads/courses/${files.cover_image[0].filename}`;
    }
    if (files?.material_file) {
      createCourseDto.material_file_url = `/uploads/courses/${files.material_file[0].filename}`;
    }
    if (files?.exercise_file) {
      createCourseDto.exercise_file_url = `/uploads/courses/${files.exercise_file[0].filename}`;
    }
    if (files?.promo_video) {
      createCourseDto.promo_video_url = `/uploads/courses/${files.promo_video[0].filename}`;
    }

    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  @UseInterceptors(
    // ✨ 2. ใช้ FileFieldsInterceptor เพื่อระบุชื่อช่องรับไฟล์ทั้งหมด
    FileFieldsInterceptor([
      { name: 'cover_image', maxCount: 1 },
      { name: 'material_file', maxCount: 1 },
      { name: 'exercise_file', maxCount: 1 },
      { name: 'promo_video', maxCount: 1 },
    ], {
      storage: getStorageConfig('courses'),
      limits: { fileSize: 100 * 1024 * 1024 }, // กำหนดสูงสุดที่ 100MB (เพื่อเผื่อวิดีโอโปรโมท)
      fileFilter: mixedFileFilter,
    })
  )
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFiles() files: {
      cover_image?: Express.Multer.File[],
      material_file?: Express.Multer.File[],
      exercise_file?: Express.Multer.File[],
      promo_video?: Express.Multer.File[]
    },
  ) {

    if (files?.cover_image) {
      updateCourseDto.cover_image_url = `/uploads/courses/${files.cover_image[0].filename}`;
    }
    if (files?.material_file) {
      updateCourseDto.material_file_url = `/uploads/courses/${files.material_file[0].filename}`;
    }
    if (files?.exercise_file) {
      updateCourseDto.exercise_file_url = `/uploads/courses/${files.exercise_file[0].filename}`;
    }
    if (files?.promo_video) {
      updateCourseDto.promo_video_url = `/uploads/courses/${files.promo_video[0].filename}`;
    }
    return this.coursesService.update(+id, updateCourseDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id);
  }
}