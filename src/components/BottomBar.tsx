import { useState } from 'react';
import { AlertTriangle, Play, Square, RefreshCw, Clock, Layers3, X, RefreshCcw } from 'lucide-react';
import type { SimMetrics, NodeState } from '../simulation/SimulationEngine';
import type { ValidationIssue } from '../types';
import { getValidChaos, CHAOS_LABELS, CHAOS_TO_ACTION } from '../data/chaosValidation';
import { ChaosBlockedModal, CHAOS_BLOCKED_REASONS, type ChaosBlockedInfo } from './ChaosBlockedModal';

// ── Snap points for sliders ──────────────────────────────────────────────────
const SPEED_SNAPS = [0, 0.5, 1, 2.5, 5];
const TRAFFIC_SNAPS = [0, 0.5, 1, 2.5, 5];
const SLIDER_MAX = 5;

function toPercent(v: number) { return (v / SLIDER_MAX) * 100; }

// ── All 21 scenarios grouped by category ────────────────────────────────────
const ALL_CHAOS_SCENARIOS = [
  { id: 'node_crash',                category: 'Infrastructure' },
  { id: 'memory_leak',               category: 'Infrastructure' },
  { id: 'cpu_spike',                 category: 'Infrastructure' },
  { id: 'disk_full',                 category: 'Infrastructure' },
  { id: 'high_latency',              category: 'Infrastructure' },
  { id: 'network_partition',         category: 'Network' },
  { id: 'packet_loss',               category: 'Network' },
  { id: 'ssl_cert_expiry',           category: 'Network' },
  { id: 'ddos',                      category: 'Network' },
  { id: 'dns_poisoning',             category: 'Network' },
  { id: 'thread_pool_exhaustion',    category: 'Application' },
  { id: 'deadlock',                  category: 'Application' },
  { id: 'connection_pool_exhausted', category: 'Application' },
  { id: 'slow_queries',              category: 'Application' },
  { id: 'replication_lag',           category: 'Data' },
  { id: 'split_brain',               category: 'Data' },
  { id: 'cache_eviction_storm',      category: 'Data' },
  { id: 'memory_oom',                category: 'Data' },
  { id: 'queue_full',                category: 'Queue' },
  { id: 'consumer_lag',              category: 'Queue' },
  { id: 'poison_message',            category: 'Queue' },
] as const;

type Scenario = typeof ALL_CHAOS_SCENARIOS[number];

const GROUPED: Record<string, Scenario[]> = {};
for (const s of ALL_CHAOS_SCENARIOS) {
  if (!GROUPED[s.category]) GROUPED[s.category] = [];
  GROUPED[s.category].push(s);
}

