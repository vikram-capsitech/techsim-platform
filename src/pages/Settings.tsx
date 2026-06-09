import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, type Theme } from '../context/ThemeContext';
import { authApi } from '../api/client';

// ── Helpers ────────────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em' }}>
        {title}
      </h2>
      <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif" }}>
        {subtitle}
      </p>
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '20px 24px', marginBottom: 16, ...style,
    }}>
      {children}
    </div>
  );
}

function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
      <div style={{ width: 200, flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{hint}</div>}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--bg)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '8px 12px',
  color: 'var(--text)', fontSize: 13,
  fontFamily: "'IBM Plex Mono', monospace",
  outline: 'none', transition: 'border-color 0.12s',
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 42, height: 24, borderRadius: 12, cursor: 'pointer',
        background: checked ? '#7C3AED' : 'var(--border)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </div>
  );
}

function SaveToast({ show }: { show: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: '#10B981', color: '#fff', borderRadius: 10,
      padding: '10px 24px', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      opacity: show ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: 'none',
      zIndex: 999,
    }}>
      ✓ Settings saved
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  // AI keys
  const [groqKey,   setGroqKey]   = useState(() => localStorage.getItem('groq_api_key') ?? '');
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') ?? '');
  const [showGroq,  setShowGroq]  = useState(false);
  const [showGem,   setShowGem]   = useState(false);

  // Canvas prefs
  const [routing,      setRouting]      = useState<string>(() => localStorage.getItem('edge_routing') ?? 'bezier');
  const [animPkts,     setAnimPkts]     = useState(() => localStorage.getItem('anim_packets') !== 'false');
  const [showGrid,     setShowGrid]     = useState(() => localStorage.getItem('show_grid') !== 'false');
  const [minimap,      setMinimap]      = useState(() => localStorage.getItem('show_minimap') !== 'false');
  const [autoValidate, setAutoValidate] = useState(() => localStorage.getItem('auto_validate') !== 'false');

  // Profile (synced with DB)
  const [name,  setName]  = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const [toastShown, setToastShown] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');

  // Keep state in sync if user context updates
  useEffect(() => {
    if (user) {
      setName(user.username);
      setEmail(user.email);
    }
  }, [user]);

  async function save() {
    setSaving(true);
    setError('');
    try {
      // Update profile in database
      const updatedUser = await authApi.updateProfile(name, email);
      updateUser({
        ...updatedUser,
        _id: updatedUser.id ?? updatedUser._id,
      });

      // Save keys and preferences to localStorage
      localStorage.setItem('groq_api_key',   groqKey);
      localStorage.setItem('gemini_api_key', geminiKey);
      localStorage.setItem('edge_routing',  routing);
      localStorage.setItem('anim_packets',  String(animPkts));
      localStorage.setItem('show_grid',     String(showGrid));
      localStorage.setItem('show_minimap',  String(minimap));
      localStorage.setItem('auto_validate', String(autoValidate));
      setToastShown(true);
      setTimeout(() => setToastShown(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  const ROUTES = ['bezier', 'straight', 'step', 'smoothstep'] as const;
  const THEMES = [
    { id: 'dark' as Theme,   label: 'Dark',    preview: '#0A0A0F' },
    { id: 'darker' as Theme, label: 'Darker',  preview: '#050508' },
    { id: 'light' as Theme,  label: 'Light',   preview: '#F8F8FC' },
    { id: 'system' as Theme, label: 'System',  preview: '#1E1E2F' },
  ];

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      background: 'var(--bg)',
    }}>
      <div style={{
        maxWidth: 780, margin: '0 auto', padding: '40px 24px',
        color: 'var(--text)',
      }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif" }}>
          Configure your workspace, AI keys, and preferences
        </p>
      </div>

      {/* ── Profile ─────────────────────────────────────────────────────────── */}
      <SectionHeader title="Profile" subtitle="Your display name and email within this session" />
      <Card>
        <FormRow label="Display name" hint="Shown in your saved diagrams">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Vikram"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </FormRow>
        <FormRow label="Email" hint="Used for diagram ownership">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </FormRow>
      </Card>

      {/* ── AI Keys ─────────────────────────────────────────────────────────── */}
      <SectionHeader title="AI Configuration" subtitle="API keys for AI-assisted features. Keys are stored only in your browser." />
      <Card>
        <FormRow label="Groq API Key" hint="Primary AI — Llama 3.3 70B">
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type={showGroq ? 'text' : 'password'}
              value={groqKey}
              onChange={e => setGroqKey(e.target.value)}
              placeholder="gsk_..."
              style={{ ...inputStyle, flex: 1 }}
              onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              onClick={() => setShowGroq(s => !s)}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 12, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}
            >
              {showGroq ? 'Hide' : 'Show'}
            </button>
          </div>
          {groqKey && <div style={{ marginTop: 6, fontSize: 11.5, color: '#10B981', fontFamily: "'DM Sans', sans-serif" }}>✓ Key configured</div>}
        </FormRow>
        <FormRow label="Gemini API Key" hint="Fallback AI provider">
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type={showGem ? 'text' : 'password'}
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
              placeholder="AIza..."
              style={{ ...inputStyle, flex: 1 }}
              onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              onClick={() => setShowGem(s => !s)}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 12, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}
            >
              {showGem ? 'Hide' : 'Show'}
            </button>
          </div>
          {geminiKey && <div style={{ marginTop: 6, fontSize: 11.5, color: '#10B981', fontFamily: "'DM Sans', sans-serif" }}>✓ Key configured</div>}
        </FormRow>
        <div style={{
          marginTop: 8, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#A78BFA',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Keys are never sent to our servers — they are passed directly from your browser to the AI provider.
        </div>
      </Card>

      {/* ── Canvas Preferences ──────────────────────────────────────────────── */}
      <SectionHeader title="Canvas Preferences" subtitle="Customize how the diagram editor behaves" />
      <Card>
        <FormRow label="Edge routing" hint="How connections are drawn between nodes">
          <div style={{ display: 'flex', gap: 6 }}>
            {ROUTES.map(r => (
              <button
                key={r}
                onClick={() => setRouting(r)}
                style={{
                  background: routing === r ? '#7C3AED' : 'var(--bg)',
                  border: `1px solid ${routing === r ? '#7C3AED' : 'var(--border)'}`,
                  color: routing === r ? '#fff' : 'var(--text-dim)',
                  borderRadius: 7, padding: '6px 12px', cursor: 'pointer',
                  fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.12s',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </FormRow>
        <FormRow label="Packet animation" hint="Animate traffic packets on edges">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Toggle checked={animPkts} onChange={setAnimPkts} />
            <span style={{ fontSize: 12.5, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif" }}>
              {animPkts ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </FormRow>
        <FormRow label="Show grid" hint="Background dot grid on canvas">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Toggle checked={showGrid} onChange={setShowGrid} />
            <span style={{ fontSize: 12.5, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif" }}>
              {showGrid ? 'Visible' : 'Hidden'}
            </span>
          </div>
        </FormRow>
        <FormRow label="Minimap" hint="Overview map in the corner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Toggle checked={minimap} onChange={setMinimap} />
            <span style={{ fontSize: 12.5, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif" }}>
              {minimap ? 'Visible' : 'Hidden'}
            </span>
          </div>
        </FormRow>
        <FormRow label="Auto-validate on start" hint="Run validation gate before every simulation">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Toggle checked={autoValidate} onChange={setAutoValidate} />
            <span style={{ fontSize: 12.5, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif" }}>
              {autoValidate ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </FormRow>
      </Card>

      {/* ── Theme ───────────────────────────────────────────────────────────── */}
      <SectionHeader title="Theme" subtitle="Pick your canvas color scheme" />
      <Card style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {THEMES.map(t => (
            <div
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{
                flex: 1, border: `2px solid ${theme === t.id ? '#7C3AED' : 'var(--border)'}`,
                borderRadius: 10, padding: '12px 16px', cursor: 'pointer',
                background: 'var(--card-bg)', transition: 'all 0.15s',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 8, background: t.preview,
                margin: '0 auto 8px', border: '1px solid rgba(255,255,255,0.1)',
              }} />
              <div style={{ fontSize: 12.5, color: theme === t.id ? 'var(--text)' : 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif", fontWeight: theme === t.id ? 600 : 400 }}>
                {t.label}
              </div>
              {theme === t.id && <div style={{ fontSize: 10.5, color: '#7C3AED', fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>ACTIVE</div>}
            </div>
          ))}
        </div>
      </Card>

      {error && (
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 8,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#FCA5A5', fontSize: 13, fontFamily: "'DM Sans', sans-serif"
        }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Save ────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            background: '#7C3AED', color: 'white', border: 'none',
            borderRadius: 10, padding: '10px 28px', cursor: 'pointer',
            fontSize: 13.5, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
            transition: 'opacity 0.15s',
            opacity: saving ? 0.7 : 1,
          }}
          onMouseEnter={e => !saving && (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={e => !saving && (e.currentTarget.style.opacity = '1')}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <SaveToast show={toastShown} />
      </div>
    </div>
  );
}
