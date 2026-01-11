
import { IsString, IsNumber, IsEnum, IsUrl, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseLevel } from '../../courses/entities/course.entity';

import { LessonType } from '../../courses/entities/lesson.entity';

export class CreateLessonDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  title: string;

  @IsEnum(LessonType)
  type: LessonType;

  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  content: string;

  @IsString()
  duration: string;

  @IsNumber()
  order: number;
}

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsUrl()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  category: string;

  @IsEnum(CourseLevel)
  level: CourseLevel;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  lessons?: CreateLessonDto[];
}

export class UpdateCourseDto extends CreateCourseDto { }
