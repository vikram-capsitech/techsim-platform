import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider, type Node, type Edge } from '@xyflow/react';
import { CHALLENGES } from '../data/challenges';
import { Canvas, type CanvasHandle } from '../components/Canvas';
import { Sidebar } from '../components/Sidebar';
import { ArchitectureScoreCard } from '../components/ArchitectureScoreCard';
import { useSimulation } from '../simulation/useSimulation';
import { useTheme } from '../context/ThemeContext';

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

  const submitChallenge = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFinished(true);
    setShowScore(true);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading || !challenge) return;
    const userText = chatInput.trim();
    setChatInput('');
    setChatMsgs(prev => [...prev, { role: 'user', text: userText }]);
    setChatLoading(true);

    try {
      const token = localStorage.getItem('techsim_token');
      const API = (import.meta as { env: Record<string, string> }).env.VITE_API_URL ?? 'http://localhost:5000';
      const res = await fetch(`${API}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: userText,
          architectureContext: {
            nodeCount: topology.nodes.length,
            components: topology.nodes.map(n => ({ name: (n.data as { label?: string }).label ?? 'node' })),
          },
          conversationHistory: chatMsgs.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { detail?: string };
        throw new Error(body.detail ?? `HTTP ${res.status}`);
      }
      const data = await res.json() as { response: string };
      setChatMsgs(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (err) {
      setChatMsgs(prev => [...prev, { role: 'ai', text: `Error: ${(err as Error).message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!challenge) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>🤔</div>
          <div style={{ fontSize: 16, color: 'var(--text)', margin: '12px 0 16px' }}>Challenge not found</div>
          <button onClick={() => navigate('/interview')} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 7, padding: '8px 18px', cursor: 'pointer' }}>
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
      <div style={{ flex: 1, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{
          width: 560, background: 'var(--panel-bg)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '32px', boxShadow: '0 16px 60px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 5, fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700, background: diffColor + '18', border: `1px solid ${diffColor}35`, color: diffColor,
            }}>{challenge.difficulty}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
              ⏱ {challenge.timeLimit} min
            </span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px', color: 'var(--text)' }}>{challenge.title}</h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.65, margin: '0 0 20px' }}>{challenge.description}</p>

          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>System Scale</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[['Users', challenge.scale.users], ['Throughput', challenge.scale.rps], ['Storage', challenge.scale.storage]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>{k}</div>
                  <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('/interview')} style={{
              flex: 1, padding: '11px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--card-bg)', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 14, fontWeight: 500,
            }}>
              ← Back
            </button>
            <button onClick={() => setStarted(true)} style={{
              flex: 2, padding: '11px', borderRadius: 8, border: 'none',
              background: diffColor, color: 'white', cursor: 'pointer', fontSize: 15, fontWeight: 700,
            }}>
              Start Challenge →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Active session ── */
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top bar */}
      <div style={{
        height: 48, flexShrink: 0,
        background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, zIndex: 10,
      }}>
        <button onClick={() => setLeftOpen(v => !v)} style={{
          background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16,
        }}>
          {leftOpen ? '◀' : '▶'}
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', flex: 1 }}>{challenge.title}</span>
        <span style={{
          fontSize: 13, fontWeight: 700,
          fontFamily: "'IBM Plex Mono', monospace",
          color: timeWarning ? '#EF4444' : 'var(--text)',
          background: timeWarning ? 'rgba(239,68,68,0.1)' : 'var(--card-bg)',
          border: `1px solid ${timeWarning ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
          padding: '4px 12px', borderRadius: 6,
        }}>
          {timeUp ? 'TIME UP' : fmt(timeLeft)}
        </span>
        <button onClick={() => setShowScore(true)} style={{
          padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)',
          background: 'var(--card-bg)', color: '#A78BFA', cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
        }}>
          📊 Score
        </button>
        {!finished && (
          <button onClick={submitChallenge} style={{
            padding: '5px 14px', borderRadius: 6, border: 'none',
            background: diffColor, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>
            Submit →
          </button>
        )}
        <button onClick={() => navigate('/interview')} style={{
          background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18, lineHeight: 1,
        }}>×</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left panel */}
        {leftOpen && (
          <div style={{
            width: 320, flexShrink: 0,
            background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
              {(['reqs', 'hints', 'chat'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                    background: activeTab === tab ? 'var(--card-bg)' : 'transparent',
                    color: activeTab === tab ? 'var(--text)' : 'var(--text-dim)',
                    fontSize: 12.5, fontWeight: activeTab === tab ? 600 : 400,
                    borderBottom: activeTab === tab ? `2px solid var(--accent)` : '2px solid transparent',
                  }}
                >
                  {tab === 'reqs' ? 'Requirements' : tab === 'hints' ? `Hints (${hintsUsed.length}/${challenge.hints.length})` : 'AI Chat'}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
              {activeTab === 'reqs' && (
                <div>
                  <Section title="Description">
                    <p style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.65, margin: 0 }}>
                      {challenge.description}
                    </p>
                  </Section>
                  <Section title="Functional Requirements">
                    <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.7 }}>
                      {challenge.functionalReqs.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </Section>
                  <Section title="Non-Functional Requirements">
                    <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.7 }}>
                      {challenge.nonFunctionalReqs.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </Section>
                  <Section title="Scale">
                    <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div><span style={{ color: 'var(--text-muted)' }}>Users: </span>{challenge.scale.users}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Throughput: </span>{challenge.scale.rps}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Storage: </span>{challenge.scale.storage}</div>
                    </div>
                  </Section>
                </div>
              )}

              {activeTab === 'hints' && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
                    Each hint used costs 5 points from your final score.
                  </div>
                  {challenge.hints.map((hint, i) => (
                    <div key={i} style={{
                      background: 'var(--card-bg)', border: `1px solid ${hintsUsed.includes(i) ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
                      borderRadius: 8, padding: '12px', marginBottom: 8,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
                        Hint {i + 1} {hintsUsed.includes(i) ? '' : '(hidden)'}
                      </div>
                      {hintsUsed.includes(i) ? (
                        <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>{hint}</div>
                      ) : (
                        <button onClick={() => { useHint(i); setShowHints(true); }} style={{
                          padding: '6px 14px', borderRadius: 6, border: 'none',
                          background: 'rgba(124,58,237,0.1)', color: '#A78BFA',
                          cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        }}>
                          Reveal Hint (−5 pts)
                        </button>
                      )}
                    </div>
                  ))}
                  {finished && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', margin: '16px 0 8px', fontFamily: "'IBM Plex Mono', monospace" }}>
                        Follow-up Questions
                      </div>
                      {challenge.followUpQuestions.map((q, i) => (
                        <div key={i} style={{
                          background: 'var(--card-bg)', border: '1px solid var(--border)',
                          borderRadius: 7, padding: '10px 12px', marginBottom: 6,
                          fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.55,
                        }}>
                          {i + 1}. {q}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 300 }}>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8 }}>
                    {chatMsgs.length === 0 && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", padding: '8px 0' }}>
                        Ask the AI about your design. Be specific — "Why would I use Redis here over Memcached?"
                      </div>
                    )}
                    {chatMsgs.map((m, i) => (
                      <div key={i} style={{
                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '90%',
                        background: m.role === 'user' ? 'var(--accent)' : 'var(--card-bg)',
                        border: m.role === 'ai' ? '1px solid var(--border)' : 'none',
                        borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '4px 12px 12px 12px',
                        padding: '8px 11px',
                        fontSize: 12.5, color: m.role === 'user' ? 'white' : 'var(--text-dim)',
                        lineHeight: 1.55,
                      }}>
                        {m.text}
                      </div>
                    ))}
                    {chatLoading && (
                      <div style={{
                        alignSelf: 'flex-start', background: 'var(--card-bg)', border: '1px solid var(--border)',
                        borderRadius: '4px 12px 12px 12px', padding: '8px 12px', color: 'var(--text-muted)', fontSize: 12,
                      }}>
                        Thinking…
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 8 }}>
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                      placeholder="Ask about your design…"
                      style={{
                        flex: 1, background: 'var(--card-bg)', border: '1px solid var(--border)',
                        borderRadius: 7, padding: '7px 10px', color: 'var(--text)',
                        fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: 'none',
                      }}
                    />
                    <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading} style={{
                      padding: '7px 10px', borderRadius: 7, border: 'none',
                      background: chatInput.trim() && !chatLoading ? 'var(--accent)' : 'var(--card-bg)',
                      color: chatInput.trim() && !chatLoading ? 'white' : 'var(--text-muted)',
                      cursor: chatInput.trim() && !chatLoading ? 'pointer' : 'not-allowed', fontSize: 14,
                    }}>
                      ➤
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Canvas + Sidebar */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
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

      {/* Score card */}
      {showScore && (
        <ArchitectureScoreCard
          nodes={topology.nodes}
          edges={topology.edges}
          onClose={() => setShowScore(false)}
        />
      )}
      {void showHints}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 7,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}
