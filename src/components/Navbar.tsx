import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Save, LogOut, Loader2, CheckCircle, Play, Square } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeSwitcher } from './ThemeSwitcher';

const TABS = [
  { path: '/canvas',            label: 'System Design' },
  { path: '/security',          label: 'Security' },
  { path: '/k8s',               label: 'K8s' },
  { path: '/db-schema',         label: 'DB Schema' },
  { path: '/network',           label: 'Network' },
  { path: '/my-architectures',  label: 'My Architectures' },
  { path: '/discussion',        label: 'Discussion' },
  { path: '/settings',          label: 'Settings' },
];

const LEARN_ITEMS = [
  { path: '/learn',      label: '📚 Learning Paths' },
  { path: '/concepts',   label: '🧪 CS Concepts' },
  { path: '/interview',  label: '🎯 Interview Mode' },
];

interface NavbarProps {
  onSave?: () => Promise<void>;
  onSimulationStart?: () => void;
  simulationRunning?: boolean;
}

export function Navbar({ onSave, onSimulationStart, simulationRunning = false }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [showUserMenu,  setShowUserMenu]  = useState(false);
  const [showLearnMenu, setShowLearnMenu] = useState(false);

  const initials = user
    ? user.username.slice(0, 2).toUpperCase()
    : '?';

  const handleSave = async () => {
    if (!onSave || saving) return;
    setSaving(true);
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* caller can show its own error */ }
    finally { setSaving(false); }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <button onClick={() => navigate('/')} style={styles.logoBtn}>
        <div style={styles.logoIcon}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <span style={styles.logoText}>TechSim</span>
      </button>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map(tab => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                ...styles.tab,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--text)' : 'var(--text-dim)',
              }}
              onMouseEnter={e => !isActive && (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => !isActive && (e.currentTarget.style.color = 'var(--text-dim)')}
            >
              {tab.label}
              {isActive && <span style={styles.activeBar} />}
            </button>
          );
        })}

        {/* Learn dropdown */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}>
          {showLearnMenu && (
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 199 }}
              onClick={() => setShowLearnMenu(false)}
            />
          )}
          <button
            onClick={() => setShowLearnMenu(v => !v)}
            style={{
              ...styles.tab,
              fontWeight: LEARN_ITEMS.some(i => location.pathname.startsWith(i.path)) ? 500 : 400,
              color: LEARN_ITEMS.some(i => location.pathname.startsWith(i.path)) ? 'var(--text)' : 'var(--text-dim)',
              gap: 4,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => {
              if (!LEARN_ITEMS.some(i => location.pathname.startsWith(i.path))) {
                e.currentTarget.style.color = 'var(--text-dim)';
              }
            }}
          >
            Learn
            <span style={{ fontSize: 9, opacity: 0.7 }}>▾</span>
            {LEARN_ITEMS.some(i => location.pathname.startsWith(i.path)) && (
              <span style={styles.activeBar} />
            )}
          </button>

          {showLearnMenu && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 2px)', left: 0,
              zIndex: 200, minWidth: 180,
              background: 'var(--sidebar-bg)', border: '1px solid var(--border)',
              borderRadius: 10, padding: 5,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}>
              {LEARN_ITEMS.map(item => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setShowLearnMenu(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '8px 12px', borderRadius: 6,
                      background: isActive ? 'rgba(124,58,237,0.1)' : 'transparent',
                      border: 'none', cursor: 'pointer',
                      color: isActive ? 'var(--accent-bright)' : 'var(--text-dim)',
                      fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                      fontWeight: isActive ? 500 : 400, textAlign: 'left',
                      transition: 'background 0.1s, color 0.1s',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--card-bg)';
                        e.currentTarget.style.color = 'var(--text)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-dim)';
                      }
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div style={styles.actions}>
        <IconBtn><Bell size={15} /></IconBtn>
        <ThemeSwitcher />
        <div style={styles.divider} />

        {onSimulationStart && (
          <button
            onClick={onSimulationStart}
            style={{
              ...styles.simBtn,
              background: simulationRunning ? 'rgba(220,38,38,0.16)' : styles.simBtn.background,
              border: simulationRunning ? '1px solid rgba(248,113,113,0.45)' : styles.simBtn.border,
              color: simulationRunning ? '#FCA5A5' : styles.simBtn.color,
              boxShadow: simulationRunning ? '0 0 18px rgba(239,68,68,0.18)' : styles.simBtn.boxShadow,
            }}
          >
            {simulationRunning ? <Square size={13} /> : <Play size={13} />}
            {simulationRunning ? 'Stop Simulation' : 'Start Simulation'}
          </button>
        )}

        {/* Save button — only when onSave prop given */}
        {onSave && (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              ...styles.saveBtn,
              background: saved ? 'rgba(34,197,94,0.15)' : 'var(--accent)',
              border:     saved ? '1px solid rgba(34,197,94,0.4)' : 'none',
              color:      saved ? '#22C55E' : 'white',
              boxShadow:  saved ? 'none' : '0 0 14px var(--accent-glow)',
              opacity:    saving ? 0.7 : 1,
            }}
          >
            {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              : saved ? <CheckCircle size={13} />
              : <Save size={13} />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Progress'}
          </button>
        )}

        {/* Avatar + dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(s => !s)}
            style={styles.avatar}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            {initials}
          </button>

          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 199 }}
                onClick={() => setShowUserMenu(false)}
              />
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <div style={styles.dropdownName}>{user?.username ?? '—'}</div>
                  <div style={styles.dropdownEmail}>{user?.email ?? '—'}</div>
                  {user?.plan && (
                    <span style={styles.planBadge}>{user.plan.toUpperCase()}</span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  style={styles.logoutBtn}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      style={styles.iconBtn}
      onMouseEnter={e => {
        e.currentTarget.style.background    = 'var(--card-bg)';
        e.currentTarget.style.borderColor   = 'var(--border)';
        e.currentTarget.style.color         = 'var(--text)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background    = 'transparent';
        e.currentTarget.style.borderColor   = 'transparent';
        e.currentTarget.style.color         = 'var(--text-dim)';
      }}
    >
      {children}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    height: 48, background: 'var(--sidebar-bg)',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center',
    padding: '0 16px', flexShrink: 0, zIndex: 50,
    position: 'relative',
  },
  logoBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    marginRight: 32, background: 'none', border: 'none',
    cursor: 'pointer', padding: 0,
  },
  logoIcon: {
    width: 28, height: 28, borderRadius: 7, background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 12px var(--accent-glow)',
  },
  logoText: {
    fontSize: 15, fontWeight: 700, color: 'var(--text)',
    letterSpacing: '-0.02em', fontFamily: "'DM Sans', sans-serif",
  },
  tabs: { display: 'flex', alignItems: 'stretch', height: '100%', flex: 1 },
  tab: {
    position: 'relative', display: 'flex', alignItems: 'center',
    padding: '0 16px', background: 'none', border: 'none',
    cursor: 'pointer', fontSize: 13.5,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'color 0.15s', whiteSpace: 'nowrap',
  },
  activeBar: {
    position: 'absolute', bottom: 0, left: 16, right: 16,
    height: 2, borderRadius: '2px 2px 0 0',
    background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)',
  },
  actions: { display: 'flex', alignItems: 'center', gap: 8 },
  divider: { width: 1, height: 20, background: 'var(--border)', margin: '0 4px' },
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    height: 32, padding: '0 14px', borderRadius: 7,
    fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer', transition: 'all 0.2s',
  },
  simBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    height: 32, padding: '0 14px', borderRadius: 7,
    fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    background: 'rgba(6,182,212,0.12)',
    border: '1px solid rgba(6,182,212,0.38)',
    color: '#67E8F9',
    boxShadow: '0 0 14px rgba(6,182,212,0.12)',
    transition: 'all 0.2s',
  },
  avatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, color: 'white',
    border: '2px solid var(--border)',
    cursor: 'pointer', transition: 'border-color 0.15s',
    fontFamily: "'DM Sans', sans-serif",
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200,
    background: 'var(--sidebar-bg)', border: '1px solid var(--border)',
    borderRadius: 10, padding: 6, minWidth: 200,
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
  },
  dropdownHeader: {
    padding: '8px 10px 10px',
    borderBottom: '1px solid var(--border-dim)', marginBottom: 4,
  },
  dropdownName: {
    fontSize: 13, fontWeight: 600, color: 'var(--text)',
    fontFamily: "'DM Sans', sans-serif",
  },
  dropdownEmail: {
    fontSize: 11, color: 'var(--text-muted)',
    fontFamily: "'IBM Plex Mono', monospace", marginTop: 2,
  },
  planBadge: {
    display: 'inline-block', marginTop: 5,
    background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: 4, padding: '1px 7px',
    fontSize: 9.5, fontWeight: 700, color: 'var(--accent-bright)',
    fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.08em',
  },
  logoutBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 10px', borderRadius: 6,
    background: 'none', border: 'none',
    color: '#EF4444', fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer', fontWeight: 500, transition: 'background 0.12s',
  },
  iconBtn: {
    width: 32, height: 32, borderRadius: 7,
    background: 'transparent', border: '1px solid transparent',
    color: 'var(--text-dim)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.15s',
  },
};
