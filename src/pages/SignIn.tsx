import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, MessageSquare } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import FormField from "@/components/auth/FormField";
import { useAuthStore } from "@/stores/authStore";
import { AuthError } from "@/lib/authClient";
import { PHONE_HELP, isValidPhone } from "@/lib/phone";
import { toast } from "sonner";

export default function SignIn() {
  const navigate = useNavigate();
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!phone.trim()) next.phone = "Enter your mobile number.";
    else if (!isValidPhone(phone)) next.phone = "That doesn't look like a valid mobile number.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await signInWithPassword(phone, password);
      toast.success("Welcome back");
      navigate("/account", { replace: true });
    } catch (error) {
      if (error instanceof AuthError) {
        if (error.field) setErrors({ [error.field]: error.message });
        else setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account"
      title="Sign in"
      subtitle="Use your mobile number and password, or sign in with a one-time code."
      footer={
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-foreground underline underline-offset-4 hover:text-accent transition-colors">
            Sign up
          </Link>
        </p>
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
          error={errors.phone}
          hint={PHONE_HELP}
          disabled={loading}
        />

        <FormField
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={loading}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
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
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
        </button>

        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Link
          to="/signin/otp"
          className="w-full h-12 border border-foreground text-foreground text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-primary-foreground transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Sign in with one-time password
        </Link>
      </form>
    </AuthShell>
  );
}
