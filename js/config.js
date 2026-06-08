// ============================================================
//  config.js
//  ไฟล์ตั้งค่ากลางของ Frontend
//  ทุกหน้าต้อง <script src="js/config.js"> ก่อนไฟล์อื่นเสมอ
// ============================================================

const CONFIG = {

  // ── URL ของ Apps Script Web App ─────────────────────────
  // ห้ามแก้ไขส่วนอื่น แก้เฉพาะบรรทัดนี้เมื่อ deploy ใหม่
  API_URL: 'https://script.google.com/macros/s/AKfycbzW9HEdDUyXxZxsYAAVjrcRF__kixAJrJbRKRcoRcNVEv4cbalOgrd0LTp5pdnCfMap/exec',

  // ── ชื่อเว็บที่แสดงบน header ────────────────────────────
  SITE_NAME: 'ห้องเรียนสะอาด',

  // ── หัวข้อย่อยทั้ง 7 ข้อ (ใช้แสดงใน input.html) ────────
  CRITERIA: [
    'สภาพห้องโดยรวม',
    'ถังขยะในห้อง',
    'กระดานหน้าห้อง',
    'เพดานห้อง',
    'พื้นห้องเรียน',
    'พัดลมเพดาน',
    'โต๊ะครู / โต๊ะนักเรียน'
  ],

  // ── คะแนนสูงสุดต่อหัวข้อ ────────────────────────────────
  MAX_SCORE_PER_CRITERIA: 3,

  // ── คะแนนรวมสูงสุด (7 x 3) ──────────────────────────────
  MAX_TOTAL_SCORE: 21,

  // ── ป้ายเหรียญ (ใช้แสดงผลในตาราง) ─────────────────────
  MEDAL_LABEL: {
    gold  : '🥇 ทอง',
    silver: '🥈 เงิน',
    bronze: '🥉 ทองแดง',
    none  : '-'
  },

  // ── สีเหรียญ (ใช้ใน CSS class) ──────────────────────────
  MEDAL_CLASS: {
    gold  : 'medal-gold',
    silver: 'medal-silver',
    bronze: 'medal-bronze',
    none  : ''
  },

  // ── ระดับชั้นทั้งหมด (ใช้ใน dropdown filter) ────────────
  CLASS_LEVELS: ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'],

  // ── path ของแต่ละหน้า ────────────────────────────────────
  // ใช้ navigate() ใน auth.js แทนการพิมพ์ path เอง
  PAGES: {
    HOME  : 'index.html',
    LOGIN : 'login.html',
    INPUT : 'input.html',
    REPORT: 'report.html'
  }

};
