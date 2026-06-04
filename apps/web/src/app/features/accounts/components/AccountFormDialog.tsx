import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Switch } from "@/app/components/ui/switch";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { api } from "@/app/lib/api";
import type { Account } from "../types";
import { CLASS_THEME } from "../ui";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  parent?: Account | null;
  account?: Account | null;
  onSuccess: () => void;
}

export function AccountFormDialog({
  open,
  onOpenChange,
  mode,
  parent,
  account,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSummary, setIsAbstract] = useState(false);
  const [isContra, setIsContra] = useState(false);
  const [autoCode, setAutoCode] = useState(true);
  const [localIndex, setLocalCode] = useState<number>(1);
  const [usedCodes, setUsedCodes] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && account) {
      setName(account.name);
      setDescription(account.description ?? "");
      setIsAbstract(account.isSummary);
      setIsContra(account.isContra);
      return;
    }
    // create
    setName("");
    setDescription("");
    setIsAbstract(false);
    setIsContra(parent?.isContra ?? false);
    setAutoCode(true);
    if (parent) {
      api.accounts.usedLocalIndexes(parent.id).then((codes) => {
        setUsedCodes(codes);
        let i = 1;
        while (codes.includes(i)) i++;
        setLocalCode(i);
      });
    }
  }, [open, mode, account, parent]);

  const nextSuggested = useMemo(() => {
    let i = 1;
    while (usedCodes.includes(i)) i++;
    return i;
  }, [usedCodes]);

  const codeConflict = !autoCode && usedCodes.includes(localIndex);
  const theme = parent ? CLASS_THEME[parent.accountClass] : null;

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Informe o nome da conta.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "create" && parent) {
        await api.accounts.create({
          parentId: parent.id,
          name,
          description,
          isSummary,
          isContra,
          localIndex: autoCode ? undefined : localIndex,
        });
        toast.success("Conta criada.");
      } else if (mode === "edit" && account) {
        await api.accounts.update({
          id: account.id,
          name,
          description,
          isContra,
        });
        toast.success("Conta atualizada.");
      }
      onSuccess();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:p-6 gap-3 sm:gap-4">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nova conta" : "Editar conta"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" && parent ? (
              <>
                Será criada abaixo de{" "}
                <span className="font-medium">
                  {parent.formattedCode} — {parent.name}
                </span>
                .
              </>
            ) : (
              "Estrutura (código e conta superior) não pode ser alterada."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:gap-4">
          {parent && theme && (
            <div className="flex flex-wrap gap-1.5">
              <Badge className={theme.chip}>{theme.label}</Badge>
              {parent.isContra && (
                <Badge variant="outline" className="text-destructive border-destructive/30">
                  Pai redutor
                </Badge>
              )}
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Caixa Geral"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="desc">Descrição</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {mode === "create" && (
            <div className="rounded-lg border divide-y">
              <div className="p-3 grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Label>Código automático</Label>
                    <p className="text-xs text-muted-foreground">
                      Próximo disponível: {parent ? `${parent.formattedCode}.${nextSuggested}` : nextSuggested}
                    </p>
                  </div>
                  <Switch
                    checked={autoCode}
                    onCheckedChange={setAutoCode}
                    className="shrink-0"
                  />
                </div>
                {!autoCode && (
                  <div className="grid gap-1.5">
                    <div className="flex items-center gap-2">
                      {parent && (
                        <div className="h-9 px-3 flex items-center justify-center rounded-md border bg-muted text-sm font-medium text-muted-foreground select-none shrink-0">
                          {parent.formattedCode}.
                        </div>
                      )}
                      <Input
                        id="code"
                        type="number"
                        min={1}
                        value={localIndex}
                        onChange={(e) =>
                          setLocalCode(Math.max(1, Number(e.target.value) || 1))
                        }
                        className={codeConflict ? "border-destructive flex-1" : "flex-1"}
                      />
                    </div>
                    {codeConflict && (
                      <p className="text-xs text-destructive">
                        Código já em uso entre os irmãos.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Label>Sintética</Label>
                  <p className="text-xs text-muted-foreground">
                    Pode ter filhas. Imutável depois.
                  </p>
                </div>
                <Switch
                  checked={isSummary}
                  onCheckedChange={setIsAbstract}
                  className="shrink-0"
                />
              </div>

              <div className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Label>Conta redutora</Label>
                  <p className="text-xs text-muted-foreground">
                    Reduz o saldo das superiores.
                  </p>
                </div>
                <Switch
                  checked={isContra}
                  onCheckedChange={setIsContra}
                  disabled={parent?.isContra}
                  className="shrink-0"
                />
              </div>
            </div>
          )}

          {mode === "edit" && account && (
            <div className="rounded-lg border divide-y">
              <div className="p-3 flex flex-wrap gap-1.5">
                <Badge variant="outline">Código: {account.formattedCode}</Badge>
                <Badge variant="outline">
                  {account.isSummary ? "Sintética" : "Analítica"}
                </Badge>
                <Badge variant="outline">
                  Saldo {account.balanceType === "debit" ? "devedor" : "credor"}
                </Badge>
              </div>
              <div className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Label>Conta redutora</Label>
                  <p className="text-xs text-muted-foreground">
                    Sujeita às regras de hierarquia.
                  </p>
                </div>
                <Switch
                  checked={isContra}
                  onCheckedChange={setIsContra}
                  className="shrink-0"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || (mode === "create" && codeConflict)}
            className="w-full sm:w-auto"
          >
            {mode === "create" ? "Criar conta" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
