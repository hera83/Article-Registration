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

function EditableRow({
  name,
  onSave,
  onDelete,
}: {
  name: string;
  onSave: (next: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

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
            aria-label="Save"
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
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <span className="text-sm">{name}</span>
          <div className="flex items-center gap-0.5">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(true)} aria-label="Rename">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onDelete}
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
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
      toast.success("Area added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add area");
    }
  };

  return (
    <div className="container max-w-2xl py-8 md:py-12 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </header>

      <Card className="p-5">
        <Label className="text-sm font-medium">Appearance</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">Choose your preferred theme.</p>
        <Tabs value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")} className="mt-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="light">Light</TabsTrigger>
            <TabsTrigger value="dark">Dark</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>

      <Card className="p-5">
        <Label className="text-sm font-medium">Areas</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Flat groupings used to organize articles. Areas in use cannot be deleted.
        </p>
        <div className="mt-3 flex gap-2">
          <Input
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateArea()}
            placeholder="New area name"
            className="h-9"
          />
          <Button onClick={handleCreateArea} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="mt-3 divide-y">
          {areas.map((a) => (
            <EditableRow
              key={a.id}
              name={a.name}
              onSave={async (next) => {
                try {
                  await renameArea.mutateAsync({ id: a.id, name: next });
                  toast.success("Area renamed");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed to rename");
                }
              }}
              onDelete={async () => {
                if (!confirm(`Delete area "${a.name}"?`)) return;
                try {
                  await deleteArea.mutateAsync(a.id);
                  toast.success("Area deleted");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed to delete");
                }
              }}
            />
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <Label className="text-sm font-medium">Tags</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Cross-area labels. Deleting a tag removes it from all articles.
        </p>
        <div className="mt-3 divide-y">
          {tags.map((t) => (
            <EditableRow
              key={t.id}
              name={t.name}
              onSave={async (next) => {
                try {
                  await renameTag.mutateAsync({ id: t.id, name: next });
                  toast.success("Tag renamed");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed to rename");
                }
              }}
              onDelete={async () => {
                if (!confirm(`Delete tag "${t.name}"?`)) return;
                try {
                  await deleteTag.mutateAsync(t.id);
                  toast.success("Tag deleted");
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Failed to delete");
                }
              }}
            />
          ))}
          {tags.length === 0 && (
            <p className="py-3 text-sm text-muted-foreground">No tags yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Settings;
