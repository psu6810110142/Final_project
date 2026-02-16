import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('order_details')
export class OrderDetail {
  @PrimaryGeneratedColumn()
  order_detail_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_at_purchase: number;

  // --- Relationships ---
  @ManyToOne(() => Order, (order) => order.order_details)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Course, (course) => course.order_details)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}