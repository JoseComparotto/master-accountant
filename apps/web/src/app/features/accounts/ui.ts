import type { AccountClass } from "./types";

export const CLASS_THEME: Record<
  AccountClass,
  { label: string; bg: string; border: string; text: string; chip: string; soft: string }
> = {
  asset: {
    label: "Ativo",
    bg: "bg-emerald-500",
    border: "border-emerald-200",
    text: "text-emerald-700",
    chip: "bg-emerald-100 text-emerald-700",
    soft: "bg-emerald-50",
  },
  liability: {
    label: "Passivo",
    bg: "bg-amber-500",
    border: "border-amber-200",
    text: "text-amber-700",
    chip: "bg-amber-100 text-amber-700",
    soft: "bg-amber-50",
  },
  equity: {
    label: "Patrimônio Líquido",
    bg: "bg-indigo-500",
    border: "border-indigo-200",
    text: "text-indigo-700",
    chip: "bg-indigo-100 text-indigo-700",
    soft: "bg-indigo-50",
  },
  revenue: {
    label: "Receitas",
    bg: "bg-sky-500",
    border: "border-sky-200",
    text: "text-sky-700",
    chip: "bg-sky-100 text-sky-700",
    soft: "bg-sky-50",
  },
  expense: {
    label: "Despesas",
    bg: "bg-rose-500",
    border: "border-rose-200",
    text: "text-rose-700",
    chip: "bg-rose-100 text-rose-700",
    soft: "bg-rose-50",
  },
};
