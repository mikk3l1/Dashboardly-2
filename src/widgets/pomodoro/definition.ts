import { registerWidget } from '../../core/registry';
import Pomodoro from './Pomodoro';

registerWidget({
  type: 'pomodoro',
  name: 'Pomodoro',
  icon: '🍅',
  defaultSize: { w: 3, h: 2 },
  minSize: { w: 2, h: 2 },
  component: Pomodoro,
});
