import {
  AppOutlet,
  useAppLocation,
  useAppNavigate,
  useAppSearchParams,
} from "../lib/navigation";
import { Toaster } from "../components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { LayoutGrid, Sheet, BookOpen, RefreshCw } from "lucide-react";
import { useAccounts } from "../features/accounts/useAccounts";
import { AccountFormDialog } from "../features/accounts/components/AccountFormDialog";
import { AccountSearch } from "../features/accounts/components/AccountSearch";
import type { Account } from "../features/accounts/types";
import { useUrlBoolean } from "../lib/hooks/useUrlParam";
import type { LayoutContext } from "./useLayoutContext";
import { toast } from "sonner";
import { useState } from "react";

export type { LayoutContext } from "./useLayoutContext";

export function Layout() {
  const { accounts, tree, byId, loading, setActive, refresh } = useAccounts();
  const [searchParams] = useAppSearchParams();
  const navigate = useAppNavigate();
  const location = useAppLocation();

  const [showInactive, setShowInactive] = useUrlBoolean("show_inactive");

  const view = location.pathname.startsWith("/spreadsheet")
    ? "spreadsheet"
    : "interactive";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [dialogParent, setDialogParent] = useState<Account | null>(null);
  const [dialogAccount, setDialogAccount] = useState<Account | null>(null);

  const onCreateChild = (parent: Account) => {
    setDialogMode("create");
    setDialogParent(parent);
    setDialogAccount(null);
    setDialogOpen(true);
  };
  const onEdit = (account: Account) => {
    setDialogMode("edit");
    setDialogParent(null);
    setDialogAccount(account);
    setDialogOpen(true);
  };
  const onToggleActive = async (account: Account) => {
    try {
      await setActive(account.id, !account.isActive);
      toast.success(account.isActive ? "Conta inativada." : "Conta ativada.");
      if (account.isActive) {
        // account was active, now inactive — reveal it automatically
        setShowInactive(true);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro.");
    }
  };

  const onTabChange = (next: string) => {
    const qs = searchParams.toString();
    const suffix = qs ? `?${qs}` : "";
    if (next === "spreadsheet") navigate(`/spreadsheet${suffix}`);
    else navigate(`/interactive${suffix}`);
  };

  const ctx: LayoutContext = {
    tree,
    byId,
    showInactive,
    setShowInactive,
    onCreateChild,
    onEdit,
    onToggleActive,
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <header className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-foreground text-background flex items-center justify-center">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-medium">Plano de Contas</h1>
              <p className="text-sm text-muted-foreground">
                Visualize e gerencie a estrutura contábil.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <AccountSearch
              accounts={accounts}
              byId={byId}
              showInactive={showInactive}
              setShowInactive={setShowInactive}
            />
            <div className="flex items-center gap-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive" className="text-sm">
                Mostrar inativas
              </Label>
            </div>
          </div>
        </header>

        <Tabs value={view} onValueChange={onTabChange}>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <TabsList>
              <TabsTrigger value="interactive">
                <LayoutGrid className="size-4 mr-1.5" />
                Interativo
              </TabsTrigger>
              <TabsTrigger value="spreadsheet">
                <Sheet className="size-4 mr-1.5" />
                Planilha
              </TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={refresh} title="Recarregar" className="px-2">
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </Tabs>

        {loading ? (
          <div className="text-sm text-muted-foreground">Carregando…</div>
        ) : (
          <AppOutlet context={ctx} />
        )}
      </div>

      <AccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        parent={dialogParent}
        account={dialogAccount}
        onSuccess={refresh}
      />
      <Toaster position="top-right" />
    </div>
  );
}
