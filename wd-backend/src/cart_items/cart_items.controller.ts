import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post() // หยิบของใส่ตะกร้า
  create(@Body() createCartItemDto: CreateCartItemDto) {
    return this.cartItemsService.create(createCartItemDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get() // ดูทั้งหมด (Admin)
  findAll() {
    return this.cartItemsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/:userId') // ✨ ดูตะกร้าของ User คนนี้ (เช่น นาย A มีอะไรในตะกร้าบ้าง)
  findByUser(@Param('userId') userId: string) {
    return this.cartItemsService.findByUser(+userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartItemsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id') // ลบของชิ้นนี้ออกจากตะกร้า
  remove(@Param('id') id: string) {
    return this.cartItemsService.remove(+id);
  }
}