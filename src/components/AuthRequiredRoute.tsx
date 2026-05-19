import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthSession } from "../auth/AuthSessionProvider";
import { buildLoginRedirectPath } from "../auth/routePolicy";

interface AuthRequiredRouteProps {
  children: React.ReactNode;
}

const AuthRequiredRoute: React.FC<AuthRequiredRouteProps> = ({ children }) => {
  const location = useLocation();
  const { session, status } = useAuthSession();

  if (status === "booting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ios-gray-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hushh-blue mx-auto"></div>
          <p className="mt-4 text-hushh-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated" || !session?.user?.id) {
    return (
      <Navigate
        to={buildLoginRedirectPath(
          location.pathname,
          location.search,
          location.hash
        )}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default AuthRequiredRoute;
