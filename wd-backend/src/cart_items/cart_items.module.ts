import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemsService } from './cart_items.service';
import { CartItemsController } from './cart_items.controller';
import { CartItem } from './entities/cart_item.entity'; // อย่าลืม Import Entity

@Module({
  imports: [TypeOrmModule.forFeature([CartItem])], // ✨ นำ Entity เข้ามา
  controllers: [CartItemsController],
  providers: [CartItemsService],
})
export class CartItemsModule {}