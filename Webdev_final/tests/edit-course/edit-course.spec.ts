import { test, expect } from '@playwright/test';

test('Admin can edit an existing course successfully', async ({ page }) => {
  test.setTimeout(60000);

  const newFilePath = 'tests/edit-course/new-cover.jpg';

  const updatedCourseName = `คอร์สภาษาโปรตุเกส (อัปเดตแล้ว) ${Date.now()}`;

  await page.goto('http://localhost:5173/');

  // 1. ล็อกอินเข้าสู่ระบบ
  await page.getByRole('link', { name: 'เข้าสู่ระบบ' }).click();
  await page.getByRole('textbox', { name: 'กรอกอีเมล หรือ Username ของคุณ' }).fill('admin');
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่านของคุณ' }).fill('admin123');
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่านของคุณ' }).press('Enter');

  await page.waitForURL(/manage-courses/);

  // 2. ไปหน้าจัดการคอร์สเรียน
  await page.getByText('จัดการคอร์สเรียน').click();

  // 3. กดปุ่ม "แก้ไข" ที่คอร์สแรกสุดในตาราง
  await page.getByRole('button', { name: 'แก้ไข' }).first().click();

  await page.waitForSelector('text=แก้ไขคอร์สเรียน');

  // 4. เริ่มแก้ไขข้อมูล 
  const nameInput = page.getByRole('textbox').first();
  await nameInput.clear();
  await nameInput.fill(updatedCourseName);

  // แก้ไขรายละเอียด
  const detailTextarea = page.locator('textarea');
  await detailTextarea.clear();
  await detailTextarea.fill('อัปเดตเนื้อหาใหม่: เพิ่มแทคติกการยิงประตูแบบโรนัลโด้');

  // แก้ไขราคา
  const priceInput = page.locator('input[type="number"]').first();
  await priceInput.clear();
  await priceInput.fill('19900');

  // 5. เทสต์การเปลี่ยนรูปหน้าปก
  await page.locator('input[type="file"]').first().setInputFiles(newFilePath);

  // 6. กดบันทึก
  await page.getByRole('button', { name: 'บันทึก' }).click();

  // รอให้ระบบบันทึกและโหลดกลับมาหน้ารวม
  await page.waitForLoadState('networkidle');

  // 7. ตรวจสอบ
  await expect(
    page.getByRole('heading', { name: updatedCourseName }).first()
  ).toBeVisible();
});