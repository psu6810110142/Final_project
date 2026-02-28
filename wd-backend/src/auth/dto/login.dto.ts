<<<<<<< HEAD
// src/auth/dto/login.dto.ts
export class LoginDto {
  email: string;
  password: string; // 👈 ใช้ชื่อนี้จะไม่งงตอนเขียน AuthService
=======
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'; // 1. ต้อง import มาก่อน

export class LoginDto {
  @IsEmail()      // 2. บอกว่าอันนี้ต้องเป็นอีเมลนะ (และห้ามตัดทิ้ง)
  @IsNotEmpty()
  email: string;

  @IsString()     // 3. บอกว่าอันนี้ต้องเป็น String นะ (และห้ามตัดทิ้ง)
  @IsNotEmpty()
  password: string; 
>>>>>>> R_root
}