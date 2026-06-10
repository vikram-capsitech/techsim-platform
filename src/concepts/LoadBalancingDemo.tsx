import { useState, useEffect, useRef } from 'react';

type Algo = 'round-robin' | 'least-conn' | 'ip-hash' | 'weighted';

interface Server { id: number; name: string; conn: number; weight: number }

interface Packet { id: number; targetIdx: number; progress: number }

const ALGO_LABELS: Record<Algo, string> = {
  'round-robin': 'Round Robin',
  'least-conn':  'Least Connections',
  'ip-hash':     'IP Hash',
  'weighted':    'Weighted',
};
const ALGO_DESC: Record<Algo, string> = {
  'round-robin': 'Each request goes to the next server in a cycle, regardless of load.',
  'least-conn':  'Route to the server with the fewest active connections.',
  'ip-hash':     'Client IP is hashed to consistently reach the same server.',
  'weighted':    'Servers with higher weight receive proportionally more requests.',
};

function lerp(a: number, b: number, t: number) { return a + (b - a) * Math.min(t, 1); }

const INITIAL_SERVERS: Server[] = [
  { id: 1, name: 'Server 1', conn: 0, weight: 1 },
  { id: 2, name: 'Server 2', conn: 0, weight: 2 },
  { id: 3, name: 'Server 3', conn: 0, weight: 1 },
  { id: 4, name: 'Server 4', conn: 0, weight: 3 },
];

let clientIp = 100;

