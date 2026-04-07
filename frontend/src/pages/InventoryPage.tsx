import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  addToShoppingList,
  archiveArticle,
  createArticle,
  getArticles,
  getShoppingList,
  reactivateArticle,
  removeFromShoppingList,
  restockFromShoppingList,
  runOut,
  updateArticle,
} from '../services/articleService';
import { getAreas, getTags } from '../services/lookupService';
import type { Article, ArticleFilters, ShoppingListItem } from '../types/articles';
import type { AreaOption, TagOption } from '../types/lookups';
import type { AppDialogState } from '../types/ui';
import { SearchPanel } from '../components/articles/SearchPanel';
import { ArticleGrid } from '../components/articles/ArticleGrid';
import { ArticleEditorForm } from '../components/articles/ArticleEditorForm';
import { ShoppingListPanel } from '../components/shopping/ShoppingListPanel';
import { ToastRegion } from '../components/feedback/ToastRegion';
import { DialogHost } from '../components/feedback/DialogHost';
import { StatusCard } from '../components/feedback/StatusCard';
import { useToasts } from '../hooks/useToasts';
import { getSearchInsight } from '../services/searchInsights';

const initialFilters: ArticleFilters = {
  query: '',
  area: '',
  articleType: '',
  tag: '',
  onShoppingList: '',
  status: 'active',
  stockStatus: 'all',
};

type ViewMode = 'inventory' | 'shopping';

interface InventoryPageProps {
  activeView: ViewMode;
}

