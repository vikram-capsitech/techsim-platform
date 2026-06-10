import knowledgeData from './knowledgeCards.json';
import type { KnowledgeCard } from './index';

export const COMPONENT_ID_MAP: Record<string, string> = {
  // Network
  clientBrowser: '',
  client: '',
  cdn: 'cdn',
  dns: 'dns',
  waf: 'waf',
  firewall: 'waf',
  loadBalancer: 'load_balancer',
  'load-balancer': 'load_balancer',
  load_balancer: 'load_balancer',
  apiGateway: 'api_gateway',
  'api-gateway': 'api_gateway',
  api_gateway: 'api_gateway',
  router: 'reverse_proxy',
  reverseProxy: 'reverse_proxy',
  reverse_proxy: 'reverse_proxy',
  rateLimiter: 'rate_limiter',
  'rate-limiter': 'rate_limiter',
  rate_limiter: 'rate_limiter',

  // Compute
  microservice: 'microservice',
  apiServer: 'microservice',
  'api-server': 'microservice',
  api_server: 'microservice',
  service: 'microservice',
  serverless: 'serverless',
  lambda: 'serverless',
  worker: 'microservice',

  // Data
  postgresql: 'postgresql',
  postgres: 'postgresql',
  mysql: 'mysql',
  mongodb: 'mongodb',
  mongo: 'mongodb',
  redis: 'redis',
  redisCache: 'redis',
  cache: 'redis',
  cassandra: 'cassandra',
  elasticsearch: 'elasticsearch',
  elastic: 'elasticsearch',
  search: 'elasticsearch',
  dynamodb: 'dynamodb',
  s3: 's3',
  storage: 's3',
  'hard-drive': 's3',
  dataWarehouse: 'data_warehouse',
  'data-warehouse': 'data_warehouse',
  data_warehouse: 'data_warehouse',
  timeseriesDb: 'timeseries_db',
  'timeseries-db': 'timeseries_db',

  // Messaging
  kafka: 'kafka',
  rabbitmq: 'rabbitmq',
  queue: 'rabbitmq',
  messageQueue: 'rabbitmq',
  sqs: 'sqs',
  sns: 'sns',
  eventBus: 'event_bridge',
  'event-bus': 'event_bridge',
  pubsub: 'pub_sub',

  // Monitoring
  prometheus: 'prometheus',
  grafana: 'grafana',
  monitoring: 'prometheus',
  jaeger: 'jaeger',
  alertManager: 'pager_duty',
  'log-agg': 'prometheus',
};

export function getMappedComponentId(nodeType: string): string | null {
  if (!nodeType) return null;
  const direct = COMPONENT_ID_MAP[nodeType];
  if (direct !== undefined) return direct || null;

  const lower = nodeType.toLowerCase();
  const lowerDirect = COMPONENT_ID_MAP[lower];
  if (lowerDirect !== undefined) return lowerDirect || null;

  // camelCase → snake_case
  const snaked = nodeType
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
  const snakedDirect = COMPONENT_ID_MAP[snaked];
  if (snakedDirect !== undefined) return snakedDirect || null;

  // kebab → snake
  const unkebabed = nodeType.replace(/-/g, '_').toLowerCase();
  const unkebabedDirect = COMPONENT_ID_MAP[unkebabed];
  if (unkebabedDirect !== undefined) return unkebabedDirect || null;

  return null;
}

export function getKnowledgeCardById(mappedId: string): KnowledgeCard | undefined {
  const components = (knowledgeData as { components: KnowledgeCard[] }).components;
  if (!components?.length || !mappedId) return undefined;
  return components.find(
    c =>
      c.componentId === mappedId ||
      c.componentId === mappedId.replace(/_/g, '') ||
      c.name.toLowerCase().replace(/\s+/g, '_') === mappedId,
  );
}
