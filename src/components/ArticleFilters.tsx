import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAreas } from "@/hooks/useAreas";
import { useTags } from "@/hooks/useTags";
import { DEFAULT_FILTERS, type Filters } from "@/lib/types";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function ArticleFilters({ filters, onChange }: Props) {
  const { data: areas = [] } = useAreas();
  const { data: tags = [] } = useTags();

  const update = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  const activeCount =
    (filters.areaIds.length > 0 ? 1 : 0) +
    (filters.tagNames.length > 0 ? 1 : 0) +
    (filters.shopping !== "all" ? 1 : 0) +
    (filters.stock !== "all" ? 1 : 0) +
    (filters.status !== "active" ? 1 : 0);

  const reset = () => onChange({ ...DEFAULT_FILTERS, q: filters.q });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tabs
        value={filters.type}
        onValueChange={(v) => update("type", v as Filters["type"])}
      >
        <TabsList className="h-9">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="normal" className="text-xs">Normal</TabsTrigger>
          <TabsTrigger value="stock" className="text-xs">Stock</TabsTrigger>
        </TabsList>
      </Tabs>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {activeCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-4">
          <div className="space-y-4">
            <section>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Areas</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {areas.map((a) => {
                  const on = filters.areaIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() =>
                        update(
                          "areaIds",
                          on ? filters.areaIds.filter((x) => x !== a.id) : [...filters.areaIds, a.id]
                        )
                      }
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-secondary"
                      }`}
                    >
                      {a.name}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Tags</Label>
              <div className="mt-2 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {tags.map((t) => {
                  const on = filters.tagNames.includes(t.name);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        update(
                          "tagNames",
                          on
                            ? filters.tagNames.filter((x) => x !== t.name)
                            : [...filters.tagNames, t.name]
                        )
                      }
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-secondary"
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Shopping</Label>
                <select
                  value={filters.shopping}
                  onChange={(e) => update("shopping", e.target.value as Filters["shopping"])}
                  className="mt-1.5 w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="all">All</option>
                  <option value="on">On list</option>
                  <option value="off">Not on list</option>
                </select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Stock</Label>
                <select
                  value={filters.stock}
                  onChange={(e) => update("stock", e.target.value as Filters["stock"])}
                  className="mt-1.5 w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="all">All</option>
                  <option value="in">In stock</option>
                  <option value="empty">Empty</option>
                </select>
              </div>
            </section>

            <section className="flex items-center gap-2">
              <Checkbox
                id="archived"
                checked={filters.status !== "active"}
                onCheckedChange={(v) => update("status", v ? "all" : "active")}
              />
              <Label htmlFor="archived" className="text-sm font-normal">
                Include archived
              </Label>
            </section>

            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={reset} className="w-full">
                <X className="mr-1.5 h-3.5 w-3.5" /> Reset filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
