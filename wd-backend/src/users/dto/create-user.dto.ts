import { IsString, IsEmail, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password_hash: string;

  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  profile_picture_url?: string;

  // ✨ ต้องใส่ Decorator นี้ เพื่อให้รับค่า "วิชาที่สนใจ" ได้
  @IsOptional()
  @IsString()
  interesting_subject?: string;

  @IsOptional()
  @IsEnum(['STUDENT', 'ADMIN'])
  role?: 'STUDENT' | 'ADMIN';

  // ✨ ต้องใส่ Decorator นี้ เพื่อให้รับค่า "ระดับชั้น" ได้
  @IsOptional()
  @IsNumber()
  level_id?: number; 
}