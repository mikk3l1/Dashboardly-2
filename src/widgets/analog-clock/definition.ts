import { registerWidget } from '../../core/registry';
import AnalogClock from './AnalogClock';

registerWidget({
  type: 'analog-clock',
  name: 'Analog Clock',
  icon: '🕰️',
  defaultSize: { w: 3, h: 2 },
  minSize: { w: 2, h: 2 },
  component: AnalogClock,
});
