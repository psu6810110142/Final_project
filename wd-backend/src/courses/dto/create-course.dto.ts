import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
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
  
  @IsNumber()
  @IsNotEmpty()
  level_id: number;       // รับ ID ของระดับชั้น

  @IsNumber()
  @IsNotEmpty()
  instructor_id: number;  // รับ ID ของอาจารย์
}