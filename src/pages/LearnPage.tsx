import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Maps LearnPage track IDs → theory JSON trackId + lesson ID prefix
const TRACK_THEORY_MAP: Record<string, { theoryTrackId: string; lessonIdPrefix: string }> = {
  'system-design-fundamentals': { theoryTrackId: 'fundamentals', lessonIdPrefix: 'l1_' },
  'distributed-systems':        { theoryTrackId: 'distributed',  lessonIdPrefix: 'l3_' },
  'networking-security':        { theoryTrackId: 'security',     lessonIdPrefix: 'l5_' },
  'chaos-engineering':          { theoryTrackId: 'devops',       lessonIdPrefix: 'l6_' },
  'database-design':            { theoryTrackId: 'backend',      lessonIdPrefix: 'l2_' },
  'microservices':              { theoryTrackId: 'backend',      lessonIdPrefix: 'l2_' },
  'performance-scalability':    { theoryTrackId: 'cloud',        lessonIdPrefix: 'l4_' },
};

// ── Types ───────────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  tags: string[];
  type: 'concept' | 'hands-on' | 'quiz' | 'case-study';
}

interface Track {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  hours: string;
  lessons: Lesson[];
}

// ── Data ────────────────────────────────────────────────────────────────────

const TRACKS: Track[] = [
  {
    id: 'system-design-fundamentals',
    title: 'System Design Fundamentals',
    description: 'Master the core building blocks of scalable, reliable systems used at top tech companies.',
    icon: '🏗️',
    color: '#7C3AED',
    difficulty: 'Beginner',
    hours: '6h',
    lessons: [
      { id: 'sdf-1', title: 'What is System Design?', description: 'Overview of system design interviews and real-world architecture decisions.', duration: '20 min', tags: ['overview', 'career'], type: 'concept' },
      { id: 'sdf-2', title: 'Client-Server Architecture', description: 'How browsers, mobile apps, and APIs communicate. HTTP, REST, and request lifecycle.', duration: '35 min', tags: ['http', 'rest', 'api'], type: 'concept' },
      { id: 'sdf-3', title: 'Load Balancers & Reverse Proxies', description: 'Layer 4 vs Layer 7 load balancing, health checks, session affinity, and common patterns (Nginx, HAProxy).', duration: '40 min', tags: ['load-balancing', 'nginx'], type: 'hands-on' },
      { id: 'sdf-4', title: 'DNS & CDN Fundamentals', description: 'How domain resolution works, TTLs, CDN edge nodes, and cache invalidation strategies.', duration: '30 min', tags: ['dns', 'cdn', 'caching'], type: 'concept' },
      { id: 'sdf-5', title: 'Horizontal vs Vertical Scaling', description: 'When to scale up vs out. Stateless services, session management, and the 12-factor app model.', duration: '35 min', tags: ['scaling', '12-factor'], type: 'concept' },
      { id: 'sdf-6', title: 'Back-of-Envelope Estimation', description: 'Estimating QPS, storage, bandwidth, and memory for any system. Practice with real scenarios.', duration: '40 min', tags: ['estimation', 'interview'], type: 'quiz' },
    ],
  },
  {
    id: 'distributed-systems',
    title: 'Distributed Systems',
    description: 'Deep dive into consensus, replication, and the fundamental challenges of building distributed software.',
    icon: '🌐',
    color: '#2563EB',
    difficulty: 'Advanced',
    hours: '10h',
    lessons: [
      { id: 'ds-1', title: 'CAP Theorem & PACELC', description: 'Consistency, Availability, Partition tolerance — and why you always choose two in a distributed system.', duration: '45 min', tags: ['cap', 'consistency', 'availability'], type: 'concept' },
      { id: 'ds-2', title: 'Eventual Consistency in Practice', description: 'How DynamoDB, Cassandra, and CouchDB achieve high availability through eventual consistency.', duration: '50 min', tags: ['eventual-consistency', 'dynamo'], type: 'case-study' },
      { id: 'ds-3', title: 'Raft Consensus Algorithm', description: 'Leader election, log replication, and safety guarantees. Walk through a Raft cluster simulation.', duration: '60 min', tags: ['raft', 'consensus', 'etcd'], type: 'hands-on' },
      { id: 'ds-4', title: 'Vector Clocks & Lamport Timestamps', description: 'Ordering events in distributed systems without a global clock.', duration: '40 min', tags: ['clocks', 'ordering', 'causality'], type: 'concept' },
      { id: 'ds-5', title: 'Distributed Transactions: 2PC & Saga', description: 'Two-phase commit, its failure modes, and how the Saga pattern solves long-running transactions.', duration: '55 min', tags: ['transactions', '2pc', 'saga'], type: 'concept' },
      { id: 'ds-6', title: 'Consistent Hashing & Partitioning', description: 'Distributing data across nodes with minimal reshuffling. Chord, virtual nodes, and hotspot avoidance.', duration: '50 min', tags: ['consistent-hashing', 'sharding'], type: 'hands-on' },
    ],
  },
  {
    id: 'database-design',
    title: 'Database & Storage',
    description: 'SQL fundamentals to advanced NoSQL patterns. Indexing, sharding, ACID, and choosing the right database.',
    icon: '🗃️',
    color: '#D97706',
    difficulty: 'Intermediate',
    hours: '8h',
    lessons: [
      { id: 'db-1', title: 'Relational vs Non-Relational', description: 'When to use PostgreSQL, MySQL, MongoDB, Cassandra, or Redis. Trade-off analysis with real examples.', duration: '35 min', tags: ['sql', 'nosql', 'trade-offs'], type: 'concept' },
      { id: 'db-2', title: 'Indexing Deep Dive', description: 'B-trees, hash indexes, compound indexes, covering indexes, and when indexes hurt more than they help.', duration: '50 min', tags: ['indexing', 'b-tree', 'performance'], type: 'hands-on' },
      { id: 'db-3', title: 'ACID Transactions & Isolation Levels', description: 'Atomicity, Consistency, Isolation, Durability. Phantom reads, dirty reads, and serializable isolation.', duration: '45 min', tags: ['acid', 'transactions', 'isolation'], type: 'concept' },
      { id: 'db-4', title: 'Database Replication Patterns', description: 'Leader-follower, multi-leader, leaderless replication. Read replicas for read scaling.', duration: '40 min', tags: ['replication', 'read-scaling'], type: 'concept' },
      { id: 'db-5', title: 'Sharding Strategies', description: 'Range, hash, and directory-based sharding. Cross-shard queries, hot shards, and resharding costs.', duration: '50 min', tags: ['sharding', 'partitioning', 'scalability'], type: 'hands-on' },
      { id: 'db-6', title: 'Schema Design for Scale', description: 'Denormalization, embedding vs referencing in document stores, time-series optimization patterns.', duration: '45 min', tags: ['schema', 'denormalization', 'mongodb'], type: 'case-study' },
    ],
  },
  {
    id: 'networking-security',
    title: 'Networking & Security',
    description: 'TCP/IP internals, TLS, zero-trust architecture, and building secure systems from first principles.',
    icon: '🔒',
    color: '#DC2626',
    difficulty: 'Intermediate',
    hours: '7h',
    lessons: [
      { id: 'ns-1', title: 'TCP/IP Stack Internals', description: 'How packets flow from your browser to a server. TCP handshake, flow control, and congestion control.', duration: '45 min', tags: ['tcp', 'networking', 'packets'], type: 'concept' },
      { id: 'ns-2', title: 'TLS 1.3 & Certificate Chains', description: 'Public key cryptography, certificate authorities, OCSP stapling, and mutual TLS (mTLS).', duration: '50 min', tags: ['tls', 'certificates', 'crypto'], type: 'concept' },
      { id: 'ns-3', title: 'API Security: Auth & Authorization', description: 'JWT, OAuth 2.0, OIDC, API keys. RBAC vs ABAC. Token refresh and revocation strategies.', duration: '55 min', tags: ['jwt', 'oauth', 'rbac'], type: 'hands-on' },
      { id: 'ns-4', title: 'Zero Trust Architecture', description: 'Never trust, always verify. Service mesh, mTLS, BeyondCorp model, and micro-segmentation.', duration: '40 min', tags: ['zero-trust', 'service-mesh', 'mtls'], type: 'concept' },
      { id: 'ns-5', title: 'DDoS Mitigation & Rate Limiting', description: 'Token bucket, leaky bucket, sliding window algorithms. Anycast networks and scrubbing centers.', duration: '45 min', tags: ['ddos', 'rate-limiting', 'resilience'], type: 'hands-on' },
      { id: 'ns-6', title: 'OWASP Top 10 for System Designers', description: 'SQL injection, XSS, SSRF, insecure deserialization — and how to design systems that resist them.', duration: '50 min', tags: ['owasp', 'security', 'vulnerabilities'], type: 'case-study' },
    ],
  },
  {
    id: 'microservices',
    title: 'Microservices Architecture',
    description: 'Decompose monoliths into services, manage inter-service communication, and handle distributed failures gracefully.',
    icon: '⚙️',
    color: '#0891B2',
    difficulty: 'Intermediate',
    hours: '9h',
    lessons: [
      { id: 'ms-1', title: 'Microservices vs Monolith', description: 'When microservices make sense (and when they don\'t). Conway\'s Law, team topology, and decomposition strategies.', duration: '40 min', tags: ['architecture', 'trade-offs', 'conways-law'], type: 'concept' },
      { id: 'ms-2', title: 'Service Discovery & API Gateways', description: 'Client-side vs server-side discovery. Consul, Kubernetes DNS, API gateway patterns (aggregation, BFF).', duration: '50 min', tags: ['service-discovery', 'api-gateway', 'kubernetes'], type: 'hands-on' },
      { id: 'ms-3', title: 'Inter-Service Communication', description: 'Sync (gRPC, REST) vs async (message queues). Request/reply, publish-subscribe, and event streaming.', duration: '55 min', tags: ['grpc', 'messaging', 'kafka'], type: 'concept' },
      { id: 'ms-4', title: 'Circuit Breaker & Bulkhead Patterns', description: 'Preventing cascade failures. Hystrix, Resilience4j, and timeout/retry/fallback configurations.', duration: '45 min', tags: ['circuit-breaker', 'resilience', 'hystrix'], type: 'hands-on' },
      { id: 'ms-5', title: 'Distributed Tracing & Observability', description: 'OpenTelemetry, Jaeger, Zipkin. Correlation IDs, span propagation, and building traceable services.', duration: '50 min', tags: ['tracing', 'opentelemetry', 'observability'], type: 'hands-on' },
      { id: 'ms-6', title: 'Strangler Fig: Migrating Monoliths', description: 'Incrementally replace a monolith with microservices without a big-bang rewrite.', duration: '45 min', tags: ['migration', 'strangler-fig', 'patterns'], type: 'case-study' },
    ],
  },
  {
    id: 'performance-scalability',
    title: 'Performance & Scalability',
    description: 'Profile bottlenecks, design caching hierarchies, and architect systems that handle 10× traffic spikes.',
    icon: '⚡',
    color: '#059669',
    difficulty: 'Advanced',
    hours: '8h',
    lessons: [
      { id: 'ps-1', title: 'Caching Strategies & Cache Hierarchies', description: 'L1/L2/L3 caches, CDN, Redis, in-process caches. Cache-aside, write-through, write-back, read-through.', duration: '50 min', tags: ['caching', 'redis', 'cdn'], type: 'concept' },
      { id: 'ps-2', title: 'Database Query Optimization', description: 'EXPLAIN plans, N+1 queries, connection pooling, prepared statements, and materialized views.', duration: '55 min', tags: ['sql', 'query-optimization', 'performance'], type: 'hands-on' },
      { id: 'ps-3', title: 'Asynchronous Processing & Queues', description: 'Offloading work to background workers. SQS, RabbitMQ, Celery, and designing idempotent consumers.', duration: '50 min', tags: ['async', 'queues', 'workers'], type: 'hands-on' },
      { id: 'ps-4', title: 'Read/Write Splitting & CQRS', description: 'Command Query Responsibility Segregation, event sourcing, and projections for high-read workloads.', duration: '55 min', tags: ['cqrs', 'event-sourcing', 'read-scaling'], type: 'concept' },
      { id: 'ps-5', title: 'Profiling & Finding Bottlenecks', description: 'Flame graphs, APM tools (Datadog, New Relic), and systematic bottleneck identification methodology.', duration: '45 min', tags: ['profiling', 'apm', 'flame-graphs'], type: 'hands-on' },
      { id: 'ps-6', title: 'Designing for 10× Traffic Spikes', description: 'Auto-scaling strategies, pre-warming, graceful degradation, and load-shedding at scale.', duration: '50 min', tags: ['auto-scaling', 'load-shedding', 'spikes'], type: 'case-study' },
    ],
  },
  {
    id: 'chaos-engineering',
    title: 'Chaos Engineering & SRE',
    description: 'Build confidence in your system\'s resilience by deliberately injecting failures. SLOs, SLAs, and error budgets.',
    icon: '🌪️',
    color: '#7C3AED',
    difficulty: 'Advanced',
    hours: '7h',
    lessons: [
      { id: 'ce-1', title: 'Principles of Chaos Engineering', description: 'Netflix\'s Simian Army, hypothesis-driven experimentation, and the chaos engineering mindset.', duration: '35 min', tags: ['chaos', 'netflix', 'resilience'], type: 'concept' },
      { id: 'ce-2', title: 'SLOs, SLAs, and Error Budgets', description: 'Google SRE error budget model. Defining availability targets, measuring SLO burn rate, and toil reduction.', duration: '45 min', tags: ['sre', 'slo', 'error-budget'], type: 'concept' },
      { id: 'ce-3', title: 'Failure Mode Analysis (FMEA)', description: 'Systematically mapping failure modes, severity, and detection methods before they hit production.', duration: '40 min', tags: ['fmea', 'reliability', 'risk'], type: 'hands-on' },
      { id: 'ce-4', title: 'Running Chaos Experiments', description: 'Using TechSim\'s chaos panel — crash nodes, inject latency, partition networks, and observe cascades.', duration: '50 min', tags: ['chaos-sim', 'experiments', 'hands-on'], type: 'hands-on' },
      { id: 'ce-5', title: 'Incident Management & Postmortems', description: 'Blameless postmortems, 5-Whys, action items, and building a culture of learning from failures.', duration: '40 min', tags: ['incidents', 'postmortem', 'culture'], type: 'case-study' },
      { id: 'ce-6', title: 'Game Days & Disaster Recovery', description: 'Planning and running game days. RTO/RPO targets, runbooks, and testing DR procedures.', duration: '45 min', tags: ['game-day', 'dr', 'runbooks'], type: 'hands-on' },
    ],
  },
];

