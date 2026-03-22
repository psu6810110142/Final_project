import { test, expect, type Page } from '@playwright/test';

// ============================================================
// ⚙️ ตั้งค่า — แก้ค่าเหล่านี้ให้ตรงกับ environment จริงzsc
// ============================================================
const BASE_URL = 'http://localhost:5173';
const ADMIN_USERNAME = 'admin';         // username หรือ email ของ ADMIN
const ADMIN_PASSWORD = 'admin1234';     // password ของ ADMIN

// ============================================================
// Helper: login ก่อนแต่ละ test
// ============================================================
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByPlaceholder('กรอกอีเมล หรือ Username ของคุณ').fill(ADMIN_USERNAME);
  await page.getByPlaceholder('กรอกรหัสผ่านของคุณ').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  // รอให้ redirect ไปหน้า Admin Dashboard
  await page.waitForURL(`${BASE_URL}/manage-courses`);
}

// ============================================================
// 🔐 TEST 1 — Login เป็น ADMIN สำเร็จ
// ============================================================
test('ADMIN: login สำเร็จและไปหน้า Admin Dashboard', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.getByPlaceholder('กรอกอีเมล หรือ Username ของคุณ').fill(ADMIN_USERNAME);
  await page.getByPlaceholder('กรอกรหัสผ่านของคุณ').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

  // หลัง login ต้องไปหน้า /manage-courses และเห็น ADMIN PANEL
  await expect(page).toHaveURL(`${BASE_URL}/manage-courses`);
  await expect(page.getByText('ADMIN PANEL')).toBeVisible();
});

// ============================================================
// 📚 TEST 2 — เพิ่มคอร์สใหม่
// ============================================================
test('ADMIN: เพิ่มคอร์สใหม่สำเร็จ', async ({ page }) => {
  await loginAsAdmin(page);

  // คลิก tab "จัดการคอร์สเรียน" ใน sidebar
  await page.getByText('จัดการคอร์สเรียน').click();
  await expect(page.getByRole('heading', { name: /จัดการคอร์สเรียน/ })).toBeVisible();

  // คลิกปุ่ม "เพิ่มคอร์สใหม่"
  await page.getByRole('button', { name: 'เพิ่มคอร์สใหม่' }).click();

  // รอ modal เปิด
  await expect(page.getByRole('heading', { name: 'เพิ่มคอร์สใหม่' })).toBeVisible();

  // กรอกข้อมูลคอร์ส
  await page.getByLabel('ชื่อคอร์ส *').fill('คอร์สทดสอบ Playwright E2E');
  await page.getByLabel('รายละเอียด').fill('คอร์สนี้สร้างจาก automated test');
  await page.getByLabel('ราคา (บาท)').fill('990');
  await page.getByLabel('ระยะเวลา (สัปดาห์)').fill('8');

  // กดบันทึก
  await page.getByRole('button', { name: 'บันทึก' }).click();

  // modal ต้องปิดและเห็นคอร์สใหม่ในหน้า
  await expect(page.getByRole('heading', { name: 'เพิ่มคอร์สใหม่' })).not.toBeVisible();
  await expect(page.getByText('คอร์สทดสอบ Playwright E2E')).toBeVisible();
});

// ============================================================
// ✏️ TEST 3 — แก้ไขคอร์ส
// ============================================================
test('ADMIN: แก้ไขคอร์สสำเร็จ', async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByText('จัดการคอร์สเรียน').click();
  await expect(page.getByRole('heading', { name: /จัดการคอร์สเรียน/ })).toBeVisible();

  // คลิกปุ่ม "แก้ไข" ของคอร์สแรกที่มีอยู่
  await page.getByRole('button', { name: 'แก้ไข' }).first().click();

  // รอ modal แก้ไขเปิด
  await expect(page.getByRole('heading', { name: 'แก้ไขคอร์ส' })).toBeVisible();

  // แก้ไขชื่อคอร์ส
  const titleInput = page.getByLabel('ชื่อคอร์ส *');
  await titleInput.clear();
  await titleInput.fill('คอร์สที่แก้ไขแล้ว (Playwright)');

  // กดบันทึก
  await page.getByRole('button', { name: 'บันทึก' }).click();

  // modal ต้องปิด
  await expect(page.getByRole('heading', { name: 'แก้ไขคอร์ส' })).not.toBeVisible();
});

