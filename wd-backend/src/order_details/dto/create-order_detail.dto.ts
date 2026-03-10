import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateOrderDetailDto {
  @Type(() => Number)
  @IsNumber()
  order_id: number;

  @Type(() => Number)
  @IsNumber()
  course_id: number;

  @Type(() => Number)
  @IsNumber()
  price_at_purchase: number;
}