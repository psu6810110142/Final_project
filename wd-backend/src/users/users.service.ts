import { Injectable, NotFoundException, OnModuleInit, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
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

  async onModuleInit() {
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
  }

  async create(createUserDto: CreateUserDto) {
    const existingEmail = await this.userRepo.findOne({ where: { email: createUserDto.email } });
    if (existingEmail) {
      throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น');
    }

    const existingUsername = await this.userRepo.findOne({ where: { username: createUserDto.username } });
    if (existingUsername) {
      throw new ConflictException('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น');
    }

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

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByUsernameOrEmail(identifier: string) {
    return this.userRepo.findOne({
      where: [
        { email: identifier },
        { username: identifier }
      ]
    });
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

  // ✅ เพิ่ม: เปลี่ยนรหัสผ่าน
  async changePassword(id: number, currentPassword: string, newPassword: string) {
    // ดึง user พร้อม password_hash (select เพิ่มเติมเพราะปกติอาจ exclude ไว้)
    const user = await this.userRepo.findOne({
      where: { user_id: id },
      select: ['user_id', 'password_hash'],
    });

    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    // เช็ครหัสผ่านปัจจุบันว่าถูกไหม
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร');
    }

    // Hash รหัสผ่านใหม่แล้วบันทึก
    const salt = await bcrypt.genSalt();
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await this.userRepo.save(user);

    return { message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' };
  }
  
  async updateLastSeen(userId: number) {
    await this.userRepo.update(userId, { last_seen: new Date() } as any);
    return { ok: true };
  }

  async getOnlineUsers() {
    const threshold = new Date(Date.now() - 2 * 60 * 1000); // 2 นาที
    const users = await this.userRepo.find({ where: { role: 'STUDENT' } });
    return users.filter(u => (u as any).last_seen && new Date((u as any).last_seen) > threshold);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.userRepo.remove(user);
  }
}