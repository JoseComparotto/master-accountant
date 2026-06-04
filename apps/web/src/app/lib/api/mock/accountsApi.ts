import type {
  Account,
  AccountClass,
  CreateAccountInput,
  UpdateAccountInput,
  BalanceType,
} from "../../../features/accounts/types";
import { isValidUuid, uuid } from "../../uuid";
import type { AccountsApi } from "../contract";

// ---------------------------------------------------------------------------
// Mock REST API for Chart of Accounts.
//
// In production this module would proxy HTTP requests (fetch/axios) to the
// backend. For now everything is stored in-memory so the UI can be developed
// and integrated. The public surface mirrors what a REST client would expose,
// making the swap to real endpoints straightforward.
// ---------------------------------------------------------------------------

const NETWORK_DELAY = 120;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY));
}

function computeBalanceType(
  accountClass: AccountClass,
  isContra: boolean,
): BalanceType {
  const naturallyDebit = accountClass === "asset" || accountClass === "expense";
  // XOR with isContra
  const isDebit = naturallyDebit !== isContra;
  return isDebit ? "debit" : "credit";
}

const ROOTS: Array<{ name: string; accountClass: AccountClass; localCode: number }> = [
  { name: "ATIVO", accountClass: "asset", localCode: 1 },
  { name: "PASSIVO", accountClass: "liability", localCode: 2 },
  { name: "PATRIMÔNIO LÍQUIDO", accountClass: "equity", localCode: 3 },
  { name: "RECEITAS", accountClass: "revenue", localCode: 4 },
  { name: "DESPESAS", accountClass: "expense", localCode: 5 },
];

function seed(): Account[] {
  const list: Account[] = [];

  const make = (
    parentId: string | null,
    localCode: number,
    name: string,
    accountClass: AccountClass,
    isAbstract: boolean,
    description?: string,
    isContra = false,
  ): Account => {
    const parent = parentId ? list.find((a) => a.id === parentId) : null;
    const formattedCode = parent
      ? `${parent.formattedCode}.${localCode}`
      : String(localCode);
    const acc: Account = {
      id: uuid(),
      parentId,
      formattedCode,
      localCode,
      name,
      description,
      accountClass,
      isAbstract,
      isContra,
      balanceType: computeBalanceType(accountClass, isContra),
      isActive: true,
    };
    list.push(acc);
    return acc;
  };

  for (const r of ROOTS) {
    make(null, r.localCode, r.name, r.accountClass, true);
  }
  const ativo = list.find((a) => a.localCode === 1 && a.parentId === null)!;
  const passivo = list.find((a) => a.localCode === 2 && a.parentId === null)!;
  const pl = list.find((a) => a.localCode === 3 && a.parentId === null)!;

  const ativoCirc = make(ativo.id, 1, "Ativo Circulante", "asset", true,
    "Bens e direitos com previsão de liquidação dentro do exercício corrente.");
  make(ativoCirc.id, 1, "Caixas e Equivalentes de Caixa", "asset", false);

  const ativoNC = make(ativo.id, 2, "Ativo Não Circulante", "asset", true);
  make(ativoNC.id, 1, "Saldo de Previdência Privada", "asset", false);

  const passCirc = make(passivo.id, 1, "Passivo Circulante", "liability", true);
  make(passCirc.id, 1, "Cartões de Crédito a Pagar", "liability", false);

  const passNC = make(passivo.id, 2, "Passivo Não Circulante", "liability", true);
  make(passNC.id, 1, "Empréstimos de Longo Prazo a Pagar", "liability", false);

  make(pl.id, 1, "Capital Social", "equity", false);

  return list;
}

let accounts: Account[] = seed();

// ----- helpers --------------------------------------------------------------

function getChildren(parentId: string): Account[] {
  return accounts.filter((a) => a.parentId === parentId);
}

