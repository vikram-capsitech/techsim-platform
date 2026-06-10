import { useState, useEffect } from 'react';

type Mode = 'success' | 'failure';
type CoordMode = 'choreography' | 'orchestration';

interface Step {
  title: string;
  desc: string;
  active: string[];
  compensating?: string[];
  isFailure?: boolean;
}

function buildSteps(mode: Mode, coord: CoordMode): Step[] {
  const prefix = coord === 'orchestration' ? '(via Orchestrator) ' : '';
  const forward: Step[] = [
    {
      title: 'Step 1: Create Order',
      desc: `${prefix}OrderService creates a local order transaction and publishes OrderCreated event.`,
      active: ['order'],
    },
    {
      title: 'Step 2: Process Payment',
      desc: `${prefix}PaymentService receives OrderCreated, charges the payment method, publishes PaymentCompleted.`,
      active: ['order', 'payment'],
    },
    {
      title: 'Step 3: Reserve Inventory',
      desc: mode === 'success'
        ? `${prefix}InventoryService receives PaymentCompleted, reserves stock, publishes InventoryReserved.`
        : `${prefix}InventoryService receives PaymentCompleted but stock is INSUFFICIENT — publishes InventoryFailed.`,
      active: ['order', 'payment', 'inventory'],
      isFailure: mode === 'failure',
    },
  ];

  if (mode === 'success') {
    return [
      ...forward,
      {
        title: 'Step 4: Schedule Shipping',
        desc: `${prefix}ShippingService schedules delivery. Publishes ShippingScheduled.`,
        active: ['order', 'payment', 'inventory', 'shipping'],
      },
      {
        title: 'Saga Completed',
        desc: 'All local transactions committed successfully. The distributed operation is complete.',
        active: ['order', 'payment', 'inventory', 'shipping'],
      },
    ];
  }

  return [
    ...forward,
    {
      title: 'Compensating: Refund Payment',
      desc: 'InventoryFailed triggers compensation. PaymentService issues refund (compensating transaction).',
      active: ['order', 'payment'],
      compensating: ['payment'],
    },
    {
      title: 'Compensating: Cancel Order',
      desc: 'OrderService receives refund confirmation and cancels the order (compensating transaction).',
      active: ['order'],
      compensating: ['order', 'payment'],
    },
    {
      title: 'Saga Rolled Back',
      desc: 'All compensating transactions completed. The distributed operation is safely undone. Note: compensating ≠ true rollback — the email notification cannot be "unsent" (pivot transaction).',
      active: [],
      compensating: ['order', 'payment', 'inventory'],
    },
  ];
}

const SERVICES = ['order', 'payment', 'inventory', 'shipping'];
const SERVICE_LABELS: Record<string, string> = {
  order: 'Order\nService',
  payment: 'Payment\nService',
  inventory: 'Inventory\nService',
  shipping: 'Shipping\nService',
};
const SERVICE_COLORS: Record<string, string> = {
  order: '#3B82F6',
  payment: '#22C55E',
  inventory: '#F59E0B',
  shipping: '#8B5CF6',
};

