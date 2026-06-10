import { useState, useEffect, useRef } from 'react';

type Mode = 'async' | 'sync' | 'semi-sync';
interface Packet { id: number; to: 1 | 2; progress: number }

const P   = { x: 250, y: 70 };
const R1  = { x: 110, y: 210 };
const R2  = { x: 390, y: 210 };

function lerp(a: number, b: number, t: number) { return a + (b - a) * Math.min(t, 1); }

export function ReplicationDemo() {
  const [mode, setMode]               = useState<Mode>('async');
  const [primaryUp, setPrimaryUp]     = useState(true);
  const [leader, setLeader]           = useState<'P' | 'R1'>('P');
  const [promoting, setPromoting]     = useState(false);
  const [packets, setPackets]         = useState<Packet[]>([]);
  const [writes, setWrites]           = useState(0);
  const [lag, setLag]                 = useState({ r1: 0, r2: 0 });
  const [log, setLog]                 = useState<string[]>([]);
  const pkId = useRef(0);

  useEffect(() => {
    const id = setInterval(() =>
      setPackets(prev => prev.map(p => ({ ...p, progress: p.progress + 0.05 })).filter(p => p.progress < 1.1)),
    40);
    return () => clearInterval(id);
  }, []);

  const addLog = (msg: string) => setLog(p => [msg, ...p].slice(0, 8));

  const doWrite = () => {
    if (!primaryUp) return;
    setWrites(c => c + 1);
    setPackets(p => [...p,
      { id: ++pkId.current, to: 1, progress: 0 },
      { id: ++pkId.current, to: 2, progress: 0 },
    ]);
    if (mode === 'sync') {
      setLag({ r1: 0, r2: 0 });
      addLog('WRITE → waiting for 2 ACKs (sync)…');
      setTimeout(() => addLog('✓ Both replicas ACKed — committed'), 900);
    } else if (mode === 'async') {
      const l1 = 20 + Math.floor(Math.random() * 80);
      const l2 = 50 + Math.floor(Math.random() * 120);
      setLag({ r1: l1, r2: l2 });
      addLog(`WRITE → returned immediately. R1 ~${l1}ms, R2 ~${l2}ms behind`);
    } else {
      setLag({ r1: 0, r2: 30 + Math.floor(Math.random() * 80) });
      addLog('WRITE → waiting for 1 ACK (semi-sync)…');
      setTimeout(() => addLog('✓ R1 ACKed — committed. R2 catching up async'), 450);
    }
  };

  const doKill = () => {
    if (!primaryUp) return;
    setPrimaryUp(false);
    setPromoting(true);
    addLog('⚡ PRIMARY DOWN — starting failover…');
    setTimeout(() => {
      setLeader('R1');
      setPromoting(false);
      addLog('✓ Replica-1 promoted to leader — traffic redirected');
    }, 1800);
  };

  const doRestart = () => {
    setPrimaryUp(true); setLeader('P'); setPromoting(false);
    setPackets([]); setLag({ r1: 0, r2: 0 }); setLog([]); setWrites(0);
  };

  const srcX = leader === 'P' ? P.x : R1.x;
  const srcY = leader === 'P' ? P.y : R1.y;

  const MODE_INFO: Record<Mode, string> = {
    sync: 'Sync — primary waits for ALL replica ACKs before returning',
    async: 'Async — primary returns immediately; replicas catch up in background',
    'semi-sync': 'Semi-sync — primary waits for at least ONE replica ACK',
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['async', 'sync', 'semi-sync'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '4px 13px', borderRadius: 6, cursor: 'pointer', fontSize: 11.5,
            fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, transition: 'all 0.15s',
            background: mode === m ? 'var(--accent)' : 'var(--card-bg)',
            color: mode === m ? 'white' : 'var(--text-dim)',
            border: `1px solid ${mode === m ? 'transparent' : 'var(--border)'}`,
          }}>{m}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={doWrite} disabled={!primaryUp} style={{
          padding: '4px 14px', borderRadius: 6, border: 'none', cursor: primaryUp ? 'pointer' : 'not-allowed',
          fontSize: 12, fontWeight: 600, background: '#22C55E', color: 'white', opacity: primaryUp ? 1 : 0.4,
        }}>Write Data</button>
        {primaryUp ? (
          <button onClick={doKill} style={{
            padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#EF4444',
          }}>Kill Primary</button>
        ) : (
          <button onClick={doRestart} style={{
            padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)', color: '#22C55E',
          }}>Restart</button>
        )}
      </div>

      {/* SVG */}
      <svg viewBox="0 0 500 280" style={{ width: '100%', maxHeight: 280 }}>
        {/* Lines */}
        <line x1={P.x} y1={P.y+30} x2={R1.x} y2={R1.y-30} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={P.x} y1={P.y+30} x2={R2.x} y2={R2.y-30} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Packets */}
        {packets.map(pk => {
          const tgt = pk.to === 1 ? R1 : R2;
          return (
            <circle key={pk.id}
              cx={lerp(srcX, tgt.x, pk.progress)}
              cy={lerp(srcY, tgt.y, pk.progress)}
              r={6} fill="#7C3AED" opacity={Math.max(0, 1 - pk.progress * 0.6)}
            />
          );
        })}

        {/* Primary */}
        <circle cx={P.x} cy={P.y} r={32}
          fill={primaryUp ? (leader === 'P' ? 'rgba(124,58,237,0.18)' : 'rgba(59,130,246,0.12)') : 'rgba(107,114,128,0.1)'}
          stroke={primaryUp ? (promoting ? '#F59E0B' : leader === 'P' ? '#7C3AED' : '#3B82F6') : '#374151'}
          strokeWidth={promoting ? 2.5 : 2}
        />
        <text x={P.x} y={P.y-4} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={primaryUp ? 'var(--text)' : '#6B7280'}>
          {leader === 'P' ? '★ ' : ''}Primary
        </text>
        <text x={P.x} y={P.y+10} textAnchor="middle" fontSize={9} fill={primaryUp ? '#A78BFA' : '#4B5563'} fontFamily="'IBM Plex Mono', monospace">
          {primaryUp ? (leader === 'P' ? 'LEADER' : 'FOLLOWER') : 'DOWN'}
        </text>
        <text x={P.x} y={P.y-44} textAnchor="middle" fontSize={9} fill="var(--text-muted)" fontFamily="'IBM Plex Mono', monospace">
          writes: {writes}
        </text>

        {/* Replica 1 */}
        <circle cx={R1.x} cy={R1.y} r={32}
          fill={leader === 'R1' ? 'rgba(124,58,237,0.18)' : promoting ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)'}
          stroke={leader === 'R1' ? '#7C3AED' : promoting ? '#F59E0B' : '#3B82F6'}
          strokeWidth={promoting ? 2.5 : 2}
        />
        <text x={R1.x} y={R1.y-4} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="var(--text)">
          {leader === 'R1' ? '★ ' : ''}Replica 1
        </text>
        <text x={R1.x} y={R1.y+10} textAnchor="middle" fontSize={9} fill={leader === 'R1' ? '#A78BFA' : 'var(--text-dim)'} fontFamily="'IBM Plex Mono', monospace">
          {leader === 'R1' ? 'LEADER' : promoting ? 'ELECT…' : 'REPLICA'}
        </text>
        <text x={R1.x} y={R1.y+48} textAnchor="middle" fontSize={9} fill={lag.r1 > 0 ? '#F59E0B' : '#22C55E'} fontFamily="'IBM Plex Mono', monospace">
          lag: {lag.r1}ms
        </text>

        {/* Replica 2 */}
        <circle cx={R2.x} cy={R2.y} r={32} fill="rgba(59,130,246,0.12)" stroke="#3B82F6" strokeWidth={2} />
        <text x={R2.x} y={R2.y-4} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="var(--text)">Replica 2</text>
        <text x={R2.x} y={R2.y+10} textAnchor="middle" fontSize={9} fill="var(--text-dim)" fontFamily="'IBM Plex Mono', monospace">REPLICA</text>
        <text x={R2.x} y={R2.y+48} textAnchor="middle" fontSize={9} fill={lag.r2 > 0 ? '#F59E0B' : '#22C55E'} fontFamily="'IBM Plex Mono', monospace">
          lag: {lag.r2}ms
        </text>

        {/* Mode label */}
        <text x={250} y={270} textAnchor="middle" fontSize={9.5} fill="var(--text-muted)" fontFamily="'IBM Plex Mono', monospace">
          {MODE_INFO[mode]}
        </text>
      </svg>

      {/* Log */}
      <div style={{ marginTop: 10, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', padding: '10px 14px', maxHeight: 110, overflowY: 'auto' }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 5, letterSpacing: '0.06em' }}>EVENT LOG</div>
        {log.length === 0
          ? <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>Click "Write Data" to begin…</div>
          : log.map((e, i) => (
            <div key={i} style={{ fontSize: 11, color: i === 0 ? 'var(--text)' : 'var(--text-dim)', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.6, opacity: Math.max(0.3, 1 - i * 0.12) }}>{e}</div>
          ))
        }
      </div>
    </div>
  );
}
