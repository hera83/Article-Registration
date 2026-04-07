import type { Article } from '../../types/articles';
import type { SearchInsight } from '../../services/searchInsights';
import { StatusCard } from '../feedback/StatusCard';
import { ArticleCard } from './ArticleCard';

interface ArticleGridProps {
  items: Article[];
  query: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  insightsById: Record<string, SearchInsight>;
  onOpenEdit: (article: Article) => void;
  onArchiveToggle: (article: Article) => Promise<void>;
  onAddToShopping: (article: Article) => Promise<void>;
  onRemoveFromShopping: (article: Article) => Promise<void>;
  onRunOut: (article: Article) => Promise<void>;
}

export function ArticleGrid({
  items,
  query,
  hasActiveFilters,
  onClearFilters,
  insightsById,
  onOpenEdit,
  onArchiveToggle,
  onAddToShopping,
  onRemoveFromShopping,
  onRunOut,
}: ArticleGridProps) {
  if (items.length === 0) {
    return (
      <StatusCard
        title={hasActiveFilters ? 'No matching articles' : 'No articles yet'}
        description={
          hasActiveFilters
            ? `Nothing matched ${query ? `“${query}”` : 'the current filters'}. Try fewer words, remove a filter, or open a likely existing item first.`
            : 'Create your first article so future searches can stop duplicate buys before they happen.'
        }
        actionLabel={hasActiveFilters ? 'Clear filters' : undefined}
        onAction={hasActiveFilters ? onClearFilters : undefined}
      />
    );
  }

  return (
    <section className="article-grid">
      {items.map((item) => (
        <ArticleCard
          key={item.id}
          article={item}
          searchInsight={insightsById[item.id]}
          onOpenEdit={onOpenEdit}
          onArchiveToggle={onArchiveToggle}
          onAddToShopping={onAddToShopping}
          onRemoveFromShopping={onRemoveFromShopping}
          onRunOut={onRunOut}
        />
      ))}
    </section>
  );
}