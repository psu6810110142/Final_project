import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderDetail } from 'src/order_details/entities/order_detail.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  order_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'enum', enum: ['WAITING_PAYMENT', 'COMPLETED', 'CANCELLED', 'REJECTED'], default: 'WAITING_PAYMENT' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // --- Relationships ---
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  order_details: OrderDetail[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}