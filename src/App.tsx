import Grid from './grid/Grid';
import { useDashboard } from './core/useDashboard';
import { getAllWidgets } from './core/registry';

export default function App() {
  const { widgets, addWidget, removeWidget, patchWidget, finalizeWidget, resetLayout } =
    useDashboard();
  const availableWidgets = getAllWidgets();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__logo">
          Dashboard<span>ly</span>
        </div>
        <div>
          <div className="sidebar__section-label">Widgets</div>
          <div className="palette">
            {availableWidgets.map((def) => (
              <button
                key={def.type}
                className="palette__item"
                onClick={() => addWidget(def.type)}
              >
                <span className="palette__icon">{def.icon}</span>
                <span className="palette__name">{def.name}</span>
                <span className="palette__add">+</span>
              </button>
            ))}
          </div>
        </div>
        <div className="sidebar__footer">
          <button className="btn" onClick={resetLayout}>
            Reset layout
          </button>
        </div>
      </aside>
      <main className="board">
        <Grid
          widgets={widgets}
          onPatch={patchWidget}
          onFinalize={finalizeWidget}
          onRemove={removeWidget}
        />
      </main>
    </div>
  );
}
