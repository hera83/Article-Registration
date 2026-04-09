import type { ReactNode } from 'react';

interface PageToolbarProps {
  title: string;
  subtitle: string;
  badge?: string;
  actions?: ReactNode;
}

export function PageToolbar({ title, subtitle, badge, actions }: PageToolbarProps) {
  return (
    <header className="page-toolbar">
      <div className="page-toolbar-text">
        <div className="page-toolbar-heading">
          <h1>{title}</h1>
          {badge && <span className="page-toolbar-badge">{badge}</span>}
        </div>
        <p className="page-toolbar-subtitle">{subtitle}</p>
      </div>
      {actions && <div className="page-toolbar-actions">{actions}</div>}
    </header>
  );
}
