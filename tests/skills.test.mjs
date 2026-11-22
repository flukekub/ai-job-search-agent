import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { test } from 'node:test';

const SOURCE = '.agents/skills/job/SKILL.md';
// ที่อื่นที่ agent อ่าน skill ต้องได้ไฟล์เดียวกัน (symlink หรือสำเนาที่ตรงกัน)
const MIRRORS = ['.claude/skills/job/SKILL.md'];

test('skill job มี frontmatter name + description', () => {
  const fm = readFileSync(SOURCE, 'utf8').match(/^---\n([\s\S]*?)\n---/);
  assert.ok(fm, 'ไม่มี frontmatter');
  assert.match(fm[1], /^name: job$/m);
  assert.match(fm[1], /^description: .+/m);
});

test('ทุกโฟลเดอร์ skill ชี้ไปที่ไฟล์เดียวกัน หรือเนื้อหาตรงกัน', () => {
  for (const p of MIRRORS) {
    const same = realpathSync(p) === realpathSync(SOURCE)
      || readFileSync(p, 'utf8') === readFileSync(SOURCE, 'utf8');
    assert.ok(same, `${p} ไม่ตรงกับ ${SOURCE}`);
  }
});

test('modes และ AGENTS.md ไม่อ้างชื่อเครื่องมือเฉพาะของ Claude', () => {
  for (const f of ['AGENTS.md', 'modes/evaluate.md', 'modes/scan.md', 'modes/pipeline.md', 'modes/pdf.md', 'modes/tracker.md', 'modes/_shared.md']) {
    assert.doesNotMatch(readFileSync(f, 'utf8'), /WebFetch/, f);
  }
});
