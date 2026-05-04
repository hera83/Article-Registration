import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, RotateCcw, Search as SearchIcon, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/IconButton";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleDialog } from "@/components/ArticleDialog";
import { ArticleFilters } from "@/components/ArticleFilters";
import { EmptyState } from "@/components/EmptyState";
import { ShoppingNoteDialog } from "@/components/ShoppingNoteDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useArticles, useUpdateArticleFields } from "@/hooks/useArticles";
import { filterArticles } from "@/lib/search";
import { DEFAULT_FILTERS, type Article, type Filters } from "@/lib/types";

const ROWS_PER_PAGE = 3;

function useColumnCount() {
  const [cols, setCols] = useState(1);
  const [node, setNode] = useState<HTMLElement | null>(null);
  const ref = (el: HTMLElement | null) => setNode(el);

  useEffect(() => {
    if (!node) return;
    const compute = () => {
      const style = window.getComputedStyle(node);
      const template = style.gridTemplateColumns;
      const count =
        template && template !== "none" ? template.split(" ").filter(Boolean).length : 1;
      setCols(Math.max(1, count));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(node);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [node]);

  return [ref, cols] as const;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

const Index = () => {
  const { data: articles = [], isLoading } = useArticles();
  const updateFields = useUpdateArticleFields();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [editing, setEditing] = useState<Article | null>(null);
  const [creating, setCreating] = useState(false);
  const [noteFor, setNoteFor] = useState<Article | null>(null);
  const [page, setPage] = useState(1);

  const results = useMemo(() => filterArticles(articles, filters), [articles, filters]);

  const gridRef = useRef<HTMLDivElement>(null);
  const cols = useColumnCount(gridRef);
  const pageSize = cols * ROWS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = results.slice(startIdx, startIdx + pageSize);


  const handleMarkEmpty = async (a: Article) => {
    await updateFields.mutateAsync({ id: a.id, patch: { quantity: 0 } });
    toast.success(`${a.name} markeret som tom`, {
      action: a.on_shopping_list
        ? undefined
        : {
            label: "Tilføj til liste",
            onClick: () => setNoteFor(a),
          },
    });
  };

  const handleToggleShopping = async (a: Article) => {
    if (a.on_shopping_list) {
      await updateFields.mutateAsync({
        id: a.id,
        patch: { on_shopping_list: false, shopping_note: null },
      });
      toast.success(`Fjernet "${a.name}" fra listen`);
    } else {
      setNoteFor(a);
    }
  };

  return (
    <div className="container max-w-5xl py-8 md:py-12">
      <section className="text-center mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Find alt det, du ejer</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Søg, registrer og hold styr på dine personlige artikler.
        </p>
        <div className="relative mt-6 max-w-2xl mx-auto">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Søg på navn, mærke, model, tag…"
            className="h-12 pl-10 pr-4 text-base shadow-elev-sm"
            aria-label="Søg artikler"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <ArticleFilters filters={filters} onChange={setFilters} />
          <IconButton
            label="Ny artikel"
            icon={<Plus className="h-4 w-4" />}
            variant="outline"
            onClick={() => setCreating(true)}
          />
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
              title="Ingen artikler endnu"
              description="Registrer din første genstand for at begynde dit personlige katalog."
              action={
                <IconButton
                  label="Tilføj artikel"
                  icon={<Plus className="h-4 w-4" />}
                  variant="default"
                  onClick={() => setCreating(true)}
                />
              }
            />
          ) : (
            <EmptyState
              icon={<SearchX className="h-10 w-10" />}
              title="Ingen resultater"
              description="Prøv en anden søgning eller fjern nogle filtre."
              action={
                <IconButton
                  label="Nulstil filtre"
                  icon={<RotateCcw className="h-4 w-4" />}
                  variant="outline"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                />
              }
            />
          )
        ) : (
          <>
            <p className="mb-3 text-xs text-muted-foreground">
              {results.length} {results.length === 1 ? "artikel" : "artikler"}
              {totalPages > 1 && (
                <> · side {currentPage} af {totalPages}</>
              )}
            </p>
            <div
              ref={gridRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in"
            >
              {pageItems.map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  onEdit={setEditing}
                  onMarkEmpty={handleMarkEmpty}
                  onToggleShopping={handleToggleShopping}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setPage(currentPage - 1);
                      }}
                    />
                  </PaginationItem>
                  {getPageNumbers(currentPage, totalPages).map((p, i) =>
                    p === "ellipsis" ? (
                      <PaginationItem key={`e-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setPage(currentPage + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
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
      <ShoppingNoteDialog
        open={!!noteFor}
        onOpenChange={(o) => !o && setNoteFor(null)}
        articleName={noteFor?.name ?? ""}
        initialNote={noteFor?.shopping_note}
        onConfirm={async (note) => {
          if (!noteFor) return;
          await updateFields.mutateAsync({
            id: noteFor.id,
            patch: { on_shopping_list: true, shopping_note: note || null },
          });
          toast.success(`Tilføjet "${noteFor.name}" til indkøbslisten`);
        }}
      />
    </div>
  );
};

export default Index;
