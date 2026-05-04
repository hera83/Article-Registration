import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search as SearchIcon, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleDialog } from "@/components/ArticleDialog";
import { ArticleFilters } from "@/components/ArticleFilters";
import { EmptyState } from "@/components/EmptyState";
import { useArticles, useUpdateArticleFields } from "@/hooks/useArticles";
import { filterArticles } from "@/lib/search";
import { DEFAULT_FILTERS, type Article, type Filters } from "@/lib/types";

const Index = () => {
  const { data: articles = [], isLoading } = useArticles();
  const updateFields = useUpdateArticleFields();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [editing, setEditing] = useState<Article | null>(null);
  const [creating, setCreating] = useState(false);

  const results = useMemo(() => filterArticles(articles, filters), [articles, filters]);

  const handleMarkEmpty = async (a: Article) => {
    await updateFields.mutateAsync({ id: a.id, patch: { quantity: 0 } });
    toast.success(`${a.name} marked as empty`, {
      action: a.on_shopping_list
        ? undefined
        : {
            label: "Add to list",
            onClick: () => updateFields.mutate({ id: a.id, patch: { on_shopping_list: true } }),
          },
    });
  };

  const handleToggleShopping = async (a: Article) => {
    const next = !a.on_shopping_list;
    await updateFields.mutateAsync({ id: a.id, patch: { on_shopping_list: next } });
    toast.success(next ? `Added "${a.name}" to shopping list` : `Removed "${a.name}" from list`);
  };

  return (
    <div className="container max-w-5xl py-8 md:py-12">
      <section className="text-center mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Find anything you own</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Search, register, and restock your personal articles.
        </p>
        <div className="relative mt-6 max-w-2xl mx-auto">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Search by name, brand, model, tag…"
            className="h-12 pl-10 pr-4 text-base shadow-elev-sm"
            aria-label="Search articles"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <ArticleFilters filters={filters} onChange={setFilters} />
          <Button variant="outline" size="sm" onClick={() => setCreating(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New article
          </Button>
        </div>
      </section>

      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : results.length === 0 ? (
          articles.length === 0 ? (
            <EmptyState
              icon={<SearchIcon className="h-10 w-10" />}
              title="No articles yet"
              description="Register your first item to start building your personal catalog."
              action={
                <Button onClick={() => setCreating(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add article
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<SearchX className="h-10 w-10" />}
              title="No matches"
              description="Try a different search term or clear some filters."
              action={
                <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Reset filters
                </Button>
              }
            />
          )
        ) : (
          <>
            <p className="mb-3 text-xs text-muted-foreground">
              {results.length} {results.length === 1 ? "article" : "articles"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
              {results.map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  onEdit={setEditing}
                  onMarkEmpty={handleMarkEmpty}
                  onToggleShopping={handleToggleShopping}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <ArticleDialog open={creating} onOpenChange={setCreating} mode="create" />
      <ArticleDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        mode="edit"
        article={editing ?? undefined}
      />
    </div>
  );
};

export default Index;
