import { memo, useState } from 'react';
import { Handle, Position, type NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';
import { CATEGORY_META, type Category } from '../data/nodes';
import { NodeIcon } from './NodeIcon';
import type { NodeState } from '../simulation/SimulationEngine';

export interface TechNodeData {
  label: string;
  icon: string;
  category: Category;
  nodeTypeId: string;
  status?: 'healthy' | 'degraded' | 'critical' | 'overloaded' | 'down';
  isSimulationRunning?: boolean;
  simState?: NodeState;
  tags?: string[];
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
  const isDown = status === 'down';
  const isOverloaded = status === 'overloaded' || status === 'critical';

  const { updateNodeData, setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // Simulation metrics
  const simState = td.simState;
  const cpuPct = simState ? Math.min(simState.cpuUsage * 100, 100) : 0;
  const latency = simState ? Math.round(simState.latency) : 0;
  const showSimBar = isRunning && simState;

  const deleteNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes(ns => ns.filter(n => n.id !== id));
  };

  const openSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Trigger settings panel by selecting + dispatching custom event
    const event = new CustomEvent('node-settings-open', { detail: { nodeId: id } });
    window.dispatchEvent(event);
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

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minWidth: 160,
        minHeight: 70,
        background: isDown
          ? 'rgba(13,13,16,0.6)'
          : selected
          ? '#1A1A2E'
          : '#12121C',
        borderRadius: 8,
        border: `1px solid ${selected ? color + '80' : isOverloaded ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
        borderTop: `2px solid ${isDown ? '#64748B' : color}`,
        boxShadow: selected
          ? `0 0 0 1px ${color}30, 0 4px 20px rgba(0,0,0,0.6)`
          : isOverloaded
          ? '0 0 14px rgba(239,68,68,0.35)'
          : '0 2px 8px rgba(0,0,0,0.4)',
        transition: 'all 0.15s ease',
        cursor: 'default',
        overflow: 'hidden',
        boxSizing: 'border-box',
        opacity: isDown ? 0.5 : 1,
        animation: isOverloaded
          ? 'node-breathe 1.2s ease-in-out infinite'
          : isRunning
          ? 'node-breathe 3s ease-in-out infinite'
          : undefined,
      }}
    >
      <NodeResizer
        minWidth={160}
        minHeight={70}
        isVisible={!!selected}
        lineStyle={{ border: '1.5px solid ' + color }}
        handleStyle={{
          width: '7px', height: '7px',
          background: color,
          border: '2px solid #0A0A0F',
          borderRadius: '2px',
        }}
      />

      {/* Handles */}
      <Handle type="target" position={Position.Top}
        style={{ top: 2, width: 6, height: 6, background: '#0A0A0F', border: `1.5px solid ${color}60` }} />
      <Handle type="source" position={Position.Bottom}
        style={{ bottom: 2, width: 6, height: 6, background: '#0A0A0F', border: `1.5px solid ${color}60` }} />
      <Handle type="source" position={Position.Right}
        style={{ right: 2, width: 6, height: 6, background: '#0A0A0F', border: `1.5px solid ${color}60` }} />
      <Handle type="target" position={Position.Left}
        style={{ left: 2, width: 6, height: 6, background: '#0A0A0F', border: `1.5px solid ${color}60` }} />

      {/* Main content */}
      <div style={{ padding: '7px 8px 6px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>

        {/* Row 1: category badge + action icons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          {/* Category badge */}
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
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
            <span style={{ display: 'flex', alignItems: 'center', color }}>
              <NodeIcon icon={icon as string} size={9} strokeWidth={2} />
            </span>
            {catMeta?.label ?? category}
          </span>

          {/* Action icons — only visible on hover or selected */}
          <div
            className="node-actions"
            style={{ display: 'flex', alignItems: 'center', gap: 3 }}
          >
            <button
              onClick={openSettings}
              title="Settings"
              style={{
                width: 18, height: 18, borderRadius: 4,
                background: 'transparent', border: '1px solid transparent',
                color: '#64748B', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, transition: 'all 0.1s',
                padding: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.color = '#818CF8'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              ⚙
            </button>
            <button
              onClick={deleteNode}
              title="Delete node"
              style={{
                width: 18, height: 18, borderRadius: 4,
                background: 'transparent', border: '1px solid transparent',
                color: '#64748B', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, transition: 'all 0.1s',
                padding: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              🗑
            </button>
          </div>
        </div>

        {/* Row 2: node name + status dot */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
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

          {/* Status dot */}
          <span
            style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: statusColor,
              boxShadow: `0 0 5px ${statusColor}80`,
              animation: isOverloaded ? 'pulse-glow 0.7s ease-in-out infinite' : 'pulse-glow 2.5s ease-in-out infinite',
            }}
          />
        </div>

        {/* Row 3: simulation metrics (only shown during simulation) */}
        {showSimBar && (
          <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* CPU bar */}
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
            {/* Latency */}
            <span style={{
              fontSize: 8.5, fontFamily: "'IBM Plex Mono', monospace",
              color: latency > 500 ? '#EF4444' : latency > 200 ? '#EAB308' : '#64748B',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {latency}ms
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
