// ตัวกรองงานของ scanner ตามที่ตั้งไว้ใน config/portals.yml

const lower = (s) => String(s ?? '').toLowerCase();

// ผ่านเมื่อชื่อตำแหน่งมีคำใน positive อย่างน้อย 1 คำ และไม่มีคำใน negative เลย
// ถ้า positive ว่าง ให้ทุกชื่อผ่าน
export function matchTitle(title, { positive = [], negative = [] } = {}) {
  const t = lower(title);
  if (negative.some((word) => t.includes(lower(word)))) return false;
  return positive.length === 0 || positive.some((word) => t.includes(lower(word)));
}

// ถ้า allow ว่าง ให้ทุกที่ผ่าน ถ้าประกาศไม่ระบุสถานที่ ก็ให้ผ่าน (ดีกว่าทิ้งงานจริงไป)
export function matchLocation(location, { allow = [] } = {}) {
  if (allow.length === 0 || !location) return true;
  const loc = lower(location);
  return allow.some((place) => loc.includes(lower(place)));
}

export function isFresh(postedAt, maxAgeDays, now = Date.now()) {
  if (!maxAgeDays || !postedAt) return true;
  return now - postedAt <= maxAgeDays * 24 * 60 * 60 * 1000;
}
