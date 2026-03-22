import { test, expect } from '@playwright/test';

test('Admin can add new course successfully', async ({ page }) => {
  test.setTimeout(60000);

  const filePath = 'tests/add-course/Ronaldo.jpg';

  // 🔥 random ระดับ + กันชื่อซ้ำ
  const level = Math.floor(Math.random() * 6) + 1;
  const courseName = `ภาษาโปรตุเกส ป.3 ${Date.now()}`;

  await page.goto('http://localhost:5173/');

  // login
  await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('textbox', { name: 'กรอกอีเมล หรือ Username ของคุณ' }).fill('admin');
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่านของคุณ' }).fill('admin123');
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่านของคุณ' }).press('Enter');

  // รอ login สำเร็จ
  await page.waitForURL(/manage-courses/);

  // ไปหน้าเพิ่มคอร์ส
  await page.getByText('จัดการคอร์สเรียน').click();
  await page.getByRole('button', { name: 'เพิ่มคอร์สใหม่' }).click();

  // กรอกข้อมูล
  await page.getByRole('textbox').first().fill(courseName);
  await page.locator('textarea').fill('มีโรนัลโด้เป็นผู้สอน');

  await page.waitForSelector('input[type="number"]');
  await page.locator('input[type="number"]').first().fill('15000');
  await page.locator('input[type="number"]').nth(1).fill('40');     // ระยะเวลา

  await page.getByRole('combobox').first().selectOption('3');
  await page.getByRole('combobox').nth(1).selectOption('3');

  await page.getByRole('textbox', { name: 'ธนาคารกสิกรไทย' }).fill('ธนาคารกสิกรไทย');
  await page.getByRole('textbox', { name: '-4-56789-0' }).fill('123-45678-9');
  await page.getByRole('textbox', { name: 'นาย สมชาย ใจดี' }).fill('นายคริสเตียโน โรนัลโด้');

  // upload รูป
  await page.locator('input[type="file"]').first().setInputFiles(filePath);
  await page.locator('input[type="file"]').nth(1).setInputFiles(filePath);

  // บันทึก
  await page.getByRole('button', { name: 'บันทึก' }).click();

  await page.waitForLoadState('networkidle');

  // ✅ assertion
  await expect(
    page.getByRole('heading', { name: courseName }).first()
  ).toBeVisible();
});