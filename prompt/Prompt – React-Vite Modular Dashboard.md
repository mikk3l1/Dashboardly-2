# React/Vite Modular Dashboard

Build a modern, extensible dashboard application using **React + TypeScript + Vite**.

The goal is to create a personal dashboard where users can add, remove, move, and resize different widgets. The architecture must make it **very easy to create new widgets in the future without modifying the core dashboard implementation**.

## Core concept

The application should look and behave somewhat like a customizable desktop/home dashboard.

The dashboard consists of a responsive grid.

Each widget occupies one or more grid cells and can:

- Be dragged around the dashboard
- Snap to the grid
- Be resized horizontally and vertically
- Have configurable minimum and maximum dimensions
- Be removed
- Potentially expose widget-specific settings
- Persist its position and size
- Be added from a widget picker

Example widgets:

- Clock
- Weather
- Pomodoro timer
- Simple timer
- Date/calendar
- System information
- Notes
- Todo list

Only implement a few example widgets initially, but design the architecture so additional widgets can be added easily.

---

## Most important architectural requirement

**Widgets must be completely decoupled from the dashboard/grid implementation.**

A widget should not need to know how the dashboard works.

The dashboard should only know that a widget has:

- An ID/type
- A position
- A size
- Optional configuration
- A component to render

For example, conceptually:

```ts
type WidgetDefinition<TConfig = unknown> = {
  type: string;
  name: string;
  description?: string;
  icon?: React.ComponentType;
  defaultSize: {
    width: number;
    height: number;
  };
  minSize?: {
    width: number;
    height: number;
  };
  maxSize?: {
    width: number;
    height: number;
  };
  defaultConfig?: TConfig;
  component: React.ComponentType<WidgetProps<TConfig>>;
};
```

The exact implementation can differ if there is a better approach.

The important thing is that adding a new widget should ideally require creating a new widget component and registering it, rather than changing the dashboard/grid logic.

---

# Grid system

Use a proper grid/layout solution rather than implementing drag-and-drop and resizing from scratch unless there is a strong technical reason to do so.

Evaluate suitable React libraries such as:

- react-grid-layout
- dnd-kit
- another actively maintained solution

Prefer a library that provides:

- Grid snapping
- Dragging
- Resizing
- Responsive layouts
- Collision handling
- Layout persistence

The dashboard should use a configurable grid, for example:

- 12 columns on desktop
- Fewer columns on smaller screens
- Configurable row height
- Configurable margin/gap

Widgets should automatically snap to the grid.

When resizing a widget, its dimensions should snap to whole grid units.

---

# Widget architecture

Create a clear widget system.

For example:

```text
src/
├── app/
│   ├── App.tsx
│   └── ...
│
├── dashboard/
│   ├── Dashboard.tsx
│   ├── DashboardGrid.tsx
│   ├── DashboardToolbar.tsx
│   ├── WidgetRenderer.tsx
│   └── ...
│
├── widgets/
│   ├── registry.ts
│   ├── types.ts
│   │
│   ├── clock/
│   │   ├── ClockWidget.tsx
│   │   ├── clock.types.ts
│   │   └── ...
│   │
│   ├── weather/
│   │   ├── WeatherWidget.tsx
│   │   ├── weather.types.ts
│   │   └── ...
│   │
│   └── pomodoro/
│       ├── PomodoroWidget.tsx
│       ├── pomodoro.types.ts
│       └── ...
│
├── components/
│   └── ...
│
├── hooks/
│   └── ...
│
├── state/
│   └── ...
│
└── lib/
    └── ...
```

Feel free to improve this structure if you have a better architecture.

---

# Widget registry

Implement a central widget registry.

Conceptually:

```ts
registerWidget({
  type: "clock",
  name: "Clock",
  component: ClockWidget,
  defaultSize: {
    width: 3,
    height: 2,
  },
});
```

The dashboard should be able to dynamically discover available widgets from the registry.

The "Add Widget" UI should use the registry rather than having hardcoded knowledge of individual widgets.

For example:

```text
+ Add Widget

[ Clock       ]
[ Weather     ]
[ Pomodoro    ]
[ Timer       ]
```

Adding a new widget should automatically make it available here after registration.

---

# Widget instance vs widget definition

Keep these concepts separate.

A widget definition describes the widget type:

```ts
ClockWidget
WeatherWidget
PomodoroWidget
```

A widget instance describes one widget placed on the dashboard:

```ts
{
  id: "widget-123",
  type: "clock",
  x: 0,
  y: 0,
  width: 3,
  height: 2,
  config: {
    timezone: "Europe/Copenhagen"
  }
}
```

This means the same widget type can potentially be added multiple times with different configurations.

---

# State management

Create a clean state model for dashboard layouts.

The state should contain:

- Widget instances
- Their positions
- Their sizes
- Their configuration
- Dashboard settings

Avoid tightly coupling state to React components.

Use a lightweight state management solution if appropriate, such as Zustand, but do not introduce unnecessary dependencies.

---

# Persistence

Persist the dashboard layout locally.

Initially use:

```text
localStorage
```

Persist:

- Widget instances
- Position
- Size
- Widget configuration
- Dashboard settings

The application should restore the dashboard after a browser refresh.

