import type { CourseModuleSummary, ModuleItemKind, ModuleItemSummary } from '@/features/bored-class-sleeper/types';

const EMPTY_BY_KIND: Record<ModuleItemKind, number> = {
  video: 0,
  reading: 0,
  assignment: 0,
  quiz: 0,
  unknown: 0,
};

function classifyLearnHref(href: string): ModuleItemKind {
  const p = href.toLowerCase();
  if (p.includes('/lecture/') || p.includes('/video/') || p.includes('/videos/')) return 'video';
  if (p.includes('/quiz/') || p.includes('/exam/')) return 'quiz';
  if (p.includes('/assignment/') || p.includes('/peer/') || p.includes('/programming/')) return 'assignment';
  if (
    p.includes('/supplement/') ||
    p.includes('/reading/') ||
    p.includes('/discussion/') ||
    p.includes('/graded-discussion/')
  ) {
    return 'reading';
  }
  return 'unknown';
}

function bump(byKind: Record<ModuleItemKind, number>, k: ModuleItemKind) {
  byKind[k] += 1;
}

/**
 * Expands common collapsed regions (accordions / details) so outline links appear in the DOM.
 * Returns how many expansion actions were triggered.
 */
export function expandCourseraAccordions(doc: Document): number {
  let n = 0;

  doc.querySelectorAll('button[aria-expanded="false"]').forEach((el) => {
    if (el instanceof HTMLButtonElement) {
      el.click();
      n += 1;
    }
  });

  doc.querySelectorAll('details:not([open])').forEach((el) => {
    el.setAttribute('open', '');
    n += 1;
  });

  return n;
}

/**
 * Collects /learn/ links in the document, classifies them, and groups by a best-effort “module” heading.
 */
export function analyzeCourseModules(doc: Document): CourseModuleSummary[] {
  const anchors = Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href*="/learn/"]'));
  const byModule = new Map<
    string,
    { title: string; items: ModuleItemSummary[]; byKind: Record<ModuleItemKind, number> }
  >();

  for (const a of anchors) {
    let url: URL;
    try {
      url = new URL(a.href);
    } catch {
      continue;
    }
    if (!url.hostname.endsWith('coursera.org')) continue;

    const kind = classifyLearnHref(a.href);
    const title = (a.textContent || '').replace(/\s+/g, ' ').trim() || a.href;

    let moduleKey = '__outline__';
    let moduleTitle = 'Course outline';

    const section = a.closest('section');
    const weekHeading =
      section?.querySelector('h2, h3, h4, [class*="week"], [data-testid*="week"]')?.textContent?.trim() ||
      a
        .closest('[class*="Week"], [class*="week"], li, div[role="row"]')
        ?.querySelector('h2, h3, h4, span')
        ?.textContent?.trim();

    if (weekHeading && weekHeading.length > 0 && weekHeading.length < 120) {
      moduleKey = weekHeading.toLowerCase().slice(0, 80);
      moduleTitle = weekHeading;
    }

    if (!byModule.has(moduleKey)) {
      byModule.set(moduleKey, {
        title: moduleTitle,
        items: [],
        byKind: { ...EMPTY_BY_KIND },
      });
    }
    const bucket = byModule.get(moduleKey)!;
    bump(bucket.byKind, kind);
    bucket.items.push({ kind, title, href: a.href });
  }

  return [...byModule.values()].map((b) => ({
    title: b.title,
    itemCount: b.items.length,
    byKind: b.byKind,
    items: b.items,
  }));
}

export function formatModuleSummaryForStatus(modules: CourseModuleSummary[]): string {
  if (modules.length === 0) return 'No /learn/ links found. Open the course syllabus or week page.';
  const lines = modules.map((m) => {
    const parts = [`${m.title}: ${m.itemCount} items`];
    const k = m.byKind;
    parts.push(
      `(v:${k.video} read:${k.reading} work:${k.assignment} quiz:${k.quiz} ?:${k.unknown})`,
    );
    return parts.join(' ');
  });
  return lines.join('\n');
}
