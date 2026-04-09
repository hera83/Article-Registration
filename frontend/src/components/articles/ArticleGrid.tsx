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
  onAddToShopping: (article: Article) => void;
  onRemoveFromShopping: (article: Article) => Promise<void>;
  onRunOut: (article: Article) => void;
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
        icon={hasActiveFilters ? '🔍' : '📦'}
        title={hasActiveFilters ? 'No matching articles' : 'No articles yet'}
        description={
          hasActiveFilters
            ? `Nothing matched ${query ? `"${query}"` : 'the current filters'}. Try fewer words or remove a filter.`
            : 'Create your first article to start building your inventory.'
        }
        actionLabel={hasActiveFilters ? 'Clear filters' : undefined}
        onAction={hasActiveFilters ? onClearFilters : undefined}
      />
    );
  }

  return (
    <div className="article-grid">
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
    </div>
  );
}