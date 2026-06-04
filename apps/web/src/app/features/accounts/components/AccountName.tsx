import type { Account } from "../types";

export function AccountName({
  account,
  className = "",
  showCode = true,
}: {
  account: Account;
  className?: string;
  showCode?: boolean;
}) {
  const red = account.isContra ? "text-rose-600" : "";
  const dim = !account.isActive ? "opacity-50 line-through" : "";
  return (
    <span className={`${red} ${dim} ${className}`}>
      {showCode && (
        <span className="font-mono tabular-nums mr-2">{account.formattedCode}</span>
      )}
      {account.isContra && "(-) "}
      {account.name}
    </span>
  );
}
