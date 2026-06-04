import { useAppOutletContext } from "../lib/navigation";
import type { Account, AccountNode } from "../features/accounts/types";

export interface LayoutContext {
  tree: AccountNode[];
  byId: Map<string, Account>;
  showInactive: boolean;
  setShowInactive: (v: boolean) => void;
  onCreateChild: (parent: Account) => void;
  onEdit: (account: Account) => void;
  onToggleActive: (account: Account) => void;
}

export const useLayoutContext = () => useAppOutletContext<LayoutContext>();
