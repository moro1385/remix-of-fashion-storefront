import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AccountLayout from "@/components/account/AccountLayout";
import FormField from "@/components/auth/FormField";
import { useAuthStore } from "@/stores/authStore";
import { formatPhone } from "@/lib/phone";
import { toast } from "sonner";

export default function PersonalInformation() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email ?? "" });
    }
  }, [user]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = "نام الزامی است.";
    if (!form.lastName.trim()) next.lastName = "نام خانوادگی الزامی است.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "یک آدرس ایمیل معتبر وارد کنید.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await updateProfile(form);
      toast.success("اطلاعات شما ذخیره شد");
    } catch {
      toast.error("ذخیره اطلاعات شما انجام نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl">
      <AccountLayout
        title="اطلاعات شخصی"
        description="نام و اطلاعات تماس خود را برای تسویه حساب سریع‌تر به‌روز نگه دارید."
      >
        <form onSubmit={handleSubmit} className="max-w-xl space-y-6" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="نام"
              value={form.firstName}
              onChange={set("firstName")}
              error={errors.firstName}
              disabled={saving}
              maxLength={50}
            />
            <FormField
              label="نام خانوادگی"
              value={form.lastName}
              onChange={set("lastName")}
              error={errors.lastName}
              disabled={saving}
              maxLength={50}
            />
          </div>

          <FormField
            label="ایمیل (اختیاری)"
            type="email"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
            disabled={saving}
            maxLength={255}
          />

          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">شماره موبایل</p>
            <div className="h-12 border border-border bg-muted px-4 flex items-center text-sm text-muted-foreground">
              {user?.phone ? formatPhone(user.phone) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              شماره موبایل شما شناسه ورود شماست و در اینجا قابل تغییر نیست.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">عضو از</p>
            <p className="text-sm text-foreground">
              {user ? new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: "long" }) : "—"}
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="h-12 px-8 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "ذخیره تغییرات"}
          </button>
        </form>
      </AccountLayout>
    </div>
  );
}
