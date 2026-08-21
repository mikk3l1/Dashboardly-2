import { registerWidget } from '../../core/registry';
import DigitalClock from './DigitalClock';

registerWidget({
  type: 'digital-clock',
  name: 'Digital Clock',
  icon: '🕐',
  defaultSize: { w: 3, h: 2 },
  minSize: { w: 2, h: 1 },
  component: DigitalClock,
});
