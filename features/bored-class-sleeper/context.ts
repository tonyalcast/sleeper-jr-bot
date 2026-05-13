import type { CoursePageContext } from '@/features/bored-class-sleeper/types';

/** Host is any Coursera property we inject on (coursera.org). */
export function isCourseraHostname(hostname: string): boolean {
  return hostname === 'coursera.org' || hostname.endsWith('.coursera.org');
}

/**
 * Heuristic: inside /learn/{slug}/… the user is in a course workspace (not only marketing pages).
 */
export function getCoursePageContext(url: URL): CoursePageContext {
  const isCoursera = isCourseraHostname(url.hostname);
  const m = url.pathname.match(/\/learn\/([^/]+)/);
  const courseSlug = m?.[1] && m[1].length > 0 ? m[1] : null;
  const inCourse = Boolean(courseSlug);
  return {
    isCoursera,
    inCourse,
    courseSlug,
    pathname: url.pathname,
  };
}
