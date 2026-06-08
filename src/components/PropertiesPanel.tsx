import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { CATEGORY_META } from '../data/nodes';
import { getMetricsForNode } from '../data/mockMetrics';
import type { TechNodeData } from './TechNode';
import type { Node } from '@xyflow/react';

const REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1'];

interface PropertiesPanelProps {
  node: Node | null;
  onClose: () => void;
}

export function PropertiesPanel({ node, onClose }: PropertiesPanelProps) {
  const visible = node !== null;
  const data = node?.data as TechNodeData | undefined;
  const category = data?.category;
  const color = category ? (CATEGORY_META[category]?.color ?? 'var(--accent)') : 'var(--accent)';
  const metrics = node && category ? getMetricsForNode(node.id, category) : null;

  const [name, setName] = useState('');
  const [replicas, setReplicas] = useState('3');
  const [region, setRegion] = useState('us-east-1');

  useEffect(() => {
    if (data) setName(data.label);
  }, [data?.label]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0,
        width: 300,
        background: 'var(--sidebar-bg)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 30,
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: visible ? '-8px 0 40px rgba(0,0,0,0.5)' : 'none',
        pointerEvents: visible ? 'all' : 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text)',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '-0.02em',
          }}
        >
          Node Properties
        </h2>
        <button
          onClick={onClose}
          style={{
            width: 28, height: 28,
            borderRadius: 7,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)'; }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* NAME */}
        <Field label="NAME">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              fontSize: 14,
              borderRadius: 7,
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-bright)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </Field>

        {/* REPLICAS */}
        <Field label="REPLICAS">
          <input
            value={replicas}
            onChange={(e) => setReplicas(e.target.value)}
            type="number"
            min="1"
            max="20"
            style={{
              width: '100%',
              padding: '9px 12px',
              fontSize: 14,
              borderRadius: 7,
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-bright)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </Field>

        {/* CAPACITY + LATENCY */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div>
            <Label>CAPACITY</Label>
            <div
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                borderRadius: 7,
                padding: '9px 12px',
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--text)',
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: '-0.02em',
                }}
              >
                {metrics?.primary.value ?? '12.5k'}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontFamily: "'IBM Plex Mono', monospace",
                  marginLeft: 4,
                }}
              >
                {metrics?.primary.label.toLowerCase() ?? 'req/s'}
              </span>
            </div>
          </div>
          <div>
            <Label>LATENCY</Label>
            <div
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                borderRadius: 7,
                padding: '9px 12px',
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--text)',
                  fontFamily: "'IBM Plex Mono', monospace',",
                  letterSpacing: '-0.02em',
                }}
              >
                {metrics?.secondary.value ?? '145'}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontFamily: "'IBM Plex Mono', monospace",
                  marginLeft: 4,
                }}
              >
                ms
              </span>
            </div>
          </div>
        </div>

        {/* REGION */}
        <Field label="REGION">
          <div style={{ position: 'relative' }}>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 36px 9px 12px',
                fontSize: 14,
                borderRadius: 7,
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
              }}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <span
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)',
                pointerEvents: 'none',
                fontSize: 12,
              }}
            >
              ▾
            </span>
          </div>
        </Field>

        {/* Node ID */}
        <Field label="NODE ID">
          <div
            style={{
              padding: '8px 12px',
              background: 'var(--input-bg)',
              border: '1px solid var(--border-dim)',
              borderRadius: 7,
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
            }}
          >
            {node?.id ?? '—'}
          </div>
        </Field>

        {/* Category chip */}
        {category && (
          <div style={{ marginBottom: 18 }}>
            <Label>CATEGORY</Label>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: `${color}18`,
                border: `1px solid ${color}35`,
                borderRadius: 5,
                padding: '4px 10px',
                fontSize: 11,
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color,
              }}
            >
              <span
                style={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 5px ${color}`,
                }}
              />
              {CATEGORY_META[category].label}
            </span>
          </div>
        )}
      </div>

      {/* Footer — Terminate button */}
      <div
        style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <button
          style={{
            width: '100%',
            padding: '11px 0',
            borderRadius: 8,
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.35)',
            color: '#EF4444',
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.22)';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(239,68,68,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <AlertTriangle size={13} />
          Terminate Instance
        </button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
