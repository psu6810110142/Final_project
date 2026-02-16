import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  cart_item_id: number;

  @CreateDateColumn()
  added_at: Date;

  // --- Relationships ---
  @ManyToOne(() => User, (user) => user.cart_items)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, (course) => course.cart_items)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}