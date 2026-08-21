import type { ComponentType } from 'react';

/** Props handed to every widget component. */
export interface WidgetProps {
  id: string;
  /** Rendered width in pixels (grid-aligned). */
  width: number;
  /** Rendered height in pixels (grid-aligned). */
  height: number;
}

/** Size in grid units (cells / rows). */
export interface Size {
  w: number;
  h: number;
}

/** A widget definition registered in the widget registry. */
export interface WidgetDef {
  /** Unique widget type identifier (e.g. "digital-clock"). */
  type: string;
  /** Human-readable name shown in the palette and widget header. */
  name: string;
  /** Emoji icon shown in the palette and widget header. */
  icon: string;
  /** Initial size in grid units when a widget is added. */
  defaultSize: Size;
  /** Smallest size the widget can be resized to (grid units). */
  minSize: Size;
  /** The React component rendered inside the widget frame. */
  component: ComponentType<WidgetProps>;
}

/** A placed instance of a widget on the dashboard grid. */
export interface WidgetInstance {
  id: string;
  type: string;
  /** Grid column (0-based). */
  x: number;
  /** Grid row (0-based). */
  y: number;
  /** Width in grid columns. */
  w: number;
  /** Height in grid rows. */
  h: number;
}
