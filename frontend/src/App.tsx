import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { InventoryPage } from './pages/InventoryPage';
import { useTheme } from './theme/useTheme';

export default function App() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [view, setView] = useState<'inventory' | 'shopping'>('inventory');

  const title = view === 'shopping' ? 'Shopping list workspace' : 'Everything you own';
  const subtitle =
    view === 'shopping'
      ? 'Update stock inline and clear items fast.'
      : 'Fast search, clean structure, no visual noise.';

  return (
    <AppLayout
      title={title}
      subtitle={subtitle}
      activeView={view}
      onChangeView={setView}
      theme={theme}
      resolvedTheme={resolvedTheme}
      onThemeChange={setTheme}
    >
      <InventoryPage activeView={view} />
    </AppLayout>
  );
}