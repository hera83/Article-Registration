import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Tag as TagIcon, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const allNames = useMemo(() => allTags.map((t) => t.name), [allTags]);
  const available = useMemo(
    () => allNames.filter((n) => !value.includes(n)),
    [allNames, value],
  );

  const draftTrim = draft.trim();
  const draftLower = draftTrim.toLowerCase();

  const matches = useMemo(() => {
    if (!draftLower) return available.slice(0, 8);
    const starts: string[] = [];
    const contains: string[] = [];
    for (const n of available) {
      const l = n.toLowerCase();
      if (l.startsWith(draftLower)) starts.push(n);
      else if (l.includes(draftLower)) contains.push(n);
    }
    return [...starts, ...contains].slice(0, 8);
  }, [available, draftLower]);

  const exactExists = !!draftTrim && allNames.some((n) => n.toLowerCase() === draftLower);
  const showCreate = !!draftTrim && !exactExists && !value.includes(draftTrim);

  // total selectable items: matches + optional create row
  const totalItems = matches.length + (showCreate ? 1 : 0);

  useEffect(() => {
    setActiveIdx(0);
  }, [draft, open]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const add = (name: string) => {
    const n = name.trim();
    if (!n || value.includes(n)) return;
    onChange([...value, n]);
    setDraft("");
    setActiveIdx(0);
  };

  const selectActive = () => {
    if (matches.length && activeIdx < matches.length) {
      add(matches[activeIdx]);
    } else if (showCreate) {
      add(draftTrim);
    } else if (draftTrim) {
      add(draftTrim);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      if (totalItems === 0) return;
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => (i + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      if (totalItems === 0) return;
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => (i - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      selectActive();
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const renderHighlight = (name: string) => {
    if (!draftLower) return name;
    const idx = name.toLowerCase().indexOf(draftLower);
    if (idx === -1) return name;
    return (
      <>
        {name.slice(0, idx)}
        <mark className="bg-transparent font-semibold text-foreground">
          {name.slice(idx, idx + draftTrim.length)}
        </mark>
        {name.slice(idx + draftTrim.length)}
      </>
    );
  };

  return (
    <div ref={containerRef} className="relative">
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
          onChange={(e) => {
            setDraft(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={value.length ? "" : "Skriv for at søge eller oprette tag…"}
          className="h-7 flex-1 min-w-[8rem] border-0 px-1 shadow-none focus-visible:ring-0"
        />
      </div>

      {open && (matches.length > 0 || showCreate) && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-md border bg-popover shadow-elev-md">
          <ul className="max-h-60 overflow-y-auto py-1 text-sm">
            {matches.map((name, i) => (
              <li key={name}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    add(name);
                  }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors ${
                    i === activeIdx ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                  }`}
                >
                  <TagIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{renderHighlight(name)}</span>
                </button>
              </li>
            ))}
            {showCreate && (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    add(draftTrim);
                  }}
                  onMouseEnter={() => setActiveIdx(matches.length)}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors ${
                    activeIdx === matches.length
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/60"
                  }`}
                >
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    Opret <span className="font-semibold">"{draftTrim}"</span>
                  </span>
                </button>
              </li>
            )}
          </ul>
          {!draftTrim && available.length > 0 && (
            <p className="border-t px-3 py-1.5 text-[11px] text-muted-foreground">
              Eksisterende tags · vælg eller skriv for at filtrere
            </p>
          )}
        </div>
      )}
    </div>
  );
}
