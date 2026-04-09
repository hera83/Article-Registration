import type { AppDialogState } from '../../types/ui';

interface DialogHostProps {
  dialog: AppDialogState | null;
  onClose: () => void;
}

// Prepared as a lightweight host for future confirm/alert dialogs.
export function DialogHost({ dialog, onClose }: DialogHostProps) {
  if (!dialog) {
    return null;
  }

  return (
    <div className="dialog-overlay" role="presentation">
      <div className="dialog-panel" role="dialog" aria-modal="true" aria-label={dialog.title}>
        <h2>{dialog.title}</h2>
        {dialog.description ? <p>{dialog.description}</p> : null}
        <button type="button" className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}