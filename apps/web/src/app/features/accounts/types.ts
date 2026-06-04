export type AccountClass =
  | "asset"
  | "liability"
  | "equity"
  | "revenue"
  | "expense";

export type BalanceType = "debit" | "credit";

export interface Account {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  localIndex: number;
  formattedCode: string;
  accountClass: AccountClass;
  balanceType: BalanceType;
  isSummary: boolean;
  isContra: boolean;
  isActive: boolean;
}

export interface CreateAccountInput {
  id?: string;
  parentId: string;
  localIndex?: number;
  name: string;
  description?: string | null;
  isSummary: boolean;
  isContra: boolean;
}

export interface UpdateAccountInput {
  id: string;
  name?: string;
  description?: string;
  isContra?: boolean;
  isActive?: boolean;
}

export interface AccountNode extends Account {
  children: AccountNode[];
  depth: number;
}

export const ACCOUNT_CLASS_LABEL: Record<AccountClass, string> = {
  asset: "Ativo",
  liability: "Passivo",
  equity: "Patrimônio Líquido",
  revenue: "Receitas",
  expense: "Despesas",
};
