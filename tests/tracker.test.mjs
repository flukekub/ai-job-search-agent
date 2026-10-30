import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findDuplicate, formatTracker, nextNumber, parseTracker } from '../scripts/lib/tracker.mjs';
import { normalizeUrl } from '../scripts/lib/url.mjs';
import { normalizeState } from '../scripts/lib/states.mjs';

const row = (over = {}) => ({
  num: 1,
  date: '2026-10-30',
  company: 'Agoda',
  role: 'Backend Engineer',
  score: '4.2/5',
  status: 'Evaluated',
  url: 'https://job-boards.greenhouse.io/agoda/jobs/1',
  report: '[001](../reports/001-agoda-2026-10-30.md)',
  notes: 'good fit',
  ...over,
});

test('format แล้ว parse กลับได้ข้อมูลเดิม และเรียงตามเลข', () => {
  const rows = [row({ num: 2, company: 'B' }), row()];
  const parsed = parseTracker(formatTracker(rows));
  assert.deepEqual(parsed.map((r) => r.num), [1, 2]);
  assert.deepEqual(parsed[0], row());
});

test('เครื่องหมาย | ในข้อความไม่ทำให้ตารางแตก', () => {
  const parsed = parseTracker(formatTracker([row({ notes: 'a | b' })]));
  assert.equal(parsed[0].notes, 'a / b');
});

test('หางานซ้ำด้วย URL แม้ต่างกันที่ utm และ / ท้าย', () => {
  const rows = [row()];
  const dup = findDuplicate(rows, { url: 'https://JOB-BOARDS.greenhouse.io/agoda/jobs/1/?utm_source=x' });
  assert.equal(dup?.num, 1);
});

test('หางานซ้ำด้วยบริษัท + ตำแหน่ง เมื่อไม่มี URL', () => {
  const rows = [row({ url: '' })];
  assert.equal(findDuplicate(rows, { company: 'agoda', role: 'backend engineer' })?.num, 1);
  assert.equal(findDuplicate(rows, { company: 'agoda', role: 'Data Engineer' }), null);
});

test('เลขถัดไปนับทั้งจาก tracker และไฟล์ใน reports/', () => {
  assert.equal(nextNumber([row({ num: 3 })], ['007-x-2026-10-30.md', '.gitkeep']), 8);
  assert.equal(nextNumber([], []), 1);
});

test('normalizeUrl คง query ที่ไม่ใช่ tracking ไว้', () => {
  assert.equal(normalizeUrl('https://x.com/jobs?id=5&utm_medium=a#top'), 'https://x.com/jobs?id=5');
  assert.equal(normalizeUrl('not a url'), '');
});

test('สถานะรับแบบไม่สนตัวพิมพ์ และปฏิเสธค่าที่ไม่รู้จัก', () => {
  assert.equal(normalizeState('applied'), 'Applied');
  assert.equal(normalizeState('skip'), 'SKIP');
  assert.equal(normalizeState('Applied 2026-10-30'), null);
});
