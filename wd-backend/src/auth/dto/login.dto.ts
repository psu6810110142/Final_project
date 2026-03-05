import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  usernameOrEmail: string; // ✨ เปลี่ยนชื่อ และรับเป็น String ทั่วไป

  @IsString()
  @IsNotEmpty()
  password: string;
}