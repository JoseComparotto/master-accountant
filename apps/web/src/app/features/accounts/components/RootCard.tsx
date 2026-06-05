import type { AccountNode, AccountClass } from "../types";
import { CLASS_THEME } from "../ui";
import {
  Plus as PlusIcon,
  Minus,
  Scale,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ROOT_ABBREVIATION: Record<AccountClass, string> = {
  asset: "Ativo",
  liability: "Passivo",
  equity: "PL",
  income: "Receitas",
  expense: "Despesas",
};

const ROOT_ICON: Record<AccountClass, LucideIcon> = {
  asset: PlusIcon,
  liability: Minus,
  equity: Scale,
  income: TrendingUp,
  expense: TrendingDown,
};

export function RootCard({
  node,
  onOpen,
  className = "",
}: {
  node: AccountNode;
  onOpen: () => void;
  className?: string;
}) {
  const theme = CLASS_THEME[node.accountClass];
  const Icon = ROOT_ICON[node.accountClass];
  const label = ROOT_ABBREVIATION[node.accountClass];
  return (
    <button
      onClick={onOpen}
      className={`group flex flex-col items-center justify-center gap-2 rounded-xl border-2 ${theme.border} ${theme.soft} p-4 hover:shadow-md transition active:scale-[0.99] ${className}`}
    >
      <div
        className={`w-10 h-10 rounded-lg ${theme.bg} flex items-center justify-center text-white`}
      >
        <Icon className="size-5" />
      </div>
      <div className="font-medium">{label}</div>
    </button>
  );
}
