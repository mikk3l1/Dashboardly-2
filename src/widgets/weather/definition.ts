import { registerWidget } from '../../core/registry';
import Weather from './Weather';

registerWidget({
  type: 'weather',
  name: 'Weather',
  icon: '⛅',
  defaultSize: { w: 4, h: 2 },
  minSize: { w: 3, h: 2 },
  component: Weather,
});
