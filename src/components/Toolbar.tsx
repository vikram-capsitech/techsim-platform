import { Layers3, Trash2, Download, Share2, Play, Activity } from 'lucide-react';

interface ToolbarProps {
  nodeCount: number;
  edgeCount: number;
  onClear: () => void;
  onSimulationStart?: () => void;
  simulationRunning?: boolean;
}

export function Toolbar({ nodeCount, edgeCount, onClear, onSimulationStart, simulationRunning = false }: ToolbarProps) {
  return (
    <header
      className="flex items-center justify-between px-4 flex-shrink-0"
      style={{
        height: '44px',
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border)',
        zIndex: 10,
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-5 h-5 rounded flex items-center justify-center"
          style={{ background: 'var(--accent)', boxShadow: '0 0 10px rgba(99,102,241,0.5)' }}
        >
          <Layers3 size={11} color="white" strokeWidth={2.5} />
        </div>
        <span
          className="text-sm font-semibold text-[var(--text-primary)] tracking-tight"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Tech<span style={{ color: 'var(--accent)' }}>Sim</span>
        </span>
        <div
          className="text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          BETA
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Stat label="nodes" value={nodeCount} />
          <div className="w-px h-3 bg-[var(--border)]" />
          <Stat label="edges" value={edgeCount} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {onSimulationStart && (
          <ToolbarBtn
            icon={simulationRunning ? <Activity size={13} /> : <Play size={13} />}
            label={simulationRunning ? 'Running' : 'Start Simulation'}
            onClick={simulationRunning ? undefined : onSimulationStart}
          />
        )}
        <ToolbarBtn icon={<Share2 size={13} />} label="Share" />
        <ToolbarBtn icon={<Download size={13} />} label="Export" />
        <div className="w-px h-4 mx-1 bg-[var(--border)]" />
        <ToolbarBtn icon={<Trash2 size={13} />} label="Clear" onClick={onClear} danger />
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1">
      <span
        className="text-xs font-semibold text-[var(--text-primary)] tabular-nums"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {value}
      </span>
      <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
    </div>
  );
}

function ToolbarBtn({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all duration-150"
      style={{
        background: 'transparent',
        color: danger ? 'var(--cat-infrastructure)' : 'var(--text-secondary)',
        border: '1px solid transparent',
        fontFamily: "'DM Sans', sans-serif",
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        const t = e.currentTarget;
        t.style.background = 'var(--bg-card)';
        t.style.borderColor = 'var(--border)';
        t.style.color = danger ? 'var(--cat-infrastructure)' : 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        const t = e.currentTarget;
        t.style.background = 'transparent';
        t.style.borderColor = 'transparent';
        t.style.color = danger ? 'var(--cat-infrastructure)' : 'var(--text-secondary)';
      }}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
