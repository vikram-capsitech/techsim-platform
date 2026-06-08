export type Category = 'network' | 'compute' | 'data' | 'messaging' | 'infrastructure' | 'monitoring';

export interface NodeTemplate {
  id: string;
  label: string;
  category: Category;
  icon: string;
  description: string;
  /** Default simulation role */
  simRole?: string;
}

export const CATEGORY_META: Record<Category, { label: string; color: string; cssVar: string }> = {
  network:        { label: 'Network',        color: '#06B6D4', cssVar: 'var(--cat-network)' },
  compute:        { label: 'Compute',        color: '#A855F7', cssVar: 'var(--cat-compute)' },
  data:           { label: 'Data',           color: '#10B981', cssVar: 'var(--cat-data)' },
  messaging:      { label: 'Messaging',      color: '#F59E0B', cssVar: 'var(--cat-messaging)' },
  infrastructure: { label: 'Infra',          color: '#EF4444', cssVar: 'var(--cat-infrastructure)' },
  monitoring:     { label: 'Monitoring',     color: '#6366F1', cssVar: 'var(--cat-monitoring)' },
};

export const NODE_TEMPLATES: NodeTemplate[] = [
  // ── Network (8) ──────────────────────────────────────────────────────────
  { id: 'client',        label: 'Client Browser',      category: 'network',         icon: 'monitor',             description: 'End-user browser or mobile app',        simRole: 'client' },
  { id: 'cdn',           label: 'CDN',                 category: 'network',         icon: 'globe',               description: 'Edge content distribution',             simRole: 'cdn' },
  { id: 'dns',           label: 'DNS',                 category: 'network',         icon: 'compass',             description: 'Domain name resolution',                simRole: 'dns' },
  { id: 'waf',           label: 'WAF',                 category: 'network',         icon: 'shield',              description: 'Web Application Firewall',              simRole: 'waf' },
  { id: 'load-balancer', label: 'Load Balancer',       category: 'network',         icon: 'git-branch',          description: 'Layer 7 traffic distribution',          simRole: 'loadBalancer' },
  { id: 'api-gateway',   label: 'API Gateway',         category: 'network',         icon: 'arrow-right-left',    description: 'API management & routing layer',        simRole: 'apiGateway' },
  { id: 'router',        label: 'Router',              category: 'network',         icon: 'router',              description: 'Layer 3 routing device',                simRole: 'router' },
  { id: 'firewall',      label: 'Firewall',            category: 'network',         icon: 'shield-alert',        description: 'Stateful packet inspection',            simRole: 'firewall' },

  // ── Compute (8) ──────────────────────────────────────────────────────────
  { id: 'microservice',  label: 'Microservice',        category: 'compute',         icon: 'box',                 description: 'Isolated Docker microservice',          simRole: 'microservice' },
  { id: 'api-server',    label: 'API Server',          category: 'compute',         icon: 'server',              description: 'RESTful / gRPC API backend',            simRole: 'appServer' },
  { id: 'lambda',        label: 'Serverless Fn',       category: 'compute',         icon: 'zap',                 description: 'Serverless function runtime',           simRole: 'serverless' },
  { id: 'worker',        label: 'Worker',              category: 'compute',         icon: 'cpu',                 description: 'Background job worker',                 simRole: 'worker' },
  { id: 'job-processor', label: 'Job Processor',       category: 'compute',         icon: 'settings',            description: 'Batch / scheduled job processor',       simRole: 'worker' },
  { id: 'auth-service',  label: 'Auth Service',        category: 'compute',         icon: 'key',                 description: 'Authentication & JWT issuer',           simRole: 'appServer' },
  { id: 'rate-limiter',  label: 'Rate Limiter',        category: 'compute',         icon: 'gauge',               description: 'Request rate limiting layer',           simRole: 'appServer' },
  { id: 'reverse-proxy', label: 'Reverse Proxy',       category: 'compute',         icon: 'triangle',            description: 'Nginx reverse proxy / web server',      simRole: 'appServer' },

  // ── Data (8) ─────────────────────────────────────────────────────────────
  { id: 'postgres',      label: 'PostgreSQL',          category: 'data',            icon: 'database',            description: 'Relational SQL database',               simRole: 'database' },
  { id: 'mysql',         label: 'MySQL',               category: 'data',            icon: 'database',            description: 'Popular open-source SQL database',      simRole: 'database' },
  { id: 'mongodb',       label: 'MongoDB',             category: 'data',            icon: 'file-text',           description: 'Document-oriented NoSQL',               simRole: 'database' },
  { id: 'redis',         label: 'Redis Cache',         category: 'data',            icon: 'layers',              description: 'In-memory key-value cache',             simRole: 'cache' },
  { id: 'elastic',       label: 'Elasticsearch',       category: 'data',            icon: 'search',              description: 'Distributed search engine',             simRole: 'database' },
  { id: 's3',            label: 'S3 Storage',          category: 'data',            icon: 'hard-drive',          description: 'Scalable object / blob storage',        simRole: 'objectStorage' },
  { id: 'data-warehouse',label: 'Data Warehouse',      category: 'data',            icon: 'archive',             description: 'OLAP analytics warehouse',              simRole: 'database' },
  { id: 'timeseries-db', label: 'Time Series DB',      category: 'data',            icon: 'activity',            description: 'Time-series metrics storage',           simRole: 'database' },

  // ── Messaging (6) ────────────────────────────────────────────────────────
  { id: 'kafka',         label: 'Kafka',               category: 'messaging',       icon: 'activity',            description: 'Distributed event streaming',           simRole: 'queue' },
  { id: 'rabbitmq',      label: 'RabbitMQ',            category: 'messaging',       icon: 'mail',                description: 'AMQP message broker',                  simRole: 'queue' },
  { id: 'sqs',           label: 'Message Queue',       category: 'messaging',       icon: 'list',                description: 'Managed message queue (SQS/etc)',       simRole: 'queue' },
  { id: 'pubsub',        label: 'Pub/Sub',             category: 'messaging',       icon: 'radio',               description: 'Publish-subscribe event system',        simRole: 'queue' },
  { id: 'event-bus',     label: 'Event Bus',           category: 'messaging',       icon: 'bell',                description: 'Event routing & aggregation',           simRole: 'queue' },
  { id: 'nats',          label: 'NATS',                category: 'messaging',       icon: 'send',                description: 'High-performance messaging',            simRole: 'queue' },

  // ── Infrastructure (6) ───────────────────────────────────────────────────
  { id: 'docker',        label: 'Docker Container',    category: 'infrastructure',  icon: 'box',                 description: 'Isolated Docker container',             simRole: 'microservice' },
  { id: 'kubernetes',    label: 'K8s Pod',             category: 'infrastructure',  icon: 'hexagon',             description: 'Kubernetes workload pod',               simRole: 'microservice' },
  { id: 'k8s-service',   label: 'K8s Service',         category: 'infrastructure',  icon: 'circle-dot',          description: 'Kubernetes service / ClusterIP',        simRole: 'loadBalancer' },
  { id: 'ingress',       label: 'Ingress Controller',  category: 'infrastructure',  icon: 'arrow-down-to-line',  description: 'K8s ingress / TLS terminator',          simRole: 'loadBalancer' },
  { id: 'service-mesh',  label: 'Service Mesh',        category: 'infrastructure',  icon: 'git-merge',           description: 'Istio / Linkerd service mesh',          simRole: 'loadBalancer' },
  { id: 'config-server', label: 'Config Server',       category: 'infrastructure',  icon: 'sliders',             description: 'Centralised configuration store',       simRole: 'appServer' },

  // ── Monitoring (5) ───────────────────────────────────────────────────────
  { id: 'prometheus',    label: 'Prometheus',          category: 'monitoring',      icon: 'bar-chart-2',         description: 'Time-series metrics collection',        simRole: 'monitoring' },
  { id: 'grafana',       label: 'Grafana',             category: 'monitoring',      icon: 'pie-chart',           description: 'Observability dashboards',              simRole: 'monitoring' },
  { id: 'jaeger',        label: 'Jaeger Tracing',      category: 'monitoring',      icon: 'git-branch',          description: 'Distributed tracing system',            simRole: 'monitoring' },
  { id: 'log-agg',       label: 'Log Aggregator',      category: 'monitoring',      icon: 'terminal',            description: 'Centralised log collection',            simRole: 'monitoring' },
  { id: 'alertmanager',  label: 'Alert Manager',       category: 'monitoring',      icon: 'alert-triangle',      description: 'Alert routing & notification',          simRole: 'monitoring' },
];

