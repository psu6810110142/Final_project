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

  @Column({ type: 'int', default: 0 })
  total_enrolled: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  // --- ความสัมพันธ์ (Foreign Keys) ---

  // หลายคอร์ส อยู่ใน 1 ระดับชั้น (Many-to-One)
  @ManyToOne(() => Level, (level) => level.courses)
  @JoinColumn({ name: 'level_id' }) // ระบุชื่อ FK ให้ตรงกับ ER Diagram
  level: Level;

  // หลายคอร์ส สอนโดยอาจารย์ 1 คน (Many-to-One)
  @ManyToOne(() => Instructor, (instructor) => instructor.courses)
  @JoinColumn({ name: 'instructor_id' })
  instructor: Instructor;

  @OneToMany(() => Lesson, (lesson) => lesson.course) lessons: Lesson[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.course) cart_items: CartItem[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.course) order_details: OrderDetail[];
}