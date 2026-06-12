import registryData from './techsim_merged_registry.json';

const registry = (registryData as { nodeToolRegistry: Record<string, unknown> }).nodeToolRegistry as Record<string, {
  connectionRestrictions?: {
    cannotConnectTo?: string[];
    cannotConnectToReason?: Record<string, string>;
  };
}>;

// Maps canvas nodeTypeIds (hyphenated / camelCase) → registry snake_case IDs.
// Keep in sync with ToolSelectionModal's NODE_TYPE_TO_REGISTRY_ID.
const NODE_TYPE_TO_REGISTRY_ID: Record<string, string> = {
  // Network
  'client':           'client_browser',
  'clientBrowser':    'client_browser',
  'cdn':              'cdn',
  'dns':              'dns',
  'waf':              'waf',
  'firewall':         'waf',
  'load-balancer':    'load_balancer',
  'load_balancer':    'load_balancer',
  'loadBalancer':     'load_balancer',
  'api-gateway':      'api_gateway',
  'api_gateway':      'api_gateway',
  'apiGateway':       'api_gateway',
  'router':           'reverse_proxy',
  'reverse-proxy':    'reverse_proxy',
  'reverse_proxy':    'reverse_proxy',
  'reverseProxy':     'reverse_proxy',
  'rate-limiter':     'rate_limiter',
  'rate_limiter':     'rate_limiter',
  'rateLimiter':      'rate_limiter',
  // Compute
  'microservice':     'microservice',
  'api-server':       'microservice',
  'apiServer':        'microservice',
  'service':          'microservice',
  'lambda':           'serverless_function',
  'serverless':       'serverless_function',
  'worker':           'microservice',
  'job-processor':    'microservice',
  'auth-service':     'auth_service',
  'auth_service':     'auth_service',
  'authService':      'auth_service',
  'websocket-server': 'websocket_server',
  'websocketServer':  'websocket_server',
  // Data
  'postgres':         'postgresql',
  'postgresql':       'postgresql',
  'mysql':            'mysql',
  'mongodb':          'mongodb',
  'redis':            'redis',
  'redisCache':       'redis',
  'cache':            'redis',
  'cassandra':        'cassandra',
  'elastic':          'elasticsearch',
  'elasticsearch':    'elasticsearch',
  'dynamodb':         'dynamodb',
  's3':               'aws_s3',
  'storage':          'aws_s3',
  'data-warehouse':   'postgresql',
  'timeseries-db':    'cassandra',
  // Messaging
  'kafka':            'apache_kafka',
  'rabbitmq':         'rabbitmq',
  'sqs':              'rabbitmq',
  'pubsub':           'rabbitmq',
  'event-bus':        'rabbitmq',
  'nats':             'rabbitmq',
  'message-queue':    'rabbitmq',
  'messageQueue':     'rabbitmq',
  // Infrastructure
  'kubernetes':       'kubernetes',
  'docker':           'docker_container',
  'k8s-service':      'kubernetes',
  'ingress':          'kubernetes',
  'service-mesh':     'kubernetes',
  'config-server':    'microservice',
  // Monitoring
  'prometheus':       'prometheus',
  'grafana':          'grafana',
  'jaeger':           'prometheus',
  'log-agg':          'prometheus',
  'alertmanager':     'prometheus',
};

export function isConnectionValid(
  sourceType: string,
  targetType: string,
): { valid: boolean; reason?: string } {
  const sourceId = NODE_TYPE_TO_REGISTRY_ID[sourceType] ?? sourceType;
  const targetId = NODE_TYPE_TO_REGISTRY_ID[targetType] ?? targetType;

  const sourceNode = registry[sourceId];
  if (!sourceNode?.connectionRestrictions) return { valid: true };

  const blocked = sourceNode.connectionRestrictions.cannotConnectTo ?? [];
  if (blocked.includes(targetId)) {
    const reason =
      sourceNode.connectionRestrictions.cannotConnectToReason?.[targetId] ??
      `${sourceType} cannot connect directly to ${targetType} in a proper architecture`;
    return { valid: false, reason };
  }

  return { valid: true };
}
