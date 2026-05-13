/**
 * Best-effort: clicks visible “mark complete” style controls (Coursera UI varies).
 */

export interface MarkReadingsResult {
  clicks: number;
  message: string;
}

export function markReadingItemsComplete(doc: Document): MarkReadingsResult {
  let clicks = 0;
  const candidates = doc.querySelectorAll(
    'button, a[role="button"], [role="button"], div[role="button"]',
  );

  candidates.forEach((el) => {
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (
      t.includes('mark as complete') ||
      t.includes('mark complete') ||
      t.includes('complete item') ||
      t === 'done'
    ) {
      (el as HTMLElement).click();
      clicks += 1;
    }
  });

  return {
    clicks,
    message:
      clicks > 0
        ? `Triggered ${clicks} completion control(s). Verify in Coursera.`
        : 'No “mark complete” controls found on this view.',
  };
}
