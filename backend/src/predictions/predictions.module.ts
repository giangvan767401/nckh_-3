
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictionsService } from './predictions.service';
import { PredictionsController } from './predictions.controller';
import { PredictionResult } from './entities/prediction-result.entity';
import { LearningLog } from '../logs/entities/learning-log.entity';
import { UploadedModel } from '../models/entities/uploaded-model.entity';
import { Course } from '../courses/entities/course.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PredictionResult,
      LearningLog,
      UploadedModel,
      Course,
      User
    ])
  ],
  providers: [PredictionsService],
  controllers: [PredictionsController],
})
export class PredictionsModule { }
