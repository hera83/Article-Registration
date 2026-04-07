import { requestJson } from './httpClient';
import type {
  Article,
  ArticleFilters,
  ArticleInput,
  QuantityUpdateInput,
  RestockInput,
  ShoppingListItem,
  ShoppingNoteInput,
} from '../types/articles';

function toArticleQueryString(filters: ArticleFilters): string {
  const params = new URLSearchParams();

  if (filters.query) params.set('query', filters.query);
  if (filters.area) params.set('area', filters.area);
  if (filters.articleType) params.set('articleType', filters.articleType);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.onShoppingList) params.set('onShoppingList', filters.onShoppingList);
  if (filters.status !== 'active') params.set('status', filters.status);
  if (filters.stockStatus !== 'all') params.set('stockStatus', filters.stockStatus);

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function getArticles(filters: ArticleFilters): Promise<Article[]> {
  return requestJson<Article[]>(`/api/articles/${toArticleQueryString(filters)}`);
}

export function getArticleById(id: string): Promise<Article> {
  return requestJson<Article>(`/api/articles/${id}`);
}

export function createArticle(input: ArticleInput): Promise<Article> {
  return requestJson<Article>('/api/articles/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateArticle(id: string, input: ArticleInput): Promise<Article> {
  return requestJson<Article>(`/api/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function archiveArticle(id: string): Promise<Article> {
  return requestJson<Article>(`/api/articles/${id}/archive`, { method: 'PATCH' });
}

export function reactivateArticle(id: string): Promise<Article> {
  return requestJson<Article>(`/api/articles/${id}/reactivate`, { method: 'PATCH' });
}

export function getShoppingList(): Promise<ShoppingListItem[]> {
  return requestJson<ShoppingListItem[]>('/api/articles/shopping-list');
}

export function addToShoppingList(id: string, input: ShoppingNoteInput): Promise<Article> {
  return requestJson<Article>(`/api/articles/${id}/shopping-list`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function removeFromShoppingList(id: string): Promise<Article> {
  return requestJson<Article>(`/api/articles/${id}/shopping-list`, {
    method: 'DELETE',
  });
}

export function setQuantity(id: string, input: QuantityUpdateInput): Promise<Article> {
  return requestJson<Article>(`/api/articles/${id}/quantity`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function runOut(id: string, input: ShoppingNoteInput): Promise<Article> {
  return requestJson<Article>(`/api/articles/${id}/run-out`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function restockFromShoppingList(id: string, input: RestockInput): Promise<Article> {
  return requestJson<Article>(`/api/articles/${id}/restock`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}