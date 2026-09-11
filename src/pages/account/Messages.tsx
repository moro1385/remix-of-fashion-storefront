import { useEffect, useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import AccountLayout from "@/components/account/AccountLayout";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface UserMessage {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export default function Messages() {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("user_messages")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [user]);

  const handleMarkAsRead = async (message: UserMessage) => {
    if (message.is_read || !user) return;

    // Optimistically update UI
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m))
    );

    try {
      const { error } = await supabase
        .from("user_messages")
        .update({ is_read: true })
        .eq("id", message.id)
        .eq("user_id", user.id);

      if (error) throw error;
    } catch (err) {
      console.error("Failed to mark message as read:", err);
      // Revert if error
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, is_read: false } : m))
      );
    }
  };

  if (loading) {
    return (
      <AccountLayout title="پیام‌ها" description="پیام‌ها و پاسخ‌های تیم پشتیبانی را اینجا مشاهده کنید.">
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="پیام‌ها" description="پیام‌ها و پاسخ‌های تیم پشتیبانی را اینجا مشاهده کنید.">
      {messages.length === 0 ? (
        <div className="text-center py-14">
          <Mail className="w-8 h-8 mx-auto text-muted-foreground" strokeWidth={1.25} />
          <p className="mt-6 text-lg font-light text-foreground">پیامی وجود ندارد</p>
          <p className="mt-2 text-sm text-muted-foreground">
            پیام‌ها و پاسخ‌های تیم پشتیبانی در اینجا ظاهر خواهند شد.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {messages.map((message) => (
            <article
              key={message.id}
              className={cn(
                "border border-border cursor-pointer hover:bg-muted/10 transition-colors rounded-2xl overflow-hidden px-6 py-5",
                !message.is_read && "bg-muted/5 border-primary/20"
              )}
              onClick={() => handleMarkAsRead(message)}
            >
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4 mb-4">
                <div className="flex items-center gap-3">
                  {!message.is_read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-label="Unread message" />
                  )}
                  <h3 className={cn(
                    "text-base text-foreground",
                    !message.is_read ? "font-medium" : "font-normal"
                  )}>
                    {message.title}
                  </h3>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {!message.is_read && (
                    <span className="text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-primary text-primary-foreground">
                      جدید
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleDateString("fa-IR", { dateStyle: "medium" })}
                  </p>
                </div>
              </header>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {message.body}
              </div>
            </article>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
