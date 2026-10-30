#!/usr/bin/env node
// ดึง JD ของประกาศหนึ่งตำแหน่งผ่าน API และเช็กว่ายังเปิดรับอยู่ไหมไปในตัว
//
//   node scripts/fetch-jd.mjs <url> [--json]
//
// exit code:  0 = ได้ JD (ประกาศยังเปิด)
//             2 = ไม่รู้จัก ATS นี้ → ให้ AI เปิดหน้าเว็บเอง หรือขอให้ผู้ใช้วาง JD
//             3 = API ตอบว่าไม่มีงานนี้แล้ว → ประกาศปิด
//             1 = error อื่น (เน็ต, API ล่ม) → สถานะยังไม่ยืนยัน
import { parseArgs } from 'node:util';
import { detectProvider } from './providers/index.mjs';

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: { json: { type: 'boolean', default: false } },
});

const url = positionals[0];
if (!url) {
  console.error('ใช้: node scripts/fetch-jd.mjs <url> [--json]');
  process.exit(1);
}

const hit = detectProvider(url);
if (!hit || !hit.jobId) {
  console.error('unsupported: ไม่ใช่ URL งานเดี่ยวของ Greenhouse / Lever / Ashby');
  process.exit(2);
}

try {
  const job = await hit.provider.getJob(hit.slug, hit.jobId);
  if (!job) {
    console.error('closed: API ไม่พบประกาศนี้แล้ว');
    process.exit(3);
  }
  if (args.json) {
    console.log(JSON.stringify({ status: 'active', provider: hit.provider.id, ...job }, null, 2));
  } else {
    console.log(`# ${job.title}\n\n**Company:** ${job.company}\n**Location:** ${job.location || '-'}\n**URL:** ${job.url}\n\n${job.description}`);
  }
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}
