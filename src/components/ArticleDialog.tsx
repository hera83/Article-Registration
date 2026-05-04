import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IconButton } from "./IconButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "./TagInput";
import { ConfirmDialog } from "./ConfirmDialog";
import { useAreas } from "@/hooks/useAreas";
import { useArticles, useDeleteArticle, useSaveArticle } from "@/hooks/useArticles";
import { findSimilar } from "@/lib/search";
import type { Article, ArticleType } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  article?: Article;
}

interface FormState {
  name: string;
  article_type: ArticleType;
  area_id: string | null;
  brand: string;
  model: string;
  note: string;
  unit: string;
  quantity: string;
  typical_location: string;
  on_shopping_list: boolean;
  shopping_note: string;
  archived: boolean;
  tagNames: string[];
}

const empty: FormState = {
  name: "",
  article_type: "normal",
  area_id: null,
  brand: "",
  model: "",
  note: "",
  unit: "",
  quantity: "",
  typical_location: "",
  on_shopping_list: false,
  shopping_note: "",
  archived: false,
  tagNames: [],
};

function fromArticle(a: Article): FormState {
  return {
    name: a.name,
    article_type: a.article_type,
    area_id: a.area_id,
    brand: a.brand ?? "",
    model: a.model ?? "",
    note: a.note ?? "",
    unit: a.unit ?? "",
    quantity: a.quantity != null ? String(a.quantity) : "",
    typical_location: a.typical_location ?? "",
    on_shopping_list: a.on_shopping_list,
    shopping_note: a.shopping_note ?? "",
    archived: a.archived,
    tagNames: a.tags.map((t) => t.name),
  };
}

