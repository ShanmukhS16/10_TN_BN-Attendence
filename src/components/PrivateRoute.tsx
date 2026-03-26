import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-lg">🔄 Loading session...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
