import type { Node, Edge } from '@xyflow/react';
import type { TechNodeData } from './TechNode';
import type { Category } from '../data/nodes';

// ── Preset definition ────────────────────────────────────────────────────────
export interface Preset {
  id: string;
  name: string;
  description: string;
  tag: string;
  tagColor: string;
  nodes: Node[];
  edges: Edge[];
}

// ── Node / edge factory helpers ──────────────────────────────────────────────
let _nId = 0;
function n(
  id: string, label: string, nodeTypeId: string, icon: string,
  category: Category, x: number, y: number,
): Node {
  ++_nId;
  const data: TechNodeData = { label, icon, category, nodeTypeId };
  return { id, type: 'techNode', position: { x, y }, data, style: { width: 200 } };
}

function e(source: string, target: string, protocol: 'http' | 'database' | 'cache' | 'queue' = 'http'): Edge {
  return {
    id: `${source}-${target}`,
    source, target, type: 'glow',
    data: { protocol },
  };
}

// ── 8 Presets ────────────────────────────────────────────────────────────────
export const PRESETS: Preset[] = [
  {
    id: 'simple-web',
    name: 'Simple Web App',
    description: 'Classic three-tier: CDN → Load Balancer → API Server → Redis → Postgres',
    tag: 'Starter',
    tagColor: '#22C55E',
    nodes: [
      n('client',   'Client Browser',  'client',       'monitor',      'network',   160, 20),
      n('cdn',      'CDN',             'cdn',           'globe',        'network',   160, 130),
      n('lb',       'Load Balancer',   'load-balancer', 'git-branch',   'network',   160, 240),
      n('api',      'API Server',      'api-server',    'server',       'compute',   160, 350),
      n('redis',    'Redis Cache',     'redis',         'layers',       'data',      420, 350),
      n('db',       'PostgreSQL',      'postgres',      'database',     'data',      160, 460),
    ],
    edges: [
      e('client', 'cdn'),
      e('cdn',    'lb'),
      e('lb',     'api'),
      e('api',    'redis',  'cache'),
      e('api',    'db',     'database'),
    ],
  },
  {
    id: 'microservices',
    name: 'Microservices',
    description: 'API Gateway fans out to auth, user, and order services with shared caches and databases',
    tag: 'Production',
    tagColor: '#6366F1',
    nodes: [
      n('client',   'Client Browser',  'client',       'monitor',      'network',   260, 20),
      n('cdn',      'CDN',             'cdn',           'globe',        'network',   260, 130),
      n('waf',      'WAF',             'waf',           'shield',       'network',   260, 240),
      n('lb',       'Load Balancer',   'load-balancer', 'git-branch',   'network',   260, 350),
      n('gw',       'API Gateway',     'api-gateway',   'arrow-right-left', 'network', 260, 460),
      n('auth',     'Auth Service',    'auth-service',  'key',          'compute',   60,  580),
      n('usersvc',  'User Service',    'microservice',  'box',          'compute',   260, 580),
      n('ordersvc', 'Order Service',   'microservice',  'box',          'compute',   460, 580),
      n('redis',    'Redis Cache',     'redis',         'layers',       'data',      60,  700),
      n('postgres', 'PostgreSQL',      'postgres',      'database',     'data',      260, 700),
      n('mongo',    'MongoDB',         'mongodb',       'file-text',    'data',      460, 700),
    ],
    edges: [
      e('client',  'cdn'),
      e('cdn',     'waf'),
      e('waf',     'lb'),
      e('lb',      'gw'),
      e('gw',      'auth'),
      e('gw',      'usersvc'),
      e('gw',      'ordersvc'),
      e('auth',    'redis',    'cache'),
      e('usersvc', 'postgres', 'database'),
      e('ordersvc','mongo',    'database'),
    ],
  },
  {
    id: 'event-driven',
    name: 'Event-Driven',
    description: 'API publishes to Kafka; consumer workers process async tasks and write to Postgres',
    tag: 'Async',
    tagColor: '#F59E0B',
    nodes: [
      n('client',   'Client Browser',  'client',       'monitor',    'network',   200, 20),
      n('api',      'API Server',      'api-server',   'server',     'compute',   200, 130),
      n('kafka',    'Kafka',           'kafka',        'activity',   'messaging', 200, 260),
      n('w1',       'Worker A',        'worker',       'cpu',        'compute',   60,  380),
      n('w2',       'Worker B',        'worker',       'cpu',        'compute',   200, 380),
      n('w3',       'Worker C',        'worker',       'cpu',        'compute',   340, 380),
      n('redis',    'Redis Cache',     'redis',        'layers',     'data',      60,  500),
      n('postgres', 'PostgreSQL',      'postgres',     'database',   'data',      230, 500),
    ],
    edges: [
      e('client', 'api'),
      e('api',    'kafka',    'queue'),
      e('kafka',  'w1',       'queue'),
      e('kafka',  'w2',       'queue'),
      e('kafka',  'w3',       'queue'),
      e('w1',     'redis',    'cache'),
      e('w2',     'postgres', 'database'),
      e('w3',     'postgres', 'database'),
    ],
  },
  {
    id: 'chat-app',
    name: 'Chat App',
    description: 'WebSocket servers behind a load balancer with Redis Pub/Sub for cross-server fan-out',
    tag: 'Real-Time',
    tagColor: '#EC4899',
    nodes: [
      n('client1',  'Client A',        'client',       'monitor',    'network',   120, 20),
      n('client2',  'Client B',        'client',       'monitor',    'network',   360, 20),
      n('cdn',      'CDN',             'cdn',          'globe',      'network',   240, 130),
      n('lb',       'Load Balancer',   'load-balancer','git-branch', 'network',   240, 240),
      n('ws1',      'WS Server 1',     'api-server',   'server',     'compute',   100, 360),
      n('ws2',      'WS Server 2',     'api-server',   'server',     'compute',   380, 360),
      n('redis',    'Redis Pub/Sub',   'redis',        'layers',     'data',      240, 480),
      n('postgres', 'PostgreSQL',      'postgres',     'database',   'data',      240, 590),
    ],
    edges: [
      e('client1', 'cdn'),
      e('client2', 'cdn'),
      e('cdn',     'lb'),
      e('lb',      'ws1'),
      e('lb',      'ws2'),
      e('ws1',     'redis',    'cache'),
      e('ws2',     'redis',    'cache'),
      e('ws1',     'postgres', 'database'),
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Full stack: WAF → Gateway → Auth + Product + Order services → Redis + Postgres + Kafka → Email worker',
    tag: 'Full Stack',
    tagColor: '#06B6D4',
    nodes: [
      n('client',  'Client Browser', 'client',       'monitor',         'network',   300, 20),
      n('cdn',     'CDN',            'cdn',          'globe',           'network',   300, 130),
      n('waf',     'WAF',           'waf',          'shield',          'network',   300, 240),
      n('lb',      'Load Balancer', 'load-balancer','git-branch',      'network',   300, 350),
      n('gw',      'API Gateway',   'api-gateway',  'arrow-right-left','network',   300, 460),
      n('auth',    'Auth Service',  'auth-service', 'key',             'compute',   80,  580),
      n('product', 'Product Svc',   'microservice', 'box',             'compute',   300, 580),
      n('order',   'Order Svc',     'microservice', 'box',             'compute',   520, 580),
      n('redis',   'Redis Cache',   'redis',        'layers',          'data',      80,  700),
      n('postgres','PostgreSQL',    'postgres',     'database',        'data',      300, 700),
      n('kafka',   'Kafka',         'kafka',        'activity',        'messaging', 520, 700),
      n('email',   'Email Worker',  'worker',       'cpu',             'compute',   520, 810),
    ],
    edges: [
      e('client',  'cdn'),
      e('cdn',     'waf'),
      e('waf',     'lb'),
      e('lb',      'gw'),
      e('gw',      'auth'),
      e('gw',      'product'),
      e('gw',      'order'),
      e('auth',    'redis',    'cache'),
      e('product', 'postgres', 'database'),
      e('order',   'kafka',    'queue'),
      e('kafka',   'email',    'queue'),
    ],
  },
  {
    id: 'payment',
    name: 'Payment Service',
    description: 'Rate-limited gateway → Auth → Payment processor → Primary + Replica Postgres with Audit Log',
    tag: 'Finance',
    tagColor: '#EF4444',
    nodes: [
      n('client',  'Client Browser', 'client',       'monitor',         'network',   200, 20),
      n('waf',     'WAF',           'waf',          'shield',          'network',   200, 130),
      n('gw',      'API Gateway',   'api-gateway',  'arrow-right-left','network',   200, 240),
      n('rl',      'Rate Limiter',  'rate-limiter', 'gauge',           'compute',   200, 350),
      n('auth',    'Auth Service',  'auth-service', 'key',             'compute',   60,  460),
      n('payment', 'Payment Svc',   'microservice', 'box',             'compute',   340, 460),
      n('pg',      'PostgreSQL Primary','postgres', 'database',        'data',      200, 580),
      n('pgrep',   'PostgreSQL Replica','postgres', 'database',        'data',      420, 580),
      n('kafka',   'Audit Log Queue','kafka',       'activity',        'messaging', 200, 700),
      n('audit',   'Audit Worker',  'worker',       'cpu',             'compute',   200, 810),
    ],
    edges: [
      e('client',  'waf'),
      e('waf',     'gw'),
      e('gw',      'rl'),
      e('rl',      'auth'),
      e('rl',      'payment'),
      e('payment', 'pg',       'database'),
      e('pg',      'pgrep',    'database'),
      e('payment', 'kafka',    'queue'),
      e('kafka',   'audit',    'queue'),
    ],
  },
  {
    id: 'search-platform',
    name: 'Search Platform',
    description: 'Search queries hit Elasticsearch; heavy-hitters cached in Redis; writes sourced from Postgres',
    tag: 'Search',
    tagColor: '#A855F7',
    nodes: [
      n('client',  'Client Browser', 'client',       'monitor',    'network',   200, 20),
      n('cdn',     'CDN',           'cdn',          'globe',      'network',   200, 130),
      n('lb',      'Load Balancer', 'load-balancer','git-branch', 'network',   200, 240),
      n('api',     'Search API',    'api-server',   'server',     'compute',   200, 360),
      n('redis',   'Redis Cache',   'redis',        'layers',     'data',      60,  480),
      n('elastic', 'Elasticsearch', 'elastic',      'search',     'data',      340, 480),
      n('postgres','PostgreSQL',    'postgres',     'database',   'data',      200, 590),
      n('mon',     'Prometheus',    'prometheus',   'activity',   'monitoring',460, 360),
    ],
    edges: [
      e('client',  'cdn'),
      e('cdn',     'lb'),
      e('lb',      'api'),
      e('api',     'redis',    'cache'),
      e('api',     'elastic',  'database'),
      e('elastic', 'postgres', 'database'),
      e('api',     'mon'),
    ],
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline',
    description: 'Ingestion API → Kafka → Flink-style workers → Data Warehouse + S3 for analytics',
    tag: 'Analytics',
    tagColor: '#10B981',
    nodes: [
      n('client',  'Client Browser', 'client',         'monitor',    'network',   200, 20),
      n('api',     'Ingestion API',  'api-server',     'server',     'compute',   200, 130),
      n('kafka',   'Kafka',          'kafka',          'activity',   'messaging', 200, 260),
      n('w1',      'Stream Worker',  'worker',         'cpu',        'compute',   60,  380),
      n('w2',      'Batch Worker',   'job-processor',  'settings',   'compute',   340, 380),
      n('redis',   'Redis Cache',    'redis',          'layers',     'data',      60,  500),
      n('dw',      'Data Warehouse', 'data-warehouse', 'archive',    'data',      340, 500),
      n('s3',      'S3 Storage',     's3',             'hard-drive', 'data',      200, 610),
      n('mon',     'Monitoring',     'prometheus',     'activity',   'monitoring',480, 260),
    ],
    edges: [
      e('client', 'api'),
      e('api',    'kafka',  'queue'),
      e('kafka',  'w1',     'queue'),
      e('kafka',  'w2',     'queue'),
      e('w1',     'redis',  'cache'),
      e('w2',     'dw',     'database'),
      e('w2',     's3',     'database'),
      e('api',    'mon'),
    ],
  },
];

// ── Modal component ───────────────────────────────────────────────────────────
interface PresetsModalProps {
  onClose: () => void;
  onLoad: (preset: Preset) => void;
}

export function PresetsModal({ onClose, onLoad }: PresetsModalProps) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 720, maxHeight: '80vh',
          background: 'var(--panel-bg)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontSize: 15, fontWeight: 700, color: 'var(--text)',
              fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em',
            }}>
              Architecture Presets
            </div>
            <div style={{
              fontSize: 11, color: 'var(--text-muted)',
              fontFamily: "'IBM Plex Mono', monospace", marginTop: 3,
            }}>
              Select a template to load onto the canvas
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12, padding: 16, overflowY: 'auto',
        }}>
          {PRESETS.map(preset => (
            <PresetCard key={preset.id} preset={preset} onLoad={onLoad} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PresetCard({ preset, onLoad }: { preset: Preset; onLoad: (p: Preset) => void }) {
  const nodeCount = preset.nodes.length;
  const edgeCount = preset.edges.length;

  return (
    <button
      onClick={() => onLoad(preset)}
      style={{
        textAlign: 'left', background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 10, padding: '14px 16px',
        cursor: 'pointer', transition: 'all 0.15s',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--card-hover)';
        e.currentTarget.style.borderColor = 'var(--border-bright)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--card-bg)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 700, color: 'var(--text)',
          fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em',
          lineHeight: 1.2,
        }}>
          {preset.name}
        </div>
        <span style={{
          flexShrink: 0, fontSize: 9.5, fontWeight: 700,
          fontFamily: "'IBM Plex Mono', monospace",
          background: `${preset.tagColor}18`,
          border: `1px solid ${preset.tagColor}40`,
          color: preset.tagColor,
          borderRadius: 5, padding: '2px 7px',
          letterSpacing: '0.06em',
        }}>
          {preset.tag}
        </span>
      </div>

      {/* Description */}
      <div style={{
        fontSize: 11.5, color: 'var(--text-muted)',
        fontFamily: "'DM Sans', sans-serif", lineHeight: 1.45,
      }}>
        {preset.description}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
        <StatPill label={`${nodeCount} nodes`} />
        <StatPill label={`${edgeCount} edges`} />
      </div>
    </button>
  );
}

function StatPill({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: 10, fontFamily: "'IBM Plex Mono', monospace",
      color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)',
      border: '1px solid var(--border)', borderRadius: 4,
      padding: '1px 7px',
    }}>
      {label}
    </span>
  );
}
