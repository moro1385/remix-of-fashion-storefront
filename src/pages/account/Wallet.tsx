import { ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon } from "lucide-react";
import AccountLayout from "@/components/account/AccountLayout";
import { useAuthStore } from "@/stores/authStore";

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);

export default function Wallet() {
  const wallet = useAuthStore((s) => s.user?.wallet);
  const currency = wallet?.currencyCode ?? "USD";
  const transactions = wallet?.transactions ?? [];

  return (
    <AccountLayout
      title="Wallet"
      description="Store credit, refunds and gift balance — used automatically at checkout."
    >
      <div className="bg-primary text-primary-foreground p-8 md:p-10">
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary-foreground/60">
          Available balance
        </p>
        <p className="mt-4 text-4xl md:text-5xl font-light">
          {formatAmount(wallet?.balance ?? 0, currency)}
        </p>
        <p className="mt-4 text-sm text-primary-foreground/70 max-w-md">
          Balance is applied to your next order automatically. Top-ups will be available once payments
          are connected.
        </p>
        <button
          disabled
          className="mt-8 h-12 px-8 bg-accent text-accent-foreground text-xs uppercase tracking-[0.2em] disabled:opacity-60"
        >
          Top up wallet
        </button>
      </div>

      <div className="mt-10">
        <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Activity</h3>
        {transactions.length === 0 ? (
          <div className="mt-6 border border-border py-14 text-center">
            <WalletIcon className="w-8 h-8 mx-auto text-muted-foreground" strokeWidth={1.25} />
            <p className="mt-6 text-lg font-light text-foreground">No wallet activity yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Refunds and store credit will appear here.
            </p>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border border border-border">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between gap-4 px-6 py-5">
                <div className="flex items-center gap-4">
                  <span className="w-9 h-9 border border-border flex items-center justify-center">
                    {tx.amount >= 0 ? (
                      <ArrowDownLeft className="w-4 h-4 text-accent" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-foreground tabular-nums">
                  {tx.amount >= 0 ? "+" : "−"}
                  {formatAmount(Math.abs(tx.amount), currency)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AccountLayout>
  );
}
