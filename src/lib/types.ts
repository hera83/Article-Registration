export type ArticleType = "normal" | "stock";

export interface Area {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Article {
  id: string;
  name: string;
  article_type: ArticleType;
  area_id: string | null;
  brand: string | null;
  model: string | null;
  note: string | null;
  unit: string | null;
  quantity: number | null;
  typical_location: string | null;
  on_shopping_list: boolean;
  shopping_note: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
  tags: Tag[];
  area: Area | null;
}

export type ArticleInput = {
  id?: string;
  name: string;
  article_type: ArticleType;
  area_id: string | null;
  brand: string | null;
  model: string | null;
  note: string | null;
  unit: string | null;
  quantity: number | null;
  typical_location: string | null;
  on_shopping_list: boolean;
  shopping_note: string | null;
  archived: boolean;
  tagNames: string[];
};

export interface Filters {
  q: string;
  type: "all" | "normal" | "stock";
  areaIds: string[];
  tagNames: string[];
  shopping: "all" | "on" | "off";
  stock: "all" | "in" | "empty";
  status: "active" | "archived" | "all";
}

export const DEFAULT_FILTERS: Filters = {
  q: "",
  type: "all",
  areaIds: [],
  tagNames: [],
  shopping: "all",
  stock: "all",
  status: "active",
};
