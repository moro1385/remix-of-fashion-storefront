import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import FormField from "@/components/auth/FormField";
import { useAuthStore } from "@/stores/authStore";
import { PHONE_HELP, isValidPhone } from "@/lib/phone";
import { toast } from "sonner";

export default function SignUp() {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.signUp);

  const [form, setForm] = useState({
    phone: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.phone.trim()) next.phone = "شماره موبایل خود را وارد کنید.";
    else if (!isValidPhone(form.phone)) next.phone = "این شماره موبایل معتبر نیست.";
    if (!form.firstName.trim()) next.firstName = "نام خود را وارد کنید.";
    else if (form.firstName.trim().length > 50) next.firstName = "کمتر از ۵۰ کاراکتر وارد کنید.";
    if (!form.lastName.trim()) next.lastName = "نام خانوادگی خود را وارد کنید.";
    else if (form.lastName.trim().length > 50) next.lastName = "کمتر از ۵۰ کاراکتر وارد کنید.";
    if (!form.password) next.password = "یک رمز عبور انتخاب کنید.";
    else if (form.password.length < 8) next.password = "حداقل از ۸ کاراکتر استفاده کنید.";
    else if (!/[a-zA-Z]/.test(form.password) || !/\d/.test(form.password))
      next.password = "حداقل یک حرف و یک عدد باید وجود داشته باشد.";
    if (!form.confirmPassword) next.confirmPassword = "رمز عبور خود را تایید کنید.";
    else if (form.confirmPassword !== form.password) next.confirmPassword = "رمزهای عبور مطابقت ندارند.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setLoading(true);

    // --- شروع کدهای تبدیل شماره ---
    let finalPhone = form.phone.trim();
    if (finalPhone.startsWith('0')) {
      finalPhone = '+98' + finalPhone.substring(1);
    } else if (!finalPhone.startsWith('+')) {
      finalPhone = '+98' + finalPhone;
    }
    // --- پایان کدهای تبدیل شماره ---

    try {
      await signUp({
        phone: finalPhone, // <-- اینجا به جای form.phone از finalPhone استفاده می‌کنیم
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password,
      });
      toast.success("حساب کاربری ایجاد شد. لطفاً شماره موبایل خود را تأیید کنید.");
      // Navigate to OTP verify passing the phone number in state
      const { normalizePhone } = await import("@/lib/phone");
      navigate("/signin/otp/verify", { state: { phone: normalizePhone(finalPhone) }, replace: true });
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
        eyebrow="کاربر جدید"
        title="ایجاد حساب کاربری"
        subtitle="با وارد کردن چند مشخصه، لباس‌ها، سفارشات و آدرس‌های شما در یک جا ذخیره می‌شوند."
        footer={
          <p className="text-sm text-muted-foreground">
            از قبل حساب کاربری دارید؟{" "}
            <Link to="/signin" className="text-foreground underline underline-offset-4 hover:text-accent transition-colors">
              ورود
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
            value={form.phone}
            onChange={set("phone")}
            error={errors.phone}
            hint={PHONE_HELP}
            disabled={loading}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="نام"
              autoComplete="given-name"
              value={form.firstName}
              onChange={set("firstName")}
              error={errors.firstName}
              disabled={loading}
              maxLength={50}
            />
            <FormField
              label="نام خانوادگی"
              autoComplete="family-name"
              value={form.lastName}
              onChange={set("lastName")}
              error={errors.lastName}
              disabled={loading}
              maxLength={50}
            />
          </div>

          <FormField
            label="رمز عبور"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="حداقل ۸ کاراکتر"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
            hint="حداقل ۸ کاراکتر، شامل یک حرف و یک عدد."
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

          <FormField
            label="تایید رمز عبور"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            error={errors.confirmPassword}
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
            className="w-full h-12 bg-primary text-primary-foreground text-xs hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ایجاد حساب"}
          </button>
        </form>
      </AuthShell>
    </div>
  );
}
