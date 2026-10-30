// สถานะที่อนุญาตใน tracker มีได้เท่านี้เท่านั้น เพื่อให้นับสถิติได้ถูกต้อง

export const STATES = [
  'Evaluated', // ประเมินแล้ว รอตัดสินใจ
  'Applied', // สมัครแล้ว
  'Responded', // บริษัทตอบกลับ
  'Interview', // อยู่ระหว่างสัมภาษณ์
  'Offer', // ได้ offer
  'Hired', // ตอบรับแล้ว ได้งาน
  'Rejected', // บริษัทปฏิเสธ
  'Discarded', // เราเลิกเอง หรือประกาศปิด
  'SKIP', // ไม่เหมาะ ไม่สมัคร
];

export function normalizeState(input) {
  const s = String(input ?? '').trim().toLowerCase();
  return STATES.find((state) => state.toLowerCase() === s) ?? null;
}
