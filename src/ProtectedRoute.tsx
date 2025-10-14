import { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "./context/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;

  return <>{children}</>;
}
