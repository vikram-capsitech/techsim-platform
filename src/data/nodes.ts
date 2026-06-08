export type Category = 'network' | 'compute' | 'data' | 'messaging' | 'infrastructure' | 'monitoring';

export interface NodeTemplate {
  id: string;
  label: string;
  category: Category;
  icon: string;
  description: string;
}

export const CATEGORY_META: Record<Category, { label: string; color: string; cssVar: string }> = {
  network: {
    label: 'Network',
    color: '#3B82F6',
    cssVar: 'var(--cat-network)',
  },
  compute: {
    label: 'Compute',
    color: '#A855F7',
    cssVar: 'var(--cat-compute)',
  },
  data: {
    label: 'Data',
    color: '#10B981',
    cssVar: 'var(--cat-data)',
  },
  messaging: {
    label: 'Messaging',
    color: '#F59E0B',
    cssVar: 'var(--cat-messaging)',
  },
  infrastructure: {
    label: 'Infrastructure',
    color: '#EF4444',
    cssVar: 'var(--cat-infrastructure)',
  },
  monitoring: {
    label: 'Monitoring',
    color: '#06B6D4',
    cssVar: 'var(--cat-monitoring)',
  },
};

export const NODE_TEMPLATES: NodeTemplate[] = [
  // Network
  { id: 'router',        label: 'Router',        category: 'network',         icon: 'router',          description: 'Layer 3 routing device' },
  { id: 'firewall',      label: 'Firewall',       category: 'network',         icon: 'shield',          description: 'Stateful packet inspection' },
  { id: 'load-balancer', label: 'Load Balancer',  category: 'network',         icon: 'git-branch',      description: 'Layer 7 traffic distribution' },
  { id: 'vpn-gateway',   label: 'VPN Gateway',    category: 'network',         icon: 'lock',            description: 'Encrypted tunnel endpoint' },
  { id: 'cdn',           label: 'CDN',            category: 'network',         icon: 'globe',           description: 'Edge content distribution' },

  // Compute
  { id: 'ec2',           label: 'EC2 Instance',   category: 'compute',         icon: 'server',          description: 'Virtual machine compute' },
  { id: 'kubernetes',    label: 'Kubernetes',      category: 'compute',         icon: 'hexagon',         description: 'Container orchestration' },
  { id: 'lambda',        label: 'Lambda',          category: 'compute',         icon: 'zap',             description: 'Serverless function runtime' },
  { id: 'docker',        label: 'Container',       category: 'compute',         icon: 'box',             description: 'Isolated Docker container' },
  { id: 'vm-host',       label: 'VM Host',         category: 'compute',         icon: 'cpu',             description: 'Bare-metal hypervisor host' },

  // Data
  { id: 'postgres',      label: 'PostgreSQL',      category: 'data',            icon: 'database',        description: 'Relational SQL database' },
  { id: 'redis',         label: 'Redis',           category: 'data',            icon: 'layers',          description: 'In-memory data structure store' },
  { id: 's3',            label: 'Object Storage',  category: 'data',            icon: 'hard-drive',      description: 'Scalable blob / S3 storage' },
  { id: 'mongodb',       label: 'MongoDB',         category: 'data',            icon: 'file-text',       description: 'Document-oriented NoSQL' },
  { id: 'elastic',       label: 'Elasticsearch',   category: 'data',            icon: 'search',          description: 'Distributed search engine' },

  // Messaging
  { id: 'kafka',         label: 'Kafka',           category: 'messaging',       icon: 'activity',        description: 'Distributed event streaming' },
  { id: 'rabbitmq',      label: 'RabbitMQ',        category: 'messaging',       icon: 'mail',            description: 'AMQP message broker' },
  { id: 'sqs',           label: 'SQS Queue',       category: 'messaging',       icon: 'list',            description: 'Managed message queue' },
  { id: 'sns',           label: 'SNS Topic',       category: 'messaging',       icon: 'bell',            description: 'Pub/sub notification service' },
  { id: 'event-bus',     label: 'Event Bus',       category: 'messaging',       icon: 'radio',           description: 'Event routing & aggregation' },

  // Infrastructure
  { id: 'terraform',     label: 'Terraform',       category: 'infrastructure',  icon: 'code-2',          description: 'Infrastructure as code' },
  { id: 'cicd',          label: 'CI/CD Pipeline',  category: 'infrastructure',  icon: 'git-merge',       description: 'Automated delivery pipeline' },
  { id: 'dns',           label: 'DNS Server',      category: 'infrastructure',  icon: 'compass',         description: 'Domain name resolution' },
  { id: 'api-gateway',   label: 'API Gateway',     category: 'infrastructure',  icon: 'arrow-right-left', description: 'API management layer' },
  { id: 'nginx',         label: 'Nginx',           category: 'infrastructure',  icon: 'triangle',        description: 'Reverse proxy / web server' },

  // Monitoring
  { id: 'prometheus',    label: 'Prometheus',      category: 'monitoring',      icon: 'bar-chart-2',     description: 'Time-series metrics collection' },
  { id: 'grafana',       label: 'Grafana',         category: 'monitoring',      icon: 'pie-chart',       description: 'Observability dashboards' },
  { id: 'datadog',       label: 'DataDog',         category: 'monitoring',      icon: 'eye',             description: 'Full-stack APM platform' },
  { id: 'pagerduty',     label: 'PagerDuty',       category: 'monitoring',      icon: 'alert-triangle',  description: 'Incident management & alerting' },
  { id: 'log-agg',       label: 'Log Aggregator',  category: 'monitoring',      icon: 'terminal',        description: 'Centralized log collection' },
];
