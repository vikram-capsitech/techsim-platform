import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = (location.state as { from?: string })?.from ?? '/canvas';

  const [email,   setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required'); return; }
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.grid} />
      <div style={styles.glow} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>
            <Zap size={18} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={styles.logoName}>TechSim</div>
            <div style={styles.logoSub}>Infrastructure Platform</div>
          </div>
        </div>

        <h1 style={styles.heading}>Sign in to your workspace</h1>
        <p style={styles.sub}>Design, simulate and secure your infrastructure.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Field label="Email" type="email" value={email} onChange={setEmail}
            placeholder="you@company.com" autoFocus />

          <Field label="Password" type={showPw ? 'text' : 'password'}
            value={password} onChange={setPassword} placeholder="••••••••"
            rightSlot={
              <button type="button" onClick={() => setShowPw(s => !s)} style={styles.eyeBtn}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          {error && <div style={styles.errorBox}>{error}</div>}

          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.65 : 1 }}>
            {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Create account</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, rightSlot, autoFocus }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  rightSlot?: React.ReactNode; autoFocus?: boolean;
}) {
  return (
    <div>
      <label style={styles.fieldLabel}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={type} value={value} autoFocus={autoFocus}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...styles.input, paddingRight: rightSlot ? 38 : 12 }}
          onFocus={e  => (e.currentTarget.style.borderColor = 'var(--accent-bright)')}
          onBlur={e   => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        {rightSlot && <div style={styles.rightSlot}>{rightSlot}</div>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100vw', height: '100vh',
    background: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: 'radial-gradient(circle, #252535 1px, transparent 1px)',
    backgroundSize: '20px 20px', opacity: 0.5,
  },
  glow: {
    position: 'absolute', top: '30%', left: '50%',
    transform: 'translate(-50%,-50%)', width: 480, height: 320,
    background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', width: 400,
    background: 'var(--sidebar-bg)',
    border: '1px solid var(--border)',
    borderRadius: 16, padding: '36px 36px 32px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
    animation: 'fadeUp 0.35s ease forwards',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: 'var(--accent)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 20px var(--accent-glow)',
  },
  logoName: {
    fontSize: 18, fontWeight: 800, color: 'var(--text)',
    fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.1,
  },
  logoSub: { fontSize: 10.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" },
  heading: {
    fontSize: 22, fontWeight: 700, color: 'var(--text)',
    fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em', marginBottom: 6,
  },
  sub: { fontSize: 13, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif", marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  fieldLabel: {
    display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'var(--text-muted)', marginBottom: 6,
  },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    background: 'var(--input-bg)', border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
  },
  rightSlot: {
    position: 'absolute', right: 10, top: '50%',
    transform: 'translateY(-50%)', color: 'var(--text-muted)',
    display: 'flex',
  },
  eyeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 },
  errorBox: {
    padding: '9px 12px', borderRadius: 7,
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    fontSize: 12.5, color: '#EF4444', fontFamily: "'DM Sans', sans-serif",
  },
  submitBtn: {
    padding: '12px', borderRadius: 9, background: 'var(--accent)',
    border: 'none', color: 'white', fontSize: 14, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    boxShadow: '0 0 20px var(--accent-glow)', transition: 'all 0.15s', marginTop: 4,
  },
  footer: {
    marginTop: 22, paddingTop: 20,
    borderTop: '1px solid var(--border-dim)',
    textAlign: 'center', fontSize: 13,
    color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif",
  },
  link: { color: 'var(--accent-bright)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 },
};
