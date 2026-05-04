import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Article, ArticleInput } from "@/lib/types";

const KEY = ["articles"] as const;

interface RawArticle {
  id: string;
  name: string;
  article_type: "normal" | "stock";
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
  area: { id: string; name: string } | null;
  article_tags: { tag: { id: string; name: string } | null }[];
}

function shape(r: RawArticle): Article {
  return {
    ...r,
    area: r.area,
    tags: (r.article_tags || []).map((t) => t.tag).filter((t): t is { id: string; name: string } => !!t),
  };
}

export function useArticles() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<Article[]> => {
      const { data, error } = await supabase
        .from("articles")
        .select(
          "id,name,article_type,area_id,brand,model,note,unit,quantity,typical_location,on_shopping_list,shopping_note,archived,created_at,updated_at,area:areas(id,name),article_tags(tag:tags(id,name))"
        )
        .order("name", { ascending: true });
      if (error) throw error;
      return (data as unknown as RawArticle[]).map(shape);
    },
  });
}

async function ensureTagIds(names: string[]): Promise<string[]> {
  const cleaned = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  if (cleaned.length === 0) return [];

  const { data: existing, error: selErr } = await supabase
    .from("tags")
    .select("id,name")
    .in("name", cleaned);
  if (selErr) throw selErr;

  const have = new Map(existing.map((t) => [t.name, t.id]));
  const missing = cleaned.filter((n) => !have.has(n));
  if (missing.length) {
    const { data: inserted, error: insErr } = await supabase
      .from("tags")
      .insert(missing.map((name) => ({ name })))
      .select("id,name");
    if (insErr) throw insErr;
    inserted.forEach((t) => have.set(t.name, t.id));
  }
  return cleaned.map((n) => have.get(n)!);
}

export function useSaveArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ArticleInput): Promise<Article> => {
      const { tagNames, id, ...rest } = input;
      const payload = {
        ...rest,
        quantity: rest.article_type === "stock" ? rest.quantity ?? 0 : null,
      };

      let articleId = id;
      if (id) {
        const { error } = await supabase.from("articles").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("articles").insert(payload).select("id").single();
        if (error) throw error;
        articleId = data.id;
      }

      const tagIds = await ensureTagIds(tagNames);

      // Replace tag links
      await supabase.from("article_tags").delete().eq("article_id", articleId!);
      if (tagIds.length) {
        const { error: linkErr } = await supabase
          .from("article_tags")
          .insert(tagIds.map((tag_id) => ({ article_id: articleId!, tag_id })));
        if (linkErr) throw linkErr;
      }

      const { data: full, error: fetchErr } = await supabase
        .from("articles")
        .select(
          "id,name,article_type,area_id,brand,model,note,unit,quantity,typical_location,on_shopping_list,shopping_note,archived,created_at,updated_at,area:areas(id,name),article_tags(tag:tags(id,name))"
        )
        .eq("id", articleId!)
        .single();
      if (fetchErr) throw fetchErr;
      return shape(full as unknown as RawArticle);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateArticleFields() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Partial<Pick<Article, "quantity" | "on_shopping_list" | "shopping_note" | "archived">> }) => {
      const { error } = await supabase.from("articles").update(vars.patch).eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
