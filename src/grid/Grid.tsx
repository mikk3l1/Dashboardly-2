import { useEffect, useRef, useState } from 'react';
import type { WidgetInstance } from '../core/types';
import { COLS, GAP, MAX_ROWS, ROW_HEIGHT, clamp } from '../core/geometry';
import { getWidgetDef } from '../core/registry';

interface GridProps {
  widgets: WidgetInstance[];
  /** Live position/size update while dragging or resizing. */
  onPatch: (id: string, patch: Partial<Pick<WidgetInstance, 'x' | 'y' | 'w' | 'h'>>) => void;
  /** Called when a drag or resize ends (collision resolution + z-order). */
  onFinalize: (id: string) => void;
  onRemove: (id: string) => void;
}

const RESIZE_HANDLES = ['n', 'e', 's', 'w', 'se', 'sw'] as const;
type HandleDir = (typeof RESIZE_HANDLES)[number];

export default function Grid({ widgets, onPatch, onFinalize, onRemove }: GridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const cellWidth = width > 0 ? (width - (COLS - 1) * GAP) / COLS : 0;
  const colPitch = cellWidth + GAP;
  const rowPitch = ROW_HEIGHT + GAP;

  const attachPointerEvents = (move: (ev: PointerEvent) => void, done: () => void) => {
    const up = () => {
      window.removeEventListener('pointermove', move);
      setActiveId(null);
      done();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
  };

  const beginMove = (e: React.PointerEvent, w: WidgetInstance) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setActiveId(w.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = w.x;
    const origY = w.y;
    attachPointerEvents(
      (ev) => {
        const nx = clamp(origX + Math.round((ev.clientX - startX) / colPitch), 0, COLS - w.w);
        const ny = Math.max(0, origY + Math.round((ev.clientY - startY) / rowPitch));
        onPatch(w.id, { x: nx, y: ny });
      },
      () => onFinalize(w.id)
    );
  };

  const beginResize = (e: React.PointerEvent, w: WidgetInstance, dir: HandleDir) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setActiveId(w.id);
    const def = getWidgetDef(w.type);
    const minW = def?.minSize.w ?? 1;
    const minH = def?.minSize.h ?? 1;
    const startX = e.clientX;
    const startY = e.clientY;
    attachPointerEvents(
      (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        let { x, y } = w;
        let nw = w.w;
        let nh = w.h;
        if (dir.includes('e')) nw = clamp(w.w + Math.round(dx / colPitch), minW, COLS - w.x);
        if (dir.includes('s')) nh = clamp(w.h + Math.round(dy / rowPitch), minH, MAX_ROWS);
        if (dir.includes('w')) {
          nw = clamp(w.w - Math.round(dx / colPitch), minW, COLS - w.x);
          x = w.x + (w.w - nw);
        }
        if (dir.includes('n')) {
          nh = clamp(w.h - Math.round(dy / rowPitch), minH, MAX_ROWS);
          y = w.y + (w.h - nh);
        }
        onPatch(w.id, { x, y, w: nw, h: nh });
      },
      () => onFinalize(w.id)
    );
  };

  const height =
    widgets.reduce((max, w) => Math.max(max, w.y + w.h), 1) * rowPitch - GAP;

  return (
    <div
      ref={containerRef}
      className="grid"
      style={{
        minHeight: `${height}px`,
        backgroundSize: width > 0 ? `${colPitch}px ${rowPitch}px` : undefined,
      }}
    >
      {width > 0 &&
        widgets.map((w, i) => {
          const def = getWidgetDef(w.type);
          if (!def) return null;
          const Comp = def.component;
          const pxWidth = w.w * cellWidth + (w.w - 1) * GAP;
          const pxHeight = w.h * ROW_HEIGHT + (w.h - 1) * GAP;
          return (
            <div
              key={w.id}
              className={`widget${activeId === w.id ? ' widget--active' : ''}`}
              style={{
                left: w.x * colPitch,
                top: w.y * rowPitch,
                width: pxWidth,
                height: pxHeight,
                zIndex: activeId === w.id ? 1000 : 10 + i,
              }}
            >
              <div className="widget__header" onPointerDown={(e) => beginMove(e, w)}>
                <span className="widget__icon">{def.icon}</span>
                <span className="widget__title">{def.name}</span>
                <button
                  className="widget__close"
                  title="Remove widget"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onRemove(w.id)}
                >
                  ×
                </button>
              </div>
              <div className="widget__body">
                <Comp id={w.id} width={pxWidth} height={pxHeight} />
              </div>
              {RESIZE_HANDLES.map((dir) => (
                <div
                  key={dir}
                  className={`widget__handle widget__handle--${dir}`}
                  onPointerDown={(e) => beginResize(e, w, dir)}
                />
              ))}
            </div>
          );
        })}
      {width > 0 && widgets.length === 0 && (
        <div className="grid__empty">
          <p>Dashboard is empty</p>
          <p className="grid__empty-hint">Add a widget from the sidebar to get started.</p>
        </div>
      )}
    </div>
  );
}
