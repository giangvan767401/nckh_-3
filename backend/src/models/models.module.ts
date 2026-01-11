
import { Module, BadRequestException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ModelsService } from './models.service';
import { ModelsController } from './models.controller';
import { UploadedModel } from './entities/uploaded-model.entity';
import { Course } from '../courses/entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UploadedModel, Course]),
    MulterModule.register({
      dest: './uploads/models',
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req, file, cb) => {
        if (file.originalname.endsWith('.pth')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only .pth files are allowed'), false);
        }
      },
    }),
  ],
  providers: [ModelsService],
  controllers: [ModelsController],
})
export class ModelsModule {}
