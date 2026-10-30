#!/usr/bin/env node
// ตรวจว่าตั้งค่าครบหรือยัง
//
//   node scripts/doctor.mjs          ตรวจอย่างเดียว
//   node scripts/doctor.mjs --init   คัดลอกไฟล์ตัวอย่างไปเป็นไฟล์จริง (เฉพาะไฟล์ที่ยังไม่มี)
import { copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { PATHS, ROOT } from './lib/paths.mjs';

const init = process.argv.includes('--init');

const TEMPLATES = [
  [path.join(ROOT, 'config', 'profile.example.yml'), PATHS.profile],
  [path.join(ROOT, 'config', 'portals.example.yml'), PATHS.portals],
  [path.join(ROOT, 'modes', '_profile.template.md'), PATHS.profileMode],
];

if (init) {
  for (const [from, to] of TEMPLATES) {
    if (!existsSync(to)) {
      copyFileSync(from, to);
      console.log(`📋 สร้าง ${path.relative(ROOT, to)} จากไฟล์ตัวอย่าง`);
    }
  }
}

const checks = [];
const check = (ok, label, fix) => checks.push({ ok, label, fix });

const [major] = process.versions.node.split('.').map(Number);
check(major >= 20, `Node.js ${process.versions.node}`, 'ติดตั้ง Node.js 20 ขึ้นไป');
check(existsSync(path.join(ROOT, 'node_modules', 'js-yaml')), 'ติดตั้ง dependencies แล้ว', 'npm install');

let chromiumOk = false;
try {
  const { chromium } = await import('playwright');
  chromiumOk = existsSync(chromium.executablePath());
} catch {
  // playwright ยังไม่ได้ติดตั้ง จะถูกรายงานในข้อด้านล่าง
}
check(chromiumOk, 'Chromium สำหรับสร้าง PDF', 'npx playwright install chromium');

check(existsSync(PATHS.cv), 'cv.md', 'สร้าง cv.md (ดูรูปแบบใน templates/cv.example.md) หรือให้ AI ช่วยแปลง CV');
check(existsSync(PATHS.profile), 'config/profile.yml', 'node scripts/doctor.mjs --init');
check(existsSync(PATHS.portals), 'config/portals.yml', 'node scripts/doctor.mjs --init');
check(existsSync(PATHS.profileMode), 'modes/_profile.md', 'node scripts/doctor.mjs --init');

for (const { ok, label, fix } of checks) {
  console.log(ok ? `✅ ${label}` : `❌ ${label}  →  ${fix}`);
}
const missing = checks.filter((c) => !c.ok).length;
console.log(missing ? `\nยังขาด ${missing} อย่าง` : '\nพร้อมใช้งาน 🎉');
process.exit(missing ? 1 : 0);
