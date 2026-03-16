import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { User } from '../../users/entities/user.entity';

@Entity('instructors')
export class Instructor {
  @PrimaryGeneratedColumn()
  instructor_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  education: string;

  @Column({ type: 'text', nullable: true })
  experience: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject_taught: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  expertise: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_info: string;

  @Column({ type: 'text', nullable: true })
  profile_image_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // ผูกกับ User account (nullable เพราะอาจารย์เก่าอาจไม่มี account)
  @Column({ type: 'int', nullable: true })
  user_id: number | null;

  @OneToMany(() => Course, (course) => course.instructor)
  courses: Course[];
}