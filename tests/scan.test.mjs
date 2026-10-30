import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isFresh, matchLocation, matchTitle } from '../scripts/lib/filters.mjs';
import { htmlToText } from '../scripts/lib/html.mjs';
import { addPending, markDone, parsePipeline } from '../scripts/lib/pipeline.mjs';
import { detectProvider } from '../scripts/providers/index.mjs';

const filter = { positive: ['Backend', 'Software Engineer'], negative: ['Intern'] };

test('ตัวกรองชื่อตำแหน่ง', () => {
  assert.equal(matchTitle('Senior Backend Engineer', filter), true);
  assert.equal(matchTitle('Backend Intern', filter), false);
  assert.equal(matchTitle('Product Designer', filter), false);
  assert.equal(matchTitle('Anything', {}), true);
});

test('ตัวกรองสถานที่: รายการว่าง หรือประกาศไม่ระบุสถานที่ ให้ผ่าน', () => {
  assert.equal(matchLocation('Bangkok, Thailand', { allow: ['bangkok'] }), true);
  assert.equal(matchLocation('London', { allow: ['Bangkok'] }), false);
  assert.equal(matchLocation('', { allow: ['Bangkok'] }), true);
  assert.equal(matchLocation('London', {}), true);
});

test('ตัวกรองอายุประกาศ', () => {
  const now = Date.parse('2026-10-30');
  assert.equal(isFresh(Date.parse('2026-10-01'), 45, now), true);
  assert.equal(isFresh(Date.parse('2026-08-01'), 45, now), false);
  assert.equal(isFresh(undefined, 45, now), true);
});

test('detectProvider แยก slug และ job id ของแต่ละ ATS', () => {
  const gh = detectProvider('https://job-boards.greenhouse.io/agoda/jobs/123');
  assert.equal(gh.provider.id, 'greenhouse');
  assert.deepEqual([gh.slug, gh.jobId], ['agoda', '123']);

  const lv = detectProvider('https://jobs.lever.co/palantir/abc-123');
  assert.deepEqual([lv.provider.id, lv.slug, lv.jobId], ['lever', 'palantir', 'abc-123']);

  const ab = detectProvider('https://jobs.ashbyhq.com/elevenlabs');
  assert.deepEqual([ab.provider.id, ab.slug, ab.jobId], ['ashby', 'elevenlabs', null]);

  assert.equal(detectProvider('https://example.com/careers'), null);
  assert.equal(detectProvider('ไม่ใช่ url'), null);
});

test('htmlToText ถอด HTML ที่ถูก escape สองชั้นแบบ Greenhouse', () => {
  const html = '&lt;p&gt;Hello &amp;amp; welcome&lt;/p&gt;&lt;ul&gt;&lt;li&gt;Go&lt;/li&gt;&lt;li&gt;SQL&lt;/li&gt;&lt;/ul&gt;';
  assert.equal(htmlToText(html), 'Hello & welcome\n- Go\n- SQL');
});

test('pipeline: เพิ่มงานโดยไม่ซ้ำ แล้วย้ายไป Processed', () => {
  const job = { url: 'https://jobs.lever.co/x/1', company: 'X', title: 'Backend', location: 'Remote' };
  let { text, added } = addPending('', [job, { ...job, url: 'https://jobs.lever.co/x/1/' }]);
  assert.equal(added.length, 1);
  assert.equal(addPending(text, [job]).added.length, 0);

  ({ text } = markDone(text, job.url, '#001 4.2/5'));
  const [item] = parsePipeline(text);
  assert.equal(item.done, true);
  assert.match(item.line, /#001 4\.2\/5$/);
  assert.ok(text.indexOf('## Processed') < text.indexOf('- [x]'));
});
