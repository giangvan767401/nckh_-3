
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadedModel } from './entities/uploaded-model.entity';
import { Course } from '../courses/entities/course.entity';
import { UploadModelDto } from '../shared/dto/model.dto';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(UploadedModel)
    private modelRepository: Repository<UploadedModel>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) { }

  // Using any to avoid 'Cannot find namespace Express' when @types/multer is not explicitly in the environment
  async upload(file: any, dto: UploadModelDto, instructorId: string) {
    if (!file) throw new BadRequestException('Model file is required');

    const course = await this.courseRepository.findOne({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You are not the instructor of this course');
    }

    // Normalize path for database storage (Multer gives absolute or relative depending on config)
    // We want to store a path that can be used to retrieve the file later.
    const model = this.modelRepository.create({
      courseId: dto.courseId,
      filePath: file.path.replace(/\\/g, '/'), // Force forward slashes
      fileName: file.originalname,
      uploadedBy: instructorId,
    });

    return this.modelRepository.save(model);
  }

  async activate(modelId: string, instructorId: string) {
    const model = await this.modelRepository.findOne({
      where: { id: modelId },
      relations: ['course']
    });

    if (!model) throw new NotFoundException('Model not found');
    if (model.course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own the course this model belongs to');
    }

    // 1. Deactivate all other models for this course
    await this.modelRepository.update(
      { courseId: model.courseId },
      { active: false }
    );

    // 2. Activate this model
    model.active = true;
    await this.modelRepository.save(model);

    // 3. Update Course reference
    await this.courseRepository.update(
      { id: model.courseId },
      { activeModelId: model.id }
    );

    return { success: true, activeModelId: model.id };
  }

  async findByCourse(courseId: string, instructorId: string) {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('Access denied');
    }

    return this.modelRepository.find({
      where: { courseId },
      order: { uploadedAt: 'DESC' }
    });
  }
}
