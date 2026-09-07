import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, MessageSquare } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import FormField from "@/components/auth/FormField";
import { useAuthStore } from "@/stores/authStore";
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
    if (!phone.trim()) next.phone = "شماره موبایل خود را وارد کنید.";
    else if (!isValidPhone(phone)) next.phone = "این شماره موبایل معتبر نیست.";
    if (!password) next.password = "رمز عبور خود را وارد کنید.";
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
      toast.success("خوش آمدید");
      navigate("/account", { replace: true });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "خطایی رخ داد. لطفاً دوباره تلاش کنید.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthShell
        eyebrow="حساب کاربری"
        title="ورود"
        subtitle="از شماره موبایل و رمز عبور خود استفاده کنید یا با یک کد یک‌بار مصرف وارد شوید."
        footer={
          <p className="text-sm text-muted-foreground">
            حساب کاربری ندارید؟{" "}
            <Link to="/signup" className="text-foreground underline underline-offset-4 hover:text-accent transition-colors">
              ثبت نام
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <FormField
            label="شماره موبایل"
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
            label="رمز عبور"
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ورود"}
          </button>

          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">یا</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Link
            to="/signin/otp"
            className="w-full h-12 border border-foreground text-foreground text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-primary-foreground transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            ورود با رمز یک‌بار مصرف
          </Link>
        </form>
      </AuthShell>
    </div>
  );
}
