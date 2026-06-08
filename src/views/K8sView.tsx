import { Terminal, FileText, Wrench, Shield, ScanLine, Package, RefreshCw } from 'lucide-react';

interface Pod {
  id: string;
  cpu: number;
  mem: number;
  status: 'running' | 'crashloop' | 'pending';
}

interface Service {
  name: string;
  type: 'DEPLOYMENT' | 'STATEFULSET' | 'DAEMONSET';
  color: string;
  pods: Pod[];
}

const SERVICES: Service[] = [
  {
    name: 'frontend-service',
    type: 'DEPLOYMENT',
    color: '#06B6D4',
    pods: [
      { id: 'pod-fe-01', cpu: 42, mem: 68, status: 'running' },
      { id: 'pod-fe-02', cpu: 18, mem: 34, status: 'running' },
    ],
  },
  {
    name: 'auth-service',
    type: 'DEPLOYMENT',
    color: '#7C3AED',
    pods: [
      { id: 'pod-auth-01', cpu: 98, mem: 88, status: 'crashloop' },
      { id: 'pod-auth-02', cpu: 5,  mem: 12, status: 'running' },
    ],
  },
];

const NAV_ITEMS = [
  { id: 'tools',    label: 'Tools',    icon: <Wrench size={15} strokeWidth={1.75} /> },
  { id: 'exploits', label: 'Exploits', icon: <Shield size={15} strokeWidth={1.75} /> },
  { id: 'scanners', label: 'Scanners', icon: <ScanLine size={15} strokeWidth={1.75} /> },
  { id: 'payloads', label: 'Payloads', icon: <Package size={15} strokeWidth={1.75} /> },
  { id: 'logs',     label: 'Logs',     icon: <FileText size={15} strokeWidth={1.75} /> },
];

export function K8sView() {
  const healthyPods = SERVICES.flatMap((s) => s.pods).filter((p) => p.status === 'running').length;
  const totalPods = SERVICES.flatMap((s) => s.pods).length;
  const incidents = SERVICES.flatMap((s) => s.pods).filter((p) => p.status === 'crashloop').length;

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Left sidebar */}
      <div
        style={{
          width: 240,
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Module header */}
        <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border-dim)' }}>
          <div
            style={{
              fontSize: 9.5,
              fontFamily: "'IBM Plex Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              marginBottom: 4,
            }}
          >
            Learning Module
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text)',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '-0.01em',
            }}
          >
            Infrastructure Lab
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item, i) => {
            const isActive = i === 3; // Payloads active
            return (
              <button
                key={item.id}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 16px',
                  background: isActive ? 'var(--card-bg)' : 'none',
                  border: 'none',
                  borderLeft: isActive ? '2px solid var(--accent-bright)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: 13.5,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--text)' : 'var(--text-dim)',
                  transition: 'all 0.12s',
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.color = 'var(--text)'; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-dim)'; } }}
              >
                <span style={{ color: isActive ? 'var(--accent-bright)' : 'var(--text-muted)' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border-dim)' }}>
          <button
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px',
              borderRadius: 8,
              background: 'var(--accent)',
              border: 'none',
              color: 'white',
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 0 14px var(--accent-glow)',
              marginBottom: 6,
            }}
          >
            <Terminal size={14} />
            Launch Terminal
          </button>
          <button
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 12.5,
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
            }}
          >
            <FileText size={13} />
            Docs
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--bg)', position: 'relative' }}>
        {/* Dot grid */}
        <div
          style={{
            position: 'fixed', inset: 0,
            backgroundImage: 'radial-gradient(circle, #252535 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            opacity: 0.4,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Namespace container */}
          <div
            style={{
              border: '1.5px dashed var(--border-bright)',
              borderRadius: 14,
              padding: '16px 20px 20px',
              marginBottom: 20,
              position: 'relative',
            }}
          >
            {/* Namespace label */}
            <div
              style={{
                position: 'absolute',
                top: -14,
                left: 20,
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11.5,
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 500,
                color: 'var(--text-dim)',
              }}
            >
              <RefreshCw size={11} />
              Namespace: production
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
              {SERVICES.map((svc) => (
                <ServiceCard key={svc.name} service={svc} />
              ))}
            </div>
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16 }}>
            <SummaryCard
              label="Healthy Nodes"
              value={`${healthyPods} / ${totalPods}`}
              valueColor="var(--text)"
            />
            <SummaryCard
              label="Incidents"
              value={String(incidents)}
              valueColor={incidents > 0 ? '#EF4444' : 'var(--status-healthy)'}
            />
            <TrafficCard />
          </div>
        </div>
      </div>

      {/* K8s bottom bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 240, right: 0,
          height: 40,
          background: 'var(--sidebar-bg)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 20,
          zIndex: 10,
        }}
      >
        {[
          { icon: '📊', label: 'CPU Load', active: false },
          { icon: '💾', label: 'Memory',   active: false },
          { icon: '⚡', label: 'Traffic',  active: true },
          { icon: '⏱',  label: 'Latency',  active: false },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11.5,
              fontFamily: "'DM Sans', sans-serif",
              color: item.active ? '#06B6D4' : 'var(--text-muted)',
              fontWeight: item.active ? 500 : 400,
            }}
          >
            <span style={{ fontSize: 12 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: `1px solid ${service.color}30`,
        borderRadius: 10,
        padding: '14px 16px',
        minWidth: 260,
        flex: 1,
      }}
    >
      {/* Service header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 18, height: 18,
              borderRadius: 4,
              background: `${service.color}20`,
              border: `1px solid ${service.color}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ width: 8, height: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ background: service.color, borderRadius: 0.5 }} />
              ))}
            </div>
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {service.name}
          </span>
        </div>
        <span
          style={{
            fontSize: 9,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: service.color,
            background: `${service.color}12`,
            border: `1px solid ${service.color}30`,
            borderRadius: 4,
            padding: '2px 7px',
          }}
        >
          {service.type}
        </span>
      </div>

      {/* Pods */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {service.pods.map((pod) => (
          <PodCard key={pod.id} pod={pod} />
        ))}
      </div>
    </div>
  );
}