// ── Type prefix map for clean node labels ─────────────────────────────────
export const NODE_LABEL_PREFIXES: Record<string, string> = {
  'client':        'Browser',
  'cdn':           'CDN',
  'dns':           'DNS',
  'waf':           'WAF',
  'load-balancer': 'LB',
  'api-gateway':   'API-GW',
  'router':        'Router',
  'firewall':      'Firewall',
  'microservice':  'Service',
  'api-server':    'API',
  'lambda':        'Lambda',
  'worker':        'Worker',
  'job-processor': 'Job',
  'auth-service':  'Auth',
  'rate-limiter':  'RateLimiter',
  'reverse-proxy': 'Proxy',
  'postgres':      'Postgres',
  'mysql':         'MySQL',
  'mongodb':       'MongoDB',
  'redis':         'Redis',
  'elastic':       'ES',
  's3':            'S3',
  'data-warehouse':'DWH',
  'timeseries-db': 'TSDB',
  'kafka':         'Kafka',
  'rabbitmq':      'RabbitMQ',
  'sqs':           'Queue',
  'pubsub':        'PubSub',
  'event-bus':     'EventBus',
  'nats':          'NATS',
  'docker':        'Container',
  'kubernetes':    'K8s-Pod',
  'k8s-service':   'K8s-Svc',
  'ingress':       'Ingress',
  'service-mesh':  'Mesh',
  'config-server': 'Config',
  'prometheus':    'Prometheus',
  'grafana':       'Grafana',
  'jaeger':        'Jaeger',
  'log-agg':       'Logs',
  'alertmanager':  'Alertmanager',
};
