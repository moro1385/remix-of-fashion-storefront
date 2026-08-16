import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import FormField from "@/components/auth/FormField";
import { AuthError, authBackend } from "@/lib/authClient";
import { PHONE_HELP, isValidPhone, normalizePhone } from "@/lib/phone";
import { setOtpSentAt } from "@/lib/otpTimer";
import { toast } from "sonner";

export default function OtpRequest() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!phone.trim()) return setError("Enter your mobile number.");
    if (!isValidPhone(phone)) return setError("That doesn't look like a valid mobile number.");
    setError("");
    setLoading(true);
    try {
      const normalized = normalizePhone(phone);
      const result = await authBackend.requestOtp({ phone: normalized });
      setOtpSentAt(normalized);
      if (result.devCode) toast.info(`Demo code: ${result.devCode}`, { duration: 15000 });
      else toast.success("Verification code sent");
      navigate("/signin/otp/verify", { state: { phone: normalized } });
    } catch (err) {
      setFormError(err instanceof AuthError ? err.message : "Could not send the code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="One-time password"
      title="Sign in with a code"
      subtitle="Enter your mobile number and we'll text you a six-digit verification code."
      footer={
        <Link
          to="/signin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to password sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <FormField
          label="Mobile number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0912 345 6789"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={error}
          hint={PHONE_HELP}
          disabled={loading}
        />

        {formError && (
          <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send one-time password"}
        </button>
      </form>
    </AuthShell>
  );
}
