export class CreateCourseDto {
  title: string;
  description: string;
  price: number;
  duration_weeks: number;
  cover_image_url?: string;
  material_file_url?: string;
  exercise_file_url?: string;
  promo_video_url?: string;

  level_id: number;       // รับ ID ของระดับชั้น
  instructor_id: number;  // รับ ID ของอาจารย์
}