import { getCoursePageContext } from '@/features/bored-class-sleeper/context';
import { PANEL_HOST_ID } from '@/features/bored-class-sleeper/constants';
import {
  analyzeCourseModules,
  expandCourseraAccordions,
  formatModuleSummaryForStatus,
} from '@/features/bored-class-sleeper/syllabus';
import { markReadingItemsComplete } from '@/features/bored-class-sleeper/readings';
import {
  collectLikelyVideoItems,
  findAssignmentFileInput,
} from '@/features/bored-class-sleeper/dom';
import { appendActivityLog } from '@/utils/activity-log';
import { boredClassSleeperEnabledItem, extensionEnabledItem } from '@/utils/storage-items';

export function mountBoredClassPanel(): void {
  if (document.getElementById(PANEL_HOST_ID)) return;

  const host = document.createElement('div');
  host.id = PANEL_HOST_ID;
  host.setAttribute('data-ij-extension', 'sleeper-jr-bot');
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, sans-serif; }
    .wrap {
      position: fixed;
      right: 14px;
      bottom: 14px;
      z-index: 2147483640;
      width: min(380px, calc(100vw - 28px));
      max-height: min(70vh, 560px);
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid rgba(15, 23, 42, 0.12);
      background: rgba(255, 255, 255, 0.97);
      color: #0f172a;
      box-shadow: 0 12px 40px rgba(15, 23, 42, 0.15);
      font-size: 12px;
      line-height: 1.4;
    }
    @media (prefers-color-scheme: dark) {
      .wrap {
        background: rgba(15, 23, 42, 0.95);
        color: #e2e8f0;
        border-color: rgba(148, 163, 184, 0.25);
      }
      .btn--ghost { border-color: rgba(148, 163, 184, 0.35) !important; color: #e2e8f0 !important; }
      .btn:disabled { opacity: 0.4; }
      .list { background: rgba(2, 6, 23, 0.55); }
      textarea { background: rgba(2, 6, 23, 0.55); color: #e2e8f0; border-color: rgba(148, 163, 184, 0.35); }
    }
    .head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
    .title { margin: 0; font-size: 13px; font-weight: 700; letter-spacing: -0.02em; }
    .sub { margin: 2px 0 0; font-size: 11px; opacity: 0.75; }
    .row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .btn {
      border: none;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      background: linear-gradient(180deg, #5eead4, #14b8a6);
      color: #042f2e;
    }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn--ghost {
      background: transparent;
      border: 1px solid rgba(15, 23, 42, 0.2);
      color: #0f172a;
    }
    .pill {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 2px 6px;
      border-radius: 999px;
      background: rgba(20, 184, 166, 0.15);
      color: #0f766e;
    }
    .list {
      margin: 0;
      padding: 4px 0 0 16px;
      max-height: 100px;
      overflow: auto;
      font-size: 11px;
      opacity: 0.9;
    }
    .list a { color: #0d9488; }
    .status { font-size: 11px; opacity: 0.85; white-space: pre-wrap; max-height: 120px; overflow: auto; }
    textarea {
      width: 100%;
      min-height: 64px;
      resize: vertical;
      border-radius: 8px;
      border: 1px solid rgba(15, 23, 42, 0.15);
      padding: 6px 8px;
      font-size: 11px;
    }
    .mini { font-size: 10px; opacity: 0.65; }
  `;

  const wrap = document.createElement('div');
  wrap.className = 'wrap';

  wrap.innerHTML = `
    <div class="head">
      <div>
        <p class="title">BoredClass Sleeper</p>
        <p class="sub">Feature 1 · Coursera</p>
      </div>
      <span class="pill" id="ij-env-pill">Coursera</span>
    </div>
    <p class="status" id="ij-status">Ready.</p>
    <div class="row">
      <button type="button" class="btn" id="ij-scan">Scan modules</button>
      <button type="button" class="btn btn--ghost" id="ij-videos">List videos</button>
      <button type="button" class="btn btn--ghost" id="ij-readings">Mark readings</button>
    </div>
    <div class="row">
      <button type="button" class="btn btn--ghost" id="ij-quiz-ai" disabled title="Not implemented yet">Quiz (AI)</button>
      <button type="button" class="btn btn--ghost" id="ij-assign-gen" disabled title="Not implemented yet">Assignment</button>
    </div>
    <ul class="list" id="ij-video-list" hidden></ul>
    <textarea id="ij-output" placeholder="Reserved for future AI output…"></textarea>
    <div class="row">
      <button type="button" class="btn btn--ghost" id="ij-download">Download .txt</button>
      <button type="button" class="btn btn--ghost" id="ij-attach">Attach file input</button>
    </div>
    <p class="mini">Heuristic tools only. Quiz/Assignment AI not in scope yet (see docs/alcance.md).</p>
  `;

  shadow.append(style, wrap);

  void appendActivityLog({
    source: 'coursera',
    message: 'BoredClass panel shown',
    detail: `${location.pathname}`.slice(0, 120),
  });

  const statusEl = shadow.getElementById('ij-status') as HTMLElement;
  const videoListEl = shadow.getElementById('ij-video-list') as HTMLUListElement;
  const outputEl = shadow.getElementById('ij-output') as HTMLTextAreaElement;

  function setStatus(text: string) {
    statusEl.textContent = text;
  }

  function refreshContextStatus(): void {
    const url = new URL(location.href);
    const ctx = getCoursePageContext(url);
    const env = shadow.getElementById('ij-env-pill');
    if (env) {
      env.textContent = ctx.inCourse ? 'In course' : 'Coursera';
    }
    if (!ctx.inCourse) {
      setStatus('Coursera tab, but not inside /learn/{course}/…. Open a course home or week page.');
    }
  }

  shadow.getElementById('ij-scan')?.addEventListener('click', () => {
    void appendActivityLog({ source: 'coursera', message: 'Scan modules clicked' });
    setStatus('Expanding sections and scanning…');
    const expanded = expandCourseraAccordions(document);
    const modules = analyzeCourseModules(document);
    const summary = formatModuleSummaryForStatus(modules);
    setStatus(
      `Expanded ~${expanded} region(s).\n${summary}`,
    );
  });

  shadow.getElementById('ij-videos')?.addEventListener('click', () => {
    void appendActivityLog({ source: 'coursera', message: 'List videos clicked' });
    const items = collectLikelyVideoItems(document);
    videoListEl.innerHTML = '';
    if (items.length === 0) {
      videoListEl.hidden = true;
      setStatus('No video-like module links found. Try Scan modules on the syllabus/week page.');
      return;
    }
    for (const it of items) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = it.href;
      a.textContent = it.title;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      li.appendChild(a);
      videoListEl.appendChild(li);
    }
    videoListEl.hidden = false;
    setStatus(`Found ${items.length} video links (heuristic).`);
  });

  shadow.getElementById('ij-readings')?.addEventListener('click', () => {
    void appendActivityLog({ source: 'coursera', message: 'Mark readings clicked' });
    const r = markReadingItemsComplete(document);
    setStatus(r.message);
  });

  shadow.getElementById('ij-download')?.addEventListener('click', () => {
    void appendActivityLog({ source: 'coursera', message: 'Download draft .txt clicked' });
    const blob = new Blob([outputEl.value || ''], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'sleeper-jr-bot-draft.txt';
    a.click();
    URL.revokeObjectURL(blobUrl);
    setStatus('Download started (sleeper-jr-bot-draft.txt).');
  });

  shadow.getElementById('ij-attach')?.addEventListener('click', () => {
    void appendActivityLog({ source: 'coursera', message: 'Attach draft to file input clicked' });
    const input = findAssignmentFileInput(document);
    if (!input) {
      setStatus('No file input found on this page.');
      return;
    }
    const body = outputEl.value || '';
    if (!body.trim()) {
      setStatus('Add content in the textarea before attaching.');
      return;
    }
    try {
      const file = new File([body], 'sleeper-jr-bot-draft.txt', { type: 'text/plain' });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      setStatus('Attached sleeper-jr-bot-draft.txt (if the site allows).');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    }
  });

  void (async () => {
    const [extOn, featOn] = await Promise.all([
      extensionEnabledItem.getValue(),
      boredClassSleeperEnabledItem.getValue(),
    ]);
    if (extOn && featOn) {
      refreshContextStatus();
      if (getCoursePageContext(new URL(location.href)).inCourse) {
        setStatus('Use Scan modules, List videos, or Mark readings. Quiz/Assignment UI reserved (alcance).');
      }
    } else {
      setStatus('Extension or BoredClass is off. Enable in popup or options.');
    }
  })();
}
