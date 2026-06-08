import { RefreshCw, Clock, AlertTriangle, Layers3 } from 'lucide-react';
import type { SimMetrics } from '../simulation/SimulationEngine';

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const w = 36, h = 18;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.8"
      />
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill={color}
        opacity="0.08"
        stroke="none"
      />
    </svg>
  );
}

function BarSparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 18 }}>
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: `${(v / max) * 100}%`,
            minHeight: 2,
            borderRadius: 2,
            background: color,
            opacity: i === values.length - 1 ? 1 : 0.5 + (i / values.length) * 0.5,
          }}
        />
      ))}
    </div>
  );
}

const RPS_DATA = [28, 34, 31, 38, 42, 39, 44, 42, 45, 42];
const P99_DATA = [22, 19, 21, 17, 18, 20, 16, 19, 17, 18];
const ERR_DATA = [0.06, 0.05, 0.07, 0.04, 0.05, 0.03, 0.04, 0.05, 0.04, 0.04];

interface MetricsBarProps {
  nodeCount?: number;
  activeNodeCount?: number;
  totalNodes?: number;
  metrics?: SimMetrics;
}

const EMPTY_METRICS: SimMetrics = {
  globalRPS: 0,
  p50: 0,
  p95: 0,
  p99: 0,
  errorRate: 0,
  throughput: 0,
  totalPackets: 0,
  droppedPackets: 0,
  bottleneck: null,
};

export function MetricsBar({ nodeCount = 0, activeNodeCount, totalNodes = 12, metrics = EMPTY_METRICS }: MetricsBarProps) {
  const active = Math.min(activeNodeCount ?? nodeCount, totalNodes || 12);
  const rpsData = scaleSeries(RPS_DATA, metrics.globalRPS || 1);
  const p99Data = scaleSeries(P99_DATA, metrics.p99 || 1);
  const errData = scaleSeries(ERR_DATA.map(v => v * 100), Math.max(metrics.errorRate * 100, 0.01));

  return (
    <div
      style={{
        height: 44,
        background: 'var(--sidebar-bg)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        flexShrink: 0,
        zIndex: 10,
        gap: 0,
      }}
    >
      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingRight: 20,
          marginRight: 8,
          borderRight: '1px solid var(--border)',
        }}
      >
        <LegendDot color="var(--status-healthy)" label="Optimal" />
        <LegendDot color="var(--status-degraded)" label="Degraded" />
        <LegendDot color="var(--status-critical)" label="Critical" />
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1 }}>
        <MetricItem
          icon={<RefreshCw size={11} />}
          label="RPS"
          value={formatRps(metrics.globalRPS)}
          color="#6366F1"
          chart={<BarSparkline values={rpsData} color="#6366F1" />}
        />
        <Div />
        <MetricItem
          icon={<Clock size={11} />}
          label="P99"
          value={formatLatency(metrics.p99)}
          color="var(--status-healthy)"
          chart={<Sparkline values={p99Data} color="#22C55E" />}
        />
        <Div />
        <MetricItem
          icon={<AlertTriangle size={11} />}
          label="ERRORS"
          value={formatPercent(metrics.errorRate)}
          color="var(--status-degraded)"
          chart={<BarSparkline values={errData} color="#EAB308" />}
        />
      </div>

      {/* Active nodes pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '5px 14px',
        }}
      >
        <Layers3 size={12} style={{ color: 'var(--text-muted)' }} />
        <span
          style={{
            fontSize: 11,
            fontFamily: "'IBM Plex Mono', monospace",
            color: 'var(--text-dim)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Active Nodes:
        </span>
        <span
          style={{
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '0.04em',
          }}
        >
          {active} / {totalNodes || 12}
        </span>
      </div>
    </div>
  );
}

function scaleSeries(values: number[], latest: number): number[] {
  const last = values.at(-1) ?? 1;
  const ratio = latest / Math.max(last, 0.001);
  return values.map((value) => Math.max(value * ratio, 0.001));
}

function formatRps(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return Math.round(value).toString();
}

function formatLatency(value: number): string {
  return `${Math.round(value)}ms`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(value < 0.01 ? 2 : 1)}%`;
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span
        style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 4px ${color}`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 11,
          color: 'var(--text-dim)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Div() {
  return <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />;
}

function MetricItem({
  icon,
  label,
  value,
  color,
  chart,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  chart: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 16px',
        height: '44px',
      }}
    >
      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{icon}</span>
      <div>
        <div
          style={{
            fontSize: 9,
            fontFamily: "'IBM Plex Mono', monospace",
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 13,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 700,
            color,
            lineHeight: 1,
            letterSpacing: '0.02em',
          }}
        >
          {value}
        </div>
      </div>
      <div style={{ marginLeft: 4 }}>{chart}</div>
    </div>
  );
}
