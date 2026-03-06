import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

export const getStorageConfig = (folder: string) => {
  const uploadPath = `./uploads/${folder}`;
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return diskStorage({
    destination: uploadPath,
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });
};

export const imageFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return callback(new Error('อนุญาตให้อัพโหลดเฉพาะไฟล์รูปภาพ (jpg, jpeg, png, gif) เท่านั้น!'), false);
  }
  callback(null, true);
};

export const videoFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(mp4|avi|mov|mkv)$/i)) {
    return callback(new Error('อนุญาตให้อัพโหลดเฉพาะไฟล์วิดีโอ (mp4, avi, mov, mkv) เท่านั้น!'), false);
  }
  callback(null, true);
};

export const mixedFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|avi|mov|mkv|pdf)$/i)) {
    return callback(new Error('ไฟล์ไม่รองรับ! กรุณาอัพโหลดรูปภาพ, วิดีโอ หรือ PDF เท่านั้น'), false);
  }
  callback(null, true);
};