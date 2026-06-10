import { AlertTriangle, Play, Square, RefreshCw, Clock, Layers3 } from 'lucide-react';
import type { SimMetrics } from '../simulation/SimulationEngine';
import type { ValidationIssue } from '../types';

// ── Snap points for sliders ──────────────────────────────────────────────────
const SPEED_SNAPS = [0, 0.5, 1, 2.5, 5];
const TRAFFIC_SNAPS = [0, 0.5, 1, 2.5, 5];
const SLIDER_MAX = 5;

// Tick label positions: value → % of track
function toPercent(v: number) { return (v / SLIDER_MAX) * 100; }

// ── Slider sub-component ─────────────────────────────────────────────────────
function SimSlider({
  value,
  onChange,
  color,
  className,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  color: string;
  className?: string;
  label: string;
}) {
  const ticks = label === 'Speed' ? SPEED_SNAPS : TRAFFIC_SNAPS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 140 }}>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span style={{
          fontSize: 9, fontFamily: "'IBM Plex Mono', monospace",
          color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {label}
        </span>
        <span style={{
          fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 700, color,
        }}>
          {value.toFixed(1)}x
        </span>
      </div>

      {/* Track + thumb */}
      <div style={{ position: 'relative', paddingBottom: 10 }}>
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          step={0.1}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className={`sim-slider${className ? ` ${className}` : ''}`}
          style={{ width: '100%' }}
        />
        {/* Tick marks + labels */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', pointerEvents: 'none' }}>
          {ticks.map((t) => (
            <div
              key={t}
              style={{
                position: 'absolute',
                left: `${toPercent(t)}%`,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <div style={{ width: 1, height: 3, background: 'var(--border-bright)' }} />
              <span style={{
                fontSize: 8, fontFamily: "'IBM Plex Mono', monospace",
                color: 'var(--text-muted)', whiteSpace: 'nowrap',
              }}>
                {t === 0 ? '0' : `${t}x`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Node-type → sim role mapping ─────────────────────────────────────────────
const NODE_TYPE_TO_ROLE: Record<string, string> = {
  'load-balancer': 'loadBalancer', 'api-gateway': 'loadBalancer',
  'router': 'loadBalancer', 'waf': 'loadBalancer',
  'postgres': 'database', 'mysql': 'database', 'mongodb': 'database',
  'elastic': 'database', 'data-warehouse': 'database', 'timeseries-db': 'database',
  'redis': 'cache',
  'kafka': 'queue', 'rabbitmq': 'queue', 'sqs': 'queue',
  'pubsub': 'queue', 'event-bus': 'queue', 'nats': 'queue',
  'microservice': 'microservice', 'api-server': 'microservice',
  'worker': 'microservice', 'lambda': 'microservice',
  'cdn': 'cdn',
};

const CHAOS_BY_ROLE: Record<string, { label: string; method: string }[]> = {
  loadBalancer: [
    { label: 'Node Crash',       method: 'crash' },
    { label: 'Config Error',     method: 'crash' },
    { label: 'Connection Flood', method: 'surge' },
    { label: 'SSL Cert Expire',  method: 'crash' },
  ],
  database: [
    { label: 'Primary Failure',  method: 'crash' },
    { label: 'Disk Full',        method: 'crash' },
    { label: 'Slow Queries',     method: 'crash' },
    { label: 'Replication Lag',  method: 'crash' },
    { label: 'Conn Pool Exhausted', method: 'crash' },
  ],
  cache: [
    { label: 'Cache Miss Storm', method: 'crash' },
    { label: 'Memory OOM',       method: 'crash' },
    { label: 'Eviction Storm',   method: 'crash' },
    { label: 'Network Partition',method: 'crash' },
  ],
  queue: [
    { label: 'Queue Full',       method: 'crash' },
    { label: 'Consumer Lag',     method: 'crash' },
    { label: 'Poison Message',   method: 'crash' },
    { label: 'Broker Down',      method: 'crash' },
  ],
  microservice: [
    { label: 'Memory Leak',      method: 'crash' },
    { label: 'Thread Exhaustion',method: 'crash' },
    { label: 'Deadlock',         method: 'crash' },
    { label: 'CPU Spike',        method: 'crash' },
  ],
  cdn: [
    { label: 'Cache Invalidation', method: 'crash' },
    { label: 'Origin Timeout',     method: 'crash' },
    { label: 'DDoS',               method: 'surge' },
  ],
  default: [
    { label: 'Node Crash',       method: 'crash' },
    { label: 'CPU Spike',        method: 'crash' },
    { label: 'Memory Leak',      method: 'crash' },
    { label: 'Net Partition',    method: 'crash' },
  ],
};

// ── Chaos area ────────────────────────────────────────────────────────────────
function ChaosArea({ isRunning, selectedNodeId, selectedNodeTypeId, selectedEdgeId, injectChaos }: {
  isRunning: boolean;
  selectedNodeId: string | null;
  selectedNodeTypeId: string | null;
  selectedEdgeId: string | null;
  injectChaos: (type: string, targetId: string) => void;
}) {
  const muted: React.CSSProperties = {
    fontSize: 10, color: '#3A3A52',
    fontFamily: "'IBM Plex Mono', monospace",
    whiteSpace: 'nowrap', flexShrink: 0,
  };

  if (!isRunning) {
    return <span style={muted}>▶ start sim first</span>;
  }

  // Edge chaos — shown when an edge is selected and no node is selected
  if (!selectedNodeId && selectedEdgeId) {
    return (
      <div style={{ display: 'flex', gap: 4 }}>
        <ScenarioBtn label="⚡ Latency" color="#FACC15"
          onClick={() => injectChaos('latency', selectedEdgeId)} />
        <ScenarioBtn label="✂ Partition" color="#C084FC"
          onClick={() => injectChaos('partition', selectedEdgeId)} />
      </div>
    );
  }

  if (!selectedNodeId) {
    return <span style={muted}>click a node to inject chaos</span>;
  }

  const role = NODE_TYPE_TO_ROLE[selectedNodeTypeId ?? ''] ?? 'default';
  const scenarios = CHAOS_BY_ROLE[role] ?? CHAOS_BY_ROLE.default;

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
      {scenarios.map(s => (
        <ScenarioBtn key={s.label} label={`💥 ${s.label}`} color="#F87171"
          onClick={() => injectChaos(s.method, s.method === 'surge' ? '' : selectedNodeId)} />
      ))}
      <ScenarioBtn label="💚 Heal" color="#4ADE80"
        onClick={() => injectChaos('heal', selectedNodeId)} />
    </div>
  );
}

function ScenarioBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '3px 8px', borderRadius: 6,
        border: `1px solid ${color}44`,
        background: `${color}12`,
        color,
        fontSize: 10, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace",
        cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = `${color}22`)}
      onMouseLeave={e => (e.currentTarget.style.background = `${color}12`)}
    >
      {label}
    </button>
  );
}

// ── Status legend dot ────────────────────────────────────────────────────────
function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: color, boxShadow: `0 0 4px ${color}88`,
      }} />
      <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </span>
    </div>
  );
}

