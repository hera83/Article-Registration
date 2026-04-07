import { useState } from 'react';
import type { ShoppingListItem } from '../../types/articles';
import { StatusCard } from '../feedback/StatusCard';

interface ShoppingListPanelProps {
  items: ShoppingListItem[];
  onRestock: (item: ShoppingListItem, quantity: number) => Promise<void>;
  onRemove: (item: ShoppingListItem) => Promise<void>;
  mode?: 'compact' | 'workspace';
}

function formatQuantity(item: ShoppingListItem): string {
  if (item.quantity === null) {
    return 'n/a';
  }

  return item.unit ? `${item.quantity} ${item.unit}` : `${item.quantity}`;
}

export function ShoppingListPanel({ items, onRestock, onRemove, mode = 'compact' }: ShoppingListPanelProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [justUpdatedId, setJustUpdatedId] = useState<string | null>(null);

  async function handleRestock(item: ShoppingListItem) {
    const quantity = quantities[item.articleId] ?? item.quantity ?? 1;
    setSavingIds((current) => ({ ...current, [item.articleId]: true }));

    try {
      await onRestock(item, quantity);
      setJustUpdatedId(item.articleId);
      window.setTimeout(() => setJustUpdatedId((current) => (current === item.articleId ? null : current)), 1600);
    } finally {
      setSavingIds((current) => ({ ...current, [item.articleId]: false }));
    }
  }

  async function handleRemove(item: ShoppingListItem) {
    setSavingIds((current) => ({ ...current, [item.articleId]: true }));

    try {
      await onRemove(item);
    } finally {
      setSavingIds((current) => ({ ...current, [item.articleId]: false }));
    }
  }

  return (
    <section className={`panel shopping-panel ${mode === 'workspace' ? 'is-workspace' : 'is-compact'}`}>
      <header>
        <p className="kicker">Shopping list</p>
        <h2>{mode === 'workspace' ? 'Fast refill workspace' : 'Refill workflow'}</h2>
        <p className="muted-copy">
          Inline stock updates. When quantity goes above 0, the item leaves this list automatically.
        </p>
      </header>

      {items.length === 0 ? (
        <StatusCard
          title="Shopping list is clear"
          description="Items marked for refill will appear here, and they disappear automatically when stock is updated above zero."
        />
      ) : (
        <div className={`shopping-list ${mode === 'workspace' ? 'workspace-list' : ''}`}>
          {items.map((item) => {
            const quantity = quantities[item.articleId] ?? item.quantity ?? 1;
            const isSaving = savingIds[item.articleId] ?? false;

            return (
              <article key={item.articleId} className="shopping-item">
                <div className="shopping-item-main">
                  <h3>{item.name}</h3>
                  <p className="meta-line">{item.area}</p>
                  {(item.brand || item.model) ? (
                    <p className="meta-line">
                      {item.brand ?? 'No brand'}
                      {' · '}
                      {item.model ?? 'No model'}
                    </p>
                  ) : null}

                  {item.tags.length > 0 ? (
                    <div className="chip-row">
                      {item.tags.map((tag) => (
                        <span key={tag} className="chip muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <p className="meta-line">
                    Current stock: <strong>{formatQuantity(item)}</strong>
                  </p>

                  {item.shoppingNote ? <p className="meta-line">Note: {item.shoppingNote}</p> : null}
                </div>

                <div className="shopping-item-actions">
                  <label className="form-field">
                    <span>Set new quantity</span>
                    <input
                      title="Set quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={quantity}
                      onChange={(event) =>
                        setQuantities((current) => ({
                          ...current,
                          [item.articleId]: Number(event.target.value),
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          void handleRestock(item);
                        }
                      }}
                    />
                  </label>

                  <div className="action-row">
                    <button type="button" disabled={isSaving} onClick={() => void handleRestock(item)}>
                      {isSaving ? 'Saving...' : 'Update stock'}
                    </button>
                    <button type="button" disabled={isSaving} onClick={() => void handleRemove(item)}>
                      Remove
                    </button>
                  </div>

                  {justUpdatedId === item.articleId ? (
                    <p className="muted-copy">Updated</p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
