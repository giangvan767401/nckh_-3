
import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { spawn } from 'child_process';
import { PredictionResult } from './entities/prediction-result.entity';
import { LearningLog } from '../logs/entities/learning-log.entity';
import { UploadedModel } from '../models/entities/uploaded-model.entity';
import { Course } from '../courses/entities/course.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(PredictionResult)
    private resultRepository: Repository<PredictionResult>,
    @InjectRepository(LearningLog)
    private logRepository: Repository<LearningLog>,
    @InjectRepository(UploadedModel)
    private modelRepository: Repository<UploadedModel>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async runInference(courseId: string, studentIdentifier: string, instructorId: string): Promise<any> {
    // 1. Resolve Student (by ID or Email/Name)
    let student = await this.userRepository.findOne({ where: { id: studentIdentifier } });

    if (!student) {
      // Try searching by email or name
      student = await this.userRepository.findOne({
        where: [
          { email: studentIdentifier },
          { name: studentIdentifier }
        ]
      });
    }

    if (!student) throw new NotFoundException('Student not found');
    const studentId = student.id;

    // 2. Validate Course and Active Model
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (!course.activeModelId) throw new NotFoundException('No active model deployed for this course');

    const model = await this.modelRepository.findOne({ where: { id: course.activeModelId } });
    if (!model) throw new NotFoundException('Active model file not found in registry');

    // 3. Fetch Recent Telemetry Logs
    const logs = await this.logRepository.find({
      where: { studentId, moduleId: courseId }, // Corrected mapping
      order: { timestamp: 'DESC' },
      take: 20
    });

    if (logs.length === 0) {
      throw new NotFoundException(`No telemetry data found for student ${student.email}`);
    }

    // 3. Spawn Python Child Process
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('C:\\Users\\Admin\\AppData\\Local\\Programs\\Python\\Python310\\python.exe', [
        'src/predictions/scripts/inference.py',
        '--model_path', model.filePath,
        '--logs', JSON.stringify(logs)
      ]);

      let resultData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        if (code !== 0) {
          reject(new InternalServerErrorException(`ML Inference failed: ${errorData}`));
          return;
        }

        try {
          const parsed = JSON.parse(resultData);
          if (parsed.error) throw new Error(parsed.error);

          // 4. Save Prediction Result
          const prediction = this.resultRepository.create({
            studentId,
            courseId,
            modelId: model.id,
            failureRisk: parsed.failureRisk,
            confidence: parsed.confidence,
            rawOutput: parsed.details
          });

          const savedResult = await this.resultRepository.save(prediction);
          resolve(savedResult);
        } catch (e) {
          reject(new InternalServerErrorException('Failed to parse ML output'));
        }
      });
    });
  }

  async findByStudent(studentId: string) {
    return this.resultRepository.find({
      where: { studentId },
      order: { predictedAt: 'DESC' },
      relations: ['course']
    });
  }
}
