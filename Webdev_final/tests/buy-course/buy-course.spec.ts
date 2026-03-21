import { test, expect } from '@playwright/test';

test('E2E: Admin สร้างคอร์ส และ User สมัครสมาชิกเพื่อซื้อคอร์ส', async ({ page }) => {
  const uniqueId = Date.now();
  const testUsername = `testuser_${uniqueId}`;
  const testEmail = `test${uniqueId}@gmail.com`;
  const courseName = `คอร์สทดสอบ ${uniqueId}`;
  const testImage = 'tests/test-image.jpg'; 

  // ==========================================================
  // PHASE 1: แอดมินเข้าสู่ระบบ และสร้างคอร์สเรียน
  // ==========================================================
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();
  
  await page.getByRole('textbox', { name: 'กรอกอีเมล หรือ Username ของคุณ' }).fill('admin');
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่านของคุณ' }).fill('admin123');
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่านของคุณ' }).press('Enter');

  await page.getByText('จัดการผู้สอน').click();
  await page.getByRole('button', { name: 'เพิ่มโปรไฟล์ผู้สอน' }).click();
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(testImage); 
  
  await page.getByRole('textbox').first().fill('ผู้สอนทดสอบ');
  await page.getByRole('textbox', { name: 'เช่น คณิตศาสตร์' }).fill('ทดสอบ');
  await page.getByRole('textbox', { name: 'เบอร์โทร / อีเมล' }).fill('0800000000');
  await page.getByRole('textbox').nth(3).fill('ป.ตรี');
  await page.getByRole('textbox').nth(4).fill('ประสบการณ์ 5 ปี');
  await page.getByRole('textbox').nth(5).fill('ไม่มี');
  await page.getByRole('button', { name: 'บันทึก' }).click();

  // --- สร้างคอร์สเรียน ---
  await page.getByText('จัดการบทเรียน').click();
  await page.locator('div').filter({ hasText: 'จัดการคอร์สเรียน' }).nth(2).click();
  await page.getByRole('button', { name: 'เพิ่มคอร์สใหม่' }).click();
  
  // ใช้ชื่อคอร์สที่สุ่มไว้ เพื่อกันชื่อซ้ำ
  await page.getByRole('textbox').first().fill(courseName);
  await page.locator('textarea').fill('รายละเอียดคอร์สทดสอบ');
  
  await page.getByRole('spinbutton').first().fill('10'); // จำนวนชั่วโมง (สมมติ)
  await page.getByRole('spinbutton').nth(1).fill('100'); // ราคา (สมมติ)
  
  await page.getByRole('combobox').first().selectOption('1');
  await page.getByRole('combobox').nth(1).selectOption('4');
  await page.getByRole('textbox', { name: 'ธนาคารกสิกรไทย' }).fill('กสิกรไทย');
  await page.getByRole('textbox', { name: '-4-56789-0' }).fill('1234567890');
  await page.getByRole('textbox', { name: 'นาย สมชาย ใจดี' }).fill('แอดมินใจดี');
  
  await page.getByRole('button', { name: 'Choose File' }).first().setInputFiles(testImage);
  await page.getByRole('button', { name: 'Choose File' }).nth(1).setInputFiles(testImage);
  
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.getByText('ออกจากระบบ').click();


  // ==========================================================
  // PHASE 2: USER ใหม่ สมัครสมาชิก และเข้าสู่ระบบ
  // ==========================================================
  await page.getByRole('link', { name: 'สมัครสมาชิก', exact: true }).click();
  
  // 3. ใช้ตัวแปรสุ่มสำหรับข้อมูล User
  await page.getByRole('textbox', { name: 'เช่น somchai123' }).fill(testUsername);
  await page.getByRole('textbox', { name: 'name@example.com' }).fill(testEmail);
  await page.getByRole('textbox', { name: 'ขั้นต่ำ 6 ตัวอักษร' }).fill('123123');
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่านอีกครั้ง' }).fill('123123');
  await page.getByRole('textbox', { name: 'กรอกชื่อและนามสกุลจริง' }).fill('นักเรียน ทดสอบ');
  await page.getByRole('textbox', { name: 'เช่น 0812345678' }).fill('0987654321');
  await page.locator('select[name="level_id"]').selectOption('2');
  await page.locator('select[name="interesting_subject"]').selectOption('math');
  
  // จัดการ Dialog แจ้งเตือนตอนสมัครสมาชิก
  page.once('dialog', dialog => {
    dialog.accept().catch(() => {}); // ใช้ accept() เพื่อกด OK แทน dismiss()
  });
  await page.getByRole('button', { name: 'ลงทะเบียน' }).click();

  // --- เข้าสู่ระบบด้วย User ใหม่ ---
  await page.getByRole('textbox', { name: 'กรอกอีเมล หรือ Username ของคุณ' }).fill(testEmail);
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่านของคุณ' }).fill('123123');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();


  // ==========================================================
  // PHASE 3: USER ซื้อคอร์สเรียน และ แนบสลิป
  // ==========================================================
  await page.getByRole('link', { name: 'คอร์สเรียน' }).click();
  
  // 4. ให้บอทหาคอร์สจากชื่อตัวแปรที่เพิ่งสร้างใน Phase 1
  await page.getByRole('link').filter({ hasText: courseName }).first().click();
  
  await page.getByRole('button', { name: 'ลงทะเบียนเรียนเลย' }).click();
  
  // 2. ลบ .click() ออก และแก้ path ไฟล์สลิป
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(testImage);
  
  await page.getByRole('button', { name: 'แจ้งโอนเงิน' }).click();
  
  // --- ตรวจสอบผลลัพธ์สุดท้าย (Assertion) ---
  await expect(page.getByText('รอแอดมินตรวจสอบสลิป')).toBeVisible();
});