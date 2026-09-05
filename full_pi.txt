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
    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await updateProfile(form);
      toast.success("Your details were saved");
    } catch {
      toast.error("Could not save your details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountLayout
      title="Personal information"
      description="Keep your name and contact details up to date for faster checkout."
    >
      <form onSubmit={handleSubmit} className="max-w-xl space-y-6" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            label="First name"
            value={form.firstName}
            onChange={set("firstName")}
            error={errors.firstName}
            disabled={saving}
            maxLength={50}
          />
          <FormField
            label="Last name"
            value={form.lastName}
            onChange={set("lastName")}
            error={errors.lastName}
            disabled={saving}
            maxLength={50}
          />
        </div>

        <FormField
          label="Email (optional)"
          type="email"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
          disabled={saving}
          maxLength={255}
        />

        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Mobile number</p>
          <div className="h-12 border border-border bg-muted px-4 flex items-center text-sm text-muted-foreground">
            {user?.phone ? formatPhone(user.phone) : "—"}
          </div>
          <p className="text-xs text-muted-foreground">
            Your mobile number is your sign-in identity and can't be changed here.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Member since</p>
          <p className="text-sm text-foreground">
            {user ? new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: "long" }) : "—"}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="h-12 px-8 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
        </button>
      </form>
    </AccountLayout>
  );
}
