
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum LearningTrend {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DECLINING = 'declining',
}

@Entity('learning_logs')
export class LearningLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  studentId: string;

  @Column({ length: 50 })
  sessionId: string;

  @Index()
  @Column({ type: 'datetime' }) // timestamp not null
  timestamp: Date;

  @Index()
  @Column({ length: 100 })
  moduleId: string;

  @Column({ type: 'float' })
  timeSpentMinutes: number;

  @Column({ type: 'int' })
  pagesVisited: number;

  @Column({ type: 'float' })
  videoWatchedPercent: number;

  @Column({ type: 'int' })
  clickEvents: number;

  @Column({ type: 'int', default: 0 })
  notesTaken: number;

  @Column({ type: 'int', default: 0 })
  forumPosts: number;

  @Column({ default: false })
  revisitFlag: boolean;

  @Column({ type: 'float' })
  quizScore: number;

  @Column({ type: 'int' })
  attemptsTaken: number;

  @Column({ type: 'float' })
  assignmentScore: number;

  @Column({ type: 'int' })
  feedbackRating: number;

  @Column({ type: 'int' })
  daysSinceLastActivity: number;

  @Column({ type: 'float' })
  cumulativeQuizScore: number;

  @Column({
    type: 'simple-enum',
    enum: LearningTrend,
    default: LearningTrend.STABLE,
  })
  learningTrend: LearningTrend;

  @Column({ type: 'float' })
  attentionScore: number;

  @Column({ length: 50 })
  feedbackType: string;

  @Column({ length: 100, nullable: true })
  nextModulePrediction: string;

  @Column({ nullable: true })
  successLabel: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;
}
