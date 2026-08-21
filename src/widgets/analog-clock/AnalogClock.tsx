import { useEffect, useState } from 'react';
import type { WidgetProps } from '../../core/types';

function handEnd(degrees: number, length: number): { x: number; y: number } {
  const rad = (degrees * Math.PI) / 180;
  return { x: 100 + Math.sin(rad) * length, y: 100 - Math.cos(rad) * length };
}

export default function AnalogClock(_props: WidgetProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let raf: number;
    const tick = () => {
      setNow(Date.now());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const d = new Date(now);
  const seconds = d.getSeconds() + d.getMilliseconds() / 1000;
  const minutes = d.getMinutes() + seconds / 60;
  const hours = (d.getHours() % 12) + minutes / 60;

  const hourEnd = handEnd(hours * 30, 44);
  const minuteEnd = handEnd(minutes * 6, 62);
  const secondEnd = handEnd(seconds * 6, 74);

  return (
    <svg viewBox="0 0 200 200" className="analog-clock">
      <circle cx={100} cy={100} r={92} className="analog-clock__face" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={100 + Math.sin(a) * 78}
            y1={100 - Math.cos(a) * 78}
            x2={100 + Math.sin(a) * 86}
            y2={100 - Math.cos(a) * 86}
            className="analog-clock__tick"
          />
        );
      })}
      <line x1={100} y1={100} x2={hourEnd.x} y2={hourEnd.y} className="analog-clock__hand analog-clock__hand--hour" />
      <line x1={100} y1={100} x2={minuteEnd.x} y2={minuteEnd.y} className="analog-clock__hand analog-clock__hand--minute" />
      <line x1={100} y1={100} x2={secondEnd.x} y2={secondEnd.y} className="analog-clock__hand analog-clock__hand--second" />
      <circle cx={100} cy={100} r={5} className="analog-clock__cap" />
    </svg>
  );
}
