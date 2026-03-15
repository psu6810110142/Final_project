import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  user_id: number;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(['payment_approved', 'payment_rejected', 'general'])
  type: string;

  @IsOptional()
  @IsNumber()
  order_id?: number;
}
