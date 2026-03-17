import { IsString, IsEmail, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsOptional()
  @IsString()
  interesting_subject?: string;

  @IsOptional()
  @IsEnum(['STUDENT', 'ADMIN', 'INSTRUCTOR'])
  role?: 'STUDENT' | 'ADMIN' | 'INSTRUCTOR';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  level_id?: number;
}