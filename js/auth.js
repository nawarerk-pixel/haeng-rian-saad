// ============================================================
//  auth.js
//  จัดการ Token และสถานะ Login ฝั่ง Browser
//  - saveSession()   : เก็บ token หลัง login สำเร็จ
//  - getSession()    : ดึงข้อมูล session ปัจจุบัน
//  - clearSession()  : ลบ session ออก (logout)
//  - isLoggedIn()    : ตรวจว่า login อยู่ไหม
//  - requireLogin()  : บังคับ redirect ไป login.html ถ้ายังไม่ login
//  - requireGuest()  : ถ้า login อยู่แล้วให้ redirect ไป input.html
//  - navigate()      : เปลี่ยนหน้าเว็บ
//
//  Token เก็บใน sessionStorage → ปิด browser แล้วหายอัตโนมัติ
// ============================================================

const SESSION_KEY = 'haeng_rian_session';

// ============================================================
//  saveSession(token, inspector_id, display_name)
//  เก็บข้อมูล session หลัง login สำเร็จ
// ============================================================
function saveSession(token, inspector_id, display_name) {
  const session = { token, inspector_id, display_name };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// ============================================================
//  getSession()
//  ดึงข้อมูล session ปัจจุบัน
//  คืนค่า: { token, inspector_id, display_name } หรือ null
// ============================================================
function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ============================================================
//  clearSession()
//  ลบ session ออกจาก browser (ใช้ตอน logout)
// ============================================================
function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// ============================================================
//  isLoggedIn()
//  ตรวจว่ามี session อยู่ไหม
//  คืนค่า: true / false
// ============================================================
function isLoggedIn() {
  return getSession() !== null;
}

// ============================================================
//  requireLogin()
//  ใช้บนหน้าที่ต้อง login เท่านั้น (input.html)
//  ถ้ายังไม่ login → redirect ไป login.html ทันที
//  คืนค่า: session object (ถ้า login อยู่แล้ว)
// ============================================================
function requireLogin() {
  const session = getSession();
  if (!session) {
    navigate(CONFIG.PAGES.LOGIN);
    return null;
  }
  return session;
}

// ============================================================
//  requireGuest()
//  ใช้บนหน้า login.html
//  ถ้า login อยู่แล้ว → redirect ไป input.html ทันที
//  ป้องกันไม่ให้เด็กสภาที่ login แล้วเข้าหน้า login ซ้ำ
// ============================================================
function requireGuest() {
  if (isLoggedIn()) {
    navigate(CONFIG.PAGES.INPUT);
  }
}

// ============================================================
//  navigate(page)
//  เปลี่ยนหน้าเว็บ
//  รับ path จาก CONFIG.PAGES เสมอ เพื่อไม่ให้พิมพ์ผิด
//
//  ตัวอย่าง:
//  navigate(CONFIG.PAGES.LOGIN)   → ไปหน้า login.html
//  navigate(CONFIG.PAGES.REPORT)  → ไปหน้า report.html
// ============================================================
function navigate(page) {
  window.location.href = page;
}

// ============================================================
//  logout()
//  ล้าง session แล้วกลับหน้าหลัก
//  เรียกใช้จากปุ่ม logout ในทุกหน้า
// ============================================================
async function logout() {
  const session = getSession();
  if (session) {
    // แจ้ง Apps Script ให้ลบ token ด้วย (best effort ไม่ต้องรอผล)
    try {
      await API.post({ action: 'logout', token: session.token });
    } catch (_) {
      // ถ้า network ล้มเหลวก็ logout ฝั่ง browser ได้เลย
    }
  }
  clearSession();
  navigate(CONFIG.PAGES.HOME);
}
