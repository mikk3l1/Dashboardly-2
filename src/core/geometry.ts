import type { WidgetInstance } from './types';

/** Grid configuration (the single source of truth for grid dimensions). */
export const COLS = 12;
export const GAP = 16;
export const ROW_HEIGHT = 96;
export const MAX_ROWS = 24;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Axis-aligned overlap test between two widgets in grid units. */
export function overlaps(a: WidgetInstance, b: WidgetInstance): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/**
 * Resolve collisions after a widget has been dropped.
 * The last widget in the array is the one that was just moved; it keeps its
 * position and overlapping widgets are pushed downwards.
 */
export function resolveOverlaps(widgets: WidgetInstance[]): WidgetInstance[] {
  if (widgets.length < 2) return widgets;
  const moved = widgets[widgets.length - 1];
  const rest = widgets.slice(0, -1).map((w) => ({ ...w }));

  let changed = true;
  let guard = 0;
  while (changed && guard++ < 100) {
    changed = false;
    for (const w of rest) {
      if (overlaps(w, moved)) {
        w.y = Math.max(w.y, moved.y + moved.h);
        changed = true;
      }
      for (const other of rest) {
        if (other === w) continue;
        if (overlaps(w, other)) {
          w.y = Math.max(w.y, other.y + other.h);
          changed = true;
        }
      }
    }
  }
  return [...rest, moved];
}

/**
 * Find the first free grid spot (scanning top-to-bottom, left-to-right)
 * that fits a widget of the given size.
 */
export function freeSpot(
  widgets: WidgetInstance[],
  w: number,
  h: number
): { x: number; y: number } {
  let maxY = 0;
  for (const t of widgets) maxY = Math.max(maxY, t.y + t.h);
  for (let y = 0; y <= maxY + h; y++) {
    for (let x = 0; x + w <= COLS; x++) {
      const candidate: WidgetInstance = { id: '__probe__', type: 'probe', x, y, w, h };
      if (!widgets.some((t) => overlaps(candidate, t))) return { x, y };
    }
  }
  return { x: 0, y: maxY + h };
}
