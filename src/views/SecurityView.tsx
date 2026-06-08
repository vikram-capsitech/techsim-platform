import { useState } from 'react';
import { AlertTriangle, Terminal, Zap, Database, Eye, Key, Shield, Server } from 'lucide-react';

type AttackStatus = 'idle' | 'running' | 'stopped';

interface Attack {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const ATTACKS: Attack[] = [
  { id: 'ddos',      label: 'DDoS',          icon: <Zap size={15} />,      description: 'SYN flood — saturate ingress bandwidth' },
  { id: 'sqli',      label: 'SQL Injection',  icon: <Database size={15} />, description: 'UNION-based exfiltration on auth endpoints' },
  { id: 'mitm',      label: 'MITM',           icon: <Eye size={15} />,      description: 'ARP spoofing between gateway and host' },
  { id: 'bruteforce',label: 'Brute Force',    icon: <Key size={15} />,      description: 'Credential stuffing from leaked DB' },
  { id: 'ransom',    label: 'Ransomware',     icon: <Shield size={15} />,   description: 'Encrypt-on-write payload delivery' },
  { id: 'dns',       label: 'DNS Poisoning',  icon: <Server size={15} />,   description: 'Cache poisoning via resolver spoofing' },
];

const UNDER_ATTACK_NODES = [
  { id: 'api-gw',   label: 'API GATEWAY', x: 400, y: 160, under: true },
  { id: 'database', label: 'Database',    x: 200, y: 200, under: false },
  { id: 'auth-svc', label: 'Auth-Svc',    x: 580, y: 340, under: false },
];

export function SecurityView() {
  const [attackStates, setAttackStates] = useState<Record<string, AttackStatus>>({ ddos: 'running' });
  const [activeAttack, setActiveAttack] = useState<string | null>('ddos');

  const toggle = (id: string) => {
    setAttackStates((prev) => {
      const next = { ...prev };
      if (prev[id] === 'running') {
        next[id] = 'stopped';
        setActiveAttack(null);
      } else {
        next[id] = 'running';
        setActiveAttack(id);
      }
      return next;
    });
  };

  const isRunning = Object.values(attackStates).some((s) => s === 'running');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Alert banner */}
      {isRunning && (
        <div
          style={{
            height: 40,
            background: 'rgba(239,68,68,0.15)',
            borderBottom: '1px solid rgba(239,68,68,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={14} style={{ color: '#EF4444' }} />
          <span
            style={{
              fontSize: 12,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700,
              color: '#EF4444',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              animation: 'pulse-glow 1.5s ease-in-out infinite',
            }}
          >
            Attack in Progress —{' '}
            {ATTACKS.find((a) => a.id === activeAttack)?.label ?? 'DDoS'}
          </span>
          <AlertTriangle size={14} style={{ color: '#EF4444' }} />
        </div>
      )}

      {/* Info strip */}
      <div
        style={{
          background: 'var(--panel-bg)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '10px 20px',
          gap: 0,
          flexShrink: 0,
        }}
      >
        <InfoCell label="TARGET ENVIRONMENT" value="Cloud-Prod-01" />
        <Divider />
        <InfoCell
          label="THREAT LEVEL"
          value={isRunning ? '✳ CRITICAL' : '● LOW'}
          valueColor={isRunning ? '#EF4444' : '#22C55E'}
        />
        <div style={{ flex: 1 }} />
        <InfoCell
          label="REQ/SEC"
          value={isRunning ? '42.8k' : '12.1k'}
          suffix={isRunning ? '▲ 850%' : undefined}
          suffixColor="#EF4444"
        />
        <Divider />
        <InfoCell
          label="LATENCY"
          value={isRunning ? '450ms' : '18ms'}
          suffix={isRunning ? '▲ 320%' : undefined}
          suffixColor="#EF4444"
        />
      </div>

      {/* Main row */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left panel */}
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
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border-dim)' }}>
            <div
              style={{
                fontSize: 11,
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 700,
                color: '#EF4444',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 2,
              }}
            >
              ⚡ Attack Panel
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
              Execute infrastructure stressors
            </div>
          </div>

          <div style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
            {ATTACKS.map((attack) => {
              const status: AttackStatus = attackStates[attack.id] ?? 'idle';
              const isAct = status === 'running';
              return (
                <div
                  key={attack.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 16px',
                    gap: 10,
                    borderLeft: isAct ? '2px solid #EF4444' : '2px solid transparent',
                    background: isAct ? 'rgba(239,68,68,0.06)' : 'transparent',
                  }}
                >
                  <span style={{ color: isAct ? '#EF4444' : 'var(--text-muted)', display: 'flex' }}>
                    {attack.icon}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 13,
                      fontWeight: 500,
                      color: isAct ? 'var(--text)' : 'var(--text-dim)',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {attack.label}
                  </span>
                  <button
                    onClick={() => toggle(attack.id)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 4,
                      fontSize: 9.5,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      border: `1px solid ${isAct ? '#EF4444' : '#EF444455'}`,
                      background: isAct ? 'rgba(239,68,68,0.18)' : 'transparent',
                      color: '#EF4444',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isAct ? 'RUNNING' : 'LAUNCH'}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid var(--border-dim)' }}>
            <button
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '9px',
                borderRadius: 7,
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
                fontSize: 12.5,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Terminal size={13} />
              Launch Terminal
            </button>
          </div>
        </div>

        {/* Canvas area */}
        <div style={{ flex: 1, position: 'relative', background: 'var(--bg)', overflow: 'hidden' }}>
          {/* Dot grid */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle, #252535 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              opacity: 0.6,
              pointerEvents: 'none',
            }}
          />

          {/* Red scanline effect when attack running */}
          {isRunning && (
            <div
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 0%, rgba(239,68,68,0.03) 50%, transparent 100%)',
                pointerEvents: 'none',
                animation: 'scanline 3s linear infinite',
              }}
            />
          )}

