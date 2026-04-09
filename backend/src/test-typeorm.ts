import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';
import { Course } from './courses/entities/course.entity';
import { Lesson } from './courses/entities/lesson.entity';
import { Enrollment } from './courses/entities/enrollment.entity';
import { LearningLog } from './logs/entities/learning-log.entity';
import { UploadedModel } from './models/entities/uploaded-model.entity';
import { PredictionResult } from './predictions/entities/prediction-result.entity';
import { Notification } from './notifications/entities/notification.entity';
import { LessonCompletion } from './courses/entities/lesson-completion.entity';
import { Repository, In } from 'typeorm';
import { NestFactory } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './data/elearning.db',
      entities: [
        User, Course, Lesson, Enrollment, LearningLog, UploadedModel, PredictionResult, Notification, LessonCompletion
      ],
    }),
    TypeOrmModule.forFeature([LearningLog])
  ]
})
export class TestModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(TestModule, {logger: false});
  const repo = app.get('LearningLogRepository');
  const courseId = '6588699e-87e6-497c-b684-b55fc0c90911';
  let logs = await repo.find({ where: { moduleId: In([courseId]) }, select: ['studentId'] });
  console.log("In Logs:", logs.length);
  
  // also check literal
  let logs2 = await repo.find({ where: { moduleId: courseId }});
  console.log("Equal Logs:", logs2.length);

  await app.close();
}
bootstrap();
