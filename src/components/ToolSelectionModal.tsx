import { useState, useEffect } from 'react'
import apiClient from '../api/client'

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
  costEstimate: string
  canvasLabel: string
  groupName: string
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
  const [activeGroup, setActiveGroup] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get(`/api/registry/node/${nodeType}/tools`)
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
                return (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool)}
                    style={{
                      background: isSelected ? 'rgba(124,58,237,0.13)' : 'var(--card-bg)',
                      border: `2px solid ${isSelected ? '#7C3AED' : 'var(--border)'}`,
                      borderRadius: 10, padding: '12px 14px',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
                        {tool.name}
                      </span>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 6 }}>
                        {tool.openSource && (
                          <span style={{ fontSize: 9, padding: '1px 5px', background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
                            OSS
                          </span>
                        )}
                        {tool.cloudManaged && (
                          <span style={{ fontSize: 9, padding: '1px 5px', background: 'rgba(59,130,246,0.12)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
                            Managed
                          </span>
                        )}
                      </div>
                    </div>

                    <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.55, fontFamily: "'IBM Plex Mono', monospace" }}>
                      {tool.description?.slice(0, 100)}{(tool.description?.length ?? 0) > 100 ? '…' : ''}
                    </p>

                    {tool.bestFor?.[0] && (
                      <div style={{ fontSize: 10, color: 'var(--accent-bright)', fontFamily: "'IBM Plex Mono', monospace" }}>
                        ✓ {tool.bestFor[0]}
                      </div>
                    )}

                    {tool.costEstimate && (
                      <div style={{ fontSize: 10, color: '#10B981', marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {tool.costEstimate}
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
