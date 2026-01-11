
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateNotificationDto } from '../shared/dto/notification.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@Req() req) {
    return this.notificationsService.getForUser(req.user.id);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req) {
    return this.notificationsService.markRead(id, req.user.id);
  }

  @Delete('clear')
  async clearAll(@Req() req) {
    return this.notificationsService.clearAll(req.user.id);
  }

  // Admin or System can trigger manually
  @Roles(UserRole.INSTRUCTOR)
  @Post('add')
  async add(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.add(dto);
  }
}