// ── Floating chaos panel ─────────────────────────────────────────────────────
function ChaosArea({
  isRunning,
  selectedNodeId,
  selectedNodeName,
  selectedNodeType,
  selectedNodeSimState,
  injectChaos,
  onClose,
}: {
  isRunning: boolean;
  selectedNodeId: string | null;
  selectedNodeName: string | null;
  selectedNodeType: string | null;
  selectedNodeSimState: NodeState | null;
  injectChaos: (type: string, targetId: string) => void;
  onClose: () => void;
}) {
  const [blockedModal, setBlockedModal] = useState<ChaosBlockedInfo | null>(null);

  if (!isRunning || !selectedNodeId) return null;

  const nodeDown = selectedNodeSimState?.status === 'down';
  const validSet = new Set(getValidChaos(selectedNodeType ?? ''));

  const handleClick = (chaosId: string) => {
    if (nodeDown) return;
    const isValid = validSet.has(chaosId);
    if (!isValid) {
      const blocked = CHAOS_BLOCKED_REASONS[chaosId];
      setBlockedModal({
        chaosType: chaosId,
        chaosLabel: CHAOS_LABELS[chaosId] ?? chaosId,
        nodeType: selectedNodeType ?? '',
        nodeName: selectedNodeName ?? selectedNodeId,
        reason: blocked?.reason ?? `${CHAOS_LABELS[chaosId] ?? chaosId} cannot affect ${selectedNodeType ?? 'this'} nodes.`,
        validForTypes: blocked?.validForTypes ?? [],
        validChaosForThisNode: Array.from(validSet),
      });
      return;
    }
    const action = CHAOS_TO_ACTION[chaosId];
    if (!action) return;
    const target = action.method === 'surge' ? '' : selectedNodeId;
    injectChaos(action.method, target);
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 66,          /* just above 58px bottom bar + 4px gap */
          left: 228,           /* past sidebar (220px) + 8px margin */
          width: 310,
          maxHeight: 'calc(100vh - 150px)',
          overflowY: 'auto',
          background: 'var(--sidebar-bg)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 12,
          boxShadow: '0 12px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(239,68,68,0.08)',
          zIndex: 50,
          padding: '0 0 12px',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px 9px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(239,68,68,0.04)',
          borderRadius: '12px 12px 0 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace",
              color: '#EF4444',
            }}>
              ⚡ Chaos Target
            </span>
            <span style={{
              fontSize: 11.5, fontWeight: 600, color: 'var(--text)',
              maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {selectedNodeName ?? selectedNodeId}
            </span>
            <span style={{
              fontSize: 9.5, fontFamily: "'IBM Plex Mono', monospace",
              color: '#EF4444', background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.25)', borderRadius: 4,
              padding: '1px 6px',
            }}>
              {validSet.size} valid
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={11} />
          </button>
        </div>

        <div style={{ padding: '10px 12px 0' }}>
          {/* DOWN banner with prominent Restart */}
          {nodeDown && (
            <div style={{
              marginBottom: 10,
              padding: '10px 12px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.35)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            }}>
              <div>
                <div style={{ color: '#10B981', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
                  Node is DOWN
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 10.5, lineHeight: 1.4 }}>
                  Heal before injecting more chaos
                </div>
              </div>
              <button
                onClick={() => injectChaos('heal', selectedNodeId)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#10B981',
                  border: '1px solid #10B98180',
                  color: 'white',
                  borderRadius: 7,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: '0 0 12px rgba(16,185,129,0.3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.boxShadow = '0 0 18px rgba(16,185,129,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.boxShadow = '0 0 12px rgba(16,185,129,0.3)'; }}
              >
                <RefreshCcw size={12} />
                Restart
              </button>
            </div>
          )}

          {/* Grouped scenarios */}
          {Object.entries(GROUPED).map(([category, scenarios]) => (
            <div key={category} style={{ marginBottom: 10 }}>
              <div style={{
                fontSize: 9, fontWeight: 700, color: 'var(--text-muted)',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5,
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                {category}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {scenarios.map(scenario => {
                  const isValid = validSet.has(scenario.id) && !nodeDown;
                  const label = CHAOS_LABELS[scenario.id] ?? scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => handleClick(scenario.id)}
                      title={isValid
                        ? `Apply ${label} to ${selectedNodeName ?? selectedNodeId}`
                        : nodeDown ? 'Heal the node first'
                        : `${label} — not applicable here (click to learn why)`}
                      style={{
                        background: isValid ? '#EF444415' : 'transparent',
                        border: `1px solid ${isValid ? '#EF444440' : 'var(--border)'}`,
                        color: isValid ? '#EF4444' : 'var(--text-muted)',
                        borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
                        fontSize: 11, fontWeight: isValid ? 500 : 400,
                        opacity: isValid ? 1 : 0.45, transition: 'all 0.15s',
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                      }}
                      onMouseEnter={e => {
                        if (isValid) { e.currentTarget.style.background = '#EF444425'; e.currentTarget.style.borderColor = '#EF444466'; }
                        else { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = isValid ? '#EF444415' : 'transparent';
                        e.currentTarget.style.borderColor = isValid ? '#EF444440' : 'var(--border)';
                        e.currentTarget.style.opacity = isValid ? '1' : '0.45';
                      }}
                    >
                      {label}
                      {!isValid && !nodeDown && <span style={{ fontSize: 9, opacity: 0.7 }}>🔒</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Heal / Restart Node */}
          <div style={{ paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => injectChaos('heal', selectedNodeId)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: '#10B98112', border: '1px solid #10B98135',
                color: '#10B981', borderRadius: 7, padding: '7px',
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#10B98122'; e.currentTarget.style.borderColor = '#10B98155'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#10B98112'; e.currentTarget.style.borderColor = '#10B98135'; }}
            >
              <RefreshCcw size={12} />
              Heal / Restart Node
            </button>
          </div>
        </div>
      </div>

      {blockedModal && (
        <ChaosBlockedModal info={blockedModal} onClose={() => setBlockedModal(null)} />
      )}
    </>
  );
}

// ── Edge chaos inline buttons (kept small, in the bar) ───────────────────────
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

// ── Status legend item (compact: dot + label only) ──────────────────────────
function StatusItem({ color, label, sub }: { color: string; label: string; sub: string }) {
  return (
    <div title={sub} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'default' }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: color, boxShadow: `0 0 4px ${color}88`,
      }} />
      <span style={{
        fontSize: 10, color: 'var(--text-dim)',
        fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Packet flow legend item (compact: dot + label only) ─────────────────────
function PacketItem({ color, label, sub, square }: { color: string; label: string; sub: string; square?: boolean }) {
  return (
    <div title={sub} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'default' }}>
      <span style={{
        width: square ? 6 : 5,
        height: square ? 6 : 5,
        borderRadius: square ? 1 : '50%',
        flexShrink: 0,
        background: color,
        boxShadow: `0 0 4px ${color}88`,
      }} />
      <span style={{
        fontSize: 10, color: 'var(--text-dim)',
        fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
        whiteSpace: 'nowrap',
      }}>
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
  selectedNodeName?: string | null;
  selectedEdgeId: string | null;
  selectedNodeSimState: NodeState | null;
  chaosNodeId?: string | null;
  chaosNodeTypeId?: string | null;
  chaosNodeName?: string | null;
  chaosNodeSimState?: NodeState | null;
  onChaosClose?: () => void;
  injectChaos: (type: string, targetId: string) => void;
  speed: number;
  onSpeedChange: (v: number) => void;
  traffic: number;
  onTrafficChange: (v: number) => void;
  activeNodeCount: number;
  totalNodeCount: number;
  onScoreClick?: () => void;
  onDeselectNode?: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────
export function BottomBar({
  isRunning, onToggle,
  metrics,
  issues, onIssuesClick,
  selectedNodeId, selectedNodeTypeId, selectedNodeName, selectedEdgeId, selectedNodeSimState,
  chaosNodeId, chaosNodeTypeId, chaosNodeName, chaosNodeSimState, onChaosClose,
  injectChaos,
  speed, onSpeedChange,
  traffic, onTrafficChange,
  activeNodeCount, totalNodeCount,
  onScoreClick,
  onDeselectNode,
}: BottomBarProps) {
  const criticalCount = issues.filter(i => i.severity === 'critical' || i.severity === 'error').length;
  const warnCount    = issues.filter(i => i.severity === 'warning').length;

  const rpsColor   = metrics.globalRPS > 5000 ? '#EF4444' : '#6366F1';
  const p99Color   = metrics.p99 > 500 ? '#EF4444' : metrics.p99 > 200 ? '#EAB308' : '#22C55E';
  const errColor   = metrics.errorRate > 0.05 ? '#EF4444' : metrics.errorRate > 0.01 ? '#EAB308' : '#22C55E';

  return (
    <>
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
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
        }}
      >
        {/* ── LEFT: issues + run + chaos indicator ─────────────────── */}
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

          {/* Chaos indicator */}
          <span style={{
            fontSize: 9.5, fontWeight: 700, color: '#F87171',
            fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.08em',
            flexShrink: 0,
          }}>
            ⚡ CHAOS
          </span>

          {/* Context label */}
          {!isRunning && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", whiteSpace: 'nowrap' }}>
              ▶ start sim first
            </span>
          )}
          {isRunning && chaosNodeId && (
            <span style={{
              fontSize: 10, color: '#EF4444', fontFamily: "'IBM Plex Mono', monospace",
              maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              → {chaosNodeName ?? chaosNodeId}
            </span>
          )}
          {isRunning && !chaosNodeId && selectedEdgeId && (
            <div style={{ display: 'flex', gap: 4 }}>
              <ScenarioBtn label="⚡ Latency"   color="#FACC15" onClick={() => injectChaos('latency', selectedEdgeId)} />
              <ScenarioBtn label="✂ Partition" color="#C084FC" onClick={() => injectChaos('partition', selectedEdgeId)} />
            </div>
          )}
          {isRunning && !chaosNodeId && !selectedEdgeId && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", whiteSpace: 'nowrap' }}>
              click ⚡ on a node to inject chaos
            </span>
          )}
        </div>

        <Div />

        {/* ── CENTER: sliders ───────────────────────────────────────── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 20,
          padding: '0 16px', minWidth: 0, maxWidth: 380,
        }}>
          <SimSlider label="Speed"   value={speed}   onChange={onSpeedChange}   color="#8B5CF6" />
          <SimSlider label="Traffic" value={traffic} onChange={onTrafficChange} color="#F59E0B" className="traffic" />
        </div>

        <Div />

        {/* ── RIGHT: status + metrics ───────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {/* Node status legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusItem color="#22C55E" label="Optimal"  sub="< 80% capacity" />
            <StatusItem color="#EAB308" label="Degraded" sub="80–150% load" />
            <StatusItem color="#EF4444" label="Critical" sub="> 150% / errors" />
            <StatusItem color="#64748B" label="Offline"  sub="node is down" />
          </div>

          <Div />

          {/* Packet flow legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PacketItem color="#06B6D4" label="Normal"  sub="healthy requests" />
            <PacketItem color="#F97316" label="Error"   sub="rejected / dropped" />
            <PacketItem color="#EF4444" label="Attack"  sub="DDoS / surge" />
          </div>

          <Div />

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

      {/* Floating chaos panel — opens only when ⚡ icon is clicked on a node */}
      <ChaosArea
        isRunning={isRunning}
        selectedNodeId={chaosNodeId ?? null}
        selectedNodeName={chaosNodeName ?? null}
        selectedNodeType={chaosNodeTypeId ?? null}
        selectedNodeSimState={chaosNodeSimState ?? null}
        injectChaos={injectChaos}
        onClose={onChaosClose ?? (() => {})}
      />
    </>
  );
}
