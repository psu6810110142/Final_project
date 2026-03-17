import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.ordersService.findByUser(+userId);
  }

  // INSTRUCTOR/ADMIN — ดึงนักเรียนที่ลงคอร์สนี้
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  @Get('students/course/:courseId')
  findStudentsByCourse(@Param('courseId') courseId: string) {
    return this.ordersService.findStudentsByCourse(+courseId);
  }

  // ⚠️ sub-path ต้องอยู่ก่อน :id เสมอ

  // User resubmit — REJECTED → WAITING_PAYMENT
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/resubmit')
  async resubmit(@Param('id') id: string, @Req() req: any) {
    // JWT strategy return { userId } ไม่ใช่ { sub }
    const userId = Number(req.user?.userId || req.user?.sub || req.user?.user_id);
    return this.ordersService.resubmit(+id, userId);
  }

  // User cancel — ยกเลิกได้เฉพาะ order ของตัวเองที่เป็น WAITING_PAYMENT
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cancel')
  async cancelByUser(@Param('id') id: string, @Req() req: any) {
    const userId = Number(req.user?.userId || req.user?.sub || req.user?.user_id);
    return this.ordersService.cancelByUser(+id, userId);
  }

  // :id ต้องอยู่หลัง sub-path ทั้งหมด
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}