import { test, expect } from '@playwright/test';

test('E2E: สมัครสมาชิกใหม่ และอัปโหลดรูปโปรไฟล์', async ({ page }) => {

  const uniqueId = Date.now();
  const testUsername = `user_${uniqueId}`;
  const testEmail = `student${uniqueId}@gmail.com`;
  const testName = `นักเรียน ทดสอบ ${uniqueId}`;
  const testPassword = 'password123';

  const profileImage = 'tests/edit-profile/profile-image.jpg'; 

  //------------Mock ข้อมูลชั้นเรียนใช้ในการสมัครสมาชิกเพื่อเข้าสู่ระบบ---------------------
  await page.route('**/levels', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { level_id: 1, level_name: 'มัธยมศึกษาปีที่ 1 (Mock)' },
        { level_id: 2, level_name: 'มัธยมศึกษาปีที่ 2 (Mock)' }
      ])
    });
  });

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'สมัครสมาชิก' }).click();

  await page.getByRole('textbox', { name: 'เช่น somchai123' }).fill(testUsername);
  await page.getByRole('textbox', { name: 'name@example.com' }).fill(testEmail);
  await page.getByRole('textbox', { name: 'ขั้นต่ำ 6 ตัวอักษร' }).fill(testPassword);
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่านอีกครั้ง' }).fill(testPassword);
  await page.getByRole('textbox', { name: 'กรอกชื่อและนามสกุลจริง' }).fill(testName);
  await page.getByRole('textbox', { name: 'เช่น 0812345678' }).fill('0987654321');
  
  await page.locator('select[name="level_id"]').selectOption('1');
  await page.locator('select[name="interesting_subject"]').selectOption('science');

  page.once('dialog', dialog => {
    dialog.accept().catch(() => {}); 
  });
  await page.getByRole('button', { name: 'ลงทะเบียน' }).click();


  await page.getByRole('textbox', { name: 'กรอกอีเมล หรือ Username ของคุณ' }).fill(testUsername);
  await page.getByRole('textbox', { name: 'กรอกรหัสผ่านของคุณ' }).fill(testPassword);
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();


  await page.getByText(testUsername).first().click();
  await page.locator('input[type="file"]').setInputFiles(profileImage);

  page.once('dialog', dialog => {
    dialog.accept().catch(() => {});
  });
  await page.getByRole('button', { name: '💾 บันทึกข้อมูล' }).click();

  await expect(page.getByText('บันทึกข้อมูลเรียบร้อยแล้ว ✅')).toBeVisible();

});