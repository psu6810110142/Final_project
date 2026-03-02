import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard'; 
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { getStorageConfig, imageFileFilter } from 'src/utils/file-upload.config';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(
    FileInterceptor('slip_image', {
      storage: getStorageConfig('slips'), // เก็บไว้ใน uploads/slips
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      fileFilter: imageFileFilter,
    }),
  )
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      // ตรวจสอบชื่อฟิลด์เก็บรูปสลิปใน DB 
      createPaymentDto.slip_image_url = `/uploads/slips/${file.filename}`;
    }
    return this.paymentsService.create(createPaymentDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get() // ดูทั้งหมด (Admin)
  findAll() {
    return this.paymentsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Patch(':id') // แก้ไขสถานะ (ตรวจสลิป)
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }
}