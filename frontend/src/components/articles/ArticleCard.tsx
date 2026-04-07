import type { Article } from '../../types/articles';
import type { SearchInsight } from '../../services/searchInsights';

interface ArticleCardProps {
  article: Article;
  searchInsight?: SearchInsight;
  onOpenEdit: (article: Article) => void;
  onArchiveToggle: (article: Article) => Promise<void>;
  onAddToShopping: (article: Article) => Promise<void>;
  onRemoveFromShopping: (article: Article) => Promise<void>;
  onRunOut: (article: Article) => Promise<void>;
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

  return (
    <article className="article-card panel">
      <header>
        <div className="chip-row">
          {duplicateLabel ? <span className={`chip duplicate-${searchInsight?.duplicateSignal}`}>{duplicateLabel}</span> : null}
          <span className={`chip type-${article.articleType}`}>{article.articleType}</span>
          <span className="chip">{article.area}</span>
          {article.isOnShoppingList ? <span className="chip shopping">shopping</span> : null}
          {article.isArchived ? <span className="chip">archived</span> : null}
        </div>
        <h3>{article.name}</h3>
      </header>

      <p className="meta-line">
        {article.brand ?? 'No brand'}
        {' · '}
        {article.model ?? 'No model'}
      </p>

      <p className="meta-line">Quantity: {formatQuantity(article)}</p>

      {article.typicalLocation ? <p className="meta-line">Location: {article.typicalLocation}</p> : null}

      {searchInsight && searchInsight.reasons.length > 0 ? (
        <p className="match-summary">Matched in {searchInsight.reasons.slice(0, 3).join(', ').toLowerCase()}.</p>
      ) : null}

      {article.note ? <p className="note-preview">{article.note}</p> : null}

      {article.tags.length > 0 ? (
        <div className="chip-row">
          {article.tags.map((tag) => (
            <span key={tag} className="chip muted">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="action-row">
        <button type="button" onClick={() => onOpenEdit(article)}>
          Open / edit
        </button>

        {article.articleType === 'stock' ? (
          article.isOnShoppingList ? (
            <button type="button" onClick={() => void onRemoveFromShopping(article)}>
              Remove from list
            </button>
          ) : (
            <button type="button" onClick={() => void onAddToShopping(article)}>
              Add to list
            </button>
          )
        ) : null}

        {article.articleType === 'stock' ? (
          <button type="button" onClick={() => void onRunOut(article)}>
            Run out
          </button>
        ) : null}

        <button type="button" onClick={() => void onArchiveToggle(article)}>
          {article.isArchived ? 'Reactivate' : 'Archive'}
        </button>
      </div>
    </article>
  );
}