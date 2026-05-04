import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
          <TabsTrigger value="all" className="text-xs">Alle</TabsTrigger>
          <TabsTrigger value="normal" className="text-xs">Normal</TabsTrigger>
          <TabsTrigger value="stock" className="text-xs">Lager</TabsTrigger>
        </TabsList>
      </Tabs>

      <Popover>
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="relative" aria-label="Filtre">
                <Filter className="h-4 w-4" />
                {activeCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
                  >
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent>Filtre</TooltipContent>
        </Tooltip>
        <PopoverContent align="start" className="w-80 p-4">
          <div className="space-y-4">
            <section>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Områder</Label>
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
                {areas.length === 0 && (
                  <p className="text-xs text-muted-foreground">Ingen områder.</p>
                )}
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
                {tags.length === 0 && (
                  <p className="text-xs text-muted-foreground">Ingen tags.</p>
                )}
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Indkøb</Label>
                <select
                  value={filters.shopping}
                  onChange={(e) => update("shopping", e.target.value as Filters["shopping"])}
                  className="mt-1.5 w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="all">Alle</option>
                  <option value="on">På listen</option>
                  <option value="off">Ikke på listen</option>
                </select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Lager</Label>
                <select
                  value={filters.stock}
                  onChange={(e) => update("stock", e.target.value as Filters["stock"])}
                  className="mt-1.5 w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="all">Alle</option>
                  <option value="in">På lager</option>
                  <option value="empty">Tom</option>
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
                Inkludér arkiverede
              </Label>
            </section>

            {activeCount > 0 && (
              <div className="flex justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={reset} aria-label="Nulstil filtre">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Nulstil filtre</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
