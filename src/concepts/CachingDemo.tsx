import { useState } from 'react';

type Pattern = 'cache-aside' | 'write-through' | 'write-behind';

interface CacheEntry { key: string; value: string; dirty?: boolean }

// ── Step definitions per pattern ───────────────────────────────────────────
const READ_STEPS: Record<Pattern, string[]> = {
  'cache-aside': [
    '1. App checks cache for key "user:42"',
    '2. CACHE MISS — key not found in cache',
    '3. App queries database directly',
    '4. Database returns data',
    '5. App writes result to cache (TTL 60s)',
    '6. App returns data to client',
  ],
  'write-through': [
    '1. App checks cache for key "user:42"',
    '2. CACHE MISS — key not found',
    '3. Cache queries database (cache is transparent to app)',
    '4. Database returns data',
    '5. Cache stores result, returns to app',
    '6. App returns data to client',
  ],
  'write-behind': [
    '1. App checks cache for key "user:42"',
    '2. CACHE HIT — returns immediately from cache',
    '3. App returns data to client',
  ],
};

const WRITE_STEPS: Record<Pattern, string[]> = {
  'cache-aside': [
    '1. App writes to database directly',
    '2. Database confirms write (durable)',
    '3. App invalidates / deletes cache entry',
    '4. Next read will be a miss → refreshes from DB',
  ],
  'write-through': [
    '1. App writes to cache',
    '2. Cache synchronously writes to database',
    '3. Database confirms write',
    '4. Write confirmed to app — cache & DB always in sync',
  ],
  'write-behind': [
    '1. App writes to cache only',
    '2. Write returns immediately (lowest latency)',
    '3. Cache queues write for async flush to database',
    '4. Database updated asynchronously (eventual)',
    '⚠  Data loss risk if cache node fails before flush',
  ],
};

const PROS: Record<Pattern, string[]> = {
  'cache-aside':   ['Simple, explicit control', "Cache only what's needed", 'Resilient to cache failure'],
  'write-through': ['Cache always consistent', 'No stale reads', 'Simple read path'],
  'write-behind':  ['Lowest write latency', 'Absorbs write bursts', 'DB sees batch writes'],
};
const CONS: Record<Pattern, string[]> = {
  'cache-aside':   ['Cold start — first read always misses', 'Stale data window = TTL', 'App must manage cache explicitly'],
  'write-through': ['Write latency = cache + DB', 'Cache may hold rarely-read data', 'Cache failure blocks writes'],
  'write-behind':  ['Risk of data loss on cache failure', 'Complex ordering guarantees', 'DB and cache briefly inconsistent'],
};

const PATTERN_COLOR: Record<Pattern, string> = {
  'cache-aside':   '#22C55E',
  'write-through': '#3B82F6',
  'write-behind':  '#F59E0B',
};