          {/* Nodes */}
          {UNDER_ATTACK_NODES.map((node) => (
            <AttackNode
              key={node.id}
              label={node.label}
              x={node.x}
              y={node.y}
              underAttack={node.under && isRunning}
            />
          ))}

          {/* Diagnostics panel */}
          {activeAttack && (
            <div
              style={{
                position: 'absolute',
                top: 24, right: 24,
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '14px 18px',
                minWidth: 200,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                animation: 'fadeUp 0.2s ease forwards',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 700,
                  color: '#EF4444',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                Diagnostics
              </div>
              {[
                ['Protocol', 'TCP-SYN'],
                ['Sources', '12,401'],
                ['CPU', '98%'],
                ['State', 'Choking'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 7,
                    fontSize: 12,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                  <span
                    style={{
                      color: k === 'CPU' || k === 'State' ? '#EF4444' : 'var(--text)',
                      fontWeight: 600,
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security bottom bar */}
      <div
        style={{
          height: 40,
          background: 'var(--sidebar-bg)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 24,
          flexShrink: 0,
        }}
      >
        <BottomStat label="CPU LOAD" value={isRunning ? '98%' : '12%'} danger={isRunning} />
        <BottomStat label="MEMORY" value={isRunning ? '64%' : '18%'} />
        <BottomStat label="TRAFFIC" value={isRunning ? '1.8GBPS' : '0.2GBPS'} />
        <BottomStat label="LATENCY" value={isRunning ? '450MS' : '18MS'} danger={isRunning} />
      </div>
    </div>
  );
}

function AttackNode({ label, x, y, underAttack }: { label: string; x: number; y: number; underAttack: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        background: underAttack ? 'rgba(30,8,8,0.95)' : 'var(--card-bg)',
        border: `1px solid ${underAttack ? '#EF444488' : 'var(--border)'}`,
        borderRadius: 10,
        padding: underAttack ? '18px 22px' : '12px 16px',
        minWidth: underAttack ? 150 : 100,
        textAlign: 'center',
        boxShadow: underAttack ? '0 0 32px rgba(239,68,68,0.3), 0 4px 20px rgba(0,0,0,0.5)' : '0 2px 12px rgba(0,0,0,0.3)',
        animation: underAttack ? 'attack-pulse 1.5s ease-in-out infinite' : undefined,
      }}
    >
      <div
        style={{
          width: 36, height: 36,
          borderRadius: 8,
          background: underAttack ? 'rgba(239,68,68,0.15)' : 'var(--panel-bg)',
          border: `1px solid ${underAttack ? '#EF444440' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 10px',
          color: underAttack ? '#EF4444' : 'var(--text-muted)',
        }}
      >
        <Server size={16} strokeWidth={1.5} />
      </div>
      <div
        style={{
          fontSize: underAttack ? 13 : 11,
          fontWeight: 700,
          color: underAttack ? '#EF4444' : 'var(--text-dim)',
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: '0.06em',
          marginBottom: underAttack ? 8 : 0,
        }}
      >
        {label}
      </div>
      {underAttack && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.35)',
            borderRadius: 4,
            padding: '3px 8px',
            fontSize: 9,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 700,
            color: '#EF4444',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              width: 5, height: 5,
              borderRadius: '50%',
              background: '#EF4444',
              animation: 'pulse-glow 1s infinite',
            }}
          />
          Under Attack
        </div>
      )}
    </div>
  );
}

function InfoCell({
  label,
  value,
  valueColor,
  suffix,
  suffixColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
  suffix?: string;
  suffixColor?: string;
}) {
  return (
    <div style={{ padding: '0 16px' }}>
      <div
        style={{
          fontSize: 9.5,
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'IBM Plex Mono', monospace",
            color: valueColor ?? 'var(--text)',
          }}
        >
          {value}
        </span>
        {suffix && (
          <span
            style={{
              fontSize: 10,
              fontFamily: "'IBM Plex Mono', monospace",
              color: suffixColor ?? 'var(--text-dim)',
              fontWeight: 600,
            }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />;
}

function BottomStat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          fontSize: 9.5,
          fontFamily: "'IBM Plex Mono', monospace",
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
        }}
      >
        {label}:
      </span>
      <span
        style={{
          fontSize: 12,
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 700,
          color: danger ? '#EF4444' : 'var(--text)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
