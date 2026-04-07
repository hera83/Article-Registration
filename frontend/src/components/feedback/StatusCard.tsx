interface StatusCardProps {
  title: string;
  description: string;
  tone?: 'info' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

export function StatusCard({ title, description, tone = 'info', actionLabel, onAction }: StatusCardProps) {
  return (
    <section className={`panel status-card tone-${tone}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}