import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart_item.entity';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
  ) {}

  // หยิบของใส่ตะกร้า
  create(createCartItemDto: CreateCartItemDto) {
    const item = this.cartItemRepo.create({
      user: { user_id: createCartItemDto.user_id },     // ผูกกับ User
      course: { course_id: createCartItemDto.course_id } // ผูกกับ Course
    });
    return this.cartItemRepo.save(item);
  }

  // ดูรายการในตะกร้าทั้งหมด (เอาไว้เทสต์)
  findAll() {
    return this.cartItemRepo.find({
      relations: ['user', 'course', 'course.instructor'], // ดึงข้อมูลคอร์สและคนสอนมาโชว์ด้วย
    });
  }

  // ✨ ฟังก์ชันพิเศษ: ดึงตะกร้าเฉพาะของ User คนนั้นๆ (ใช้ตอนเปิด Cart Popup)
  async findByUser(userId: number) {
    return this.cartItemRepo.find({
      where: { user: { user_id: userId } },
      relations: ['course', 'course.instructor'], // ดึงรายละเอียดคอร์สมาแสดงราคาและรูป
    });
  }

  findOne(id: number) {
    return this.cartItemRepo.findOne({ where: { cart_item_id: id } });
  }

  // ไม่น่าจะได้ใช้ Update เพราะปกติใส่ตะกร้าคือใส่เลย ไม่มีการแก้ไขจำนวน (เพราะคอร์สเรียนซื้อทีเดียว)
  update(id: number, updateCartItemDto: UpdateCartItemDto) {
    return `This action updates a #${id} cartItem`;
  }

  // ลบของออกจากตะกร้า
  async remove(id: number) {
    const item = await this.findOne(id);
    if (!item) throw new NotFoundException(`ไม่พบสินค้าในตะกร้ารหัส ${id}`);
    return this.cartItemRepo.remove(item);
  }
}