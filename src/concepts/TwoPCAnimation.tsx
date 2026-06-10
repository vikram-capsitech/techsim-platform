import { useState, useEffect, useRef } from 'react';

type Scenario = 'normal' | 'coordinator-crash' | 'participant-vote-no';

interface Step {
  title: string;
  desc: string;
  arrows: { from: string; to: string; label: string; color: string }[];
  highlight: string[];
}

const NORMAL_STEPS: Step[] = [
  {
    title: 'Phase 1: Coordinator sends PREPARE',
    desc: 'The coordinator sends a PREPARE message to all participants. Each participant must decide if it can commit.',
    arrows: [
      { from: 'coord', to: 'p1', label: 'PREPARE', color: '#7C3AED' },
      { from: 'coord', to: 'p2', label: 'PREPARE', color: '#7C3AED' },
    ],
    highlight: ['coord'],
  },
  {
    title: 'Phase 1: Participants vote YES',
    desc: 'Both participants validate constraints, acquire locks, write to redo log, and reply YES.',
    arrows: [
      { from: 'p1', to: 'coord', label: 'VOTE-YES', color: '#22C55E' },
      { from: 'p2', to: 'coord', label: 'VOTE-YES', color: '#22C55E' },
    ],
    highlight: ['p1', 'p2'],
  },
  {
    title: 'Phase 2: Coordinator sends COMMIT',
    desc: 'All votes are YES — coordinator writes commit to its own log and sends COMMIT to all participants.',
    arrows: [
      { from: 'coord', to: 'p1', label: 'COMMIT', color: '#22C55E' },
      { from: 'coord', to: 'p2', label: 'COMMIT', color: '#22C55E' },
    ],
    highlight: ['coord'],
  },
  {
    title: 'Phase 2: Participants execute and ACK',
    desc: 'Participants commit the transaction, release locks, and send ACK back to the coordinator.',
    arrows: [
      { from: 'p1', to: 'coord', label: 'ACK', color: '#06B6D4' },
      { from: 'p2', to: 'coord', label: 'ACK', color: '#06B6D4' },
    ],
    highlight: ['p1', 'p2'],
  },
  {
    title: 'Transaction Committed',
    desc: 'All participants have committed. Coordinator receives all ACKs and the distributed transaction is complete.',
    arrows: [],
    highlight: ['coord', 'p1', 'p2'],
  },
];

const CRASH_STEPS: Step[] = [
  {
    title: 'Phase 1: PREPARE sent',
    desc: 'Coordinator sends PREPARE. Both participants vote YES and are now in an uncertain state.',
    arrows: [
      { from: 'coord', to: 'p1', label: 'PREPARE', color: '#7C3AED' },
      { from: 'coord', to: 'p2', label: 'PREPARE', color: '#7C3AED' },
    ],
    highlight: ['coord'],
  },
  {
    title: 'Coordinator CRASHES',
    desc: '⚡ Coordinator crashes after receiving votes but before sending COMMIT or ABORT. Both participants are now BLOCKED — they voted YES but cannot unilaterally commit or abort.',
    arrows: [],
    highlight: [],
  },
  {
    title: 'Participants BLOCKED',
    desc: 'P1 and P2 hold resource locks indefinitely, waiting for a COMMIT or ABORT that never arrives. This is the fundamental blocking problem of 2PC.',
    arrows: [],
    highlight: ['p1', 'p2'],
  },
  {
    title: 'Recovery needed',
    desc: 'Requires coordinator to recover from its redo log, OR participants to contact each other to determine the outcome. If no participant knows the result, the transaction is stuck until coordinator recovers.',
    arrows: [],
    highlight: [],
  },
];

const NODES: Record<string, [number, number]> = {
  coord: [200, 60],
  p1:    [80, 170],
  p2:    [320, 170],
};

const NODE_LABELS: Record<string, string> = { coord: 'Coordinator', p1: 'Participant 1', p2: 'Participant 2' };

