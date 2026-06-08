import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CATEGORY_META, type Category } from '../data/nodes';
import { NodeIcon } from './NodeIcon';

export interface TechNodeData {
  label: string;
  icon: string;
  category: Category;
  nodeTypeId: string;
  status?: 'healthy' | 'degraded' | 'critical';
  tags?: string[];
  [key: string]: unknown;
}

const STATUS_COLORS = {
  healthy:  '#22C55E',
  degraded: '#EAB308',
  critical: '#EF4444',
};

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  default:          { bg: '#1C1C28', color: '#64748B' },
  'SLOW QUERIES':   { bg: 'rgba(234,179,8,0.12)', color: '#EAB308' },
  'UNDER ATTACK':   { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
  CRASHLOOPBACKOFF: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
};

function getTagStyle(tag: string) {
  return TAG_STYLES[tag] ?? TAG_STYLES.default;
}

export const TechNode = memo(function TechNode({ id, data, selected }: NodeProps) {
  const { label, icon, category, status = 'healthy', tags = [] } = data as TechNodeData;
  const { color, label: catLabel } = CATEGORY_META[category] ?? { color: '#7C3AED', label: category };
  const statusColor = STATUS_COLORS[status];

  // Default tags based on node id + category
  const displayTags = tags.length > 0 ? tags : [id.split('_').join('-').toUpperCase()];

  return (
    <div
      style={{
        position: 'relative',
        background: selected ? 'var(--card-hover)' : 'var(--card-bg)',
        borderRadius: 9,
        width: 210,
        border: `1px solid ${selected ? color + '55' : 'var(--border)'}`,
        borderLeft: `3px solid ${color}`,
        boxShadow: selected
          ? `0 0 0 1px ${color}25, 0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${color}18`
          : '0 2px 12px rgba(0,0,0,0.4)',
        transition: 'all 0.18s ease',
        cursor: 'default',
        overflow: 'hidden',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ top: 4, width: 7, height: 7, background: 'var(--sidebar-bg)', border: `1.5px solid ${color}55` }}
      />

      <div style={{ padding: '10px 12px 10px 11px' }}>
        {/* Row 1: category badge + status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
          {/* Category badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: `${color}1A`,
              border: `1px solid ${color}35`,
              borderRadius: 4,
              padding: '2px 7px 2px 5px',
              fontSize: 9.5,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 14,
                height: 14,
                color,
              }}
            >
              <NodeIcon icon={icon} size={11} strokeWidth={1.8} />
            </span>
            {catLabel}
          </span>

          {/* Status */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 9.5,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 500,
              color: statusColor,
              letterSpacing: '0.06em',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: statusColor,
                boxShadow: `0 0 5px ${statusColor}`,
                flexShrink: 0,
                animation: 'pulse-glow 2.5s ease-in-out infinite',
              }}
            />
            {status.toUpperCase()}
          </span>
        </div>

        {/* Row 2: Node name */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text)',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: 10,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>

        {/* Row 3: Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {displayTags.map((tag) => {
            const s = getTagStyle(tag);
            return (
              <span
                key={tag}
                style={{
                  display: 'inline-block',
                  background: s.bg,
                  color: s.color,
                  borderRadius: 4,
                  padding: '2px 6px',
                  fontSize: 9,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: `1px solid ${s.color}25`,
                }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ bottom: 4, width: 7, height: 7, background: 'var(--sidebar-bg)', border: `1.5px solid ${color}55` }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ right: 4, width: 7, height: 7, background: 'var(--sidebar-bg)', border: `1.5px solid ${color}55` }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ left: 4, width: 7, height: 7, background: 'var(--sidebar-bg)', border: `1.5px solid ${color}55` }}
      />
    </div>
  );
});
