import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px var(--accent-glow)',
            animation: 'pulse-glow 1.5s ease-in-out infinite',
          }}>
            <Zap size={20} color="white" strokeWidth={2} />
          </div>
          <div style={{
            fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
            color: 'var(--text-muted)', letterSpacing: '0.1em',
          }}>
            VERIFYING SESSION…
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Preserve intended destination so Login can redirect back after auth
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
