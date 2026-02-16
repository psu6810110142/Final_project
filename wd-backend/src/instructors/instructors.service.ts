import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { Instructor } from './entities/instructor.entity';

@Injectable()
export class InstructorsService {
  constructor(
    @InjectRepository(Instructor)
    private readonly instructorRepo: Repository<Instructor>,
  ) {}
  create(createInstructorDto: CreateInstructorDto) {
    const newInstructor = this.instructorRepo.create(createInstructorDto);
    return this.instructorRepo.save(newInstructor);  
  }

  findAll() {
    return this.instructorRepo.find();
  }

  async findOne(id: number) {
    const instructor = await this.instructorRepo.findOne({ where: { instructor_id: id } });
    if (!instructor) throw new NotFoundException(`ไม่พบอาจารย์รหัส ${id}`);
    return instructor;
  }

  async update(id: number, updateInstructorDto: UpdateInstructorDto) {
    const instructor = await this.findOne(id);
    Object.assign(instructor, updateInstructorDto);
    return this.instructorRepo.save(instructor);
  }

  async remove(id: number) {
    const instructor = await this.findOne(id);
    return this.instructorRepo.remove(instructor);
  }
}
