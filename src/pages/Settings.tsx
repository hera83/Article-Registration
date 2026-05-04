import { useState } from "react";
import { toast } from "sonner";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/ThemeProvider";
import { useAreas, useCreateArea, useDeleteArea, useRenameArea } from "@/hooks/useAreas";
import { useDeleteTag, useRenameTag, useTags } from "@/hooks/useTags";
import { ConfirmDialog } from "@/components/ConfirmDialog";

function EditableRow({
  name,
  onSave,
  onDelete,
  deleteTitle,
  deleteDescription,
}: {
  name: string;
  onSave: (next: string) => Promise<void>;
  onDelete: () => Promise<void>;
  deleteTitle: string;
  deleteDescription: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      {editing ? (
        <>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-8"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSave(value).then(() => setEditing(false));
              } else if (e.key === "Escape") {
                setValue(name);
                setEditing(false);
              }
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onSave(value).then(() => setEditing(false))}
            aria-label="Gem"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => {
              setValue(name);
              setEditing(false);
            }}
            aria-label="Annuller"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <span className="text-sm">{name}</span>
          <div className="flex items-center gap-0.5">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(true)} aria-label="Omdøb">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
              aria-label="Slet"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={deleteTitle}
            description={deleteDescription}
            confirmLabel="Slet"
            onConfirm={onDelete}
          />
        </>
      )}
    </div>
  );
}

const Settings = () => {
  const { theme, setTheme } = useTheme();

  const { data: areas = [] } = useAreas();
  const createArea = useCreateArea();
  const renameArea = useRenameArea();
  const deleteArea = useDeleteArea();
  const [newArea, setNewArea] = useState("");

  const { data: tags = [] } = useTags();
  const renameTag = useRenameTag();
  const deleteTag = useDeleteTag();

  const handleCreateArea = async () => {
    if (!newArea.trim()) return;
    try {
      await createArea.mutateAsync(newArea);
      setNewArea("");
      toast.success("Område tilføjet");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kunne ikke tilføje område");
    }
  };

  return (
    <div className="container max-w-2xl py-8 md:py-12 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Indstillinger</h1>
      </header>

      <Card className="p-5">
        <Label className="text-sm font-medium">Udseende</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">Vælg dit foretrukne tema.</p>
        <Tabs value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")} className="mt-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="light">Lyst</TabsTrigger>
            <TabsTrigger value="dark">Mørkt</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>

      <Card className="p-5">
        <Label className="text-sm font-medium">Områder</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Flade grupperinger til at organisere artikler. Områder, der er i brug, kan ikke slettes.
        </p>
        <div className="mt-3 flex gap-2">
          <Input
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateArea()}
            placeholder="Nyt områdenavn"
            className="h-9"
          />
          <Button onClick={handleCreateArea} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Tilføj
          </Button>
        </div>
        <div className="mt-3 divide-y">
          {areas.map((a) => (
            <EditableRow
              key={a.id}
              name={a.name}
              deleteTitle="Slet område?"
              deleteDescription={
                <>
                  Er du sikker på, at du vil slette området{" "}
                  <span className="font-medium text-foreground">"{a.name}"</span>? Det kan ikke fortrydes.
                </>
              }
              onSave={async (next) => {
                try {
                  await renameArea.mutateAsync({ id: a.id, name: next });
                  toast.success("Område omdøbt");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Kunne ikke omdøbe");
                }
              }}
              onDelete={async () => {
                try {
                  await deleteArea.mutateAsync(a.id);
                  toast.success("Område slettet");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Kunne ikke slette");
                }
              }}
            />
          ))}
          {areas.length === 0 && (
            <p className="py-3 text-sm text-muted-foreground">Ingen områder endnu.</p>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <Label className="text-sm font-medium">Tags</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Etiketter på tværs af områder. Sletning fjerner tagget fra alle artikler.
        </p>
        <div className="mt-3 divide-y">
          {tags.map((t) => (
            <EditableRow
              key={t.id}
              name={t.name}
              deleteTitle="Slet tag?"
              deleteDescription={
                <>
                  Er du sikker på, at du vil slette tagget{" "}
                  <span className="font-medium text-foreground">"{t.name}"</span>? Det fjernes fra
                  alle artikler. Det kan ikke fortrydes.
                </>
              }
              onSave={async (next) => {
                try {
                  await renameTag.mutateAsync({ id: t.id, name: next });
                  toast.success("Tag omdøbt");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Kunne ikke omdøbe");
                }
              }}
              onDelete={async () => {
                try {
                  await deleteTag.mutateAsync(t.id);
                  toast.success("Tag slettet");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Kunne ikke slette");
                }
              }}
            />
          ))}
          {tags.length === 0 && (
            <p className="py-3 text-sm text-muted-foreground">Ingen tags endnu.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Settings;
