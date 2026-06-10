import { useEffect, useState } from 'react';
import { getChaosExplanation } from '../data/content/index';
import { aiApi } from '../api/client';

interface ChaosExplainPanelProps {
  chaosId: string;
  nodeName?: string;
  nodeType?: string;
  nodeCount?: number;
  onClose: () => void;
}

export function ChaosExplainPanel({ chaosId, nodeName, nodeType, nodeCount = 0, onClose }: ChaosExplainPanelProps) {
  const explanation = getChaosExplanation(chaosId);
  const [visible, setVisible] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Fetch AI-enhanced explanation in background
  useEffect(() => {
    if (!nodeName || !nodeType) return;
    setAiLoading(true);
    aiApi.chaosExplain({
      chaosType: chaosId,
      nodeName,
      nodeType,
      architectureContext: { totalNodes: nodeCount, connectedNodes: [] },
    })
      .then(data => setAiExplanation(data?.explanation ?? null))
      .catch(() => { /* static explanation already shown */ })
      .finally(() => setAiLoading(false));
  }, [chaosId, nodeName, nodeType]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  const steps = explanation?.whatHappens
    ? explanation.whatHappens
        .split(/\d+\.\s+/)
        .map(s => s.trim())
        .filter(Boolean)
    : [];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 95,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0, right: 0,
          width: 460,
          height: '100vh',
          background: '#0C0A0A',
          borderLeft: '1px solid rgba(239,68,68,0.35)',
          boxShadow: '-8px 0 48px rgba(0,0,0,0.7)',
          zIndex: 96,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'DM Sans', sans-serif",
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px 14px',
          borderBottom: '1px solid rgba(239,68,68,0.18)',
          flexShrink: 0,
          background: 'rgba(239,68,68,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#EF4444', marginBottom: 4,
              }}>
                What just happened?
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                {explanation?.name ?? chaosId}
              </div>
              {nodeName && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  on <span style={{ color: '#EF4444', fontWeight: 500 }}>{nodeName}</span>
                  {nodeType && <span style={{ color: 'var(--text-secondary)', marginLeft: 4 }}>({nodeType})</span>}
                </div>
              )}
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#EF4444', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
          {!explanation ? (
            <NoExplanation chaosId={chaosId} />
          ) : (
            <>
              {/* AI Context (shown when loaded) */}
              {(aiLoading || aiExplanation) && (
                <div style={{
                  marginBottom: 18,
                  padding: '12px 14px',
                  background: 'rgba(124,58,237,0.06)',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: 9,
                }}>
                  <div style={{
                    fontSize: 10, fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 700, letterSpacing: '0.08em', color: '#7C3AED',
                    marginBottom: 6, textTransform: 'uppercase',
                  }}>
                    🤖 AI Context
                  </div>
                  {aiLoading ? (
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          width: 5, height: 5, borderRadius: '50%', background: '#7C3AED',
                          animation: `dot-bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                        }} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: '#DDD6FE', lineHeight: 1.6 }}>
                      {aiExplanation}
                    </div>
                  )}
                </div>
              )}

              {/* Step by step */}
              {steps.length > 0 && (
                <>
                  <SectionHeading color="#EF4444">What happens — step by step</SectionHeading>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {steps.map((step, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                        background: 'rgba(239,68,68,0.04)',
                        border: '1px solid rgba(239,68,68,0.12)',
                        borderRadius: 8, padding: '9px 12px',
                      }}>
                        <span style={{
                          flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
                          background: 'rgba(239,68,68,0.15)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700, color: '#EF4444',
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: 13, color: '#F3F4F6', lineHeight: 1.55 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* User impact */}
              <SectionHeading color="#F97316">User impact</SectionHeading>
              <div style={{
                background: 'rgba(249,115,22,0.08)',
                border: '1px solid rgba(249,115,22,0.25)',
                borderRadius: 9, padding: '12px 14px', marginBottom: 20,
                fontSize: 13.5, color: '#FED7AA', lineHeight: 1.6,
              }}>
                {explanation.userImpact}
              </div>

              {/* Cascade effects */}
              {explanation.cascadeEffects?.length > 0 && (
                <>
                  <SectionHeading color="#EAB308">Cascade effects</SectionHeading>
                  <ul style={{ margin: '0 0 20px', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {explanation.cascadeEffects.map((e, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13 }}>
                        <span style={{ color: '#EAB308', flexShrink: 0, marginTop: 3, fontSize: 9 }}>◆</span>
                        <span style={{ color: '#E5E7EB', lineHeight: 1.55 }}>{e}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Recovery steps */}
              {explanation.recoverySteps?.length > 0 && (
                <>
                  <SectionHeading color="#22C55E">Recovery steps</SectionHeading>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
                    {explanation.recoverySteps.map((s, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                        background: 'rgba(34,197,94,0.05)',
                        border: '1px solid rgba(34,197,94,0.15)',
                        borderRadius: 7, padding: '8px 12px',
                      }}>
                        <span style={{ color: '#22C55E', flexShrink: 0, fontSize: 13 }}>✓</span>
                        <span style={{ fontSize: 13, color: '#D1FAE5', lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Interview angle */}
              {explanation.interviewAngle && (
                <>
                  <SectionHeading color="#A78BFA">Interview angle</SectionHeading>
                  <div style={{
                    background: 'rgba(124,58,237,0.07)',
                    border: '1px solid rgba(124,58,237,0.25)',
                    borderRadius: 10, padding: '14px 16px',
                  }}>
                    <div style={{
                      fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: 700, letterSpacing: '0.08em', color: '#7C3AED',
                      marginBottom: 8, textTransform: 'uppercase',
                    }}>
                      In an interview, discuss…
                    </div>
                    <div style={{ fontSize: 13.5, color: '#DDD6FE', lineHeight: 1.65 }}>
                      {explanation.interviewAngle}
                    </div>
                  </div>
                </>
              )}

              {/* Real world example */}
              {explanation.realWorldExample && (
                <>
                  <SectionHeading color="#06B6D4">Real-world example</SectionHeading>
                  <div style={{
                    background: 'rgba(6,182,212,0.05)',
                    border: '1px solid rgba(6,182,212,0.18)',
                    borderRadius: 9, padding: '12px 14px',
                    fontSize: 13, color: '#BAE6FD', lineHeight: 1.6,
                  }}>
                    {explanation.realWorldExample}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40%            { transform: scale(1.0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

function SectionHeading({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{
      fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace",
      fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
      color, marginBottom: 10, marginTop: 4,
    }}>
      {children}
    </div>
  );
}

function NoExplanation({ chaosId }: { chaosId: string }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>💥</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
        Chaos injected!
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: "'IBM Plex Mono', monospace" }}>
        Detailed explanation for <span style={{ color: '#A78BFA' }}>{chaosId}</span> coming soon.
      </div>
    </div>
  );
}
