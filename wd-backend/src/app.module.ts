import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
      TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'password123',
      database: 'NewLearningAcademy_dev',
      entities: [], // เราจะเพมิ่ Entities ทนี่ ี่ในภายหลัง
      synchronize: true, // สรา้ง Table อัตโนมตั ิ(ใชสำ้ สำ หรบั Dev เทา่ นั้น)
}),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
