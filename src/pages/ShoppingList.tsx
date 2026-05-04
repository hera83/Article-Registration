import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, ListChecks, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ArticleDialog } from "@/components/ArticleDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useArticles, useUpdateArticleFields } from "@/hooks/useArticles";
import type { Article } from "@/lib/types";

function ShoppingRow({ article, onOpen }: { article: Article; onOpen: (a: Article) => void }) {
  const update = useUpdateArticleFields();
  const [qty, setQty] = useState<string>(article.quantity != null ? String(article.quantity) : "0");
  const [saving, setSaving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const commit = async () => {
    const n = Number(qty);
    if (Number.isNaN(n) || n === (article.quantity ?? 0)) return;
    setSaving(true);
    try {
      const removeFromList = n > 0;
      await update.mutateAsync({
        id: article.id,
        patch: removeFromList
          ? { quantity: n, on_shopping_list: false }
          : { quantity: n },
      });
      if (removeFromList) {
        toast.success(`${article.name} er fyldt op`, { description: "Fjernet fra indkøbslisten" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kunne ikke opdatere");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{article.name}</h3>
            {article.area && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                {article.area.name}
              </span>
            )}
          </div>
          {(article.brand || article.model) && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">
              {[article.brand, article.model].filter(Boolean).join(" · ")}
            </p>
          )}
          {article.shopping_note && (
            <p className="mt-1 text-xs text-info">📝 {article.shopping_note}</p>
          )}
          {article.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {article.tags.slice(0, 5).map((t) => (
                <span key={t.id} className="text-[11px] text-muted-foreground">
                  #{t.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Input
              type="number"
              inputMode="decimal"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="h-9 w-20 text-center"
              aria-label={`Antal for ${article.name}`}
            />
            {article.unit && (
              <span className="text-xs text-muted-foreground w-8">{article.unit}</span>
            )}
            {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <Button size="icon" variant="ghost" onClick={() => onOpen(article)} aria-label="Åbn artikel" title="Åbn artikel">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setConfirmRemove(true)}
            aria-label="Fjern fra indkøbslisten"
            title="Fjern fra listen"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Fjern fra indkøbslisten?"
        description={
          <>
            Vil du fjerne <span className="font-medium text-foreground">{article.name}</span> fra
            indkøbslisten? Selve artiklen bliver ikke slettet.
          </>
        }
        confirmLabel="Fjern"
        onConfirm={async () => {
          try {
            await update.mutateAsync({ id: article.id, patch: { on_shopping_list: false } });
            toast.success(`Fjernet ${article.name} fra listen`);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Kunne ikke fjerne");
          }
        }}
      />
    </Card>
  );
}

const ShoppingList = () => {
  const { data: articles = [], isLoading } = useArticles();
  const items = articles.filter((a) => a.on_shopping_list && !a.archived);
  const [editing, setEditing] = useState<Article | null>(null);

  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Indkøbsliste</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Opdater antallet, når du har fyldt op. Varen forsvinder automatisk fra listen.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="h-10 w-10" />}
          title="Intet at købe"
          description="Lagervarer, du markerer som nødvendige, vises her."
        />
      ) : (
        <div className="space-y-2.5 animate-fade-in">
          {items.map((a) => (
            <ShoppingRow key={a.id} article={a} onOpen={setEditing} />
          ))}
        </div>
      )}

      <ArticleDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        mode="edit"
        article={editing ?? undefined}
      />
    </div>
  );
};

export default ShoppingList;
