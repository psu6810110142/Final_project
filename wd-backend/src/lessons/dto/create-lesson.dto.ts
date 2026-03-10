import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  video_url?: string;

  @Type(() => Number)
  @IsNumber()
  sequence: number;

  @Type(() => Number)
  @IsNumber()
  course_id: number;
}