import { type ReactNode, useState } from 'react';
import { AppSidebar } from '../navigation/AppSidebar';
import { MobileBottomBar } from '../navigation/MobileBottomBar';
import type { ThemePreference } from '../../types/articles';

interface AppLayoutProps {
  activeView: 'inventory' | 'shopping';
  onChangeView: (view: 'inventory' | 'shopping') => void;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  children: ReactNode;
}

export function AppLayout({
  activeView,
  onChangeView,
  theme,
  onThemeChange,
  children,
}: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AppSidebar
        activeView={activeView}
        onChangeView={onChangeView}
        theme={theme}
        onThemeChange={onThemeChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="app-body">
        <main className="app-main">{children}</main>
      </div>

      <MobileBottomBar
        activeView={activeView}
        onChangeView={onChangeView}
        theme={theme}
        onThemeChange={onThemeChange}
      />
    </div>
  );
}