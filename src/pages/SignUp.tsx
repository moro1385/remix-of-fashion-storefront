import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import FormField from "@/components/auth/FormField";
import { useAuthStore } from "@/stores/authStore";
import { AuthError } from "@/lib/authClient";
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
    if (!form.phone.trim()) next.phone = "Enter your mobile number.";
    else if (!isValidPhone(form.phone)) next.phone = "That doesn't look like a valid mobile number.";
    if (!form.firstName.trim()) next.firstName = "Enter your first name.";
    else if (form.firstName.trim().length > 50) next.firstName = "Keep this under 50 characters.";
    if (!form.lastName.trim()) next.lastName = "Enter your last name.";
    else if (form.lastName.trim().length > 50) next.lastName = "Keep this under 50 characters.";
    if (!form.password) next.password = "Choose a password.";
    else if (form.password.length < 8) next.password = "Use at least 8 characters.";
    else if (!/[a-zA-Z]/.test(form.password) || !/\d/.test(form.password))
      next.password = "Include at least one letter and one number.";
    if (!form.confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp({
        phone: form.phone,
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password,
      });
      toast.success("Your account is ready");
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
      eyebrow="New here"
      title="Create your account"
      subtitle="A few details and your wardrobe, orders and addresses stay in one place."
      footer={
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/signin" className="text-foreground underline underline-offset-4 hover:text-accent transition-colors">
            Sign in
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
          value={form.phone}
          onChange={set("phone")}
          error={errors.phone}
          hint={PHONE_HELP}
          disabled={loading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            label="First name"
            autoComplete="given-name"
            value={form.firstName}
            onChange={set("firstName")}
            error={errors.firstName}
            disabled={loading}
            maxLength={50}
          />
          <FormField
            label="Last name"
            autoComplete="family-name"
            value={form.lastName}
            onChange={set("lastName")}
            error={errors.lastName}
            disabled={loading}
            maxLength={50}
          />
        </div>

        <FormField
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          hint="Minimum 8 characters, with a letter and a number."
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
          label="Confirm password"
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
          className="w-full h-12 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
