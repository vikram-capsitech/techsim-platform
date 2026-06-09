// Maps nodeTypeId → simple-icons brand data (SVG path + hex color).
// Only imports icons confirmed present in simple-icons v16.
// AWS-specific service icons are absent from v16; those nodeTypeIds
// fall back to the Lucide NodeIcon in TechNode.
import {
  siNginx,
  siApachekafka,
  siRedis,
  siPostgresql,
  siMongodb,
  siMysql,
  siElasticsearch,
  siRabbitmq,
  siDocker,
  siKubernetes,
  siPrometheus,
  siGrafana,
  siCloudflare,
  siApachecassandra,
  siApachespark,
  siTerraform,
  siJenkins,
  siGooglecloud,
  siGithubactions,
} from 'simple-icons';

export interface ServiceIconData {
  path: string;
  hex: string;
  title: string;
}

export const SERVICE_ICONS: Record<string, ServiceIconData> = {
  // Network / CDN
  'nginx':         siNginx,
  'cloudflare':    siCloudflare,
  'cdn':           siCloudflare,

  // Compute / Containers
  'docker':        siDocker,
  'kubernetes':    siKubernetes,

  // Data stores
  'redis':         siRedis,
  'postgres':      siPostgresql,
  'mongodb':       siMongodb,
  'mysql':         siMysql,
  'elastic':       siElasticsearch,
  'cassandra':     siApachecassandra,
  'timeseries-db': siApachecassandra,

  // Messaging
  'kafka':         siApachekafka,
  'rabbitmq':      siRabbitmq,

  // Monitoring
  'prometheus':    siPrometheus,
  'grafana':       siGrafana,

  // Infrastructure / CI/CD
  'terraform':     siTerraform,
  'jenkins':       siJenkins,
  'cicd':          siGithubactions,
  'spark':         siApachespark,

  // Cloud providers (generic nodes)
  'gcp':           siGooglecloud,
};
