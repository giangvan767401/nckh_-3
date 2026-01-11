
import { Controller, Post, Get, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('predictions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Roles(UserRole.INSTRUCTOR, UserRole.STUDENT)
  @Post('run/:courseId/:studentId?')
  async run(
    @Param('courseId') courseId: string,
    @Param('studentId') studentId: string,
    @Req() req
  ) {
    const targetStudentId = studentId || req.user.id;

    // Security check: Students only for self, Instructors can do for any
    if (req.user.role === UserRole.STUDENT && targetStudentId !== req.user.id) {
      throw new ForbiddenException('Access denied to other students logs');
    }

    return this.predictionsService.runInference(courseId, targetStudentId, req.user.id);
  }

  @Roles(UserRole.INSTRUCTOR, UserRole.STUDENT)
  @Get('student/:studentId')
  async findByStudent(@Param('studentId') studentId: string, @Req() req) {
    if (req.user.role === UserRole.STUDENT && studentId !== req.user.id) {
      throw new ForbiddenException('Access denied');
    }
    return this.predictionsService.findByStudent(studentId);
  }
}
