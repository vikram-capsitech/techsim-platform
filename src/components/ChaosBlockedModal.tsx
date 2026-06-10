import { CHAOS_LABELS } from '../data/chaosValidation';

export interface ChaosBlockedInfo {
  chaosType: string;
  chaosLabel: string;
  nodeType: string;
  nodeName: string;
  reason: string;
  validForTypes: string[];
  validChaosForThisNode: string[];
}

export function ChaosBlockedModal({ info, onClose }: { info: ChaosBlockedInfo; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderTop: '3px solid #EF4444',
          borderRadius: 12,
          padding: 24,
          width: 440,
          maxWidth: '90vw',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#EF444420', border: '1px solid #EF444440',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>
            🔒
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: 16, fontWeight: 600 }}>
              {info.chaosLabel} not applicable
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>
              Cannot apply to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{info.nodeName}</strong>
              {' '}({info.nodeType})
            </p>
          </div>
        </div>

        {/* Why not */}
        <div style={{
          background: '#EF444410',
          border: '1px solid #EF444430',
          borderRadius: 8,
          padding: '14px 16px',
          marginBottom: 16,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#EF4444',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace",
          }}>
            Why not?
          </div>
          <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.7 }}>
            {info.reason}
          </p>
        </div>

        {/* Where it CAN be used */}
        {info.validForTypes.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace",
            }}>
              {info.chaosLabel} affects these components:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {info.validForTypes.map((type: string) => (
                <span key={type} style={{
                  fontSize: 12, padding: '4px 12px',
                  background: '#10B98115', border: '1px solid #10B98140',
                  color: '#10B981', borderRadius: 20,
                }}>
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* What IS valid for this node */}
        {info.validChaosForThisNode.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace",
            }}>
              What works on {info.nodeName}:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {info.validChaosForThisNode.map((c: string) => (
                <span key={c} style={{
                  fontSize: 12, padding: '4px 12px',
                  background: '#EF444415', border: '1px solid #EF444440',
                  color: '#EF4444', borderRadius: 20,
                }}>
                  {CHAOS_LABELS[c] ?? c}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            borderRadius: 8,
            padding: 10,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export const CHAOS_BLOCKED_REASONS: Record<string, { reason: string; validForTypes: string[] }> = {
  memory_leak: {
    reason: 'Memory leaks occur in server-side processes that manage heap memory over time. A Client Browser is an end-user application — it does not run server processes that TechSim can monitor or affect.',
    validForTypes: ['API Server', 'Microservice', 'API Gateway', 'Message Queue', 'Database'],
  },
  cpu_spike: {
    reason: "CPU spikes are relevant to server-side compute nodes that process requests. Client browsers are outside the system boundary — their CPU is on the user's device and not part of your architecture.",
    validForTypes: ['API Server', 'Microservice', 'API Gateway', 'Database'],
  },
  disk_full: {
    reason: 'Disk failures affect nodes that persist data to disk. A Client Browser has no disk in your system architecture — it is a stateless request origin.',
    validForTypes: ['Database', 'Message Queue', 'Cache (with AOF)', 'Object Storage', 'Monitoring'],
  },
  replication_lag: {
    reason: 'Replication lag occurs in database clusters where a primary node syncs writes to replica nodes. This is a database-layer concern and does not apply to network or compute nodes.',
    validForTypes: ['PostgreSQL', 'MySQL', 'MongoDB', 'Cassandra', 'Redis Cluster', 'Kafka'],
  },
  thread_pool_exhaustion: {
    reason: 'Thread pool exhaustion happens in application servers that maintain a pool of worker threads for handling concurrent requests. Client browsers and network components do not use thread pools.',
    validForTypes: ['API Server', 'Microservice', 'API Gateway'],
  },
  deadlock: {
    reason: 'Deadlocks occur when two or more processes are each waiting for the other to release a resource. This is a server-side concurrency issue that affects application servers and databases.',
    validForTypes: ['API Server', 'Microservice', 'Database', 'API Gateway'],
  },
  split_brain: {
    reason: 'Split brain occurs in distributed databases when a network partition causes two nodes to both think they are the primary. This only applies to distributed databases with leader election.',
    validForTypes: ['MongoDB', 'Cassandra', 'Kafka', 'Redis Cluster', 'Elasticsearch'],
  },
  cache_eviction_storm: {
    reason: 'Cache eviction storms happen when a cache runs out of memory and evicts many keys simultaneously, causing a thundering herd on the database. Only applicable to cache nodes.',
    validForTypes: ['Redis', 'Memcached', 'Cache Layer'],
  },
  consumer_lag: {
    reason: 'Consumer lag occurs when message consumers cannot process messages fast enough and the queue backlog grows. This only affects message queue brokers like Kafka or RabbitMQ.',
    validForTypes: ['Kafka', 'RabbitMQ', 'SQS', 'Message Queue'],
  },
  queue_full: {
    reason: "Queue full means the message broker's storage is at capacity and cannot accept new messages. This is a messaging layer concern.",
    validForTypes: ['Kafka', 'RabbitMQ', 'SQS', 'Message Queue'],
  },
  slow_queries: {
    reason: 'Slow queries are a database-layer failure mode caused by missing indexes, lock contention, or bad query plans. Application servers and network nodes do not execute queries.',
    validForTypes: ['PostgreSQL', 'MySQL', 'MongoDB', 'Elasticsearch', 'Data Warehouse'],
  },
  connection_pool_exhausted: {
    reason: 'Connection pool exhaustion occurs when a service runs out of available database connections. This only affects nodes that maintain a connection pool to a database.',
    validForTypes: ['API Server', 'Microservice', 'PostgreSQL', 'MySQL', 'Redis'],
  },
  memory_oom: {
    reason: 'Out-of-memory crashes occur in nodes that actively manage memory — databases, caches, and compute nodes. Network proxies and client browsers are not OOM candidates.',
    validForTypes: ['Redis', 'Elasticsearch', 'MongoDB', 'API Server', 'Microservice'],
  },
  poison_message: {
    reason: 'Poison messages are malformed messages that cause consumers to crash or loop. This failure mode only applies to message queue consumers and brokers.',
    validForTypes: ['Kafka', 'RabbitMQ', 'SQS', 'Message Queue'],
  },
  ssl_cert_expiry: {
    reason: 'SSL certificate expiry affects nodes that terminate TLS connections. Application servers behind a load balancer and pure data nodes typically do not handle TLS directly.',
    validForTypes: ['Load Balancer', 'API Gateway', 'CDN', 'WAF', 'Firewall'],
  },
  ddos: {
    reason: 'DDoS attacks generate massive external traffic that overwhelms edge and network nodes. Internal application servers and databases are not directly exposed to external attack traffic.',
    validForTypes: ['CDN', 'WAF', 'Load Balancer', 'API Gateway', 'DNS'],
  },
  dns_poisoning: {
    reason: 'DNS poisoning corrupts DNS responses to redirect traffic. This only affects DNS resolvers and servers — not application servers, databases, or compute nodes.',
    validForTypes: ['DNS', 'Router', 'Network Layer'],
  },
  network_partition: {
    reason: 'Network partitions split a cluster into isolated groups. This is most impactful on distributed data nodes and client-facing edge nodes. Pure compute nodes are typically passively affected, not the source.',
    validForTypes: ['Redis', 'Kafka', 'MongoDB', 'Client Browser', 'CDN', 'DNS'],
  },
  packet_loss: {
    reason: 'Packet loss is a network-level failure that affects connections between nodes. This is most relevant for client-facing and network components where packet loss is observable.',
    validForTypes: ['Client Browser', 'CDN', 'Load Balancer', 'Router'],
  },
  high_latency: {
    reason: 'High latency can be injected at any hop in the request path. The most impactful latency injections happen at edge nodes, API servers, and databases where latency amplifies.',
    validForTypes: ['CDN', 'Load Balancer', 'API Server', 'API Gateway', 'Database', 'Redis'],
  },
};
