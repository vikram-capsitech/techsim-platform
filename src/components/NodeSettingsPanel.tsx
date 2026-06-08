import { useState, useEffect, useCallback } from 'react';
import { useReactFlow, type Node } from '@xyflow/react';
import { X, Trash2, Save } from 'lucide-react';
import { CATEGORY_META } from '../data/nodes';
import type { TechNodeData } from './TechNode';

// ── Simulate-as options per category ──────────────────────────────────────
const SIM_ROLES: Record<string, { value: string; label: string }[]> = {
  network: [
    { value: 'apiGateway',   label: 'API Gateway' },
    { value: 'loadBalancer', label: 'Load Balancer' },
    { value: 'cdn',          label: 'CDN' },
    { value: 'waf',          label: 'WAF' },
    { value: 'dns',          label: 'DNS' },
    { value: 'router',       label: 'Router' },
  ],
  compute: [
    { value: 'appServer',    label: 'App Server' },
    { value: 'microservice', label: 'Microservice' },
    { value: 'serverless',   label: 'Serverless' },
    { value: 'worker',       label: 'Worker' },
  ],
  data: [
    { value: 'database',      label: 'SQL Database' },
    { value: 'nosql',         label: 'NoSQL Database' },
    { value: 'cache',         label: 'Cache' },
    { value: 'objectStorage', label: 'Object Storage' },
    { value: 'searchIndex',   label: 'Search Index' },
  ],
  messaging: [
    { value: 'queue',      label: 'Message Queue' },
    { value: 'eventStream', label: 'Event Stream' },
    { value: 'pubsub',     label: 'Pub/Sub' },
  ],
  infrastructure: [
    { value: 'loadBalancer', label: 'Load Balancer' },
    { value: 'microservice', label: 'Microservice' },
    { value: 'appServer',    label: 'App Server' },
  ],
  monitoring: [
    { value: 'monitoring', label: 'Monitoring' },
  ],
};

const AVAILABILITY_OPTIONS = [
  { value: 'default',   label: 'Default (70% / 30%)' },
  { value: 'high',      label: 'High Availability (99.9%)' },
  { value: 'critical',  label: 'Mission Critical (99.99%)' },
  { value: 'eventual',  label: 'Eventual Consistency' },
];

const WORKLOAD_OPTIONS = [
  { value: 'app_sync_api',   label: 'App Synchronous API – High Consistency' },
  { value: 'event_async',    label: 'Event Driven Async – High Throughput' },
  { value: 'read_heavy',     label: 'Read Heavy – Cache Optimized' },
  { value: 'write_heavy',    label: 'Write Heavy – Queue Buffered' },
  { value: 'batch',          label: 'Batch Processing' },
];

interface NodeSettingsPanelProps {
  nodeId: string | null;
  onClose: () => void;
}

