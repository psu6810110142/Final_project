import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Level } from './entities/level.entity';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';

@Injectable()
export class LevelsService {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepo: Repository<Level>,
  ) {}

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