function nextLocalCode(parentId: string | null): number {
  const siblings = accounts.filter((a) => a.parentId === parentId);
  const used = new Set(siblings.map((s) => s.localCode));
  let i = 1;
  while (used.has(i)) i++;
  return i;
}

function recomputeFormattedCode(account: Account): string {
  if (!account.parentId) return String(account.localCode);
  const parent = accounts.find((a) => a.id === account.parentId);
  if (!parent) return String(account.localCode);
  return `${recomputeFormattedCode(parent)}.${account.localCode}`;
}

// ----- public API -----------------------------------------------------------

export const accountsApi: AccountsApi = {
  async list(): Promise<Account[]> {
    return delay(accounts.map((a) => ({ ...a })));
  },

  async usedLocalCodes(parentId: string): Promise<number[]> {
    return delay(
      accounts.filter((a) => a.parentId === parentId).map((a) => a.localCode),
    );
  },

  async create(input: CreateAccountInput): Promise<Account> {
    const parent = accounts.find((a) => a.id === input.parentId);
    if (!parent) throw new Error("Conta superior não encontrada.");
    if (!parent.isAbstract)
      throw new Error("Apenas contas sintéticas podem ter contas filhas.");
    if (parent.isContra && !input.isContra)
      throw new Error(
        "Contas redutoras não podem ter filhas não redutoras.",
      );

    const localCode = input.localCode ?? nextLocalCode(parent.id);
    const siblings = getChildren(parent.id);
    if (siblings.some((s) => s.localCode === localCode))
      throw new Error(`Código local ${localCode} já está em uso.`);

    const id = input.id ?? uuid();
    if (!isValidUuid(id)) throw new Error("UUID inválido.");
    if (accounts.some((a) => a.id === id))
      throw new Error("UUID já existe.");

    const accountClass = parent.accountClass;
    const account: Account = {
      id,
      parentId: parent.id,
      formattedCode: `${parent.formattedCode}.${localCode}`,
      localCode,
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      accountClass,
      isAbstract: input.isAbstract,
      isContra: input.isContra,
      balanceType: computeBalanceType(accountClass, input.isContra),
      isActive: true,
    };
    accounts.push(account);
    return delay({ ...account });
  },

  async update(input: UpdateAccountInput): Promise<Account> {
    const account = accounts.find((a) => a.id === input.id);
    if (!account) throw new Error("Conta não encontrada.");

    const next: Account = { ...account };
    if (input.name !== undefined) next.name = input.name.trim();
    if (input.description !== undefined)
      next.description = input.description?.trim() || undefined;

    if (input.isContra !== undefined && input.isContra !== account.isContra) {
      // contra-account rule: if becoming non-contra, parent must not be contra
      if (!input.isContra) {
        const parent = account.parentId
          ? accounts.find((a) => a.id === account.parentId)
          : null;
        if (parent?.isContra)
          throw new Error(
            "Não é possível tornar não redutora: a conta superior é redutora.",
          );
      } else {
        // becoming contra: children must all be contra
        const desc = descendants(account.id);
        if (desc.some((d) => !d.isContra))
          throw new Error(
            "Não é possível tornar redutora: existem descendentes não redutores.",
          );
      }
      next.isContra = input.isContra;
      next.balanceType = computeBalanceType(next.accountClass, next.isContra);
    }

    if (input.isActive !== undefined) {
      next.isActive = input.isActive;
    }

    Object.assign(account, next);
    return delay({ ...account });
  },

  // Soft-delete: contas nunca são removidas, apenas inativadas.
  async deactivate(id: string): Promise<Account> {
    return this.update({ id, isActive: false });
  },
  async activate(id: string): Promise<Account> {
    return this.update({ id, isActive: true });
  },
};

function descendants(id: string): Account[] {
  const out: Account[] = [];
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const a of accounts) {
      if (a.parentId === cur) {
        out.push(a);
        stack.push(a.id);
      }
    }
  }
  return out;
}

export { computeBalanceType };
