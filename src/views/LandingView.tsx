import { useNavigate } from 'react-router-dom';

const BG_NODES = [
  { top: '14%', left: '6%',   width: 140, height: 56, delay: '0s' },
  { top: '28%', left: '3%',   width: 110, height: 48, delay: '1.2s' },
  { top: '55%', left: '8%',   width: 130, height: 52, delay: '0.6s' },
  { top: '72%', left: '4%',   width: 100, height: 44, delay: '1.8s' },
  { top: '12%', right: '5%',  width: 150, height: 56, delay: '0.9s' },
  { top: '38%', right: '3%',  width: 120, height: 50, delay: '0.3s' },
  { top: '62%', right: '7%',  width: 135, height: 54, delay: '1.5s' },
  { top: '80%', right: '4%',  width: 110, height: 46, delay: '2.1s' },
];

const TRUST_BADGES = [
  { icon: '🛡', label: 'ISO 27001 READY' },
  { icon: '⚡', label: '10MS LATENCY' },
  { icon: '☸', label: 'K8S NATIVE' },
  { icon: '🔗', label: 'REAL TOPOLOGY' },
];

export function LandingView() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      {/* Radial glow behind hero */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 400,
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Background ghost nodes */}
      {BG_NODES.map((n, i) => (
        <div
          key={i}
          className="landing-bg-node"
          style={{
            top: n.top,
            left: 'left' in n ? n.left : undefined,
            right: 'right' in n ? (n as { right: string }).right : undefined,
            width: n.width,
            height: n.height,
            animationDelay: n.delay,
            animationDuration: `${3 + i * 0.4}s`,
          }}
        />
      ))}

      {/* Dot-grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, #252535 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.5,
          zIndex: 0,
        }}
      />

      {/* Hero content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 720,
          padding: '0 24px',
          animation: 'fadeUp 0.6s ease forwards',
        }}
      >
        {/* Beta pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 20,
            padding: '5px 14px',
            marginBottom: 28,
          }}
        >
          <span
            style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: 'var(--accent-bright)',
              boxShadow: '0 0 8px var(--accent-glow)',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600,
              color: 'var(--accent-bright)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Platform Beta 2.0 Now Live
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.02,
            color: 'var(--text)',
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 20,
          }}
        >
          Build. Attack.{' '}
          <span
            style={{
              color: 'var(--accent-bright)',
              textShadow: '0 0 40px var(--accent-glow)',
            }}
          >
            Learn.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: 'var(--text-dim)',
            fontFamily: "'DM Sans', sans-serif",
            maxWidth: 560,
            marginBottom: 36,
          }}
        >
          The only IT platform where you can design complex systems, simulate
          high-volume traffic, and launch real-world exploits — all within a
          high-performance browser environment.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 52 }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 28px',
              borderRadius: 10,
              background: 'var(--accent)',
              border: 'none',
              color: 'white',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
              boxShadow: '0 0 24px var(--accent-glow)',
              transition: 'all 0.18s',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-bright)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 32px var(--accent-glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 24px var(--accent-glow)';
            }}
          >
            Start Building Free
            <span style={{ fontSize: 18 }}>→</span>
          </button>

          <button
            onClick={() => navigate('/security')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 28px',
              borderRadius: 10,
              background: 'transparent',
              border: '1px solid var(--border-bright)',
              color: 'var(--text)',
              fontSize: 15,
              fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
              transition: 'all 0.18s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--card-bg)';
              e.currentTarget.style.borderColor = 'var(--accent-bright)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-bright)';
            }}
          >
            <span
              style={{
                width: 20, height: 20,
                borderRadius: '50%',
                border: '1.5px solid var(--text-dim)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
              }}
            >
              ▶
            </span>
            Watch Demo
          </button>
        </div>

        {/* Trust badges */}
        <div
          style={{
            display: 'flex',
            gap: 28,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {TRUST_BADGES.map((b) => (
            <div
              key={b.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <span style={{ fontSize: 14, opacity: 0.7 }}>{b.icon}</span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          opacity: 0.4,
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
          }}
        >
          Explore Lab
        </span>
        <div
          style={{
            width: 1,
            height: 32,
            background: 'linear-gradient(to bottom, var(--text-dim), transparent)',
          }}
        />
      </div>
    </div>
  );
}
