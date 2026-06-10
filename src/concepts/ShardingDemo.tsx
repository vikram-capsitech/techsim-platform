import { useState, useMemo } from 'react';

type Strategy = 'range' | 'hash';

interface Record {
  id: number;
  userId: number;
  value: string;
}

const SAMPLE_RECORDS: Record[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  userId: Math.floor(Math.random() * 1000) + 1,
  value: `row_${i + 1}`,
}));

const SHARD_COLORS = ['#7C3AED', '#2563EB', '#D97706', '#DC2626', '#059669'];

function hashFn(id: number, n: number): number {
  return ((id * 2654435761) >>> 0) % n;
}

function getRangeShard(id: number, n: number): number {
  const maxId = 25;
  const rangeSize = Math.ceil(maxId / n);
  return Math.min(Math.floor((id - 1) / rangeSize), n - 1);
}

export function ShardingDemo() {
  const [strategy, setStrategy] = useState<Strategy>('hash');
  const [numShards, setNumShards] = useState(3);
  const [hotKeyId, setHotKeyId] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const getShardIndex = (rec: Record) => {
    return strategy === 'hash' ? hashFn(rec.id, numShards) : getRangeShard(rec.id, numShards);
  };

  const shards = useMemo(() => {
    const s: { index: number; records: Record[] }[] = Array.from({ length: numShards }, (_, i) => ({
      index: i, records: [],
    }));
    SAMPLE_RECORDS.forEach(rec => {
      s[getShardIndex(rec)].records.push(rec);
    });
    return s;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy, numShards]);

  const hotShard = hotKeyId !== null ? getShardIndex({ id: hotKeyId, userId: hotKeyId, value: '' }) : null;

  const addShard = () => {
    if (numShards >= 5) return;
    setNumShards(n => n + 1);
  };

  const removeShard = () => {
    if (numShards <= 2) return;
    setNumShards(n => n - 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: "'DM Sans', sans-serif", color: 'var(--text)' }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Strategy toggle */}
        <div style={{ display: 'flex', gap: 3, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
          {(['hash', 'range'] as Strategy[]).map(s => (
            <button
              key={s}
              onClick={() => setStrategy(s)}
              style={{
                padding: '5px 16px', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontSize: 12.5, fontWeight: 600, textTransform: 'capitalize',
                background: strategy === s ? 'var(--accent)' : 'transparent',
                color: strategy === s ? 'white' : 'var(--text-dim)',
                transition: 'all 0.15s',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <button onClick={addShard} disabled={numShards >= 5}
          style={{
            padding: '6px 12px', borderRadius: 6, border: 'none', cursor: numShards >= 5 ? 'not-allowed' : 'pointer',
            background: '#22C55E', color: 'white', fontSize: 12, fontWeight: 600, opacity: numShards >= 5 ? 0.5 : 1,
          }}>
          + Shard
        </button>
        <button onClick={removeShard} disabled={numShards <= 2}
          style={{
            padding: '6px 12px', borderRadius: 6, border: 'none', cursor: numShards <= 2 ? 'not-allowed' : 'pointer',
            background: '#EF4444', color: 'white', fontSize: 12, fontWeight: 600, opacity: numShards <= 2 ? 0.5 : 1,
          }}>
          − Shard
        </button>

        <button
          onClick={() => setHotKeyId(hotKeyId ? null : 1)}
          style={{
            padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
            background: hotKeyId ? 'rgba(239,68,68,0.12)' : 'var(--card-bg)',
            border: `1px solid ${hotKeyId ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
            color: hotKeyId ? '#EF4444' : 'var(--text-dim)',
            fontSize: 12, fontWeight: 600,
          }}>
          {hotKeyId ? '🔥 Hotspot ON' : '🔥 Simulate Hotspot'}
        </button>

        <span style={{ fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-muted)' }}>
          {numShards} shards · {SAMPLE_RECORDS.length} records
        </span>
      </div>

      {/* Shard grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numShards}, 1fr)`, gap: 10 }}>
        {shards.map(({ index, records }) => {
          const color = SHARD_COLORS[index];
          const isHot = hotShard === index;
          const load = records.length / SAMPLE_RECORDS.length;

          return (
            <div key={index} style={{
              background: 'var(--card-bg)',
              border: `1px solid ${isHot ? '#EF4444' : color + '40'}`,
              borderRadius: 10, padding: '10px 12px',
              boxShadow: isHot ? '0 0 16px rgba(239,68,68,0.25)' : 'none',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color }}>
                  SHARD {index}
                  {strategy === 'range' && (
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                      {' '}({Math.floor(index * 25 / numShards) + 1}–{Math.floor((index + 1) * 25 / numShards)})
                    </span>
                  )}
                </div>
                {isHot && <span style={{ fontSize: 13 }}>🔥</span>}
              </div>

              {/* Load bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: isHot ? '#EF4444' : color,
                    width: `${load * 100}%`,
                    transition: 'width 0.3s',
                  }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>
                  {records.length} records ({Math.round(load * 100)}% load)
                </div>
              </div>

              {/* Records */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {records.map(rec => (
                  <div
                    key={rec.id}
                    onMouseEnter={() => setHovered(rec.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      width: 22, height: 22, borderRadius: 4,
                      background: rec.id === hotKeyId ? '#EF4444' : color,
                      opacity: hovered === rec.id ? 1 : 0.75,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, color: 'white', fontFamily: "'IBM Plex Mono', monospace",
                      cursor: 'pointer', fontWeight: 700,
                      transition: 'transform 0.1s',
                      transform: hovered === rec.id ? 'scale(1.3)' : 'none',
                    }}
                    title={`ID: ${rec.id} | shard(${rec.id}) = ${index}`}
                  >
                    {rec.id}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      <div style={{
        background: 'var(--panel-bg)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '10px 14px', fontSize: 12.5,
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        {strategy === 'hash' ? (
          <span style={{ color: '#7C3AED' }}>
            Hash sharding: records are distributed evenly using hash(id) % {numShards}.
            No range queries possible across shards.
          </span>
        ) : (
          <span style={{ color: '#D97706' }}>
            Range sharding: records with IDs 1–{Math.floor(25 / numShards)} → Shard 0, etc.
            Efficient range queries but risks hotspots on sequential IDs.
          </span>
        )}
        {hotKeyId && (
          <div style={{ color: '#EF4444', marginTop: 6 }}>
            🔥 Hotspot: record #{hotKeyId} is being accessed 100× more than others → Shard {hotShard} is overloaded.
            Solution: use composite shard keys or add a random salt to the hot key.
          </div>
        )}
      </div>
    </div>
  );
}
