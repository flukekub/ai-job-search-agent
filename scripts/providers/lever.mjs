// Lever: https://api.lever.co/v0/postings/{slug}?mode=json
import { getJson } from '../lib/http.mjs';
import { htmlToText } from '../lib/html.mjs';

const API = 'https://api.lever.co/v0/postings';

function toJob(j, company) {
  // descriptionPlain มักเป็นแค่ย่อหน้าแรก รายละเอียดหน้าที่/คุณสมบัติอยู่ใน lists
  const sections = (j.lists ?? []).map((l) => `${l.text}\n${htmlToText(l.content)}`);
  const description = [j.descriptionPlain || htmlToText(j.description), ...sections, j.additionalPlain]
    .filter(Boolean)
    .join('\n\n');
  return {
    id: j.id,
    title: j.text ?? '',
    company,
    location: j.categories?.location ?? '',
    url: j.hostedUrl ?? '',
    postedAt: typeof j.createdAt === 'number' ? j.createdAt : undefined,
    description,
  };
}

export default {
  id: 'lever',

  // https://jobs.lever.co/palantir/<uuid> → { slug: 'palantir', jobId: '<uuid>' }
  detect(url) {
    const u = new URL(url);
    if (!/^jobs(\.eu)?\.lever\.co$/.test(u.hostname)) return null;
    const [slug, jobId] = u.pathname.split('/').filter(Boolean);
    return slug ? { slug, jobId: jobId ?? null } : null;
  },

  async list(slug) {
    const data = await getJson(`${API}/${slug}?mode=json`);
    return Array.isArray(data) ? data.map((j) => toJob(j, slug)) : [];
  },

  async getJob(slug, jobId) {
    const j = await getJson(`${API}/${slug}/${jobId}`);
    return j?.id ? toJob(j, slug) : null;
  },
};
