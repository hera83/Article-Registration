import type { ThemePreference } from '../../types/articles';

type ViewMode = 'inventory' | 'shopping';

interface AppSidebarProps {
  activeView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const themeRotation: Record<ThemePreference, ThemePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

const themeIcons: Record<ThemePreference, string> = {
  system: '◑',
  light: '☀',
  dark: '☾',
};

const themeLabels: Record<ThemePreference, string> = {
  system: 'System theme',
  light: 'Light theme',
  dark: 'Dark theme',
};

export function AppSidebar({
  activeView,
  onChangeView,
  theme,
  onThemeChange,
  collapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  return (
    <aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`} aria-label="App navigation">
      <div className="sidebar-brand" role="banner">
        <span className="sidebar-logo" aria-hidden="true">▦</span>
        {!collapsed && <span className="sidebar-title">Articles</span>}
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        <button
          type="button"
          className={`sidebar-nav-item ${activeView === 'inventory' ? 'is-active' : ''}`}
          onClick={() => onChangeView('inventory')}
          title="Inventory"
        >
          <span className="sidebar-icon" aria-hidden="true">📦</span>
          {!collapsed && <span className="sidebar-label">Inventory</span>}
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeView === 'shopping' ? 'is-active' : ''}`}
          onClick={() => onChangeView('shopping')}
          title="Shopping List"
        >
          <span className="sidebar-icon" aria-hidden="true">🛒</span>
          {!collapsed && <span className="sidebar-label">Shopping List</span>}
        </button>
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-nav-item"
          title={themeLabels[theme]}
          onClick={() => onThemeChange(themeRotation[theme])}
        >
          <span className="sidebar-icon" aria-hidden="true">{themeIcons[theme]}</span>
          {!collapsed && <span className="sidebar-label">{themeLabels[theme]}</span>}
        </button>

        <button
          type="button"
          className="sidebar-nav-item sidebar-collapse-toggle"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggleCollapse}
        >
          <span className="sidebar-icon" aria-hidden="true">{collapsed ? '▸' : '◂'}</span>
          {!collapsed && <span className="sidebar-label">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
