
import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { PredictionResult } from './entities/prediction-result.entity';
import { LearningLog } from '../logs/entities/learning-log.entity';
import { UploadedModel } from '../models/entities/uploaded-model.entity';
import { Course } from '../courses/entities/course.entity';
import { User } from '../auth/entities/user.entity';

// ── Đường dẫn model mặc định (fallback nếu chưa upload model vào DB) ──
// Script được chạy từ thư mục backend/, nên đi lên 2 cấp để đến root project
const DEFAULT_MODEL_DIR = path.resolve(__dirname, '..', '..', '..', '..', 'model');
const DEFAULT_MODEL_PATH     = path.join(DEFAULT_MODEL_DIR, 'model_xgb.pkl');
const DEFAULT_SCALER_PATH    = path.join(DEFAULT_MODEL_DIR, 'scaler (2).pkl');
const DEFAULT_THRESHOLD_PATH = path.join(DEFAULT_MODEL_DIR, 'threshold.pkl');

// ── Python executable: thử python3 trước, fallback python ──
function getPythonCmd(): string {
  // Trên Windows thường chỉ có 'python', trên Linux/Mac có 'python3'
  return process.platform === 'win32' ? 'python' : 'python3';
}

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);

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
    // ──────────────────────────────────────────────────────────────
    // 1. Resolve Student (by UUID, email, hoặc name)
    // ──────────────────────────────────────────────────────────────
    let student = await this.userRepository.findOne({ where: { id: studentIdentifier } });

    if (!student) {
      student = await this.userRepository.findOne({
        where: [
          { email: studentIdentifier },
          { name: studentIdentifier }
        ]
      });
    }

    if (!student) throw new NotFoundException(`Không tìm thấy sinh viên: ${studentIdentifier}`);
    const studentId = student.id;

    // ──────────────────────────────────────────────────────────────
    // 2. Validate Course
    // ──────────────────────────────────────────────────────────────
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Không tìm thấy khóa học');

    // ──────────────────────────────────────────────────────────────
    // 3. Xác định Model Path (từ DB hoặc fallback sang model mặc định)
    // ──────────────────────────────────────────────────────────────
    let modelPath = DEFAULT_MODEL_PATH;
    let scalerPath = DEFAULT_SCALER_PATH;
    let thresholdPath = DEFAULT_THRESHOLD_PATH;

    if (course.activeModelId) {
      const model = await this.modelRepository.findOne({ where: { id: course.activeModelId } });
      if (model && fs.existsSync(model.filePath)) {
        modelPath = model.filePath;
        // Scaler và threshold vẫn dùng mặc định vì model upload thường không kèm theo
        this.logger.log(`Using uploaded model: ${model.fileName}`);
      } else {
        this.logger.warn(`Active model file not found, falling back to default model`);
      }
    } else {
      this.logger.log(`No active model set for course, using default XGBoost model`);
    }

    // Kiểm tra bộ 3 file cấu hình AI (Model, Scaler, Threshold) có tồn tại không
    const missingFiles = [];
    if (!fs.existsSync(modelPath)) missingFiles.push(`Mô hình (Model)`);
    if (!fs.existsSync(scalerPath)) missingFiles.push(`Bộ chuẩn hóa (Scaler)`);
    if (!fs.existsSync(thresholdPath)) missingFiles.push(`Ngưỡng (Threshold)`);

    if (missingFiles.length > 0) {
      this.logger.error(`Báo lỗi: Thiếu file cấu hình AI - ${missingFiles.join(', ')}`);
      throw new NotFoundException(
        `Không thể phân tích! Hệ thống thiếu các file bắt buộc: ${missingFiles.join(', ')}. Vui lòng kiểm tra thư mục model.`
      );
    }

    // ──────────────────────────────────────────────────────────────
    // 4. Lấy Learning Logs của sinh viên từ tất cả Lesson trong Course
    // ──────────────────────────────────────────────────────────────
    // Cập nhật: Frontend có thể gán trường moduleId là ID của Lesson hoặc ID của Course.
    // Lấy tất cả lesson của Course này để query đầy đủ.
    const courseWithLessons = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['lessons']
    });
    const lessonIds = courseWithLessons?.lessons?.map(l => l.id) || [];
    const moduleIds = [...lessonIds, courseId];

    const logs = await this.logRepository.find({
      where: { studentId, moduleId: In(moduleIds) },
      order: { timestamp: 'DESC' },
      take: 50  // Lấy nhiều hơn để dự đoán chính xác hơn
    });

    if (logs.length === 0) {
      throw new NotFoundException(
        `Không có dữ liệu học tập của sinh viên ${student.email} trong khóa học này`
      );
    }

    this.logger.log(`Running inference for student ${student.email} with ${logs.length} logs`);

    // ──────────────────────────────────────────────────────────────
    // 5. Spawn Python Child Process
    // ──────────────────────────────────────────────────────────────
    return new Promise((resolve, reject) => {
      const scriptPath = path.resolve(__dirname, 'scripts', 'inference.py');
      const pythonCmd  = getPythonCmd();

      const args = [
        scriptPath,
        '--model_path',     modelPath,
        '--scaler_path',    scalerPath,
        '--threshold_path', thresholdPath,
        '--logs',           JSON.stringify(logs)
      ];

      this.logger.debug(`Spawning: ${pythonCmd} ${scriptPath}`);

      const pythonProcess = spawn(pythonCmd, args, {
        // Chạy từ thư mục backend để resolve relative paths đúng
        cwd: path.resolve(__dirname, '..', '..'),
      });

      let resultData = '';
      let errorData  = '';

      pythonProcess.stdout.on('data', (data) => { resultData += data.toString(); });
      pythonProcess.stderr.on('data', (data) => { errorData  += data.toString(); });

      pythonProcess.on('close', async (code) => {
        // stderr có thể chứa numpy warnings — không phải lỗi thật
        if (errorData) {
          this.logger.warn(`Python stderr: ${errorData.substring(0, 300)}`);
        }

        if (code !== 0) {
          this.logger.error(`Python process exited with code ${code}: ${errorData}`);
          reject(new InternalServerErrorException(
            `ML Inference thất bại (exit code ${code}). Kiểm tra Python và các thư viện (scikit-learn, xgboost, numpy).`
          ));
          return;
        }

        try {
          const trimmed = resultData.trim();
          if (!trimmed) {
            throw new Error('Script không trả về output');
          }

          const parsed = JSON.parse(trimmed);

          if (parsed.error) {
            throw new Error(parsed.error);
          }

          // ──────────────────────────────────────────────────────
          // 6. Lưu kết quả vào DB
          // ──────────────────────────────────────────────────────
          // Nếu dùng model mặc định, tìm hoặc tạo placeholder modelId
          let modelId = course.activeModelId;
          if (!modelId) {
            // Tìm model mặc định trong DB nếu có
            const defaultModel = await this.modelRepository.findOne({
              where: { courseId: courseId },
              order: { uploadedAt: 'DESC' }
            });
            modelId = defaultModel?.id ?? 'default-xgboost-model';
          }

          const prediction = this.resultRepository.create({
            studentId,
            courseId,
            modelId,
            failureRisk: parsed.failureRisk,
            confidence:  parsed.confidence,
            rawOutput: {
              ...parsed.details,
              verdict: parsed.verdict,
            }
          });

          const savedResult = await this.resultRepository.save(prediction);

          // Trả về kết quả đầy đủ cho frontend
          resolve({
            ...savedResult,
            verdict: parsed.verdict,
            rawOutput: {
              ...parsed.details,
              verdict: parsed.verdict,
            }
          });

        } catch (e: any) {
          this.logger.error(`Failed to parse ML output: ${resultData}`);
          reject(new InternalServerErrorException(
            `Không thể phân tích kết quả từ Python: ${e.message}`
          ));
        }
      });

      pythonProcess.on('error', (err) => {
        this.logger.error(`Failed to spawn Python process: ${err.message}`);
        reject(new InternalServerErrorException(
          `Không thể khởi động Python. Hãy chắc chắn Python đã được cài đặt và có trong PATH. Lỗi: ${err.message}`
        ));
      });
    });
  }

  async runBatchInference(courseId: string, instructorId: string): Promise<any[]> {
    const course = await this.courseRepository.findOne({ 
      where: { id: courseId },
      relations: ['lessons']
    });
    if (!course) throw new NotFoundException('Không tìm thấy khóa học');

    // Get all unique student IDs who have learning logs in any lesson of this course
    const lessonIds = course.lessons?.map(l => l.id) || [];
    const moduleIds = [...lessonIds, courseId];

    this.logger.log(`runBatchInference: Querying logs for moduleIds: ${JSON.stringify(moduleIds)}`);

    const logs = await this.logRepository.find({
      where: { moduleId: In(moduleIds) },
      select: ['studentId']
    });

    this.logger.log(`runBatchInference: Found ${logs.length} log rows for this course`);

    const uniqueStudentIds = [...new Set(logs.map(log => log.studentId))];
    this.logger.log(`runBatchInference: Found ${uniqueStudentIds.length} students for course ${courseId}`);

    const results = [];
    for (const studentId of uniqueStudentIds) {
      let studentInfo: any = null;
      try {
        studentInfo = await this.userRepository.findOne({ where: { id: studentId } });
        if (!studentInfo) {
          this.logger.warn(`Skip: could not find user DB record for studentId: ${studentId}`);
          continue;
        }

        // Tận dụng lại hàm logic runInference có sẵn
        const prediction = await this.runInference(courseId, studentId, instructorId);
        
        results.push({
          ...prediction,
          studentInfo: {
            id: studentInfo.id,
            name: studentInfo.name,
            email: studentInfo.email
          }
        });
      } catch (err: any) {
        this.logger.error(`Failed to predict for student ${studentId}: ${err.message}`, err.stack);
        results.push({
          id: `err-${studentId}`,
          studentId,
          verdict: 'LỖI',
          failureRisk: -1,
          confidence: 0,
          details: { inferenceSource: `System Error: ${err.message}` },
          studentInfo: {
            id: studentInfo?.id || studentId,
            name: studentInfo?.name || 'Unknown',
            email: studentInfo?.email || 'N/A'
          }
        });
      }
    }

    this.logger.log(`runBatchInference: Returning ${results.length} predictions`);
    return results;
  }

  async findByStudent(studentId: string) {
    return this.resultRepository.find({
      where: { studentId },
      order: { predictedAt: 'DESC' },
      relations: ['course']
    });
  }

  async findByCourse(courseId: string) {
    return this.resultRepository.find({
      where: { courseId },
      order: { predictedAt: 'DESC' },
      relations: ['student']
    });
  }
}
