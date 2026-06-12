import { memo, useState } from 'react';
import { Handle, Position, type NodeProps, NodeResizer, NodeToolbar, useReactFlow } from '@xyflow/react';
import { CATEGORY_META, type Category } from '../data/nodes';
import { NodeIcon } from './NodeIcon';
import { SERVICE_ICONS } from '../data/serviceIcons';
import { ToolIcon } from '../utils/toolIcon';
import type { NodeState } from '../simulation/SimulationEngine';

export interface SelectedTool {
  id: string;
  name: string;
  canvasLabel: string;
  openSource?: boolean;
  cloudManaged?: boolean;
  provider?: string;
}

export interface TechNodeData {
  label: string;
  icon: string;
  category: Category;
  nodeTypeId: string;
  status?: 'healthy' | 'degraded' | 'critical' | 'overloaded' | 'down';
  isSimulationRunning?: boolean;
  simState?: NodeState;
  tags?: string[];
  selectedTool?: SelectedTool;
  // Settings
  replicas?: number;
  capacityRps?: number;
  availabilityTarget?: string;
  workloadPolicy?: string;
  enableReplication?: boolean;
  maxRpsThrottle?: number;
  latencyOverride?: number;
  errorRateOverride?: number;
  [key: string]: unknown;
}

const STATUS_COLORS: Record<string, string> = {
  healthy:    '#22C55E',
  degraded:   '#EAB308',
  critical:   '#EF4444',
  overloaded: '#EF4444',
  down:       '#64748B',
};

const CATEGORY_COLORS: Record<Category, string> = {
  network:        '#06B6D4',
  compute:        '#A855F7',
  data:           '#10B981',
  messaging:      '#F59E0B',
  infrastructure: '#EF4444',
  monitoring:     '#6366F1',
};

function ToolbarAction({
  icon, title, onClick, hoverBg, hoverBorder, hoverColor,
}: {
  icon: string; title: string; onClick: (e: React.MouseEvent) => void;
  hoverBg: string; hoverBorder: string; hoverColor: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 26, height: 26, borderRadius: 6,
        background: 'transparent',
        border: '1px solid transparent',
        color: '#64748B', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, transition: 'all 0.12s', padding: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = hoverBg;
        e.currentTarget.style.borderColor = hoverBorder;
        e.currentTarget.style.color = hoverColor;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.color = '#64748B';
      }}
    >
      {icon}
    </button>
  );
}

