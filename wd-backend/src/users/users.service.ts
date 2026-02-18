import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'; 
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // 1. แก้ไขตรงนี้: ปล่อยฟังก์ชันว่างไว้ก่อน (ไม่ต้องทำอะไรตอนเริ่ม)
  async onModuleInit() {
     // --- ปิดโค้ดส่วนนี้ชั่วคราว เพื่อแก้ปัญหาแอปค้าง ---
    const adminEmail = 'admin@newlearning.com';
    const existingAdmin = await this.userRepo.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      console.log('🚀 กำลังสร้างบัญชี Admin เริ่มต้น...');
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const newAdmin = this.userRepo.create({
        username: 'AdminMaster',
        password_hash: hashedPassword, 
        full_name: 'System Administrator',
        email: adminEmail,
        phone: '000-000-0000',
        role: 'ADMIN', 
      });

      await this.userRepo.save(newAdmin);
      console.log('✅ สร้าง Admin สำเร็จ: admin@newlearning.com / admin123');
    }
    // ------------------------------------------------
 
  }

  // 2. ฟังก์ชันสร้าง User ใหม่ (ยังคงเดิม)
  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password_hash, salt);

    const newUser = this.userRepo.create({
      ...createUserDto,
      password_hash: hashedPassword, 
    });

    if (createUserDto.level_id) {
      newUser.level = { level_id: createUserDto.level_id } as any;
    }

    return this.userRepo.save(newUser);
  }

  // 3. ฟังก์ชันค้นหาจาก Email (ยังคงเดิม)
  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  findAll() {
    return this.userRepo.find({ relations: ['level'] });
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ 
      where: { user_id: id },
      relations: ['level'] 
    });
    if (!user) throw new NotFoundException(`ไม่พบผู้ใช้งานรหัส ${id}`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.password_hash) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password_hash = await bcrypt.hash(updateUserDto.password_hash, salt);
    }

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