import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import { ToolIcon } from '../utils/toolIcon'

export interface SelectedToolData {
  id: string
  name: string
  canvasLabel: string
  openSource?: boolean
  cloudManaged?: boolean
  provider?: string
}

interface Tool {
  id: string
  name: string
  description: string
  openSource: boolean
  cloudManaged: boolean
  provider?: string
  bestFor: string[]
  notGoodFor?: string[]
  costEstimate: string
  canvasLabel: string
  groupName: string
  pros?: string[]
  cons?: string[]
  realWorldUsage?: Array<{ company: string; [key: string]: unknown }>
}

// Maps canvas/drag nodeTypeIds (hyphenated or camelCase) → registry snake_case IDs
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
  'messageQueue':     'rabbitmq',
  'message-queue':    'rabbitmq',
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
  'monitoring':       'prometheus',
  'jaeger':           'prometheus',
  'log-agg':          'prometheus',
  'alertmanager':     'prometheus',
}

interface ClientType {
  id: string
  name: string
  description: string
  canvasLabel: string
}

interface ToolSelectionModalProps {
  nodeType: string
  nodeName: string
  onSelect: (tool: SelectedToolData) => void
  onSkip: () => void
  onCancel: () => void
}

const CLIENT_TYPE_ICONS: Record<string, string> = {
  web_browser:  '🌐',
  mobile_app:   '📱',
  desktop_app:  '🖥️',
  iot_device:   '📡',
  cli_tool:     '⌨️',
}

