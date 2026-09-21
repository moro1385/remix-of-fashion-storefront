import { useState, useEffect } from "react";
import { ArrowDownLeft, ArrowUpRight, Loader2, Wallet as WalletIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AccountLayout from "@/components/account/AccountLayout";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('fa-IR').format(amount) + " ریال";

export default function Wallet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const wallet = user?.wallet;
  const transactions = wallet?.transactions ?? [];

  const [topUpAmount, setTopUpAmount] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const topupStatus = searchParams.get("topup");
    if (topupStatus === "success") {
      toast.success("کیف پول با موفقیت شارژ شد");
      useAuthStore.getState().bootstrap();
      navigate("/account/wallet", { replace: true });
    } else if (topupStatus === "failed") {
      toast.error("شارژ کیف پول ناموفق بود یا لغو شد");
      navigate("/account/wallet", { replace: true });
    }
  }, [searchParams, navigate]);

  const handleTopUp = async () => {
    if (!user) return;
    const amount = parseInt(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("لطفاً یک مبلغ معتبر وارد کنید");
      return;
    }

    setBusy(true);
    try {
      // Create topup record
      const { data: topupData, error: topupError } = await supabase
        .from("wallet_topups")
        .insert({
          user_id: user.id,
          amount: amount,
          status: "pending_payment"
        })
        .select()
        .single();

      if (topupError) throw topupError;

      // Init payment gateway
      const { data: bitpayData, error: bitpayError } = await supabase.functions.invoke("bitpay-wallet-init", {
        body: { topupId: topupData.id }
      });

      if (bitpayError || bitpayData?.error || !bitpayData?.redirectUrl) {
        const errMsg = bitpayData?.error || bitpayError?.message || "مشکلی در اتصال به درگاه پرداخت رخ داد.";
        toast.error(errMsg);
        setBusy(false);
        return;
      }

      // Redirect to gateway
      window.location.href = bitpayData.redirectUrl;

    } catch (err) {
      console.error("Top up error", err);
      toast.error("شروع فرآیند شارژ کیف پول با شکست مواجه شد");
      setBusy(false);
    }
  };

  return (
    <AccountLayout
      title="کیف پول"
      description="اعتبار فروشگاه، استردادها و موجودی هدیه — به‌طور خودکار در تسویه حساب استفاده می‌شود."
    >
      <div className="bg-primary text-primary-foreground p-8 md:p-10 rounded-2xl">
          <p className="text-[11px] text-primary-foreground/60">
            موجودی در دسترس
          </p>
          <p className="mt-4 text-4xl md:text-5xl font-light">
            {formatAmount(wallet?.balance ?? 0)}
          </p>
          <p className="mt-4 text-sm text-primary-foreground/70 max-w-md">
            موجودی به‌طور خودکار به سفارش بعدی شما اعمال می‌شود.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md">
            <input
              type="number"
              placeholder="مبلغ شارژ (ریال)"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              disabled={busy}
              className="h-12 px-4 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary-foreground/50 transition-colors flex-1 rounded-xl"
            />
            <button
              onClick={handleTopUp}
              disabled={busy || !topUpAmount}
              className="h-12 px-8 bg-accent text-accent-foreground text-xs disabled:opacity-60 hover:opacity-90 transition-opacity whitespace-nowrap flex items-center justify-center min-w-[140px] rounded-full"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "شارژ کیف پول"}
            </button>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-sm text-muted-foreground">فعالیت</h3>
          {transactions.length === 0 ? (
            <div className="mt-6 border border-border py-14 text-center rounded-2xl">
              <WalletIcon className="w-8 h-8 mx-auto text-muted-foreground" strokeWidth={1.25} />
              <p className="mt-6 text-lg font-light text-foreground">هنوز فعالیتی در کیف پول وجود ندارد</p>
              <p className="mt-2 text-sm text-muted-foreground">
                استردادها و اعتبار فروشگاه در اینجا ظاهر می‌شوند.
              </p>
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-border border border-border rounded-2xl overflow-hidden">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between gap-4 px-6 py-5">
                  <div className="flex items-center gap-4">
                    <span className="w-9 h-9 border border-border flex items-center justify-center rounded-full">
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
