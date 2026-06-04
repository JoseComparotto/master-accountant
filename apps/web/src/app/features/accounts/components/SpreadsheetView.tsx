import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import type { Account, AccountNode } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/app/components/ui/context-menu";
import {
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  ArrowUpRight,
  Pencil,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import { CLASS_THEME } from "../ui";
import { AccountName } from "./AccountName";
import { CreateChildButton, EditButton, ToggleActiveButton } from "./AccountActions";

const COLLAPSE_KEY = "accounts.spreadsheet.collapsed";

function loadCollapsed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(COLLAPSE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

interface Props {
  tree: AccountNode[];
  showInactive: boolean;
  onCreateChild: (parent: Account) => void;
  onEdit: (account: Account) => void;
  onToggleActive: (account: Account) => void;
  onViewDetails: (account: Account) => void;
}

/** Menu items rendered inside ContextMenu (right-click and "…" button). */
function RowMenuItems({
  row,
  Item,
  Separator,
  onViewDetails,
  onCreateChild,
  onEdit,
  onToggleActive,
}: {
  row: AccountNode;
  Item: ComponentType<{ onClick: () => void; children: ReactNode }>;
  Separator: ComponentType;
  onViewDetails: (a: Account) => void;
  onCreateChild: (a: Account) => void;
  onEdit: (a: Account) => void;
  onToggleActive: (a: Account) => void;
}) {
  return (
    <>
      <Item onClick={() => onViewDetails(row)}>
        <ArrowUpRight className="size-4 mr-2 shrink-0" />
        Ver detalhes
      </Item>
      {row.isSummary && (
        <>
          <Separator />
          <Item onClick={() => onCreateChild(row)}>
            <Plus className="size-4 mr-2 shrink-0" />
            Nova conta filha
          </Item>
        </>
      )}
      <Separator />
      <Item onClick={() => onEdit(row)}>
        <Pencil className="size-4 mr-2 shrink-0" />
        Editar
      </Item>
      <Item onClick={() => onToggleActive(row)}>
        {row.isActive ? (
          <Eye className="size-4 mr-2 shrink-0" />
        ) : (
          <EyeOff className="size-4 mr-2 shrink-0" />
        )}
        {row.isActive ? "Inativar" : "Ativar"}
      </Item>
    </>
  );
}

export function SpreadsheetView({
  tree,
  showInactive,
  onCreateChild,
  onEdit,
  onToggleActive,
  onViewDetails,
}: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  // Hydrate from sessionStorage after mount so the initial render is
  // SSR-safe (no window access during the render phase).
  useEffect(() => {
    setCollapsed(loadCollapsed());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(COLLAPSE_KEY, JSON.stringify([...collapsed]));
  }, [collapsed]);

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const rows: AccountNode[] = [];
  const walk = (nodes: AccountNode[]) => {
    for (const n of nodes) {
      if (!showInactive && !n.isActive) continue;
      rows.push(n);
      if (!collapsed.has(n.id)) walk(n.children);
    }
  };
  walk(tree);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Conta</TableHead>
            <TableHead className="w-px whitespace-nowrap text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const hasChildren = row.children.length > 0;
            const isCollapsed = collapsed.has(row.id);
            const theme = CLASS_THEME[row.accountClass];
            const weight = row.isSummary ? "font-semibold" : "";
            const color = row.isContra ? "" : theme.text;

            const menuProps = {
              row,
              onViewDetails,
              onCreateChild,
              onEdit,
              onToggleActive,
            };

            return (
              <ContextMenu key={row.id}>
                {/*
                 * ContextMenuTrigger asChild merges onContextMenu onto TableRow
                 * via cloneElement. TableRow is not forwardRef so the ref is
                 * silently dropped, but event handlers still reach the <tr>.
                 */}
                <ContextMenuTrigger asChild>
                  <TableRow
                    className="group cursor-pointer"
                    onClick={() => onViewDetails(row)}
                  >
                    {/*
                     * Name cell — style maxWidth:0 is the CSS trick that lets a
                     * table cell shrink below its content's natural width so the
                     * adjacent fixed-width actions cell is never pushed off-screen.
                     */}
                    <TableCell style={{ width: "100%", maxWidth: 0 }}>
                      <div
                        className="flex items-center gap-1"
                        style={{
                          paddingLeft: `calc(${row.depth} * clamp(8px, 1.5vw, 16px))`,
                        }}
                      >
                        {hasChildren ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggle(row.id);
                            }}
                            className="p-0.5 rounded hover:bg-muted shrink-0"
                          >
                            {isCollapsed ? (
                              <ChevronRight className="size-4" />
                            ) : (
                              <ChevronDown className="size-4" />
                            )}
                          </button>
                        ) : (
                          <span className="w-5 shrink-0" />
                        )}
                        {/*
                         * Block wrapper needed: truncate on an inline <span>
                         * (AccountName) has no effect. A block div respects
                         * overflow:hidden + text-overflow:ellipsis correctly.
                         */}
                        <div className="min-w-0 truncate">
                          <AccountName
                            account={row}
                            className={`${weight} ${color}`}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/*
                     * Actions cell — w-px whitespace-nowrap collapses to its
                     * content so it is never pushed off-screen.
                     * click + pointerdown are stopped so the row's onViewDetails
                     * doesn't fire when interacting with action buttons.
                     * contextmenu is NOT stopped so the synthetic event dispatched
                     * by the "…" button can bubble up to ContextMenuTrigger.
                     */}
                    <TableCell
                      className="w-px whitespace-nowrap relative"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      {/*
                       * sm+: invisible "ghost" reserves icon-only width so the
                       * cell never grows. The real buttons (below) overlay it
                       * absolutely and expand leftward over the name cell on
                       * hover, so the name column never shrinks.
                       */}
                      <div
                        className="hidden sm:flex justify-end gap-1 invisible pointer-events-none"
                        aria-hidden
                      >
                        <CreateChildButton parent={row} onCreate={onCreateChild} />
                        <EditButton account={row} onEdit={onEdit} />
                        <ToggleActiveButton account={row} onToggle={onToggleActive} />
                      </div>
                      <div className="hidden sm:flex absolute inset-y-0 right-2 items-center justify-end gap-1">
                        <CreateChildButton parent={row} onCreate={onCreateChild} expandable />
                        <EditButton account={row} onEdit={onEdit} expandable />
                        <ToggleActiveButton account={row} onToggle={onToggleActive} expandable />
                      </div>

                      {/* < sm: "…" button — dispatches a synthetic contextmenu
                          event at its own position so the ContextMenu above opens
                          exactly here, reusing the same menu system. */}
                      <div className="flex sm:hidden justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            e.currentTarget.dispatchEvent(
                              new MouseEvent("contextmenu", {
                                bubbles: true,
                                cancelable: true,
                                clientX: rect.left + rect.width / 2,
                                clientY: rect.top + rect.height / 2,
                              }),
                            );
                          }}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>

                {/* Right-click / long-press context menu */}
                <ContextMenuContent>
                  <RowMenuItems
                    {...menuProps}
                    Item={({ onClick, children }) => (
                      <ContextMenuItem onClick={onClick}>
                        {children}
                      </ContextMenuItem>
                    )}
                    Separator={() => <ContextMenuSeparator />}
                  />
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
