import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import type {
  Account,
  AccountNode,
  CreateAccountInput,
  UpdateAccountInput,
} from "./types";

function buildTree(flat: Account[]): AccountNode[] {
  const byId = new Map<string, AccountNode>();
  flat.forEach((a) => byId.set(a.id, { ...a, children: [], depth: 0 }));
  const roots: AccountNode[] = [];
  byId.forEach((node) => {
    if (node.parentId) {
      const parent = byId.get(node.parentId);
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else roots.push(node);
  });
  const finalize = (nodes: AccountNode[], depth: number) => {
    nodes.sort((a, b) => a.localCode - b.localCode);
    nodes.forEach((n) => {
      n.depth = depth;
      finalize(n.children, depth + 1);
    });
  };
  finalize(roots, 0);
  return roots;
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.accounts.list();
      setAccounts(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const tree = useMemo(() => buildTree(accounts), [accounts]);
  const byId = useMemo(() => {
    const m = new Map<string, Account>();
    accounts.forEach((a) => m.set(a.id, a));
    return m;
  }, [accounts]);

  const create = useCallback(
    async (input: CreateAccountInput) => {
      await api.accounts.create(input);
      await refresh();
    },
    [refresh],
  );
  const update = useCallback(
    async (input: UpdateAccountInput) => {
      await api.accounts.update(input);
      await refresh();
    },
    [refresh],
  );
  const setActive = useCallback(
    async (id: string, active: boolean) => {
      if (active) await api.accounts.activate(id);
      else await api.accounts.deactivate(id);
      await refresh();
    },
    [refresh],
  );

  return { accounts, tree, byId, loading, error, create, update, setActive, refresh };
}
