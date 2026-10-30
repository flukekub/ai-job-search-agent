// Greenhouse: https://boards-api.greenhouse.io/v1/boards/{slug}/jobs
import { getJson } from '../lib/http.mjs';
import { htmlToText } from '../lib/html.mjs';

const HOSTS = /^(boards|job-boards)(\.eu)?\.greenhouse\.io$/;
const API = 'https://boards-api.greenhouse.io/v1/boards';

function toJob(j, company) {
  return {
    id: String(j.id),
    title: j.title ?? '',
    company,
    location: j.location?.name ?? '',
    url: j.absolute_url ?? '',
    postedAt: Date.parse(j.first_published ?? j.updated_at ?? '') || undefined,
    description: htmlToText(j.content ?? ''),
  };
}

export default {
  id: 'greenhouse',

  // https://job-boards.greenhouse.io/agoda/jobs/123 → { slug: 'agoda', jobId: '123' }
  detect(url) {
    const u = new URL(url);
    if (!HOSTS.test(u.hostname)) return null;
    const [slug, , jobId] = u.pathname.split('/').filter(Boolean);
    return slug ? { slug, jobId: jobId ?? u.searchParams.get('gh_jid') ?? null } : null;
  },

  async list(slug) {
    const data = await getJson(`${API}/${slug}/jobs?content=true`);
    return (data?.jobs ?? []).map((j) => toJob(j, slug));
  },

  async getJob(slug, jobId) {
    const j = await getJson(`${API}/${slug}/jobs/${jobId}`);
    return j ? toJob(j, slug) : null;
  },
};
