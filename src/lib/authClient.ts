/**
 * Authentication architecture.
 *
 * `AuthBackend` is the single contract the UI talks to. Today it is fulfilled by
 * `localAuthBackend` (browser storage + simulated SMS), so the whole flow is
 * functional end to end. To move to a real backend (Lovable Cloud / Supabase
 * phone auth + an SMS provider), implement the same interface and swap the
 * export at the bottom of this file — no UI changes required.
 */

import { normalizePhone } from "./phone";

export interface Address {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  country: string;
  city: string;
  line1: string;
  line2?: string;
  postalCode: string;
  isDefault: boolean;
}

export interface WalletTransaction {
  id: string;
  createdAt: string;
  description: string;
  amount: number; // positive = credit, negative = debit
}

export interface OrderLine {
  title: string;
  variant: string;
  quantity: number;
  price: number;
}

export type OrderStatus = "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  total: number;
  currencyCode: string;
  status: OrderStatus;
  deliveryStatus: string;
  lines: OrderLine[];
}

export interface User {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  createdAt: string;
  addresses: Address[];
  wallet: { balance: number; currencyCode: string; transactions: WalletTransaction[] };
  orders: Order[];
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: number;
}

export interface AuthResult {
  session: Session;
  user: User;
}

export class AuthError extends Error {
  field?: string;
  constructor(message: string, field?: string) {
    super(message);
    this.name = "AuthError";
    this.field = field;
  }
}

