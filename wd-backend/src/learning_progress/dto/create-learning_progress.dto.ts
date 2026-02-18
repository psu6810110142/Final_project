export class CreateLearningProgressDto {
  user_id: number;
  lesson_id: number;
  is_completed?: boolean; // ส่งมาเป็น true ก็ได้ หรือไม่ส่งเดี๋ยวเรา default ให้
}