export function InventoryPage({ activeView }: InventoryPageProps) {
  const [filters, setFilters] = useState<ArticleFilters>(initialFilters);
  const [articles, setArticles] = useState<Article[]>([]);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, push: pushToast, dismiss: dismissToast } = useToasts();
  const [dialog, setDialog] = useState<AppDialogState | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const deferredQuery = useDeferredValue(filters.query);
  const effectiveFilters = useMemo(() => ({ ...filters, query: deferredQuery }), [filters, deferredQuery]);
  const hasActiveFilters = useMemo(
    () =>
      Boolean(filters.query || filters.area || filters.articleType || filters.tag || filters.onShoppingList || filters.status !== 'active' || filters.stockStatus !== 'all'),
    [filters],
  );

  const insightsById = useMemo(
    () =>
      Object.fromEntries(
        articles.map((article) => [article.id, getSearchInsight(article, filters.query)]),
      ),
    [articles, filters.query],
  );

  const displayedArticles = useMemo(() => {
    if (!filters.query.trim()) {
      return articles;
    }

    return [...articles].sort((left, right) => {
      const rightScore = insightsById[right.id]?.score ?? 0;
      const leftScore = insightsById[left.id]?.score ?? 0;
      return rightScore - leftScore || left.name.localeCompare(right.name);
    });
  }, [articles, filters.query, insightsById]);

  const hasLoadedData = areas.length > 0 || tags.length > 0 || articles.length > 0 || shoppingItems.length > 0;
  const isInitialLoading = loading && !hasLoadedData;
  const isRefreshing = loading && hasLoadedData;

  async function loadLookups() {
    const [nextAreas, nextTags] = await Promise.all([getAreas(), getTags()]);
    setAreas(nextAreas);
    setTags(nextTags);
  }

  async function loadArticles() {
    const nextArticles = await getArticles(effectiveFilters);
    setArticles(nextArticles);
  }

  async function loadShoppingList() {
    const nextShoppingItems = await getShoppingList();
    setShoppingItems(nextShoppingItems);
  }

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadLookups(), loadArticles(), loadShoppingList()]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshAll();
  }, [effectiveFilters.query, effectiveFilters.area, effectiveFilters.articleType, effectiveFilters.tag, effectiveFilters.onShoppingList, effectiveFilters.status, effectiveFilters.stockStatus]);

  async function handleCreate(input: Parameters<typeof createArticle>[0]) {
    const created = await createArticle(input);
    pushToast({ title: 'Article created', description: `${created.name} is now searchable before the next purchase.`, tone: 'success' });
    await refreshAll();
  }

  async function handleUpdate(id: string, input: Parameters<typeof updateArticle>[1]) {
    const updated = await updateArticle(id, input);
    pushToast({ title: 'Article updated', description: `${updated.name} now has fresher search data.`, tone: 'success' });
    setEditingArticle(null);
    await refreshAll();
  }

  async function handleArchiveToggle(article: Article) {
    if (article.isArchived) {
      await reactivateArticle(article.id);
      pushToast({ title: 'Article reactivated', tone: 'success' });
    } else {
      await archiveArticle(article.id);
      pushToast({ title: 'Article archived', tone: 'info' });
    }
    await refreshAll();
  }

  async function handleAddToShopping(article: Article) {
    const shoppingNote = window.prompt('Shopping note (optional):', article.shoppingNote ?? '') ?? '';
    await addToShoppingList(article.id, { shoppingNote });
    pushToast({ title: 'Added to shopping list', description: `${article.name} is now marked so it does not get bought twice.`, tone: 'success' });
    await refreshAll();
  }

  async function handleRemoveFromShopping(article: Article) {
    await removeFromShoppingList(article.id);
    pushToast({ title: 'Removed from shopping list', description: `${article.name} no longer needs refill attention.`, tone: 'info' });
    await refreshAll();
  }

  async function handleRunOut(article: Article) {
    const shoppingNote = window.prompt('Shopping note for refill:', article.shoppingNote ?? '') ?? '';
    await runOut(article.id, { shoppingNote });
    pushToast({ title: 'Marked as run out', description: `${article.name} is now visible in the shopping workspace.`, tone: 'info' });
    await refreshAll();
  }

  async function handleRestock(item: ShoppingListItem, quantity: number) {
    await restockFromShoppingList(item.articleId, { quantity });
    pushToast({ title: 'Stock updated', description: `${item.name} was updated to ${quantity}${item.unit ? ` ${item.unit}` : ''} and leaves the shopping list when back in stock.`, tone: 'success' });
    await refreshAll();
  }

  async function handleRemoveShoppingItem(item: ShoppingListItem) {
    await removeFromShoppingList(item.articleId);
    pushToast({ title: 'Shopping item removed', description: `${item.name} was cleared from the refill list.`, tone: 'info' });
    await refreshAll();
  }

  function handleResetFilters() {
    setFilters(initialFilters);
  }

  async function handleRetry() {
    await refreshAll();
  }

  return (
    <>
      <div className={`workspace-grid ${activeView === 'shopping' ? 'shopping-workspace' : ''}`}>
        <section className="left-rail">
          {activeView === 'inventory' ? (
            <SearchPanel
              filters={filters}
              areas={areas}
              tags={tags}
              resultCount={displayedArticles.length}
              isLoading={loading}
              onChange={setFilters}
              onReset={handleResetFilters}
            />
          ) : null}

          {isRefreshing ? <div className="panel refresh-banner">Refreshing data...</div> : null}

          {error && hasLoadedData ? (
            <div className="panel error-banner action-panel">
              <div>
                <strong>Could not refresh all data</strong>
                <p>{error}</p>
              </div>
              <button type="button" onClick={() => void handleRetry()}>
                Try again
              </button>
            </div>
          ) : null}

          {isInitialLoading ? <StatusCard title="Loading data" description="Fetching articles, areas, tags and shopping list." /> : null}

          {error && !hasLoadedData ? (
            <StatusCard title="Could not load the workspace" description={error} tone="error" actionLabel="Try again" onAction={() => void handleRetry()} />
          ) : null}

          {!isInitialLoading && !error && activeView === 'inventory' ? (
            <ArticleGrid
              items={displayedArticles}
              query={filters.query}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleResetFilters}
              insightsById={insightsById}
              onOpenEdit={setEditingArticle}
              onArchiveToggle={handleArchiveToggle}
              onAddToShopping={handleAddToShopping}
              onRemoveFromShopping={handleRemoveFromShopping}
              onRunOut={handleRunOut}
            />
          ) : null}

          {!isInitialLoading && !error && activeView === 'shopping' ? (
            <ShoppingListPanel
              items={shoppingItems}
              onRestock={handleRestock}
              onRemove={handleRemoveShoppingItem}
              mode="workspace"
            />
          ) : null}
        </section>

        {activeView === 'inventory' ? (
          <aside className="right-rail">
            <ArticleEditorForm
              areas={areas}
              tags={tags}
              existingArticles={articles}
              editingArticle={editingArticle}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
              onCancelEdit={() => setEditingArticle(null)}
              onOpenExisting={setEditingArticle}
            />

            <ShoppingListPanel
              items={shoppingItems.slice(0, 5)}
              onRestock={handleRestock}
              onRemove={handleRemoveShoppingItem}
              mode="compact"
            />
          </aside>
        ) : null}
      </div>

      <ToastRegion items={toasts} onDismiss={dismissToast} />
      <DialogHost dialog={dialog} onClose={() => setDialog(null)} />
    </>
  );
}