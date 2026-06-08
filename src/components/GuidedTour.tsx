import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'techsim_tour_completed';

const STEPS = [
  {
    title: 'Welcome to TechSim',
    body: 'Design and simulate distributed architectures in real time. This quick tour covers the essentials — takes under a minute.',
    target: 'canvas-center',
    position: 'center' as const,
  },
  {
    title: 'Drag Components',
    body: 'Open the sidebar on the left. Switch between the Components and Chaos tabs, then drag any node onto the canvas.',
    target: 'sidebar',
    position: 'right' as const,
  },
  {
    title: 'Connect Nodes',
    body: 'Hover over a node to reveal its edge handles. Drag from one handle to another to create a connection.',
    target: 'canvas-center',
    position: 'center' as const,
  },
  {
    title: 'Node Settings',
    body: 'Click the ⚙ icon on any node to open the Settings Panel on the right. Configure replicas, RPS capacity, latency overrides and more.',
    target: 'canvas-center',
    position: 'center' as const,
  },
  {
    title: 'Run a Simulation',
    body: 'Hit the green RUN button in the bottom bar to start the simulation. Live CPU bars, latency and packet animations will appear.',
    target: 'bottom-bar',
    position: 'top' as const,
  },
  {
    title: 'Inject Chaos',
    body: 'While the simulation is running, select a node or edge, then use the Chaos buttons in the bottom bar to crash nodes, spike latency, or flood traffic.',
    target: 'bottom-bar',
    position: 'top' as const,
  },
  {
    title: 'Validation & Presets',
    body: 'Click ISSUES to view architecture problems. Use the ⊞ Presets button to load a full reference architecture instantly.',
    target: 'canvas-center',
    position: 'center' as const,
  },
];

interface TourTooltipProps {
  step: number;
  total: number;
  title: string;
  body: string;
  position: 'center' | 'right' | 'top';
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

function TourTooltip({ step, total, title, body, position, onNext, onBack, onSkip }: TourTooltipProps) {
  const isLast = step === total - 1;

  const baseStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 200,
    width: 320,
    background: 'var(--panel-bg)',
    border: '1px solid var(--border-bright)',
    borderRadius: 12,
    padding: '18px 18px 14px',
    boxShadow: '0 16px 60px rgba(0,0,0,0.75), 0 0 0 1px rgba(139,92,246,0.15)',
    animation: 'tour-in 0.2s ease',
  };

  let posStyle: React.CSSProperties = {};
  if (position === 'center') {
    posStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  } else if (position === 'right') {
    posStyle = { top: '50%', left: 248, transform: 'translateY(-50%)' };
  } else if (position === 'top') {
    posStyle = { bottom: 72, left: '50%', transform: 'translateX(-50%)' };
  }

  return (
    <div style={{ ...baseStyle, ...posStyle }}>
      {/* Step progress dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background: i === step ? 'var(--accent-bright)' : 'var(--border-bright)',
              transition: 'width 0.2s',
            }}
          />
        ))}
        <span style={{
          marginLeft: 'auto',
          fontSize: 9.5, fontFamily: "'IBM Plex Mono', monospace",
          color: 'var(--text-muted)',
        }}>
          {step + 1}/{total}
        </span>
      </div>

      {/* Title */}
      <div style={{
        fontSize: 14, fontWeight: 700, color: 'var(--text)',
        fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em',
        marginBottom: 7,
      }}>
        {title}
      </div>

      {/* Body */}
      <div style={{
        fontSize: 12.5, color: 'var(--text-muted)',
        fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
        marginBottom: 14,
      }}>
        {body}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onSkip}
          style={{
            fontSize: 10.5, color: 'var(--text-muted)', background: 'none',
            border: 'none', cursor: 'pointer', padding: '3px 0',
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          Skip tour
        </button>
        <div style={{ flex: 1 }} />
        {step > 0 && (
          <button
            onClick={onBack}
            style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text-dim)',
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
              borderRadius: 7, padding: '5px 14px', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Back
          </button>
        )}
        <button
          onClick={onNext}
          style={{
            fontSize: 11, fontWeight: 700, color: 'white',
            background: 'var(--accent)', border: 'none',
            borderRadius: 7, padding: '5px 16px', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 0 12px rgba(124,58,237,0.4)',
          }}
        >
          {isLast ? 'Finish' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

// ── Overlay backdrop ─────────────────────────────────────────────────────────
function TourOverlay({ onSkip }: { onSkip: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 190,
        background: 'rgba(0,0,0,0.45)',
        pointerEvents: 'none',
      }}
      onClick={onSkip}
    />
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
interface GuidedTourProps {
  autoStart?: boolean;
}

export function GuidedTour({ autoStart = true }: GuidedTourProps) {
  const [step,    setStep]    = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!autoStart) return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  const finish = useCallback(() => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const next = useCallback(() => {
    if (step >= STEPS.length - 1) { finish(); return; }
    setStep(s => s + 1);
  }, [step, finish]);

  const back = useCallback(() => setStep(s => Math.max(0, s - 1)), []);

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <>
      <style>{`
        @keyframes tour-in {
          from { opacity: 0; transform: translate(-50%, calc(-50% - 8px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
      <TourOverlay onSkip={finish} />
      <TourTooltip
        step={step}
        total={STEPS.length}
        title={current.title}
        body={current.body}
        position={current.position}
        onNext={next}
        onBack={back}
        onSkip={finish}
      />
    </>
  );
}

// Allow external trigger (e.g. "?" button in Navbar)
export function resetTour() {
  localStorage.removeItem(STORAGE_KEY);
}
