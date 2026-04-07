export type ArticleType = 'standard' | 'stock';

export type ArticleStatus = 'active' | 'archived' | 'all';

export type StockStatus = 'all' | 'inStock' | 'empty';

export interface Article {
  id: string;
  name: string;
  articleType: ArticleType;
  area: string;
  tags: string[];
  note: string | null;
  brand: string | null;
  model: string | null;
  unit: string | null;
  quantity: number;
  isOnShoppingList: boolean;
  shoppingNote: string | null;
  isArchived: boolean;
  typicalLocation: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface ShoppingListItem {
  articleId: string;
  name: string;
  area: string;
  tags: string[];
  brand: string | null;
  model: string | null;
  quantity: number | null;
  unit: string | null;
  shoppingNote: string | null;
}

export interface ArticleFilters {
  query: string;
  area: string;
  articleType: '' | ArticleType;
  tag: string;
  onShoppingList: '' | 'true' | 'false';
  status: ArticleStatus;
  stockStatus: StockStatus;
}

export interface ArticleInput {
  name: string;
  articleType: ArticleType;
  area: string;
  tags: string[];
  note: string;
  brand: string;
  model: string;
  unit: string;
  quantity: number;
  isOnShoppingList: boolean;
  shoppingNote: string;
  isArchived: boolean;
  typicalLocation: string;
}

export interface QuantityUpdateInput {
  quantity: number;
}

export interface ShoppingNoteInput {
  shoppingNote: string;
}

export interface RestockInput {
  quantity: number;
}

export type ThemePreference = 'system' | 'light' | 'dark';