import { useState } from 'react';
import type { ShoppingListItem } from '../../types/articles';
import { StatusCard } from '../feedback/StatusCard';

interface ShoppingListPanelProps {
  items: ShoppingListItem[];
  onRestock: (item: ShoppingListItem, quantity: number) => Promise<void>;
  onRemove: (item: ShoppingListItem) => Promise<void>;
  mode?: 'compact' | 'workspace';
}

function formatQty(item: ShoppingListItem): string {
  if (item.quantity === null) return '—';
  return item.unit ? `${item.quantity} ${item.unit}` : `${item.quantity}`;
}

export function ShoppingListPanel({ items, onRestock, onRemove, mode = 'compact' }: ShoppingListPanelProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [doneIds, setDoneIds] = useState<Record<string, boolean>>({});

  function getQty(item: ShoppingListItem): number {
    return quantities[item.articleId] ?? item.quantity ?? 1;
  }

  async function handleRestock(item: ShoppingListItem) {
    const quantity = getQty(item);
    setSavingIds((prev) => ({ ...prev, [item.articleId]: true }));
    try {
      await onRestock(item, quantity);
      setDoneIds((prev) => ({ ...prev, [item.articleId]: true }));
      window.setTimeout(
        () => setDoneIds((prev) => ({ ...prev, [item.articleId]: false })),
        1800,
      );
    } finally {
      setSavingIds((prev) => ({ ...prev, [item.articleId]: false }));
    }
  }

  async function handleRemove(item: ShoppingListItem) {
    setSavingIds((prev) => ({ ...prev, [item.articleId]: true }));
    try {
      await onRemove(item);
    } finally {
      setSavingIds((prev) => ({ ...prev, [item.articleId]: false }));
    }
  }

  /* ── Compact (right-rail sidebar) ─────────────────────────── */

  if (mode === 'compact') {
    return (
      <div className="panel compact-shopping">
        <div className="compact-shopping-header">
          <p className="kicker">Shopping list</p>
          {items.length > 0 ? (
            <span className="compact-shopping-badge">{items.length}</span>
          ) : null}
        </div>

        {items.length === 0 ? (
          <p className="compact-shopping-empty">All clear — nothing needs refilling.</p>
        ) : (
          <ul className="compact-shopping-list">
            {items.map((item) => {
              const qty = getQty(item);
              const isSaving = savingIds[item.articleId] ?? false;
              const isDone = doneIds[item.articleId] ?? false;
              return (
                <li key={item.articleId} className={`compact-shopping-item${isDone ? ' is-done' : ''}`}>
                  <div className="compact-shopping-info">
                    <span className="compact-shopping-name">{item.name}</span>
                    <span className="compact-shopping-area">{item.area}</span>
                  </div>
                  <div className="compact-shopping-action">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={qty}
                      aria-label={`New quantity for ${item.name}`}
                      className="compact-qty-input"
                      disabled={isSaving}
                      onChange={(e) =>
                        setQuantities((prev) => ({ ...prev, [item.articleId]: Number(e.target.value) }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void handleRestock(item);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className={`compact-qty-btn${isDone ? ' is-done' : ''}`}
                      disabled={isSaving}
                      onClick={() => void handleRestock(item)}
                      aria-label={`Update stock for ${item.name}`}
                    >
                      {isDone ? '✓' : '↑'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  /* ── Workspace (full shopping view) ───────────────────────── */

  return (
    <div className="restock-workspace">
      {items.length === 0 ? (
        <StatusCard
          icon="✓"
          title="Shopping list is clear"
          description="Articles marked for refill appear here. They leave automatically once you update their stock above zero."
        />
      ) : (
        <>
          <p className="restock-summary">
            <strong>{items.length}</strong> {items.length === 1 ? 'item needs' : 'items need'} refilling —
            update quantities inline and press <kbd>Enter</kbd> or click <em>Update stock</em>.
          </p>

          <ul className="restock-list">
            {items.map((item) => {
              const qty = getQty(item);
              const isSaving = savingIds[item.articleId] ?? false;
              const isDone = doneIds[item.articleId] ?? false;
              return (
                <li key={item.articleId} className={`restock-item${isDone ? ' is-done' : ''}`}>
                  <div className="restock-item-info">
                    <span className="restock-item-name">{item.name}</span>
                    <span className="restock-item-meta">
                      {item.area}
                      {item.brand || item.model
                        ? ` · ${item.brand ?? '—'} / ${item.model ?? '—'}`
                        : ''}
                    </span>
                    <div className="restock-item-status-row">
                      <span className="restock-current-stock">
                        Current: <strong>{formatQty(item)}</strong>
                      </span>
                      {item.shoppingNote ? (
                        <span className="restock-note">{item.shoppingNote}</span>
                      ) : null}
                    </div>
                    {item.tags.length > 0 ? (
                      <div className="restock-tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="restock-tag">{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="restock-item-action">
                    {isDone ? (
                      <div className="restock-done-flash">
                        <span className="restock-done-icon" aria-hidden="true">✓</span>
                        <span>Updated</span>
                      </div>
                    ) : (
                      <>
                        <div className="restock-qty-row">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={qty}
                            aria-label={`New quantity for ${item.name}`}
                            className="restock-qty-input"
                            disabled={isSaving}
                            onChange={(e) =>
                              setQuantities((prev) => ({
                                ...prev,
                                [item.articleId]: Number(e.target.value),
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                void handleRestock(item);
                              }
                            }}
                          />
                          {item.unit ? (
                            <span className="restock-qty-unit">{item.unit}</span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="restock-update-btn"
                          disabled={isSaving}
                          onClick={() => void handleRestock(item)}
                        >
                          {isSaving ? 'Saving…' : 'Update stock'}
                        </button>
                        <button
                          type="button"
                          className="restock-remove-btn"
                          disabled={isSaving}
                          onClick={() => void handleRemove(item)}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
