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
  const activeFilters = [
    filters.query ? { label: `Query: ${filters.query}`, clear: () => onChange({ ...filters, query: '' }) } : null,
    filters.area ? { label: `Area: ${filters.area}`, clear: () => onChange({ ...filters, area: '' }) } : null,
    filters.articleType ? { label: `Type: ${filters.articleType}`, clear: () => onChange({ ...filters, articleType: '' }) } : null,
    filters.tag ? { label: `Tag: ${filters.tag}`, clear: () => onChange({ ...filters, tag: '' }) } : null,
    filters.onShoppingList ? { label: filters.onShoppingList === 'true' ? 'On shopping list' : 'Not on shopping list', clear: () => onChange({ ...filters, onShoppingList: '' }) } : null,
    filters.stockStatus !== 'all' ? { label: filters.stockStatus === 'empty' ? 'Empty stock' : 'In stock', clear: () => onChange({ ...filters, stockStatus: 'all' }) } : null,
    filters.status !== 'active' ? { label: `Status: ${filters.status}`, clear: () => onChange({ ...filters, status: 'active' }) } : null,
  ].filter(Boolean) as Array<{ label: string; clear: () => void }>;

  return (
    <section className="panel search-panel">
      <div className="search-head">
        <p className="kicker">Search-first</p>
        <h2>Search your entire article base</h2>
        <p className="search-subtitle">Search across name, tags, brand, model and notes before you buy again.</p>
      </div>

      <div className="search-grid">
        <FormField label="Search">
          {/* The large search field anchors the page and keeps primary intent obvious. */}
          <input
            className="search-input-primary"
            type="search"
            value={filters.query}
            disabled={isLoading}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="Try: router tp-link ax55, m6 bolt, makita battery"
          />
        </FormField>

        <FormField label="Area">
          <select title="Area" value={filters.area} disabled={isLoading} onChange={(event) => onChange({ ...filters, area: event.target.value })}>
            <option value="">All areas</option>
            {areas.map((area) => (
              <option key={area.id} value={area.name}>
                {area.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Article type">
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
            placeholder="type to filter by tag"
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

      {activeFilters.length > 0 ? (
        <div className="active-filter-bar">
          <div className="chip-row">
            {activeFilters.map((filter) => (
              <button key={filter.label} type="button" className="chip-button active-filter-chip" onClick={filter.clear}>
                {filter.label} ×
              </button>
            ))}
          </div>

          <button type="button" className="ghost-button" disabled={isLoading} onClick={onReset}>
            Clear all filters
          </button>
        </div>
      ) : null}

      <div className="search-footer">
        <span>{resultCount} results</span>
        <span className="search-footer-hint">Short multi-word searches are matched per word for better duplicate checks.</span>
        {isLoading ? <span className="muted-spinner">Updating results...</span> : null}
      </div>
    </section>
  );
}