#!/usr/bin/env node
// จัดการกล่องรับงาน data/pipeline.md
//
//   node scripts/pipeline.mjs list               แสดงงานที่รอประเมิน
//   node scripts/pipeline.mjs add <url>          เพิ่ม URL ที่เจอเอง
//   node scripts/pipeline.mjs done <url> [note]  ย้ายไป Processed เช่น note = "#012 4.2/5" หรือ "closed"
import { readText, writeAtomic } from './lib/files.mjs';
import { PATHS } from './lib/paths.mjs';
import { addPending, markDone, parsePipeline } from './lib/pipeline.mjs';

const [command, url, ...noteParts] = process.argv.slice(2);
const text = readText(PATHS.pipeline);

switch (command) {
  case 'list': {
    const pending = parsePipeline(text).filter((item) => !item.done);
    if (pending.length === 0) console.log('(ไม่มีงานค้าง)');
    for (const item of pending) console.log(`${item.url}${item.rest}`);
    break;
  }

  case 'add': {
    if (!url) throw new Error('ต้องระบุ URL');
    const result = addPending(text, [{ url, company: '?', title: '?', location: '' }]);
    writeAtomic(PATHS.pipeline, result.text);
    console.log(result.added.length ? '✅ เพิ่มแล้ว' : '↺ มี URL นี้อยู่แล้ว');
    break;
  }

  case 'done': {
    if (!url) throw new Error('ต้องระบุ URL');
    const result = markDone(text, url, noteParts.join(' '));
    if (result.moved) writeAtomic(PATHS.pipeline, result.text);
    console.log(result.moved ? '✅ ย้ายไป Processed แล้ว' : '(ไม่พบ URL นี้ใน Pending)');
    break;
  }

  default:
    console.log('ใช้: pipeline.mjs list | add <url> | done <url> [note]');
    process.exit(command ? 1 : 0);
}
