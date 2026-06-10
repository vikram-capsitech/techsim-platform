import { useState, useEffect, useRef } from 'react';

// ── Token Bucket ─────────────────────────────────────────────────────────────
function TokenBucket() {
  const [tokens, setTokens]     = useState(10);
  const [allowed, setAllowed]   = useState(0);
  const [rejected, setRejected] = useState(0);
  const MAX = 10, REFILL = 2; // 2 tokens/sec

  useEffect(() => {
    const id = setInterval(() => setTokens(t => Math.min(MAX, t + REFILL / 10)), 100);
    return () => clearInterval(id);
  }, []);

  const send = (n = 1) => {
    setTokens(prev => {
      if (prev >= n) { setAllowed(a => a + n); return prev - n; }
      const ok = Math.floor(prev); const bad = n - ok;
      setAllowed(a => a + ok); setRejected(r => r + bad);
      return 0;
    });
  };

  const fill = Math.round(tokens) / MAX;

  return (
    <div style={{ flex: 1, minWidth: 140, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', padding: '14px 12px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-bright)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 10, letterSpacing: '0.05em' }}>TOKEN BUCKET</div>

      {/* Bucket SVG */}
      <svg viewBox="0 0 80 100" style={{ width: 80, display: 'block', margin: '0 auto 10px' }}>
        <rect x={10} y={10} width={60} height={80} rx={6} fill="var(--card-bg)" stroke="var(--border)" strokeWidth={2} />
        <rect x={12} y={12 + 76 * (1 - fill)} width={56} height={76 * fill} rx={4}
          fill={fill > 0.5 ? '#22C55E' : fill > 0.2 ? '#F59E0B' : '#EF4444'}
          style={{ transition: 'all 0.1s' }}
        />
        <text x={40} y={54} textAnchor="middle" fontSize={13} fontWeight={700} fill="white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          {Math.round(tokens)}
        </text>
        <text x={40} y={69} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.7)" fontFamily="'IBM Plex Mono', monospace">
          tokens
        </text>
        {/* Drip */}
        <line x1={40} y1={90} x2={40} y2={105} stroke="rgba(34,197,94,0.5)" strokeWidth={2} />
      </svg>

      <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", textAlign: 'center', marginBottom: 10 }}>
        refill: {REFILL} /sec · cap: {MAX}
      </div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
        <button onClick={() => send(1)} style={btnStyle('#22C55E')}>Send 1</button>
        <button onClick={() => send(5)} style={btnStyle('#F59E0B')}>Burst 5</button>
      </div>
      <Counters allowed={allowed} rejected={rejected} />
    </div>
  );
}

