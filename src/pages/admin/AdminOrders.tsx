import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { OrderDetailsDialog } from "@/components/shared/OrderDetailsDialog";

type Order = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_cost: number;
  shipping_method: string | null;
  payment_method: string | null;
  user_id: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  } | null;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          status,
          total_amount,
          shipping_cost,
          shipping_method,
          payment_method,
          user_id,
          profiles (
            first_name,
            last_name,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      // The type from supabase join is slightly annoying, so we cast it for now
      setOrders(data as unknown as Order[]);
    } catch (err: unknown) {
      console.error("Error fetching orders:", err);
      setError((err instanceof Error ? err.message : "An error occurred") || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }

  async function updateOrderStatus(id: string, newStatus: string) {
    try {
      // Optimistic update
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));

      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err: unknown) {
      console.error("Error updating status:", err);
      toast.error((err instanceof Error ? err.message : "An error occurred") || "Failed to update status");
      // Revert on error
      fetchOrders();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-2">
          Manage customer orders here.
        </p>
      </div>

      <OrderDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        orderId={selectedOrderId}
      />

      <div className="bg-background rounded-md border">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No orders found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Shipping / Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const customerName = [order.profiles?.first_name, order.profiles?.last_name].filter(Boolean).join(" ");
                const customerDisplay = customerName || order.profiles?.phone || "Unknown User";

                return (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={(e) => {
                      // Prevent row click if clicking on the select dropdown
                      if ((e.target as HTMLElement).closest('[role="combobox"]')) return;
                      setSelectedOrderId(order.id);
                      setIsDialogOpen(true);
                    }}
                  >
                    <TableCell className="font-medium font-mono text-xs">
                      {order.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{customerDisplay}</span>
                        {customerName && order.profiles?.phone && (
                          <span className="text-xs text-muted-foreground">{order.profiles.phone}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                         <span>{order.shipping_method === 'express' ? "پست پیشتاز" : order.shipping_method === 'regular' ? "پست معمولی" : "N/A"}</span>
                         <span className="text-muted-foreground capitalize">{order.payment_method || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Intl.NumberFormat('fa-IR').format(order.total_amount)} ریال</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
