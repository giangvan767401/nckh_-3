
import { IsUUID } from 'class-validator';

export class UploadModelDto {
  @IsUUID()
  courseId: string;
}
