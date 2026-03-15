import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    @IsString()
    bio?: string;
    
    @IsOptional()
    @IsString()
    full_name?: string; // ต้องมีตัวนี้ด้วย
}