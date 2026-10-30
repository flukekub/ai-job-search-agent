#!/usr/bin/env node
// สแกนบอร์ดงานของบริษัทใน config/portals.yml แล้วเพิ่มงานใหม่ที่ผ่านตัวกรองลง data/pipeline.md
// ไม่เรียก AI เลย ใช้แค่ API สาธารณะของ ATS
//
//   node scripts/scan.mjs                 สแกนทุกบริษัทที่ enabled
//   node scripts/scan.mjs --company agoda สแกนบริษัทเดียว
//   node scripts/scan.mjs --dry-run       แสดงผลอย่างเดียว ไม่เขียนไฟล์
import { appendFileSync, existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { readText, readYaml, today, writeAtomic } from './lib/files.mjs';
import { isFresh, matchLocation, matchTitle } from './lib/filters.mjs';
import { PATHS } from './lib/paths.mjs';
import { addPending } from './lib/pipeline.mjs';
import { parseTracker } from './lib/tracker.mjs';
import { normalizeUrl } from './lib/url.mjs';
import { detectProvider } from './providers/index.mjs';

const { values: args } = parseArgs({
  options: { company: { type: 'string' }, 'dry-run': { type: 'boolean', default: false } },
});

const portals = readYaml(PATHS.portals);
const companies = (portals.companies ?? []).filter(
  (c) => c.enabled !== false && (!args.company || c.name.toLowerCase().includes(args.company.toLowerCase())),
);

// URL ที่เคยเห็นแล้ว (จากประวัติการสแกน + tracker) จะไม่ถูกเพิ่มซ้ำ
const seen = new Set([
  ...readText(PATHS.scanHistory).split('\n').map((line) => normalizeUrl(line.split('\t')[0])),
  ...parseTracker(readText(PATHS.tracker)).map((row) => normalizeUrl(row.url)),
]);

const stats = { companies: 0, total: 0, title: 0, location: 0, age: 0, seen: 0, errors: 0 };
const found = [];
const CONCURRENCY = 4; // ยิงพร้อมกันทีละ 4 บริษัท: เร็วขึ้นโดยไม่รบกวน API มากเกินไป

async function scanCompany(company) {
  const hit = detectProvider(company.careers_url);
  if (!hit) {
    console.warn(`⚠️  ${company.name}: ไม่รู้จัก ATS ของ ${company.careers_url} (รองรับ Greenhouse / Lever / Ashby)`);
    return;
  }
  let jobs;
  try {
    jobs = await hit.provider.list(hit.slug);
  } catch (err) {
    stats.errors++;
    console.warn(`⚠️  ${company.name}: ${err.message}`);
    return;
  }
  stats.companies++;
  stats.total += jobs.length;

  for (const job of jobs) {
    job.company = company.name;
    if (!matchTitle(job.title, portals.title_filter)) stats.title++;
    else if (!matchLocation(job.location, portals.location_filter)) stats.location++;
    else if (!isFresh(job.postedAt, portals.max_posting_age_days)) stats.age++;
    else if (seen.has(normalizeUrl(job.url))) stats.seen++;
    else found.push(job);
  }
  console.log(`✓ ${company.name} (${hit.provider.id}): ${jobs.length} งาน`);
}

const queue = [...companies];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await scanCompany(queue.shift());
  }),
);

console.log(`
สแกน ${stats.companies} บริษัท · ${stats.total} งาน
  ตกตัวกรองชื่อตำแหน่ง ${stats.title} · สถานที่ ${stats.location} · เก่าเกิน ${stats.age} · เคยเห็นแล้ว ${stats.seen} · error ${stats.errors}
  🆕 งานใหม่ ${found.length} งาน`);
for (const job of found) console.log(`   - ${job.company} | ${job.title} | ${job.location || '-'}\n     ${job.url}`);

if (args['dry-run'] || found.length === 0) process.exit(0);

const { text, added } = addPending(readText(PATHS.pipeline), found);
writeAtomic(PATHS.pipeline, text);

const date = today();
if (!existsSync(PATHS.scanHistory)) appendFileSync(PATHS.scanHistory, 'url\tdate\tcompany\ttitle\n');
appendFileSync(
  PATHS.scanHistory,
  added.map((job) => `${job.url}\t${date}\t${job.company}\t${job.title}`).join('\n') + '\n',
);
console.log(`\nเพิ่ม ${added.length} งานลง data/pipeline.md แล้ว`);
