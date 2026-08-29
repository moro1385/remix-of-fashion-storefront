import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhone } from "@/lib/phone";
import type { Address, Session, User } from "@/types/auth";
import type { Session as SupabaseSession } from "@supabase/supabase-js";

interface AuthStore {
  session: Session | null;
  user: User | null;
  isBootstrapping: boolean;
  isAuthenticated: () => boolean;
  bootstrap: () => Promise<void>;
  signInWithPassword: (phone: string, password: string) => Promise<void>;
  signUp: (input: { phone: string; firstName: string; lastName: string; password: string }) => Promise<void>;
  requestOtp: (phone: string) => Promise<{ expiresInSeconds: number; devCode?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, "firstName" | "lastName" | "email">>) => Promise<void>;
  upsertAddress: (address: Omit<Address, "id"> & { id?: string }) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

const mapSupabaseSession = (s: SupabaseSession | null): Session | null => {
  if (!s) return null;
  return {
    token: s.access_token,
    userId: s.user.id,
    expiresAt: (s.expires_in ? Date.now() + s.expires_in * 1000 : Date.now() + 3600 * 1000),
  };
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      // Set up onAuthStateChange listener
      supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (event === 'SIGNED_OUT') {
          set({ session: null, user: null });
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const session = mapSupabaseSession(currentSession);
          if (!session) return;
          if (currentSession?.user) {

            // Check for pending signup profile data before reading
            const pendingStr = sessionStorage.getItem("jamimode-pending-signup");
            let newProfileData = null;
            if (pendingStr) {
               try {
                 newProfileData = JSON.parse(pendingStr);
                 // The session is now active, so RLS permits inserting the profile
                 await supabase.from("profiles").upsert({
                    id: currentSession.user.id,
                    first_name: newProfileData.firstName,
                    last_name: newProfileData.lastName,
                    phone: currentSession.user.phone || ""
                 });
               } catch (e) {
                 console.error("Failed to parse or insert pending profile", e);
               } finally {
                 sessionStorage.removeItem("jamimode-pending-signup");
               }
            }

            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", currentSession.user.id)
              .single();

            const { data: dbAddresses } = await supabase
              .from("addresses")
              .select("*")
              .eq("user_id", currentSession.user.id);

            const mappedAddresses: Address[] = (dbAddresses || []).map((dbA) => ({
              id: dbA.id,
              label: dbA.label || "",
              recipient: dbA.recipient || "",
              phone: dbA.phone || "",
              country: dbA.country || "",
              city: dbA.city || "",
              line1: dbA.line1 || "",
              line2: dbA.line2 || "",
              postalCode: dbA.postal_code || "",
              isDefault: dbA.is_default || false,
            }));

            const currentUser = get().user;
            const user: User = {
              id: currentSession.user.id,
              phone: currentSession.user.phone || profile?.phone || "",
              firstName: profile?.first_name || (newProfileData?.firstName ?? ""),
              lastName: profile?.last_name || (newProfileData?.lastName ?? ""),
              email: profile?.email || currentSession.user.email,
              createdAt: currentSession.user.created_at,
              addresses: mappedAddresses,
              wallet: { balance: profile?.wallet_balance || 0, currencyCode: "IRR", transactions: [] },
              orders: currentUser?.orders || [],
            };
            set({ session, user });
          } else {
             set({ session });
          }
        }
      });

      return {
        session: null,
        user: null,
        isBootstrapping: false,

        isAuthenticated: () => {
          const { session } = get();
          return !!session && session.expiresAt > Date.now();
        },

        bootstrap: async () => {
          set({ isBootstrapping: true });
          try {
            const { data: { session: currentSession }, error } = await supabase.auth.getSession();
            if (error || !currentSession) {
              set({ session: null, user: null });
              return;
            }

            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", currentSession.user.id)
              .single();

            const { data: dbAddresses } = await supabase
              .from("addresses")
              .select("*")
              .eq("user_id", currentSession.user.id);

            const mappedAddresses: Address[] = (dbAddresses || []).map((dbA) => ({
              id: dbA.id,
              label: dbA.label || "",
              recipient: dbA.recipient || "",
              phone: dbA.phone || "",
              country: dbA.country || "",
              city: dbA.city || "",
              line1: dbA.line1 || "",
              line2: dbA.line2 || "",
              postalCode: dbA.postal_code || "",
              isDefault: dbA.is_default || false,
            }));

            const currentUser = get().user;
            set({
              session: mapSupabaseSession(currentSession),
              user: {
                id: currentSession.user.id,
                phone: currentSession.user.phone || profile?.phone || "",
                firstName: profile?.first_name || "",
                lastName: profile?.last_name || "",
                email: profile?.email || currentSession.user.email,
                createdAt: currentSession.user.created_at,
                addresses: mappedAddresses,
                wallet: { balance: profile?.wallet_balance || 0, currencyCode: "IRR", transactions: [] },
                orders: currentUser?.orders || [],
              }
            });
          } catch {
            set({ session: null, user: null });
          } finally {
            set({ isBootstrapping: false });
          }
        },

        signInWithPassword: async (phone, password) => {
          const normalized = normalizePhone(phone);
          const { data, error } = await supabase.auth.signInWithPassword({ phone: normalized, password });
          if (error) throw new Error(error.message);

          if (data.session && data.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .single();

            const { data: dbAddresses } = await supabase
              .from("addresses")
              .select("*")
              .eq("user_id", data.user.id);

            const mappedAddresses: Address[] = (dbAddresses || []).map((dbA) => ({
              id: dbA.id,
              label: dbA.label || "",
              recipient: dbA.recipient || "",
              phone: dbA.phone || "",
              country: dbA.country || "",
              city: dbA.city || "",
              line1: dbA.line1 || "",
              line2: dbA.line2 || "",
              postalCode: dbA.postal_code || "",
              isDefault: dbA.is_default || false,
            }));

            const currentUser = get().user;
            set({
              session: mapSupabaseSession(data.session),
              user: {
                id: data.user.id,
                phone: data.user.phone || profile?.phone || normalized,
                firstName: profile?.first_name || "",
                lastName: profile?.last_name || "",
                email: profile?.email || data.user.email,
                createdAt: data.user.created_at,
                addresses: mappedAddresses,
                wallet: { balance: profile?.wallet_balance || 0, currencyCode: "IRR", transactions: [] },
                orders: currentUser?.orders || [],
              }
            });
          }
        },

        signUp: async (input) => {
          const normalized = normalizePhone(input.phone);

          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("phone", normalized)
            .maybeSingle();

          if (existingProfile) {
            throw new Error("An account with this phone number already exists");
          }

          const { data, error } = await supabase.auth.signUp({
            phone: normalized,
            password: input.password
          });
          if (error) throw new Error(error.message);

          if (data.user) {
            // Save names for insertion after OTP verify establishes session
            sessionStorage.setItem("jamimode-pending-signup", JSON.stringify({
              firstName: input.firstName,
              lastName: input.lastName
            }));

            if (data.session) {
              const currentUser = get().user;
              set({
                session: mapSupabaseSession(data.session),
                user: {
                  id: data.user.id,
                  phone: normalized,
                  firstName: input.firstName,
                  lastName: input.lastName,
                  email: data.user.email, // At signup, we rely on auth user email if any
                  createdAt: data.user.created_at,
                  addresses: currentUser?.addresses || [],
                  wallet: currentUser?.wallet || { balance: 0, currencyCode: "USD", transactions: [] },
                  orders: currentUser?.orders || [],
                }
              });
            }
          }
        },

        requestOtp: async (phone) => {
           const normalized = normalizePhone(phone);
           const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
           if (error) throw new Error(error.message);
           return { expiresInSeconds: 120 };
        },

        verifyOtp: async (phone, code) => {
          const normalized = normalizePhone(phone);
          const { error } = await supabase.auth.verifyOtp({ phone: normalized, token: code, type: 'sms' });
          if (error) throw new Error(error.message);

          // State will be set by the onAuthStateChange listener which centralizes profile fetching and insertion
        },

        signOut: async () => {
          await supabase.auth.signOut();
          set({ session: null, user: null });
        },

        updateProfile: async (patch) => {
          const { session, user } = get();
          if (!session || !user) return;

          const updateData: { first_name?: string; last_name?: string; email?: string } = {};
          if (patch.firstName !== undefined) updateData.first_name = patch.firstName;
          if (patch.lastName !== undefined) updateData.last_name = patch.lastName;
          if (patch.email !== undefined) updateData.email = patch.email;

          if (Object.keys(updateData).length > 0) {
              await supabase
                .from("profiles")
                .update(updateData)
                .eq("id", user.id);
          }

          set({ user: { ...user, ...patch } });
        },

        upsertAddress: async (address) => {
          const { user, session } = get();
          if (!user || !session) return;

          const isNew = !address.id;
          const id = address.id ?? crypto.randomUUID();

          const dbAddress = {
            id,
            user_id: user.id,
            label: address.label,
            recipient: address.recipient,
            phone: address.phone,
            country: address.country,
            city: address.city,
            line1: address.line1,
            line2: address.line2 || null,
            postal_code: address.postalCode,
            is_default: address.isDefault,
          };

          if (isNew) {
            await supabase.from("addresses").insert(dbAddress);
          } else {
            await supabase.from("addresses").update(dbAddress).eq("id", id);
          }

          const exists = user.addresses.some((a) => a.id === id);
          let addresses = exists
            ? user.addresses.map((a) => (a.id === id ? { ...a, ...address, id } : a))
            : [...user.addresses, { ...address, id }];

          const shouldBeDefault = address.isDefault || addresses.length === 1;
          addresses = addresses.map((a) => ({ ...a, isDefault: shouldBeDefault ? a.id === id : a.isDefault }));

          if (shouldBeDefault) {
              await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id).neq("id", id);
              await supabase.from("addresses").update({ is_default: true }).eq("id", id);
          }

          set({ user: { ...user, addresses } });
        },

        deleteAddress: async (id) => {
          const { user } = get();
          if (!user) return;

          await supabase.from("addresses").delete().eq("id", id);

          let addresses = user.addresses.filter((a) => a.id !== id);
          if (addresses.length && !addresses.some((a) => a.isDefault)) {
            addresses = addresses.map((a, i) => ({ ...a, isDefault: i === 0 }));
            if (addresses[0]) {
               await supabase.from("addresses").update({ is_default: true }).eq("id", addresses[0].id);
            }
          }
          set({ user: { ...user, addresses } });
        },

        setDefaultAddress: async (id) => {
          const { user } = get();
          if (!user) return;

          await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
          await supabase.from("addresses").update({ is_default: true }).eq("id", id);

          const addresses = user.addresses.map((a) => ({ ...a, isDefault: a.id === id }));
          set({ user: { ...user, addresses } });
        },
      };
    },
    {
      name: "jamimode-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session, user: state.user }),
    }
  )
);
