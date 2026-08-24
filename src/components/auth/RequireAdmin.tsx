import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";

export default function RequireAdmin() {
  const location = useLocation();
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  const isAuthenticated = !!session && session.expiresAt > Date.now();

  useEffect(() => {
    if (isAuthenticated && !user) void bootstrap();
  }, [isAuthenticated, user, bootstrap]);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user?.id) {
        setCheckingRole(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (err) {
        console.error("Failed to check admin status", err);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    }

    if (isAuthenticated && user && !isBootstrapping) {
      checkAdminStatus();
    } else if (!isAuthenticated && !isBootstrapping) {
      setCheckingRole(false);
    }
  }, [isAuthenticated, user, isBootstrapping]);

  if (!isAuthenticated && !isBootstrapping) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (!user || isBootstrapping || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--warm-bg))]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAdmin === false) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
