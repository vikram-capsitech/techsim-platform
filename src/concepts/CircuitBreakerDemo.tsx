import { useState, useEffect, useRef } from 'react';

type CBState = 'closed' | 'open' | 'half-open';
type ReqResult = 'success' | 'fail' | 'rejected';

const FAILURE_THRESHOLD = 5;
const RESET_DELAY_MS    = 3000;
const HALF_OPEN_SUCCESS = 2;

const STATE_COLOR: Record<CBState, string>  = { closed: '#22C55E', open: '#EF4444', 'half-open': '#F59E0B' };
const STATE_LABEL: Record<CBState, string>  = { closed: 'CLOSED', open: 'OPEN', 'half-open': 'HALF-OPEN' };
const REQ_COLOR: Record<ReqResult, string>  = { success: '#22C55E', fail: '#EF4444', rejected: '#6B7280' };

export function CircuitBreakerDemo() {
  const [cbState, setCbState]           = useState<CBState>('closed');
  const [failures, setFailures]         = useState(0);
  const [halfOpenOk, setHalfOpenOk]     = useState(0);
  const [timeline, setTimeline]         = useState<ReqResult[]>([]);
  const [lastReq, setLastReq]           = useState<string>('—');
  const [animating, setAnimating]       = useState(false);
  const cbStateRef = useRef<CBState>('closed');
  cbStateRef.current = cbState;

  // Auto-transition OPEN → HALF-OPEN after timeout
  useEffect(() => {
    if (cbState !== 'open') return;
    const t = setTimeout(() => {
      setCbState('half-open');
      setHalfOpenOk(0);
      addTimeline('rejected'); // just a visual beat
    }, RESET_DELAY_MS);
    return () => clearTimeout(t);
  }, [cbState]);

  const addTimeline = (r: ReqResult) => setTimeline(prev => [r, ...prev].slice(0, 24));

  const flash = (fn: () => void) => {
    setAnimating(true);
    setTimeout(() => { fn(); setAnimating(false); }, 180);
  };

  const sendNormal = () => {
    if (cbState === 'open') {
      setLastReq('⚡ REJECTED — circuit is open, no network call made');
      addTimeline('rejected');
      return;
    }
    flash(() => {
      setFailures(0);
      setLastReq('✓ Success — response received from Service B');
      addTimeline('success');
      if (cbState === 'half-open') {
        const next = halfOpenOk + 1;
        setHalfOpenOk(next);
        if (next >= HALF_OPEN_SUCCESS) {
          setCbState('closed');
          setLastReq('✓ Circuit CLOSED — service recovered after probe successes');
        }
      }
    });
  };

  const sendFailing = () => {
    if (cbState === 'open') {
      setLastReq('⚡ REJECTED — circuit already open');
      addTimeline('rejected');
      return;
    }
    flash(() => {
      addTimeline('fail');
      if (cbState === 'half-open') {
        setCbState('open');
        setHalfOpenOk(0);
        setLastReq('✗ Probe failed — circuit OPEN again');
        return;
      }
      const next = failures + 1;
      setFailures(next);
      setLastReq(`✗ Failure ${next}/${FAILURE_THRESHOLD} — ${next >= FAILURE_THRESHOLD ? 'TRIPPING circuit!' : 'counting failures…'}`);
      if (next >= FAILURE_THRESHOLD) {
        setCbState('open');
        setFailures(0);
      }
    });
  };

  const reset = () => {
    setCbState('closed'); setFailures(0); setHalfOpenOk(0);
    setTimeline([]); setLastReq('— Circuit reset');
  };

  const color = STATE_COLOR[cbState];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Flow diagram */}
      <svg viewBox="0 0 500 130" style={{ width: '100%', maxHeight: 130, marginBottom: 12 }}>
        {/* Service A */}
        <rect x={20} y={45} width={100} height={40} rx={8} fill="rgba(59,130,246,0.12)" stroke="#3B82F6" strokeWidth={1.5} />
        <text x={70} y={61} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--text)">Service A</text>
        <text x={70} y={74} textAnchor="middle" fontSize={8.5} fill="var(--text-dim)" fontFamily="'IBM Plex Mono', monospace">CALLER</text>

        {/* Arrow A→CB */}
        <line x1={120} y1={65} x2={160} y2={65} stroke={animating ? color : 'var(--border)'} strokeWidth={2} />
        <polygon points="160,60 170,65 160,70" fill={animating ? color : 'var(--border)'} />

        {/* Circuit Breaker */}
        <rect x={170} y={35} width={160} height={60} rx={10}
          fill={`${color}14`} stroke={color} strokeWidth={animating ? 3 : 2}
          style={{ filter: animating ? `drop-shadow(0 0 8px ${color}80)` : 'none', transition: 'all 0.15s' }}
        />
        <text x={250} y={58} textAnchor="middle" fontSize={11} fontWeight={800} fill={color}>
          {STATE_LABEL[cbState]}
        </text>
        <text x={250} y={74} textAnchor="middle" fontSize={9} fill="var(--text-dim)" fontFamily="'IBM Plex Mono', monospace">
          {cbState === 'closed' ? `failures: ${failures}/${FAILURE_THRESHOLD}` :
           cbState === 'open' ? 'waiting for reset timeout…' :
           `probe ok: ${halfOpenOk}/${HALF_OPEN_SUCCESS}`}
        </text>
        <text x={250} y={89} textAnchor="middle" fontSize={8.5} fill={color} fontFamily="'IBM Plex Mono', monospace">
          Circuit Breaker
        </text>

        {/* Arrow CB→B (greyed when open) */}
        <line x1={330} y1={65} x2={368} y2={65}
          stroke={cbState === 'open' ? '#374151' : (animating ? color : 'var(--border)')}
          strokeWidth={2} strokeDasharray={cbState === 'open' ? '4 3' : 'none'} />
        <polygon points="368,60 378,65 368,70"
          fill={cbState === 'open' ? '#374151' : (animating ? color : 'var(--border)')} />

        {/* Service B */}
        <rect x={378} y={45} width={100} height={40} rx={8}
          fill={cbState === 'open' ? 'rgba(107,114,128,0.08)' : 'rgba(34,197,94,0.1)'}
          stroke={cbState === 'open' ? '#374151' : '#22C55E'} strokeWidth={1.5} />
        <text x={428} y={61} textAnchor="middle" fontSize={10} fontWeight={700}
          fill={cbState === 'open' ? '#6B7280' : 'var(--text)'}>Service B</text>
        <text x={428} y={74} textAnchor="middle" fontSize={8.5}
          fill={cbState === 'open' ? '#4B5563' : 'var(--text-dim)'}
          fontFamily="'IBM Plex Mono', monospace">
          {cbState === 'open' ? 'BLOCKED' : 'UPSTREAM'}
        </text>
      </svg>

      {/* Last request info */}
      <div style={{
        padding: '8px 14px', borderRadius: 7, marginBottom: 12,
        background: 'var(--bg)', border: '1px solid var(--border)',
        fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
        color: 'var(--text-dim)', minHeight: 32,
      }}>{lastReq}</div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={sendNormal} style={{
          padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
          fontSize: 12.5, fontWeight: 600, background: '#22C55E', color: 'white',
        }}>Send Normal</button>
        <button onClick={sendFailing} style={{
          padding: '6px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#EF4444',
        }}>Send Failing</button>
        <div style={{ flex: 1 }} />
        <button onClick={reset} style={{
          padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
          background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
        }}>Reset</button>
      </div>

      {/* Timeline */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 7, letterSpacing: '0.06em' }}>
          REQUEST TIMELINE (newest → oldest)
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {timeline.length === 0 && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>no requests yet</span>
          )}
          {timeline.map((r, i) => (
            <div key={i} title={r} style={{
              width: 14, height: 14, borderRadius: 3,
              background: REQ_COLOR[r],
              opacity: Math.max(0.25, 1 - i * 0.035),
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
          {(['success', 'fail', 'rejected'] as ReqResult[]).map(r => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: REQ_COLOR[r] }} />
              {r}
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
            {cbState === 'open' ? `auto → half-open in ~${RESET_DELAY_MS / 1000}s` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
