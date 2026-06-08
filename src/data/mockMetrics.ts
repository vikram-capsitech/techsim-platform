import type { Category } from './nodes';

export interface NodeMetrics {
  primary: { label: string; value: string };
  secondary: { label: string; value: string };
  status: 'healthy' | 'degraded' | 'critical';
  uptime: string;
  description: string;
}

const METRICS_BY_CATEGORY: Record<Category, NodeMetrics[]> = {
  network: [
    { primary: { label: 'Throughput', value: '2.4 Gbps' }, secondary: { label: 'Latency', value: '0.8ms' }, status: 'healthy', uptime: '99.99%', description: 'Handles north-south L3 routing between availability zones.' },
    { primary: { label: 'RPS', value: '41.2k' },           secondary: { label: 'Blocked', value: '0.01%' }, status: 'healthy', uptime: '99.97%', description: 'Stateful packet inspection at 40Gbps line rate.' },
    { primary: { label: 'Req/s', value: '18.7k' },         secondary: { label: 'P99',     value: '2.1ms' },  status: 'healthy', uptime: '99.98%', description: 'Layer 7 load balancing with health-check aware routing.' },
    { primary: { label: 'Tunnels', value: '24' },           secondary: { label: 'Latency', value: '12ms' },  status: 'healthy', uptime: '99.95%', description: 'IPSec/IKEv2 site-to-site encrypted tunnel aggregator.' },
    { primary: { label: 'Cache Hit', value: '94.2%' },     secondary: { label: 'TTL',     value: '300s' },   status: 'healthy', uptime: '99.99%', description: 'Global edge cache with 48 PoPs across 6 regions.' },
  ],
  compute: [
    { primary: { label: 'CPU',    value: '34%' },   secondary: { label: 'Memory', value: '6.2 GB' }, status: 'healthy',  uptime: '99.91%', description: 'General-purpose compute, c6i.2xlarge, 8 vCPU / 16 GiB.' },
    { primary: { label: 'Pods',   value: '128' },   secondary: { label: 'CPU',    value: '71%' },    status: 'degraded', uptime: '99.88%', description: '3-node cluster, HPA enabled, target CPU utilization 60%.' },
    { primary: { label: 'Inv/s',  value: '3.1k' },  secondary: { label: 'P99',    value: '8ms' },    status: 'healthy',  uptime: '99.99%', description: 'Node.js 20 runtime, 512 MB memory, 15s timeout.' },
    { primary: { label: 'CPU',    value: '12%' },   secondary: { label: 'Mem',    value: '1.1 GB' }, status: 'healthy',  uptime: '99.96%', description: 'Isolated Docker container, bridge networking, read-only FS.' },
    { primary: { label: 'VMs',    value: '8' },     secondary: { label: 'CPU',    value: '55%' },    status: 'healthy',  uptime: '99.90%', description: 'KVM hypervisor, NUMA-aware pinning, SR-IOV NICs.' },
  ],
  data: [
    { primary: { label: 'QPS',     value: '8.4k' },  secondary: { label: 'P99',      value: '4.2ms' },  status: 'healthy',  uptime: '99.99%', description: 'Primary-replica cluster, PgBouncer pooling, WAL archiving enabled.' },
    { primary: { label: 'Hit Rate', value: '97.8%' }, secondary: { label: 'Memory',   value: '28 GB' },  status: 'healthy',  uptime: '99.99%', description: 'Redis 7.2 cluster mode, 6 shards, AOF + RDB persistence.' },
    { primary: { label: 'Objects', value: '4.2M' },   secondary: { label: 'Storage',  value: '1.8 TB' }, status: 'healthy',  uptime: '99.99%', description: 'S3-compatible object store, versioning + lifecycle policies active.' },
    { primary: { label: 'Docs/s',  value: '620' },    secondary: { label: 'Index Size','value': '340 GB' }, status: 'healthy', uptime: '99.95%', description: 'Replica set, oplog window 48h, WiredTiger compression.' },
    { primary: { label: 'Idx/s',   value: '2.1k' },   secondary: { label: 'Shards',   value: '5' },      status: 'healthy',  uptime: '99.97%', description: 'Elasticsearch 8.x, cross-cluster replication, ILM policies.' },
  ],
  messaging: [
    { primary: { label: 'Msg/s',  value: '180k' },  secondary: { label: 'Lag',    value: '42ms' },    status: 'healthy',  uptime: '99.99%', description: '9-broker cluster, replication factor 3, retention 7 days.' },
    { primary: { label: 'Msg/s',  value: '12k' },   secondary: { label: 'Queues', value: '48' },      status: 'healthy',  uptime: '99.97%', description: 'RabbitMQ 3.12, quorum queues, shovel federation configured.' },
    { primary: { label: 'Depth',  value: '2.4k' },  secondary: { label: 'Age',    value: '0.3s' },    status: 'healthy',  uptime: '99.99%', description: 'Standard queue, long polling 20s, visibility timeout 30s.' },
    { primary: { label: 'Sub',    value: '34' },     secondary: { label: 'Msg/s',  value: '8.2k' },   status: 'healthy',  uptime: '99.99%', description: 'Fan-out topic, 34 subscribers, 10KB max message size.' },
    { primary: { label: 'Events/s','value': '94k' }, secondary: { label: 'Rules',  value: '18' },     status: 'healthy',  uptime: '99.98%', description: 'Custom event bus, pattern matching, dead-letter routing.' },
  ],
  infrastructure: [
    { primary: { label: 'Resources', value: '248' }, secondary: { label: 'Drift',  value: '0' },      status: 'healthy',  uptime: '100%',   description: 'Terraform 1.7, remote state in S3, sentinel policy checks.' },
    { primary: { label: 'Builds/d', value: '142' },  secondary: { label: 'P50',    value: '4.2m' },   status: 'healthy',  uptime: '99.92%', description: 'GitHub Actions, parallel matrix builds, artifact caching.' },
    { primary: { label: 'Queries/s','value': '6.8k' },secondary: { label: 'TTL',   value: '30s' },    status: 'healthy',  uptime: '99.99%', description: 'Authoritative DNS, DNSSEC signed, anycast routing.' },
    { primary: { label: 'Req/s',   value: '42.8k' }, secondary: { label: 'P99',    value: '18ms' },   status: 'healthy',  uptime: '99.98%', description: 'API Gateway, JWT auth, rate limiting 10k req/min per tenant.' },
    { primary: { label: 'Req/s',   value: '28k' },   secondary: { label: 'Workers','value': '16' },   status: 'healthy',  uptime: '99.97%', description: 'Nginx 1.25, gzip + brotli, upstream keepalive pool 256.' },
  ],
  monitoring: [
    { primary: { label: 'Series',  value: '2.8M' },  secondary: { label: 'Scrape', value: '15s' },    status: 'healthy',  uptime: '99.96%', description: 'Prometheus 2.49, remote-write to Thanos, 30d retention.' },
    { primary: { label: 'Panels',  value: '84' },     secondary: { label: 'Users',  value: '31' },     status: 'healthy',  uptime: '99.98%', description: 'Grafana 10, unified alerting, 12 dashboards provisioned.' },
    { primary: { label: 'APM',     value: 'active' }, secondary: { label: 'Traces', value: '48k/m' },  status: 'healthy',  uptime: '99.99%', description: 'Full-stack APM, RUM enabled, synthetic checks every 60s.' },
    { primary: { label: 'On-call', value: '2 eng' },  secondary: { label: 'MTTR',   value: '8.4m' },   status: 'degraded', uptime: '99.93%', description: 'Incident management, escalation policies, runbooks linked.' },
    { primary: { label: 'Ingest',  value: '120 GB/d' },secondary: { label: 'Index', value: '14 GB' }, status: 'healthy',  uptime: '99.97%', description: 'Fluent Bit + OpenSearch, 7-day hot / 30-day warm storage.' },
  ],
};

let _callCount: Record<string, number> = {};

export function getMetricsForNode(nodeId: string, category: Category): NodeMetrics {
  _callCount[nodeId] = (_callCount[nodeId] ?? 0);
  const pool = METRICS_BY_CATEGORY[category];
  // deterministic pick based on hash of nodeId
  const hash = nodeId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return pool[hash % pool.length];
}
