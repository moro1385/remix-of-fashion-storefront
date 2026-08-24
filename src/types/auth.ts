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
