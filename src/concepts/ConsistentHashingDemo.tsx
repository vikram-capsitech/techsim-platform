import { useState, useMemo } from 'react';

const RING_R = 110;
const CX = 160;
const CY = 160;
const NODE_COLORS = ['#7C3AED', '#2563EB', '#D97706', '#DC2626', '#059669'];

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h % 1000;
}

function polarToXY(pos: number, r = RING_R): [number, number] {
  const a = (pos / 1000) * 2 * Math.PI - Math.PI / 2;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

const INITIAL_NODES = ['Node A', 'Node B', 'Node C'];
const KEYS = ['user:1001', 'user:2045', 'order:891', 'product:123', 'session:XY', 'cart:456', 'profile:77', 'cache:img'];

export function ConsistentHashingDemo() {
  const [nodes, setNodes] = useState<string[]>(INITIAL_NODES);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const [showVnodes, setShowVnodes] = useState(false);
  const [lastMoved, setLastMoved] = useState<string[]>([]);

  const nodePositions = useMemo(() =>
    nodes.map(n => ({ name: n, pos: hashStr(n), color: NODE_COLORS[nodes.indexOf(n) % NODE_COLORS.length] })),
    [nodes]
  );

  const vnodePositions = useMemo(() => {
    if (!showVnodes) return [];
    return nodes.flatMap(n => {
      const color = NODE_COLORS[nodes.indexOf(n) % NODE_COLORS.length];
      return [0, 1, 2].map(i => ({ name: n, pos: hashStr(`${n}:v${i}`), color, virtual: true }));
    });
  }, [nodes, showVnodes]);

  const allNodePositions = useMemo(() => {
    const base = showVnodes ? [...nodePositions, ...vnodePositions] : nodePositions;
    return base.sort((a, b) => a.pos - b.pos);
  }, [nodePositions, vnodePositions, showVnodes]);

  const getOwner = (keyPos: number) => {
    const sorted = allNodePositions;
    const next = sorted.find(n => n.pos >= keyPos) ?? sorted[0];
    return next;
  };

  const keyAssignments = useMemo(() =>
    KEYS.map(k => ({ key: k, pos: hashStr(k), owner: getOwner(hashStr(k)) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allNodePositions]
  );

  const addNode = () => {
    const letters = 'DEFGHIJKLMNOP';
    const existing = nodes.map(n => n.replace('Node ', ''));
    const next = letters.split('').find(l => !existing.includes(l)) ?? 'X';
    const newName = `Node ${next}`;
    const newPos = hashStr(newName);

    const before = KEYS.map(k => ({ k, o: getOwner(hashStr(k)).name }));
    setNodes(prev => [...prev, newName]);

    const tempAll = [...allNodePositions, { name: newName, pos: newPos, color: NODE_COLORS[nodes.length % NODE_COLORS.length] }].sort((a, b) => a.pos - b.pos);
    const getOwnerIn = (p: number) => {
      const n = tempAll.find(x => x.pos >= p) ?? tempAll[0];
      return n.name;
    };
    const after = KEYS.map(k => ({ k, o: getOwnerIn(hashStr(k)) }));
    const moved = before.filter((b, i) => b.o !== after[i].o).map(b => b.k);
    setLastMoved(moved);
  };

  const removeNode = () => {
    if (nodes.length <= 2) return;
    const removed = nodes[nodes.length - 1];
    const before = KEYS.map(k => ({ k, o: getOwner(hashStr(k)).name }));
    const remaining = nodes.slice(0, -1);
    const tempAll = remaining.map((n, i) => ({ name: n, pos: hashStr(n), color: NODE_COLORS[i % NODE_COLORS.length] })).sort((a, b) => a.pos - b.pos);
    const getOwnerIn = (p: number) => {
      const n = tempAll.find(x => x.pos >= p) ?? tempAll[0];
      return n.name;
    };
    const after = KEYS.map(k => ({ k, o: getOwnerIn(hashStr(k)) }));
    const moved = before.filter((b, i) => b.o !== after[i].o).map(b => b.k);

    setNodes(remaining);
    setLastMoved(moved);
    void removed;
  };

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontFamily: "'DM Sans', sans-serif", color: 'var(--text)' }}>
      {/* Ring SVG */}
      <div style={{ flex: '0 0 auto' }}>
        <svg width="320" height="320" viewBox="0 0 320 320">
          {/* Ring */}
          <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 3" />
          <circle cx={CX} cy={CY} r={3} fill="var(--border)" />

          {/* Key arcs / assignments */}
          {keyAssignments.map(({ key, pos, owner }) => {
            const [kx, ky] = polarToXY(pos, RING_R - 20);
            const isHL = highlightKey === key;
            return (
              <g key={key}>
                {isHL && <line x1={CX} y1={CY} x2={kx} y2={ky} stroke={owner.color} strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />}
                <circle
                  cx={kx} cy={ky} r={isHL ? 7 : 5}
                  fill={lastMoved.includes(key) ? '#F59E0B' : owner.color}
                  opacity={isHL ? 1 : 0.7}
                  style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                  onMouseEnter={() => setHighlightKey(key)}
                  onMouseLeave={() => setHighlightKey(null)}
                />
              </g>
            );
          })}

          {/* Virtual nodes */}
          {showVnodes && vnodePositions.map((vn, i) => {
            const [vx, vy] = polarToXY(vn.pos, RING_R + 12);
            return (
              <rect key={`vn-${i}`} x={vx - 4} y={vy - 4} width={8} height={8}
                fill={vn.color} opacity={0.4} transform={`rotate(45 ${vx} ${vy})`} />
            );
          })}

          {/* Actual node markers */}
          {nodePositions.map(n => {
            const [nx, ny] = polarToXY(n.pos, RING_R + 6);
            return (
              <g key={n.name}>
                <circle cx={nx} cy={ny} r={12} fill={n.color} />
                <text x={nx} y={ny + 1} textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize="8" fontFamily="monospace" fontWeight="700">
                  {n.name.replace('Node ', '')}
                </text>
              </g>
            );
          })}

          {/* Tooltip */}
          {highlightKey && (() => {
            const a = keyAssignments.find(k => k.key === highlightKey);
            if (!a) return null;
            return (
              <g>
                <rect x={CX - 70} y={CY - 20} width={140} height={36} rx={6} fill="var(--panel-bg)" stroke="var(--border)" />
                <text x={CX} y={CY - 4} textAnchor="middle" fill="var(--text)" fontSize="10" fontFamily="monospace">{a.key}</text>
                <text x={CX} y={CY + 10} textAnchor="middle" fill={a.owner.color} fontSize="10" fontFamily="monospace">→ {a.owner.name}</text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Controls + key table */}
      <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={addNode} disabled={nodes.length >= 5}
            style={{
              padding: '7px 14px', borderRadius: 7, border: 'none', cursor: nodes.length >= 5 ? 'not-allowed' : 'pointer',
              background: '#22C55E', color: 'white', fontSize: 12.5, fontWeight: 600, opacity: nodes.length >= 5 ? 0.5 : 1,
            }}>
            + Add Node
          </button>
          <button onClick={removeNode} disabled={nodes.length <= 2}
            style={{
              padding: '7px 14px', borderRadius: 7, border: 'none', cursor: nodes.length <= 2 ? 'not-allowed' : 'pointer',
              background: '#EF4444', color: 'white', fontSize: 12.5, fontWeight: 600, opacity: nodes.length <= 2 ? 0.5 : 1,
            }}>
            − Remove Node
          </button>
          <button onClick={() => setShowVnodes(v => !v)}
            style={{
              padding: '7px 14px', borderRadius: 7, border: `1px solid ${showVnodes ? 'var(--accent)' : 'var(--border)'}`,
              background: showVnodes ? 'rgba(124,58,237,0.12)' : 'var(--card-bg)',
              color: showVnodes ? '#A78BFA' : 'var(--text-dim)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}>
            {showVnodes ? '◆ vnodes ON' : '◇ vnodes OFF'}
          </button>
        </div>

        {lastMoved.length > 0 && (
          <div style={{
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 7, padding: '8px 12px', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
            color: '#F59E0B',
          }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Remapped keys ({lastMoved.length}/{KEYS.length}):</div>
            {lastMoved.map(k => <div key={k}>• {k}</div>)}
            <div style={{ marginTop: 4, color: '#D97706' }}>
              Only {Math.round(lastMoved.length / KEYS.length * 100)}% of keys moved (vs ~100% with naive hashing)
            </div>
          </div>
        )}

        {/* Key assignment table */}
        <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 60px 80px',
            color: 'var(--text-muted)', padding: '0 4px 6px',
            borderBottom: '1px solid var(--border)', marginBottom: 4, fontSize: 10,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <span>Key</span><span>Hash</span><span>Owner</span>
          </div>
          {keyAssignments.map(({ key, pos, owner }) => (
            <div
              key={key}
              onMouseEnter={() => setHighlightKey(key)}
              onMouseLeave={() => setHighlightKey(null)}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 60px 80px',
                padding: '4px 4px', borderRadius: 4, cursor: 'pointer',
                background: highlightKey === key ? 'var(--card-hover)' : 'transparent',
              }}
            >
              <span style={{ color: lastMoved.includes(key) ? '#F59E0B' : 'var(--text)', fontSize: 11 }}>{key}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{pos}</span>
              <span style={{ color: owner.color, fontWeight: 600, fontSize: 11 }}>{owner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
