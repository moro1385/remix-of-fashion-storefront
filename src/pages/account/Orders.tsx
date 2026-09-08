import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Loader2 } from "lucide-react";
import AccountLayout from "@/components/account/AccountLayout";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { OrderDetailsDialog } from "@/components/shared/OrderDetailsDialog";

const statusStyles: Record<string, string> = {
  processing: "bg-muted text-muted-foreground",
  confirmed: "bg-secondary text-secondary-foreground",
  shipped: "bg-accent text-accent-foreground",
  delivered: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusTranslations: Record<string, string> = {
  pending: "در انتظار",
  processing: "در حال پردازش",
  confirmed: "تایید شده",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
};

interface OrderLine {
  title: string;
  variant: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  number: string;
  createdAt: string;
  total: number;
  currencyCode: string;
  status: string;
  deliveryStatus: string;
  lines: OrderLine[];
}

export default function Orders() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (*)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedOrders = (data || []).map((o) => ({
          id: o.id,
          number: o.id.split("-")[0].toUpperCase(),
          createdAt: o.created_at,
          total: o.total_amount,
          currencyCode: "IRR",
          status: o.status,
          deliveryStatus: statusTranslations[(o.status === "confirmed" ? "processing" : o.status).toLowerCase()] || (o.status === "confirmed" ? "Processing" : o.status),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          lines: ((o as any).order_items || []).map((line: any) => ({
            title: line.title || "محصول",
            variant: line.variant_title || "پیش‌فرض",
            quantity: line.quantity,
            price: line.price,
          })),
        }));

        setOrders(formattedOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <AccountLayout title="سفارشات" description="هر سفارش را از تأیید تا تحویل پیگیری کنید.">
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="سفارشات" description="هر سفارش را از تأیید تا تحویل پیگیری کنید.">
      <OrderDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        orderId={selectedOrderId}
      />
        {orders.length === 0 ? (
          <div className="text-center py-14">
            <Package className="w-8 h-8 mx-auto text-muted-foreground" strokeWidth={1.25} />
            <p className="mt-6 text-lg font-light text-foreground">هنوز سفارشی وجود ندارد</p>
            <p className="mt-2 text-sm text-muted-foreground">
              هنگامی که اولین سفارش خود را ثبت کنید، در اینجا با به‌روزرسانی‌های زنده تحویل ظاهر می‌شود.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex h-12 items-center px-8 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
            >
              شروع خرید
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="border border-border cursor-pointer hover:bg-muted/10 transition-colors rounded-2xl overflow-hidden"
                onClick={() => {
                  setSelectedOrderId(order.id);
                  setIsDialogOpen(true);
                }}
              >
                <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-border">
                  <div>
                    <p className="text-sm uppercase tracking-[0.15em] text-foreground">
                      سفارش {order.number}
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
                        "text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full",
                        statusStyles[order.status] || statusStyles.processing
                      )}
                    >
                      {statusTranslations[order.status.toLowerCase()] || order.status}
                    </span>
                    <p className="text-sm text-foreground tabular-nums">
                      {new Intl.NumberFormat('fa-IR').format(order.total)} ریال
                    </p>
                  </div>
                </header>
                <ul className="divide-y divide-border">
                  {order.lines.map((line, i) => (
                    <li key={i} className="flex items-center justify-between gap-4 px-6 py-4">
                      <div>
                        <p className="text-sm text-foreground">{line.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {line.variant} • تعداد {line.quantity}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground tabular-nums">
                        {new Intl.NumberFormat('fa-IR').format(line.price)} ریال
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
