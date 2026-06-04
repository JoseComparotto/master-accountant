import { useAppLocation, useAppNavigate } from "../lib/navigation";
import { useLayoutContext } from "./useLayoutContext";
import { SpreadsheetView } from "../features/accounts/components/SpreadsheetView";

export function SpreadsheetPage() {
  const ctx = useLayoutContext();
  const navigate = useAppNavigate();
  const location = useAppLocation();

  return (
    <SpreadsheetView
      tree={ctx.tree}
      showInactive={ctx.showInactive}
      onCreateChild={ctx.onCreateChild}
      onEdit={ctx.onEdit}
      onToggleActive={ctx.onToggleActive}
      onViewDetails={(account) =>
        navigate(`/interactive/${account.id}${location.search}`)
      }
    />
  );
}
