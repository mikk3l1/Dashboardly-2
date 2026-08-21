import type { WidgetDef } from './types';

const registry = new Map<string, WidgetDef>();

/**
 * Register a widget definition. Widgets self-register via this function,
 * so the dashboard core never needs to know about individual widgets.
 */
export function registerWidget(def: WidgetDef): void {
  if (registry.has(def.type)) {
    console.warn(`[registry] widget type "${def.type}" is already registered`);
  }
  registry.set(def.type, def);
}

export function getWidgetDef(type: string): WidgetDef | undefined {
  return registry.get(type);
}

export function getAllWidgets(): WidgetDef[] {
  return [...registry.values()];
}
