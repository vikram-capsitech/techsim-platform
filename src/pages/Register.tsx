import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!username || username.length < 3)
      errs.username = 'Username must be at least 3 characters';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Enter a valid email address';
    if (!password || password.length < 8)
      errs.password = 'Password must be at least 8 characters';
    if (password !== confirm)
      errs.confirm = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      await register(username, email, password);
      navigate('/canvas', { replace: true });
    } catch (err) {
      setApiError((err as Error).message);
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="6" height="6" rx="1.5" />
              <rect x="16" y="2" width="6" height="6" rx="1.5" />
              <rect x="9" y="16" width="6" height="6" rx="1.5" />
              <path d="M5 8v4a2 2 0 0 0 2 2h2" />
              <path d="M19 8v4a2 2 0 0 1-2 2h-2" />
              <path d="M12 16v-2" />
            </svg>
          </div>
          <div>
            <div style={styles.logoName}>SystemCraft</div>
            <div style={styles.logoSub}>System Design University</div>
          </div>
        </div>

        <h1 style={styles.heading}>Create your account</h1>
        <p style={styles.sub}>Join SystemCraft and start designing your distributed systems.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Field label="Username" type="text" value={username} onChange={setUsername}
            placeholder="handle" autoFocus error={fieldErrors.username}
            onClearError={() => setFieldErrors(f => ({ ...f, username: undefined }))}
          />
          <Field label="Email" type="email" value={email} onChange={setEmail}
            placeholder="you@company.com" error={fieldErrors.email}
            onClearError={() => setFieldErrors(f => ({ ...f, email: undefined }))}
          />
          <Field label="Password" type={showPw ? 'text' : 'password'}
            value={password} onChange={setPassword} placeholder="min 8 characters"
            error={fieldErrors.password}
            onClearError={() => setFieldErrors(f => ({ ...f, password: undefined }))}
            rightSlot={
              <button type="button" onClick={() => setShowPw(s => !s)} style={styles.eyeBtn}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          <Field label="Confirm Password" type={showPw ? 'text' : 'password'}
            value={confirm} onChange={setConfirm} placeholder="••••••••"
            error={fieldErrors.confirm}
            onClearError={() => setFieldErrors(f => ({ ...f, confirm: undefined }))}
          />

          {apiError && <div style={styles.errorBox}>{apiError}</div>}

          <button type="submit" disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.65 : 1 }}>
            {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, rightSlot, autoFocus, error, onClearError }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  rightSlot?: React.ReactNode; autoFocus?: boolean;
  error?: string; onClearError?: () => void;
}) {
  return (
    <div>
      <label style={styles.fieldLabel}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={type} value={value} autoFocus={autoFocus}
          onChange={e => { onChange(e.target.value); onClearError?.(); }}
          placeholder={placeholder}
          style={{
            ...styles.input,
            paddingRight: rightSlot ? 38 : 12,
            borderColor: error ? 'rgba(239,68,68,0.6)' : undefined,
          }}
          onFocus={e  => !error && (e.currentTarget.style.borderColor = 'var(--accent-bright)')}
          onBlur={e   => !error && (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        {rightSlot && <div style={styles.rightSlot}>{rightSlot}</div>}
      </div>
      {error && (
        <div style={styles.fieldError}>{error}</div>
      )}
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
    position: 'relative', width: 420,
    background: 'var(--sidebar-bg)',
    border: '1px solid var(--border)',
    borderRadius: 16, padding: '36px 36px 32px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
    animation: 'fadeUp 0.35s ease forwards',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 },
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
  sub: { fontSize: 13, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif", marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  fieldLabel: {
    display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'var(--text-muted)', marginBottom: 5,
  },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    background: 'var(--input-bg)', border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
  },
  rightSlot: {
    position: 'absolute', right: 10, top: '50%',
    transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex',
  },
  eyeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 },
  fieldError: {
    fontSize: 11.5, color: '#EF4444', fontFamily: "'DM Sans', sans-serif", marginTop: 4,
  },
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
    marginTop: 20, paddingTop: 18,
    borderTop: '1px solid var(--border-dim)',
    textAlign: 'center', fontSize: 13,
    color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif",
  },
  link: { color: 'var(--accent-bright)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 },
};