// ============================================================
// 🗑️ TEST 4 — ลบคอร์ส
// ============================================================
test('ADMIN: ลบคอร์สสำเร็จ', async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByText('จัดการคอร์สเรียน').click();
  await expect(page.getByRole('heading', { name: /จัดการคอร์สเรียน/ })).toBeVisible();

  // นับจำนวนคอร์สก่อนลบ
  const deleteButtons = page.locator('button').filter({ hasText: '' }).filter({ has: page.locator('svg') });
  // คลิกปุ่มลบ (ปุ่มสีแดง trash icon) ของคอร์สแรก
  const trashButtons = page.locator('button[style*="ef4444"]');
  const countBefore = await trashButtons.count();
  if (countBefore === 0) {
    test.skip(); // ไม่มีคอร์สให้ลบ
    return;
  }

  await trashButtons.first().click();

  // รอ Confirm Dialog
  await expect(page.getByText('ลบคอร์ส')).toBeVisible();
  await expect(page.getByText(/การลบคอร์สจะลบบทเรียนทั้งหมดด้วย/)).toBeVisible();

  // กดยืนยันลบ
  await page.getByRole('button', { name: 'ลบเลย' }).click();

  // จำนวนคอร์สต้องลดลง 1
  await expect(trashButtons).toHaveCount(countBefore - 1);
});

// ============================================================
// 👨‍🏫 TEST 5 — เพิ่มโปรไฟล์ผู้สอน (Instructor)
// ============================================================
test('ADMIN: เพิ่มโปรไฟล์ผู้สอนสำเร็จ', async ({ page }) => {
  await loginAsAdmin(page);

  // คลิก tab "จัดการผู้สอน"
  await page.getByText('จัดการผู้สอน').click();
  await expect(page.getByRole('heading', { name: /จัดการผู้สอน/ })).toBeVisible();

  // คลิก "เพิ่มโปรไฟล์ผู้สอน"
  await page.getByRole('button', { name: 'เพิ่มโปรไฟล์ผู้สอน' }).click();
  await expect(page.getByRole('heading', { name: 'เพิ่มโปรไฟล์ผู้สอน' })).toBeVisible();

  // กรอกข้อมูล
  await page.getByLabel('ชื่อ - นามสกุล *').fill('อาจารย์ ทดสอบ Playwright');
  await page.getByLabel('วิชาที่สอน').fill('การทดสอบซอฟต์แวร์');
  await page.getByLabel('ช่องทางติดต่อ').fill('test@playwright.dev');
  await page.getByLabel('ประวัติการศึกษา').fill('ป.โท วิศวกรรมคอมพิวเตอร์');
  await page.getByLabel('แนะนำตัว').fill('อาจารย์ที่สร้างโดย Playwright test');

  // กดบันทึก
  await page.getByRole('button', { name: 'บันทึก' }).click();

  // modal ปิด และเห็นชื่ออาจารย์ใหม่
  await expect(page.getByRole('heading', { name: 'เพิ่มโปรไฟล์ผู้สอน' })).not.toBeVisible();
  await expect(page.getByText('อาจารย์ ทดสอบ Playwright')).toBeVisible();
});

