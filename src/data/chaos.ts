export type ChaosCategory =
  | 'infrastructure'
  | 'network'
  | 'traffic'
  | 'application'
  | 'data'
  | 'dependency';

export interface ChaosScenario {
  id: string;
  label: string;
  icon: string;
  category: ChaosCategory;
  description: string;
  /** Engine method to invoke */
  method: 'crashNode' | 'spikeLatency' | 'trafficSurge' | 'networkPartition' | 'custom';
  /** Default severity for display */
  severity: 'critical' | 'high' | 'medium';
}

export const CHAOS_CATEGORY_META: Record<ChaosCategory, { label: string; color: string; icon: string }> = {
  infrastructure: { label: 'Infrastructure Failures', color: '#EF4444', icon: 'server-crash' },
  network:        { label: 'Network Chaos',           color: '#F97316', icon: 'wifi-off' },
  traffic:        { label: 'Traffic Chaos',           color: '#EAB308', icon: 'trending-up' },
  application:    { label: 'Application Chaos',       color: '#A855F7', icon: 'bug' },
  data:           { label: 'Data Layer Chaos',        color: '#3B82F6', icon: 'database-zap' },
  dependency:     { label: 'Dependency Chaos',        color: '#6B7280', icon: 'unlink' },
};

export const CHAOS_SCENARIOS: ChaosScenario[] = [
  // ── Infrastructure Failures ───────────────────────────────────────────────
  { id: 'node-crash',      label: 'Node Crash',          icon: 'x-circle',       category: 'infrastructure', description: 'Immediately crash the target node',              method: 'crashNode',      severity: 'critical' },
  { id: 'dc-failure',      label: 'Data Center Failure', icon: 'server',         category: 'infrastructure', description: 'Simulate full datacenter outage',                method: 'crashNode',      severity: 'critical' },
  { id: 'disk-failure',    label: 'Disk Failure',        icon: 'hard-drive',     category: 'infrastructure', description: 'Storage I/O errors and degraded throughput',     method: 'crashNode',      severity: 'high'     },
  { id: 'cpu-spike',       label: 'CPU Spike',           icon: 'cpu',            category: 'infrastructure', description: 'Peg CPU to 100% causing processing delays',      method: 'custom',         severity: 'high'     },
  { id: 'memory-leak',     label: 'Memory Leak',         icon: 'activity',       category: 'infrastructure', description: 'Gradual memory exhaustion over time',            method: 'custom',         severity: 'high'     },
  { id: 'slowdown',        label: 'Instance Slowdown',   icon: 'timer',          category: 'infrastructure', description: '10× increased processing latency',               method: 'spikeLatency',   severity: 'medium'   },

  // ── Network Chaos ──────────────────────────────────────────────────────────
  { id: 'net-partition',   label: 'Network Partition',   icon: 'scissors',       category: 'network',        description: 'Split network — nodes cannot communicate',       method: 'networkPartition', severity: 'critical' },
  { id: 'packet-loss',     label: 'Packet Loss',         icon: 'wifi-off',       category: 'network',        description: '30% packet drop rate on the target edge',        method: 'networkPartition', severity: 'high'     },
  { id: 'latency-spike',   label: 'Latency Spike',       icon: 'clock',          category: 'network',        description: '+2000ms added to all edge latency',              method: 'spikeLatency',   severity: 'high'     },
  { id: 'bw-throttle',     label: 'Bandwidth Throttle',  icon: 'minimize-2',     category: 'network',        description: 'Reduce throughput to 10% of capacity',           method: 'custom',         severity: 'medium'   },
  { id: 'dns-failure',     label: 'DNS Failure',         icon: 'compass',        category: 'network',        description: 'DNS resolution timeouts across the cluster',     method: 'crashNode',      severity: 'critical' },
  { id: 'tls-expiry',      label: 'TLS Cert Expiry',     icon: 'shield-off',     category: 'network',        description: 'TLS handshake failures causing connection drops', method: 'custom',         severity: 'high'     },

  // ── Traffic Chaos ──────────────────────────────────────────────────────────
  { id: 'traffic-surge',   label: 'Traffic Surge 10×',  icon: 'trending-up',    category: 'traffic',        description: 'Sudden 10× traffic spike on all edges',          method: 'trafficSurge',   severity: 'high'     },
  { id: 'ddos-flood',      label: 'DDoS Flood',         icon: 'zap',            category: 'traffic',        description: 'Simulated DDoS attack burst traffic',            method: 'trafficSurge',   severity: 'critical' },
  { id: 'thundering-herd', label: 'Thundering Herd',    icon: 'users',          category: 'traffic',        description: 'Mass simultaneous cache miss & retry storm',     method: 'trafficSurge',   severity: 'high'     },
  { id: 'retry-storm',     label: 'Retry Storm',        icon: 'refresh-cw',     category: 'traffic',        description: 'Failed requests triggering exponential retries', method: 'trafficSurge',   severity: 'medium'   },

  // ── Application Chaos ─────────────────────────────────────────────────────
  { id: 'thread-exhaustion',label: 'Thread Pool Exhaustion', icon: 'layers',    category: 'application',    description: 'All threads occupied — new requests queued',     method: 'custom',         severity: 'critical' },
  { id: 'deadlock',        label: 'Deadlock',           icon: 'lock',           category: 'application',    description: 'Circular lock contention halts processing',      method: 'crashNode',      severity: 'critical' },
  { id: 'gc-pause',        label: 'GC Pause',           icon: 'pause-circle',   category: 'application',    description: 'Long GC stop-the-world pause (JVM/Go)',          method: 'spikeLatency',   severity: 'medium'   },
  { id: 'config-drift',    label: 'Config Drift',       icon: 'settings',       category: 'application',    description: 'Misconfigured settings causing degradation',     method: 'custom',         severity: 'medium'   },

  // ── Data Layer Chaos ──────────────────────────────────────────────────────
  { id: 'db-primary-fail', label: 'DB Primary Failure', icon: 'database',       category: 'data',           description: 'Primary DB crashes — failover to replica',       method: 'crashNode',      severity: 'critical' },
  { id: 'replication-lag', label: 'Replication Lag',    icon: 'clock',          category: 'data',           description: 'Replica is 30s behind primary — stale reads',   method: 'spikeLatency',   severity: 'high'     },
  { id: 'conn-pool-exhaust',label: 'Connection Pool Exhaustion', icon: 'server',category: 'data',           description: 'DB connection pool full — new queries queue',    method: 'custom',         severity: 'critical' },
  { id: 'cache-eviction',  label: 'Cache Eviction Storm',icon: 'layers',        category: 'data',           description: 'Mass cache eviction drives all traffic to DB',   method: 'custom',         severity: 'high'     },

  // ── Dependency Chaos ──────────────────────────────────────────────────────
  { id: 'third-party-fail',label: 'Third-party API Down', icon: 'unlink',       category: 'dependency',     description: 'External API (payment/email/etc) unavailable',  method: 'crashNode',      severity: 'high'     },
  { id: 'auth-down',       label: 'Auth Service Down',  icon: 'key',            category: 'dependency',     description: 'Auth/SSO provider unavailable — all logins fail',method: 'crashNode',      severity: 'critical' },
  { id: 'queue-full',      label: 'Message Queue Full', icon: 'list',           category: 'dependency',     description: 'Queue at max depth — new messages dropped',      method: 'custom',         severity: 'high'     },
];
