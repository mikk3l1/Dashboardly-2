import { useEffect, useState } from 'react';
import type { WidgetProps } from '../../core/types';

interface Entry {
  id: string;
  task: string;
  seconds: number;
  endedAt: number;
}

interface TrackerState {
  entries: Entry[];
  active: { task: string; startedAt: number } | null;
}

const STORAGE_KEY = 'dashboardly-time-tracker-v1';

function loadState(): TrackerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === 'object' &&
        Array.isArray((parsed as TrackerState).entries)
      ) {
        return parsed as TrackerState;
      }
    }
  } catch {
    // Fall through to the empty state.
  }
  return { entries: [], active: null };
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function TimeTracker(_props: WidgetProps) {
  const [state, setState] = useState<TrackerState>(loadState);
  const [task, setTask] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable — the tracker still works in memory.
    }
  }, [state]);

  // Tick while a task is running so the elapsed time stays live.
  useEffect(() => {
    if (!state.active) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [state.active]);

  const activeSeconds = state.active
    ? Math.max(0, Math.floor((now - state.active.startedAt) / 1000))
    : 0;
  const totalSeconds =
    state.entries.reduce((sum, e) => sum + e.seconds, 0) + activeSeconds;

  const start = () => {
    const label = task.trim() || 'Untitled task';
    setState((prev) => ({ ...prev, active: { task: label, startedAt: Date.now() } }));
    setTask('');
  };

  const stop = () => {
    setState((prev) => {
      if (!prev.active) return prev;
      const seconds = Math.max(0, Math.floor((Date.now() - prev.active.startedAt) / 1000));
      const entry: Entry = {
        id: crypto.randomUUID(),
        task: prev.active.task,
        seconds,
        endedAt: Date.now(),
      };
      return { entries: [entry, ...prev.entries], active: null };
    });
  };

  return (
    <div className="tracker">
      {state.active ? (
        <div className="tracker__active">
          <span>⏱️</span>
          <span className="tracker__active-label">{state.active.task}</span>
          <span className="tracker__active-duration">
            {formatDuration(activeSeconds)}
          </span>
          <button className="btn btn--primary" onClick={stop}>
            Stop
          </button>
        </div>
      ) : (
        <div className="tracker__start">
          <input
            className="tracker__input"
            placeholder="What are you working on?"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') start();
            }}
          />
          <button className="btn btn--primary" onClick={start}>
            Start
          </button>
        </div>
      )}
      <div className="tracker__list">
        {state.entries.map((entry) => (
          <div key={entry.id} className="tracker__entry">
            <span className="tracker__entry-task">{entry.task}</span>
            <span className="tracker__entry-duration">{formatDuration(entry.seconds)}</span>
            <button
              className="tracker__entry-delete"
              title="Delete entry"
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  entries: prev.entries.filter((e) => e.id !== entry.id),
                }))
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="tracker__footer">
        <span className="tracker__total">Total: {formatDuration(totalSeconds)}</span>
        {state.entries.length > 0 && (
          <button
            className="tracker__clear"
            onClick={() => setState((prev) => ({ ...prev, entries: [] }))}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
