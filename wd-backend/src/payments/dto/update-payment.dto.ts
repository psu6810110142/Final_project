import { IsEnum, IsOptional } from 'class-validator';

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'REJECTED'])
  status?: string;
}