// Renders simple-icons SVG icons for tools in the ToolSelectionModal.
// All imports verified present in simple-icons v16.
import {
  siNginx,
  siTraefikproxy,
  siEnvoyproxy,
  siCaddy,
  siKong,
  siCloudflare,
  siGooglecloud,
  siPostgresql,
  siMysql,
  siMongodb,
  siRedis,
  siApachecassandra,
  siElasticsearch,
  siApachekafka,
  siRabbitmq,
  siDocker,
  siKubernetes,
  siHelm,
  siArgo,
  siPrometheus,
  siGrafana,
  siDatadog,
  siSentry,
  siExpress,
  siFastapi,
  siSpringboot,
  siDjango,
  siNestjs,
  siFlask,
  siGo,
  siRust,
  siLaravel,
  siRubyonrails,
  siElixir,
  siAuth0,
  siOkta,
  siKeycloak,
  siMinio,
} from 'simple-icons'

interface SimpleIcon { path: string; hex: string }

// Maps tool registry IDs → simple-icons objects
const TOOL_ICONS: Record<string, SimpleIcon> = {
  // Load balancer / proxy / gateway
  'nginx':                    siNginx,
  'nginx_gateway':            siNginx,
  'traefik':                  siTraefikproxy,
  'traefik_gateway':          siTraefikproxy,
  'envoy':                    siEnvoyproxy,
  'caddy':                    siCaddy,
  'kong':                     siKong,
  // Cloud providers (use Cloudflare as fallback for AWS/Azure since those icons aren't in v16)
  'aws_alb':                  siCloudflare,
  'aws_nlb':                  siCloudflare,
  'aws_api_gateway':          siCloudflare,
  'aws_lambda':               siCloudflare,
  'aws_s3':                   siCloudflare,
  'aws_msk':                  siApachekafka,
  'aws_cognito':              siCloudflare,
  'gcp_cloud_lb':             siGooglecloud,
  'gcp_cloud_functions':      siGooglecloud,
  'google_cloud_dns':         siGooglecloud,
  'gcs':                      siGooglecloud,
  'cloudflare_lb':            siCloudflare,
  'cloudflare_dns':           siCloudflare,
  'cloudflare_r2':            siCloudflare,
  'cloudflare_workers':       siCloudflare,
  // Databases
  'postgresql':               siPostgresql,
  'mysql':                    siMysql,
  'mongodb':                  siMongodb,
  'redis':                    siRedis,
  'cassandra':                siApachecassandra,
  'elasticsearch':            siElasticsearch,
  // Messaging
  'apache_kafka':             siApachekafka,
  'confluent':                siApachekafka,
  'rabbitmq':                 siRabbitmq,
  // Frameworks / runtimes
  'express_js':               siExpress,
  'fastapi':                  siFastapi,
  'spring_boot':              siSpringboot,
  'django':                   siDjango,
  'nestjs':                   siNestjs,
  'flask':                    siFlask,
  'gin':                      siGo,
  'actix_web':                siRust,
  'axum':                     siRust,
  'laravel':                  siLaravel,
  'rails':                    siRubyonrails,
  'phoenix':                  siElixir,
  // Auth
  'auth0':                    siAuth0,
  'okta':                     siOkta,
  'keycloak':                 siKeycloak,
  // Monitoring
  'prometheus':               siPrometheus,
  'grafana':                  siGrafana,
  'datadog':                  siDatadog,
  'sentry':                   siSentry,
  // Storage
  'minio':                    siMinio,
  // Containers / orchestration
  'docker_container':         siDocker,
  'kubernetes':               siKubernetes,
  'helm':                     siHelm,
  'argocd':                   siArgo,
}

export function getToolIcon(toolId: string): SimpleIcon | null {
  return TOOL_ICONS[toolId] ?? null
}

export function ToolIcon({ toolId, size = 18 }: { toolId: string; size?: number }) {
  const icon = getToolIcon(toolId)
  if (!icon) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 3, flexShrink: 0,
        background: '#7C3AED22', border: '1px solid #7C3AED44',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.max(Math.round(size * 0.55), 7), fontWeight: 700,
        color: '#7C3AED', lineHeight: 1,
      }}>
        {(toolId?.[0] ?? '?').toUpperCase()}
      </div>
    )
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={`#${icon.hex}`}
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  )
}
