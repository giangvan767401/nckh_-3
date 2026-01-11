
import { Controller, Post, Get, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ModelsService } from './models.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { UploadModelDto } from '../shared/dto/model.dto';

@Controller('models')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Roles(UserRole.INSTRUCTOR)
  @Post('upload')
  @UseInterceptors(FileInterceptor('model'))
  async upload(
    // Using any to avoid 'Cannot find namespace Express' error
    @UploadedFile() file: any,
    @Body() dto: UploadModelDto,
    @Req() req
  ) {
    return this.modelsService.upload(file, dto, req.user.id);
  }

  @Roles(UserRole.INSTRUCTOR)
  @Post(':modelId/activate')
  async activate(@Param('modelId') modelId: string, @Req() req) {
    return this.modelsService.activate(modelId, req.user.id);
  }

  @Roles(UserRole.INSTRUCTOR)
  @Get('course/:courseId')
  async findByCourse(@Param('courseId') courseId: string, @Req() req) {
    return this.modelsService.findByCourse(courseId, req.user.id);
  }
}
