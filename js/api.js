// ============================================================
//  api.js
//  ฟังก์ชันกลางสำหรับ fetch ข้อมูลจาก Apps Script
//  ทุกหน้าเรียกใช้ผ่าน API object นี้เท่านั้น
//  ไม่ต้องเขียน fetch() เองในแต่ละหน้า
//
//  วิธีใช้:
//  POST → await API.post({ action: 'login', username, password })
//  GET  → await API.get({ action: 'getRooms' })
// ============================================================

const API = {

  // ============================================================
  //  API._request(makeRequest, retries)
  //  ตัวกลางส่ง request: มี timeout 20 วินาที
  //  และลองใหม่อัตโนมัติถ้า server ตอบกลับมาไม่ใช่ JSON
  //  (เช่น Apps Script ช้า/ไม่ว่าง แล้วตอบเป็นหน้า HTML)
  // ============================================================
  async _request(makeRequest, retries = 2) {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      try {
        const res  = await makeRequest(ctrl.signal);
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (_) {
          throw new Error('server ตอบกลับไม่ใช่ JSON');
        }
      } catch (err) {
        lastErr = err;
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
      } finally {
        clearTimeout(timer);
      }
    }
    throw new Error('เซิร์ฟเวอร์ไม่ว่างหรือตอบช้า กรุณารอสักครู่แล้วลองใหม่ (' + lastErr.message + ')');
  },

  // ============================================================
  //  API.post(body)
  //  ส่ง POST request ไปหา Apps Script
  //
  //  body : object ที่จะส่งไปเป็น JSON
  //
  //  คืนค่า: response object จาก Apps Script
  //  ถ้าเกิด error: throw Error พร้อม message
  // ============================================================
  post(body) {
    return this._request(signal => fetch(CONFIG.API_URL, {
      method : 'POST',
      // Apps Script ต้องการ text/plain ไม่ใช่ application/json
      // เพราะ CORS ของ Google จะ block preflight OPTIONS request
      headers: { 'Content-Type': 'text/plain' },
      body   : JSON.stringify(body),
      signal
    }));
  },

  // ============================================================
  //  API.get(params)
  //  ส่ง GET request ไปหา Apps Script พร้อม query string
  //
  //  params : object ที่จะแปลงเป็น query string
  //  เช่น { action: 'getDailyReport', date: '2025-06-09' }
  //  → ?action=getDailyReport&date=2025-06-09
  //
  //  คืนค่า: response object จาก Apps Script
  // ============================================================
  get(params) {
    const qs = new URLSearchParams(params).toString();
    return this._request(signal => fetch(`${CONFIG.API_URL}?${qs}`, { signal }));
  },

  // ============================================================
  //  API.login(username, password)
  //  shortcut สำหรับ login
  // ============================================================
  async login(username, password) {
    return await this.post({ action: 'login', username, password });
  },

  // ============================================================
  //  API.saveScore(date, room_id, scores)
  //  shortcut สำหรับบันทึกคะแนน
  //  ดึง token จาก session อัตโนมัติ
  // ============================================================
  async saveScore(date, room_id, scores) {
    const session = getSession();
    if (!session) throw new Error('ไม่พบ session กรุณา Login ใหม่');
    return await this.post({
      action : 'saveScore',
      token  : session.token,
      date,
      room_id,
      scores
    });
  },

  // ============================================================
  //  API.getRooms()
  //  ดึงรายชื่อห้องทั้งหมด
  // ============================================================
  async getRooms() {
    return await this.get({ action: 'getRooms' });
  },

  // ============================================================
  //  API.getScoreByDateRoom(date, room_id)
  //  ดึงคะแนนเดิมมา pre-fill ตอนแก้ไข
  // ============================================================
  async getScoreByDateRoom(date, room_id) {
    return await this.get({ action: 'getScoreByDateRoom', date, room_id });
  },

  // ============================================================
  //  API.getDailyReport(date)
  //  สรุปรายวัน (แบบที่ 1)
  // ============================================================
  async getDailyReport(date) {
    return await this.get({ action: 'getDailyReport', date });
  },

  // ============================================================
  //  API.getMonthlyReport(year_month, class_level)
  //  สรุปรายเดือน (แบบที่ 2)
  //  class_level ส่งเป็น '' ถ้าต้องการทุกระดับชั้น
  // ============================================================
  async getMonthlyReport(year_month, class_level = '') {
    return await this.get({ action: 'getMonthlyReport', year_month, class_level });
  },

  // ============================================================
  //  API.getTermReport(start_month, end_month)
  //  สรุปรายภาคเรียน (แบบที่ 3) เลือกช่วงเดือนเอง
  //  start_month / end_month เช่น '2026-05' และ '2026-10'
  // ============================================================
  async getTermReport(start_month, end_month) {
    return await this.get({ action: 'getTermReport', start_month, end_month });
  },

  // ============================================================
  //  API.getAnnouncements()
  //  ดึงประกาศที่เปิดอยู่ (จาก Sheet announcements) ไปแสดงหน้าหลัก
  // ============================================================
  async getAnnouncements() {
    return await this.get({ action: 'getAnnouncements' });
  },

  // ============================================================
  //  API.getSystemStatus()
  //  ดึงสถานะเปิด/ปิดระบบ
  // ============================================================
  async getSystemStatus() {
    return await this.get({ action: 'getSystemStatus' });
  },

  // ============================================================
  //  API.toggleSystem()
  //  เปิด/ปิดระบบ (admin เท่านั้น)
  // ============================================================
  async toggleSystem() {
    const session = getSession();
    if (!session) throw new Error('ไม่พบ session กรุณา Login ใหม่');
    return await this.post({ action: 'toggleSystem', token: session.token });
  },

  // ============================================================
  //  API.getScoreLogs(room_id, date)
  //  ดึงประวัติการแก้ไขคะแนน (admin เท่านั้น)
  // ============================================================
  async getScoreLogs(room_id, date) {
    const session = getSession();
    if (!session) throw new Error('ไม่พบ session กรุณา Login ใหม่');
    return await this.get({ action: 'getScoreLogs', room_id, date, token: session.token });
  }

};