export function ArticleDialog({ open, onOpenChange, mode, article }: Props) {
  const { data: areas = [] } = useAreas();
  const { data: articles = [] } = useArticles();
  const save = useSaveArticle();
  const del = useDeleteArticle();

  const [form, setForm] = useState<FormState>(empty);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) setForm(article ? fromArticle(article) : empty);
  }, [open, article]);

  const isStock = form.article_type === "stock";

  const similar = useMemo(() => {
    if (mode !== "create" || form.name.trim().length < 2) return [];
    return findSimilar(articles, { name: form.name, brand: form.brand, model: form.model }, article?.id);
  }, [mode, form.name, form.brand, form.model, articles, article?.id]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Navn er påkrævet");
      return;
    }
    try {
      await save.mutateAsync({
        id: article?.id,
        name: form.name.trim(),
        article_type: form.article_type,
        area_id: form.area_id,
        brand: form.brand.trim() || null,
        model: form.model.trim() || null,
        note: form.note.trim() || null,
        unit: isStock ? form.unit.trim() || null : null,
        quantity: isStock ? (form.quantity === "" ? 0 : Number(form.quantity)) : null,
        typical_location: form.typical_location.trim() || null,
        on_shopping_list: isStock ? form.on_shopping_list : false,
        shopping_note: isStock && form.on_shopping_list ? form.shopping_note.trim() || null : null,
        archived: form.archived,
        tagNames: form.tagNames,
      });
      toast.success(mode === "create" ? "Artikel oprettet" : "Artikel opdateret");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kunne ikke gemme");
    }
  };

  const remove = async () => {
    if (!article) return;
    try {
      await del.mutateAsync(article.id);
      toast.success("Artikel slettet");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kunne ikke slette");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tilføj artikel" : "Rediger artikel"}</DialogTitle>
        </DialogHeader>

        {/* Navn fylder fuld bredde */}
        <div className="mt-2">
          <Label htmlFor="name">Navn</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="f.eks. RJ45 CAT6 stik"
            autoFocus
            className="mt-1.5"
          />
          {similar.length > 0 && (
            <div className="mt-2 rounded-md border border-warning/30 bg-warning/5 p-2.5">
              <p className="text-xs font-medium text-warning">Mulige dubletter:</p>
              <ul className="mt-1 space-y-0.5 text-sm">
                {similar.map((s) => (
                  <li key={s.id} className="text-muted-foreground">
                    • <span className="text-foreground">{s.name}</span>
                    {s.brand && <span className="text-xs"> · {s.brand}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* To kolonner: Meta | Lager */}
        <div className="mt-4 grid gap-5 md:grid-cols-2 md:gap-6">
          {/* Venstre: Meta */}
          <section className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Detaljer
            </p>

            <div>
              <Label>Type</Label>
              <Tabs
                value={form.article_type}
                onValueChange={(v) => update("article_type", v as ArticleType)}
                className="mt-1.5"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="normal">Normal</TabsTrigger>
                  <TabsTrigger value="stock">Lager</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Område</Label>
                <Select
                  value={form.area_id ?? "none"}
                  onValueChange={(v) => update("area_id", v === "none" ? null : v)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Vælg område" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Intet område</SelectItem>
                    {areas.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="loc">Typisk placering</Label>
                <Input
                  id="loc"
                  value={form.typical_location}
                  onChange={(e) => update("typical_location", e.target.value)}
                  placeholder="f.eks. Garagehylde"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="brand">Mærke</Label>
                <Input id="brand" value={form.brand} onChange={(e) => update("brand", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input id="model" value={form.model} onChange={(e) => update("model", e.target.value)} className="mt-1.5" />
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="mt-1.5">
                <TagInput value={form.tagNames} onChange={(v) => update("tagNames", v)} />
              </div>
            </div>

            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={form.note}
                onChange={(e) => update("note", e.target.value)}
                placeholder="Valgfri beskrivelse eller noter"
                className="mt-1.5 min-h-[88px]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <Label htmlFor="arch" className="text-sm font-normal">Arkiveret</Label>
              <Switch id="arch" checked={form.archived} onCheckedChange={(v) => update("archived", v)} />
            </div>
          </section>

          {/* Højre: Lager */}
          <section className="md:border-l md:pl-6 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Lager
            </p>

            {isStock ? (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="qty">Antal</Label>
                    <Input
                      id="qty"
                      type="number"
                      inputMode="decimal"
                      value={form.quantity}
                      onChange={(e) => update("quantity", e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Enhed</Label>
                    <Input
                      id="unit"
                      value={form.unit}
                      onChange={(e) => update("unit", e.target.value)}
                      placeholder="stk, m, L…"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="rounded-lg border bg-secondary/30 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="onlist" className="text-sm font-normal">På indkøbslisten</Label>
                    <Switch
                      id="onlist"
                      checked={form.on_shopping_list}
                      onCheckedChange={(v) => update("on_shopping_list", v)}
                    />
                  </div>
                  {form.on_shopping_list && (
                    <div>
                      <Label htmlFor="snote">Indkøbsnote</Label>
                      <Input
                        id="snote"
                        value={form.shopping_note}
                        onChange={(e) => update("shopping_note", e.target.value)}
                        placeholder="f.eks. Køb en pose med 100"
                        className="mt-1.5"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                Skift type til <span className="font-medium text-foreground">Lager</span> for at
                holde styr på antal og indkøbsliste.
              </div>
            )}
          </section>
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between gap-2">
          {mode === "edit" ? (
            <IconButton
              label="Slet artikel"
              icon={<Trash2 className="h-4 w-4" />}
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            />
          ) : <span />}
          <div className="flex gap-2">
            <IconButton
              label="Annuller"
              icon={<X className="h-4 w-4" />}
              variant="outline"
              onClick={() => onOpenChange(false)}
            />
            <IconButton
              label="Gem"
              icon={save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              variant="default"
              onClick={submit}
              disabled={save.isPending}
            />
          </div>
        </DialogFooter>

        {article && (
          <ConfirmDialog
            open={confirmDelete}
            onOpenChange={setConfirmDelete}
            title="Slet artikel?"
            description={
              <>
                Er du sikker på, at du vil slette{" "}
                <span className="font-medium text-foreground">"{article.name}"</span>? Det kan ikke
                fortrydes.
              </>
            }
            confirmLabel="Slet"
            onConfirm={remove}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
