import { memo, useState } from 'react';
import {
  getSmoothStepPath,
  getStraightPath,
  getBezierPath,
  type EdgeProps,
  type Edge,
  EdgeLabelRenderer,
  useReactFlow,
} from '@xyflow/react';
import type { EdgeProtocol } from '../types';

export type EdgeRoutingType = 'smoothstep' | 'straight' | 'bezier';

export interface GlowEdgeData {
  color?: string;
  protocol?: EdgeProtocol;
  invalid?: boolean;
  edgeType?: EdgeRoutingType;
  [key: string]: unknown;
}

export type GlowEdgeType = Edge<GlowEdgeData>;

const PROTOCOL_META: Record<EdgeProtocol, { color: string; label: string; dashSpeed: string }> = {
  http:     { color: '#06B6D4', label: 'HTTP',  dashSpeed: '1.2s' },
  database: { color: '#3B82F6', label: 'DB',    dashSpeed: '1.8s' },
  cache:    { color: '#A855F7', label: 'CACHE', dashSpeed: '0.9s' },
  queue:    { color: '#F97316', label: 'QUEUE', dashSpeed: '0.7s' },
};

const INVALID_COLOR = '#EF4444';

const ROUTING_OPTIONS: { type: EdgeRoutingType; icon: string; label: string }[] = [
  { type: 'smoothstep', icon: '⌒', label: 'Smooth' },
  { type: 'straight',   icon: '—', label: 'Straight' },
  { type: 'bezier',     icon: '∿', label: 'Bezier' },
];

export const GlowEdge = memo(function GlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);
  const { setEdges } = useReactFlow();

  const edgeData = data as GlowEdgeData;
  const protocol: EdgeProtocol = edgeData?.protocol ?? 'http';
  const invalid = edgeData?.invalid ?? false;
  const edgeType: EdgeRoutingType = (edgeData?.edgeType as EdgeRoutingType) ?? 'bezier';

  const meta = PROTOCOL_META[protocol];
  const baseColor = invalid ? INVALID_COLOR : (edgeData?.color ?? meta.color);

  // Compute path based on routing type
  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (edgeType === 'straight') {
    [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  } else if (edgeType === 'bezier') {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX, sourceY, sourcePosition,
      targetX, targetY, targetPosition,
    });
  } else {
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX, sourceY, sourcePosition,
      targetX, targetY, targetPosition,
      borderRadius: 14,
    });
  }

  const changeEdgeType = (type: EdgeRoutingType) => {
    setEdges(es => es.map(e =>
      e.id === id ? { ...e, data: { ...e.data, edgeType: type } } : e,
    ));
  };

  const filterId = `glow-${id}`;
  const intensity = selected || hovered ? 3 : invalid ? 2.5 : 1.5;
  const opacity   = selected || hovered ? 0.9 : 0.55;

  return (
    <>
      <defs>
        <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={intensity} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <marker
          id={`arrow-${id}`}
          markerWidth="7"
          markerHeight="7"
          refX="6"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0.5 L0,5.5 L6,3 z" fill={baseColor} opacity={opacity} />
        </marker>
      </defs>

      {/* Invisible wide hit area for hover/click */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {/* Glow halo */}
      <path
        d={edgePath}
        fill="none"
        stroke={baseColor}
        strokeWidth={invalid ? 5 : selected || hovered ? 4 : 2.5}
        strokeOpacity={invalid ? 0.3 : 0.15}
        filter={`url(#${filterId})`}
        style={{ pointerEvents: 'none', animation: invalid ? 'attack-pulse 1s ease-in-out infinite' : undefined }}
      />

      {/* Main line */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={baseColor}
        strokeWidth={invalid ? 1.75 : selected || hovered ? 1.75 : 1.25}
        strokeOpacity={opacity}
        markerEnd={`url(#arrow-${id})`}
        style={{ transition: 'stroke-opacity 0.2s, stroke-width 0.2s', pointerEvents: 'none' }}
      />

      {/* Animated flow particle */}
      <path
        d={edgePath}
        fill="none"
        stroke={baseColor}
        strokeWidth={invalid ? 2.5 : 2}
        strokeOpacity={invalid ? 0.9 : 0.75}
        strokeDasharray={invalid ? '4 12' : '5 18'}
        strokeLinecap="round"
        style={{ pointerEvents: 'none' }}
      >
        <animate
          attributeName="stroke-dashoffset"
          values={`${invalid ? 48 : 80};0`}
          dur={meta.dashSpeed}
          repeatCount="indefinite"
          calcMode="linear"
        />
      </path>

      {/* Edge routing toolbar — shown when edge is selected */}
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, calc(-100% - 10px)) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 20,
            }}
            className="nodrag nopan"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(10,10,15,0.96)',
                border: '1px solid rgba(124,58,237,0.45)',
                borderRadius: 8,
                padding: '3px 4px',
                gap: 2,
                boxShadow: '0 4px 24px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.1)',
              }}
            >
              {ROUTING_OPTIONS.map(({ type, icon, label }) => {
                const isActive = edgeType === type;
                return (
                  <button
                    key={type}
                    onClick={(e) => { e.stopPropagation(); changeEdgeType(type); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 9px',
                      borderRadius: 5,
                      border: isActive ? '1px solid rgba(124,58,237,0.6)' : '1px solid transparent',
                      background: isActive ? 'rgba(124,58,237,0.22)' : 'transparent',
                      color: isActive ? '#A78BFA' : '#64748B',
                      fontSize: 11,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(124,58,237,0.1)';
                        e.currentTarget.style.color = '#C4B5FD';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#64748B';
                      }
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{icon}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Protocol label — shown on hover or select */}
      {(hovered || selected) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div
              style={{
                background: invalid ? 'rgba(30,6,6,0.95)' : 'rgba(13,13,16,0.92)',
                border: `1px solid ${baseColor}50`,
                borderRadius: 5,
                padding: '3px 8px',
                fontSize: 9.5,
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: baseColor,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                whiteSpace: 'nowrap',
                boxShadow: `0 0 10px ${baseColor}30`,
              }}
            >
              {invalid && <span style={{ fontSize: 10 }}>⚠</span>}
              {invalid ? 'INVALID' : meta.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
