import { memo, useState } from 'react';
import { getSmoothStepPath, type EdgeProps, type Edge, EdgeLabelRenderer } from '@xyflow/react';
import type { EdgeProtocol } from '../types';

export interface GlowEdgeData {
  color?: string;
  protocol?: EdgeProtocol;
  invalid?: boolean;
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

  const edgeData = data as GlowEdgeData;
  const protocol: EdgeProtocol = edgeData?.protocol ?? 'http';
  const invalid = edgeData?.invalid ?? false;

  const meta = PROTOCOL_META[protocol];
  const baseColor = invalid ? INVALID_COLOR : (edgeData?.color ?? meta.color);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 14,
  });

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

      {/* Invisible wide hit area for hover */}
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

      {/* Hover / selected protocol label */}
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
