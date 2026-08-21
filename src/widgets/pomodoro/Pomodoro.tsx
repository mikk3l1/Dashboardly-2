import { useCallback, useEffect, useRef, useState } from 'react';
import type { WidgetProps } from '../../core/types';

const MODES = [
  { id: 'focus', label: 'Focus', seconds: 25 * 60 },
  { id: 'short', label: 'Short break', seconds: 5 * 60 },
  { id: 'long', label: 'Long break', seconds: 15 * 60 },
] as const;

type ModeId = (typeof MODES)[number]['id'];

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  } catch {
    // Audio unavailable — skip the chime.
  }
}

export default function Pomodoro(_props: WidgetProps) {
  const [modeId, setModeId] = useState<ModeId>('focus');
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].seconds);
  const [running, setRunning] = useState(false);
  const completedFocus = useRef(0);

  const currentMode = MODES.find((m) => m.id === modeId) ?? MODES[0];
  const progress = secondsLeft / currentMode.seconds;

  const switchMode = useCallback((id: ModeId) => {
    const mode = MODES.find((m) => m.id === id) ?? MODES[0];
    setModeId(mode.id);
    setSecondsLeft(mode.seconds);
    setRunning(false);
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (secondsLeft !== 0 || !running) return;
    beep();
    let next: ModeId;
    if (modeId === 'focus') {
      completedFocus.current += 1;
      next = completedFocus.current % 4 === 0 ? 'long' : 'short';
    } else {
      next = 'focus';
    }
    const mode = MODES.find((m) => m.id === next) ?? MODES[0];
    setModeId(next);
    setSecondsLeft(mode.seconds);
    // Keep running so sessions flow into each other.
  }, [secondsLeft, running, modeId]);

  return (
    <div className="pomodoro">
      <div className="pomodoro__tabs">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`pomodoro__tab${m.id === modeId ? ' pomodoro__tab--active' : ''}`}
            onClick={() => switchMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="pomodoro__dial">
        <svg viewBox="0 0 120 120">
          <circle cx={60} cy={60} r={RING_RADIUS} className="pomodoro__track" />
          <circle
            cx={60}
            cy={60}
            r={RING_RADIUS}
            className="pomodoro__progress"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
          />
        </svg>
        <div className="pomodoro__time">{formatTime(secondsLeft)}</div>
      </div>
      <div className="pomodoro__controls">
        <button
          className="btn btn--primary"
          onClick={() => setRunning((r) => !r)}
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button className="btn" onClick={() => switchMode(modeId)}>
          Reset
        </button>
      </div>
    </div>
  );
}
