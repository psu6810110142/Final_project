import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const newUser = this.userRepo.create(createUserDto);
    
    if (createUserDto.level_id) {
        newUser.level = { level_id: createUserDto.level_id } as any;
    }

    return this.userRepo.save(newUser);
  }

  findAll() {
    return this.userRepo.find({
      relations: ['level'], 
    });
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ 
      where: { user_id: id },
      relations: ['level']
    });
    
    if (!user) throw new NotFoundException(`ไม่พบผู้ใช้งานรหัส ${id}`);
    
    return user;
  }

  async findByUsername(username: string) {
    return this.userRepo.findOne({ where: { username } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    
    Object.assign(user, updateUserDto);
    
    if (updateUserDto.level_id) {
        user.level = { level_id: updateUserDto.level_id } as any;
    }

    return this.userRepo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.userRepo.remove(user);
  }
}