import { useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface ToolOption {
  name: string;
  tagline: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  icon: string;
}

interface ToolRec {
  category: string;
  prompt: string;
  options: ToolOption[];
}

interface ToolRecommendationProps {
  nodeTypeId: string;
  onClose: () => void;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const RECOMMENDATIONS: Record<string, ToolRec> = {
  // ── Databases ──
  postgres: {
    category: 'Relational Database',
    prompt: 'PostgreSQL is a great choice. Here\'s how it compares to alternatives:',
    options: [
      {
        name: 'PostgreSQL', icon: '🐘', tagline: 'Advanced open-source RDBMS',
        pros: ['ACID transactions', 'Rich query planner', 'JSONB support', 'Extensions ecosystem'],
        cons: ['Vertical scaling primarily', 'Operational complexity at scale'],
        bestFor: 'Complex queries, financial data, mixed workloads',
      },
      {
        name: 'MySQL', icon: '🐬', tagline: 'Battle-tested relational DB',
        pros: ['Wide hosting support', 'Simpler replication', 'Excellent tooling'],
        cons: ['Fewer advanced features', 'Historically weaker JSON support'],
        bestFor: 'LAMP stacks, read-heavy web apps',
      },
      {
        name: 'PlanetScale', icon: '🌐', tagline: 'Serverless MySQL with branching',
        pros: ['Schema branching', 'Infinite reads', 'No operational overhead'],
        cons: ['No foreign keys by default', 'Vendor lock-in'],
        bestFor: 'Teams wanting Git-like DB workflows',
      },
    ],
  },
  mongodb: {
    category: 'Document Store',
    prompt: 'You dropped a MongoDB node. Compare your document DB options:',
    options: [
      {
        name: 'MongoDB', icon: '🍃', tagline: 'Leading document database',
        pros: ['Flexible schema', 'Aggregation pipeline', 'Atlas managed service', 'Change streams'],
        cons: ['No joins (workaround: $lookup)', 'Memory heavy'],
        bestFor: 'Catalogs, user profiles, content management',
      },
      {
        name: 'DynamoDB', icon: '⚡', tagline: 'AWS serverless key-value & document',
        pros: ['Single-digit ms at any scale', 'No servers', 'Pay per request'],
        cons: ['Complex access patterns', 'AWS-only', 'Costly at scale'],
        bestFor: 'High-throughput apps fully in AWS',
      },
      {
        name: 'Firestore', icon: '🔥', tagline: 'Google serverless document DB',
        pros: ['Real-time sync', 'Offline support', 'GCP integration'],
        cons: ['GCP lock-in', 'Limited query capabilities'],
        bestFor: 'Mobile apps, real-time dashboards',
      },
    ],
  },
  'data-warehouse': {
    category: 'Analytical Data Store',
    prompt: 'Data warehouse node added. Choose the right OLAP engine:',
    options: [
      {
        name: 'Snowflake', icon: '❄️', tagline: 'Cloud data warehouse',
        pros: ['Separate compute/storage', 'Time travel', 'Zero-copy cloning'],
        cons: ['Expensive at high concurrency', 'Vendor lock-in'],
        bestFor: 'Enterprise analytics, data sharing',
      },
      {
        name: 'BigQuery', icon: '📊', tagline: 'Google serverless data warehouse',
        pros: ['Serverless', 'ML integration', 'Petabyte scale'],
        cons: ['Query cost can spike', 'GCP ecosystem dependency'],
        bestFor: 'Large-scale analytics on GCP',
      },
      {
        name: 'Redshift', icon: '🔴', tagline: 'AWS columnar warehouse',
        pros: ['Deep AWS integration', 'Redshift Spectrum for S3', 'RA3 nodes'],
        cons: ['Requires cluster management', 'Slower for ad-hoc'],
        bestFor: 'AWS-native analytics pipelines',
      },
    ],
  },
  // ── Cache ──
  redis: {
    category: 'Cache Layer',
    prompt: 'You added a cache node. Here\'s how Redis compares:',
    options: [
      {
        name: 'Redis', icon: '⚡', tagline: 'In-memory data structure store',
        pros: ['Sub-ms latency', 'Rich data types', 'Pub/Sub', 'Lua scripting'],
        cons: ['Memory-bound', 'Persistence requires tuning'],
        bestFor: 'Session store, leaderboards, pub/sub, rate limiting',
      },
      {
        name: 'Memcached', icon: '💨', tagline: 'Simple distributed cache',
        pros: ['Multi-threaded', 'Lower memory overhead', 'Very simple'],
        cons: ['No persistence', 'No pub/sub', 'Basic data types only'],
        bestFor: 'Simple object caching at high throughput',
      },
      {
        name: 'Dragonfly', icon: '🐉', tagline: 'Redis-compatible, faster',
        pros: ['Redis API compatible', '25× throughput vs Redis', 'Lower memory'],
        cons: ['Newer ecosystem', 'Less battle-tested'],
        bestFor: 'High-throughput workloads replacing Redis',
      },
    ],
  },
  // ── Queue ──
  kafka: {
    category: 'Message Queue / Streaming',
    prompt: 'Message queue node added. Compare your options:',
    options: [
      {
        name: 'Apache Kafka', icon: '📨', tagline: 'Distributed event streaming',
        pros: ['Millions of events/sec', 'Durable log', 'Consumer groups', 'Kafka Streams'],
        cons: ['Complex to operate', 'JVM overhead', 'Zookeeper historically'],
        bestFor: 'Event sourcing, analytics pipelines, audit logs',
      },
      {
        name: 'RabbitMQ', icon: '🐰', tagline: 'Traditional message broker',
        pros: ['AMQP standard', 'Flexible routing', 'Lower latency for small messages'],
        cons: ['Not a log — messages consumed once', 'Memory spikes'],
        bestFor: 'Task queues, RPC, microservice commands',
      },
      {
        name: 'AWS SQS', icon: '☁️', tagline: 'Managed serverless queue',
        pros: ['Zero ops', 'Infinite scale', 'Dead-letter queues', 'FIFO support'],
        cons: ['AWS-only', 'No consumer groups', 'Pull-based only'],
        bestFor: 'AWS architectures, simple decoupling',
      },
    ],
  },
  queue: {
    category: 'Message Queue / Streaming',
    prompt: 'Message queue node added. Compare your options:',
    options: [
      {
        name: 'Apache Kafka', icon: '📨', tagline: 'Distributed event streaming',
        pros: ['Millions of events/sec', 'Durable log', 'Consumer groups', 'Kafka Streams'],
        cons: ['Complex to operate', 'JVM overhead', 'Zookeeper historically'],
        bestFor: 'Event sourcing, analytics pipelines, audit logs',
      },
      {
        name: 'RabbitMQ', icon: '🐰', tagline: 'Traditional message broker',
        pros: ['AMQP standard', 'Flexible routing', 'Lower latency for small messages'],
        cons: ['Not a log — messages consumed once', 'Memory spikes'],
        bestFor: 'Task queues, RPC, microservice commands',
      },
      {
        name: 'AWS SQS', icon: '☁️', tagline: 'Managed serverless queue',
        pros: ['Zero ops', 'Infinite scale', 'Dead-letter queues', 'FIFO support'],
        cons: ['AWS-only', 'No consumer groups', 'Pull-based only'],
        bestFor: 'AWS architectures, simple decoupling',
      },
    ],
  },
};

// ── Card ───────────────────────────────────────────────────────────────────────
function OptionCard({ option, selected, onSelect }: { option: ToolOption; selected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      style={{
        border: `1.5px solid ${selected ? '#7C3AED' : 'var(--border)'}`,
        borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
        background: selected ? 'rgba(124,58,237,0.08)' : 'var(--card-bg)',
        transition: 'all 0.15s',
        boxShadow: selected ? '0 0 0 2px rgba(124,58,237,0.25)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{option.icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
            {option.name}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
            {option.tagline}
          </div>
        </div>
        {selected && (
          <span style={{ marginLeft: 'auto', color: '#7C3AED', fontSize: 16 }}>✓</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          {option.pros.map((p, i) => (
            <div key={i} style={{ fontSize: 11.5, color: '#10B981', marginBottom: 3, fontFamily: "'DM Sans', sans-serif" }}>
              + {p}
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          {option.cons.map((c, i) => (
            <div key={i} style={{ fontSize: 11.5, color: '#EF4444', marginBottom: 3, fontFamily: "'DM Sans', sans-serif" }}>
              − {c}
            </div>
          ))}
        </div>
      </div>
      <div style={{
        marginTop: 9, fontSize: 11.5, color: 'var(--text-dim)',
        background: 'var(--bg)', borderRadius: 6, padding: '5px 9px',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Best for: {option.bestFor}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function ToolRecommendation({ nodeTypeId, onClose }: ToolRecommendationProps) {
  const rec = RECOMMENDATIONS[nodeTypeId];
  if (!rec) return null;

  const [selected, setSelected] = useState(0);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.60)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 900, backdropFilter: 'blur(4px)',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--panel-bg)',
        border: '1px solid var(--border)',
        borderRadius: 18, width: 560, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              display: 'inline-block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
              color: '#A78BFA', background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.3)',
              padding: '2px 8px', borderRadius: 4, marginBottom: 8, letterSpacing: '0.05em',
            }}>
              TOOL RECOMMENDATION · {rec.category.toUpperCase()}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif" }}>
              {rec.prompt}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 20, lineHeight: 1, marginLeft: 12, marginTop: -4 }}
          >
            ×
          </button>
        </div>

        {/* Cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rec.options.map((opt, i) => (
            <OptionCard key={opt.name} option={opt} selected={selected === i} onSelect={() => setSelected(i)} />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
            ✓ {rec.options[selected].name} selected for this node
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-dim)', borderRadius: 8, padding: '8px 16px',
                cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Dismiss
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#7C3AED', color: 'white', border: 'none',
                borderRadius: 8, padding: '8px 18px', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Which nodeTypeIds should trigger the panel ────────────────────────────────
export const TOOL_REC_TRIGGERS = new Set(Object.keys(RECOMMENDATIONS));
