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
    if (isSaving && isEditing) return 'Saving changes...';
    if (isSaving) return 'Saving...';
    return isEditing ? 'Save changes' : 'Create article';
  }, [isEditing, isSaving]);

  const similarArticles = useMemo(() => {
    return getSimilarArticleCandidates(form, existingArticles, editingArticle?.id);
  }, [existingArticles, editingArticle, form]);

  function addTag(rawTag: string) {
    const normalizedTag = rawTag.trim();
    if (!normalizedTag) {
      return;
    }

    if (form.tags.some((tag) => tag.toLowerCase() === normalizedTag.toLowerCase())) {
      setTagInput('');
      return;
    }

    setForm((current) => ({
      ...current,
      tags: [...current.tags, normalizedTag],
    }));
    setTagInput('');
  }

  function removeTag(tagToRemove: string) {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter((tag) => tag !== tagToRemove),
    }));
  }

  function validate(): ValidationErrors {
    const nextErrors: ValidationErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Name is required.';
    }

    if (!form.area.trim()) {
      nextErrors.area = 'Area is required.';
    }

    if (form.articleType === 'stock' && (Number.isNaN(form.quantity) || form.quantity < 0)) {
      nextErrors.quantity = 'Quantity must be 0 or greater.';
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

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
    <form className="panel form-grid" onSubmit={handleSubmit}>
      <h2>{isEditing ? 'Edit article' : 'Create article'}</h2>
      <p className="muted-copy">Few required fields first. Add details only when needed.</p>

      <FormField label="Name">
        <input
          required
          title="Name"
          placeholder="Item name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          autoFocus
        />
        {errors.name ? <small className="inline-error-text">{errors.name}</small> : null}
      </FormField>

      {similarArticles.length > 0 ? (
        <div className="similar-suggestions">
          <strong>Check these before saving</strong>
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

      <FormField label="Article type">
        <select
          title="Article type"
          value={form.articleType}
          onChange={(event) => setForm({ ...form, articleType: event.target.value as ArticleType })}
        >
          <option value="standard">Standard</option>
          <option value="stock">Stock</option>
        </select>
      </FormField>

      <FormField label="Area">
        <input
          required
          title="Area"
          placeholder="Select or type area"
          list="area-options"
          value={form.area}
          onChange={(event) => setForm({ ...form, area: event.target.value })}
        />
        {errors.area ? <small className="inline-error-text">{errors.area}</small> : null}
        <datalist id="area-options">
          {areas.map((area) => (
            <option key={area.id} value={area.name} />
          ))}
        </datalist>
      </FormField>

      <FormField label="Tags">
        <div className="tag-editor">
          <input
            title="Tags"
            placeholder="Type tag and press Enter"
            list="tag-options-form"
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault();
                addTag(tagInput);
              }
            }}
          />
          <button type="button" onClick={() => addTag(tagInput)}>
            Add
          </button>
        </div>
        {form.tags.length > 0 ? (
          <div className="chip-row">
            {form.tags.map((tag) => (
              <button key={tag} type="button" className="chip-button" onClick={() => removeTag(tag)}>
                {tag} ×
              </button>
            ))}
          </div>
        ) : null}
        <datalist id="tag-options-form">
          {tags.map((tag) => (
            <option key={tag.id} value={tag.name} />
          ))}
        </datalist>
      </FormField>

      {form.articleType === 'stock' ? (
        <>
          <FormField label="Unit">
            <input title="Unit" placeholder="pcs, liter, box" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
          </FormField>
          <FormField label="Quantity">
            <input
              title="Quantity"
              type="number"
              min="0"
              step="0.01"
              value={form.quantity}
              onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })}
            />
            {errors.quantity ? <small className="inline-error-text">{errors.quantity}</small> : null}
          </FormField>

          <FormField label="On shopping list">
            <label className="inline-toggle">
              <input
                type="checkbox"
                checked={form.isOnShoppingList}
                onChange={(event) =>
                  setForm({
                    ...form,
                    isOnShoppingList: event.target.checked,
                    shoppingNote: event.target.checked ? form.shoppingNote : '',
                  })
                }
              />
              <span>Mark for shopping</span>
            </label>
          </FormField>

          {form.isOnShoppingList ? (
            <FormField label="Shopping note">
              <input
                title="Shopping note"
                placeholder="Optional note for shopping"
                value={form.shoppingNote}
                onChange={(event) => setForm({ ...form, shoppingNote: event.target.value })}
              />
            </FormField>
          ) : null}
        </>
      ) : null}

      <details className="details-block">
        <summary>More details</summary>

        <div className="details-grid">
          <FormField label="Brand">
            <input title="Brand" placeholder="Brand" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} />
          </FormField>

          <FormField label="Model">
            <input title="Model" placeholder="Model" value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} />
          </FormField>

          <FormField label="Typical location">
            <input
              title="Typical location"
              placeholder="Shelf, box, room"
              value={form.typicalLocation}
              onChange={(event) => setForm({ ...form, typicalLocation: event.target.value })}
            />
          </FormField>

          <FormField label="Note">
            <textarea title="Note" placeholder="Optional notes" rows={3} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
          </FormField>

          <FormField label="Active">
            <label className="inline-toggle">
              <input
                type="checkbox"
                checked={!form.isArchived}
                onChange={(event) => setForm({ ...form, isArchived: !event.target.checked })}
              />
              <span>{form.isArchived ? 'Archived' : 'Active'}</span>
            </label>
          </FormField>
        </div>
      </details>

      <button type="submit" disabled={isSaving}>
        {actionLabel}
      </button>

      {isEditing ? (
        <button type="button" onClick={onCancelEdit} disabled={isSaving}>
          Cancel
        </button>
      ) : null}
    </form>
  );
}