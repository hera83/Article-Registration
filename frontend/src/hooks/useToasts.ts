import { useCallback, useState } from 'react';
import type { ToastMessage } from '../types/ui';

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => {
      dismiss(id);
    }, 2600);
  }, [dismiss]);

  return {
    toasts,
    push,
    dismiss,
  };
}