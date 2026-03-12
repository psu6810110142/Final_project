import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateLessonDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  video_url?: string;

  @IsOptional()
  @IsString()
  attachment_url?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sequence?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  course_id?: number;
}