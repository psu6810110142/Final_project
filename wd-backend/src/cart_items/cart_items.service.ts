import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart_item.entity';
import { CreateCartItemDto } from './dto/create-cart_item.dto';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
  ) {}

  async create(createCartItemDto: CreateCartItemDto): Promise<CartItem | null> {
  const result = await this.cartItemRepo.insert({
    user: { user_id: createCartItemDto.user_id } as any,
    course: { course_id: createCartItemDto.course_id } as any,
  });

  const newId = result.identifiers[0].cart_item_id;
  return this.cartItemRepo.findOne({
    where: { cart_item_id: newId },
    relations: ['user', 'course'],
  });
}


  findAll(): Promise<CartItem[]> {
    return this.cartItemRepo.find({
      relations: ['user', 'course', 'course.instructor'],
    });
  }

  findByUser(userId: number): Promise<CartItem[]> {
    return this.cartItemRepo.find({
      where: { user: { user_id: userId } },
      relations: ['course', 'course.instructor'],
    });
  }

  findOne(id: number): Promise<CartItem | null> {
  return this.cartItemRepo.findOne({ where: { cart_item_id: id } });
  }


  async remove(id: number): Promise<CartItem> {
    const item = await this.findOne(id);
    if (!item) throw new NotFoundException(`ไม่พบสินค้าในตะกร้ารหัส ${id}`);
    return this.cartItemRepo.remove(item);
  }
}