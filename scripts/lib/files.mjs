import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';

export function readText(file, fallback = '') {
  return existsSync(file) ? readFileSync(file, 'utf8') : fallback;
}

export function readYaml(file) {
  if (!existsSync(file)) throw new Error(`ไม่พบไฟล์ ${file}`);
  return loadYaml(readFileSync(file, 'utf8')) ?? {};
}

// เขียนลงไฟล์ชั่วคราวก่อนแล้วค่อย rename ทับ ถ้าโปรแกรมพังกลางทาง ไฟล์เดิมจะไม่เสียหาย
export function writeAtomic(file, content) {
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, content);
  renameSync(tmp, file);
}

export function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'untitled';
}
