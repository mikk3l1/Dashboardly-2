# Dashboardly

A modern, customizable widget dashboard built with **React + Vite + TypeScript**.
#### [Demo](https://mikk3l1.github.io/Dashboardly-2/) (https://mikk3l1.github.io/Dashboardly-2) 

#
###


## Features

- **Drag & drop** widgets by their header — they snap to a 12-column grid
- **Resize** widgets by dragging edges and corners, always grid-aligned
- **Persistent layout** — position, size and widget list survive reloads (localStorage)
- **Collision handling** — dropping a widget pushes overlapping widgets down
- **Modular widget system** — new widgets self-register, the core never changes

## Included widgets

| Widget | Description |
| --- | --- |
| ⛅ Weather | Current conditions via the free Open-Meteo API |
| 🕐 Digital Clock | Live HH:MM:SS with date |
| 🕰️ Analog Clock | Smooth SVG analog clock |
| 🍅 Pomodoro | 25/5/15 timer with progress ring and chime |
| ⏱️ Time Tracker | Start/stop task timing with a persistent log |

## Getting started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Architecture

```
src/
├── core/            # Dashboard core — knows nothing about specific widgets
│   ├── types.ts     # Shared types (WidgetDef, WidgetProps, WidgetInstance)
│   ├── registry.ts  # Widget registry (register / lookup)
│   ├── geometry.ts  # Grid math: snap, clamp, collision, free-spot search
│   └── useDashboard.ts  # Widget state + localStorage persistence
├── grid/
│   └── Grid.tsx     # Rendering + drag/resize pointer interactions
└── widgets/
    ├── index.ts     # Imports every widget definition (self-registration)
    └── <widget>/    # Component + definition.ts per widget
```

### Adding a new widget

1. Create `src/widgets/my-widget/MyWidget.tsx` — a React component receiving
   `WidgetProps` (`id`, `width`, `height`).
2. Create `src/widgets/my-widget/definition.ts`:

   ```ts
   import { registerWidget } from '../../core/registry';
   import MyWidget from './MyWidget';

   registerWidget({
     type: 'my-widget',
     name: 'My Widget',
     icon: '🧩',
     defaultSize: { w: 3, h: 2 },
     minSize: { w: 2, h: 1 },
     component: MyWidget,
   });
   ```

3. Add `import './my-widget/definition';` to `src/widgets/index.ts`.

That's it — the widget appears in the sidebar palette, is draggable, resizable,
and persists like any other widget. No core changes required.
