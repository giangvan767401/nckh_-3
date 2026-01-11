
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningLog } from './entities/learning-log.entity';
import { CreateLogDto } from '../shared/dto/log.dto';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(LearningLog)
    private logRepository: Repository<LearningLog>,
  ) { }

  async saveBatch(logs: CreateLogDto[], studentId: string) {
    console.time(`bulk-insert-${studentId}`);

    const logEntities = logs.map(dto => {
      const log = this.logRepository.create(dto);
      log.studentId = studentId;
      log.timestamp = new Date(dto.timestamp);
      return log;
    });

    // save() handles bulk insertion efficiently in TypeORM
    await this.logRepository.save(logEntities);

    console.timeEnd(`bulk-insert-${studentId}`);
    return { inserted: logs.length };
  }

  async findAll() {
    return this.logRepository.find({
      relations: ['student'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByStudent(studentId: string) {
    return this.logRepository.find({
      where: { studentId },
      order: { timestamp: 'DESC' },
    });
  }
}
