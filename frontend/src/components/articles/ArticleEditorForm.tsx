import { useEffect, useMemo, useState } from 'react';
import { FormField } from '../forms/FormField';
import type { AreaOption, TagOption } from '../../types/lookups';
import type { Article, ArticleInput, ArticleType } from '../../types/articles';
import { getSimilarArticleCandidates } from '../../services/searchInsights';

interface ArticleEditorFormProps {
  areas: AreaOption[];
  tags: TagOption[];
  existingArticles: Article[];
  editingArticle: Article | null;
  onCreate: (input: ArticleInput) => Promise<void>;
  onUpdate: (id: string, input: ArticleInput) => Promise<void>;
  onCancelEdit: () => void;
  onOpenExisting: (article: Article) => void;
}

const initialForm: ArticleInput = {
  name: '',
  articleType: 'standard',
  area: '',
  tags: [],
  note: '',
  brand: '',
  model: '',
  unit: '',
  quantity: 0,
  isOnShoppingList: false,
  shoppingNote: '',
  isArchived: false,
  typicalLocation: '',
};

function mapArticleToInput(article: Article): ArticleInput {
  return {
    name: article.name,
    articleType: article.articleType,
    area: article.area,
    tags: article.tags,
    note: article.note ?? '',
    brand: article.brand ?? '',
    model: article.model ?? '',
    unit: article.unit ?? '',
    quantity: article.quantity ?? 0,
    isOnShoppingList: article.isOnShoppingList,
    shoppingNote: article.shoppingNote ?? '',
    isArchived: article.isArchived,
    typicalLocation: article.typicalLocation ?? '',
  };
}

type ValidationErrors = {
  name?: string;
  area?: string;
  quantity?: string;
};

