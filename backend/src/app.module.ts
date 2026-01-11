
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { LogsModule } from './logs/logs.module';
import { ModelsModule } from './models/models.module';
import { PredictionsModule } from './predictions/predictions.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { User } from './auth/entities/user.entity';
import { Course } from './courses/entities/course.entity';
import { Lesson } from './courses/entities/lesson.entity';
import { Enrollment } from './courses/entities/enrollment.entity';
import { LearningLog } from './logs/entities/learning-log.entity';
import { UploadedModel } from './models/entities/uploaded-model.entity';
import { PredictionResult } from './predictions/entities/prediction-result.entity';
import { Notification } from './notifications/entities/notification.entity';
import { LessonCompletion } from './courses/entities/lesson-completion.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH || './data/elearning.db',
      entities: [
        User,
        Course,
        Lesson,
        Enrollment,
        LearningLog,
        UploadedModel,
        PredictionResult,
        Notification,
        LessonCompletion
      ],
      synchronize: true,
      logging: false,
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
    LogsModule,
    ModelsModule,
    PredictionsModule,
    PaymentsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
