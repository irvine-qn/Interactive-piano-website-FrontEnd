import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { ROUTES } from "../config/routes";

export const ProtectedRoute = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  return <Outlet />;
};

export const GuestRoute = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  if (user) return <Navigate to={location.state?.from || ROUTES.HOME} replace />;
  return <Outlet />;
};
