import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  // 1. ฟังก์ชันเช็คว่า อีเมล/รหัสผ่าน ถูกต้องไหม
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    // เช็คว่ามี User ไหม และลองเอา Password ที่พิมพ์มาเทียบกับค่า Hash ใน DB
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user; // ตัดรหัสผ่านทิ้ง ไม่ส่งกลับไป
      return result;
    }
    return null;
  }

  // 2. ฟังก์ชัน Login เพื่อสร้าง Token
  // 2. ฟังก์ชัน Login เพื่อสร้าง Token
  async login(loginDto: LoginDto) {
    // ✨ แก้จุดนี้: ส่งรหัสผ่านดิบ (password) เข้าไป ไม่ใช่ password_hash
    // สมมติใน LoginDto คุณใช้ชื่อ field ว่า password
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('ข้อมูลเข้าสู่ระบบไม่ถูกต้อง');
    }

    const payload = {
      username: user.username,
      sub: user.user_id,
      role: user.role
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }
}