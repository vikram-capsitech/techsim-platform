import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';

export interface NodeMetricSummary {
  id: string;
  name: string;
  avgLoad: number;
  peakLoad: number;
  errorRate: number;
  finalStatus: string;
}

export interface ChaosEvent {
  id: string;
  type: string;
  targetName: string;
  timeSeconds: number;
  recovered: boolean;
  recoveryTime: number;
  impactDescription: string;
}

export interface SimulationReportData {
  architectureName: string;
  duration: number;
  peakRPS: number;
  avgP99: number;
  totalErrors: number;
  bottlenecks: string[];
  nodeMetrics: NodeMetricSummary[];
  chaosEvents: ChaosEvent[];
}

interface SimulationReportProps {
  data: SimulationReportData;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

export function SimulationReport({ data, onClose }: SimulationReportProps) {
  const [report,  setReport]  = useState('');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    generateReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateReport = async () => {
    try {
      const token = localStorage.getItem('techsim_token');
      const groqKey = localStorage.getItem('groq_api_key') ?? '';
      const geminiKey = localStorage.getItem('gemini_api_key') ?? '';
      const res = await fetch('http://localhost:5000/api/ai/simulation-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(groqKey ? { 'X-Groq-API-Key': groqKey } : {}),
          ...(geminiKey ? { 'X-Gemini-API-Key': geminiKey } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('AI service unavailable');
      const result = await res.json();
      setReport(result.report ?? '');
    } catch {
      setError('Could not generate AI report. Showing raw metrics below.');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    window.print();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 860,
          maxHeight: '90vh',
          background: '#0D0D10',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 16,
          boxShadow: '0 32px 100px rgba(0,0,0,0.9)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'DM Sans', sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.02em' }}>
              📊 Architecture Simulation Report
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B', fontFamily: "'IBM Plex Mono', monospace" }}>
              {data.architectureName} · {formatDuration(data.duration)} simulated
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ExportBtn onClick={exportPDF}>📄 PDF</ExportBtn>
            <ExportBtn onClick={exportJSON}>📦 JSON</ExportBtn>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#64748B', cursor: 'pointer', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Quick-stats bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1, background: 'rgba(255,255,255,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <StatCard label="Peak RPS"      value={data.peakRPS.toLocaleString()} color="#06B6D4" />
          <StatCard label="Avg P99"       value={`${data.avgP99}ms`}            color="#A78BFA" />
          <StatCard label="Total Errors"  value={data.totalErrors.toLocaleString()} color={data.totalErrors > 0 ? '#EF4444' : '#22C55E'} />
          <StatCard label="Bottlenecks"   value={String(data.bottlenecks.length)}  color={data.bottlenecks.length > 0 ? '#EAB308' : '#22C55E'} />
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* AI Report */}
          <section style={{ marginBottom: 28 }}>
            <SectionTitle>AI Analysis</SectionTitle>
            {loading ? (
              <LoadingState nodeCount={data.nodeMetrics.length} eventCount={data.chaosEvents.length} />
            ) : error ? (
              <div style={{
                padding: '12px 16px', borderRadius: 8,
                background: 'rgba(239,68,68,0.07)',
                border: '1px solid rgba(239,68,68,0.18)',
                fontSize: 13, color: '#FCA5A5',
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                {error}
              </div>
            ) : (
              <div style={{
                fontSize: 13.5, lineHeight: 1.7, color: '#94A3B8',
              }}>
                <MarkdownReport content={report} />
              </div>
            )}
          </section>

          {/* Component performance table */}
          {data.nodeMetrics.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <SectionTitle>Component Performance</SectionTitle>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Component', 'Avg Load', 'Peak Load', 'Error Rate', 'Status', 'Assessment'].map(h => (
                        <th key={h} style={{
                          padding: '8px 10px', textAlign: 'left',
                          fontSize: 10, fontFamily: "'IBM Plex Mono', monospace",
                          fontWeight: 700, letterSpacing: '0.08em',
                          textTransform: 'uppercase', color: '#475569',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.nodeMetrics.map(node => {
                      const errorPct = node.errorRate * 100;
                      const assessment =
                        node.peakLoad > 90 ? '⚠️ Needs scaling' :
                        errorPct > 5       ? '🔴 High errors'   :
                        node.peakLoad > 70 ? '🟡 Watch closely' : '✅ Healthy';

                      return (
                        <tr key={node.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '9px 10px', color: '#C4B5FD', fontWeight: 500 }}>{node.name}</td>
                          <td style={{ padding: '9px 10px', color: '#94A3B8' }}>{node.avgLoad}%</td>
                          <td style={{ padding: '9px 10px', color: node.peakLoad > 80 ? '#EAB308' : '#94A3B8' }}>
                            {node.peakLoad}%
                          </td>
                          <td style={{ padding: '9px 10px', color: errorPct > 1 ? '#EF4444' : '#94A3B8' }}>
                            {errorPct.toFixed(2)}%
                          </td>
                          <td style={{ padding: '9px 10px' }}>
                            <StatusBadge status={node.finalStatus} />
                          </td>
                          <td style={{ padding: '9px 10px', fontSize: 12, color: '#64748B' }}>{assessment}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Chaos events log */}
          {data.chaosEvents.length > 0 && (
            <section>
              <SectionTitle>Chaos Events & Recovery</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.chaosEvents.map(event => (
                  <div
                    key={event.id}
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(239,68,68,0.05)',
                      border: '1px solid rgba(239,68,68,0.14)',
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#FCA5A5' }}>
                        💥 {event.type}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748B' }}>→ {event.targetName}</span>
                      <span style={{ fontSize: 11, color: '#475569', fontFamily: "'IBM Plex Mono', monospace", marginLeft: 'auto' }}>
                        t={event.timeSeconds}s
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#64748B' }}>
                      <span>{event.impactDescription}</span>
                      {event.recoveryTime > 0 && <span>Recovery: {event.recoveryTime}s</span>}
                      <span style={{ color: event.recovered ? '#22C55E' : '#EF4444', fontWeight: 600 }}>
                        {event.recovered ? '✅ Recovered' : '❌ Did not recover'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '14px 18px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", color: '#475569', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace",
      fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: '#7C3AED',
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function ExportBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px', borderRadius: 7,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.09)',
        color: '#94A3B8', fontSize: 12,
        fontFamily: "'IBM Plex Mono', monospace",
        cursor: 'pointer', transition: 'all 0.12s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(124,58,237,0.12)';
        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)';
        e.currentTarget.style.color = '#A78BFA';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
        e.currentTarget.style.color = '#94A3B8';
      }}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'healthy'    ? '#22C55E' :
    status === 'degraded'   ? '#EAB308' :
    status === 'overloaded' ? '#EF4444' :
    status === 'down'       ? '#64748B' : '#94A3B8';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 4,
      background: `${color}18`,
      border: `1px solid ${color}40`,
      fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace",
      fontWeight: 600, color,
    }}>
      {status}
    </span>
  );
}

function LoadingState({ nodeCount, eventCount }: { nodeCount: number; eventCount: number }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{
        width: 36, height: 36, margin: '0 auto 16px',
        border: '3px solid rgba(124,58,237,0.2)',
        borderTopColor: '#7C3AED',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{ margin: '0 0 6px', fontSize: 14, color: '#94A3B8' }}>
        Analyzing your architecture…
      </p>
      <p style={{ margin: 0, fontSize: 12, color: '#475569', fontFamily: "'IBM Plex Mono', monospace" }}>
        Reviewing {nodeCount} components · {eventCount} chaos events
      </p>
    </div>
  );
}

function MarkdownReport({ content }: { content: string }) {
  return (
    <Markdown
      components={{
        h2: ({ children }) => (
          <h2 style={{ margin: '20px 0 10px', fontSize: 15, fontWeight: 700, color: '#C4B5FD', letterSpacing: '-0.01em' }}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 style={{ margin: '16px 0 8px', fontSize: 13.5, fontWeight: 600, color: '#A78BFA' }}>
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p style={{ margin: '0 0 12px', fontSize: 13.5, color: '#94A3B8', lineHeight: 1.65 }}>
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul style={{ margin: '0 0 12px', paddingLeft: 18, color: '#94A3B8', fontSize: 13.5, lineHeight: 1.65 }}>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol style={{ margin: '0 0 12px', paddingLeft: 18, color: '#94A3B8', fontSize: 13.5, lineHeight: 1.65 }}>
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li style={{ marginBottom: 5 }}>{children}</li>
        ),
        strong: ({ children }) => (
          <strong style={{ color: '#CBD5E1', fontWeight: 600 }}>{children}</strong>
        ),
        code: ({ children }) => (
          <code style={{
            background: 'rgba(124,58,237,0.12)', borderRadius: 4,
            padding: '1px 5px', fontSize: 12.5,
            fontFamily: "'IBM Plex Mono', monospace", color: '#A78BFA',
          }}>
            {children}
          </code>
        ),
      }}
    >
      {content}
    </Markdown>
  );
}
