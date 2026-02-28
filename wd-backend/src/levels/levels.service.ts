import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'; // 1. เพิ่ม OnModuleInit
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Level } from './entities/level.entity';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';

@Injectable()
export class LevelsService implements OnModuleInit { // 2. เพิ่ม implements OnModuleInit
  constructor(
    @InjectRepository(Level)
    private readonly levelRepo: Repository<Level>,
  ) {}

  // 3. เพิ่มฟังก์ชันนี้: ทำงานทันทีเมื่อเริ่ม Server
  async onModuleInit() {
    const count = await this.levelRepo.count(); // เช็คว่ามีข้อมูลหรือยัง
    if (count === 0) {
      console.log('🌱 Detected empty levels. Seeding default data...');
      
      const defaultLevels = [
        { id: 1, name: 'ป.4' },
        { id: 2, name: 'ป.5' },
        { id: 3, name: 'ป.6' },
        { id: 4, name: 'ม.1' },
        { id: 5, name: 'ม.2' },
        { id: 6, name: 'ม.3' },
      ];

      for (const level of defaultLevels) {
        // บังคับ Save พร้อม ID เพื่อให้ตรงกับ Mock Data หน้าบ้าน
        await this.levelRepo.save({
          level_id: level.id,
          level_name: level.name
        });
      }
      console.log('✅ Default levels (1-6) created successfully!');
    }
  }

  // --- โค้ดเดิมด้านล่างไม่ต้องแก้ ---
  create(createLevelDto: CreateLevelDto) {
    const newLevel = this.levelRepo.create(createLevelDto);
    return this.levelRepo.save(newLevel);
  }

  findAll() {
    return this.levelRepo.find();
  }

  async findOne(id: number) {
    const level = await this.levelRepo.findOne({ where: { level_id: id } });
    if (!level) throw new NotFoundException(`ไม่พบระดับชั้นรหัส ${id}`);
    return level;
  }

  async update(id: number, updateLevelDto: UpdateLevelDto) {
    const level = await this.findOne(id);
    Object.assign(level, updateLevelDto);
    return this.levelRepo.save(level);
  }

  async remove(id: number) {
    const level = await this.findOne(id);
    return this.levelRepo.remove(level);
  }
}