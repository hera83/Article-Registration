import type { ThemePreference } from '../../types/articles';

type ViewMode = 'inventory' | 'shopping';

interface MobileBottomBarProps {
  activeView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
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
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

export function MobileBottomBar({ activeView, onChangeView, theme, onThemeChange }: MobileBottomBarProps) {
  return (
    <nav className="mobile-bottom-bar" aria-label="Mobile navigation">
      <button
        type="button"
        className={`mobile-tab ${activeView === 'inventory' ? 'is-active' : ''}`}
        onClick={() => onChangeView('inventory')}
      >
        <span className="mobile-tab-icon" aria-hidden="true">📦</span>
        Inventory
      </button>

      <button
        type="button"
        className={`mobile-tab ${activeView === 'shopping' ? 'is-active' : ''}`}
        onClick={() => onChangeView('shopping')}
      >
        <span className="mobile-tab-icon" aria-hidden="true">🛒</span>
        Shopping
      </button>

      <button
        type="button"
        className="mobile-tab"
        onClick={() => onThemeChange(themeRotation[theme])}
      >
        <span className="mobile-tab-icon" aria-hidden="true">{themeIcons[theme]}</span>
        {themeLabels[theme]}
      </button>
    </nav>
  );
}
