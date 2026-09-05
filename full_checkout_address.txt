import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2, MapPin, Pencil, Plus, Star, Trash2, X, ChevronRight } from "lucide-react";
import FormField from "@/components/auth/FormField";
import { useAuthStore } from "@/stores/authStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import type { Address } from "@/types/auth";
import { formatPhone, isValidPhone, normalizePhone } from "@/lib/phone";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

const SHIPPING_METHODS = [
  { id: "regular", label: "پست معمولی", cost: 500000 },
  { id: "express", label: "پست پیشتاز", cost: 800000 },
];

export default function CheckoutAddress() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const upsertAddress = useAuthStore((s) => s.upsertAddress);
  const deleteAddress = useAuthStore((s) => s.deleteAddress);
  const setDefaultAddress = useAuthStore((s) => s.setDefaultAddress);

  const { selectedAddress, shippingMethod, setAddress, setShippingMethod } = useCheckoutStore();

  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const addresses = user?.addresses ?? [];

  useEffect(() => {
    // If no address is selected but there is a default address, select it automatically
    if (!selectedAddress && (user?.addresses ?? []).length > 0) {
      const addrList = user?.addresses ?? [];
      const defaultAddr = addrList.find((a) => a.isDefault) || addrList[0];
      setAddress(defaultAddr);
    }
  }, [user?.addresses, selectedAddress, setAddress]);

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
    if (!form.label.trim()) next.label = "Give this address a name (Home, Work…).";
    if (!form.recipient.trim()) next.recipient = "Recipient name is required.";
    if (!form.phone.trim()) next.phone = "Contact number is required.";
    else if (!isValidPhone(form.phone)) next.phone = "Enter a valid mobile number.";
    if (!form.country.trim()) next.country = "Country is required.";
    if (!form.city.trim()) next.city = "City is required.";
    if (!form.line1.trim()) next.line1 = "Street address is required.";
    if (!form.postalCode.trim()) next.postalCode = "Postal code is required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await upsertAddress({
        ...form,
        phone: normalizePhone(form.phone),
        id: editing === "new" ? undefined : (editing as string),
      });
      toast.success(editing === "new" ? "Address added" : "Address updated");
      setEditing(null);
    } catch {
      toast.error("Could not save this address.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      await deleteAddress(id);
      toast.success("Address removed");
      if (selectedAddress?.id === id) {
          setAddress(null);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleNextStep = () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }
    if (!shippingMethod) {
      toast.error("Please select a shipping method.");
      return;
    }
    navigate("/checkout/payment");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <h1 className="text-2xl font-medium text-foreground mb-8">Checkout</h1>

      <div className="flex items-center gap-2 mb-12 text-sm text-muted-foreground">
        <span className="text-foreground font-medium">1. Address & Shipping</span>
        <ChevronRight className="w-4 h-4" />
        <span>2. Review & Payment</span>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-lg font-medium text-foreground mb-6">Delivery Address</h2>

          {editing ? (
            <form onSubmit={handleSave} className="max-w-xl space-y-6 bg-muted/30 p-6 border border-border" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Address name" placeholder="Home" value={form.label} onChange={set("label")} error={errors.label} disabled={busy} maxLength={40} />
                <FormField label="Recipient" value={form.recipient} onChange={set("recipient")} error={errors.recipient} disabled={busy} maxLength={80} />
              </div>
              <FormField label="Contact number" type="tel" inputMode="tel" value={form.phone} onChange={set("phone")} error={errors.phone} disabled={busy} />
              <FormField label="Street address" value={form.line1} onChange={set("line1")} error={errors.line1} disabled={busy} maxLength={120} />
              <FormField label="Apartment, unit (optional)" value={form.line2} onChange={set("line2")} disabled={busy} maxLength={120} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <FormField label="City" value={form.city} onChange={set("city")} error={errors.city} disabled={busy} maxLength={60} />
                <FormField label="Country" value={form.country} onChange={set("country")} error={errors.country} disabled={busy} maxLength={60} />
                <FormField label="Postal code" value={form.postalCode} onChange={set("postalCode")} error={errors.postalCode} disabled={busy} maxLength={20} />
              </div>

              <label className="flex items-center gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
                  disabled={busy}
                  className="w-4 h-4 accent-[hsl(var(--accent))]"
                />
                Set as default delivery address
              </label>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  type="submit"
                  disabled={busy}
                  className="h-10 px-6 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save address
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  disabled={busy}
                  className="h-10 px-6 border border-border text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12 border border-border">
              <MapPin className="w-8 h-8 mx-auto text-muted-foreground" strokeWidth={1.25} />
              <p className="mt-6 text-lg font-light text-foreground">No addresses saved yet</p>
              <button
                onClick={openNew}
                className="mt-8 h-12 px-8 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add address
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  onClick={() => setAddress(address)}
                  className={cn(
                    "relative border p-6 cursor-pointer transition-colors hover:border-foreground/30",
                    selectedAddress?.id === address.id ? "border-accent bg-accent/5" : "border-border"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <input
                          type="radio"
                          readOnly
                          checked={selectedAddress?.id === address.id}
                          className="w-4 h-4 accent-accent cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm uppercase tracking-[0.15em] text-foreground">{address.label}</h3>
                          {address.isDefault && (
                            <span className="text-[10px] uppercase tracking-[0.2em] bg-muted text-muted-foreground px-2 py-1">
                              Default
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
                    </div>

                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
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
                </div>
              ))}

              <button
                onClick={openNew}
                className="h-12 px-8 border border-foreground text-xs uppercase tracking-[0.2em] text-foreground hover:bg-foreground hover:text-primary-foreground transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add another address
              </button>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-6">Shipping Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SHIPPING_METHODS.map((method) => (
              <label
                key={method.id}
                className={cn(
                  "flex items-center justify-between p-6 border cursor-pointer transition-colors hover:border-foreground/30",
                  shippingMethod === method.id ? "border-accent bg-accent/5" : "border-border"
                )}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    name="shipping_method"
                    checked={shippingMethod === method.id}
                    onChange={() => setShippingMethod(method.id, method.cost)}
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                  <span className="text-sm font-medium text-foreground">{method.label}</span>
                </div>
                <span className="text-sm text-foreground">
                  {new Intl.NumberFormat('fa-IR').format(method.cost)} ریال
                </span>
              </label>
            ))}
          </div>
        </section>

        <div className="flex justify-end pt-8 border-t border-border">
          <button
            onClick={handleNextStep}
            className="h-14 px-10 bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
}
