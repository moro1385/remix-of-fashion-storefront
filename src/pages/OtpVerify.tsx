import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { AuthError, authBackend } from "@/lib/authClient";
import { formatPhone } from "@/lib/phone";
import { formatCountdown, getOtpRemainingSeconds, setOtpSentAt } from "@/lib/otpTimer";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

export default function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as { phone?: string } | null)?.phone ?? "";
  const verifyOtp = useAuthStore((s) => s.verifyOtp);

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
      setError(err instanceof AuthError ? err.message : "Could not verify the code. Please try again.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const result = await authBackend.requestOtp({ phone });
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
      eyebrow="Verification"
      title="Enter your code"
      subtitle={
        <>
          We sent a six-digit verification code to{" "}
          <span className="text-foreground">{formatPhone(phone)}</span>. It expires in five minutes.
        </>
      }
      footer={
        <Link
          to="/signin/otp"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Use a different number
        </Link>
      }
    >
      <form onSubmit={handleVerify} className="space-y-6" noValidate>
        <div className="space-y-2">
          <label htmlFor="otp" className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Verification code
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
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify and continue"}
        </button>

        <div className="text-center text-sm">
          {remaining > 0 ? (
            <p className="text-muted-foreground">
              You can request a new code in{" "}
              <span className="text-foreground tabular-nums">{formatCountdown(remaining)}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-foreground underline underline-offset-4 hover:text-accent transition-colors disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          )}
        </div>
      </form>
    </AuthShell>
  );
}