export function CachingDemo() {
  const [pattern, setPattern]   = useState<Pattern>('cache-aside');
  const [cache, setCache]       = useState<CacheEntry[]>([]);
  const [readStep, setReadStep] = useState<number>(-1);
  const [writeStep, setWriteStep] = useState<number>(-1);
  const [hits, setHits]         = useState(0);
  const [misses, setMisses]     = useState(0);
  const [animating, setAnimating] = useState(false);

  const color = PATTERN_COLOR[pattern];

  const runSteps = async (steps: string[], setStep: (n: number) => void) => {
    if (animating) return;
    setAnimating(true);
    for (let i = 0; i < steps.length; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, 650));
    }
    setStep(-1);
    setAnimating(false);
  };

  const doRead = () => {
    const inCache = cache.some(e => e.key === 'user:42');
    if (pattern === 'write-behind' && inCache) {
      setHits(h => h + 1);
    } else if (!inCache) {
      setMisses(m => m + 1);
      setCache(p => [...p.filter(e => e.key !== 'user:42'), { key: 'user:42', value: 'Alice' }]);
    } else {
      setHits(h => h + 1);
    }
    runSteps(READ_STEPS[pattern], setReadStep);
  };

  const doWrite = () => {
    if (pattern === 'cache-aside') {
      setCache(p => p.filter(e => e.key !== 'user:42'));
    } else if (pattern === 'write-through') {
      setCache(p => [...p.filter(e => e.key !== 'user:42'), { key: 'user:42', value: 'Bob (updated)' }]);
    } else {
      setCache(p => [...p.filter(e => e.key !== 'user:42'), { key: 'user:42', value: 'Bob (pending flush)', dirty: true }]);
    }
    runSteps(WRITE_STEPS[pattern], setWriteStep);
  };

  const doReset = () => {
    setCache([]); setHits(0); setMisses(0); setReadStep(-1); setWriteStep(-1);
  };

  const activeSteps = readStep >= 0 ? READ_STEPS[pattern] : WRITE_STEPS[pattern];
  const activeIdx   = readStep >= 0 ? readStep : writeStep;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Pattern tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['cache-aside', 'write-through', 'write-behind'] as Pattern[]).map(p => (
          <button key={p} onClick={() => { setPattern(p); doReset(); }} style={{
            padding: '4px 13px', borderRadius: 6, cursor: 'pointer', fontSize: 11.5,
            fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
            background: pattern === p ? color : 'var(--card-bg)',
            color: pattern === p ? (p === 'write-through' ? 'white' : 'black') : 'var(--text-dim)',
            border: `1px solid ${pattern === p ? 'transparent' : 'var(--border)'}`,
            opacity: pattern === p ? 1 : 0.8,
          }}>{p}</button>
        ))}
      </div>

      {/* Flow diagram + step log side by side */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        {/* Flow */}
        <div style={{ flex: '0 0 auto' }}>
          <svg viewBox="0 0 200 160" style={{ width: 200, height: 160 }}>
            {/* App box */}
            <rect x={10} y={60} width={50} height={36} rx={7} fill="rgba(59,130,246,0.12)" stroke="#3B82F6" strokeWidth={1.5} />
            <text x={35} y={79} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text)">Application</text>

            {/* Cache box */}
            <rect x={75} y={60} width={50} height={36} rx={7}
              fill={`${color}18`} stroke={color} strokeWidth={2}
            />
            <text x={100} y={76} textAnchor="middle" fontSize={9} fontWeight={700} fill={color}>Cache</text>
            <text x={100} y={87} textAnchor="middle" fontSize={7.5} fill={color} fontFamily="'IBM Plex Mono', monospace">
              {cache.length > 0 ? `${cache.length} entry` : 'empty'}
            </text>

            {/* DB box */}
            <rect x={140} y={60} width={50} height={36} rx={7} fill="rgba(245,158,11,0.1)" stroke="#F59E0B" strokeWidth={1.5} />
            <text x={165} y={79} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text)">Database</text>

            {/* App → Cache arrow */}
            <line x1={60} y1={78} x2={75} y2={78} stroke={color} strokeWidth={1.5} />
            <polygon points="75,74 82,78 75,82" fill={color} />

            {/* Cache → DB arrow */}
            <line x1={125} y1={78} x2={140} y2={78} stroke="#F59E0B" strokeWidth={1.5} />
            <polygon points="140,74 147,78 140,82" fill="#F59E0B" />

            {/* Client → App */}
            <text x={8} y={42} fontSize={8} fill="var(--text-muted)" fontFamily="'IBM Plex Mono', monospace">client</text>
            <line x1={25} y1={46} x2={25} y2={60} stroke="#3B82F6" strokeWidth={1.5} />
            <polygon points="21,60 25,67 29,60" fill="#3B82F6" />

            {/* Animated step highlight */}
            {activeIdx >= 0 && (
              <circle cx={100} cy={78} r={22} fill="none" stroke={color} strokeWidth={2}
                strokeDasharray="6 3" opacity={0.7}>
                <animateTransform attributeName="transform" type="rotate" from="0 100 78" to="360 100 78" dur="2s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Hit/miss counters */}
            <text x={10} y={120} fontSize={8} fill="#22C55E" fontFamily="'IBM Plex Mono', monospace">✓ hits: {hits}</text>
            <text x={10} y={132} fontSize={8} fill="#EF4444" fontFamily="'IBM Plex Mono', monospace">✗ misses: {misses}</text>
            <text x={10} y={144} fontSize={7.5} fill="var(--text-muted)" fontFamily="'IBM Plex Mono', monospace">
              ratio: {hits + misses > 0 ? Math.round(hits / (hits + misses) * 100) : 0}% hit
            </text>
          </svg>
        </div>

        {/* Step log */}
        <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', padding: '10px 12px', minHeight: 160 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 7, letterSpacing: '0.06em' }}>
            {readStep >= 0 ? 'READ FLOW' : writeStep >= 0 ? 'WRITE FLOW' : 'STEP-BY-STEP LOG'}
          </div>
          {activeIdx < 0 ? (
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>Click Read or Write to see the flow…</div>
          ) : activeSteps.map((step, i) => (
            <div key={i} style={{
              fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.65,
              color: i === activeIdx ? 'var(--text)' : i < activeIdx ? `${color}` : 'var(--text-muted)',
              fontWeight: i === activeIdx ? 600 : 400,
              opacity: i > activeIdx ? 0.35 : 1,
              paddingLeft: i === activeIdx ? 8 : 0,
              borderLeft: i === activeIdx ? `2px solid ${color}` : '2px solid transparent',
              transition: 'all 0.2s',
            }}>{step}</div>
          ))}
        </div>
      </div>

      {/* Cache state */}
      <div style={{ background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', padding: '8px 12px', marginBottom: 12 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6, letterSpacing: '0.06em' }}>CACHE STATE</div>
        {cache.length === 0
          ? <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>(empty)</span>
          : cache.map((e, i) => (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
              background: e.dirty ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.1)',
              border: `1px solid ${e.dirty ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.25)'}`,
              borderRadius: 5, padding: '3px 9px', marginRight: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>{e.key}</span>
              <span style={{ color: 'var(--text)' }}>→</span>
              <span style={{ color: e.dirty ? '#F59E0B' : '#22C55E' }}>{e.value}</span>
              {e.dirty && <span style={{ fontSize: 9, color: '#F59E0B' }}>DIRTY</span>}
            </div>
          ))
        }
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={doRead} disabled={animating} style={{
          padding: '6px 18px', borderRadius: 7, border: 'none', cursor: animating ? 'not-allowed' : 'pointer',
          fontSize: 12.5, fontWeight: 600, background: '#3B82F6', color: 'white', opacity: animating ? 0.5 : 1,
        }}>Read user:42</button>
        <button onClick={doWrite} disabled={animating} style={{
          padding: '6px 18px', borderRadius: 7, cursor: animating ? 'not-allowed' : 'pointer',
          fontSize: 12.5, fontWeight: 600, opacity: animating ? 0.5 : 1,
          background: `${color}18`, border: `1px solid ${color}40`, color,
        }}>Write user:42</button>
        <button onClick={doReset} style={{
          padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
          background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
        }}>Reset</button>
      </div>

      {/* Pros/Cons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#22C55E', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>PROS</div>
          {PROS[pattern].map((p, i) => <div key={i} style={{ fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>+ {p}</div>)}
        </div>
        <div style={{ flex: 1, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>CONS</div>
          {CONS[pattern].map((c, i) => <div key={i} style={{ fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>− {c}</div>)}
        </div>
      </div>
    </div>
  );
}
