import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleName: string;
  initialNote?: string | null;
  onConfirm: (note: string) => void | Promise<void>;
}

export function ShoppingNoteDialog({
  open,
  onOpenChange,
  articleName,
  initialNote,
  onConfirm,
}: Props) {
  const [note, setNote] = useState(initialNote ?? "");

  useEffect(() => {
    if (open) setNote(initialNote ?? "");
  }, [open, initialNote]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tilføj til indkøbslisten</DialogTitle>
          <DialogDescription>
            Tilføj en valgfri note til <span className="font-medium text-foreground">{articleName}</span> (fx mængde eller mærke).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="shopping-note">Note (valgfri)</Label>
          <Textarea
            id="shopping-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="fx 2 stk., bestemt mærke…"
            rows={3}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuller
          </Button>
          <Button
            onClick={async () => {
              await onConfirm(note.trim());
              onOpenChange(false);
            }}
          >
            Tilføj til liste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
