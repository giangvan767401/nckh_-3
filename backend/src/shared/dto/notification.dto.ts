
import { IsString, IsEnum, IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { NotificationType } from '../../notifications/entities/notification.entity';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsUUID()
  userId: string;
}

export class MarkReadDto {
  @IsBoolean()
  read: boolean;
}