// ── Leaky Bucket ─────────────────────────────────────────────────────────────
function LeakyBucket() {
  const [queue, setQueue]       = useState(0);
  const [allowed, setAllowed]   = useState(0);
  const [rejected, setRejected] = useState(0);
  const MAX_Q = 5, DRAIN = 1; // 1/sec

  useEffect(() => {
    const id = setInterval(() => {
      setQueue(q => {
        if (q > 0) { setAllowed(a => a + 1); return q - 1; }
        return 0;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const send = (n = 1) => {
    setQueue(prev => {
      const space = MAX_Q - prev;
      const ok = Math.min(n, space);
      const bad = n - ok;
      if (bad > 0) setRejected(r => r + bad);
      return prev + ok;
    });
  };

  return (
    <div style={{ flex: 1, minWidth: 140, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', padding: '14px 12px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#06B6D4', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 10, letterSpacing: '0.05em' }}>LEAKY BUCKET</div>

      {/* Bucket with queue items */}
      <svg viewBox="0 0 80 110" style={{ width: 80, display: 'block', margin: '0 auto 10px' }}>
        <rect x={10} y={10} width={60} height={80} rx={6} fill="var(--card-bg)" stroke="var(--border)" strokeWidth={2} />
        {/* Queue items */}
        {Array.from({ length: queue }).map((_, i) => (
          <rect key={i} x={14} y={80 - (i + 1) * 14} width={52} height={11} rx={3}
            fill="rgba(6,182,212,0.25)" stroke="#06B6D4" strokeWidth={1} />
        ))}
        <text x={40} y={54} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--text)">{queue}/{MAX_Q}</text>
        {/* Drip hole */}
        <rect x={35} y={90} width={10} height={5} rx={2} fill="var(--border)" />
        {/* Drip */}
        <circle cx={40} cy={103} r={3} fill="#06B6D4" opacity={0.6} />
      </svg>

      <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", textAlign: 'center', marginBottom: 10 }}>
        drain: {DRAIN} /sec · cap: {MAX_Q}
      </div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
        <button onClick={() => send(1)} style={btnStyle('#06B6D4')}>Send 1</button>
        <button onClick={() => send(5)} style={btnStyle('#F59E0B')}>Burst 5</button>
      </div>
      <Counters allowed={allowed} rejected={rejected} />
    </div>
  );
}

// ── Sliding Window ────────────────────────────────────────────────────────────
function SlidingWindow() {
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [allowed, setAllowed]       = useState(0);
  const [rejected, setRejected]     = useState(0);
  const WINDOW = 5000, MAX_REQ = 5;
  const tsRef = useRef<number[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setTimestamps(prev => {
        const next = prev.filter(t => now - t < WINDOW);
        tsRef.current = next;
        return next;
      });
    }, 200);
    return () => clearInterval(id);
  }, []);

  const send = (n = 1) => {
    const now = Date.now();
    setTimestamps(prev => {
      const active = prev.filter(t => now - t < WINDOW);
      const space = MAX_REQ - active.length;
      const ok = Math.min(n, space); const bad = n - ok;
      if (bad > 0) setRejected(r => r + bad);
      setAllowed(a => a + ok);
      const next = [...active, ...Array(ok).fill(now)];
      tsRef.current = next;
      return next;
    });
  };

  const now = Date.now();
  const active = timestamps.filter(t => now - t < WINDOW);

  return (
    <div style={{ flex: 1, minWidth: 140, background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', padding: '14px 12px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#8B5CF6', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 10, letterSpacing: '0.05em' }}>SLIDING WINDOW</div>

      {/* Window bar */}
      <div style={{ height: 28, background: 'var(--card-bg)', borderRadius: 6, border: '1px solid var(--border)', position: 'relative', marginBottom: 10, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
          {active.length}/{MAX_REQ} in 5s window
        </div>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${(active.length / MAX_REQ) * 100}%`,
          background: active.length >= MAX_REQ ? 'rgba(239,68,68,0.2)' : 'rgba(139,92,246,0.2)',
          transition: 'width 0.15s',
        }} />
      </div>

      {/* Request dots in window */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', minHeight: 48, marginBottom: 10 }}>
        {active.map((t, i) => (
          <div key={i} style={{
            width: 16, height: 16, borderRadius: '50%',
            background: '#8B5CF6', opacity: 0.3 + ((now - t) / WINDOW) * 0.7,
            fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }} />
        ))}
        {active.length === 0 && <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>window empty</span>}
      </div>

      <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 10 }}>
        max: {MAX_REQ} req / {WINDOW / 1000}s window
      </div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
        <button onClick={() => send(1)} style={btnStyle('#8B5CF6')}>Send 1</button>
        <button onClick={() => send(5)} style={btnStyle('#F59E0B')}>Burst 5</button>
      </div>
      <Counters allowed={allowed} rejected={rejected} />
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
function Counters({ allowed, rejected }: { allowed: number; rejected: number }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <div style={{ flex: 1, textAlign: 'center', padding: '5px 4px', borderRadius: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#22C55E' }}>{allowed}</div>
        <div style={{ fontSize: 9, color: '#22C55E', fontFamily: "'IBM Plex Mono', monospace" }}>allowed</div>
      </div>
      <div style={{ flex: 1, textAlign: 'center', padding: '5px 4px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#EF4444' }}>{rejected}</div>
        <div style={{ fontSize: 9, color: '#EF4444', fontFamily: "'IBM Plex Mono', monospace" }}>rejected</div>
      </div>
    </div>
  );
}

function btnStyle(color: string): React.CSSProperties {
  return {
    flex: 1, padding: '5px 4px', borderRadius: 5, border: `1px solid ${color}40`,
    fontSize: 11, fontWeight: 600, cursor: 'pointer',
    background: `${color}15`, color,
  };
}

// ── Main export ────────────────────────────────────────────────────────────────
export function RateLimitingDemo() {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 14 }}>
        Three algorithms side-by-side. Each has independent state. Burst 5 to see throttling.
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <TokenBucket />
        <LeakyBucket />
        <SlidingWindow />
      </div>
    </div>
  );
}