export function ArticleEditorForm({ areas, tags, existingArticles, editingArticle, onCreate, onUpdate, onCancelEdit, onOpenExisting }: ArticleEditorFormProps) {
  const [form, setForm] = useState<ArticleInput>(initialForm);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(editingArticle);

  useEffect(() => {
    if (editingArticle) {
      setForm(mapArticleToInput(editingArticle));
      setTagInput('');
      setErrors({});
      return;
    }

    setForm(initialForm);
    setTagInput('');
    setErrors({});
  }, [editingArticle]);

  const actionLabel = useMemo(() => {
    if (isSaving && isEditing) return 'Saving changes…';
    if (isSaving) return 'Saving…';
    return isEditing ? 'Save changes' : 'Create article';
  }, [isEditing, isSaving]);

  const similarArticles = useMemo(() => {
    return getSimilarArticleCandidates(form, existingArticles, editingArticle?.id);
  }, [existingArticles, editingArticle, form]);

  function addTag(rawTag: string) {
    const normalizedTag = rawTag.trim();
    if (!normalizedTag) return;
    if (form.tags.some((tag) => tag.toLowerCase() === normalizedTag.toLowerCase())) {
      setTagInput('');
      return;
    }
    setForm((current) => ({ ...current, tags: [...current.tags, normalizedTag] }));
    setTagInput('');
  }

  function removeTag(tagToRemove: string) {
    setForm((current) => ({ ...current, tags: current.tags.filter((tag) => tag !== tagToRemove) }));
  }

  function validate(): ValidationErrors {
    const nextErrors: ValidationErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (!form.area.trim()) nextErrors.area = 'Area is required.';
    if (form.articleType === 'stock' && (Number.isNaN(form.quantity) || form.quantity < 0)) {
      nextErrors.quantity = 'Quantity must be 0 or greater.';
    }
    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);

    const payload: ArticleInput = {
      ...form,
      quantity: form.articleType === 'stock' ? form.quantity : 0,
      isOnShoppingList: form.articleType === 'stock' ? form.isOnShoppingList : false,
      shoppingNote: form.articleType === 'stock' && form.isOnShoppingList ? form.shoppingNote : '',
    };

    try {
      if (editingArticle) {
        await onUpdate(editingArticle.id, payload);
      } else {
        await onCreate(payload);
      }
      setForm(initialForm);
      setTagInput('');
      setErrors({});
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="article-editor panel" onSubmit={handleSubmit}>
      {/* Header */}
      <div className="editor-header">
        <div className="editor-header-text">
          <h2>{isEditing ? 'Edit article' : 'New article'}</h2>
          <p className="muted-copy">{isEditing ? 'Update the details below.' : 'Start with a name and area.'}</p>
        </div>
        {isEditing ? (
          <button type="button" className="editor-close-btn" aria-label="Cancel editing" onClick={onCancelEdit} disabled={isSaving}>
            ×
          </button>
        ) : null}
      </div>

      {/* Section: Essentials */}
      <div className="form-section">
        <span className="form-section-label">Essentials</span>
        <div className="form-section-fields">
          <FormField label="Name" error={errors.name}>
            <input
              required
              title="Name"
              placeholder="Item name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </FormField>

          {similarArticles.length > 0 ? (
            <div className="similar-suggestions">
              <span className="kicker">Check before saving</span>
              <div className="similar-list">
                {similarArticles.map((candidate) => (
                  <button
                    key={candidate.article.id}
                    type="button"
                    className="similar-item"
                    onClick={() => onOpenExisting(candidate.article)}
                  >
                    <span className="similar-item-name">{candidate.article.name}</span>
                    <span className="similar-item-meta">
                      {candidate.article.area}
                      {candidate.article.brand || candidate.article.model
                        ? ` · ${candidate.article.brand ?? 'No brand'} / ${candidate.article.model ?? 'No model'}`
                        : ''}
                    </span>
                    <span className="similar-item-meta">{candidate.reasons.slice(0, 2).join(' · ')}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="form-row">
            <FormField label="Type">
              <select
                title="Article type"
                value={form.articleType}
                onChange={(e) => setForm({ ...form, articleType: e.target.value as ArticleType })}
              >
                <option value="standard">Standard</option>
                <option value="stock">Stock</option>
              </select>
            </FormField>

            <FormField label="Area" error={errors.area}>
              <input
                required
                title="Area"
                placeholder="Select or type"
                list="area-options"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
              />
              <datalist id="area-options">
                {areas.map((area) => (
                  <option key={area.id} value={area.name} />
                ))}
              </datalist>
            </FormField>
          </div>

          <label className="form-field">
            <span>Tags</span>
            <div className="tag-input-row">
              <input
                title="Tags"
                placeholder="Type and press Enter"
                list="tag-options-form"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
              />
              <button type="button" className="tag-add-btn" onClick={() => addTag(tagInput)}>
                Add
              </button>
            </div>
            {form.tags.length > 0 ? (
              <div className="tag-pill-row">
                {form.tags.map((tag) => (
                  <button key={tag} type="button" className="tag-pill" onClick={() => removeTag(tag)}>
                    {tag}
                    <span className="tag-pill-x" aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            ) : null}
            <datalist id="tag-options-form">
              {tags.map((tag) => (
                <option key={tag.id} value={tag.name} />
              ))}
            </datalist>
          </label>
        </div>
      </div>

      {/* Section: Stock (conditional) */}
      {form.articleType === 'stock' ? (
        <div className="form-section">
          <span className="form-section-label">Stock</span>
          <div className="form-section-fields">
            <div className="form-row">
              <FormField label="Unit">
                <input
                  title="Unit"
                  placeholder="pcs, litre, box"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </FormField>

              <FormField label="Quantity" error={errors.quantity}>
                <input
                  title="Quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                />
              </FormField>
            </div>

            <div className="form-field">
              <span>Shopping list</span>
              <label className="inline-toggle">
                <input
                  type="checkbox"
                  checked={form.isOnShoppingList}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isOnShoppingList: e.target.checked,
                      shoppingNote: e.target.checked ? form.shoppingNote : '',
                    })
                  }
                />
                <span>Mark for shopping</span>
              </label>
            </div>

            {form.isOnShoppingList ? (
              <FormField label="Shopping note">
                <input
                  title="Shopping note"
                  placeholder="Optional note for the shopping trip"
                  value={form.shoppingNote}
                  onChange={(e) => setForm({ ...form, shoppingNote: e.target.value })}
                />
              </FormField>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Section: Details (collapsible) */}
      <details className="form-section-details">
        <summary className="form-section-summary">
          <span className="form-section-label">Details</span>
          <span className="form-section-summary-hint">Brand, location, notes</span>
        </summary>
        <div className="form-section-fields form-section-inner">
          <div className="form-row">
            <FormField label="Brand">
              <input title="Brand" placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </FormField>
            <FormField label="Model">
              <input title="Model" placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </FormField>
          </div>

          <FormField label="Typical location">
            <input
              title="Typical location"
              placeholder="Shelf, box, room"
              value={form.typicalLocation}
              onChange={(e) => setForm({ ...form, typicalLocation: e.target.value })}
            />
          </FormField>

          <FormField label="Note">
            <textarea
              title="Note"
              placeholder="Free-form notes"
              rows={3}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </FormField>

          <div className="form-field">
            <span>Status</span>
            <label className="inline-toggle">
              <input
                type="checkbox"
                checked={!form.isArchived}
                onChange={(e) => setForm({ ...form, isArchived: !e.target.checked })}
              />
              <span>{form.isArchived ? 'Archived' : 'Active'}</span>
            </label>
          </div>
        </div>
      </details>

      {/* Footer actions */}
      <div className="editor-actions">
        <button type="submit" disabled={isSaving}>
          {actionLabel}
        </button>
        {isEditing ? (
          <button type="button" className="btn-secondary" onClick={onCancelEdit} disabled={isSaving}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
