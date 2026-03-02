import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { getStorageConfig, imageFileFilter } from 'src/utils/file-upload.config';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  @UseInterceptors(
    FileInterceptor('cover_image', {
      storage: getStorageConfig('courses'), // ✨ เก็บในโฟลเดอร์ uploads/courses
      limits: { fileSize: 2 * 1024 * 1024 }, // ขนาดไม่เกิน 2MB
      fileFilter: imageFileFilter, // รับเฉพาะรูปภาพ
    }),
  )
  create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      // เอา Path ของรูปภาพไปใส่ในฟิลด์ cover_image_url
      createCourseDto.cover_image_url = `/uploads/courses/${file.filename}`;
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
    FileInterceptor('cover_image', {
      storage: getStorageConfig('courses'),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: imageFileFilter,
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateCourseDto.cover_image_url = `/uploads/courses/${file.filename}`;
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