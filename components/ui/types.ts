/** Shared props for feature status cards (options page and elsewhere). */

export type StatusPillVariant = 'on' | 'off' | 'neutral' | 'planned';

export interface FeatureStatusRow {
  id: string;
  title: string;
  detail: string;
  pillLabel: string;
  pillVariant: StatusPillVariant;
}
