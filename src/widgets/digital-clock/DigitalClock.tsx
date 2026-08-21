import { useEffect, useState } from 'react';
import type { WidgetProps } from '../../core/types';

export default function DigitalClock(_props: WidgetProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const date = now.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="digital-clock">
      <div className="digital-clock__time">{time}</div>
      <div className="digital-clock__date">{date}</div>
    </div>
  );
}