export function LoadBalancingDemo() {
  const [algo, setAlgo]             = useState<Algo>('round-robin');
  const [servers, setServers]       = useState<Server[]>(INITIAL_SERVERS);
  const [packets, setPackets]       = useState<Packet[]>([]);
  const [rrIdx, setRrIdx]           = useState(0);
  const [log, setLog]               = useState<string[]>([]);
  const pkId = useRef(0);

  // Animate packets
  useEffect(() => {
    const id = setInterval(() =>
      setPackets(prev => prev.map(p => ({ ...p, progress: p.progress + 0.06 })).filter(p => p.progress < 1.1)),
    40);
    return () => clearInterval(id);
  }, []);

  // Drain connections over time
  useEffect(() => {
    const id = setInterval(() => {
      setServers(prev => prev.map(s => ({ ...s, conn: Math.max(0, s.conn - 1) })));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const addLog = (msg: string) => setLog(p => [msg, ...p].slice(0, 8));

  const pickServer = (srvs: Server[], currentRr: number): { idx: number; next: number; reason: string } => {
    switch (algo) {
      case 'round-robin': {
        const next = currentRr % srvs.length;
        return { idx: next, next: next + 1, reason: `Round Robin → ${srvs[next].name}` };
      }
      case 'least-conn': {
        let idx = 0;
        srvs.forEach((s, i) => { if (s.conn < srvs[idx].conn) idx = i; });
        return { idx, next: currentRr, reason: `Least Connections → ${srvs[idx].name} (${srvs[idx].conn} conns)` };
      }
      case 'ip-hash': {
        const ip = clientIp++;
        const idx = ip % srvs.length;
        return { idx, next: currentRr, reason: `IP Hash (${ip}) → ${srvs[idx].name}` };
      }
      case 'weighted': {
        const total = srvs.reduce((s, srv) => s + srv.weight, 0);
        let r = Math.floor(Math.random() * total);
        let idx = 0;
        for (let i = 0; i < srvs.length; i++) {
          if (r < srvs[i].weight) { idx = i; break; }
          r -= srvs[i].weight;
        }
        return { idx, next: currentRr, reason: `Weighted (w=${srvs[idx].weight}) → ${srvs[idx].name}` };
      }
    }
  };

  const sendRequests = (count: number) => {
    let rr = rrIdx;
    for (let i = 0; i < count; i++) {
      const { idx, next, reason } = pickServer(servers, rr);
      rr = next;
      setPackets(p => [...p, { id: ++pkId.current, targetIdx: idx, progress: 0 }]);
      setServers(prev => prev.map((s, j) => j === idx ? { ...s, conn: s.conn + 1 } : s));
      if (i === 0) addLog(reason);
    }
    setRrIdx(rr);
    if (count > 1) addLog(`Sent ${count} requests via ${ALGO_LABELS[algo]}`);
  };

  // SVG layout
  const W = 460, H = 180;
  const CLIENT = { x: 40, y: H / 2 };
  const LB = { x: 160, y: H / 2 };
  const SERVER_X = 360;
  const serverY = (i: number) => 28 + i * 40;

  const maxConn = Math.max(...servers.map(s => s.conn), 1);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Algo tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {(Object.keys(ALGO_LABELS) as Algo[]).map(a => (
          <button key={a} onClick={() => setAlgo(a)} style={{
            padding: '4px 13px', borderRadius: 6, cursor: 'pointer', fontSize: 11.5,
            fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
            background: algo === a ? 'var(--accent)' : 'var(--card-bg)',
            color: algo === a ? 'white' : 'var(--text-dim)',
            border: `1px solid ${algo === a ? 'transparent' : 'var(--border)'}`,
          }}>{ALGO_LABELS[a]}</button>
        ))}
      </div>

      {/* Description */}
      <div style={{ fontSize: 11.5, color: 'var(--text-dim)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 12, padding: '7px 12px', borderRadius: 7, background: 'var(--bg)', border: '1px solid var(--border)' }}>
        {ALGO_DESC[algo]}
      </div>

      {/* SVG Diagram */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxHeight: H }}>
        {/* Client */}
        <rect x={CLIENT.x - 30} y={CLIENT.y - 18} width={60} height={36} rx={8}
          fill="rgba(59,130,246,0.12)" stroke="#3B82F6" strokeWidth={1.5} />
        <text x={CLIENT.x} y={CLIENT.y - 3} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="var(--text)">Client</text>
        <text x={CLIENT.x} y={CLIENT.y + 9} textAnchor="middle" fontSize={8} fill="var(--text-muted)" fontFamily="'IBM Plex Mono', monospace">→ req</text>

        {/* Arrow client → LB */}
        <line x1={CLIENT.x + 30} y1={CLIENT.y} x2={LB.x - 32} y2={LB.y} stroke="var(--border)" strokeWidth={1.5} />

        {/* LB */}
        <rect x={LB.x - 32} y={LB.y - 22} width={64} height={44} rx={10}
          fill="rgba(124,58,237,0.14)" stroke="#7C3AED" strokeWidth={2} />
        <text x={LB.x} y={LB.y - 4} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#A78BFA">Load</text>
        <text x={LB.x} y={LB.y + 9} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#A78BFA">Balancer</text>

        {/* Arrows LB → servers */}
        {servers.map((_, i) => (
          <line key={i}
            x1={LB.x + 32} y1={LB.y}
            x2={SERVER_X - 32} y2={serverY(i)}
            stroke="var(--border)" strokeWidth={1} strokeDasharray="3 2"
          />
        ))}

        {/* Packets */}
        {packets.map(pk => {
          const ty = serverY(pk.targetIdx);
          return (
            <circle key={pk.id}
              cx={lerp(LB.x + 32, SERVER_X - 32, pk.progress)}
              cy={lerp(LB.y, ty, pk.progress)}
              r={5} fill="#7C3AED" opacity={Math.max(0.1, 1 - pk.progress * 0.6)}
            />
          );
        })}

        {/* Servers */}
        {servers.map((s, i) => {
          const sy = serverY(i);
          const loadFrac = s.conn / maxConn;
          const loadColor = loadFrac > 0.7 ? '#EF4444' : loadFrac > 0.4 ? '#F59E0B' : '#22C55E';
          return (
            <g key={s.id}>
              <rect x={SERVER_X - 32} y={sy - 14} width={90} height={28} rx={7}
                fill={`rgba(34,197,94,0.08)`} stroke="#22C55E" strokeWidth={1.5} />
              <text x={SERVER_X + 13} y={sy - 1} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text)">{s.name}</text>
              <text x={SERVER_X + 13} y={sy + 9} textAnchor="middle" fontSize={7.5} fill={loadColor} fontFamily="'IBM Plex Mono', monospace">
                {s.conn} conn{algo === 'weighted' ? ` · w${s.weight}` : ''}
              </text>
              {/* Load bar */}
              <rect x={SERVER_X + 62} y={sy - 10} width={8} height={22} rx={2} fill="var(--border)" />
              <rect x={SERVER_X + 62} y={sy - 10 + 22 * (1 - loadFrac)} width={8} height={22 * loadFrac} rx={2} fill={loadColor} style={{ transition: 'all 0.3s' }} />
            </g>
          );
        })}
      </svg>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={() => sendRequests(1)} style={{
          padding: '6px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
          fontSize: 12.5, fontWeight: 600, background: 'var(--accent)', color: 'white',
        }}>Send 1</button>
        <button onClick={() => sendRequests(10)} style={{
          padding: '6px 18px', borderRadius: 7, cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
          background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B',
        }}>Send 10</button>
        <button onClick={() => { setServers(INITIAL_SERVERS); setLog([]); setPackets([]); setRrIdx(0); }} style={{
          padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
          background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
        }}>Reset</button>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", alignSelf: 'center' }}>
          conns drain over time
        </div>
      </div>

      {/* Log */}
      <div style={{ marginTop: 10, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', padding: '8px 12px', maxHeight: 96, overflowY: 'auto' }}>
        {log.length === 0
          ? <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>Send a request to see routing decisions…</span>
          : log.map((l, i) => (
            <div key={i} style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", color: i === 0 ? 'var(--text)' : 'var(--text-dim)', lineHeight: 1.6, opacity: Math.max(0.3, 1 - i * 0.1) }}>{l}</div>
          ))}
      </div>
    </div>
  );
}
