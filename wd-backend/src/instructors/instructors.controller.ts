import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { InstructorsService } from './instructors.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { Roles } from 'src/auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { getStorageConfig, imageFileFilter } from 'src/utils/file-upload.config';

@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createInstructorDto: CreateInstructorDto) {
    return this.instructorsService.create(createInstructorDto);
  }

  @Get()
  findAll() {
    return this.instructorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instructorsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('profile_picture', {
      storage: getStorageConfig('instructors'), // เก็บไว้ใน uploads/instructors
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      fileFilter: imageFileFilter,
    }),
  )
  update(
    @Param('id') id: string, 
    @Body() updateInstructorDto: UpdateInstructorDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateInstructorDto.profile_image_url = `/uploads/instructors/${file.filename}`;
    }
    return this.instructorsService.update(+id, updateInstructorDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instructorsService.remove(+id);
  }
}
