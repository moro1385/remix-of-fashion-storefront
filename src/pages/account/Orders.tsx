import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import AccountLayout from "@/components/account/AccountLayout";
import { useAuthStore } from "@/stores/authStore";
import type { OrderStatus } from "@/lib/authClient";
import { cn } from "@/lib/utils";

const statusStyles: Record<OrderStatus, string> = {
  processing: "bg-muted text-muted-foreground",
  confirmed: "bg-secondary text-secondary-foreground",
  shipped: "bg-accent text-accent-foreground",
  delivered: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function Orders() {
  const orders = useAuthStore((s) => s.user?.orders ?? []);

  return (
    <AccountLayout title="Orders" description="Follow every order from confirmation to delivery.">
      {orders.length === 0 ? (
        <div className="text-center py-14">
          <Package className="w-8 h-8 mx-auto text-muted-foreground" strokeWidth={1.25} />
          <p className="mt-6 text-lg font-light text-foreground">No orders yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            When you place your first order it will appear here with live delivery updates.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex h-12 items-center px-8 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article key={order.id} className="border border-border">
              <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-border">
                <div>
                  <p className="text-sm uppercase tracking-[0.15em] text-foreground">
                    Order {order.number}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    {" • "}
                    {order.deliveryStatus}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-[0.2em] px-3 py-1.5",
                      statusStyles[order.status]
                    )}
                  >
                    {order.status}
                  </span>
                  <p className="text-sm text-foreground tabular-nums">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: order.currencyCode,
                    }).format(order.total)}
                  </p>
                </div>
              </header>
              <ul className="divide-y divide-border">
                {order.lines.map((line, i) => (
                  <li key={i} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div>
                      <p className="text-sm text-foreground">{line.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {line.variant} • Qty {line.quantity}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency: order.currencyCode,
                      }).format(line.price)}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