export function ToolSelectionModal({ nodeType, nodeName, onSelect, onSkip, onCancel }: ToolSelectionModalProps) {
  const [tools, setTools] = useState<Tool[]>([])
  const [clientTypes, setClientTypes] = useState<ClientType[]>([])
  const [isClientOrigin, setIsClientOrigin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedTool, setSelectedTool] = useState<Tool | ClientType | null>(null)
  const [expandedTool, setExpandedTool] = useState<string | null>(null)
  const [activeGroup, setActiveGroup] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const registryId = NODE_TYPE_TO_REGISTRY_ID[nodeType] ?? nodeType
        const res = await apiClient.get(`/api/registry/node/${registryId}/tools`)
        if (res.data.isClientOrigin) {
          setIsClientOrigin(true)
          setClientTypes(res.data.clientTypes || [])
        } else {
          setTools(res.data.tools || [])
        }
      } catch {
        // Registry doesn't know this node type — allow skip
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [nodeType])

  const groups = ['all', ...Array.from(new Set(tools.map(t => t.groupName).filter(Boolean)))]

  const filtered = tools.filter(t => {
    const matchesGroup = activeGroup === 'all' || t.groupName === activeGroup
    const matchesSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description?.toLowerCase() ?? '').includes(search.toLowerCase())
    return matchesGroup && matchesSearch
  })

  const handleConfirm = () => {
    if (!selectedTool) return
    const tool = selectedTool as Tool
    onSelect({
      id: selectedTool.id,
      name: selectedTool.name,
      canvasLabel: tool.canvasLabel || selectedTool.name,
      openSource: (selectedTool as Tool).openSource,
      cloudManaged: (selectedTool as Tool).cloudManaged,
      provider: (selectedTool as Tool).provider,
    })
  }

  const addLabel = selectedTool
    ? ((selectedTool as Tool).canvasLabel || selectedTool.name)
    : null

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: 680,
          maxHeight: '82vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
                Select {nodeName} Implementation
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                Choose the specific tool you want to use on canvas
              </p>
            </div>
            <button
              onClick={onCancel}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}
            >✕</button>
          </div>

          {/* Search — only when many tools */}
          {!isClientOrigin && tools.length > 6 && (
            <input
              placeholder="Search tools..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              style={{
                marginTop: 12, width: '100%',
                padding: '8px 12px', borderRadius: 8,
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: 13, outline: 'none',
                boxSizing: 'border-box',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            />
          )}

          {/* Group tabs */}
          {!isClientOrigin && groups.length > 2 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {groups.map(group => (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12,
                    background: activeGroup === group ? '#7C3AED' : 'var(--card-bg)',
                    border: `1px solid ${activeGroup === group ? '#7C3AED' : 'var(--border)'}`,
                    color: activeGroup === group ? 'white' : 'var(--text-muted)',
                    cursor: 'pointer', fontWeight: activeGroup === group ? 500 : 400,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {group === 'all' ? 'All' : group}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Tool grid ──────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
              Loading tools…
            </div>
          )}

          {/* Client-origin: show client type tiles */}
          {!loading && isClientOrigin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {clientTypes.map(ct => (
                <button
                  key={ct.id}
                  onClick={() => setSelectedTool(ct)}
                  style={{
                    background: selectedTool?.id === ct.id ? 'rgba(124,58,237,0.13)' : 'var(--card-bg)',
                    border: `2px solid ${selectedTool?.id === ct.id ? '#7C3AED' : 'var(--border)'}`,
                    borderRadius: 10, padding: '16px 12px',
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>
                    {CLIENT_TYPE_ICONS[ct.id] ?? '🔌'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
                    {ct.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {ct.description}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Regular tool grid */}
          {!loading && !isClientOrigin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {filtered.map(tool => {
                const isSelected = selectedTool?.id === tool.id
                const isExpanded = expandedTool === tool.id
                return (
                  <button
                    key={tool.id}
                    onClick={() => setExpandedTool(isExpanded ? null : tool.id)}
                    onDoubleClick={() => { setSelectedTool(tool); setExpandedTool(null) }}
                    style={{
                      background: isSelected ? 'rgba(124,58,237,0.13)' : 'var(--card-bg)',
                      border: `2px solid ${isSelected ? '#7C3AED' : isExpanded ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
                      borderRadius: 10, padding: '12px 14px',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s',
                      gridColumn: isExpanded ? '1 / -1' : undefined,
                    }}
                  >
                    {/* Tool header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 6,
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <ToolIcon toolId={tool.id} size={16} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tool.name}
                      </span>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        {tool.openSource && (
                          <span style={{ fontSize: 9, padding: '1px 5px', background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace" }}>OSS</span>
                        )}
                        {tool.cloudManaged && (
                          <span style={{ fontSize: 9, padding: '1px 5px', background: 'rgba(59,130,246,0.12)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace" }}>Managed</span>
                        )}
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 2 }}>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.55, fontFamily: "'IBM Plex Mono', monospace" }}>
                      {tool.description?.slice(0, 90)}{(tool.description?.length ?? 0) > 90 ? '…' : ''}
                    </p>

                    {tool.bestFor?.[0] && !isExpanded && (
                      <div style={{ fontSize: 10, color: 'var(--accent-bright)', fontFamily: "'IBM Plex Mono', monospace" }}>
                        ✓ {tool.bestFor[0]}
                      </div>
                    )}

                    {/* Expanded three-perspective detail */}
                    {isExpanded && (
                      <div
                        style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 10, textAlign: 'left' }}
                        onClick={e => e.stopPropagation()}
                      >
                        {/* 1 — Core (technical) */}
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
                            ⚙ Core
                          </div>
                          <p style={{ fontSize: 11, color: 'var(--text-secondary, var(--text-muted))', margin: 0, lineHeight: 1.6, fontFamily: "'IBM Plex Mono', monospace" }}>
                            {tool.description}
                          </p>
                        </div>

                        {/* 2 — Real World */}
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
                            🌍 Real World
                          </div>
                          <p style={{ fontSize: 11, color: 'var(--text-secondary, var(--text-muted))', margin: '0 0 4px', lineHeight: 1.6, fontFamily: "'IBM Plex Mono', monospace" }}>
                            {tool.bestFor?.length
                              ? `Best for: ${tool.bestFor.join(', ')}`
                              : 'Real-world usage data coming soon'}
                          </p>
                          {(tool.realWorldUsage?.length ?? 0) > 0 && (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {tool.realWorldUsage!.map(rw => (
                                <span key={rw.company} style={{ fontSize: 9, padding: '1px 6px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                                  {rw.company}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 3 — When to Pick */}
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
                            💡 When to Pick This
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary, var(--text-muted))', lineHeight: 1.6, fontFamily: "'IBM Plex Mono', monospace" }}>
                            {tool.bestFor?.[0] && (
                              <div><span style={{ color: '#10B981' }}>✓ Pick if: </span>{tool.bestFor[0]}</div>
                            )}
                            {tool.notGoodFor?.[0] && (
                              <div><span style={{ color: '#EF4444' }}>✗ Avoid if: </span>{tool.notGoodFor[0]}</div>
                            )}
                          </div>
                        </div>

                        {/* Pros / Cons */}
                        {((tool.pros?.length ?? 0) > 0 || (tool.cons?.length ?? 0) > 0) && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                            <div>
                              {tool.pros?.slice(0, 2).map(p => (
                                <div key={p} style={{ fontSize: 10, color: '#10B981', marginBottom: 2, fontFamily: "'IBM Plex Mono', monospace" }}>+ {p}</div>
                              ))}
                            </div>
                            <div>
                              {tool.cons?.slice(0, 2).map(c => (
                                <div key={c} style={{ fontSize: 10, color: '#EF4444', marginBottom: 2, fontFamily: "'IBM Plex Mono', monospace" }}>- {c}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Select button */}
                        <button
                          onClick={() => { setSelectedTool(tool); setExpandedTool(null) }}
                          style={{
                            width: '100%',
                            background: '#7C3AED', color: 'white',
                            border: 'none', borderRadius: 6,
                            padding: '7px', cursor: 'pointer',
                            fontSize: 12, fontWeight: 500,
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          Select {tool.name} →
                        </button>
                      </div>
                    )}
                  </button>
                )
              })}

              {filtered.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
                  {search ? `No tools match "${search}"` : 'No tools available for this node type'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center',
        }}>
          <button
            onClick={onSkip}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              borderRadius: 8, padding: '8px 16px',
              cursor: 'pointer', fontSize: 13,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Skip — use generic
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onCancel}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                borderRadius: 8, padding: '8px 16px',
                cursor: 'pointer', fontSize: 13,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedTool}
              style={{
                background: selectedTool ? '#7C3AED' : 'rgba(124,58,237,0.25)',
                border: 'none', color: 'white',
                borderRadius: 8, padding: '8px 24px',
                cursor: selectedTool ? 'pointer' : 'not-allowed',
                fontSize: 13, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                transition: 'background 0.15s',
              }}
            >
              {addLabel ? `Add ${addLabel} →` : 'Select a tool above'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