export function TwoPCAnimation() {
  const [scenario, setScenario]   = useState<Scenario>('normal');
  const [step, setStep]           = useState(0);
  const [autoPlay, setAutoPlay]   = useState(false);
  const autoRef = useRef(autoPlay);
  autoRef.current = autoPlay;

  const steps = scenario === 'normal' ? NORMAL_STEPS : CRASH_STEPS;
  const cur = steps[step];

  useEffect(() => {
    setStep(0);
  }, [scenario]);

  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(() => {
      setStep(s => {
        const next = s + 1;
        if (next >= steps.length) { setAutoPlay(false); return s; }
        return next;
      });
    }, 1800);
    return () => clearInterval(t);
  }, [autoPlay, steps.length]);

  const coordCrashed = scenario === 'coordinator-crash' && step >= 1;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[
          { id: 'normal' as Scenario, label: 'Normal Flow' },
          { id: 'coordinator-crash' as Scenario, label: 'Coordinator Crash' },
        ].map(s => (
          <button key={s.id} onClick={() => setScenario(s.id)} style={{
            padding: '4px 13px', borderRadius: 6, cursor: 'pointer', fontSize: 11.5,
            fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
            background: scenario === s.id ? 'var(--accent)' : 'var(--card-bg)',
            color: scenario === s.id ? 'white' : 'var(--text-dim)',
            border: `1px solid ${scenario === s.id ? 'transparent' : 'var(--border)'}`,
          }}>{s.label}</button>
        ))}
      </div>

      {/* SVG */}
      <svg viewBox="0 0 400 230" style={{ width: '100%', maxHeight: 230 }}>
        {/* Arrows for current step */}
        {cur.arrows.map((ar, i) => {
          const [x1, y1] = NODES[ar.from];
          const [x2, y2] = NODES[ar.to];
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 14;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ar.color} strokeWidth={2}>
                <animate attributeName="stroke-dasharray" from="0,300" to="300,0" dur="0.5s" fill="freeze" />
              </line>
              <text x={mx} y={my} textAnchor="middle" fontSize={9} fill={ar.color} fontFamily="'IBM Plex Mono', monospace" fontWeight={700}>{ar.label}</text>
            </g>
          );
        })}

        {/* Nodes */}
        {Object.entries(NODES).map(([id, [cx, cy]]) => {
          const isHighlighted = cur.highlight.includes(id);
          const isCrashed = id === 'coord' && coordCrashed;
          const isBlocked = scenario === 'coordinator-crash' && step >= 2 && (id === 'p1' || id === 'p2');
          const color = isCrashed ? '#EF4444' : isBlocked ? '#F59E0B' : isHighlighted ? '#7C3AED' : '#3B82F6';
          return (
            <g key={id}>
              <circle cx={cx} cy={cy} r={34}
                fill={`${color}15`} stroke={color}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                style={{ filter: isHighlighted && !isCrashed ? `drop-shadow(0 0 10px ${color}60)` : 'none' }}
              />
              {isCrashed && (
                <text x={cx} y={cy - 38} textAnchor="middle" fontSize={16}>⚡</text>
              )}
              <text x={cx} y={cy - 3} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={isCrashed ? '#EF4444' : 'var(--text)'}>
                {NODE_LABELS[id]}
              </text>
              <text x={cx} y={cy + 10} textAnchor="middle" fontSize={8.5} fill={color} fontFamily="'IBM Plex Mono', monospace">
                {isCrashed ? 'CRASHED' : isBlocked ? 'BLOCKED' : id === 'coord' ? 'COORDINATOR' : 'DB'}
              </text>
            </g>
          );
        })}

        {/* Step counter */}
        <text x={200} y={222} textAnchor="middle" fontSize={9} fill="var(--text-muted)" fontFamily="'IBM Plex Mono', monospace">
          Step {step + 1} / {steps.length}
        </text>
      </svg>

      {/* Step info */}
      <div style={{ background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', padding: '12px 14px', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 5 }}>{cur.title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>{cur.desc}</div>
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {steps.map((_, i) => (
          <div key={i} onClick={() => setStep(i)} style={{
            width: 8, height: 8, borderRadius: '50%', cursor: 'pointer',
            background: i === step ? 'var(--accent)' : i < step ? 'var(--accent)' : 'var(--border)',
            opacity: i === step ? 1 : i < step ? 0.5 : 0.3,
          }} />
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={navBtn}>← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1} style={navBtn}>Next →</button>
        <button onClick={() => { setStep(0); setAutoPlay(true); }} style={autoBtn}>▶ Auto-play</button>
        <button onClick={() => { setStep(0); setAutoPlay(false); }} style={resetBtn}>↺ Reset</button>
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  padding: '6px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
  background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text-dim)',
};
const autoBtn: React.CSSProperties = {
  padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
  fontSize: 12.5, fontWeight: 600, background: 'var(--accent)', color: 'white',
};
const resetBtn: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12.5, fontWeight: 500,
  background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
};
