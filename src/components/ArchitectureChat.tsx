import { useState, useRef, useEffect } from 'react';
import { aiApi } from '../api/client';

// ── Types ──────────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

interface ArchitectureChatProps {
  architectureContext?: string;
  onClose: () => void;
}



const SUGGESTED_QUESTIONS = [
  'How can I improve the scalability of this architecture?',
  'What are the potential single points of failure?',
  'How should I handle authentication in this design?',
  'What caching strategy would work best here?',
  'How can I make this architecture more cost-efficient?',
  'What monitoring should I add to this system?',
];

// ── Markdown-ish renderer (simple, no dep) ────────────────────────────────────
function renderMsg(text: string) {
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^#{1,3}\s/.test(line)) {
      out.push(<p key={i} style={{ fontWeight: 700, color: 'var(--text)', margin: '10px 0 4px', fontSize: 13 }}>{line.replace(/^#+\s/, '')}</p>);
    } else if (/^\d+\.\s/.test(line)) {
      out.push(<p key={i} style={{ margin: '2px 0', paddingLeft: 14, fontSize: 12.5, lineHeight: 1.5 }}>{line}</p>);
    } else if (/^[-*]\s/.test(line)) {
      out.push(<p key={i} style={{ margin: '2px 0', paddingLeft: 14, fontSize: 12.5, lineHeight: 1.5 }}>• {line.slice(2)}</p>);
    } else if (line === '') {
      out.push(<div key={i} style={{ height: 6 }} />);
    } else {
      out.push(<p key={i} style={{ margin: '3px 0', fontSize: 12.5, lineHeight: 1.6 }}>{line}</p>);
    }
    i++;
  }
  return out;
}

// ── Typing indicator ───────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '10px 14px', alignItems: 'center' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)',
          animation: `dot-bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ArchitectureChat({ architectureContext, onClose }: ArchitectureChatProps) {
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!minimized) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, minimized]);



  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' as const : 'user' as const, content: m.content }));
      
      let finalContext: any = null;
      if (architectureContext) {
        try {
          const parsed = JSON.parse(architectureContext);
          if (parsed && Array.isArray(parsed.nodes)) {
            const nodeTypes = parsed.nodes.map((n: any) => n.type);
            finalContext = {
              nodeCount: parsed.nodes.length,
              components: parsed.nodes.map((n: any) => ({ name: n.label || n.id })),
              hasLoadBalancer: nodeTypes.includes('load-balancer'),
              hasCache: nodeTypes.includes('redis'),
              hasQueue: nodeTypes.includes('kafka') || nodeTypes.includes('rabbitmq') || nodeTypes.includes('sqs') || nodeTypes.includes('event-bus'),
              hasMonitoring: nodeTypes.includes('prometheus') || nodeTypes.includes('grafana') || nodeTypes.includes('datadog'),
            };
          } else {
            finalContext = parsed;
          }
        } catch {
          finalContext = {
            nodeCount: 0,
            components: [],
            hasLoadBalancer: false,
            hasCache: false,
            hasQueue: false,
            hasMonitoring: false,
            rawContext: architectureContext
          };
        }
      }

      const data = await aiApi.chat({
        message: trimmed,
        architectureContext: finalContext,
        conversationHistory: history,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, ts: Date.now() }]);
    } catch (err) {
      const msg = (err as Error).message ?? '';
      setError(msg || 'Failed to get a response. Check your AI key in Settings.');
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const panelH = minimized ? 56 : 520;

  return (
    <>
      <style>{`
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40%            { transform: scale(1.0); opacity: 1;   }
        }
      `}</style>

      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        width: 380, height: panelH,
        background: 'var(--panel-bg)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        boxShadow: '0 20px 64px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        zIndex: 800, overflow: 'hidden',
        transition: 'height 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '0 16px', height: 56, flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: minimized ? 'none' : '1px solid var(--border)',
          cursor: 'default',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, flexShrink: 0,
          }}>
            💬
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
              Architecture AI
            </div>
            {!minimized && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
                Powered by Llama 3.3 70B
              </div>
            )}
          </div>
          <button
            onClick={() => setMinimized(m => !m)}
            title={minimized ? 'Expand' : 'Minimize'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 16, padding: '0 4px', lineHeight: 1 }}
          >
            {minimized ? '▲' : '▽'}
          </button>
          <button
            onClick={onClose}
            title="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 16, padding: '0 4px', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {!minimized && (
          <>
            {/* Messages area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>

              {messages.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                    Ask anything about your architecture:
                  </div>
                  {SUGGESTED_QUESTIONS.slice(0, 4).map(q => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      style={{
                        textAlign: 'left', background: 'var(--card-bg)',
                        border: '1px solid var(--border)', borderRadius: 8,
                        padding: '8px 12px', cursor: 'pointer',
                        color: 'var(--text-dim)', fontSize: 12,
                        fontFamily: "'DM Sans', sans-serif",
                        transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#7C3AED';
                        e.currentTarget.style.color = 'var(--text)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text-dim)';
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {messages.map(m => (
                <div key={m.ts} style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                }}>
                  <div style={{
                    background: m.role === 'user'
                      ? 'linear-gradient(135deg, #7C3AED, #4F46E5)'
                      : 'var(--card-bg)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                    borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                    padding: '10px 13px',
                    color: m.role === 'user' ? '#fff' : 'var(--text-dim)',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {m.role === 'user'
                      ? <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55 }}>{m.content}</p>
                      : renderMsg(m.content)
                    }
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ alignSelf: 'flex-start', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '4px 14px 14px 14px' }}>
                  <TypingDots />
                </div>
              )}

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 8, padding: '8px 12px',
                  color: '#EF4444', fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                }}>
                  {error}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div style={{
              borderTop: '1px solid var(--border)', padding: '10px 12px',
              display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0,
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about your architecture… (Enter to send)"
                rows={1}
                style={{
                  flex: 1, resize: 'none', border: '1px solid var(--border)',
                  borderRadius: 10, background: 'var(--card-bg)',
                  color: 'var(--text)', padding: '8px 11px', fontSize: 12.5,
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
                  outline: 'none', maxHeight: 96, overflowY: 'auto',
                  transition: 'border-color 0.12s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#7C3AED')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                style={{
                  width: 34, height: 34, borderRadius: 10, border: 'none',
                  background: input.trim() && !loading ? '#7C3AED' : 'var(--card-bg)',
                  color: input.trim() && !loading ? '#fff' : 'var(--text-muted)',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  fontSize: 14, flexShrink: 0, transition: 'all 0.12s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
