import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function RedirectIfAuthenticated() {
  const session = useAuthStore((s) => s.session);
  const isAuthenticated = !!session && session.expiresAt > Date.now();
  return isAuthenticated ? <Navigate to="/account" replace /> : <Outlet />;
}