export function SagaAnimation() {
  const [mode, setMode]           = useState<Mode>('success');
  const [coord, setCoord]         = useState<CoordMode>('choreography');
  const [step, setStep]           = useState(0);
  const [autoPlay, setAutoPlay]   = useState(false);

  const steps = buildSteps(mode, coord);
  const cur = steps[step];

  useEffect(() => { setStep(0); }, [mode, coord]);

  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(() => {
      setStep(s => {
        if (s + 1 >= steps.length) { setAutoPlay(false); return s; }
        return s + 1;
      });
    }, 1700);
    return () => clearInterval(t);
  }, [autoPlay, steps.length]);

  const W = 460, H = 200;
  const serviceX = (i: number) => 40 + i * 130;
  const laneY = 90;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Mode + Coord toggles */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {([['success', 'Happy Path'], ['failure', 'Failure + Compensation']] as [Mode, string][]).map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '4px 13px', borderRadius: 6, cursor: 'pointer', fontSize: 11.5,
            fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
            background: mode === m ? (m === 'success' ? '#22C55E' : '#EF4444') : 'var(--card-bg)',
            color: mode === m ? 'white' : 'var(--text-dim)',
            border: `1px solid ${mode === m ? 'transparent' : 'var(--border)'}`,
          }}>{label}</button>
        ))}
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        {([['choreography', 'Choreography'], ['orchestration', 'Orchestration']] as [CoordMode, string][]).map(([c, label]) => (
          <button key={c} onClick={() => setCoord(c)} style={{
            padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11,
            fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
            background: coord === c ? 'rgba(124,58,237,0.2)' : 'var(--card-bg)',
            color: coord === c ? '#A78BFA' : 'var(--text-muted)',
            border: `1px solid ${coord === c ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
          }}>{label}</button>
        ))}
      </div>

      {/* SVG sequence diagram */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxHeight: H }}>
        {/* Orchestrator bar (if orchestration mode) */}
        {coord === 'orchestration' && (
          <>
            <rect x={160} y={10} width={120} height={26} rx={7} fill="rgba(124,58,237,0.15)" stroke="#7C3AED" strokeWidth={1.5} />
            <text x={220} y={24} textAnchor="middle" fontSize={9} fontWeight={700} fill="#A78BFA">Orchestrator (Saga)</text>
          </>
        )}

        {/* Service nodes */}
        {SERVICES.map((svc, i) => {
          const x = serviceX(i);
          const isActive = cur.active.includes(svc);
          const isComp   = cur.compensating?.includes(svc) ?? false;
          const isFail   = svc === 'inventory' && cur.isFailure;
          const color = isFail ? '#EF4444' : isComp ? '#F59E0B' : SERVICE_COLORS[svc];
          return (
            <g key={svc}>
              {/* Lifeline */}
              <line x1={x} y1={55} x2={x} y2={H - 20} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 3" />
              {/* Node */}
              <rect x={x - 36} y={laneY - 52} width={72} height={40} rx={8}
                fill={`${color}18`} stroke={color}
                strokeWidth={isActive ? 2.5 : 1.5}
                style={{ filter: isActive ? `drop-shadow(0 0 8px ${color}50)` : 'none', transition: 'all 0.2s' }}
              />
              <text x={x} y={laneY - 37} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={isActive ? 'var(--text)' : 'var(--text-muted)'}>
                {SERVICE_LABELS[svc].split('\n')[0]}
              </text>
              <text x={x} y={laneY - 25} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={isActive ? 'var(--text)' : 'var(--text-muted)'}>
                {SERVICE_LABELS[svc].split('\n')[1]}
              </text>
              {/* Status badge */}
              <text x={x} y={laneY - 12} textAnchor="middle" fontSize={7.5} fill={color} fontFamily="'IBM Plex Mono', monospace">
                {isFail ? 'FAILED' : isComp ? 'COMPENSATE' : isActive ? 'ACTIVE' : ''}
              </text>

              {/* Event arrow to next service */}
              {i < 3 && isActive && (cur.active.includes(SERVICES[i + 1]) || (cur.compensating?.includes(SERVICES[i]) && !cur.compensating?.includes(SERVICES[i + 1]))) && (
                <g>
                  {/* Forward arrow */}
                  {cur.active.includes(SERVICES[i + 1]) && !cur.compensating?.includes(svc) && (
                    <>
                      <line x1={x + 36} y1={laneY + 10} x2={serviceX(i + 1) - 36} y2={laneY + 10} stroke={color} strokeWidth={1.5} />
                      <polygon points={`${serviceX(i+1)-36},${laneY+6} ${serviceX(i+1)-29},${laneY+10} ${serviceX(i+1)-36},${laneY+14}`} fill={color} />
                    </>
                  )}
                </g>
              )}
              {/* Compensating arrow (rightward participant notified, going back left) */}
              {isComp && i > 0 && cur.compensating?.includes(SERVICES[i - 1]) && (
                <>
                  <line x1={x - 36} y1={laneY + 25} x2={serviceX(i - 1) + 36} y2={laneY + 25} stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 2" />
                  <polygon points={`${serviceX(i-1)+36},${laneY+21} ${serviceX(i-1)+29},${laneY+25} ${serviceX(i-1)+36},${laneY+29}`} fill="#F59E0B" />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Step info */}
      <div style={{ background: 'var(--bg)', borderRadius: 8, border: `1px solid ${cur.isFailure ? 'rgba(239,68,68,0.3)' : cur.compensating ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`, padding: '12px 14px', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: cur.isFailure ? '#EF4444' : cur.compensating ? '#F59E0B' : 'var(--text)', marginBottom: 5 }}>{cur.title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>{cur.desc}</div>
      </div>

      {/* Dots + controls */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {steps.map((_, i) => (
          <div key={i} onClick={() => setStep(i)} style={{
            width: 8, height: 8, borderRadius: '50%', cursor: 'pointer',
            background: i === step ? 'var(--accent)' : i < step ? 'var(--accent)' : 'var(--border)',
            opacity: i === step ? 1 : i < step ? 0.5 : 0.3,
          }} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={navBtn}>← Prev</button>
        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1} style={navBtn}>Next →</button>
        <button onClick={() => { setStep(0); setAutoPlay(true); }} style={autoBtn}>▶ Auto-play</button>
        <button onClick={() => { setStep(0); setAutoPlay(false); }} style={resetBtn}>↺ Reset</button>
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = { padding: '6px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text-dim)' };
const autoBtn: React.CSSProperties = { padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, background: 'var(--accent)', color: 'white' };
const resetBtn: React.CSSProperties = { padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12.5, fontWeight: 500, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)' };
