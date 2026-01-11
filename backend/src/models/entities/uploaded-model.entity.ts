
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('uploaded_models')
export class UploadedModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  courseId: string;

  @Column({ length: 500 })
  filePath: string;

  @Column({ length: 255 })
  fileName: string;

  @Column()
  uploadedBy: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @Column({ default: false })
  active: boolean;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedBy' })
  uploader: User;
}
