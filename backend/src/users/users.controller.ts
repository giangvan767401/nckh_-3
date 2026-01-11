
import { Controller, Get, Put, Body, UseGuards, Req, Param, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assuming path from Spec
import { UpdateProfileDto } from '../shared/dto/user.dto';
import { UserRole } from '../auth/entities/user.entity';

// Note: In real app, JwtAuthGuard is usually provided globally or imported correctly
// Here we assume standard NestJS guard application
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  async getMe(@Req() req) {
    // sub comes from JwtStrategy validate() payload
    return this.usersService.findMe(req.user.id);
  }

  @Put('me')
  async updateMe(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMe(req.user.id, dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const currentUser = req.user;

    // Logic: Instructor can see anyone, Students only themselves
    if (currentUser.role !== UserRole.INSTRUCTOR && currentUser.id !== id) {
      throw new ForbiddenException('You do not have permission to view this profile');
    }

    return this.usersService.findById(id);
  }
}
