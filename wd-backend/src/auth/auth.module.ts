import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy'; // เดี๋ยวเราสร้างไฟล์นี้ในขั้นตอนที่ 5

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        
        // ✨ เพิ่มการตรวจสอบ: ถ้าไม่มีค่าใน .env ให้ใช้ค่า Default ป้องกันแอปพัง
        if (!secret) {
          console.warn('⚠️ JWT_SECRET not found in .env, using default fallback!');
        }

        return {
          secret: secret || 'NewLearningSecretKey2026!', // ใส่ค่าสำรองไว้ตรงนี้
          signOptions: { expiresIn: '1h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], 
  exports: [AuthService],
})
export class AuthModule {}