export interface AuthBackend {
  signInWithPassword(input: { phone: string; password: string }): Promise<AuthResult>;
  signUp(input: {
    phone: string;
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<AuthResult>;
  requestOtp(input: { phone: string }): Promise<{ expiresInSeconds: number; devCode?: string }>;
  verifyOtp(input: { phone: string; code: string }): Promise<AuthResult>;
  getUser(session: Session): Promise<User>;
  updateProfile(session: Session, patch: Partial<Pick<User, "firstName" | "lastName" | "email">>): Promise<User>;
  upsertAddress(session: Session, address: Omit<Address, "id"> & { id?: string }): Promise<User>;
  deleteAddress(session: Session, addressId: string): Promise<User>;
  setDefaultAddress(session: Session, addressId: string): Promise<User>;
  signOut(session: Session): Promise<void>;
}

/* ------------------------------------------------------------------ */
/* Local (browser storage) implementation                              */
/* ------------------------------------------------------------------ */

const USERS_KEY = "jamimode-auth-users";
const OTP_KEY = "jamimode-auth-otps";
const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_RESEND_SECONDS = 120;

interface StoredUser extends User {
  passwordHash: string;
}

const delay = (ms = 650) => new Promise((r) => setTimeout(r, ms));
const uid = () =>
  (globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function hashPassword(password: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return `plain:${password}`;
  const bytes = new TextEncoder().encode(`jamimode:${password}`);
  const digest = await subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const users = () => read<StoredUser[]>(USERS_KEY, []);
const saveUsers = (list: StoredUser[]) => write(USERS_KEY, list);

function publicUser(user: StoredUser): User {
  const { passwordHash: _ignored, ...rest } = user;
  return rest;
}

function makeSession(userId: string): Session {
  return { token: uid(), userId, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30 };
}

function requireUser(session: Session): StoredUser {
  const found = users().find((u) => u.id === session.userId);
  if (!found) throw new AuthError("Your session has expired. Please sign in again.");
  return found;
}

function persist(user: StoredUser): User {
  saveUsers(users().map((u) => (u.id === user.id ? user : u)));
  return publicUser(user);
}

function seedUser(phone: string, firstName: string, lastName: string, passwordHash: string): StoredUser {
  return {
    id: uid(),
    phone,
    firstName,
    lastName,
    createdAt: new Date().toISOString(),
    addresses: [],
    wallet: { balance: 0, currencyCode: "USD", transactions: [] },
    orders: [],
    passwordHash,
  };
}

export const localAuthBackend: AuthBackend = {
  async signInWithPassword({ phone, password }) {
    await delay();
    const normalized = normalizePhone(phone);
    const user = users().find((u) => u.phone === normalized);
    if (!user) throw new AuthError("No account found with this phone number.", "phone");
    const hash = await hashPassword(password);
    if (user.passwordHash !== hash) throw new AuthError("Incorrect password. Please try again.", "password");
    return { session: makeSession(user.id), user: publicUser(user) };
  },

  async signUp({ phone, firstName, lastName, password }) {
    await delay(800);
    const normalized = normalizePhone(phone);
    if (users().some((u) => u.phone === normalized)) {
      throw new AuthError("An account with this phone number already exists.", "phone");
    }
    const user = seedUser(normalized, firstName.trim(), lastName.trim(), await hashPassword(password));
    saveUsers([...users(), user]);
    return { session: makeSession(user.id), user: publicUser(user) };
  },

  async requestOtp({ phone }) {
    await delay(700);
    const normalized = normalizePhone(phone);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const store = read<Record<string, { code: string; expiresAt: number }>>(OTP_KEY, {});
    store[normalized] = { code, expiresAt: Date.now() + OTP_TTL_MS };
    write(OTP_KEY, store);
    // A real backend sends this over SMS and never returns it.
    return { expiresInSeconds: OTP_RESEND_SECONDS, devCode: code };
  },

  async verifyOtp({ phone, code }) {
    await delay();
    const normalized = normalizePhone(phone);
    const store = read<Record<string, { code: string; expiresAt: number }>>(OTP_KEY, {});
    const entry = store[normalized];
    if (!entry) throw new AuthError("No verification code was requested for this number.", "code");
    if (entry.expiresAt < Date.now()) throw new AuthError("This code has expired. Request a new one.", "code");
    if (entry.code !== code) throw new AuthError("That code is not correct. Please check and retry.", "code");
    delete store[normalized];
    write(OTP_KEY, store);

    let user = users().find((u) => u.phone === normalized);
    if (!user) {
      user = seedUser(normalized, "", "", "");
      saveUsers([...users(), user]);
    }
    return { session: makeSession(user.id), user: publicUser(user) };
  },

  async getUser(session) {
    await delay(250);
    return publicUser(requireUser(session));
  },

  async updateProfile(session, patch) {
    await delay(500);
    const user = requireUser(session);
    return persist({
      ...user,
      firstName: patch.firstName?.trim() ?? user.firstName,
      lastName: patch.lastName?.trim() ?? user.lastName,
      email: patch.email?.trim() ?? user.email,
    });
  },

  async upsertAddress(session, address) {
    await delay(500);
    const user = requireUser(session);
    const id = address.id ?? uid();
    const exists = user.addresses.some((a) => a.id === id);
    let addresses = exists
      ? user.addresses.map((a) => (a.id === id ? { ...a, ...address, id } : a))
      : [...user.addresses, { ...address, id }];
    const shouldBeDefault = address.isDefault || addresses.length === 1;
    addresses = addresses.map((a) => ({ ...a, isDefault: shouldBeDefault ? a.id === id : a.isDefault }));
    return persist({ ...user, addresses });
  },

  async deleteAddress(session, addressId) {
    await delay(400);
    const user = requireUser(session);
    let addresses = user.addresses.filter((a) => a.id !== addressId);
    if (addresses.length && !addresses.some((a) => a.isDefault)) {
      addresses = addresses.map((a, i) => ({ ...a, isDefault: i === 0 }));
    }
    return persist({ ...user, addresses });
  },

  async setDefaultAddress(session, addressId) {
    await delay(300);
    const user = requireUser(session);
    return persist({
      ...user,
      addresses: user.addresses.map((a) => ({ ...a, isDefault: a.id === addressId })),
    });
  },

  async signOut() {
    await delay(150);
  },
};

export const authBackend: AuthBackend = localAuthBackend;
