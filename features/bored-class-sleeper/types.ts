/**
 * Types for BoredClass Sleeper (Funcionalidad 1 — docs/alcance.md).
 */

export type ModuleItemKind = 'video' | 'reading' | 'assignment' | 'quiz' | 'unknown';

export interface ModuleItemSummary {
  kind: ModuleItemKind;
  title: string;
  href: string;
}

export interface CourseModuleSummary {
  /** Best-effort label (week title or “Outline”). */
  title: string;
  itemCount: number;
  byKind: Record<ModuleItemKind, number>;
  items: ModuleItemSummary[];
}

export interface CoursePageContext {
  isCoursera: boolean;
  inCourse: boolean;
  courseSlug: string | null;
  pathname: string;
}
