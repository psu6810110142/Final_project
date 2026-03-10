// create-cart_item.dto.ts
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCartItemDto {
  @IsNumber()
  @Type(() => Number)
  user_id: number;

  @IsNumber()
  @Type(() => Number)
  course_id: number;
}