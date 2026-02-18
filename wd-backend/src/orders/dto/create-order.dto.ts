export class CreateOrderDto {
  user_id: number;      // ใครเป็นคนสั่ง
  total_amount: number; // ยอดเงินรวม (เดี๋ยวเราจะให้ Frontend คำนวณส่งมา หรือ Backend บวกเองก็ได้)
}