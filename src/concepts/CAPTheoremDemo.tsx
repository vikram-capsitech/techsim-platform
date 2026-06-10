import { useState, useEffect, useRef } from 'react';

type Mode = 'CP' | 'AP';

interface Packet {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  progress: number;
  done: boolean;
}

let pid = 0;

const CP_EXAMPLES = ['ZooKeeper', 'etcd', 'HBase', 'MongoDB (default)'];
const AP_EXAMPLES = ['Cassandra', 'DynamoDB', 'CouchDB', 'Riak'];

export function CAPTheoremDemo() {
  const [partitioned, setPartitioned] = useState(false);
  const [mode, setMode] = useState<Mode>('CP');
  const [node1Data, setNode1Data] = useState(42);
  const [node2Data, setNode2Data] = useState(42);
  const [node1Locked, setNode1Locked] = useState(false);
  const [log, setLog] = useState<{ id: number; text: string; color: string }[]>([]);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [writeCount, setWriteCount] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<Record<number, number>>({});
  const logId = useRef(0);

  const addLog = (text: string, color = 'var(--text-dim)') => {
    const id = ++logId.current;
    setLog(prev => [...prev.slice(-6), { id, text, color }]);
  };

  const spawnPacket = (x: number, y: number, tx: number, ty: number, color: string) => {
    const id = ++pid;
    startRef.current[id] = performance.now();
    setPackets(prev => [...prev, { id, x, y, tx, ty, color, progress: 0, done: false }]);
    return id;
  };

  useEffect(() => {
    const animate = () => {
      const now = performance.now();
      setPackets(prev => prev
        .map(p => {
          if (p.done) return p;
          const elapsed = now - (startRef.current[p.id] ?? now);
          const progress = Math.min(elapsed / 600, 1);
          return { ...p, progress, done: progress >= 1 };
        })
        .filter(p => !p.done || (now - (startRef.current[p.id] ?? 0)) < 800)
      );
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleWrite = () => {
    const newVal = writeCount + 1;
    setWriteCount(newVal);
    const v = 42 + newVal;
    setNode1Data(v);
    spawnPacket(130, 130, 130, 130, '#7C3AED');

    if (!partitioned) {
      setTimeout(() => {
        setNode2Data(v);
        spawnPacket(130, 150, 370, 150, '#22C55E');
        addLog(`✓ Write(${v}) replicated to Node 2`, '#22C55E');
      }, 400);
      addLog(`→ Write(${v}) sent to Node 1`, 'var(--text)');
    } else if (mode === 'CP') {
      setNode1Locked(true);
      addLog(`→ Write(${v}) → Node 1 acquires lock`, 'var(--text)');
      setTimeout(() => {
        setNode1Locked(false);
        addLog(`✗ Replication blocked (partition). Write ABORTED for consistency.`, '#EF4444');
        setNode1Data(42 + writeCount);
      }, 800);
    } else {
      addLog(`→ Write(${v}) → Node 1 accepts (AP mode)`, '#F59E0B');
      addLog(`⚠ Node 2 still has stale value ${42 + writeCount - 1} (partition)`, '#F59E0B');
    }
  };

  const handleRead = (nodeNum: 1 | 2) => {
    const val = nodeNum === 1 ? node1Data : node2Data;
    if (nodeNum === 2 && partitioned && mode === 'CP') {
      addLog(`✗ Read Node 2 BLOCKED — waiting for sync (CP mode)`, '#EF4444');
    } else {
      addLog(`← Read Node ${nodeNum} → ${val}${nodeNum === 2 && partitioned ? ' (possibly stale, AP mode)' : ''}`, '#06B6D4');
    }
  };

  const togglePartition = () => {
    const next = !partitioned;
    setPartitioned(next);
    if (next) {
      addLog(`⚡ NETWORK PARTITION — nodes cannot communicate!`, '#EF4444');
    } else {
      if (mode === 'AP' && node1Data !== node2Data) {
        setNode2Data(node1Data);
        addLog(`↻ Partition healed — reconciling stale data…`, '#F59E0B');
        setTimeout(() => addLog(`✓ Node 2 synced to Node 1 value`, '#22C55E'), 600);
      } else {
        addLog(`✓ Partition healed — nodes reconnected`, '#22C55E');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
          {(['CP', 'AP'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '6px 18px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                background: mode === m ? (m === 'CP' ? '#7C3AED' : '#0891B2') : 'transparent',
                color: mode === m ? 'white' : 'var(--text-dim)',
                transition: 'all 0.15s',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          onClick={togglePartition}
          style={{
            padding: '7px 16px', borderRadius: 7, cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            background: partitioned ? 'rgba(239,68,68,0.15)' : 'var(--card-bg)',
            border: `1px solid ${partitioned ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
            color: partitioned ? '#EF4444' : 'var(--text-dim)',
            transition: 'all 0.15s',
          }}
        >
          {partitioned ? '⚡ Partition ACTIVE' : '🔗 Inject Partition'}
        </button>

        <button
          onClick={handleWrite}
          style={{
            padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            background: '#7C3AED', color: 'white',
          }}
        >
          ✏ Write to Node 1
        </button>
        <button
          onClick={() => handleRead(1)}
          style={{
            padding: '7px 16px', borderRadius: 7, cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            background: 'var(--card-bg)', border: '1px solid var(--border)', color: '#06B6D4',
          }}
        >
          Read Node 1
        </button>
        <button
          onClick={() => handleRead(2)}
          style={{
            padding: '7px 16px', borderRadius: 7, cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            background: 'var(--card-bg)', border: '1px solid var(--border)', color: '#06B6D4',
          }}
        >
          Read Node 2
        </button>
      </div>

      {/* Visualization */}
      <div style={{ position: 'relative', height: 280 }}>
        <svg width="100%" height="280" viewBox="0 0 520 280" style={{ overflow: 'visible' }}>
          {/* Replication link */}
          <line
            x1="180" y1="140" x2="340" y2="140"
            stroke={partitioned ? '#EF4444' : '#252535'}
            strokeWidth="2"
            strokeDasharray={partitioned ? '8 5' : '0'}
          />
          {partitioned && (
            <>
              <line x1="255" y1="115" x2="265" y2="165" stroke="#EF4444" strokeWidth="3" />
              <line x1="265" y1="115" x2="255" y2="165" stroke="#EF4444" strokeWidth="3" />
              <rect x="238" y="108" width="44" height="14" fill="var(--bg)" rx="3" />
              <text x="260" y="119" textAnchor="middle" fill="#EF4444" fontSize="10" fontFamily="monospace">SPLIT</text>
            </>
          )}

          {/* Node 1 */}
          <rect x="30" y="90" width="150" height="100" rx="12"
            fill="var(--card-bg)" stroke={node1Locked ? '#EF4444' : partitioned ? '#F59E0B40' : '#252535'}
            strokeWidth={node1Locked ? 2 : 1.5}
          />
          <text x="105" y="118" textAnchor="middle" fill="var(--text-dim)" fontSize="10" fontFamily="monospace">NODE 1 (Primary)</text>
          <text x="105" y="148" textAnchor="middle" fill={node1Locked ? '#EF4444' : 'var(--text)'} fontSize="22" fontWeight="700" fontFamily="monospace">
            {node1Locked ? '⏳' : node1Data}
          </text>
          {node1Locked && (
            <text x="105" y="172" textAnchor="middle" fill="#EF4444" fontSize="10" fontFamily="monospace">LOCKED</text>
          )}

          {/* Node 2 */}
          <rect x="340" y="90" width="150" height="100" rx="12"
            fill="var(--card-bg)"
            stroke={partitioned && mode === 'CP' ? '#EF4444' : '#252535'}
            strokeWidth="1.5"
          />
          <text x="415" y="118" textAnchor="middle" fill="var(--text-dim)" fontSize="10" fontFamily="monospace">NODE 2 (Replica)</text>
          <text x="415" y="148" textAnchor="middle" fill={partitioned && mode === 'AP' && node1Data !== node2Data ? '#F59E0B' : 'var(--text)'} fontSize="22" fontWeight="700" fontFamily="monospace">
            {partitioned && mode === 'CP' ? '🚫' : node2Data}
          </text>
          {partitioned && mode === 'AP' && node1Data !== node2Data && (
            <text x="415" y="172" textAnchor="middle" fill="#F59E0B" fontSize="10" fontFamily="monospace">STALE</text>
          )}

          {/* Animated packets */}
          {packets.map(p => {
            const cx = p.x + (p.tx - p.x) * p.progress;
            const cy = p.y + (p.ty - p.y) * p.progress;
            return <circle key={p.id} cx={cx} cy={cy} r="5" fill={p.color} opacity={1 - p.progress * 0.5} />;
          })}

          {/* Legend */}
          <rect x="30" y="220" width="460" height="46" rx="8" fill="var(--panel-bg)" stroke="var(--border)" strokeWidth="1" />
          <text x="50" y="239" fill="var(--text-dim)" fontSize="11" fontFamily="monospace">
            Mode: {mode} —
          </text>
          {mode === 'CP' ? (
            <text x="110" y="239" fill="#7C3AED" fontSize="11" fontFamily="monospace">
              Block reads/writes during partition to stay consistent
            </text>
          ) : (
            <text x="110" y="239" fill="#0891B2" fontSize="11" fontFamily="monospace">
              Accept stale reads during partition to stay available
            </text>
          )}
          <text x="50" y="256" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">
            Examples: {(mode === 'CP' ? CP_EXAMPLES : AP_EXAMPLES).join(', ')}
          </text>
        </svg>
      </div>

      {/* Event log */}
      <div style={{
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
        padding: '10px 14px', minHeight: 120, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Event Log
        </div>
        {log.length === 0 && <div style={{ color: 'var(--text-muted)' }}>Click buttons to simulate writes and reads…</div>}
        {log.map(l => (
          <div key={l.id} style={{ color: l.color, marginBottom: 3 }}>
            {'>'} {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
