import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @Type(() => Number)
  @IsNumber()
  user_id: number;

  @Type(() => Number)
  @IsNumber()
  total_amount: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  course_id?: number; // ใช้เช็คซ้ำเท่านั้น ไม่ได้ save ลง DB
}