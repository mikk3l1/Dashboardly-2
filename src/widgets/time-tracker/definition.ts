import { registerWidget } from '../../core/registry';
import TimeTracker from './TimeTracker';

registerWidget({
  type: 'time-tracker',
  name: 'Time Tracker',
  icon: '⏱️',
  defaultSize: { w: 5, h: 2 },
  minSize: { w: 3, h: 2 },
  component: TimeTracker,
});
