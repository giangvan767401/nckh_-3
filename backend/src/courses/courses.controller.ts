
import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { CreateCourseDto, UpdateCourseDto } from '../shared/dto/course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Get('teaching')
  async findMyTeachingCourses(@Req() req) {
    return this.coursesService.findMyTeachingCourses(req.user.id);
  }

  @Public()
  @Get()
  async findAll(@Query() query) {
    return this.coursesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get('my')
  async findMyEnrolled(@Req() req) {
    return this.coursesService.findMyEnrolled(req.user.id);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Post()
  async create(@Body() dto: CreateCourseDto, @Req() req) {
    return this.coursesService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCourseDto, @Req() req) {
    return this.coursesService.update(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    return this.coursesService.delete(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post('enroll/:courseId')
  async enroll(@Param('courseId') courseId: string, @Req() req) {
    return this.coursesService.enroll(courseId, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post('lessons/:lessonId/complete')
  async completeLesson(@Param('lessonId') lessonId: string, @Req() req) {
    return this.coursesService.completeLesson(lessonId, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get(':id/completions')
  async getCompletions(@Param('id') id: string, @Req() req) {
    return this.coursesService.getCompletions(id, req.user.id);
  }
}
