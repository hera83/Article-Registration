import type { ReactNode } from 'react';
import { AppNav } from '../navigation/AppNav';
import { ThemeSwitcher } from '../navigation/ThemeSwitcher';
import type { ThemePreference } from '../../types/articles';

interface AppLayoutProps {
  title: string;
  subtitle: string;
  activeView: 'inventory' | 'shopping';
  onChangeView: (view: 'inventory' | 'shopping') => void;
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  onThemeChange: (theme: ThemePreference) => void;
  children: ReactNode;
}

export function AppLayout({
  title,
  subtitle,
  activeView,
  onChangeView,
  theme,
  resolvedTheme,
  onThemeChange,
  children,
}: AppLayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <p className="kicker">Article Registration</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <div className="header-tools">
          <AppNav activeView={activeView} onChangeView={onChangeView} />
          <ThemeSwitcher value={theme} resolvedValue={resolvedTheme} onChange={onThemeChange} />
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}