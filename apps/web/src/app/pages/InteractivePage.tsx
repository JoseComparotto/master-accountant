import { useEffect } from "react";
import {
  AppLink,
  useAppLocation,
  useAppNavigate,
  useAppParams,
} from "../lib/navigation";
import { useLayoutContext } from "./useLayoutContext";
import { InteractiveView } from "../features/accounts/components/InteractiveView";
import { toast } from "sonner";

export function InteractivePage() {
  const ctx = useLayoutContext();
  const navigate = useAppNavigate();
  const location = useAppLocation();
  const { accountId } = useAppParams();

  useEffect(() => {
    if (!accountId) return;
    const account = ctx.byId.get(accountId);
    if (!account) {
      toast.error("Conta não encontrada. Verifique o link.");
      navigate(`/interactive${location.search}`, { replace: true });
      return;
    }
    if (!account.isActive && !ctx.showInactive) {
      ctx.setShowInactive(true);
    }
  // byId changes when data loads; intentionally omit ctx to avoid loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, ctx.byId]);

  const goTo = (id: string | null) => {
    const qs = location.search;
    navigate(id ? `/interactive/${id}${qs}` : `/interactive${qs}`);
  };

  return (
    <InteractiveView
      tree={ctx.tree}
      byId={ctx.byId}
      showInactive={ctx.showInactive}
      currentId={accountId ?? null}
      onNavigate={goTo}
      onCreateChild={ctx.onCreateChild}
      onEdit={ctx.onEdit}
      onToggleActive={ctx.onToggleActive}
      Link={AppLink}
      homeHref={`/interactive${location.search}`}
      hrefForAccount={(id) => `/interactive/${id}${location.search}`}
    />
  );
}
