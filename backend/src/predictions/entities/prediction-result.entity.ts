
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { UploadedModel } from '../../models/entities/uploaded-model.entity';

@Entity('prediction_results')
export class PredictionResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  studentId: string;

  @Index()
  @Column()
  courseId: string;

  @Column()
  modelId: string;

  @Column({ type: 'float' })
  failureRisk: number;

  @Column({ type: 'float' })
  confidence: number;

  @CreateDateColumn()
  predictedAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  rawOutput: any;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @ManyToOne(() => UploadedModel)
  @JoinColumn({ name: 'modelId' })
  model: UploadedModel;
}
