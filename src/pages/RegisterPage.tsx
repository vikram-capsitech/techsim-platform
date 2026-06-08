import { useState } from 'react';
import { Eye, EyeOff, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterPageProps {
  onGoToLogin: () => void;
}

export function RegisterPage({ onGoToLogin }: RegisterPageProps) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirm) { setError('All fields required'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError(null);
    try {
      await register(username, email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100vw', height: '100vh',
        background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, #252535 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.5 }} />
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 480, height: 320, background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div
        style={{
          position: 'relative',
          width: 420,
          background: 'var(--sidebar-bg)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '36px 36px 32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          animation: 'fadeUp 0.4s ease forwards',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--accent-glow)' }}>
            <Zap size={18} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.1 }}>TechSim</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>Infrastructure Platform</div>
          </div>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em', marginBottom: 6 }}>
          Create your account
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 24 }}>Join TechSim and start designing your infrastructure.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <RegField label="Username" type="text" value={username} onChange={setUsername} placeholder="handle" autoFocus />
          <RegField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
          <RegField
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            placeholder="min 8 characters"
            rightSlot={
              <button type="button" onClick={() => setShowPw((s) => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          <RegField
            label="Confirm Password"
            type={showPw ? 'text' : 'password'}
            value={confirm}
            onChange={setConfirm}
            placeholder="••••••••"
          />

          {error && (
            <div style={{ padding: '9px 12px', borderRadius: 7, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 12.5, color: '#EF4444', fontFamily: "'DM Sans', sans-serif" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '12px', borderRadius: 9, background: loading ? 'rgba(124,58,237,0.5)' : 'var(--accent)', border: 'none', color: 'white', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 0 20px var(--accent-glow)', transition: 'all 0.15s', marginTop: 2 }}
          >
            {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-dim)', textAlign: 'center', fontSize: 13, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif" }}>
          Already have an account?{' '}
          <button onClick={onGoToLogin} style={{ background: 'none', border: 'none', color: 'var(--accent-bright)', fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: 'pointer', padding: 0, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

function RegField({ label, type, value, onChange, placeholder, rightSlot, autoFocus }: {
  label: string; type: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rightSlot?: React.ReactNode; autoFocus?: boolean;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{ width: '100%', padding: rightSlot ? '10px 38px 10px 12px' : '10px 12px', borderRadius: 8, background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', transition: 'border-color 0.15s' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-bright)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        {rightSlot && <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{rightSlot}</div>}
      </div>
    </div>
  );
}
