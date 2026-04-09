interface SkeletonGridProps {
  count?: number;
  variant?: 'cards' | 'list';
}

export function SkeletonGrid({ count = 6, variant = 'cards' }: SkeletonGridProps) {
  if (variant === 'list') {
    return (
      <div className="skeleton-list" aria-busy="true">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="skeleton-list-item" aria-hidden="true">
            <span className="skeleton-line skeleton-title" />
            <span className="skeleton-line skeleton-meta" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="article-grid" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card skeleton-card" aria-hidden="true">
          <div className="skeleton-row">
            <span className="skeleton-line skeleton-title" />
            <span className="skeleton-line skeleton-type" />
          </div>
          <span className="skeleton-line skeleton-meta" />
          <span className="skeleton-line skeleton-strip" />
          <div className="skeleton-row skeleton-tags-row">
            <span className="skeleton-line skeleton-tag" />
            <span className="skeleton-line skeleton-tag" />
          </div>
        </div>
      ))}
    </div>
  );
}
