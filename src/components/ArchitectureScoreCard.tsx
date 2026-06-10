import type { Node, Edge } from '@xyflow/react';

export interface ScoreCategory {
  label: string;
  score: number;
  max: number;
  passed: boolean;
  detail: string;
}

export interface ScoreResult {
  total: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  categories: ScoreCategory[];
  suggestions: string[];
}

// ── Scoring engine ────────────────────────────────────────────────────────────

export function calculateScore(nodes: Node[], edges: Edge[]): ScoreResult {
  const ids = nodes.map(n => (n.data as { nodeTypeId?: string }).nodeTypeId ?? '');
  const has = (...types: string[]) => types.some(t => ids.includes(t));

  const categories: ScoreCategory[] = [];
  const suggestions: string[] = [];

  // 1. Security (25 pts)
  let secPts = 0;
  if (has('waf'))          { secPts += 10; } else suggestions.push('Add a WAF in front of internet-facing entry points.');
  if (has('auth-service')) { secPts += 8;  } else suggestions.push('Add an Auth Service for centralized authentication & JWT validation.');
  if (has('firewall'))     { secPts += 7;  } else suggestions.push('Add a Firewall to restrict unexpected traffic.');
  categories.push({ label: 'Security', score: secPts, max: 25, passed: secPts >= 15, detail: 'WAF, Auth Service, Firewall' });

  // 2. Reliability (25 pts)
  let relPts = 0;
  if (has('load-balancer')) { relPts += 10; } else suggestions.push('Add a Load Balancer to eliminate single-point-of-failure on entry.');
  const hasReplicas = nodes.some(n => ((n.data as { replicas?: number }).replicas ?? 1) > 1);
  if (hasReplicas) { relPts += 8; } else suggestions.push('Add replicas (replicas > 1) to critical services for redundancy.');
  if (nodes.length >= 5)   { relPts += 7; } else suggestions.push('Expand architecture to at least 5 components for meaningful redundancy.');
  categories.push({ label: 'Reliability', score: relPts, max: 25, passed: relPts >= 15, detail: 'Load Balancer, replicas, node count' });

  // 3. Observability (20 pts)
  let obsPts = 0;
  if (has('prometheus', 'grafana')) { obsPts += 10; } else suggestions.push('Add Prometheus + Grafana for metrics and dashboards.');
  if (has('jaeger'))                { obsPts += 5;  } else suggestions.push('Add Jaeger or a tracing service for distributed tracing.');
  if (has('log-agg'))               { obsPts += 5;  } else suggestions.push('Add a log aggregator (ELK/Fluentd) for centralized logging.');
  categories.push({ label: 'Observability', score: obsPts, max: 20, passed: obsPts >= 10, detail: 'Prometheus/Grafana, Jaeger, log aggregation' });

  // 4. Performance (20 pts)
  let perfPts = 0;
  if (has('redis'))              { perfPts += 8; } else suggestions.push('Add Redis for in-memory caching to reduce database load.');
  if (has('cdn'))                { perfPts += 6; } else suggestions.push('Add a CDN to serve static assets with low latency globally.');
  if (has('kafka', 'rabbitmq', 'sqs', 'event-bus')) { perfPts += 6; } else suggestions.push('Add a message queue to decouple services and handle traffic spikes.');
  categories.push({ label: 'Performance', score: perfPts, max: 20, passed: perfPts >= 10, detail: 'Redis cache, CDN, message queue' });

  // 5. Architecture Quality (10 pts)
  let archPts = 0;
  if (has('api-gateway'))    { archPts += 5; } else suggestions.push('Add an API Gateway as a unified entry point for microservices.');
  if (has('rate-limiter'))   { archPts += 5; } else suggestions.push('Add a Rate Limiter to protect APIs from abuse and DDoS.');
  categories.push({ label: 'Architecture', score: archPts, max: 10, passed: archPts >= 6, detail: 'API Gateway, Rate Limiter' });

  // Check for isolated nodes
  const connectedIds = new Set([...edges.map(e => e.source), ...edges.map(e => e.target)]);
  const isolated = nodes.filter(n => !connectedIds.has(n.id));
  if (isolated.length > 0) {
    suggestions.push(`${isolated.length} node(s) have no connections — every component should be connected.`);
  }

  const total = categories.reduce((s, c) => s + c.score, 0);
  const grade = total >= 90 ? 'S' : total >= 80 ? 'A' : total >= 65 ? 'B' : total >= 50 ? 'C' : total >= 35 ? 'D' : 'F';

  return { total, grade, categories, suggestions: suggestions.slice(0, 5) };
}

// ── Component ─────────────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, string> = {
  S: '#F59E0B', A: '#22C55E', B: '#06B6D4', C: '#7C3AED', D: '#F97316', F: '#EF4444',
};

interface Props {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
}

export function ArchitectureScoreCard({ nodes, edges, onClose }: Props) {
  const result = calculateScore(nodes, edges);
  const gradeColor = GRADE_COLORS[result.grade];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 900, backdropFilter: 'blur(2px)' }}
      />

      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 901, width: 480, maxHeight: '80vh', overflowY: 'auto',
        background: 'var(--panel-bg)', border: '1px solid var(--border)',
        borderRadius: 16, boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Architecture Score</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>
              {nodes.length} components · {edges.length} connections
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Grade badge */}
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              border: `3px solid ${gradeColor}`,
              background: gradeColor + '15',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 20px ${gradeColor}40`,
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{result.grade}</div>
              <div style={{ fontSize: 10, color: gradeColor, fontFamily: "'IBM Plex Mono', monospace" }}>{result.total}/100</div>
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-dim)', fontSize: 20, lineHeight: 1, padding: '0 4px',
            }}>×</button>
          </div>
        </div>

        {/* Categories */}
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {result.categories.map(cat => (
            <CategoryRow key={cat.label} cat={cat} />
          ))}
        </div>

        {/* Score total bar */}
        <div style={{ padding: '0 24px 16px' }}>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: `linear-gradient(90deg, ${gradeColor}, ${gradeColor}88)`,
              width: `${result.total}%`,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>

        {/* Suggestions */}
        {result.suggestions.length > 0 && (
          <div style={{ padding: '0 24px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'IBM Plex Mono', monospace" }}>
              Recommendations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {result.suggestions.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.5,
                }}>
                  <span style={{ color: '#F59E0B', flexShrink: 0 }}>→</span>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function CategoryRow({ cat }: { cat: ScoreCategory }) {
  const pct = Math.round((cat.score / cat.max) * 100);
  const color = cat.passed ? '#22C55E' : cat.score > 0 ? '#F59E0B' : '#EF4444';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <div>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{cat.label}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace', marginLeft: 8" }}>  {cat.detail}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'IBM Plex Mono', monospace" }}>
          {cat.score}/{cat.max}
        </span>
      </div>
      <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3, background: color,
          width: `${pct}%`, transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}
