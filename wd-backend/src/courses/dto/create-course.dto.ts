import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  duration_weeks: number;

  @IsOptional()
  @IsString()
  cover_image_url?: string;

  @IsOptional()
  @IsString()
  material_file_url?: string;

  @IsOptional()
  @IsString()
  exercise_file_url?: string;

  @IsOptional()
  @IsString()
  promo_video_url?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  level_id: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  instructor_id: number;
}