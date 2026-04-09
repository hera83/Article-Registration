import { useEffect, useRef, useState } from 'react';

interface NoteInputDialogProps {
  title: string;
  description?: string;
  noteLabel?: string;
  notePlaceholder?: string;
  initialNote?: string;
  confirmLabel?: string;
  onConfirm: (note: string) => void;
  onClose: () => void;
}

export function NoteInputDialog({
  title,
  description,
  noteLabel = 'Note',
  notePlaceholder = 'Optional note',
  initialNote = '',
  confirmLabel = 'Confirm',
  onConfirm,
  onClose,
}: NoteInputDialogProps) {
  const [note, setNote] = useState(initialNote);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="dialog-overlay" role="presentation" onClick={handleOverlayClick}>
      <div
        className="dialog-panel note-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
      >
        <div className="dialog-header">
          <h2 className="dialog-title">{title}</h2>
          {description ? <p className="dialog-description">{description}</p> : null}
        </div>

        <label className="form-field">
          <span>{noteLabel}</span>
          <input
            ref={inputRef}
            placeholder={notePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onConfirm(note);
              }
            }}
          />
        </label>

        <div className="dialog-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={() => onConfirm(note)}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