// ── Metric pill ──────────────────────────────────────────────────────────────
function Metric({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{icon}</span>
        <span style={{
          fontSize: 8, fontFamily: "'IBM Plex Mono', monospace",
          color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>{label}</span>
      </div>
      <span style={{
        fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 700, color, lineHeight: 1, letterSpacing: '0.02em',
      }}>{value}</span>
    </div>
  );
}

function Div() {
  return <div style={{ width: 1, height: 28, background: 'var(--border)', flexShrink: 0 }} />;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtRps(v: number) { return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v).toString(); }
function fmtMs(v: number) { return `${Math.round(v)}ms`; }
function fmtPct(v: number) { return `${(v * 100).toFixed(v < 0.001 ? 2 : 1)}%`; }

// ── Props ────────────────────────────────────────────────────────────────────
export interface BottomBarProps {
  isRunning: boolean;
  onToggle: () => void;
  metrics: SimMetrics;
  issues: ValidationIssue[];
  onIssuesClick: () => void;
  selectedNodeId: string | null;
  selectedNodeTypeId: string | null;
  selectedEdgeId: string | null;
  injectChaos: (type: string, targetId: string) => void;
  speed: number;
  onSpeedChange: (v: number) => void;
  traffic: number;
  onTrafficChange: (v: number) => void;
  activeNodeCount: number;
  totalNodeCount: number;
  onScoreClick?: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────
export function BottomBar({
  isRunning, onToggle,
  metrics,
  issues, onIssuesClick,
  selectedNodeId, selectedNodeTypeId, selectedEdgeId,
  injectChaos,
  speed, onSpeedChange,
  traffic, onTrafficChange,
  activeNodeCount, totalNodeCount,
  onScoreClick,
}: BottomBarProps) {
  const criticalCount = issues.filter(i => i.severity === 'critical' || i.severity === 'error').length;
  const warnCount    = issues.filter(i => i.severity === 'warning').length;

  const rpsColor   = metrics.globalRPS > 5000 ? '#EF4444' : '#6366F1';
  const p99Color   = metrics.p99 > 500 ? '#EF4444' : metrics.p99 > 200 ? '#EAB308' : '#22C55E';
  const errColor   = metrics.errorRate > 0.05 ? '#EF4444' : metrics.errorRate > 0.01 ? '#EAB308' : '#22C55E';

  return (
    <div
      style={{
        height: 58,
        background: 'var(--sidebar-bg)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 10,
        flexShrink: 0,
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {/* ── LEFT: issues + run + chaos ────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
        {/* Issues button */}
        <button
          onClick={onIssuesClick}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 7,
            background: criticalCount > 0
              ? 'rgba(239,68,68,0.1)'
              : warnCount > 0
              ? 'rgba(234,179,8,0.1)'
              : 'rgba(255,255,255,0.04)',
            border: `1px solid ${criticalCount > 0 ? 'rgba(239,68,68,0.3)' : warnCount > 0 ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: criticalCount > 0 ? '#EF4444' : warnCount > 0 ? '#EAB308' : 'var(--text-dim)',
            fontSize: 10.5, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace",
            cursor: 'pointer',
          }}
        >
          <AlertTriangle size={11} />
          ISSUES
          {issues.length > 0 && (
            <span style={{
              background: criticalCount > 0 ? '#EF4444' : '#EAB308',
              color: '#0A0A0F', borderRadius: 9, padding: '0 5px',
              fontSize: 9, fontWeight: 800, lineHeight: '14px',
            }}>
              {issues.length}
            </span>
          )}
        </button>

        {/* Run/Stop */}
        <button
          onClick={onToggle}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 7,
            background: isRunning ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
            border: `1px solid ${isRunning ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)'}`,
            color: isRunning ? '#EF4444' : '#22C55E',
            fontSize: 10.5, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace",
            cursor: 'pointer',
            minWidth: 72,
          }}
        >
          {isRunning ? <Square size={10} /> : <Play size={10} />}
          {isRunning ? 'STOP' : 'RUN'}
        </button>

        {/* Score button */}
        {onScoreClick && (
          <button
            onClick={onScoreClick}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 7,
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.3)',
              color: '#A78BFA',
              fontSize: 10.5, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace",
              cursor: 'pointer',
            }}
          >
            📊 SCORE
          </button>
        )}

        <Div />

        {/* Chaos label */}
        <span style={{
          fontSize: 9.5, fontWeight: 700, color: '#F87171',
          fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.08em',
          flexShrink: 0,
        }}>
          ⚡ CHAOS
        </span>

        {/* Dynamic chaos area */}
        <ChaosArea
          isRunning={isRunning}
          selectedNodeId={selectedNodeId}
          selectedNodeTypeId={selectedNodeTypeId}
          selectedEdgeId={selectedEdgeId}
          injectChaos={injectChaos}
        />
      </div>

      <Div />

      {/* ── CENTER: sliders ───────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 20,
        padding: '0 16px', minWidth: 0, maxWidth: 380,
      }}>
        <SimSlider
          label="Speed"
          value={speed}
          onChange={onSpeedChange}
          color="#8B5CF6"
        />
        <SimSlider
          label="Traffic"
          value={traffic}
          onChange={onTrafficChange}
          color="#F59E0B"
          className="traffic"
        />
      </div>

      <Div />

      {/* ── RIGHT: status + metrics ───────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {/* Status legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusDot color="#22C55E" label="Optimal" />
          <StatusDot color="#EAB308" label="Degraded" />
          <StatusDot color="#EF4444" label="Critical" />
        </div>

        <Div />

        {/* Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Metric icon={<RefreshCw size={10} />} label="RPS"
            value={fmtRps(metrics.globalRPS)} color={rpsColor} />
          <Metric icon={<Clock size={10} />} label="P99"
            value={fmtMs(metrics.p99)} color={p99Color} />
          <Metric icon={<AlertTriangle size={10} />} label="Errors"
            value={fmtPct(metrics.errorRate)} color={errColor} />
          <Metric
            icon={<Layers3 size={10} />} label="Active"
            value={`${activeNodeCount}/${totalNodeCount}`}
            color="var(--text-dim)"
          />
        </div>
      </div>
    </div>
  );
}
