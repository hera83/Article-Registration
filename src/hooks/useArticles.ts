import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { data } from "@/data";
import type { Article, ArticleInput } from "@/lib/types";

const KEY = ["articles"] as const;

export function useArticles() {
  return useQuery({
    queryKey: KEY,
    queryFn: (): Promise<Article[]> => data.articles.list(),
  });
}

export function useSaveArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ArticleInput) => data.articles.save(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateArticleFields() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      id: string;
      patch: Partial<
        Pick<Article, "quantity" | "on_shopping_list" | "shopping_note" | "archived">
      >;
    }) => data.articles.updateFields(vars.id, vars.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => data.articles.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
