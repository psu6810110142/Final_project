import { IsEnum, IsOptional } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(['WAITING_PAYMENT', 'COMPLETED', 'CANCELLED'])
  status?: string;
}