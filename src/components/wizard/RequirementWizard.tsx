import { useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
type SystemType =
  | 'web_app' | 'mobile_backend' | 'data_pipeline'
  | 'realtime_system' | 'ml_platform' | 'iot_system'
  | 'ecommerce' | 'messaging_system';

interface WizardData {
  systemType?: SystemType;
  description?: string;
  scale?: { dau?: string; rps?: number; storage?: string };
  priorities?: string[];
  availability?: string;
  budget?: string;
  cloudProvider?: string;
  compliance?: string[];
}

interface WizardProps {
  onComplete: (diagram: { nodes: any[]; edges: any[] }, data: WizardData) => void;
  onSkip: () => void;
}

const TOTAL_STEPS = 4;

// ── Helper: section label ─────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, color: 'var(--text-dim)', marginBottom: 8,
      fontFamily: "'IBM Plex Mono', monospace",
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {children}
    </div>
  );
}

// ── Pill button ───────────────────────────────────────────────────────────────
function Pill({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? '#7C3AED' : 'var(--card-bg)',
        border: `1px solid ${active ? '#7C3AED' : 'var(--border)'}`,
        color: active ? 'white' : 'var(--text-dim)',
        borderRadius: 6, padding: '5px 12px',
        cursor: 'pointer', fontSize: 12,
        fontFamily: "'DM Sans', sans-serif",
        transition: 'all 0.12s',
      }}
    >
      {children}
    </button>
  );
}

// ── Step 1: System type ───────────────────────────────────────────────────────
function WizardStep1({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  const types: { id: SystemType; icon: string; label: string; desc: string }[] = [
    { id: 'web_app',          icon: '🌐', label: 'Web Application',  desc: 'Full-stack web app with API backend' },
    { id: 'mobile_backend',   icon: '📱', label: 'Mobile Backend',   desc: 'API backend serving iOS/Android apps' },
    { id: 'data_pipeline',    icon: '🔄', label: 'Data Pipeline',    desc: 'ETL, stream processing, analytics' },
    { id: 'realtime_system',  icon: '⚡', label: 'Real-time System', desc: 'Chat, gaming, live updates, WebSockets' },
    { id: 'ml_platform',      icon: '🤖', label: 'ML Platform',      desc: 'Training, inference, feature store' },
    { id: 'iot_system',       icon: '📡', label: 'IoT System',       desc: 'Device management, telemetry, edge' },
    { id: 'ecommerce',        icon: '🛒', label: 'E-Commerce',       desc: 'Products, cart, checkout, payments' },
    { id: 'messaging_system', icon: '💬', label: 'Messaging System', desc: 'Chat, notifications, email service' },
  ];

  return (
    <div>
      <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600, margin: '0 0 16px', fontFamily: "'DM Sans', sans-serif" }}>
        What are you building?
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {types.map(t => (
          <button
            key={t.id}
            onClick={() => onChange({ systemType: t.id })}
            style={{
              background: data.systemType === t.id ? 'rgba(124,58,237,0.15)' : 'var(--card-bg)',
              border: `1px solid ${data.systemType === t.id ? '#7C3AED' : 'var(--border)'}`,
              borderRadius: 10, padding: '11px 14px',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 4 }}>{t.icon}</div>
            <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{t.label}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 11, marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{t.desc}</div>
          </button>
        ))}
      </div>
      <textarea
        placeholder="Or describe your system in plain English… (optional)"
        value={data.description ?? ''}
        onChange={e => onChange({ description: e.target.value })}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 8,
          background: 'var(--bg)', border: '1px solid var(--border)',
          color: 'var(--text)', fontSize: 13, resize: 'vertical',
          minHeight: 72, boxSizing: 'border-box', outline: 'none',
          fontFamily: "'DM Sans', sans-serif",
          transition: 'border-color 0.15s',
        }}
        onFocus={e => (e.target.style.borderColor = 'rgba(124,58,237,0.5)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      />
    </div>
  );
}

