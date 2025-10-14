// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute() {
  const { loading, session, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-8 text-center">Loading…</div>;
  }

  // Not logged in → go to /login
  if (!session || !profile) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but not a client or inactive → go to /login with message
  if (profile.role !== 'client' || !profile.is_active) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          reason:
            profile.role !== 'client'
              ? 'not_client'
              : 'inactive',
        }}
      />
    );
  }

  return <Outlet />;
}
