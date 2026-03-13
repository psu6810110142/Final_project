import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Level } from '../../levels/entities/level.entity';
import { Instructor } from '../../instructors/entities/instructor.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { OrderDetail } from 'src/order_details/entities/order_detail.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  course_id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  duration_weeks: number;

  @Column({ type: 'text', nullable: true })
  cover_image_url: string;

  @Column({ type: 'text', nullable: true })
  material_file_url: string;

  @Column({ type: 'text', nullable: true })
  exercise_file_url: string;

  @Column({ type: 'text', nullable: true })
  promo_video_url: string;

  // ✨ เพิ่มคอลัมน์ใหม่สำหรับข้อมูลการชำระเงินของคอร์สนี้
  @Column({ type: 'text', nullable: true })
  payment_qr_url: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bank_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  account_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  account_number: string;

  @Column({ type: 'int', default: 0 })
  total_enrolled: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  // --- ความสัมพันธ์ (Foreign Keys) ---
  @ManyToOne(() => Level, (level) => level.courses)
  @JoinColumn({ name: 'level_id' })
  level: Level;

  @ManyToOne(() => Instructor, (instructor) => instructor.courses)
  @JoinColumn({ name: 'instructor_id' })
  instructor: Instructor;

  @OneToMany(() => Lesson, (lesson) => lesson.course) lessons: Lesson[];
  @OneToMany(() => CartItem, (cartItem) => cartItem.course) cart_items: CartItem[];
  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.course) order_details: OrderDetail[];
}