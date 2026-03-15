import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Level } from '../../levels/entities/level.entity';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { Order } from '../../orders/entities/order.entity';
import { LearningProgress } from 'src/learning_progress/entities/learning_progress.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 150 })
  full_name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  profile_picture_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  interesting_subject: string;

  @Column({ type: 'enum', enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' })
  role: string;

  @Column({ type: 'timestamp', nullable: true })
  last_seen: Date;
  
  @Column({ type: 'text', nullable: true })
  bio: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // --- Relationships ---
  @ManyToOne(() => Level, (level) => level.users)
  @JoinColumn({ name: 'level_id' })
  level: Level;

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cart_items: CartItem[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => LearningProgress, (progress) => progress.user)
  learning_progress: LearningProgress[];
}