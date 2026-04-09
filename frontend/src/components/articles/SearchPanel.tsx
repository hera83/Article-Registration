import { useState } from 'react';
import type { AreaOption, TagOption } from '../../types/lookups';
import type { ArticleFilters } from '../../types/articles';
import { FormField } from '../forms/FormField';

interface SearchPanelProps {
  filters: ArticleFilters;
  areas: AreaOption[];
  tags: TagOption[];
  resultCount: number;
  isLoading: boolean;
  onChange: (filters: ArticleFilters) => void;
  onReset: () => void;
}

export function SearchPanel({ filters, areas, tags, resultCount, isLoading, onChange, onReset }: SearchPanelProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const activeFilters = [
    filters.query ? { label: `"${filters.query}"`, key: 'query', clear: () => onChange({ ...filters, query: '' }) } : null,
    filters.area ? { label: filters.area, key: 'area', clear: () => onChange({ ...filters, area: '' }) } : null,
    filters.articleType ? { label: filters.articleType === 'stock' ? 'Stock' : 'Standard', key: 'type', clear: () => onChange({ ...filters, articleType: '' }) } : null,
    filters.tag ? { label: filters.tag, key: 'tag', clear: () => onChange({ ...filters, tag: '' }) } : null,
    filters.onShoppingList ? { label: filters.onShoppingList === 'true' ? 'On shopping list' : 'Not on list', key: 'shopping', clear: () => onChange({ ...filters, onShoppingList: '' }) } : null,
    filters.stockStatus !== 'all' ? { label: filters.stockStatus === 'empty' ? 'Empty stock' : 'In stock', key: 'stock', clear: () => onChange({ ...filters, stockStatus: 'all' }) } : null,
    filters.status !== 'active' ? { label: filters.status === 'archived' ? 'Archived' : 'All statuses', key: 'status', clear: () => onChange({ ...filters, status: 'active' }) } : null,
  ].filter(Boolean) as Array<{ label: string; key: string; clear: () => void }>;

  const filterCount = activeFilters.filter((f) => f.key !== 'query').length;

  return (
    <section className="search-panel">
      {/* ── Search bar ─────────────────────────────────── */}
      <div className="search-bar">
        <div className="search-bar-input-wrap">
          <span className="search-bar-icon" aria-hidden="true">⌕</span>
          <input
            className="search-bar-input"
            type="search"
            value={filters.query}
            disabled={isLoading}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="Search articles — name, brand, model, tags, notes..."
          />
        </div>

        <button
          type="button"
          className={`search-filter-toggle ${filtersExpanded ? 'is-open' : ''} ${filterCount > 0 ? 'has-filters' : ''}`}
          onClick={() => setFiltersExpanded((prev) => !prev)}
          aria-expanded={filtersExpanded ? 'true' : 'false'}
        >
          <span className="search-filter-toggle-icon" aria-hidden="true">☰</span>
          Filters
          {filterCount > 0 && <span className="filter-count-badge">{filterCount}</span>}
        </button>
      </div>

      {/* ── Active filters ────────────────────────────── */}
      {activeFilters.length > 0 && (
        <div className="active-filter-bar">
          <div className="chip-row">
            {activeFilters.map((filter) => (
              <button key={filter.key} type="button" className="active-filter-chip" onClick={filter.clear}>
                <span className="active-filter-chip-label">{filter.label}</span>
                <span className="active-filter-chip-x" aria-hidden="true">×</span>
              </button>
            ))}
          </div>
          <button type="button" className="clear-all-btn" disabled={isLoading} onClick={onReset}>
            Clear all
          </button>
        </div>
      )}

      {/* ── Filter drawer ─────────────────────────────── */}
      {filtersExpanded && (
        <div className="filter-drawer panel">
          <div className="filter-grid">
            <FormField label="Area">
              <select title="Area" value={filters.area} disabled={isLoading} onChange={(event) => onChange({ ...filters, area: event.target.value })}>
                <option value="">All areas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.name}>{area.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Type">
              <select
                title="Article type"
                value={filters.articleType}
                disabled={isLoading}
                onChange={(event) => onChange({ ...filters, articleType: event.target.value as ArticleFilters['articleType'] })}
              >
                <option value="">All types</option>
                <option value="standard">Standard</option>
                <option value="stock">Stock</option>
              </select>
            </FormField>

            <FormField label="Tag">
              <input
                list="tag-options"
                value={filters.tag}
                disabled={isLoading}
                onChange={(event) => onChange({ ...filters, tag: event.target.value })}
                placeholder="Filter by tag"
              />
              <datalist id="tag-options">
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.name} />
                ))}
              </datalist>
            </FormField>

            <FormField label="Shopping list">
              <select
                title="Shopping list"
                value={filters.onShoppingList}
                disabled={isLoading}
                onChange={(event) => onChange({ ...filters, onShoppingList: event.target.value as ArticleFilters['onShoppingList'] })}
              >
                <option value="">All</option>
                <option value="true">On list</option>
                <option value="false">Not on list</option>
              </select>
            </FormField>

            <FormField label="Stock status">
              <select
                title="Stock status"
                value={filters.stockStatus}
                disabled={isLoading}
                onChange={(event) => onChange({ ...filters, stockStatus: event.target.value as ArticleFilters['stockStatus'] })}
              >
                <option value="all">All</option>
                <option value="inStock">In stock</option>
                <option value="empty">Empty</option>
              </select>
            </FormField>

            <FormField label="Status">
              <select
                title="Status"
                value={filters.status}
                disabled={isLoading}
                onChange={(event) => onChange({ ...filters, status: event.target.value as ArticleFilters['status'] })}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="all">All</option>
              </select>
            </FormField>
          </div>
        </div>
      )}

      {/* ── Results bar ───────────────────────────────── */}
      <div className="search-results-bar">
        <span className="search-results-count">
          <strong>{resultCount}</strong> {resultCount === 1 ? 'article' : 'articles'}
        </span>
        {isLoading && <span className="search-loading-dot">Updating…</span>}
      </div>
    </section>
  );
}