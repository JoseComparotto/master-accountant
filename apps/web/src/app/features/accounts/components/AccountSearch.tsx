import { useEffect, useMemo, useState } from "react";
import { useAppNavigate, useAppSearchParams } from "@/app/lib/navigation";
import type { Account } from "../types";
import { useUrlString } from "@/app/lib/hooks/useUrlParam";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Popover, PopoverAnchor, PopoverContent } from "@/app/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Search } from "lucide-react";

const norm = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

interface Props {
  accounts: Account[];
  byId: Map<string, Account>;
  showInactive: boolean;
  setShowInactive: (v: boolean) => void;
}

interface ResultListProps {
  q: string;
  results: Account[];
  byId: Map<string, Account>;
  onSelect: (a: Account) => void;
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const nText = norm(text);
  const nQ = norm(query);
  const idx = nText.indexOf(nQ);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-foreground rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function breadcrumbOf(a: Account, byId: Map<string, Account>): string {
  const parts: string[] = [];
  let cur = a.parentId ? byId.get(a.parentId) : undefined;
  while (cur) {
    parts.unshift(cur.name);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return parts.join(" › ");
}

function ResultList({ q, results, byId, onSelect }: ResultListProps) {
  const trimmed = q.trim();
  if (!trimmed) {
    return (
      <CommandEmpty>Digite código, nome ou descrição para buscar…</CommandEmpty>
    );
  }
  if (results.length === 0) {
    return <CommandEmpty>Nenhuma conta encontrada.</CommandEmpty>;
  }
  return (
    <CommandGroup heading={`${results.length} resultado${results.length === 1 ? "" : "s"}`}>
      {results.map((a) => {
        const path = breadcrumbOf(a, byId);
        return (
          <CommandItem
            key={a.id}
            value={a.id}
            onSelect={() => onSelect(a)}
            className="items-start"
          >
            <div className="flex flex-col min-w-0 flex-1 gap-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-muted-foreground tabular-nums shrink-0">
                  {highlight(a.formattedCode, trimmed)}
                </span>
                <span className="truncate">{highlight(a.name, trimmed)}</span>
                {!a.isActive && (
                  <Badge variant="outline" className="ml-auto shrink-0">
                    Inativa
                  </Badge>
                )}
              </div>
              {path && (
                <span className="text-xs text-muted-foreground truncate">
                  {path}
                </span>
              )}
            </div>
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}

export function AccountSearch({
  accounts,
  byId,
  showInactive,
  setShowInactive,
}: Props) {
  const navigate = useAppNavigate();
  const [searchParams] = useAppSearchParams();
  const [urlQ, setUrlQ] = useUrlString("q");
  const [q, setQ] = useState(urlQ);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Sync q → URL (debounced, replace history)
  useEffect(() => {
    const t = setTimeout(() => setUrlQ(q), 200);
    return () => clearTimeout(t);
  }, [q, setUrlQ]);

  // Cmd/Ctrl+K toggles dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setDialogOpen((v) => !v);
        setPopoverOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const query = norm(q.trim());
    if (!query) return [];
    return accounts
      .filter((a) =>
        [a.name, a.formattedCode, a.description ?? ""].some((f) =>
          norm(f).includes(query),
        ),
      )
      .sort((a, b) => a.formattedCode.localeCompare(b.formattedCode))
      .slice(0, 50);
  }, [q, accounts]);

  const select = (a: Account) => {
    if (!a.isActive && !showInactive) setShowInactive(true);
    setPopoverOpen(false);
    setDialogOpen(false);
    // Use the latest searchParams (q is already syncing) to preserve filters.
    const sp = new URLSearchParams(searchParams);
    const v = q.trim();
    if (v) sp.set("q", v);
    else sp.delete("q");
    const qs = sp.toString();
    navigate(`/interactive/${a.id}${qs ? `?${qs}` : ""}`);
  };

  const showPopover = popoverOpen && q.trim().length > 0;

  return (
    <>
      {/* Desktop inline search */}
      <Popover open={showPopover} onOpenChange={setPopoverOpen}>
        <PopoverAnchor asChild>
          <div className="relative hidden sm:block w-56 md:w-64">
            <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={q}
              placeholder="Buscar contas…"
              className="pl-8 pr-12 h-9"
              onChange={(e) => {
                setQ(e.target.value);
                setPopoverOpen(true);
              }}
              onFocus={() => setPopoverOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setPopoverOpen(false);
                if (e.key === "ArrowDown" && results.length > 0) {
                  e.preventDefault();
                  const first = document.querySelector<HTMLElement>(
                    "[data-account-search-popover] [cmdk-item]",
                  );
                  first?.focus();
                }
                if (e.key === "Enter" && results.length > 0) {
                  e.preventDefault();
                  select(results[0]);
                }
              }}
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground border rounded px-1.5 py-0.5 pointer-events-none hidden md:inline-block">
              ⌘K
            </kbd>
          </div>
        </PopoverAnchor>
        <PopoverContent
          data-account-search-popover
          align="start"
          sideOffset={6}
          className="p-0 w-[min(420px,calc(100vw-2rem))]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList className="max-h-[60vh]">
              <ResultList
                q={q}
                results={results}
                byId={byId}
                onSelect={select}
              />
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Mobile icon trigger */}
      <Button
        variant="outline"
        size="icon"
        className="sm:hidden"
        onClick={() => setDialogOpen(true)}
        aria-label="Buscar contas"
      >
        <Search className="size-4" />
      </Button>

      {/* ⌘K / mobile fullscreen dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Buscar conta</DialogTitle>
            <DialogDescription>
              Pesquise por código, nome ou descrição.
            </DialogDescription>
          </DialogHeader>
          <Command shouldFilter={false}>
            <CommandInput
              value={q}
              onValueChange={setQ}
              placeholder="Buscar por código, nome ou descrição…"
            />
            <CommandList className="max-h-[60vh]">
              <ResultList
                q={q}
                results={results}
                byId={byId}
                onSelect={select}
              />
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
