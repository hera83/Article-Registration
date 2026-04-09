import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { InventoryPage } from './pages/InventoryPage';
import { useTheme } from './theme/useTheme';

export default function App() {
  const { theme, setTheme } = useTheme();
  const [view, setView] = useState<'inventory' | 'shopping'>('inventory');

  return (
    <AppLayout
      activeView={view}
      onChangeView={setView}
      theme={theme}
      onThemeChange={setTheme}
    >
      <InventoryPage activeView={view} />
    </AppLayout>
  );
}