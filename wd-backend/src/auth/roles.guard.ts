import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. ดูว่าที่ API นี้แปะป้าย @Roles ไว้ไหม
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // ถ้าไม่ได้แปะป้าย @Roles แปลว่าใครก็เข้าได้ (ปล่อยผ่าน)
    if (!requiredRoles) {
      return true;
    }

    // 2. ดึงข้อมูล User จาก Request (ที่ได้มาจาก JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // 3. เช็คว่า User มี Role ตรงตามที่กำหนดไหม
    // (ถ้า requiredRoles มี 'ADMIN' และ user.role คือ 'ADMIN' ก็จะผ่าน)
    return requiredRoles.some((role) => user.role === role);
  }
}