const STORAGE_KEY = 'techsim_learn_completed';

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner:     '#22C55E',
  Intermediate: '#F59E0B',
  Advanced:     '#EF4444',
};

const TYPE_COLORS: Record<string, string> = {
  concept:    '#7C3AED',
  'hands-on': '#0891B2',
  quiz:       '#D97706',
  'case-study': '#DC2626',
};

// ── Component ────────────────────────────────────────────────────────────────

export function LearnPage() {
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  }, [completed]);

  const toggleLesson = (lessonId: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  const totalLessons = TRACKS.reduce((s, t) => s + t.lessons.length, 0);
  const completedCount = TRACKS.reduce(
    (s, t) => s + t.lessons.filter(l => completed.has(l.id)).length,
    0
  );
  const overallPct = Math.round((completedCount / totalLessons) * 100);

  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      background: 'var(--bg)',
      padding: '2rem',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{
              fontSize: 24, fontWeight: 700, margin: 0,
              color: 'var(--text)', letterSpacing: '-0.02em',
            }}>
              Learning Paths
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: 13.5, margin: '6px 0 0', fontFamily: "'IBM Plex Mono', monospace" }}>
              {TRACKS.length} tracks · {totalLessons} lessons · hands-on simulations included
            </p>
          </div>

          {/* Overall progress */}
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 18px', minWidth: 200,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-dim)', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Overall Progress
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-bright)', fontFamily: "'IBM Plex Mono', monospace" }}>
                {overallPct}%
              </span>
            </div>
            <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3,
                background: 'linear-gradient(90deg, var(--accent), #2563EB)',
                width: `${overallPct}%`,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5, fontFamily: "'IBM Plex Mono', monospace" }}>
              {completedCount} / {totalLessons} lessons complete
            </div>
          </div>
        </div>
      </div>

      {/* Track grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16,
      }}>
        {TRACKS.map(track => {
          const trackCompleted = track.lessons.filter(l => completed.has(l.id)).length;
          const trackPct = Math.round((trackCompleted / track.lessons.length) * 100);
          const isOpen = activeTrack === track.id;
          const isHovered = hovered === track.id && !isOpen;

          return (
            <div key={track.id} style={{ gridColumn: isOpen ? '1 / -1' : 'auto' }}>
              {/* Track card */}
              <div
                onClick={() => setActiveTrack(isOpen ? null : track.id)}
                onMouseEnter={() => setHovered(track.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: 'var(--card-bg)',
                  border: `1px solid ${isOpen ? track.color + '60' : isHovered ? track.color + '40' : 'var(--border)'}`,
                  borderRadius: isOpen ? '12px 12px 0 0' : 12,
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
                  transform: isHovered ? 'translateY(-2px)' : 'none',
                  boxShadow: isOpen
                    ? `0 0 0 1px ${track.color}30, 0 8px 32px rgba(0,0,0,0.3)`
                    : isHovered ? `0 4px 20px rgba(0,0,0,0.25)` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Icon */}
                  <div style={{
                    width: 44, height: 44, flexShrink: 0,
                    borderRadius: 11,
                    background: track.color + '18',
                    border: `1px solid ${track.color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    {track.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                        {track.title}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 7px',
                        borderRadius: 4,
                        background: DIFFICULTY_COLORS[track.difficulty] + '18',
                        border: `1px solid ${DIFFICULTY_COLORS[track.difficulty]}35`,
                        color: DIFFICULTY_COLORS[track.difficulty],
                        fontFamily: "'IBM Plex Mono', monospace",
                        letterSpacing: '0.04em',
                      }}>
                        {track.difficulty}
                      </span>
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: '0 0 10px', lineHeight: 1.5 }}>
                      {track.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: "'IBM Plex Mono', monospace" }}>
                        {track.lessons.length} lessons · {track.hours}
                      </span>
                      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', maxWidth: 120 }}>
                        <div style={{
                          height: '100%', borderRadius: 2,
                          background: track.color,
                          width: `${trackPct}%`,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: track.color, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                        {trackCompleted}/{track.lessons.length}
                      </span>
                      <span style={{
                        marginLeft: 'auto', fontSize: 13, color: isOpen ? track.color : 'var(--text-muted)',
                        transition: 'transform 0.2s, color 0.2s',
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        display: 'inline-block',
                      }}>
                        ▾
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded lesson list */}
              {isOpen && (
                <div style={{
                  background: 'var(--panel-bg)',
                  border: `1px solid ${track.color}40`,
                  borderTop: 'none',
                  borderRadius: '0 0 12px 12px',
                  padding: '4px 20px 16px',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: 8,
                    marginTop: 12,
                  }}>
                    {track.lessons.map((lesson, idx) => {
                      const isDone = completed.has(lesson.id);
                      return (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          index={idx + 1}
                          isDone={isDone}
                          trackColor={track.color}
                          trackId={track.id}
                          lessonIndex={idx + 1}
                          onToggle={() => toggleLesson(lesson.id)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── LessonCard ───────────────────────────────────────────────────────────────

function LessonCard({
  lesson,
  index,
  isDone,
  trackColor,
  trackId,
  lessonIndex,
  onToggle,
}: {
  lesson: Lesson;
  index: number;
  isDone: boolean;
  trackColor: string;
  trackId: string;
  lessonIndex: number;
  onToggle: () => void;
}) {
  const theoryMapping = TRACK_THEORY_MAP[trackId];
  const lessonPath = theoryMapping
    ? `/learn/${theoryMapping.theoryTrackId}/${theoryMapping.lessonIdPrefix}${lessonIndex}`
    : null;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isDone ? trackColor + '0C' : hovered ? 'var(--card-hover)' : 'var(--card-bg)',
        border: `1px solid ${isDone ? trackColor + '40' : hovered ? 'var(--border-bright)' : 'var(--border)'}`,
        borderRadius: 8,
        padding: '12px 14px',
        display: 'flex', gap: 12, alignItems: 'flex-start',
        transition: 'background 0.15s, border-color 0.15s',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        style={{
          width: 22, height: 22, flexShrink: 0,
          borderRadius: 6,
          border: `2px solid ${isDone ? trackColor : 'var(--border-bright)'}`,
          background: isDone ? trackColor : 'transparent',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: 1,
          transition: 'background 0.15s, border-color 0.15s',
        }}
      >
        {isDone && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{
            fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace",
            color: 'var(--text-muted)', fontWeight: 600,
          }}>
            {String(index).padStart(2, '0')}
          </span>
          <span style={{
            fontSize: 13.5, fontWeight: 600,
            color: isDone ? 'var(--text-dim)' : 'var(--text)',
            textDecoration: isDone ? 'line-through' : 'none',
          }}>
            {lesson.title}
          </span>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '0 0 8px', lineHeight: 1.5 }}>
          {lesson.description}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Type badge */}
          <span style={{
            fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
            padding: '2px 7px', borderRadius: 4,
            background: TYPE_COLORS[lesson.type] + '18',
            border: `1px solid ${TYPE_COLORS[lesson.type]}35`,
            color: TYPE_COLORS[lesson.type],
            letterSpacing: '0.04em',
          }}>
            {lesson.type}
          </span>

          {/* Duration */}
          <span style={{
            fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace",
            color: 'var(--text-muted)',
          }}>
            ⏱ {lesson.duration}
          </span>

          {/* Tags */}
          {lesson.tags.slice(0, 2).map(tag => (
            <span key={tag} style={{
              fontSize: 10, fontFamily: "'IBM Plex Mono', monospace",
              padding: '2px 7px', borderRadius: 4,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}>
              #{tag}
            </span>
          ))}

          {/* View Lesson link */}
          {lessonPath && (
            <Link
              to={lessonPath}
              style={{
                marginLeft: 'auto',
                fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 600, letterSpacing: '0.03em',
                color: trackColor,
                textDecoration: 'none',
                padding: '2px 8px', borderRadius: 4,
                border: `1px solid ${trackColor}40`,
                background: `${trackColor}0D`,
                whiteSpace: 'nowrap',
                transition: 'background 0.15s',
              }}
              onClick={e => e.stopPropagation()}
            >
              View Lesson →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
