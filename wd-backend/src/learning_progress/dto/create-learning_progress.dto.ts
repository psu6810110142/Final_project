import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateLearningProgressDto {
  @Type(() => Number)
  @IsNumber()
  user_id: number;

  @Type(() => Number)
  @IsNumber()
  lesson_id: number;

  @IsOptional()
  @IsBoolean()
  is_completed?: boolean;
}