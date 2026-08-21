/**
 * Widget registry entry point.
 *
 * Adding a new widget = create a folder under src/widgets with a component
 * and a definition.ts that calls registerWidget, then import the definition
 * file below. The dashboard core never needs to change.
 */
import './digital-clock/definition';
import './analog-clock/definition';
import './weather/definition';
import './pomodoro/definition';
import './time-tracker/definition';
