import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';

@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post() // หยิบของใส่ตะกร้า
  create(@Body() createCartItemDto: CreateCartItemDto) {
    return this.cartItemsService.create(createCartItemDto);
  }

  @Get() // ดูทั้งหมด (Admin)
  findAll() {
    return this.cartItemsService.findAll();
  }

  @Get('user/:userId') // ✨ ดูตะกร้าของ User คนนี้ (เช่น นาย A มีอะไรในตะกร้าบ้าง)
  findByUser(@Param('userId') userId: string) {
    return this.cartItemsService.findByUser(+userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartItemsService.findOne(+id);
  }

  @Delete(':id') // ลบของชิ้นนี้ออกจากตะกร้า
  remove(@Param('id') id: string) {
    return this.cartItemsService.remove(+id);
  }
}