export function NodeSettingsPanel({ nodeId, onClose }: NodeSettingsPanelProps) {
  const { getNode, updateNodeData, setNodes } = useReactFlow();
  const node: Node | undefined = nodeId ? getNode(nodeId) : undefined;
  const data = node?.data as TechNodeData | undefined;

  const [name,             setName]             = useState('');
  const [simRole,          setSimRole]          = useState('');
  const [replicas,         setReplicas]         = useState(1);
  const [capacityRps,      setCapacityRps]      = useState(10000);
  const [enableReplication,setEnableReplication] = useState(false);
  const [availTarget,      setAvailTarget]      = useState('default');
  const [workloadPolicy,   setWorkloadPolicy]   = useState('app_sync_api');
  const [maxRpsThrottle,   setMaxRpsThrottle]   = useState(10000);
  const [latencyOverride,  setLatencyOverride]  = useState(10);
  const [errorRateOverride,setErrorRateOverride] = useState(0);
  const [saved,            setSaved]            = useState(false);

  // Sync form state when node changes
  useEffect(() => {
    if (!data) return;
    setName((data.label as string) ?? '');
    setSimRole((data.simRole as string) ?? (SIM_ROLES[data.category]?.[0]?.value ?? ''));
    setReplicas((data.replicas as number) ?? 1);
    setCapacityRps((data.capacityRps as number) ?? 10000);
    setEnableReplication((data.enableReplication as boolean) ?? false);
    setAvailTarget((data.availabilityTarget as string) ?? 'default');
    setWorkloadPolicy((data.workloadPolicy as string) ?? 'app_sync_api');
    setMaxRpsThrottle((data.maxRpsThrottle as number) ?? 10000);
    setLatencyOverride((data.latencyOverride as number) ?? 10);
    setErrorRateOverride((data.errorRateOverride as number) ?? 0);
    setSaved(false);
  }, [nodeId, data]);

  const save = useCallback(() => {
    if (!nodeId) return;
    updateNodeData(nodeId, {
      label: name.trim() || name,
      simRole, replicas, capacityRps, enableReplication,
      availabilityTarget: availTarget,
      workloadPolicy, maxRpsThrottle, latencyOverride, errorRateOverride,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [nodeId, name, simRole, replicas, capacityRps, enableReplication, availTarget, workloadPolicy, maxRpsThrottle, latencyOverride, errorRateOverride, updateNodeData]);

  const deleteNode = () => {
    if (!nodeId) return;
    setNodes(ns => ns.filter(n => n.id !== nodeId));
    onClose();
  };

  const visible = nodeId !== null && !!node;
  const color = data?.category ? (CATEGORY_META[data.category]?.color ?? '#7C3AED') : '#7C3AED';
  const simRoleOptions = SIM_ROLES[data?.category ?? 'compute'] ?? SIM_ROLES.compute;

  return (
    <div
      style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: 300,
        background: '#0D0D14',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        zIndex: 35,
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: visible ? '-8px 0 40px rgba(0,0,0,0.6)' : 'none',
        pointerEvents: visible ? 'all' : 'none',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: `${color}18`, border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>⚙</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
            Component Settings
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Btn icon={<Trash2 size={12} />} danger onClick={deleteNode} title="Delete node" />
          <Btn icon={<X size={12} />} onClick={onClose} title="Close" />
        </div>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>

        {/* Component name */}
        <Section label="Component Name">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = `${color}70`)}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
          />
        </Section>

        {/* ── Simulation mapping ─────────────────────────────────────── */}
        <Divider label="Simulation Mapping" />

        <Section label="Simulate As">
          <Select value={simRole} onChange={setSimRole} options={simRoleOptions} />
          <p style={{ fontSize: 10.5, color: '#64748B', fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>
            Template runtime behavior is preconfigured as {simRoleOptions.find(o => o.value === simRole)?.label ?? simRole}.
          </p>
        </Section>

        {/* ── Scaling ───────────────────────────────────────────────── */}
        <Divider label="Scaling & Distribution" />

        <Section label="Replicas / Instances">
          <Counter value={replicas} onChange={setReplicas} min={1} max={32} />
        </Section>

        <Section label="Node Capacity (RPS)">
          <Counter value={capacityRps} onChange={setCapacityRps} min={100} max={1000000} step={1000} format={v => v >= 1000 ? `${(v/1000).toFixed(1)}K` : String(v)} />
        </Section>

        {/* ── Consistency & HA ──────────────────────────────────────── */}
        <Divider label="Consistency & High Availability" />

        <Section label="Enable Replication">
          <Toggle value={enableReplication} onChange={setEnableReplication} />
        </Section>

        <Section label="Availability Target">
          <Select value={availTarget} onChange={setAvailTarget} options={AVAILABILITY_OPTIONS} />
        </Section>

        {/* ── Workload Policy ───────────────────────────────────────── */}
        <Divider label="Workload Policy" />
        <p style={{ fontSize: 10.5, color: '#64748B', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 8 }}>
          Choose the source of truth first, then pick one or more override profiles when needed.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
          {WORKLOAD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setWorkloadPolicy(opt.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 6, border: 'none',
                background: workloadPolicy === opt.value ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                outline: workloadPolicy === opt.value ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                color: workloadPolicy === opt.value ? '#818CF8' : '#94A3B8',
                fontSize: 11.5, fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.1s',
              }}
            >
              {workloadPolicy === opt.value && <span style={{ fontSize: 10, color: '#6366F1' }}>✓</span>}
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", color: '#64748B' }}>
            Selected summary: {WORKLOAD_OPTIONS.find(o => o.value === workloadPolicy)?.label ?? workloadPolicy}
          </span>
        </div>

        {/* ── Your Overrides ────────────────────────────────────────── */}
        <Divider label="Your Overrides" />

        <Section label="Max RPS (Throttle)">
          <Counter value={maxRpsThrottle} onChange={setMaxRpsThrottle} min={0} max={1000000} step={1000} format={v => String(v)} />
        </Section>

        <Section label="Latency Override (ms)">
          <Counter value={latencyOverride} onChange={setLatencyOverride} min={0} max={30000} step={10} />
        </Section>

        <Section label="Error Rate Override (%)">
          <Counter value={errorRateOverride} onChange={setErrorRateOverride} min={0} max={100} step={1} />
        </Section>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={save}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 0', borderRadius: 7, border: 'none',
            background: saved ? 'rgba(34,197,94,0.15)' : `${color}CC`,
            color: saved ? '#22C55E' : 'white',
            outline: saved ? '1px solid rgba(34,197,94,0.3)' : 'none',
            fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <Save size={13} />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
        <button
          onClick={deleteNode}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: '9px 14px', borderRadius: 7, border: 'none',
            background: 'rgba(239,68,68,0.12)',
            outline: '1px solid rgba(239,68,68,0.3)',
            color: '#EF4444', fontSize: 13, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 6 }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
      <span style={{ fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

function Btn({ icon, onClick, danger, title }: { icon: React.ReactNode; onClick: () => void; danger?: boolean; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: 6,
        background: 'transparent', border: '1px solid transparent',
        color: danger ? '#EF4444' : '#64748B', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.12s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)';
        e.currentTarget.style.borderColor = danger ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)';
        if (!danger) e.currentTarget.style.color = '#94A3B8';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.color = danger ? '#EF4444' : '#64748B';
      }}
    >
      {icon}
    </button>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '7px 28px 7px 10px',
          fontSize: 12.5, borderRadius: 6,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--text)', fontFamily: "'DM Sans', sans-serif",
          outline: 'none', appearance: 'none', cursor: 'pointer',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none', fontSize: 10 }}>▾</span>
    </div>
  );
}

function Counter({ value, onChange, min, max, step = 1, format }: {
  value: number; onChange: (v: number) => void; min: number; max: number; step?: number; format?: (v: number) => string;
}) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button onClick={dec} style={counterBtnStyle}>−</button>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text)' }}>
        {format ? format(value) : value}
      </div>
      <button onClick={inc} style={counterBtnStyle}>+</button>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: value ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)',
        border: value ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.12)',
        cursor: 'pointer', transition: 'all 0.2s', position: 'relative', padding: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: value ? 20 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: value ? '#818CF8' : '#64748B',
        transition: 'left 0.2s, background 0.2s',
      }} />
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
};

const counterBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6, border: 'none',
  background: 'rgba(255,255,255,0.06)', color: '#94A3B8',
  fontSize: 16, fontWeight: 600, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'background 0.1s',
};
