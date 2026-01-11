
import { IsArray, IsUUID } from 'class-validator';

export class CheckoutDto {
  @IsArray()
  @IsUUID('all', { each: true })
  courseIds: string[];
}
