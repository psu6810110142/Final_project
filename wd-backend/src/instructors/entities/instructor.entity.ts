import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';

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
  contact_info: string;

  @Column({ type: 'text', nullable: true })
  profile_image_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // อาจารย์ 1 คน สอนได้หลายคอร์ส (One-to-Many)
  @OneToMany(() => Course, (course) => course.instructor)
  courses: Course[];
}