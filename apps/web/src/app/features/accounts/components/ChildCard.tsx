import { ChevronRight, FolderTree, FileText } from "lucide-react";
import type { AccountNode } from "../types";
import { CLASS_THEME } from "../ui";
import { AccountName } from "./AccountName";

export function ChildCard({
  node,
  onOpen,
}: {
  node: AccountNode;
  onOpen: () => void;
}) {
  const theme = CLASS_THEME[node.accountClass];
  const Icon = node.isAbstract ? FolderTree : FileText;
  return (
    <button
      onClick={onOpen}
      className={`group text-left rounded-xl border bg-card p-4 hover:border-foreground/20 hover:shadow-sm transition ${
        !node.isActive ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-lg ${theme.soft} ${theme.text} flex items-center justify-center shrink-0`}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <AccountName account={node} className="font-medium truncate block" />
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{node.isAbstract ? "Sintética" : "Analítica"}</span>
            <span>·</span>
            <span>{node.children.length} filhas</span>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition shrink-0" />
      </div>
    </button>
  );
}
