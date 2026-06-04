import { useCallback } from "react";
import { useAppSearchParams } from "../navigation";

function useUrlParam(key: string) {
  const [searchParams, setSearchParams] = useAppSearchParams();
  const set = useCallback(
    (value: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true },
      );
    },
    [key, setSearchParams],
  );
  return [searchParams.get(key), set] as const;
}

export function useUrlBoolean(
  key: string,
  trueValue = "1",
): [boolean, (v: boolean) => void] {
  const [value, setValue] = useUrlParam(key);
  return [value === trueValue, (v) => setValue(v ? trueValue : null)];
}

export function useUrlString(
  key: string,
): [string, (v: string) => void] {
  const [value, setValue] = useUrlParam(key);
  return [value ?? "", (v) => setValue(v.trim() || null)];
}
