import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @Type(() => Number)
  @IsNumber()
  order_id: number;

  @Type(() => Number)
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  slip_image_url: string;

  @IsOptional()
  payment_date: Date;
}