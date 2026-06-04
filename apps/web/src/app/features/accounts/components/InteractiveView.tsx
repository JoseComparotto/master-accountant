import { useMemo, type ComponentType, type ReactNode } from "react";
import type { Account, AccountNode } from "../types";
import { CLASS_THEME } from "../ui";
import { PATRIMONIAL_CLASSES, RESULT_CLASSES } from "../constants";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/app/components/ui/context-menu";
import { Home, Plus, Pencil, Eye, EyeOff } from "lucide-react";
import { RootCard } from "./RootCard";
import { ChildCard } from "./ChildCard";
import { AccountName } from "./AccountName";
import { EditButton, ToggleActiveButton } from "./AccountActions";

type LinkComponent = ComponentType<{
  to: string;
  className?: string;
  children?: ReactNode;
}>;

interface Props {
  tree: AccountNode[];
  byId: Map<string, Account>;
  showInactive: boolean;
  currentId: string | null;
  onNavigate: (id: string | null) => void;
  onCreateChild: (parent: Account) => void;
  onEdit: (account: Account) => void;
  onToggleActive: (account: Account) => void;
  Link: LinkComponent;
  homeHref: string;
  hrefForAccount: (id: string) => string;
}

export function InteractiveView({
  tree,
  byId,
  showInactive,
  currentId,
  onNavigate,
  onCreateChild,
  onEdit,
  onToggleActive,
  Link,
  homeHref,
  hrefForAccount,
}: Props) {
  const current = currentId ? byId.get(currentId) ?? null : null;

  const breadcrumb = useMemo(() => {
    const path: Account[] = [];
    let cur = current;
    while (cur) {
      path.unshift(cur);
      cur = cur.parentId ? byId.get(cur.parentId) ?? null : null;
    }
    return path;
  }, [current, byId]);

  const children: AccountNode[] = useMemo(() => {
    if (!current) return tree;
    const findNode = (nodes: AccountNode[]): AccountNode | null => {
      for (const n of nodes) {
        if (n.id === current.id) return n;
        const found = findNode(n.children);
        if (found) return found;
      }
      return null;
    };
    const node = findNode(tree);
    return node ? node.children : [];
  }, [tree, current]);

  const visibleChildren = children.filter((c) => showInactive || c.isActive);

  const visibleRoots = tree.filter((n) => showInactive || n.isActive);
  const patrimonial = visibleRoots.filter((n) =>
    PATRIMONIAL_CLASSES.includes(n.accountClass),
  );
  const results = visibleRoots.filter((n) =>
    RESULT_CLASSES.includes(n.accountClass),
  );

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to={homeHref}
                  className="flex items-center gap-1"
                >
                  <Home className="size-3.5" />
                  Plano de Contas
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumb.map((a, i) => (
              <span key={a.id} className="flex items-center gap-1.5">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {i === breadcrumb.length - 1 ? (
                    <BreadcrumbPage>
                      {a.formattedCode} {a.name}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={hrefForAccount(a.id)}>
                        {a.formattedCode} {a.name}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {current && current.isSummary && (
          <Button size="sm" onClick={() => onCreateChild(current)}>
            <Plus className="size-4 mr-1" />
            Nova conta filha
          </Button>
        )}
      </div>

      {current && (
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={`rounded-2xl border p-5 ${CLASS_THEME[current.accountClass].soft}`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <AccountName account={current} className="text-2xl font-medium" />
                  {current.description && (
                    <p className="text-sm text-muted-foreground mt-2 max-w-prose">
                      {current.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={CLASS_THEME[current.accountClass].chip}>
                      {CLASS_THEME[current.accountClass].label}
                    </Badge>
                    <Badge variant="outline">
                      {current.isSummary ? "Sintética" : "Analítica"}
                    </Badge>
                    <Badge variant="outline">
                      Saldo {current.balanceType === "debit" ? "Devedor" : "Credor"}
                    </Badge>
                    {current.isContra && (
                      <Badge variant="outline" className="text-rose-600 border-rose-200">
                        Redutora
                      </Badge>
                    )}
                    {!current.isActive && <Badge variant="outline">Inativa</Badge>}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <EditButton
                    account={current}
                    onEdit={onEdit}
                    variant="outline"
                    size="sm"
                    showLabel
                  />
                  <ToggleActiveButton
                    account={current}
                    onToggle={onToggleActive}
                    variant="outline"
                    size="sm"
                    showLabel
                  />
                </div>
              </div>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => onEdit(current)}>
              <Pencil className="size-4 mr-2" />
              Editar
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onToggleActive(current)}>
              {current.isActive ? (
                <Eye className="size-4 mr-2" />
              ) : (
                <EyeOff className="size-4 mr-2" />
              )}
              {current.isActive ? "Inativar" : "Ativar"}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}

      {!current && (
        <div className="grid gap-3">
          {patrimonial.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {patrimonial.map((node) => (
                <RootCard
                  key={node.id}
                  node={node}
                  onOpen={() => onNavigate(node.id)}
                  className={
                    node.accountClass === "equity"
                      ? "col-span-2 sm:col-span-1"
                      : ""
                  }
                />
              ))}
            </div>
          )}
          {results.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {results.map((node) => (
                <RootCard
                  key={node.id}
                  node={node}
                  onOpen={() => onNavigate(node.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {current && (
        <div>
          <div className="text-sm text-muted-foreground mb-3">
            {visibleChildren.length === 0
              ? current.isSummary
                ? "Nenhuma conta filha. Crie a primeira."
                : "Conta analítica — não possui filhas."
              : `${visibleChildren.length} ${
                  visibleChildren.length === 1 ? "conta" : "contas"
                }`}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleChildren.map((c) => (
              <ChildCard
                key={c.id}
                node={c}
                onOpen={() => onNavigate(c.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
