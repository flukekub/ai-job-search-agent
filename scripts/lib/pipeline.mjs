// กล่องรับงานที่รอประเมิน (data/pipeline.md) แต่ละบรรทัดมีรูปแบบ:
//   - [ ] {url} | {company} | {title} | {location}
import { normalizeUrl } from './url.mjs';

export const EMPTY_PIPELINE = '# Pipeline\n\n## Pending\n\n## Processed\n';

const ITEM_RE = /^- \[( |x)\] (\S+)(.*)$/;

export function parsePipeline(text) {
  const items = [];
  for (const line of String(text || EMPTY_PIPELINE).split('\n')) {
    const m = line.match(ITEM_RE);
    if (m) items.push({ done: m[1] === 'x', url: m[2], rest: m[3], line });
  }
  return items;
}

export function formatItem(job) {
  return `- [ ] ${job.url} | ${job.company} | ${job.title} | ${job.location || '-'}`;
}

// เพิ่มงานใหม่ใต้หัวข้อ ## Pending โดยข้าม URL ที่มีอยู่แล้ว
export function addPending(text, jobs) {
  const base = text || EMPTY_PIPELINE;
  const seen = new Set(parsePipeline(base).map((i) => normalizeUrl(i.url)));
  const fresh = jobs.filter((job) => {
    const key = normalizeUrl(job.url);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (fresh.length === 0) return { text: base, added: [] };
  const lines = base.split('\n');
  const at = lines.findIndex((l) => l.trim() === '## Pending');
  lines.splice(at + 1, 0, ...fresh.map(formatItem));
  return { text: lines.join('\n'), added: fresh };
}

// ย้ายงานจาก Pending ไปไว้ใต้ ## Processed พร้อมหมายเหตุ เช่น "#012 4.2/5" หรือ "closed"
export function markDone(text, url, note = '') {
  const key = normalizeUrl(url);
  const lines = String(text || EMPTY_PIPELINE).split('\n');
  const idx = lines.findIndex((l) => {
    const m = l.match(ITEM_RE);
    return m && m[1] === ' ' && normalizeUrl(m[2]) === key;
  });
  if (idx === -1) return { text, moved: false };
  const [line] = lines.splice(idx, 1);
  const doneLine = line.replace('- [ ]', '- [x]') + (note ? ` — ${note}` : '');
  const at = lines.findIndex((l) => l.trim() === '## Processed');
  if (at === -1) lines.push('', '## Processed', doneLine);
  else lines.splice(at + 1, 0, doneLine);
  return { text: lines.join('\n'), moved: true };
}
