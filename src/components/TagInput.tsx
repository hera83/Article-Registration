import { KeyboardEvent, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTags } from "@/hooks/useTags";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

export function TagInput({ value, onChange }: Props) {
  const { data: allTags = [] } = useTags();
  const [draft, setDraft] = useState("");

  const suggestions = draft
    ? allTags
        .map((t) => t.name)
        .filter((n) => n.toLowerCase().includes(draft.toLowerCase()) && !value.includes(n))
        .slice(0, 6)
    : [];

  const add = (name: string) => {
    const n = name.trim();
    if (!n || value.includes(n)) return;
    onChange([...value, n]);
    setDraft("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Fjern ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => draft && add(draft)}
          placeholder={value.length ? "" : "Tilføj tag, tryk Enter"}
          className="h-7 flex-1 min-w-[8rem] border-0 px-1 shadow-none focus-visible:ring-0"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground hover:bg-secondary"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
