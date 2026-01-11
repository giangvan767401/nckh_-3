
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { LearningLog } from './entities/learning-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LearningLog])],
  providers: [LogsService],
  controllers: [LogsController],
})
export class LogsModule {}
