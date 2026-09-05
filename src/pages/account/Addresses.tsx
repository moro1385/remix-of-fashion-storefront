import { useState } from "react";
import { Check, Loader2, MapPin, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import AccountLayout from "@/components/account/AccountLayout";
import FormField from "@/components/auth/FormField";
import { useAuthStore } from "@/stores/authStore";
import type { Address } from "@/types/auth";
import { formatPhone, isValidPhone, normalizePhone } from "@/lib/phone";
import { toast } from "sonner";

const emptyForm = {
  label: "",
  recipient: "",
  phone: "",
  country: "",
  city: "",
  line1: "",
  line2: "",
  postalCode: "",
  isDefault: false,
};

export default function Addresses() {
  const user = useAuthStore((s) => s.user);
  const upsertAddress = useAuthStore((s) => s.upsertAddress);
  const deleteAddress = useAuthStore((s) => s.deleteAddress);
  const setDefaultAddress = useAuthStore((s) => s.setDefaultAddress);

  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const addresses = user?.addresses ?? [];

  const openNew = () => {
    setForm({ ...emptyForm, isDefault: addresses.length === 0 });
    setErrors({});
    setEditing("new");
  };

  const openEdit = (address: Address) => {
    setForm({ ...emptyForm, ...address, line2: address.line2 ?? "" });
    setErrors({});
    setEditing(address.id);
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.label.trim()) next.label = "برای این آدرس یک نام انتخاب کنید (خانه، محل کار…).";
    if (!form.recipient.trim()) next.recipient = "نام گیرنده الزامی است.";
    if (!form.phone.trim()) next.phone = "شماره تماس الزامی است.";
    else if (!isValidPhone(form.phone)) next.phone = "یک شماره موبایل معتبر وارد کنید.";
    if (!form.country.trim()) next.country = "کشور الزامی است.";
    if (!form.city.trim()) next.city = "شهر الزامی است.";
    if (!form.line1.trim()) next.line1 = "آدرس خیابان الزامی است.";
    if (!form.postalCode.trim()) next.postalCode = "کد پستی الزامی است.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await upsertAddress({
        ...form,
        phone: normalizePhone(form.phone),
        id: editing === "new" ? undefined : (editing as string),
      });
      toast.success(editing === "new" ? "آدرس اضافه شد" : "آدرس به‌روز شد");
      setEditing(null);
    } catch {
      toast.error("ذخیره این آدرس انجام نشد.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      await deleteAddress(id);
      toast.success("آدرس حذف شد");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl">
      <AccountLayout
        title="آدرس‌ها"
        description="محل تحویل سفارشات جامی مد خود را مدیریت کنید."
      >
        {editing ? (
          <form onSubmit={handleSave} className="max-w-xl space-y-6" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="نام آدرس" placeholder="خانه" value={form.label} onChange={set("label")} error={errors.label} disabled={busy} maxLength={40} />
              <FormField label="گیرنده" value={form.recipient} onChange={set("recipient")} error={errors.recipient} disabled={busy} maxLength={80} />
            </div>
            <FormField label="شماره تماس" type="tel" inputMode="tel" value={form.phone} onChange={set("phone")} error={errors.phone} disabled={busy} />
            <FormField label="آدرس خیابان" value={form.line1} onChange={set("line1")} error={errors.line1} disabled={busy} maxLength={120} />
            <FormField label="آپارتمان، واحد (اختیاری)" value={form.line2} onChange={set("line2")} disabled={busy} maxLength={120} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <FormField label="شهر" value={form.city} onChange={set("city")} error={errors.city} disabled={busy} maxLength={60} />
              <FormField label="کشور" value={form.country} onChange={set("country")} error={errors.country} disabled={busy} maxLength={60} />
              <FormField label="کد پستی" value={form.postalCode} onChange={set("postalCode")} error={errors.postalCode} disabled={busy} maxLength={20} />
            </div>

            <label className="flex items-center gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
                disabled={busy}
                className="w-4 h-4 accent-[hsl(var(--accent))]"
              />
              تنظیم به عنوان آدرس پیش‌فرض تحویل
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy}
                className="h-12 px-8 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center gap-2"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                ذخیره آدرس
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={busy}
                className="h-12 px-8 border border-border text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                لغو
              </button>
            </div>
          </form>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-8 h-8 mx-auto text-muted-foreground" strokeWidth={1.25} />
            <p className="mt-6 text-lg font-light text-foreground">هنوز آدرسی ذخیره نشده است</p>
            <p className="mt-2 text-sm text-muted-foreground">
              برای تسویه حساب سریع‌تر در دفعات بعد، یک آدرس تحویل اضافه کنید.
            </p>
            <button
              onClick={openNew}
              className="mt-8 h-12 px-8 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              افزودن آدرس
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <article key={address.id} className="border border-border p-6 transition-colors hover:border-foreground/30">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm uppercase tracking-[0.15em] text-foreground">{address.label}</h3>
                      {address.isDefault && (
                        <span className="text-[10px] uppercase tracking-[0.2em] bg-accent text-accent-foreground px-2 py-1">
                          پیش‌فرض
                        </span>
                      )}
                    </div>
                  <p className="mt-3 text-sm text-foreground">{address.recipient}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.country} {address.postalCode}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatPhone(address.phone)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {!address.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(address.id)}
                      aria-label="Set as default"
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(address)}
                    aria-label="Edit address"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    aria-label="Delete address"
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}

            <button
              onClick={openNew}
              className="h-12 px-8 border border-foreground text-xs uppercase tracking-[0.2em] text-foreground hover:bg-foreground hover:text-primary-foreground transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              افزودن آدرس دیگر
            </button>
          </div>
        )}
      </AccountLayout>
    </div>
  );
}
