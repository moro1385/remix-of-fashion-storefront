import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { formatPhone } from "@/lib/phone";
import { formatCountdown, getOtpRemainingSeconds, setOtpSentAt } from "@/lib/otpTimer";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export default function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as { phone?: string } | null)?.phone ?? "";
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const requestOtp = useAuthStore((s) => s.requestOtp);

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [remaining, setRemaining] = useState(() => (phone ? getOtpRemainingSeconds(phone) : 0));

  useEffect(() => {
    if (!phone) navigate("/signin/otp", { replace: true });
  }, [phone, navigate]);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return setError("Enter the six-digit code.");
    setError("");
    setLoading(true);
    try {
      await verifyOtp(phone, code);
      toast.success("You're signed in");
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify the code. Please try again.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const result = await requestOtp(phone);
      setOtpSentAt(phone);
      setRemaining(result.expiresInSeconds);
      setCode("");
      if (result.devCode) toast.info(`Demo code: ${result.devCode}`, { duration: 15000 });
      else toast.success("A new code is on its way");
    } catch {
      setError("Could not resend the code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      eyebrow="تایید شماره"
      title="کد تایید را وارد کنید"
      subtitle={
        <>
          ما یک کد تایید ۶ رقمی به شماره{" "}
          <span className="text-foreground" dir="ltr">{formatPhone(phone)}</span> ارسال کردیم. این کد ۵ دقیقه اعتبار دارد.
        </>
      }
      footer={
        <Link
          to="/signin/otp"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          استفاده از شماره دیگر
        </Link>
      }
    >
      <form onSubmit={handleVerify} className="space-y-6" noValidate>
        <div className="space-y-2">
          <label htmlFor="otp" className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            کد تایید
          </label>
          <input
            id="otp"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            placeholder="––––––"
            disabled={loading}
            aria-invalid={!!error}
            className={`w-full h-14 bg-background border px-4 text-center text-2xl tracking-[0.5em] text-foreground outline-none transition-colors focus:border-foreground ${
              error ? "border-destructive" : "border-border"
            }`}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full h-12 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تایید و ادامه"}
        </button>

        <div className="text-center text-sm">
          {remaining > 0 ? (
            <p className="text-muted-foreground">
              شما می‌توانید درخواست کد جدید کنید در{" "}
              <span className="text-foreground tabular-nums">{formatCountdown(remaining)}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-foreground underline underline-offset-4 hover:text-accent transition-colors disabled:opacity-60"
            >
              {resending ? "در حال ارسال..." : "ارسال مجدد کد"}
            </button>
          )}
        </div>
      </form>
    </AuthShell>
  );
}
