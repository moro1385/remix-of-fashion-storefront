import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

type Profile = {
  id: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data as Profile[]);
    } catch (err: unknown) {
      console.error("Error fetching users:", err);
      setError((err instanceof Error ? err.message : "An error occurred") || "بارگیری کاربران با شکست مواجه شد");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">کاربران</h1>
        <p className="text-muted-foreground mt-2">
          کاربران ثبت‌نام شده را در اینجا مدیریت کنید.
        </p>
      </div>

      <div className="bg-background rounded-md border">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            هیچ کاربری پیدا نشد.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شناسه کاربر</TableHead>
                <TableHead>نام</TableHead>
                <TableHead>تلفن</TableHead>
                <TableHead>تاریخ عضویت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {user.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {fullName || "N/A"}
                    </TableCell>
                    <TableCell>
                      {user.phone || "N/A"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), "MMM d, yyyy")}
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
