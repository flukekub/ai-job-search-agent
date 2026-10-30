// แปลง CV payload (JSON) เป็น HTML ตามแม่แบบ templates/cv.html
import { escapeHtml as e } from './html.mjs';

const list = (items) => (items?.length ? `<ul>${items.map((i) => `<li>${e(i)}</li>`).join('')}</ul>` : '');

function section(title, body) {
  return body ? `<section><h2>${e(title)}</h2>${body}</section>` : '';
}

export function renderCv(payload, template) {
  const contact = payload.contact ?? {};
  const contactParts = [
    contact.email && `<a href="mailto:${e(contact.email)}">${e(contact.email)}</a>`,
    contact.phone && e(contact.phone),
    contact.location && e(contact.location),
    ...(contact.links ?? []).map((l) => `<a href="${e(l.url)}">${e(l.label)}</a>`),
  ].filter(Boolean);

  const experience = (payload.experience ?? [])
    .map(
      (job) => `
      <div class="entry">
        <div class="entry-head"><strong>${e(job.role)}</strong> · ${e(job.company)}<span class="dates">${e(job.dates)}</span></div>
        ${job.location ? `<div class="muted">${e(job.location)}</div>` : ''}
        ${list(job.bullets)}
      </div>`,
    )
    .join('');

  const projects = (payload.projects ?? [])
    .map(
      (p) => `
      <div class="entry">
        <div class="entry-head"><strong>${e(p.name)}</strong></div>
        ${p.description ? `<p>${e(p.description)}</p>` : ''}
        ${list(p.bullets)}
      </div>`,
    )
    .join('');

  const education = (payload.education ?? [])
    .map(
      (ed) => `
      <div class="entry">
        <div class="entry-head"><strong>${e(ed.degree)}</strong> · ${e(ed.school)}<span class="dates">${e(ed.dates)}</span></div>
      </div>`,
    )
    .join('');

  const skills = (payload.skills ?? [])
    .map((s) => `<p><strong>${e(s.group)}:</strong> ${e((s.items ?? []).join(', '))}</p>`)
    .join('');

  const body = [
    `<header><h1>${e(payload.name)}</h1>`,
    payload.headline ? `<div class="headline">${e(payload.headline)}</div>` : '',
    `<div class="contact">${contactParts.join(' · ')}</div></header>`,
    section('Summary', payload.summary ? `<p>${e(payload.summary)}</p>` : ''),
    section('Experience', experience),
    section('Projects', projects),
    section('Skills', skills),
    section('Education', education),
  ].join('\n');

  // ใช้ฟังก์ชันแทนสตริง เพราะข้อความอย่าง "$&" ใน CV จะถูก replace() ตีความเป็นคำสั่งพิเศษ
  return template.replace('{{TITLE}}', () => e(payload.name)).replace('{{BODY}}', () => body);
}
