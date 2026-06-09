import { useTheme, type Theme } from '../context/ThemeContext';

const OPTIONS: { value: Theme; icon: string; label: string }[] = [
  { value: 'dark',   icon: '🌙', label: 'Dark'   },
  { value: 'darker', icon: '🌑', label: 'Darker' },
  { value: 'light',  icon: '☀️', label: 'Light'  },
  { value: 'system', icon: '🖥️', label: 'System' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 3,
      }}
    >
      {OPTIONS.map(opt => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            title={`${opt.label} mode`}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: 'none',
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? 'white' : 'var(--text-dim)',
              cursor: 'pointer',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
              boxShadow: active ? '0 0 8px var(--accent-glow)' : 'none',
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.background = 'var(--card-hover)';
                e.currentTarget.style.color = 'var(--text)';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-dim)';
              }
            }}
          >
            {opt.icon}
          </button>
        );
      })}
    </div>
  );
}
