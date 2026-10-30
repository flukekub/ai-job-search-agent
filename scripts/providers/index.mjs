// ทะเบียน provider: อยากเพิ่มแหล่งงานใหม่ ให้สร้างไฟล์ที่มี { id, detect, list, getJob } แล้วเพิ่มลงในลิสต์นี้
import ashby from './ashby.mjs';
import greenhouse from './greenhouse.mjs';
import lever from './lever.mjs';

export const PROVIDERS = [greenhouse, lever, ashby];

// คืน { provider, slug, jobId } ของ provider แรกที่รู้จัก URL นี้ หรือ null ถ้าไม่มีใครรู้จัก
export function detectProvider(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  for (const provider of PROVIDERS) {
    const hit = provider.detect(parsed.toString());
    if (hit) return { provider, ...hit };
  }
  return null;
}
