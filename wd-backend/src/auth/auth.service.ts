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

  // ✨ 1. รับค่า identifier (ซึ่งอาจจะเป็น email หรือ username ก็ได้)
  async validateUser(identifier: string, pass: string): Promise<any> {
    // ✨ เรียกใช้ฟังก์ชันใหม่ที่เราสร้างไว้ใน UsersService
    const user = await this.usersService.findByUsernameOrEmail(identifier);

    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    // ✨ 2. ส่ง loginDto.usernameOrEmail เข้าไปตรวจสอบ
    const user = await this.validateUser(loginDto.usernameOrEmail, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('อีเมล ชื่อผู้ใช้งาน หรือรหัสผ่านไม่ถูกต้อง');
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