interface StatusCardProps {
  title: string;
  description: string;
  tone?: 'info' | 'error';
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function StatusCard({ title, description, tone = 'info', icon, actionLabel, onAction }: StatusCardProps) {
  return (
    <section className={`panel status-card tone-${tone}`}>
      {icon ? <span className="status-card-icon" aria-hidden="true">{icon}</span> : null}
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