// ============================================================
// ✏️ TEST 6 — แก้ไขข้อมูลผู้สอน
// ============================================================
test('ADMIN: แก้ไขข้อมูลผู้สอนสำเร็จ', async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByText('จัดการผู้สอน').click();
  await expect(page.getByRole('heading', { name: /จัดการผู้สอน/ })).toBeVisible();

  // คลิก "แก้ไข" ของผู้สอนคนแรก
  await page.getByRole('button', { name: 'แก้ไข' }).first().click();
  await expect(page.getByRole('heading', { name: 'แก้ไขข้อมูลผู้สอน' })).toBeVisible();

  // แก้ไขวิชาที่สอน
  const subjectInput = page.getByLabel('วิชาที่สอน');
  await subjectInput.clear();
  await subjectInput.fill('Playwright Testing (Updated)');

  await page.getByRole('button', { name: 'บันทึก' }).click();
  await expect(page.getByRole('heading', { name: 'แก้ไขข้อมูลผู้สอน' })).not.toBeVisible();
});

// ============================================================
// 🗑️ TEST 7 — ลบผู้สอน
// ============================================================
test('ADMIN: ลบผู้สอนสำเร็จ', async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByText('จัดการผู้สอน').click();
  await expect(page.getByRole('heading', { name: /จัดการผู้สอน/ })).toBeVisible();

  // คลิกปุ่ม "ลบ" ของผู้สอนคนแรก
  const deleteBtn = page.getByRole('button', { name: 'ลบ' }).first();
  if (await deleteBtn.count() === 0) {
    test.skip();
    return;
  }
  await deleteBtn.click();

  // Confirm Dialog
  await expect(page.getByText('ลบผู้สอน')).toBeVisible();
  await page.getByRole('button', { name: 'ลบเลย' }).click();

  // dialog ต้องปิด
  await expect(page.getByText('ลบผู้สอน')).not.toBeVisible();
});

// ============================================================
// 👩‍🎓 TEST 8 — ค้นหานักเรียน
// ============================================================
test('ADMIN: ค้นหานักเรียนด้วยชื่อ', async ({ page }) => {
  await loginAsAdmin(page);

  // คลิก tab "รายชื่อนักเรียน"
  await page.getByText('รายชื่อนักเรียน').click();
  await expect(page.getByRole('heading', { name: /รายชื่อนักเรียน|นักเรียน/ })).toBeVisible();

  // กรอกในช่องค้นหา
  const searchBox = page.getByPlaceholder(/ค้นหา|search/i);
  await searchBox.fill('a'); // กรอกตัวอักษรเพื่อ filter

  // ตรวจว่า search input มีค่า
  await expect(searchBox).toHaveValue('a');
});

// ============================================================
// ✏️ TEST 9 — แก้ไขข้อมูลนักเรียน
// ============================================================
test('ADMIN: แก้ไขข้อมูลนักเรียนสำเร็จ', async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByText('รายชื่อนักเรียน').click();
  await expect(page.getByRole('heading', { name: /รายชื่อนักเรียน|นักเรียน/ })).toBeVisible();

  // คลิก "แก้ไข" นักเรียนคนแรก
  const editBtn = page.getByRole('button', { name: 'แก้ไข' }).first();
  if (await editBtn.count() === 0) {
    test.skip();
    return;
  }
  await editBtn.click();

  // รอ modal
  await expect(page.locator('.modal-content')).toBeVisible();

  // กดบันทึก (ไม่ต้องแก้ค่าเพิ่ม เพื่อทดสอบว่า flow ทำงานได้)
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await expect(page.locator('.modal-content')).not.toBeVisible();
});

// ============================================================
// 🗑️ TEST 10 — ลบนักเรียน
// ============================================================
test('ADMIN: ลบนักเรียนสำเร็จ', async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByText('รายชื่อนักเรียน').click();
  await expect(page.getByRole('heading', { name: /รายชื่อนักเรียน|นักเรียน/ })).toBeVisible();

  // คลิกปุ่ม "ลบ" นักเรียนคนแรก
  const deleteBtn = page.getByRole('button', { name: 'ลบ' }).first();
  if (await deleteBtn.count() === 0) {
    test.skip();
    return;
  }
  await deleteBtn.click();

  // Confirm Dialog
  await expect(page.getByText('ลบนักเรียน')).toBeVisible();
  await page.getByRole('button', { name: 'ลบเลย' }).click();

  await expect(page.getByText('ลบนักเรียน')).not.toBeVisible();
});
