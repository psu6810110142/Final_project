import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 👈 1. อย่าลืม import นี้!

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
<<<<<<< HEAD
  app.enableCors();
  // ✨ เปลี่ยนจาก 3000 เป็น 3001 เพื่อหนี Port ที่ชนกัน
=======

  // ตั้งค่า CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ✨ 2. เพิ่มส่วนนี้เข้าไปครับ (สำคัญมาก!) ✨
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // ตัดตัวแปรขยะที่ไม่ได้อยู่ใน DTO ทิ้ง
    transform: true, // แปลงชนิดข้อมูลอัตโนมัติ (เช่น string "1" -> number 1)
  }));

  // ใช้ Port 3001
>>>>>>> R_root
  await app.listen(process.env.PORT ?? 3001); 
  
  console.log('Application is running on: http://localhost:3001');
}
bootstrap();