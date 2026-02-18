export class CreateUserDto {
  username: string;
  password_hash: string;
  full_name: string;
  email: string;
  phone?: string;
  profile_picture_url?: string;
  interesting_subject?: string;
  role?: 'STUDENT' | 'ADMIN';
  level_id?: number; 
}