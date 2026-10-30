// ตำแหน่งไฟล์ทั้งหมดของโปรเจค รวมไว้ที่เดียว สคริปต์อื่นจะได้ไม่ต้องประกอบ path เอง
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const PATHS = {
  cv: path.join(ROOT, 'cv.md'),
  profile: path.join(ROOT, 'config', 'profile.yml'),
  portals: path.join(ROOT, 'config', 'portals.yml'),
  profileMode: path.join(ROOT, 'modes', '_profile.md'),
  tracker: path.join(ROOT, 'data', 'applications.md'),
  pipeline: path.join(ROOT, 'data', 'pipeline.md'),
  scanHistory: path.join(ROOT, 'data', 'scan-history.tsv'),
  reports: path.join(ROOT, 'reports'),
  output: path.join(ROOT, 'output'),
  cvTemplate: path.join(ROOT, 'templates', 'cv.html'),
};
