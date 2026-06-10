import { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { aiApi } from '../api/client';

// Maps AI nodeType → canvas nodeTypeId + lucide icon name
const NODE_TYPE_MAP: Record<string, { nodeTypeId: string; icon: string }> = {
  loadBalancer: { nodeTypeId: 'load-balancer', icon: 'git-branch' },
  apiGateway:   { nodeTypeId: 'api-gateway',   icon: 'arrow-right-left' },
  database:     { nodeTypeId: 'postgres',       icon: 'database' },
  cache:        { nodeTypeId: 'redis',          icon: 'layers' },
  queue:        { nodeTypeId: 'kafka',          icon: 'activity' },
  microservice: { nodeTypeId: 'docker',         icon: 'box' },
  cdn:          { nodeTypeId: 'cdn',            icon: 'globe' },
  waf:          { nodeTypeId: 'firewall',       icon: 'shield' },
  router:       { nodeTypeId: 'router',         icon: 'router' },
  firewall:     { nodeTypeId: 'firewall',       icon: 'shield' },
  dns:          { nodeTypeId: 'dns',            icon: 'compass' },
};

const PROTOCOL_MAP: Record<string, string> = {
  HTTP:  'http',
  gRPC:  'http',
  TCP:   'http',
  async: 'queue',
};

const EDGE_COLORS: Record<string, string> = {
  http:     '#06B6D4',
  database: '#3B82F6',
  cache:    '#A855F7',
  queue:    '#F97316',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformDiagram(raw: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodes = raw.nodes.map((n: any) => {
    const mapping = NODE_TYPE_MAP[n.data?.nodeType] ?? { nodeTypeId: 'docker', icon: 'box' };
    return {
      id:       n.id,
      type:     'techNode',
      position: n.position ?? { x: 0, y: 0 },
      style:    { width: 210 },
      data: {
        label:      n.data?.label ?? n.id,
        icon:       mapping.icon,
        category:   n.data?.category ?? 'compute',
        nodeTypeId: mapping.nodeTypeId,
        status:     'healthy' as const,
      },
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const edges = raw.edges.map((e: any) => {
    const protocol = PROTOCOL_MAP[e.data?.protocol ?? 'HTTP'] ?? 'http';
    return {
      id:     e.id ?? `edge_${Math.random().toString(36).slice(2)}`,
      source: e.source,
      target: e.target,
      type:   'glowEdge',
      data: {
        protocol,
        color:    EDGE_COLORS[protocol] ?? '#06B6D4',
        invalid:  false,
        edgeType: 'smoothstep',
      },
    };
  });

  return { nodes, edges };
}

const TEMPLATES: Record<string, string> = {
  Netflix:  'Design a video streaming platform like Netflix serving 200M global users with 99.99% uptime, 4K streaming, content recommendations, and creator upload pipeline',
  Uber:     'Design a ride-sharing platform like Uber handling 20M daily rides with real-time GPS tracking, driver matching, surge pricing, and payment processing',
  WhatsApp: 'Design a real-time messaging system like WhatsApp handling 100B messages per day with end-to-end encryption, media sharing, and group chats',
  Twitter:  'Design a social media platform like Twitter handling 500M users, real-time tweet feed, trending topics, notifications, and media uploads',
  Stripe:   'Design a payment processing platform like Stripe handling 1M transactions per day with fraud detection, multi-currency support, and webhook system',
  Amazon:   'Design an e-commerce platform like Amazon with product search, cart, checkout, inventory management, order tracking, and recommendation engine',
};

const LOADING_MESSAGES = [
  'Analyzing system requirements...',
  'Identifying components...',
  'Placing architecture nodes...',
  'Optimizing connections...',
  'Validating architecture rules...',
  'Almost ready...',
];

export function AIGeneratorPanel({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const { setNodes, setEdges }    = useReactFlow();

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');

    const interval = setInterval(() => {
      setLoadingMsg(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);

    try {
      const raw = await aiApi.generate(prompt, 'system_design');
      const diagram = transformDiagram(raw);

      setNodes(diagram.nodes);
      setEdges(diagram.edges);

      setSuccess(`✨ ${diagram.nodes.length} components placed on canvas`);
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate diagram. Please try again.');
    } finally {
      clearInterval(interval);
      setLoading(false);
      setLoadingMsg(0);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100%',
          width: 340,
          background: '#0D0D14',
          borderLeft: '1px solid rgba(124,58,237,0.25)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          boxShadow: '-12px 0 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'rgba(124,58,237,0.2)',
                border: '1px solid rgba(124,58,237,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
              }}
            >
              ✨
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
                AI Generator
              </div>
              <div style={{ fontSize: 10, color: '#64748B', fontFamily: "'IBM Plex Mono', monospace" }}>
                Llama 3.3 70B · Groq
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'transparent', border: '1px solid transparent',
              color: '#64748B', cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Textarea */}
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#64748B', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Describe your system
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate(); }}
              placeholder={'e.g. "Design a Netflix-like streaming platform for 100M users"'}
              rows={5}
              style={{
                width: '100%',
                background: '#080810',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                color: '#CBD5E1',
                fontFamily: "'DM Sans', sans-serif",
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
                lineHeight: 1.5,
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(124,58,237,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
            <div style={{ fontSize: 10, color: '#374151', fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>
              ⌘ + Enter to generate
            </div>
          </div>

          {/* Quick templates */}
          <div>
            <div style={{ fontSize: 11, color: '#64748B', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Quick templates
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(TEMPLATES).map(([name, text]) => (
                <button
                  key={name}
                  onClick={() => setPrompt(text)}
                  style={{
                    fontSize: 11.5,
                    padding: '4px 10px',
                    borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: prompt === text ? 'rgba(124,58,237,0.2)' : 'transparent',
                    color: prompt === text ? '#A78BFA' : '#94A3B8',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (prompt !== text) { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; e.currentTarget.style.color = '#A78BFA'; } }}
                  onMouseLeave={e => { if (prompt !== text) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94A3B8'; } }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 7,
                padding: '9px 12px',
                fontSize: 12,
                color: '#FCA5A5',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 7,
                padding: '9px 12px',
                fontSize: 12,
                color: '#86EFAC',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {success}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#A78BFA', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
              <div
                style={{
                  width: 14, height: 14,
                  border: '2px solid rgba(124,58,237,0.3)',
                  borderTopColor: '#7C3AED',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  flexShrink: 0,
                }}
              />
              {LOADING_MESSAGES[loadingMsg]}
            </div>
          )}
        </div>

        {/* Footer: Generate button */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: 8,
              border: 'none',
              background: loading || !prompt.trim() ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.85)',
              color: loading || !prompt.trim() ? '#6D28D9' : 'white',
              fontSize: 13.5,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s',
              boxShadow: loading || !prompt.trim() ? 'none' : '0 0 20px rgba(124,58,237,0.3)',
            }}
            onMouseEnter={e => { if (!loading && prompt.trim()) e.currentTarget.style.background = '#7C3AED'; }}
            onMouseLeave={e => { if (!loading && prompt.trim()) e.currentTarget.style.background = 'rgba(124,58,237,0.85)'; }}
          >
            {loading ? (
              <>
                <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Generating...
              </>
            ) : (
              <>✨ Generate Diagram</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
