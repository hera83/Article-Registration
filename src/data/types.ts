// Shared data-source contract used by hooks. Both the Supabase adapter
// (hosted/Lovable mode) and the REST adapter (local self-hosted mode)
// implement this interface, so the React layer never depends on either
// directly.

import type { Area, Article, ArticleInput, Tag } from "@/lib/types";

export interface ArticlesApi {
  list(): Promise<Article[]>;
  save(input: ArticleInput): Promise<Article>;
  updateFields(
    id: string,
    patch: Partial<
      Pick<Article, "quantity" | "on_shopping_list" | "shopping_note" | "archived">
    >,
  ): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface AreasApi {
  list(): Promise<Area[]>;
  create(name: string): Promise<void>;
  rename(id: string, name: string): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface TagsApi {
  list(): Promise<Tag[]>;
  rename(id: string, name: string): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface DataAdapter {
  mode: "supabase" | "rest";
  articles: ArticlesApi;
  areas: AreasApi;
  tags: TagsApi;
}
