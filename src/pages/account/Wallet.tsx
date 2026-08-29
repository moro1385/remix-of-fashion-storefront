import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Loader2, Wallet as WalletIcon } from "lucide-react";
import AccountLayout from "@/components/account/AccountLayout";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('fa-IR').format(amount) + " ریال";

export default function Wallet() {
  const user = useAuthStore((s) => s.user);
  const wallet = user?.wallet;
  const transactions = wallet?.transactions ?? [];

  const [topUpAmount, setTopUpAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const handleTopUp = async () => {
    if (!user) return;
    const amount = parseInt(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setBusy(true);
    try {
      const newBalance = (wallet?.balance ?? 0) + amount;
      const { error } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("کیف پول شارژ شد");
      setTopUpAmount("");
      // Refresh user store to get new balance
      useAuthStore.getState().bootstrap();
    } catch (err) {
      console.error("Top up error", err);
      toast.error("Failed to top up wallet");
    } finally {
      setBusy(false);
    }
  };

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
          {formatAmount(wallet?.balance ?? 0)}
        </p>
        <p className="mt-4 text-sm text-primary-foreground/70 max-w-md">
          Balance is applied to your next order automatically. Top-ups will be available once payments
          are connected.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md">
          <input
            type="number"
            placeholder="مبلغ شارژ (ریال)"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            disabled={busy}
            className="h-12 px-4 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary-foreground/50 transition-colors flex-1"
          />
          <button
            onClick={handleTopUp}
            disabled={busy || !topUpAmount}
            className="h-12 px-8 bg-accent text-accent-foreground text-xs uppercase tracking-[0.2em] disabled:opacity-60 hover:opacity-90 transition-opacity whitespace-nowrap flex items-center justify-center min-w-[140px]"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "شارژ کیف پول"}
          </button>
        </div>
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
                  {formatAmount(Math.abs(tx.amount))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AccountLayout>
  );
}
