import type { Article, Filters } from "./types";

export function filterArticles(articles: Article[], f: Filters): Article[] {
  const q = f.q.trim().toLowerCase();
  return articles.filter((a) => {
    if (f.status === "active" && a.archived) return false;
    if (f.status === "archived" && !a.archived) return false;

    if (f.type !== "all" && a.article_type !== f.type) return false;

    if (f.areaIds.length && (!a.area_id || !f.areaIds.includes(a.area_id))) return false;

    if (f.tagNames.length) {
      const names = new Set(a.tags.map((t) => t.name));
      if (!f.tagNames.every((t) => names.has(t))) return false;
    }

    if (f.shopping === "on" && !a.on_shopping_list) return false;
    if (f.shopping === "off" && a.on_shopping_list) return false;

    if (f.stock !== "all" && a.article_type === "stock") {
      const qty = a.quantity ?? 0;
      if (f.stock === "in" && qty <= 0) return false;
      if (f.stock === "empty" && qty > 0) return false;
    }

    if (q) {
      const hay = [
        a.name,
        a.note ?? "",
        a.brand ?? "",
        a.model ?? "",
        a.tags.map((t) => t.name).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}

/** Cheap similarity: shared lowercase tokens between two strings. */
function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 2)
  );
}

export function findSimilar(
  articles: Article[],
  draft: { name: string; brand?: string | null; model?: string | null },
  excludeId?: string,
  limit = 3
): Article[] {
  const needle = tokens([draft.name, draft.brand ?? "", draft.model ?? ""].join(" "));
  if (needle.size === 0) return [];

  const scored = articles
    .filter((a) => a.id !== excludeId)
    .map((a) => {
      const hay = tokens(
        [a.name, a.brand ?? "", a.model ?? "", a.tags.map((t) => t.name).join(" ")].join(" ")
      );
      let overlap = 0;
      needle.forEach((t) => {
        if (hay.has(t)) overlap += 1;
      });
      return { a, score: overlap };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((x) => x.a);
}