Design the persistence layer so that it could later be replaced with a backend/database without rewriting the dashboard.

---

# Dashboard controls

Create a clean dashboard toolbar with at least:

- Add Widget
- Edit mode toggle
- Reset layout
- Optional settings

In normal mode, the dashboard should feel clean and application-like.

In edit mode:

- Show widget boundaries
- Show drag handles
- Allow widgets to be moved
- Allow widgets to be resized
- Show a remove button
- Make it obvious which widgets can be interacted with

Avoid making the UI look like an admin panel.

---

# Widget chrome

Create a reusable `WidgetContainer` component.

It should provide common functionality such as:

- Title
- Icon
- Drag handle
- Remove button
- Settings button when applicable
- Content area

Example:

```text
┌──────────────────────────────┐
│ ☀ Weather             ⚙  ×  │
├──────────────────────────────┤
│                              │
│        18°C                  │
│        Copenhagen            │
│                              │
└──────────────────────────────┘
```

Individual widgets should primarily be responsible for their own content.

The widget container should handle common dashboard functionality.

---

# Example widgets

Implement at least these three widgets:

## 1. Clock

A clean digital clock.

Requirements:

- Current time
- Current date
- 24-hour format
- Updates automatically
- Optional timezone configuration
- Should work without a backend

## 2. Pomodoro

A functional Pomodoro timer.

Requirements:

- Work duration
- Short break
- Long break
- Start
- Pause
- Reset
- Visual progress
- Current mode
- Configurable durations

Do not make the timer dependent on the dashboard.

## 3. Weather

Create a weather widget with a clean architecture for fetching weather data.

Do not hardcode weather data.

Create a weather service abstraction so the data source can later be changed.

For the initial implementation, either:

- use a suitable public weather API, or
- create a clean mock service if API configuration would unnecessarily complicate the initial project.

Keep API access outside the widget UI component.

---

# Design

The UI should feel like a polished modern dashboard rather than a demo project.

Aim for:

- Clean
- Minimal
- Modern
- Slightly futuristic
- Excellent spacing
- Subtle borders
- Rounded corners
- Good typography
- Smooth transitions
- Good hover states
- Good dark mode support

Use a modern component/styling solution if appropriate.

Avoid excessive gradients, excessive animations, or visual clutter.

The dashboard should remain usable when many widgets are present.

---

# Responsive behavior

The dashboard must work on:

- Desktop
- Laptop
- Tablet
- Mobile

The grid should adapt to different screen sizes.

Do not simply shrink desktop widgets until they become unusable.

Widgets should define reasonable minimum sizes.

---

# Accessibility

Consider accessibility from the beginning.

Include:

- Keyboard-accessible controls
- Proper buttons
- ARIA labels where appropriate
- Visible focus states
- Good color contrast
- Reduced-motion support

Drag and resize interactions should not make basic functionality inaccessible.

---

# Code quality

Use:

- TypeScript
- Strict typing
- Functional React components
- Reusable components
- Small focused modules
- Clear interfaces/types
- No unnecessary global state
- No duplicated logic

Avoid:

- Giant components
- `any` unless absolutely unavoidable
- Hardcoded widget-specific logic inside the dashboard
- Hardcoded layout assumptions
- Copy/paste implementations
- Overengineering

Prefer composition over inheritance.

---

# Important development principle

Before implementing the UI, establish the architecture.

The core dashboard should know nothing about:

```text
Clock
Weather
Pomodoro
Timer
Notes
Todo
```

It should only know about the generic concept of:

```text
WidgetDefinition
WidgetInstance
WidgetRegistry
WidgetRenderer
DashboardLayout
```

This is the most important architectural requirement of the project.

---

# Future extensibility

The architecture should make these future features possible without major refactoring:

- More widgets
- Multiple dashboards
- Widget configuration
- Widget-specific settings
- Import/export layouts
- Backend persistence
- User accounts
- Themes
- Custom backgrounds
- Different grid configurations
- Widget marketplace/plugin system
- Per-widget permissions
- Responsive layouts
- Dashboard templates

Do not implement all of these now. Simply avoid architectural decisions that would make them difficult later.

---

# Development approach

Work incrementally.

### Phase 1

Set up:

- React
- TypeScript
- Vite
- Styling
- Project structure
- Widget types
- Widget registry
- Dashboard state

### Phase 2

Implement:

- Grid
- Dragging
- Resizing
- Snapping
- Widget container
- Edit mode

### Phase 3

Implement:

- Clock widget
- Pomodoro widget
- Weather widget

### Phase 4

Implement:

- localStorage persistence
- Add Widget UI
- Remove widgets
- Reset layout
- Widget configuration

### Phase 5

Polish:

- Responsive behavior
- Animations
- Accessibility
- Empty states
- Loading states
- Error handling
- Visual refinement

---

# Important

Do not blindly start writing hundreds of files.

First inspect the project and determine:

1. What already exists
2. Which dependencies are already installed
3. Which architecture fits the project
4. Which grid/drag/resize library is the best choice

Then propose the architecture briefly.

After that, implement it incrementally.

When making architectural decisions, prioritize:

**Extensibility > maintainability > simplicity > visual polish.**

The end result should feel like a real, production-quality dashboard framework rather than a proof-of-concept.