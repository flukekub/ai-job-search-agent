// เรียก JSON API สาธารณะ: คืน null เมื่อเจอ 404/410 (ถือว่าประกาศปิดแล้ว) และ throw เมื่อเจอ error อื่น

// บอร์ดใหญ่บางที่ (เช่น Lever ที่มีงานหลายร้อยตำแหน่ง) ส่งข้อมูลหลาย MB และช้ามาก
const TIMEOUT_MS = 120_000;

export async function getJson(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') throw new Error(`อนุญาตเฉพาะ https: ${url}`);

  const res = await fetch(parsed, {
    headers: { 'User-Agent': 'my-career-ops/0.1 (personal job search)', Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 404 || res.status === 410) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status} จาก ${parsed.host}`);
  return res.json();
}
