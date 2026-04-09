import type { Article } from '../../types/articles';
import type { SearchInsight } from '../../services/searchInsights';

interface ArticleCardProps {
  article: Article;
  searchInsight?: SearchInsight;
  onOpenEdit: (article: Article) => void;
  onArchiveToggle: (article: Article) => Promise<void>;
  onAddToShopping: (article: Article) => void;
  onRemoveFromShopping: (article: Article) => Promise<void>;
  onRunOut: (article: Article) => void;
}

function formatQuantity(article: Article): string {
  if (article.quantity === null) {
    return 'n/a';
  }

  return article.unit ? `${article.quantity} ${article.unit}` : `${article.quantity}`;
}

export function ArticleCard({ article, searchInsight, onOpenEdit, onArchiveToggle, onAddToShopping, onRemoveFromShopping, onRunOut }: ArticleCardProps) {
  const duplicateLabel =
    searchInsight?.duplicateSignal === 'exact'
      ? 'Possible duplicate'
      : searchInsight?.duplicateSignal === 'strong'
        ? 'Strong match'
        : searchInsight?.duplicateSignal === 'possible'
          ? 'Related match'
          : null;

  const isStock = article.articleType === 'stock';
  const isEmpty = isStock && article.quantity === 0;
  const hasMeta = article.brand || article.model;

  return (
    <article className={`card ${isEmpty ? 'card-empty' : ''} ${article.isArchived ? 'card-archived' : ''}`}>
      {/* ── Header: title + type badge ────────────────── */}
      <header className="card-header">
        <h3 className="card-title">{article.name}</h3>
        <span className={`card-type-badge type-${article.articleType}`}>
          {article.articleType === 'stock' ? 'Stock' : 'Standard'}
        </span>
      </header>

      {/* ── Meta: area, brand/model ───────────────────── */}
      <div className="card-meta">
        <span className="card-area">{article.area}</span>
        {hasMeta && (
          <span className="card-brand-model">
            {[article.brand, article.model].filter(Boolean).join(' · ')}
          </span>
        )}
        {article.typicalLocation && (
          <span className="card-location">📍 {article.typicalLocation}</span>
        )}
      </div>

      {/* ── Quantity / status strip ───────────────────── */}
      {isStock && (
        <div className={`card-stock-strip ${isEmpty ? 'is-empty' : 'is-stocked'}`}>
          <span className="card-stock-value">{formatQuantity(article)}</span>
          <span className="card-stock-label">{isEmpty ? 'Out of stock' : 'In stock'}</span>
        </div>
      )}

      {/* ── Status badges ─────────────────────────────── */}
      <div className="card-badges">
        {duplicateLabel && (
          <span className={`badge badge-duplicate duplicate-${searchInsight?.duplicateSignal}`}>{duplicateLabel}</span>
        )}
        {article.isOnShoppingList && <span className="badge badge-shopping">On shopping list</span>}
        {article.isArchived && <span className="badge badge-archived">Archived</span>}
      </div>

      {/* ── Search insight ────────────────────────────── */}
      {searchInsight && searchInsight.reasons.length > 0 && (
        <p className="card-match-hint">Matched in {searchInsight.reasons.slice(0, 3).join(', ').toLowerCase()}</p>
      )}

      {/* ── Note ──────────────────────────────────────── */}
      {article.note && <p className="card-note">{article.note}</p>}

      {/* ── Tags ──────────────────────────────────────── */}
      {article.tags.length > 0 && (
        <div className="card-tags">
          {article.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      {/* ── Actions ───────────────────────────────────── */}
      <footer className="card-actions">
        <button type="button" className="btn-primary-card" onClick={() => onOpenEdit(article)}>
          Edit
        </button>

        <div className="card-secondary-actions">
          {isStock && (
            article.isOnShoppingList ? (
              <button type="button" onClick={() => void onRemoveFromShopping(article)}>Remove from list</button>
            ) : (
              <button type="button" onClick={() => void onAddToShopping(article)}>Add to list</button>
            )
          )}
          {isStock && (
            <button type="button" className="btn-danger-ghost" onClick={() => void onRunOut(article)}>Run out</button>
          )}
          <button type="button" className={article.isArchived ? '' : 'btn-danger-ghost'} onClick={() => void onArchiveToggle(article)}>
            {article.isArchived ? 'Reactivate' : 'Archive'}
          </button>
        </div>
      </footer>
    </article>
  );
}