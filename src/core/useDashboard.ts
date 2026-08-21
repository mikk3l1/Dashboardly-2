import { useCallback, useEffect, useState } from 'react';
import type { WidgetInstance } from './types';
import { getWidgetDef } from './registry';
import { freeSpot, resolveOverlaps } from './geometry';

const STORAGE_KEY = 'dashboardly-layout-v1';

function defaultLayout(): WidgetInstance[] {
  return [
    { id: 'default-weather', type: 'weather', x: 0, y: 0, w: 4, h: 2 },
    { id: 'default-digital', type: 'digital-clock', x: 4, y: 0, w: 3, h: 2 },
    { id: 'default-analog', type: 'analog-clock', x: 7, y: 0, w: 3, h: 2 },
    { id: 'default-pomodoro', type: 'pomodoro', x: 10, y: 0, w: 2, h: 2 },
    { id: 'default-tracker', type: 'time-tracker', x: 0, y: 2, w: 5, h: 2 },
  ];
}

function loadLayout(): WidgetInstance[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(
          (w): w is WidgetInstance =>
            !!w &&
            typeof w === 'object' &&
            typeof (w as WidgetInstance).id === 'string' &&
            getWidgetDef((w as WidgetInstance).type) !== undefined &&
            ['x', 'y', 'w', 'h'].every(
              (k) => Number.isFinite((w as Record<string, unknown>)[k])
            )
        );
        if (valid.length > 0) return valid;
      }
    }
  } catch {
    // Corrupt storage — fall back to the default layout.
  }
  return defaultLayout();
}

/**
 * Dashboard store: widget list (array order = z-order, last is topmost)
 * with localStorage persistence.
 */
export function useDashboard() {
  const [widgets, setWidgets] = useState<WidgetInstance[]>(loadLayout);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    } catch {
      // Storage unavailable (private mode etc.) — the dashboard still works.
    }
  }, [widgets]);

  const addWidget = useCallback((type: string) => {
    const def = getWidgetDef(type);
    if (!def) return;
    setWidgets((prev) => {
      const spot = freeSpot(prev, def.defaultSize.w, def.defaultSize.h);
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          type,
          x: spot.x,
          y: spot.y,
          w: def.defaultSize.w,
          h: def.defaultSize.h,
        },
      ];
    });
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  /** Live update while dragging / resizing (no collision resolution). */
  const patchWidget = useCallback(
    (id: string, patch: Partial<Pick<WidgetInstance, 'x' | 'y' | 'w' | 'h'>>) => {
      setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
    },
    []
  );

  /** Called when a drag/resize ends: resolve overlaps + bring to front. */
  const finalizeWidget = useCallback((id: string) => {
    setWidgets((prev) => {
      const idx = prev.findIndex((w) => w.id === id);
      if (idx === -1) return prev;
      return resolveOverlaps([...prev.slice(0, idx), ...prev.slice(idx + 1), prev[idx]]);
    });
  }, []);

  const resetLayout = useCallback(() => {
    setWidgets(defaultLayout());
  }, []);

  return {
    widgets,
    addWidget,
    removeWidget,
    patchWidget,
    finalizeWidget,
    resetLayout,
  };
}
