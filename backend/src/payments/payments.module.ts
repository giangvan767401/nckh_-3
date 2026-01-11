
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../courses/entities/enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Enrollment])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
