import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { refreshTokens } from "../../api/auth";
import LoadingSpinner from "../common/LoadingSpinner";

export default function AuthGuard() {
  const { isAuthenticated, setAuth } = useAuthStore();
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      setChecking(false);
      return;
    }

    refreshTokens(refreshToken)
      .then((res) => {
        setAuth(res.user, res.access_token, res.refresh_token);
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      })
      .finally(() => setChecking(false));
  }, [setAuth]);

  if (checking) return <LoadingSpinner size="lg" />;
  if (!useAuthStore.getState().isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