// ── Step 2: Scale ─────────────────────────────────────────────────────────────
function WizardStep2({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  const dauOptions = ['< 1K', '1K–100K', '100K–1M', '1M–100M', '100M+'];
  const dauDescs   = ['Startup/MVP', 'Growing product', 'Scale-up phase', 'Large scale', 'Hyper scale'];
  const scale = data.scale ?? {};

  return (
    <div>
      <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600, margin: '0 0 16px', fontFamily: "'DM Sans', sans-serif" }}>
        Expected scale
      </p>

      <div style={{ marginBottom: 20 }}>
        <Label>Daily Active Users (DAU)</Label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {dauOptions.map((opt, i) => (
            <Pill key={opt} active={scale.dau === opt} onClick={() => onChange({ scale: { ...scale, dau: opt } })}>
              <span title={dauDescs[i]}>{opt}</span>
            </Pill>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <Label>Peak Requests/Second</Label>
          <input
            type="number"
            placeholder="e.g. 10000"
            value={scale.rps ?? ''}
            onChange={e => onChange({ scale: { ...scale, rps: parseInt(e.target.value) || undefined } })}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 6,
              background: 'var(--bg)', border: '1px solid var(--border)',
              color: 'var(--text)', fontSize: 13, boxSizing: 'border-box', outline: 'none',
            }}
          />
        </div>
        <div>
          <Label>Data Storage Needed</Label>
          <input
            placeholder="e.g. 10TB, 500GB"
            value={scale.storage ?? ''}
            onChange={e => onChange({ scale: { ...scale, storage: e.target.value } })}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 6,
              background: 'var(--bg)', border: '1px solid var(--border)',
              color: 'var(--text)', fontSize: 13, boxSizing: 'border-box', outline: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Step 3: NFRs ──────────────────────────────────────────────────────────────
function WizardStep3({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  const priorities = [
    { id: 'availability', icon: '🟢', label: 'Availability',  desc: 'System stays up during failures' },
    { id: 'consistency',  icon: '🔵', label: 'Consistency',   desc: 'All users see the same data' },
    { id: 'low_latency',  icon: '⚡', label: 'Low Latency',   desc: 'Responses under 100ms' },
    { id: 'throughput',   icon: '📈', label: 'Throughput',    desc: 'Handle millions of requests' },
    { id: 'durability',   icon: '💾', label: 'Durability',    desc: 'No data loss ever' },
    { id: 'security',     icon: '🔒', label: 'Security',      desc: 'Auth, encryption, compliance' },
  ];

  const availOpts  = ['99%', '99.9%', '99.99%', '99.999%'];
  const availDescs = ['~3.6 days/yr', '~8.7 hrs/yr', '~52 min/yr', '~5 min/yr'];
  const selected   = data.priorities ?? [];

  return (
    <div>
      <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600, margin: '0 0 16px', fontFamily: "'DM Sans', sans-serif" }}>
        What matters most?
      </p>

      <div style={{ marginBottom: 20 }}>
        <Label>Top priorities (all that apply)</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {priorities.map(p => {
            const on = selected.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onChange({
                  priorities: on ? selected.filter(x => x !== p.id) : [...selected, p.id],
                })}
                style={{
                  background: on ? 'rgba(124,58,237,0.15)' : 'var(--card-bg)',
                  border: `1px solid ${on ? '#7C3AED' : 'var(--border)'}`,
                  borderRadius: 8, padding: '9px 12px', cursor: 'pointer',
                  textAlign: 'left', display: 'flex', gap: 10, alignItems: 'center',
                  transition: 'all 0.12s',
                }}
              >
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <div>
                  <div style={{ color: 'var(--text)', fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{p.label}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>{p.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Availability target</Label>
        <div style={{ display: 'flex', gap: 6 }}>
          {availOpts.map((opt, i) => (
            <Pill key={opt} active={data.availability === opt} onClick={() => onChange({ availability: opt })}>
              <span title={availDescs[i]}>{opt}</span>
            </Pill>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Constraints ───────────────────────────────────────────────────────
function WizardStep4({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  const clouds = [
    { id: 'aws',   icon: '🟠', label: 'AWS',            desc: 'Most mature, widest catalog' },
    { id: 'gcp',   icon: '🔵', label: 'GCP',            desc: 'Best for ML/AI workloads' },
    { id: 'azure', icon: '💙', label: 'Azure',          desc: 'Best for enterprise/.NET' },
    { id: 'none',  icon: '⚪', label: 'No preference',  desc: 'Use generic components' },
  ];

  const budgets = [
    { id: 'minimal',    label: '💰 Minimal',      desc: 'Open source first, minimize cloud spend' },
    { id: 'moderate',   label: '💰💰 Moderate',    desc: 'Managed services where it makes sense' },
    { id: 'enterprise', label: '💰💰💰 Enterprise', desc: 'Best tools, no cost constraint' },
  ];

  const complianceOpts = ['GDPR', 'HIPAA', 'SOC2', 'PCI-DSS', 'ISO 27001'];
  const selectedCompliance = data.compliance ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ color: 'var(--text)', fontSize: 14, fontWeight: 600, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
        Any constraints?
      </p>

      {/* Cloud */}
      <div>
        <Label>Cloud provider</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {clouds.map(c => (
            <button
              key={c.id}
              onClick={() => onChange({ cloudProvider: c.id })}
              style={{
                background: data.cloudProvider === c.id ? 'rgba(124,58,237,0.15)' : 'var(--card-bg)',
                border: `1px solid ${data.cloudProvider === c.id ? '#7C3AED' : 'var(--border)'}`,
                borderRadius: 8, padding: '10px 12px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.12s',
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 2 }}>{c.icon}</div>
              <div style={{ color: 'var(--text)', fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{c.label}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <Label>Budget tier</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {budgets.map(b => (
            <button
              key={b.id}
              onClick={() => onChange({ budget: b.id })}
              style={{
                background: data.budget === b.id ? 'rgba(124,58,237,0.15)' : 'var(--card-bg)',
                border: `1px solid ${data.budget === b.id ? '#7C3AED' : 'var(--border)'}`,
                borderRadius: 8, padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.12s',
              }}
            >
              <span style={{ color: 'var(--text)', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{b.label}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: 11, marginLeft: 8, fontFamily: "'DM Sans', sans-serif" }}>{b.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Compliance */}
      <div>
        <Label>Compliance (optional)</Label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {complianceOpts.map(c => {
            const on = selectedCompliance.includes(c);
            return (
              <Pill
                key={c}
                active={on}
                onClick={() => onChange({
                  compliance: on ? selectedCompliance.filter(x => x !== c) : [...selectedCompliance, c],
                })}
              >
                {c}
              </Pill>
            );
          })}
          <Pill active={selectedCompliance.length === 0} onClick={() => onChange({ compliance: [] })}>
            None
          </Pill>
        </div>
      </div>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────
export function RequirementWizard({ onComplete, onSkip }: WizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({});
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (d: Partial<WizardData>) => setData(prev => ({ ...prev, ...d }));

  const next = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else handleComplete();
  };

  const handleComplete = async () => {
    setGenerating(true);
    setError(null);
    try {
      const token = localStorage.getItem('techsim_token');
      const groqKey = localStorage.getItem('groq_api_key') ?? '';
      const geminiKey = localStorage.getItem('gemini_api_key') ?? '';
      const res = await fetch('http://localhost:5000/api/ai/wizard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(groqKey ? { 'X-Groq-API-Key': groqKey } : {}),
          ...(geminiKey ? { 'X-Gemini-API-Key': geminiKey } : {}),
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Error ${res.status}`);
      }
      const diagram = await res.json() as { nodes: any[]; edges: any[] };
      onComplete(diagram, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--panel-bg)',
        border: '1px solid var(--border)',
        borderRadius: 16, width: 560, maxHeight: '87vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{ padding: '22px 28px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{
                margin: 0, color: 'var(--text)', fontSize: 18, fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em',
              }}>
                🏗️ New Architecture
              </h2>
              <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                Tell us what you're building — we'll generate a starter architecture
              </p>
            </div>
            <button
              onClick={onSkip}
              style={{
                background: 'transparent', border: 'none',
                color: 'var(--text-dim)', cursor: 'pointer', fontSize: 13,
                fontFamily: "'DM Sans', sans-serif", padding: '4px 8px',
                borderRadius: 6, transition: 'color 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
            >
              Skip →
            </button>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', gap: 4, paddingBottom: 16 }}>
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: s <= step ? '#7C3AED' : 'var(--border)',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div style={{ padding: '22px 28px', flex: 1, overflowY: 'auto' }}>
          {step === 1 && <WizardStep1 data={data} onChange={patch} />}
          {step === 2 && <WizardStep2 data={data} onChange={patch} />}
          {step === 3 && <WizardStep3 data={data} onChange={patch} />}
          {step === 4 && <WizardStep4 data={data} onChange={patch} />}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            margin: '0 28px', padding: '9px 12px', borderRadius: 7,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            fontSize: 12, color: '#FCA5A5', fontFamily: "'IBM Plex Mono', monospace",
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '16px 28px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-dim)', borderRadius: 8,
              padding: '8px 20px', cursor: step === 1 ? 'not-allowed' : 'pointer',
              opacity: step === 1 ? 0.4 : 1, fontSize: 13,
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.12s',
            }}
          >
            ← Back
          </button>

          <span style={{ color: 'var(--text-muted)', fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace" }}>
            Step {step} of {TOTAL_STEPS}
          </span>

          <button
            onClick={next}
            disabled={generating}
            style={{
              background: generating ? 'rgba(124,58,237,0.4)' : '#7C3AED',
              color: 'white', border: 'none',
              borderRadius: 8, padding: '8px 20px',
              cursor: generating ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: generating ? 'none' : '0 0 14px rgba(124,58,237,0.35)',
              transition: 'all 0.15s',
            }}
          >
            {step === TOTAL_STEPS
              ? generating
                ? <>⏳ Generating…</>
                : <>✨ Generate Architecture</>
              : <>Next →</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
