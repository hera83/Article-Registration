import { Archive, Edit3, MinusCircle, ShoppingCart, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Article } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  article: Article;
  onEdit: (a: Article) => void;
  onMarkEmpty: (a: Article) => void;
  onToggleShopping: (a: Article) => void;
}

const TYPE_LABEL: Record<Article["article_type"], string> = {
  normal: "Normal",
  stock: "Lager",
};

export function ArticleCard({ article, onEdit, onMarkEmpty, onToggleShopping }: Props) {
  const isStock = article.article_type === "stock";
  const qty = article.quantity ?? 0;
  const empty = isStock && qty <= 0;

  return (
    <Card
      className={cn(
        "group relative flex flex-col gap-3 p-4 transition-shadow hover:shadow-elev-md",
        article.archived && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => onEdit(article)}
          className="text-left flex-1 min-w-0"
          aria-label={`Rediger ${article.name}`}
        >
          <h3 className="font-medium leading-tight truncate">{article.name}</h3>
          {(article.brand || article.model) && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">
              {[article.brand, article.model].filter(Boolean).join(" · ")}
            </p>
          )}
        </button>
        <Badge variant={isStock ? "default" : "outline"} className="shrink-0">
          {TYPE_LABEL[article.article_type]}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {article.area && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
            {article.area.name}
          </span>
        )}
        {article.tags.slice(0, 4).map((t) => (
          <span key={t.id} className="inline-flex items-center gap-1 text-muted-foreground">
            <TagIcon className="h-3 w-3" />
            {t.name}
          </span>
        ))}
        {article.tags.length > 4 && (
          <span className="text-muted-foreground">+{article.tags.length - 4}</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2 text-sm">
          {isStock && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                empty
                  ? "bg-warning/15 text-warning"
                  : "bg-success/15 text-success"
              )}
            >
              {empty ? "Tom" : `${qty}${article.unit ? ` ${article.unit}` : ""}`}
            </span>
          )}
          {article.on_shopping_list && (
            <span className="inline-flex items-center gap-1 rounded-md bg-info/15 px-2 py-0.5 text-xs font-medium text-info">
              <ShoppingCart className="h-3 w-3" />
              På liste
            </span>
          )}
          {article.archived && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Archive className="h-3 w-3" />
              Arkiveret
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
          {isStock && !empty && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onMarkEmpty(article)}
              aria-label="Markér som tom"
              title="Markér som tom"
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onToggleShopping(article)}
            aria-label={article.on_shopping_list ? "Fjern fra indkøbslisten" : "Tilføj til indkøbslisten"}
            title={article.on_shopping_list ? "Fjern fra listen" : "Tilføj til indkøbslisten"}
          >
            <ShoppingCart className={cn("h-4 w-4", article.on_shopping_list && "text-info")} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onEdit(article)}
            aria-label="Rediger artikel"
            title="Rediger"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
