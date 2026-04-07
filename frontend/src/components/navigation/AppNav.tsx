interface AppNavProps {
  activeView: 'inventory' | 'shopping';
  onChangeView: (view: 'inventory' | 'shopping') => void;
}

export function AppNav({ activeView, onChangeView }: AppNavProps) {
  return (
    <nav className="app-nav" aria-label="Primary navigation">
      <button
        type="button"
        className={activeView === 'inventory' ? 'is-active' : ''}
        onClick={() => onChangeView('inventory')}
      >
        Inventory
      </button>
      <button
        type="button"
        className={activeView === 'shopping' ? 'is-active' : ''}
        onClick={() => onChangeView('shopping')}
      >
        Shopping List
      </button>
    </nav>
  );
}