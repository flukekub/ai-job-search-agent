// Ashby: https://api.ashbyhq.com/posting-api/job-board/{slug}
import { getJson } from '../lib/http.mjs';
import { htmlToText } from '../lib/html.mjs';

const API = 'https://api.ashbyhq.com/posting-api/job-board';

function toJob(j, company) {
  const extra = (j.secondaryLocations ?? []).map((s) => s.location).filter(Boolean);
  return {
    id: j.id,
    title: j.title ?? '',
    company,
    location: [...new Set([j.location, ...extra, j.isRemote ? 'Remote' : ''].filter(Boolean))].join(' · '),
    url: j.jobUrl ?? '',
    postedAt: Date.parse(j.publishedAt ?? '') || undefined,
    description: j.descriptionPlain || htmlToText(j.descriptionHtml),
  };
}

export default {
  id: 'ashby',

  // https://jobs.ashbyhq.com/elevenlabs/<uuid> → { slug: 'elevenlabs', jobId: '<uuid>' }
  detect(url) {
    const u = new URL(url);
    if (u.hostname !== 'jobs.ashbyhq.com') return null;
    const [slug, jobId] = u.pathname.split('/').filter(Boolean);
    return slug ? { slug, jobId: jobId ?? null } : null;
  },

  async list(slug) {
    const data = await getJson(`${API}/${slug}?includeCompensation=true`);
    return (data?.jobs ?? []).filter((j) => j.isListed !== false).map((j) => toJob(j, slug));
  },

  // Ashby ไม่มี endpoint ดึงงานเดี่ยว จึงดึงทั้งบอร์ดแล้วหา id
  async getJob(slug, jobId) {
    const jobs = await this.list(slug);
    return jobs.find((j) => j.id === jobId) ?? null;
  },
};