function PodCard({ pod }: { pod: Pod }) {
  const isCrash = pod.status === 'crashloop';
  const statusColor = isCrash ? '#EF4444' : '#22C55E';

  return (
    <div
      style={{
        background: isCrash ? 'rgba(239,68,68,0.08)' : 'var(--panel-bg)',
        border: `1px solid ${isCrash ? '#EF444440' : 'var(--border)'}`,
        borderRadius: 7,
        padding: '10px 12px',
        flex: 1,
        minWidth: 110,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            color: isCrash ? '#EF4444' : 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <span
            style={{
              width: 5, height: 5,
              borderRadius: '50%',
              background: statusColor,
              boxShadow: `0 0 4px ${statusColor}`,
              flexShrink: 0,
            }}
          />
          {pod.id}
        </span>
      </div>

      {isCrash ? (
        <div
          style={{
            display: 'inline-block',
            fontSize: 8.5,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: '#EF4444',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 3,
            padding: '2px 5px',
          }}
        >
          CRASHLOOPBACKOFF
        </div>
      ) : (
        <>
          <ProgressBar label="CPU" value={pod.cpu} />
          <ProgressBar label="MEM" value={pod.mem} />
        </>
      )}
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  const color = value > 80 ? '#EF4444' : value > 60 ? '#EAB308' : '#06B6D4';
  return (
    <div style={{ marginBottom: 5 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 9.5,
          fontFamily: "'IBM Plex Mono', monospace",
          color: 'var(--text-muted)',
          marginBottom: 3,
        }}
      >
        <span>{label}</span>
        <span style={{ color: 'var(--text-dim)' }}>{value}%</span>
      </div>
      <div
        style={{
          height: 3,
          background: 'var(--border)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            background: color,
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '16px 20px',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontFamily: "'IBM Plex Mono', monospace",
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: valueColor,
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function TrafficCard() {
  const bars = [4, 6, 8, 5, 7, 9, 11, 10];
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            fontFamily: "'IBM Plex Mono', monospace",
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            marginBottom: 8,
          }}
        >
          Traffic Flow
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--text)',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '-0.02em',
          }}
        >
          Stable
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: "'IBM Plex Mono', monospace" }}>
          at 1.2k req/s
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: `${(h / 11) * 100}%`,
              borderRadius: 3,
              background: '#7C3AED',
              opacity: 0.4 + (i / bars.length) * 0.6,
            }}
          />
        ))}
      </div>
    </div>
  );
}
