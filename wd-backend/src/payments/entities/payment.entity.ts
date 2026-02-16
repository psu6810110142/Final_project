import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  payment_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text' })
  slip_image_url: string;

  @CreateDateColumn()
  payment_date: Date;

  @Column({ type: 'enum', enum: ['PENDING', 'PAID', 'REJECTED'], default: 'PENDING' })
  status: string;

  // --- Relationships ---
  @ManyToOne(() => Order, (order) => order.payments)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}