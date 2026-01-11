
import { Controller, Post, Get, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { CreateLogDto } from '../shared/dto/log.dto';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  async saveBatch(@Body() dtos: CreateLogDto[], @Req() req) {
    return this.logsService.saveBatch(dtos, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Get('')
  async findAll() {
    return this.logsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Get(':studentId')
  async findByStudent(@Req() req) {
    return this.logsService.findByStudent(req.params.studentId);
  }
}
