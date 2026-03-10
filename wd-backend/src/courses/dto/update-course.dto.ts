import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  duration_weeks?: number;

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

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  level_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  instructor_id?: number;
}