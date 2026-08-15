import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authBackend, type Address, type Session, type User } from "@/lib/authClient";

interface AuthStore {
  session: Session | null;
  user: User | null;
  isBootstrapping: boolean;
  isAuthenticated: () => boolean;
  bootstrap: () => Promise<void>;
  signInWithPassword: (phone: string, password: string) => Promise<void>;
  signUp: (input: { phone: string; firstName: string; lastName: string; password: string }) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, "firstName" | "lastName" | "email">>) => Promise<void>;
  upsertAddress: (address: Omit<Address, "id"> & { id?: string }) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      isBootstrapping: false,

      isAuthenticated: () => {
        const { session } = get();
        return !!session && session.expiresAt > Date.now();
      },

      bootstrap: async () => {
        const { session } = get();
        if (!session) return;
        if (session.expiresAt <= Date.now()) {
          set({ session: null, user: null });
          return;
        }
        set({ isBootstrapping: true });
        try {
          const user = await authBackend.getUser(session);
          set({ user });
        } catch {
          set({ session: null, user: null });
        } finally {
          set({ isBootstrapping: false });
        }
      },

      signInWithPassword: async (phone, password) => {
        const { session, user } = await authBackend.signInWithPassword({ phone, password });
        set({ session, user });
      },

      signUp: async (input) => {
        const { session, user } = await authBackend.signUp(input);
        set({ session, user });
      },

      verifyOtp: async (phone, code) => {
        const { session, user } = await authBackend.verifyOtp({ phone, code });
        set({ session, user });
      },

      signOut: async () => {
        const { session } = get();
        if (session) await authBackend.signOut(session);
        set({ session: null, user: null });
      },

      updateProfile: async (patch) => {
        const { session } = get();
        if (!session) return;
        set({ user: await authBackend.updateProfile(session, patch) });
      },

      upsertAddress: async (address) => {
        const { session } = get();
        if (!session) return;
        set({ user: await authBackend.upsertAddress(session, address) });
      },

      deleteAddress: async (id) => {
        const { session } = get();
        if (!session) return;
        set({ user: await authBackend.deleteAddress(session, id) });
      },

      setDefaultAddress: async (id) => {
        const { session } = get();
        if (!session) return;
        set({ user: await authBackend.setDefaultAddress(session, id) });
      },
    }),
    {
      name: "jamimode-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session, user: state.user }),
    }
  )
);
