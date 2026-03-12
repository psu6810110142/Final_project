import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { LearningProgress } from 'src/learning_progress/entities/learning_progress.entity';
@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  lesson_id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  video_url: string;

  @Column({ type: 'text', nullable: true })
  attachment_url: string;

  @Column({ type: 'int' })
  sequence: number; // ลำดับบทเรียน

  // --- Relationships ---
  @ManyToOne(() => Course, (course) => course.lessons)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => LearningProgress, (progress) => progress.lesson)
  learning_progress: LearningProgress[];
}