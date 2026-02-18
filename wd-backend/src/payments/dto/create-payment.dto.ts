export class CreatePaymentDto {
  order_id: number;       // จ่ายบิลใบไหน
  amount: number;         // ยอดเงินที่โอน
  slip_image_url: string; // ลิงก์รูปสลิป (เดี๋ยวค่อยทำ Upload file ทีหลัง ตอนนี้ส่งเป็น text ไปก่อน)
  payment_date: Date;     // วันเวลาที่โอน
}