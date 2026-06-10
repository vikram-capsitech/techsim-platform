import { useState, useEffect } from 'react';

interface Packet { id: number; path: 'write' | 'read'; progress: number; segment: number }
interface EventEntry { id: number; type: string; payload: string; ts: number }

// Segments for write path:  0=User→CMD  1=CMD→WriteDB  2=WriteDB→EventBus  3=EventBus→Proj
// Segments for read path:   0=User→Query 1=Query→ReadDB (read from projection)

const WRITE_WAYPOINTS = [
  [50, 90], [160, 90], [270, 50], [390, 90],
] as [number, number][];

const READ_WAYPOINTS = [
  [50, 170], [160, 170], [390, 170],
] as [number, number][];

function lerp(a: number, b: number, t: number) { return a + (b - a) * Math.min(t, 1); }

let eventId = 0;
let packetId = 0;

export function CQRSDemo() {
  const [packets, setPackets]   = useState<Packet[]>([]);
  const [events, setEvents]     = useState<EventEntry[]>([]);
  const [readModel, setReadModel] = useState<{ name: string; email: string } | null>(null);
  const [animating, setAnimating] = useState(false);
  const [lastRead, setLastRead]   = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() =>
      setPackets(prev => {
        return prev
          .map(p => ({ ...p, progress: p.progress + 0.03 }))
          .filter(p => {
            const maxSeg = p.path === 'write' ? WRITE_WAYPOINTS.length - 1 : READ_WAYPOINTS.length - 1;
            return p.progress < maxSeg + 0.1;
          });
      }),
    40);
    return () => clearInterval(id);
  }, []);

  const spawnPackets = (path: 'write' | 'read', count = 1) => {
    const list: Packet[] = [];
    for (let i = 0; i < count; i++) {
      list.push({ id: ++packetId, path, progress: i * 0.3, segment: 0 });
    }
    setPackets(p => [...p, ...list]);
  };

  const doWrite = () => {
    if (animating) return;
    setAnimating(true);
    spawnPackets('write');
    const ev: EventEntry = {
      id: ++eventId,
      type: 'UserUpdated',
      payload: `{ name: "Alice", ts: ${Date.now()} }`,
      ts: Date.now(),
    };
    // Stagger: write DB at 0.7s, event bus at 1.4s, projection at 2.1s, done at 2.6s
    setTimeout(() => setEvents(e => [ev, ...e].slice(0, 6)), 1400);
    setTimeout(() => {
      setReadModel({ name: 'Alice', email: 'alice@example.com' });
      setAnimating(false);
    }, 2600);
  };

  const doRead = () => {
    if (animating) return;
    spawnPackets('read');
    setLastRead(readModel
      ? `{ name: "${readModel.name}", email: "${readModel.email}" }`
      : '(no data yet — perform a write first)');
  };

  // Interpolate packet position along waypoints
  const getPos = (pk: Packet): [number, number] => {
    const wps = pk.path === 'write' ? WRITE_WAYPOINTS : READ_WAYPOINTS;
    const seg = Math.floor(pk.progress);
    const t   = pk.progress - seg;
    if (seg >= wps.length - 1) return wps[wps.length - 1];
    const [ax, ay] = wps[seg];
    const [bx, by] = wps[seg + 1];
    return [lerp(ax, bx, t), lerp(ay, by, t)];
  };

  const W = 480, H = 230;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Diagram */}
        <div style={{ flex: 1 }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxHeight: H }}>
            {/* ── Write side ── */}
            {/* User */}
            <rect x={10} y={68} width={50} height={42} rx={7} fill="rgba(59,130,246,0.1)" stroke="#3B82F6" strokeWidth={1.5} />
            <text x={35} y={86} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text)">User</text>
            <text x={35} y={99} textAnchor="middle" fontSize={7.5} fill="var(--text-dim)" fontFamily="'IBM Plex Mono', monospace">cmd/qry</text>

            {/* CommandHandler */}
            <rect x={115} y={68} width={80} height={42} rx={7} fill="rgba(124,58,237,0.12)" stroke="#7C3AED" strokeWidth={1.5} />
            <text x={155} y={85} textAnchor="middle" fontSize={9} fontWeight={700} fill="#A78BFA">Command</text>
            <text x={155} y={97} textAnchor="middle" fontSize={9} fontWeight={700} fill="#A78BFA">Handler</text>

            {/* WriteDB (PostgreSQL) */}
            <rect x={225} y={22} width={80} height={40} rx={7} fill="rgba(34,197,94,0.1)" stroke="#22C55E" strokeWidth={1.5} />
            <text x={265} y={39} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text)">Write DB</text>
            <text x={265} y={51} textAnchor="middle" fontSize={7.5} fill="#22C55E" fontFamily="'IBM Plex Mono', monospace">PostgreSQL</text>

            {/* EventBus */}
            <rect x={345} y={68} width={90} height={42} rx={7} fill="rgba(245,158,11,0.1)" stroke="#F59E0B" strokeWidth={2} />
            <text x={390} y={86} textAnchor="middle" fontSize={9} fontWeight={700} fill="#F59E0B">Event Bus</text>
            <text x={390} y={98} textAnchor="middle" fontSize={7.5} fill="#F59E0B" fontFamily="'IBM Plex Mono', monospace">Kafka</text>

            {/* ── Read side ── */}
            {/* QueryHandler */}
            <rect x={115} y={148} width={80} height={40} rx={7} fill="rgba(6,182,212,0.1)" stroke="#06B6D4" strokeWidth={1.5} />
            <text x={155} y={165} textAnchor="middle" fontSize={9} fontWeight={700} fill="#67E8F9">Query</text>
            <text x={155} y={177} textAnchor="middle" fontSize={9} fontWeight={700} fill="#67E8F9">Handler</text>

            {/* ReadDB (Elasticsearch) */}
            <rect x={345} y={148} width={90} height={40} rx={7} fill="rgba(239,68,68,0.1)" stroke="#EF4444" strokeWidth={1.5} />
            <text x={390} y={165} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text)">Read DB</text>
            <text x={390} y={177} textAnchor="middle" fontSize={7.5} fill="#EF4444" fontFamily="'IBM Plex Mono', monospace">Elasticsearch</text>

            {/* Projection (from EventBus → ReadDB) */}
            <rect x={225} y={148} width={80} height={40} rx={7} fill="rgba(139,92,246,0.1)" stroke="#8B5CF6" strokeWidth={1.5} />
            <text x={265} y={165} textAnchor="middle" fontSize={9} fontWeight={700} fill="#C4B5FD">Read</text>
            <text x={265} y={177} textAnchor="middle" fontSize={9} fontWeight={700} fill="#C4B5FD">Projection</text>

            {/* Arrows — write path */}
            <line x1={60} y1={89} x2={115} y2={89} stroke="#7C3AED" strokeWidth={1.5} />
            <polygon points="115,85 122,89 115,93" fill="#7C3AED" />
            <line x1={195} y1={89} x2={225} y2={62} stroke="#22C55E" strokeWidth={1.5} strokeDasharray="3 2" />
            <line x1={265} y1={62} x2={345} y2={89} stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="3 2" />

            {/* EventBus → Projection */}
            <line x1={390} y1={110} x2={305} y2={148} stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="3 2" />
            <polygon points="305,148 302,141 309,143" fill="#8B5CF6" />

            {/* Projection → ReadDB */}
            <line x1={305} y1={168} x2={345} y2={168} stroke="#EF4444" strokeWidth={1.5} />
            <polygon points="345,164 352,168 345,172" fill="#EF4444" />

            {/* Read path: user → QueryHandler → ReadDB */}
            <line x1={60} y1={168} x2={115} y2={168} stroke="#06B6D4" strokeWidth={1.5} />
            <polygon points="115,164 122,168 115,172" fill="#06B6D4" />
            <line x1={195} y1={168} x2={345} y2={168} stroke="#EF4444" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />

            {/* Animated packets */}
            {packets.map(pk => {
              const [cx, cy] = getPos(pk);
              const col = pk.path === 'write' ? '#7C3AED' : '#06B6D4';
              return <circle key={pk.id} cx={cx} cy={cy} r={5} fill={col} opacity={0.85} />;
            })}

            {/* Labels */}
            <text x={W / 2} y={218} textAnchor="middle" fontSize={9} fill="var(--text-muted)" fontFamily="'IBM Plex Mono', monospace">
              Write model (Commands) and Read model (Queries) are separate
            </text>
          </svg>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={doWrite} disabled={animating} style={{
              padding: '6px 18px', borderRadius: 7, border: 'none', cursor: animating ? 'not-allowed' : 'pointer',
              fontSize: 12.5, fontWeight: 600, background: '#7C3AED', color: 'white', opacity: animating ? 0.5 : 1,
            }}>Write Command</button>
            <button onClick={doRead} style={{
              padding: '6px 18px', borderRadius: 7, cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
              background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.35)', color: '#67E8F9',
            }}>Read Query</button>
          </div>
        </div>

        {/* Side panel: event log + read result */}
        <div style={{ width: 190, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Event Log */}
          <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)', padding: '10px 10px', overflowY: 'auto' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#F59E0B', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 7, letterSpacing: '0.05em' }}>EVENT STORE</div>
            {events.length === 0
              ? <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>no events yet</span>
              : events.map(e => (
                <div key={e.id} style={{ marginBottom: 8, padding: '5px 7px', borderRadius: 5, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#F59E0B', fontFamily: "'IBM Plex Mono', monospace" }}>{e.type}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--text-dim)', fontFamily: "'IBM Plex Mono', monospace", wordBreak: 'break-all', marginTop: 2 }}>{e.payload}</div>
                </div>
              ))
            }
          </div>

          {/* Read Model */}
          <div style={{ background: 'var(--bg)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', padding: '10px 10px' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#EF4444', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6, letterSpacing: '0.05em' }}>READ MODEL</div>
            <div style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-dim)', wordBreak: 'break-all' }}>
              {readModel
                ? `{\n  name: "${readModel.name}",\n  email: "${readModel.email}"\n}`
                : '(empty)'}
            </div>
            {lastRead && (
              <div style={{ marginTop: 8, fontSize: 10, color: '#06B6D4', fontFamily: "'IBM Plex Mono', monospace", wordBreak: 'break-all' }}>
                → {lastRead}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
