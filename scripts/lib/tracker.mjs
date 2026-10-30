// อ่าน/เขียนตาราง tracker (data/applications.md) แบบ pure function เพื่อให้ทดสอบได้
import { normalizeUrl } from './url.mjs';

export const COLUMNS = ['num', 'date', 'company', 'role', 'score', 'status', 'url', 'report', 'notes'];
const HEADERS = ['#', 'Date', 'Company', 'Role', 'Score', 'Status', 'URL', 'Report', 'Notes'];

const TITLE = '# Applications Tracker';

function cell(value) {
  // เครื่องหมาย | จะทำให้ตาราง Markdown แตก จึงต้องแทนที่
  return String(value ?? '').replace(/\|/g, '/').replace(/\s*\n\s*/g, ' ').trim();
}

export function parseTracker(text) {
  const rows = [];
  for (const line of String(text ?? '').split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells[0] === '#' || /^-+$/.test(cells[0])) continue; // หัวตาราง / เส้นคั่น
    if (cells.length < COLUMNS.length) continue;
    const row = Object.fromEntries(COLUMNS.map((key, i) => [key, cells[i]]));
    row.num = Number(row.num);
    rows.push(row);
  }
  return rows;
}

export function formatTracker(rows) {
  const sorted = [...rows].sort((a, b) => a.num - b.num);
  const lines = [
    TITLE,
    '',
    `| ${HEADERS.join(' | ')} |`,
    `|${HEADERS.map(() => '---').join('|')}|`,
    ...sorted.map((row) => `| ${COLUMNS.map((key) => cell(row[key])).join(' | ')} |`),
  ];
  return `${lines.join('\n')}\n`;
}

function sameText(a, b) {
  const norm = (s) => String(s ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return norm(a) !== '' && norm(a) === norm(b);
}

// หาแถวที่น่าจะเป็นงานเดียวกัน: เทียบ URL ก่อน ถ้าไม่มีค่อยเทียบ บริษัท + ตำแหน่ง
export function findDuplicate(rows, { url, company, role }) {
  const key = normalizeUrl(url);
  if (key) {
    const byUrl = rows.find((row) => normalizeUrl(row.url) === key);
    if (byUrl) return byUrl;
  }
  return rows.find((row) => sameText(row.company, company) && sameText(row.role, role)) ?? null;
}

export function nextNumber(rows, reportFiles = []) {
  const fromRows = rows.map((row) => row.num).filter(Number.isFinite);
  const fromReports = reportFiles.map((file) => parseInt(file, 10)).filter(Number.isFinite);
  return Math.max(0, ...fromRows, ...fromReports) + 1;
}

export function padNum(n) {
  return String(n).padStart(3, '0');
}
