import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInstructorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  subject_taught?: string;

  @IsOptional()
  @IsString()
  contact_info?: string;

  @IsOptional()
  @IsString()
  profile_image_url?: string;
}