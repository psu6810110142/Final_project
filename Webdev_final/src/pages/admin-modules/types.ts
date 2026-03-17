export interface CourseData {
  course_id: number;
  title: string;
  description: string;
  price: number;
  duration_weeks: number;
  cover_image_url?: string;
  material_file_url?: string;
  exercise_file_url?: string;
  promo_video_url?: string;
  total_enrolled?: number;
  level_id?: number;
  instructor_id?: number;
  level?: { level_id: number; level_name: string };
  instructor?: { instructor_id: number; name: string };
  cover_image_file?: File | null;
  material_file?: File | null;
  exercise_file?: File | null;
}

export interface UserData {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  level_id?: number;
  interesting_subject?: string;
  profile_picture_url?: string;
  level?: { level_id: number; level_name: string };
  profile_image_file?: File | null;
}

export interface InstructorData {
  instructor_id: number;
  name: string;
  bio: string;
  education: string;
  experience: string;
  subject_taught: string;
  contact_info: string;
  profile_image_url: string;
  is_active: boolean;
  profile_image_file?: File | null;
  user_id?: number | null;
}

// ✅ Order จาก backend: user เป็น nested object → normalize แล้วใน AdminDashboard
export interface OrderData {
  order_id: number;
  user_id: number;   // normalize มาจาก order.user.user_id
  status: string;
  total_amount: number;
}

export interface LearningProgressData {
  progress_id: number;
  user_id: number;
  course_id: number;
  completion_percentage: number;
  is_completed: boolean;
}

export const mockLevels = [
  { level_id: 1, level_name: 'ป.4' }, { level_id: 2, level_name: 'ป.5' },
  { level_id: 3, level_name: 'ป.6' }, { level_id: 4, level_name: 'ม.1' },
  { level_id: 5, level_name: 'ม.2' }, { level_id: 6, level_name: 'ม.3' },
];

export const mockSubjects = [
  { value: 'math', label: 'คณิตศาสตร์' },
  { value: 'science', label: 'วิทยาศาสตร์' },
  { value: 'english', label: 'ภาษาอังกฤษ' },
  { value: 'thai', label: 'ภาษาไทย' },
  { value: 'social', label: 'สังคมศึกษา' },
];

// ✅ Backend รันที่ port 3001, เก็บไฟล์ที่ /uploads/...
// เพิ่ม ?t=timestamp กัน browser cache รูปเก่าหลัง upload ใหม่
export const getImageUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `http://43.210.144.64:3001${url}?t=${Date.now()}`;
};

export const getLevelName = (id?: number) =>
  mockLevels.find(l => l.level_id === id)?.level_name || '-';

export const getSubjectName = (val?: string) =>
  mockSubjects.find(s => s.value === val)?.label || val || '-';