export const TechNode = memo(function TechNode({
  id,
  data,
  selected,
}: NodeProps) {
  const td = data as TechNodeData;
  const { label, icon, category } = td;
  const status = td.simState?.status ?? td.status ?? 'healthy';
  const isRunning = td.isSimulationRunning ?? false;

  const color = CATEGORY_COLORS[category] ?? '#7C3AED';
  const catMeta = CATEGORY_META[category];
  const statusColor = STATUS_COLORS[status] ?? '#22C55E';
  const serviceIcon = SERVICE_ICONS[td.nodeTypeId] ?? null;
  const isDown = status === 'down';
  const isOverloaded = status === 'overloaded' || status === 'critical';

  const { updateNodeData, setNodes, getNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const simState = td.simState;
  const cpuPct = simState ? Math.min(simState.cpuUsage * 100, 100) : 0;
  const latency = simState ? Math.round(simState.latency) : 0;
  const showSimBar = isRunning && simState;
  const statusGlow = simState?.statusGlow && simState.statusGlow !== 'none' ? simState.statusGlow : null;

  const chaosBadge = (() => {
    if (!simState || !isRunning) return null;
    if (simState.status === 'down') return { text: '■ DOWN', color: '#EF4444' };
    if (simState.memoryUsage > 85) return { text: 'MEM LEAK', color: '#F97316' };
    if (simState.cpuUsage > 90) return { text: 'CPU SPIKE', color: '#EF4444' };
    if (simState.status === 'overloaded') return { text: 'OVERLOADED', color: '#EF4444' };
    if (simState.status === 'degraded') return { text: 'DEGRADED', color: '#F59E0B' };
    return null;
  })();

  const deleteNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes(ns => ns.filter(n => n.id !== id));
  };

  const duplicateNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const src = getNodes().find(n => n.id === id);
    if (!src) return;
    const newId = `${id}_copy_${Date.now()}`;
    setNodes(ns => [...ns, {
      ...src,
      id: newId,
      position: { x: src.position.x + 24, y: src.position.y + 24 },
      selected: false,
    }]);
  };

  const openSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('node-settings-open', { detail: { nodeId: id } }));
  };

  const openKnowledge = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('node-knowledge-open', {
      detail: { nodeTypeId: td.nodeTypeId, label: label as string },
    }));
  };

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(label as string);
    setIsEditing(true);
  };

  const commitEdit = () => {
    if ((editValue as string).trim()) {
      updateNodeData(id, { label: (editValue as string).trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
    if (e.key === 'Escape') setIsEditing(false);
  };

  const cpuColor = cpuPct > 85 ? '#EF4444' : cpuPct > 60 ? '#EAB308' : '#22C55E';

  // Larger hit-area makes handles easy to grab while staying visually subtle
  const handleStyle: React.CSSProperties = {
    width: 14,
    height: 14,
    background: color,
    border: '2.5px solid var(--bg)',
    borderRadius: '50%',
    zIndex: 5,
  };

  return (
    // Root: position:relative so action bar can float above; NO overflow:hidden
    // minWidth/minHeight give React Flow something to measure (no height:100% here)
    <div style={{ position: 'relative', minWidth: 160, minHeight: 70 }}>

      <NodeResizer
        minWidth={160}
        minHeight={70}
        isVisible={!!selected}
        lineStyle={{ border: '1.5px solid ' + color }}
        handleStyle={{
          width: '7px', height: '7px',
          background: color,
          border: '2px solid var(--bg)',
          borderRadius: '2px',
        }}
      />

      {/* ── NodeToolbar — renders in a React Flow portal, never overlaps other nodes ── */}
      <NodeToolbar isVisible={!!selected} position={Position.Top} offset={8} className="nodrag nopan">
        <div style={{
          display: 'flex', gap: 3,
          background: 'rgba(13,13,16,0.96)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 8, padding: 4,
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
        }}>
          <ToolbarAction icon="📚" title="Learn" onClick={openKnowledge}
            hoverBg="rgba(6,182,212,0.18)" hoverBorder="rgba(6,182,212,0.4)" hoverColor="#06B6D4" />
          <ToolbarAction icon="⚙" title="Configure" onClick={openSettings}
            hoverBg="rgba(99,102,241,0.18)" hoverBorder="rgba(99,102,241,0.4)" hoverColor="#818CF8" />
          <ToolbarAction icon="📋" title="Duplicate" onClick={duplicateNode}
            hoverBg="rgba(16,185,129,0.18)" hoverBorder="rgba(16,185,129,0.4)" hoverColor="#10B981" />
          <ToolbarAction icon="🗑" title="Delete (Del)" onClick={deleteNode}
            hoverBg="rgba(239,68,68,0.15)" hoverBorder="rgba(239,68,68,0.35)" hoverColor="#EF4444" />
        </div>
      </NodeToolbar>

      {/* ── Visual card — normal flow layout so React Flow can measure height ── */}
      <div
        style={{
          minWidth: 160,
          minHeight: 70,
          position: 'relative',
          background: isDown
            ? 'rgba(13,13,16,0.7)'
            : selected
            ? 'var(--card-hover)'
            : 'var(--card-bg)',
          borderRadius: 8,
          border: isDown
            ? '1px solid rgba(239,68,68,0.5)'
            : `1px solid ${selected ? color + '80' : isOverloaded ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
          borderTop: `2px solid ${isDown ? '#EF4444' : color}`,
          boxShadow: isDown
            ? '0 0 0 2px rgba(239,68,68,0.2), 0 0 20px rgba(239,68,68,0.1)'
            : selected
            ? `0 0 0 1px ${color}30, 0 4px 20px rgba(0,0,0,0.6)`
            : statusGlow
            ? statusGlow
            : isOverloaded
            ? '0 0 14px rgba(239,68,68,0.35)'
            : '0 2px 8px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          opacity: isDown ? 0.45 : 1,
          filter: isDown ? 'grayscale(80%)' : 'none',
          animation: isDown
            ? undefined
            : isOverloaded
            ? 'node-breathe 1.2s ease-in-out infinite'
            : isRunning
            ? 'node-breathe 3s ease-in-out infinite'
            : undefined,
        }}
      >
        {/* Diagonal stripe overlay — only when DOWN */}
        {isDown && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(239,68,68,0.04) 8px, rgba(239,68,68,0.04) 16px)',
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
        )}
        <div style={{ padding: '8px 10px 7px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>

          {/* Row 1: category badge · optional tool pill (inline) · status dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            {/* Category chip */}
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
                background: `${color}18`,
                border: `1px solid ${color}30`,
                borderRadius: 4,
                padding: '1px 6px 1px 4px',
                fontSize: 9,
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {serviceIcon ? (
                  <svg
                    viewBox="0 0 24 24"
                    width={11}
                    height={11}
                    fill={`#${serviceIcon.hex}`}
                    style={{ display: 'block', flexShrink: 0 }}
                    aria-label={serviceIcon.title}
                  >
                    <path d={serviceIcon.path} />
                  </svg>
                ) : (
                  <NodeIcon icon={icon as string} size={9} strokeWidth={2} color={color} />
                )}
              </span>
              {catMeta?.label ?? category}
            </span>

            {/* Selected tool pill + change button */}
            {td.selectedTool && (
              <>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  flex: '1 1 0', minWidth: 0,
                  padding: '1px 6px',
                  background: td.selectedTool.openSource ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)',
                  border: `1px solid ${td.selectedTool.openSource ? 'rgba(16,185,129,0.28)' : 'rgba(59,130,246,0.28)'}`,
                  borderRadius: 4,
                  fontSize: 9,
                  color: td.selectedTool.openSource ? '#10B981' : '#60A5FA',
                  fontWeight: 600,
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: '0.04em',
                }}>
                  <ToolIcon toolId={td.selectedTool.id} size={9} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {td.selectedTool.canvasLabel || td.selectedTool.name}
                  </span>
                </span>
                {!isRunning && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.dispatchEvent(new CustomEvent('change-node-tool', {
                        detail: { nodeId: id, nodeType: td.nodeTypeId, nodeName: td.label },
                      }));
                    }}
                    title="Change tool"
                    className="nodrag"
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      padding: '1px 4px',
                      cursor: 'pointer',
                      fontSize: 9,
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      flexShrink: 0,
                    }}
                  >
                    ⇄
                  </button>
                )}
              </>
            )}

            {/* Status dot pushed to right */}
            <span
              style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginLeft: 'auto',
                background: statusColor,
                boxShadow: `0 0 5px ${statusColor}80`,
                animation: isOverloaded ? 'pulse-glow 0.7s ease-in-out infinite' : 'pulse-glow 2.5s ease-in-out infinite',
              }}
            />
          </div>

          {/* Row 2: node name */}
          <div style={{ minHeight: 28, display: 'flex', alignItems: 'center' }}>
            {isEditing ? (
              <input
                autoFocus
                value={editValue as string}
                onChange={e => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                onClick={e => e.stopPropagation()}
                className="nodrag"
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text)',
                  fontFamily: "'DM Sans', sans-serif",
                  background: 'rgba(124,58,237,0.1)',
                  border: '1px solid rgba(124,58,237,0.4)',
                  borderRadius: 4,
                  padding: '1px 5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <div
                onDoubleClick={startEdit}
                title={`${label as string} · double-click to rename`}
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 600,
                  color: isDown ? '#64748B' : 'var(--text)',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'text',
                }}
              >
                {label as string}
              </div>
            )}
          </div>

          {/* Restart button — only visible when node is DOWN */}
          {isRunning && isDown && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('node-heal', { detail: { nodeId: id } }));
              }}
              className="nodrag"
              style={{
                marginTop: 6,
                width: '100%',
                background: '#10B98122',
                border: '1px solid #10B98144',
                color: '#10B981',
                borderRadius: 6,
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              ↺ Restart Node
            </button>
          )}

          {/* Row 3: simulation metrics + chaos button */}
          {showSimBar && (
            <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${cpuPct}%`,
                    background: cpuColor,
                    borderRadius: 2,
                    transition: 'width 0.3s ease, background 0.3s',
                    boxShadow: `0 0 4px ${cpuColor}80`,
                  }}
                />
              </div>
              <span style={{
                fontSize: 8.5, fontFamily: "'IBM Plex Mono', monospace",
                color: latency > 500 ? '#EF4444' : latency > 200 ? '#EAB308' : '#64748B',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {latency}ms
              </span>
              <button
                className="nodrag nopan"
                title="Inject chaos on this node"
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent('node-chaos-open', { detail: { nodeId: id } }));
                }}
                style={{
                  flexShrink: 0,
                  width: 18, height: 18,
                  borderRadius: 4,
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  color: '#EF4444',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, lineHeight: 1, padding: 0,
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; e.currentTarget.style.borderColor = '#EF4444'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
              >
                ⚡
              </button>
            </div>
          )}
        </div>

        {/* NODE OFFLINE footer strip — inside card so it can't be clipped by React Flow */}
        {isDown && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 18,
            background: 'rgba(239,68,68,0.14)',
            borderTop: '1px solid rgba(239,68,68,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 5, zIndex: 3, pointerEvents: 'none',
          }}>
            <span style={{
              color: '#EF4444', fontSize: 8, fontWeight: 800,
              fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.12em',
            }}>◉ NODE OFFLINE</span>
          </div>
        )}
      </div>

      {/* Visible source handles — user drags from these to start a connection */}
      <Handle id="top"    type="source" position={Position.Top}    style={handleStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={handleStyle} />
      <Handle id="left"   type="source" position={Position.Left}   style={handleStyle} />
      <Handle id="right"  type="source" position={Position.Right}  style={handleStyle} />
      {/* Invisible target handles — pointerEvents:none so they never block the
          source handles above; React Flow detects them geometrically (not via
          DOM events) for connection snapping and for rendering preset edges */}
      <Handle id="top-t"    type="target" position={Position.Top}    style={{ ...handleStyle, opacity: 0, pointerEvents: 'none' }} />
      <Handle id="bottom-t" type="target" position={Position.Bottom} style={{ ...handleStyle, opacity: 0, pointerEvents: 'none' }} />
      <Handle id="left-t"   type="target" position={Position.Left}   style={{ ...handleStyle, opacity: 0, pointerEvents: 'none' }} />
      <Handle id="right-t"  type="target" position={Position.Right}  style={{ ...handleStyle, opacity: 0, pointerEvents: 'none' }} />

      {/* Chaos status badge — outside the overflow:hidden card so it's not clipped */}
      {chaosBadge && (
        <div style={{
          position: 'absolute', top: -8, right: 8,
          background: chaosBadge.color,
          color: 'white', fontSize: 9, fontWeight: 700,
          padding: '2px 6px', borderRadius: 4,
          letterSpacing: '0.05em',
          boxShadow: `0 0 8px ${chaosBadge.color}88`,
          animation: 'pulse-glow 1s ease-in-out infinite',
          zIndex: 2,
          pointerEvents: 'none',
        }}>
          {chaosBadge.text}
        </div>
      )}
    </div>
  );
});
