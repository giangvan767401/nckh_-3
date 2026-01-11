
import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { LearningTrend } from '../../logs/entities/learning-log.entity';

export class CreateLogDto {
  @IsString()
  sessionId: string;

  @IsDateString()
  timestamp: string;

  @IsString()
  moduleId: string;

  @IsNumber()
  timeSpentMinutes: number;

  @IsNumber()
  pagesVisited: number;

  @IsNumber()
  videoWatchedPercent: number;

  @IsNumber()
  clickEvents: number;

  @IsNumber()
  @IsOptional()
  notesTaken?: number;

  @IsNumber()
  @IsOptional()
  forumPosts?: number;

  @IsBoolean()
  @IsOptional()
  revisitFlag?: boolean;

  @IsNumber()
  quizScore: number;

  @IsNumber()
  attemptsTaken: number;

  @IsNumber()
  assignmentScore: number;

  @IsNumber()
  feedbackRating: number;

  @IsNumber()
  daysSinceLastActivity: number;

  @IsNumber()
  cumulativeQuizScore: number;

  @IsEnum(LearningTrend)
  learningTrend: LearningTrend;

  @IsNumber()
  attentionScore: number;

  @IsString()
  feedbackType: string;

  @IsString()
  @IsOptional()
  nextModulePrediction?: string;

  @IsBoolean()
  @IsOptional()
  successLabel?: boolean;
}
