import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ตั้งค่า CORS ให้ Frontend (React) เข้าถึงได้
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ใช้ Port 3001 ตามที่เราแก้กันไว้ (เพื่อหนี Port 3000 ที่ชอบชน)
  await app.listen(process.env.PORT ?? 3001); 
  
  console.log('Application is running on: http://localhost:3001');
}
bootstrap();