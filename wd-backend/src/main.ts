import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // ✨ เปลี่ยนจาก 3000 เป็น 3001 เพื่อหนี Port ที่ชนกัน
  await app.listen(process.env.PORT ?? 3001); 
  
  console.log('Application is running on: http://localhost:3001');
}
bootstrap();