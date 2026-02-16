import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { User } from '../../users/entities/user.entity'; // คอมเมนต์ไว้ก่อน รอทำ User Entity

@Entity('levels') // ชื่อตารางใน Database
export class Level {
  @PrimaryGeneratedColumn()
  level_id: number;

  @Column({ type: 'varchar', length: 100 })
  level_name: string;

  // 1 ระดับชั้น มีได้หลายคอร์ส (One-to-Many)
  @OneToMany(() => Course, (course) => course.level)
  courses: Course[];

  @OneToMany(() => User, (user) => user.level) users: User[];
}