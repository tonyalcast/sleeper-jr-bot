/**
 * BoredClass Sleeper — scope: docs/alcance.md “Funcionalidad 1”.
 *
 * Domain logic for the Coursera content script; the WXT entrypoint only calls `startBoredClassSleeper`.
 */

export * from './types';
export * from './constants';
export * from './context';
export * from './dom';
export * from './syllabus';
export * from './readings';
export { callAiCompletion, loadAiConfig } from './ai-bridge';
export { mountBoredClassPanel } from './panel';
export { mountWhenReady as startBoredClassSleeper } from './bootstrap';
