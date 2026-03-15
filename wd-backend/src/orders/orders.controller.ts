import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
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
  @Post() // เปิดบิล
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get() // ดูทั้งหมด (Admin)
  findAll() {
    return this.ordersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/:userId') // ✨ ดูประวัติการสั่งซื้อของ User คนนี้
  findByUser(@Param('userId') userId: string) {
    return this.ordersService.findByUser(+userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  // User resubmit — reset REJECTED → WAITING_PAYMENT (เฉพาะ order ของตัวเอง)
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/resubmit')
  async resubmit(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.user_id;
    const order = await this.ordersService.findOne(+id);
    if (order.user?.user_id !== userId) {
      throw new ForbiddenException('ไม่มีสิทธิ์แก้ไข order นี้');
    }
    if (order.status !== 'REJECTED') {
      throw new ForbiddenException('สามารถ resubmit ได้เฉพาะ order ที่ถูกปฏิเสธเท่านั้น');
    }
    return this.ordersService.update(+id, { status: 'WAITING_PAYMENT' });
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Patch(':id') // แก้ไขสถานะออเดอร์
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