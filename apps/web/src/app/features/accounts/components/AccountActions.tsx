import { Button } from "@/app/components/ui/button";
import { Eye, EyeOff, Pencil, Plus } from "lucide-react";
import type { Account } from "../types";

/**
 * When `expandable`, the button reveals its label on `group-hover` of an
 * ancestor (e.g. a TableRow with `group`). The label uses a max-width
 * transition so the icon-only width is preserved when not hovered.
 */
const EXPAND_LABEL_CLASSES =
  "inline-block overflow-hidden whitespace-nowrap max-w-0 ml-0 group-hover:max-w-[6rem] group-hover:ml-1 transition-[max-width,margin-left] duration-200";

export function ToggleActiveButton({
  account,
  onToggle,
  variant = "ghost",
  showLabel = false,
  size = "icon",
  expandable = false,
}: {
  account: Account;
  onToggle: (account: Account) => void;
  variant?: "ghost" | "outline";
  showLabel?: boolean;
  size?: "icon" | "sm";
  expandable?: boolean;
}) {
  const Icon = account.isActive ? Eye : EyeOff;
  const label = account.isActive ? "Inativar" : "Ativar";
  return (
    <Button
      variant={variant}
      size={size}
      className={expandable ? "!w-auto px-2" : ""}
      title={label}
      onClick={() => onToggle(account)}
    >
      <Icon className={`size-4 ${showLabel ? "mr-1" : ""}`} />
      {showLabel && label}
      {expandable && <span className={EXPAND_LABEL_CLASSES}>{label}</span>}
    </Button>
  );
}

export function EditButton({
  account,
  onEdit,
  variant = "ghost",
  showLabel = false,
  size = "icon",
  expandable = false,
}: {
  account: Account;
  onEdit: (account: Account) => void;
  variant?: "ghost" | "outline";
  showLabel?: boolean;
  size?: "icon" | "sm";
  expandable?: boolean;
}) {
  return (
    <Button
      variant={variant}
      size={size}
      className={expandable ? "!w-auto px-2" : ""}
      title="Editar"
      onClick={() => onEdit(account)}
    >
      <Pencil className={`size-4 ${showLabel ? "mr-1" : ""}`} />
      {showLabel && "Editar"}
      {expandable && <span className={EXPAND_LABEL_CLASSES}>Editar</span>}
    </Button>
  );
}

export function CreateChildButton({
  parent,
  onCreate,
  variant = "ghost",
  showLabel = false,
  size = "icon",
  expandable = false,
}: {
  parent: Account;
  onCreate: (parent: Account) => void;
  variant?: "ghost" | "outline" | "default";
  showLabel?: boolean;
  size?: "icon" | "sm";
  expandable?: boolean;
}) {
  if (!parent.isAbstract) return null;
  return (
    <Button
      variant={variant}
      size={size}
      className={expandable ? "!w-auto px-2" : ""}
      title="Criar filha"
      onClick={() => onCreate(parent)}
    >
      <Plus className={`size-4 ${showLabel ? "mr-1" : ""}`} />
      {showLabel && "Nova filha"}
      {expandable && <span className={EXPAND_LABEL_CLASSES}>Nova filha</span>}
    </Button>
  );
}
