export class CreateOrderDetailDto {
  order_id: number;          // ผูกกับบิลใบไหน
  course_id: number;         // ซื้อคอร์สอะไร
  price_at_purchase: number; // ราคาตอนซื้อ (สำคัญมาก! เพราะอนาคตราคาคอร์สอาจเปลี่ยน แต่ในบิลเก่าราคาต้องเท่าเดิม)
}