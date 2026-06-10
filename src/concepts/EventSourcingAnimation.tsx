import { useState, useEffect } from 'react';

interface AppEvent {
  id: number;
  type: string;
  payload: string;
  color: string;
}

interface State { balance: number; name: string; status: 'active' | 'closed' }

const EVENT_TEMPLATES = [
  { type: 'AccountOpened',  payload: '{ owner: "Alice", initial: $500 }',   color: '#22C55E',  delta: { balance: 500,  name: 'Alice', status: 'active' as const } },
  { type: 'MoneyDeposited', payload: '{ amount: $1200 }',                   color: '#3B82F6',  delta: { balance: 1200, name: null,    status: null } },
  { type: 'MoneyWithdrawn', payload: '{ amount: $200 }',                    color: '#F59E0B',  delta: { balance: -200, name: null,    status: null } },
  { type: 'OwnerRenamed',   payload: '{ newName: "Alice Smith" }',          color: '#8B5CF6',  delta: { balance: 0,    name: 'Alice Smith', status: null } },
  { type: 'MoneyDeposited', payload: '{ amount: $350 }',                    color: '#3B82F6',  delta: { balance: 350,  name: null,    status: null } },
  { type: 'AccountClosed',  payload: '{ reason: "Moved to savings" }',      color: '#EF4444',  delta: { balance: 0,    name: null,    status: 'closed' as const } },
];

function deriveState(events: AppEvent[]): State {
  let balance = 0, name = '—', status: 'active' | 'closed' = 'active';
  events.forEach((_, i) => {
    const tmpl = EVENT_TEMPLATES[i % EVENT_TEMPLATES.length];
    balance += tmpl.delta.balance;
    if (tmpl.delta.name) name = tmpl.delta.name;
    if (tmpl.delta.status) status = tmpl.delta.status;
  });
  return { balance, name, status };
}

let nextId = 1;

export function EventSourcingAnimation() {
  const [events, setEvents]         = useState<AppEvent[]>([]);
  const [replayIdx, setReplayIdx]   = useState<number | null>(null);
  const [replaying, setReplaying]   = useState(false);
  const [showState, setShowState]   = useState<State>({ balance: 0, name: '—', status: 'active' });

  useEffect(() => {
    if (replayIdx === null) {
      setShowState(deriveState(events));
    }
  }, [events, replayIdx]);

  const addEvent = () => {
    if (replaying) return;
    const idx = events.length % EVENT_TEMPLATES.length;
    const tmpl = EVENT_TEMPLATES[idx];
    const ev: AppEvent = { id: nextId++, type: tmpl.type, payload: tmpl.payload, color: tmpl.color };
    setEvents(p => [...p, ev]);
  };

  const startReplay = async () => {
    if (events.length === 0 || replaying) return;
    setReplaying(true);
    setShowState({ balance: 0, name: '—', status: 'active' });
    for (let i = 0; i < events.length; i++) {
      setReplayIdx(i);
      await new Promise(r => setTimeout(r, 700));
      setShowState(deriveState(events.slice(0, i + 1)));
    }
    setReplayIdx(null);
    setReplaying(false);
  };

  const reset = () => {
    setEvents([]); setReplayIdx(null); setReplaying(false);
    setShowState({ balance: 0, name: '—', status: 'active' });
    nextId = 1;
  };

  const state = showState;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 12 }}>
        Add events to build up the account state. Then click Replay to watch state derive from scratch.
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* Left: Event Store */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 8, letterSpacing: '0.06em' }}>
            EVENT STORE (append-only log)
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', minHeight: 220, maxHeight: 260, overflowY: 'auto', padding: '8px' }}>
            {events.length === 0
              ? <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
                  No events yet.<br />Click "Add Event" to begin.
                </div>
              : events.map((ev, i) => {
                  const isReplaying = replayIdx === i;
                  return (
                    <div key={ev.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 8px',
                      borderRadius: 6, marginBottom: 4,
                      background: isReplaying ? `${ev.color}20` : 'var(--card-bg)',
                      border: `1px solid ${isReplaying ? ev.color : 'var(--border)'}`,
                      transition: 'all 0.25s',
                      boxShadow: isReplaying ? `0 0 10px ${ev.color}40` : 'none',
                    }}>
                      <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", minWidth: 20, marginTop: 1 }}>
                        #{i + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: ev.color, fontFamily: "'IBM Plex Mono', monospace" }}>{ev.type}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-dim)', fontFamily: "'IBM Plex Mono', monospace" }}>{ev.payload}</div>
                      </div>
                      {isReplaying && <div style={{ marginLeft: 'auto', fontSize: 12 }}>▶</div>}
                    </div>
                  );
                })
            }
          </div>
        </div>

        {/* Right: Derived State */}
        <div style={{ width: 190 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 8, letterSpacing: '0.06em' }}>
            CURRENT STATE{replaying ? ' (rebuilding…)' : ''}
          </div>
          <div style={{
            background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)',
            padding: '14px', minHeight: 160,
            borderColor: replaying ? 'var(--accent)' : 'var(--border)',
            boxShadow: replaying ? '0 0 14px rgba(124,58,237,0.15)' : 'none',
            transition: 'all 0.2s',
          }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 10, letterSpacing: '0.05em' }}>Account</div>
            {[
              { label: 'owner', value: state.name, color: '#A78BFA' },
              { label: 'balance', value: `$${state.balance}`, color: state.balance >= 0 ? '#22C55E' : '#EF4444' },
              { label: 'status', value: state.status, color: state.status === 'active' ? '#22C55E' : '#EF4444' },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 2 }}>{row.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: row.color, fontFamily: "'IBM Plex Mono', monospace", transition: 'all 0.2s' }}>{row.value}</div>
              </div>
            ))}
          </div>

          {/* Replay indicator */}
          {replaying && (
            <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#A78BFA', textAlign: 'center' }}>
              Replaying event {(replayIdx ?? 0) + 1}/{events.length}…
            </div>
          )}

          {/* Key insight */}
          <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 10.5, color: '#F59E0B', lineHeight: 1.5 }}>
            State is never stored directly — it's always derived by replaying events.
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button onClick={addEvent} disabled={replaying || events.length >= 6} style={{
          padding: '6px 18px', borderRadius: 7, border: 'none', cursor: replaying || events.length >= 6 ? 'not-allowed' : 'pointer',
          fontSize: 12.5, fontWeight: 600, background: 'var(--accent)', color: 'white',
          opacity: replaying || events.length >= 6 ? 0.5 : 1,
        }}>+ Add Event</button>
        <button onClick={startReplay} disabled={replaying || events.length === 0} style={{
          padding: '6px 18px', borderRadius: 7, cursor: replaying || events.length === 0 ? 'not-allowed' : 'pointer',
          fontSize: 12.5, fontWeight: 600, opacity: replaying || events.length === 0 ? 0.5 : 1,
          background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#22C55E',
        }}>▶ Replay from #1</button>
        <button onClick={reset} disabled={replaying} style={{
          padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
          background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
        }}>↺ Reset</button>
      </div>
    </div>
  );
}
