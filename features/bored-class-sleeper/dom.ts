/**
 * DOM helpers for Coursera course pages (best-effort; site markup changes).
 */

export interface CourseraLinkItem {
  title: string;
  href: string;
}

const VIDEO_PATH_HINTS = ['/lecture/', '/video/', '/videos/'];

export function collectLikelyVideoItems(doc: Document): CourseraLinkItem[] {
  const anchors = Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href*="/learn/"]'));
  const seen = new Set<string>();
  const out: CourseraLinkItem[] = [];

  for (const a of anchors) {
    const href = a.href;
    if (!href || seen.has(href)) continue;
    let url: URL;
    try {
      url = new URL(href);
    } catch {
      continue;
    }
    if (!url.hostname.endsWith('coursera.org')) continue;

    const path = url.pathname.toLowerCase();
    const looksVideo = VIDEO_PATH_HINTS.some((h) => path.includes(h));
    if (!looksVideo) continue;

    seen.add(href);
    const title = (a.textContent || '').replace(/\s+/g, ' ').trim() || href;
    out.push({ title, href });
  }

  out.sort((x, y) => x.title.localeCompare(y.title));
  return out;
}

export function extractStudyPlainText(doc: Document, maxChars: number): string {
  const root = doc.querySelector('main') || doc.body;
  const text = (root?.innerText || '').replace(/\s+\n/g, '\n').trim();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n…`;
}

export function pageLooksLikeQuiz(url: URL, doc: Document): boolean {
  const p = url.pathname.toLowerCase();
  if (p.includes('/exam/') || p.includes('/quiz/') || p.includes('/graded/')) return true;
  const h = (doc.title || '').toLowerCase();
  return h.includes('quiz') || h.includes('exam') || h.includes('practice');
}

export function pageLooksLikeAssignment(url: URL, doc: Document): boolean {
  const p = url.pathname.toLowerCase();
  if (p.includes('/assignment/') || p.includes('/peer/') || p.includes('/programming/')) return true;
  const h = (doc.title || '').toLowerCase();
  return h.includes('assignment') || h.includes('project') || h.includes('programming');
}

export function findAssignmentFileInput(doc: Document): HTMLInputElement | null {
  const inputs = Array.from(doc.querySelectorAll<HTMLInputElement>('input[type="file"]'));
  return inputs[0] ?? null;
}
