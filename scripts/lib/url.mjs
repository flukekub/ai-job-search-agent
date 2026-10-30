// ทำ URL ให้เป็นรูปแบบมาตรฐาน ใช้เป็น "กุญแจ" กันงานซ้ำ
// ตัด utm/ref, ตัด #fragment, ตัด / ท้าย และทำ host เป็นตัวพิมพ์เล็ก

const TRACKING_PARAMS = /^(utm_.*|ref|source|src|gh_src|lever-source|lever-origin)$/i;

export function normalizeUrl(url) {
  if (!url) return '';
  let u;
  try {
    u = new URL(String(url).trim());
  } catch {
    return '';
  }
  u.hash = '';
  u.hostname = u.hostname.toLowerCase();
  for (const key of [...u.searchParams.keys()]) {
    if (TRACKING_PARAMS.test(key)) u.searchParams.delete(key);
  }
  u.pathname = u.pathname.replace(/\/+$/, '') || '/';
  return u.toString().replace(/\/$/, '');
}
