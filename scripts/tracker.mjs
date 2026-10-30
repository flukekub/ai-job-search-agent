#!/usr/bin/env node
// จัดการตาราง tracker (data/applications.md) ห้ามแก้ตารางด้วยมือ ให้ใช้สคริปต์นี้แทน
//
//   node scripts/tracker.mjs list [--status Applied]
//   node scripts/tracker.mjs next-num
//   node scripts/tracker.mjs add --company X --role Y --score 4.2 --url U --report reports/001-x.md [--notes ...]
//   node scripts/tracker.mjs status <#> <State> [--notes ...]
import { mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { readText, today, writeAtomic } from './lib/files.mjs';
import { PATHS } from './lib/paths.mjs';
import { normalizeState, STATES } from './lib/states.mjs';
import { findDuplicate, formatTracker, nextNumber, padNum, parseTracker } from './lib/tracker.mjs';

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    company: { type: 'string' },
    role: { type: 'string' },
    score: { type: 'string' },
    url: { type: 'string' },
    report: { type: 'string' },
    notes: { type: 'string' },
    status: { type: 'string' },
  },
});

const [command, ...rest] = positionals;
const rows = parseTracker(readText(PATHS.tracker));

function save() {
  writeAtomic(PATHS.tracker, formatTracker(rows));
}

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function reportLink(reportPath, num) {
  if (!reportPath) return '—';
  // ลิงก์ต้องอ้างอิงจากโฟลเดอร์ data/ ที่ tracker อยู่ จึงจะกดเปิดได้
  const rel = path.relative(path.dirname(PATHS.tracker), path.resolve(reportPath)).split(path.sep).join('/');
  return `[${padNum(num)}](${rel})`;
}

function parseScore(value) {
  const n = Number(String(value ?? '').replace('/5', ''));
  if (!Number.isFinite(n) || n < 1 || n > 5) fail(`คะแนนต้องอยู่ระหว่าง 1–5 (ได้ "${value}")`);
  return `${n.toFixed(1)}/5`;
}

switch (command) {
  case 'list': {
    const wanted = args.status ? normalizeState(args.status) : null;
    const shown = rows.filter((row) => !wanted || row.status === wanted);
    if (shown.length === 0) console.log('(ยังไม่มีรายการ)');
    for (const row of shown) {
      console.log(`#${padNum(row.num)}  ${row.score.padEnd(6)} ${row.status.padEnd(10)} ${row.company} — ${row.role}`);
    }
    break;
  }

  case 'next-num': {
    mkdirSync(PATHS.reports, { recursive: true });
    console.log(padNum(nextNumber(rows, readdirSync(PATHS.reports))));
    break;
  }

  case 'add': {
    if (!args.company || !args.role || !args.score) fail('ต้องระบุ --company --role --score');
    const score = parseScore(args.score);
    const existing = findDuplicate(rows, args);
    if (existing) {
      // กฎ: งานเดิมห้ามเพิ่มแถวใหม่ ให้อัปเดตแถวเดิมแทน
      existing.score = score;
      if (args.report) existing.report = reportLink(args.report, existing.num);
      if (args.notes) existing.notes = args.notes;
      if (args.url && !existing.url) existing.url = args.url;
      save();
      console.log(`↻ อัปเดตแถวเดิม #${padNum(existing.num)} ${existing.company} — ${existing.role}`);
      break;
    }
    const num = args.report ? parseInt(path.basename(args.report), 10) : nextNumber(rows);
    if (!Number.isFinite(num)) fail('ชื่อไฟล์ report ต้องขึ้นต้นด้วยเลข เช่น reports/001-acme-2026-10-30.md');
    if (rows.some((row) => row.num === num)) fail(`เลข #${padNum(num)} ถูกใช้แล้ว ให้ใช้ next-num`);
    const status = normalizeState(args.status ?? 'Evaluated') ?? fail(`สถานะไม่ถูกต้อง: ${args.status}`);
    rows.push({
      num,
      date: today(),
      company: args.company,
      role: args.role,
      score,
      status,
      url: args.url ?? '',
      report: reportLink(args.report, num),
      notes: args.notes ?? '',
    });
    save();
    console.log(`✅ เพิ่ม #${padNum(num)} ${args.company} — ${args.role} (${score})`);
    break;
  }

  case 'status': {
    const [numText, stateText] = rest;
    const row = rows.find((r) => r.num === Number(numText)) ?? fail(`ไม่พบแถว #${numText}`);
    const state = normalizeState(stateText) ?? fail(`สถานะต้องเป็นหนึ่งใน: ${STATES.join(', ')}`);
    const before = row.status;
    row.status = state;
    if (args.notes) row.notes = row.notes ? `${row.notes}; ${args.notes}` : args.notes;
    save();
    console.log(`✅ #${padNum(row.num)} ${row.company}: ${before} → ${state}`);
    break;
  }

  default:
    console.log('ใช้: tracker.mjs list | next-num | add ... | status <#> <State>');
    console.log(`สถานะที่ใช้ได้: ${STATES.join(', ')}`);
    process.exit(command ? 1 : 0);
}
