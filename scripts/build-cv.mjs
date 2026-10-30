#!/usr/bin/env node
// สร้าง CV เป็น PDF จาก payload JSON ที่ AI เตรียมให้ (ดูรูปแบบใน templates/cv-payload.example.json)
//
//   node scripts/build-cv.mjs output/cv-001-acme.json            ได้ output/cv-001-acme.pdf
//   node scripts/build-cv.mjs payload.json --html-only           ได้แค่ HTML ไว้ดูก่อน
//   node scripts/build-cv.mjs payload.json --force               สร้างแม้ fact-check ไม่ผ่าน (ไม่แนะนำ)
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { checkFacts } from './lib/fact-check.mjs';
import { readText, readYaml, writeAtomic } from './lib/files.mjs';
import { PATHS } from './lib/paths.mjs';
import { renderCv } from './lib/render-cv.mjs';

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string' },
    'html-only': { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
  },
});

const payloadPath = positionals[0];
if (!payloadPath) {
  console.error('ใช้: node scripts/build-cv.mjs <payload.json> [--out file.pdf] [--html-only] [--force]');
  process.exit(1);
}

const payload = JSON.parse(readFileSync(payloadPath, 'utf8'));

// 1) ด่านกันการแต่งข้อมูล
const cvText = readText(PATHS.cv);
if (!cvText) {
  console.error('❌ ไม่พบ cv.md จึงตรวจข้อเท็จจริงไม่ได้');
  process.exit(1);
}
const { errors, warnings } = checkFacts(payload, cvText);
for (const w of warnings) console.warn(`⚠️  ${w}`);
for (const err of errors) console.error(`❌ ${err}`);
if (errors.length && !args.force) {
  console.error('\nหยุดสร้าง PDF: มีข้อมูลที่ไม่มีใน cv.md (ใช้ --force ถ้ามั่นใจว่าถูก)');
  process.exit(1);
}

// 2) JSON → HTML
const pdfPath = path.resolve(args.out ?? payloadPath.replace(/\.json$/i, '') + '.pdf');
const htmlPath = pdfPath.replace(/\.pdf$/i, '.html');
const html = renderCv(payload, readFileSync(PATHS.cvTemplate, 'utf8'));
writeAtomic(htmlPath, html);
console.log(`📄 HTML: ${path.relative(process.cwd(), htmlPath)}`);
if (args['html-only']) process.exit(0);

// 3) HTML → PDF ด้วย Chromium (Playwright)
const profile = existsSync(PATHS.profile) ? readYaml(PATHS.profile) : {};
const { chromium } = await import('playwright');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({ path: pdfPath, format: profile.cv?.paper ?? 'A4', printBackground: true });
} finally {
  await browser.close();
}
console.log(`✅ PDF: ${path.relative(process.cwd(), pdfPath)}`);
