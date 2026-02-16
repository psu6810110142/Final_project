import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('learning_progress')
export class LearningProgress {
  @PrimaryGeneratedColumn()
  progress_id: number;

  @Column({ type: 'boolean', default: false })
  is_completed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  // --- Relationships ---
  @ManyToOne(() => User, (user) => user.learning_progress)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Lesson, (lesson) => lesson.learning_progress)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}