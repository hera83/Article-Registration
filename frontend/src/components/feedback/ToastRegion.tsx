import type { ToastMessage } from '../../types/ui';

interface ToastRegionProps {
  items: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastRegion({ items, onDismiss }: ToastRegionProps) {
  return (
    <div className="toast-region" aria-live="polite" aria-label="Notifications">
      {items.map((item) => (
        <article key={item.id} className={`toast-item tone-${item.tone ?? 'info'}`}>
          <div>
            <strong>{item.title}</strong>
            {item.description ? <p>{item.description}</p> : null}
          </div>
          <button type="button" aria-label="Dismiss" onClick={() => onDismiss(item.id)}>
            ×
          </button>
        </article>
      ))}
    </div>
  );
}