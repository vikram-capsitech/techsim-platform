import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider, type Node, type Edge } from '@xyflow/react';
import { CHALLENGES } from '../data/challenges';
import { Canvas, type CanvasHandle } from '../components/Canvas';
import { Sidebar } from '../components/Sidebar';
import { ArchitectureScoreCard } from '../components/ArchitectureScoreCard';
import { useSimulation } from '../simulation/useSimulation';
import { useTheme } from '../context/ThemeContext';
import { aiApi } from '../api/client';
import apiClient from '../api/client';

interface AIFeedback {
  verdict: string;
  summary: string;
  strengths?: string[];
  improvements?: string[];
  score?: number;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy:   '#22C55E',
  Medium: '#F59E0B',
  Hard:   '#EF4444',
};

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function InterviewSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const challenge = CHALLENGES.find(c => c.id === id);
  const { resolvedTheme } = useTheme();

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hintsUsed, setHintsUsed] = useState<number[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [activeTab, setActiveTab] = useState<'reqs' | 'hints' | 'chat'>('reqs');
  const [topology, setTopology] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const [showScore, setShowScore] = useState(false);
  const [aiScore, setAiScore] = useState<AIFeedback | null>(null);
  const [aiScoreLoading, setAiScoreLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMsgs, setChatMsgs] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);

  const canvasRef = useRef<CanvasHandle | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { nodeStates, edgeStates } = useSimulation(topology.nodes, topology.edges, resolvedTheme);

  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        if (challenge && prev >= challenge.timeLimit * 60) {
          setFinished(true);
          clearInterval(timerRef.current!);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, finished, challenge]);

  const handleTopologyChange = useCallback((nodes: Node[], edges: Edge[]) => {
    setTopology({ nodes, edges });
  }, []);

  const useHint = (i: number) => {
    if (hintsUsed.includes(i)) return;
    setHintsUsed(prev => [...prev, i]);
  };

  const submitChallenge = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFinished(true);
    setAiScoreLoading(true);
    try {
      const res = await apiClient.post<AIFeedback>('/api/ai/interview-feedback', {
        challengeId: challenge?.id,
        nodes: topology.nodes,
        edges: topology.edges,
        timeUsed: challenge ? Math.round((challenge.timeLimit * 60 - timeLeft) / 60) : 0,
        hintsUsed: hintsUsed.length,
      });
      setAiScore(res.data);
    } catch {
      // local ArchitectureScoreCard shown as fallback
    } finally {
      setAiScoreLoading(false);
    }
    setShowScore(true);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading || !challenge) return;
    const userText = chatInput.trim();
    setChatInput('');
    setChatMsgs(prev => [...prev, { role: 'user', text: userText }]);
    setChatLoading(true);

    try {
      const nodeTypes = topology.nodes.map(n => (n.data as { nodeTypeId?: string }).nodeTypeId ?? '');
      const data = await aiApi.chat({
        message: userText,
        architectureContext: {
          nodeCount: topology.nodes.length,
          components: topology.nodes.map(n => ({ name: (n.data as { label?: string }).label ?? 'node' })),
          hasLoadBalancer: nodeTypes.includes('load-balancer'),
          hasCache: nodeTypes.includes('redis'),
          hasQueue: nodeTypes.includes('kafka') || nodeTypes.includes('rabbitmq') || nodeTypes.includes('sqs') || nodeTypes.includes('event-bus'),
          hasMonitoring: nodeTypes.includes('prometheus') || nodeTypes.includes('grafana') || nodeTypes.includes('datadog'),
        },
        conversationHistory: chatMsgs.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
      });
      setChatMsgs(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (err) {
      setChatMsgs(prev => [...prev, { role: 'ai', text: `Error: ${(err as Error).message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!challenge) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🤔</div>
          <div style={{ fontSize: 16, color: 'var(--text)', margin: '12px 0 16px', fontFamily: "'DM Sans', sans-serif" }}>Challenge not found</div>
          <button onClick={() => navigate('/interview')} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
            Back to Challenges
          </button>
        </div>
      </div>
    );
  }

  const diffColor = DIFFICULTY_COLORS[challenge.difficulty];
  const timeLeft = Math.max(0, challenge.timeLimit * 60 - elapsed);
  const timeWarning = timeLeft < 300;
  const timeUp = timeLeft <= 0;

  /* ── Pre-start briefing ── */
  if (!started) {
    return (
      <div style={{
        height: '100vh', width: '100vw',
        background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
        backgroundImage: 'radial-gradient(ellipse at 60% 40%, rgba(124,58,237,0.06) 0%, transparent 60%)',
      }}>
        <div style={{
          width: 520,
          background: 'var(--panel-bg)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: '36px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.04) inset',
        }}>
          {/* Header badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
            <span style={{
              fontSize: 10.5, padding: '3px 10px', borderRadius: 20,
              fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, letterSpacing: '0.05em',
              background: diffColor + '18', border: `1px solid ${diffColor}30`, color: diffColor,
              textTransform: 'uppercase',
            }}>{challenge.difficulty}</span>
            <span style={{
              fontSize: 10.5, padding: '3px 10px', borderRadius: 20,
              fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-muted)',
              background: 'var(--card-bg)', border: '1px solid var(--border)',
            }}>⏱ {challenge.timeLimit} min</span>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 10px', color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {challenge.title}
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.7, margin: '0 0 24px' }}>
            {challenge.description}
          </p>

          {/* Scale grid */}
          <div style={{
            background: 'var(--bg)', borderRadius: 10, padding: '14px 16px', marginBottom: 24,
            border: '1px solid var(--border-dim)',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              System Scale
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[['Users', challenge.scale.users], ['Throughput', challenge.scale.rps], ['Storage', challenge.scale.storage]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/interview')} style={{
              flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)'; }}
            >
              ← Back
            </button>
            <button onClick={() => setStarted(true)} style={{
              flex: 2, padding: '11px', borderRadius: 10, border: 'none',
              background: diffColor, color: 'white', cursor: 'pointer',
              fontSize: 14.5, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              boxShadow: `0 4px 20px ${diffColor}40`,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 24px ${diffColor}50`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 20px ${diffColor}40`; }}
            >
              Start Challenge →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Active session ── */
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--bg)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* ── Top bar ── */}
      <div style={{
        height: 50,
        flexShrink: 0,
        background: 'var(--sidebar-bg)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px 0 8px',
        gap: 10,
        zIndex: 10,
      }}>
        {/* Collapse toggle */}
        <button
          onClick={() => setLeftOpen(v => !v)}
          title={leftOpen ? 'Collapse panel' : 'Expand panel'}
          style={{
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: '1px solid transparent', borderRadius: 7,
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, flexShrink: 0,
            transition: 'all 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          {leftOpen ? '◀' : '▶'}
        </button>

        {/* Difficulty pip + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: diffColor, flexShrink: 0,
            boxShadow: `0 0 6px ${diffColor}80`,
          }} />
          <span style={{
            fontSize: 13.5, fontWeight: 650, color: 'var(--text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {challenge.title}
          </span>
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 20,
            fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, letterSpacing: '0.04em',
            background: diffColor + '15', border: `1px solid ${diffColor}28`, color: diffColor,
            flexShrink: 0,
          }}>
            {challenge.difficulty}
          </span>
        </div>

        {/* Timer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 8,
          background: timeWarning ? 'rgba(239,68,68,0.08)' : 'var(--card-bg)',
          border: `1px solid ${timeWarning ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
          transition: 'all 0.3s',
        }}>
          <span style={{ fontSize: 10, color: timeWarning ? '#EF4444' : 'var(--text-muted)', opacity: 0.7 }}>⏱</span>
          <span style={{
            fontSize: 13, fontWeight: 700,
            fontFamily: "'IBM Plex Mono', monospace",
            color: timeWarning ? '#EF4444' : 'var(--text)',
            letterSpacing: '0.05em',
          }}>
            {timeUp ? 'TIME UP' : fmt(timeLeft)}
          </span>
        </div>

        {/* Score button */}
        <button
          onClick={() => setShowScore(true)}
          style={{
            padding: '5px 12px', borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--card-bg)',
            color: '#A78BFA', cursor: 'pointer',
            fontSize: 12, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'all 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'; e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--card-bg)'; }}
        >
          <span>📊</span> Score
        </button>

        {/* Submit button */}
        {!finished && (
          <button
            onClick={submitChallenge}
            style={{
              padding: '5px 16px', borderRadius: 8, border: 'none',
              background: diffColor, color: 'white', cursor: 'pointer',
              fontSize: 12.5, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: `0 2px 12px ${diffColor}35`,
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${diffColor}50`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 2px 12px ${diffColor}35`; }}
          >
            Submit →
          </button>
        )}

        {/* Close */}
        <button
          onClick={() => navigate('/interview')}
          style={{
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: '1px solid transparent', borderRadius: 7,
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: 17, lineHeight: 1,
            transition: 'all 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#EF4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          ×
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* ── Left panel ── */}
        {leftOpen && (
          <div style={{
            width: 300,
            flexShrink: 0,
            background: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border)',
              padding: '0 4px',
              gap: 2,
              background: 'var(--sidebar-bg)',
            }}>
              {(['reqs', 'hints', 'chat'] as const).map(tab => {
                const isActive = activeTab === tab;
                const label = tab === 'reqs' ? 'Requirements' : tab === 'hints' ? `Hints  ${hintsUsed.length}/${challenge.hints.length}` : 'AI Chat';
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, padding: '10px 4px 9px',
                      border: 'none', cursor: 'pointer',
                      background: 'transparent',
                      color: isActive ? 'var(--text)' : 'var(--text-muted)',
                      fontSize: 11.5,
                      fontWeight: isActive ? 650 : 400,
                      fontFamily: "'DM Sans', sans-serif",
                      borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                      transition: 'all 0.12s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-dim)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Panel content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>

              {/* ── Requirements ── */}
              {activeTab === 'reqs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <Section title="Description">
                    <p style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.7, margin: 0 }}>
                      {challenge.description}
                    </p>
                  </Section>

                  <Section title="Functional Requirements">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {challenge.functionalReqs.map((r, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{
                            width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                            background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 8, color: 'var(--accent)',
                          }}>✓</span>
                          <span style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section title="Non-Functional Requirements">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {challenge.nonFunctionalReqs.map((r, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{
                            width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                            background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 9, color: '#EAB308',
                          }}>⚡</span>
                          <span style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section title="Scale">
                    <div style={{
                      background: 'var(--card-bg)', borderRadius: 8, padding: '12px 14px',
                      border: '1px solid var(--border-dim)',
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px',
                    }}>
                      {[
                        ['Users', challenge.scale.users],
                        ['Throughput', challenge.scale.rps],
                        ['Storage', challenge.scale.storage],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{k}</div>
                          <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>
              )}

              {/* ── Hints ── */}
              {activeTab === 'hints' && (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 8, marginBottom: 16,
                    background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)',
                  }}>
                    <span style={{ fontSize: 13 }}>⚠️</span>
                    <span style={{ fontSize: 11.5, color: '#EAB308', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.4 }}>
                      Each hint deducts 5 pts from final score
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {challenge.hints.map((hint, i) => {
                      const isRevealed = hintsUsed.includes(i);
                      return (
                        <div key={i} style={{
                          background: isRevealed ? 'var(--card-bg)' : 'var(--card-bg)',
                          border: `1px solid ${isRevealed ? 'rgba(124,58,237,0.25)' : 'var(--border)'}`,
                          borderRadius: 10, overflow: 'hidden',
                          transition: 'border-color 0.2s',
                        }}>
                          <div style={{
                            padding: '10px 12px',
                            display: 'flex', alignItems: 'center', gap: 8,
                            borderBottom: isRevealed ? '1px solid rgba(124,58,237,0.12)' : 'none',
                          }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                              background: isRevealed ? 'rgba(124,58,237,0.15)' : 'var(--bg)',
                              border: `1px solid ${isRevealed ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontFamily: "'IBM Plex Mono', monospace",
                              color: isRevealed ? '#A78BFA' : 'var(--text-muted)',
                              fontWeight: 700,
                            }}>
                              {i + 1}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: isRevealed ? 'var(--text)' : 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif", flex: 1 }}>
                              Hint {i + 1}
                            </span>
                            {!isRevealed && (
                              <button
                                onClick={() => { useHint(i); setShowHints(true); }}
                                style={{
                                  padding: '4px 10px', borderRadius: 6, border: 'none',
                                  background: 'rgba(124,58,237,0.1)', color: '#A78BFA',
                                  cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                  fontFamily: "'IBM Plex Mono', monospace",
                                  whiteSpace: 'nowrap',
                                  transition: 'all 0.12s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
                              >
                                Reveal −5pts
                              </button>
                            )}
                            {isRevealed && (
                              <span style={{ fontSize: 10, color: '#22C55E', fontFamily: "'IBM Plex Mono', monospace" }}>revealed</span>
                            )}
                          </div>
                          {isRevealed && (
                            <div style={{ padding: '10px 12px', fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.65 }}>
                              {hint}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {finished && (
                    <div style={{ marginTop: 24 }}>
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                        fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase',
                        letterSpacing: '0.1em', marginBottom: 10,
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                        <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        Follow-up Questions
                        <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                      </div>
                      {challenge.followUpQuestions.map((q, i) => (
                        <div key={i} style={{
                          background: 'var(--card-bg)', border: '1px solid var(--border)',
                          borderRadius: 8, padding: '10px 12px', marginBottom: 6,
                          fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6,
                          display: 'flex', gap: 8,
                        }}>
                          <span style={{ color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, flexShrink: 0, marginTop: 1 }}>Q{i + 1}</span>
                          {q}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Chat ── */}
              {activeTab === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: 300 }}>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 12 }}>
                    {chatMsgs.length === 0 && (
                      <div style={{
                        padding: '20px 16px', borderRadius: 10, textAlign: 'center',
                        background: 'var(--card-bg)', border: '1px solid var(--border)',
                      }}>
                        <div style={{ fontSize: 22, marginBottom: 8 }}>🤖</div>
                        <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
                          Ask me anything about your design.
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
                          "Why Redis over Memcached?"
                        </div>
                      </div>
                    )}
                    {chatMsgs.map((m, i) => (
                      <div key={i} style={{
                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '88%',
                      }}>
                        {m.role === 'ai' && (
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3, paddingLeft: 2 }}>AI</div>
                        )}
                        <div style={{
                          background: m.role === 'user' ? 'var(--accent)' : 'var(--card-bg)',
                          border: m.role === 'ai' ? '1px solid var(--border)' : 'none',
                          borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '3px 12px 12px 12px',
                          padding: '9px 12px',
                          fontSize: 12.5,
                          color: m.role === 'user' ? 'white' : 'var(--text-dim)',
                          lineHeight: 1.6,
                          boxShadow: m.role === 'user' ? '0 2px 8px rgba(124,58,237,0.25)' : 'none',
                        }}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div style={{ alignSelf: 'flex-start', maxWidth: '88%' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 3, paddingLeft: 2 }}>AI</div>
                        <div style={{
                          background: 'var(--card-bg)', border: '1px solid var(--border)',
                          borderRadius: '3px 12px 12px 12px', padding: '9px 14px',
                          color: 'var(--text-muted)', fontSize: 12,
                          display: 'flex', gap: 4, alignItems: 'center',
                        }}>
                          <span style={{ animation: 'pulse 1s ease-in-out infinite' }}>●</span>
                          <span style={{ animation: 'pulse 1s ease-in-out 0.2s infinite' }}>●</span>
                          <span style={{ animation: 'pulse 1s ease-in-out 0.4s infinite' }}>●</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{
                    display: 'flex', gap: 6, paddingTop: 10,
                    borderTop: '1px solid var(--border)', marginTop: 'auto',
                  }}>
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                      placeholder="Ask about your design…"
                      style={{
                        flex: 1, background: 'var(--card-bg)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '8px 11px', color: 'var(--text)',
                        fontSize: 12.5, fontFamily: "'DM Sans', sans-serif", outline: 'none',
                        transition: 'border-color 0.12s',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    />
                    <button
                      onClick={sendChat}
                      disabled={!chatInput.trim() || chatLoading}
                      style={{
                        width: 36, height: 36, borderRadius: 8, border: 'none',
                        background: chatInput.trim() && !chatLoading ? 'var(--accent)' : 'var(--card-bg)',
                        color: chatInput.trim() && !chatLoading ? 'white' : 'var(--text-muted)',
                        cursor: chatInput.trim() && !chatLoading ? 'pointer' : 'not-allowed',
                        fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.12s',
                        boxShadow: chatInput.trim() && !chatLoading ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
                      }}
                    >
                      ➤
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Canvas + Sidebar ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', minWidth: 0 }}>
          <Sidebar />
          <ReactFlowProvider>
            <Canvas
              onTopologyChange={handleTopologyChange}
              nodeStates={nodeStates}
              edgeStates={edgeStates}
              canvasRef={canvasRef}
              onCountChange={() => {}}
              onNodeSelect={() => {}}
              onIssuesChange={() => {}}
              onNewIssues={() => {}}
            />
          </ReactFlowProvider>
        </div>
      </div>

      {/* ── Score card overlay ── */}
      {showScore && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ArchitectureScoreCard
            nodes={topology.nodes}
            edges={topology.edges}
            onClose={() => setShowScore(false)}
          />
          {(aiScoreLoading || aiScore) && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              maxHeight: '40%', overflowY: 'auto',
              background: 'var(--sidebar-bg)', borderTop: '1px solid var(--border)',
              padding: '20px 24px',
            }}>
              {aiScoreLoading && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>⚙</span>
                  AI is scoring your architecture…
                </div>
              )}
              {aiScore && (
                <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>AI Verdict</span>
                    <span style={{
                      fontSize: 13, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                      background: aiScore.verdict === 'Strong' ? 'rgba(34,197,94,0.1)'
                        : aiScore.verdict === 'Acceptable' ? 'rgba(245,158,11,0.1)'
                        : 'rgba(239,68,68,0.1)',
                      color: aiScore.verdict === 'Strong' ? '#22C55E'
                        : aiScore.verdict === 'Acceptable' ? '#F59E0B'
                        : '#EF4444',
                      border: `1px solid ${aiScore.verdict === 'Strong' ? 'rgba(34,197,94,0.2)' : aiScore.verdict === 'Acceptable' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                      {aiScore.verdict}
                      {aiScore.score != null && ` · ${aiScore.score}/100`}
                    </span>
                  </div>
                  {aiScore.summary && (
                    <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '0 0 14px', lineHeight: 1.65 }}>
                      {aiScore.summary}
                    </p>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {aiScore.strengths && aiScore.strengths.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#22C55E', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Strengths</div>
                        {aiScore.strengths.map((s, i) => (
                          <div key={i} style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 4, display: 'flex', gap: 6 }}>
                            <span style={{ color: '#22C55E', flexShrink: 0 }}>✓</span>{s}
                          </div>
                        ))}
                      </div>
                    )}
                    {aiScore.improvements && aiScore.improvements.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#F59E0B', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Improve</div>
                        {aiScore.improvements.map((s, i) => (
                          <div key={i} style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 4, display: 'flex', gap: 6 }}>
                            <span style={{ color: '#F59E0B', flexShrink: 0 }}>→</span>{s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {void showHints}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
      }}>
        <span style={{
          fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'var(--text-muted)',
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          {title}
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--border-dim)' }} />
      </div>
      {children}
    </div>
  );
}
