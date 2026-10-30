import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { checkFacts } from '../scripts/lib/fact-check.mjs';
import { renderCv } from '../scripts/lib/render-cv.mjs';

const cv = readFileSync(new URL('../templates/cv.example.md', import.meta.url), 'utf8');
const payload = JSON.parse(readFileSync(new URL('../templates/cv-payload.example.json', import.meta.url), 'utf8'));
const template = readFileSync(new URL('../templates/cv.html', import.meta.url), 'utf8');

test('payload ตัวอย่างผ่าน fact-check กับ cv ตัวอย่าง', () => {
  assert.deepEqual(checkFacts(payload, cv), { errors: [], warnings: [] });
});

test('บริษัทที่ไม่มีใน cv.md เป็น error', () => {
  const fake = { ...payload, experience: [{ ...payload.experience[0], company: 'Google' }] };
  assert.equal(checkFacts(fake, cv).errors.length, 1);
});

test('ตัวเลขที่แต่งเพิ่มเป็น warning', () => {
  const job = { ...payload.experience[0], bullets: ['Cut latency by 90%', 'Served 2M requests/day'] };
  const { warnings } = checkFacts({ ...payload, experience: [job] }, cv);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /90%/);
});

test('renderCv escape HTML และไม่ตีความ $& เป็นคำสั่งพิเศษ', () => {
  const html = renderCv({ ...payload, summary: 'Saved $& costs <script>' }, template);
  assert.match(html, /Saved \$&amp; costs &lt;script&gt;/);
  assert.doesNotMatch(html, /\{\{BODY\}\}/);
});
