import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
  type EdgeMouseHandler,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TechNode, type TechNodeData } from './TechNode';
import { GlowEdge, type EdgeRoutingType } from './GlowEdge';
import { AIGeneratorPanel } from './AIGeneratorPanel';
import { NodeSettingsPanel } from './NodeSettingsPanel';
import { CATEGORY_META, type Category } from '../data/nodes';
import { validateArchitecture, invalidEdgeIds } from '../engine/validator';
import type { EdgeProtocol, ValidationIssue } from '../types';
import type { EdgeState, NodeState } from '../simulation/SimulationEngine';

const nodeTypes = { techNode: TechNode };
const edgeTypes = { glowEdge: GlowEdge };
const SNAP_GRID: [number, number] = [16, 16];

// ── Clean node label prefixes per nodeTypeId ───────────────────────────────
const TYPE_PREFIXES: Record<string, string> = {
  'router':        'Router',
  'firewall':      'Firewall',
  'load-balancer': 'LB',
  'vpn-gateway':   'VPN',
  'cdn':           'CDN',
  'ec2':           'EC2',
  'kubernetes':    'K8s',
  'lambda':        'Lambda',
  'docker':        'Container',
  'vm-host':       'VM',
  'postgres':      'Postgres',
  'redis':         'Redis',
  's3':            'S3',
  'mongodb':       'MongoDB',
  'elastic':       'ES',
  'kafka':         'Kafka',
  'rabbitmq':      'RabbitMQ',
  'sqs':           'SQS',
  'sns':           'SNS',
  'event-bus':     'EventBus',
  'terraform':     'Terraform',
  'cicd':          'CICD',
  'dns':           'DNS',
  'api-gateway':   'API-GW',
  'nginx':         'Nginx',
  'prometheus':    'Prometheus',
  'grafana':       'Grafana',
  'datadog':       'Datadog',
  'pagerduty':     'PD',
  'log-agg':       'Logs',
};

// ── Protocol inference ─────────────────────────────────────────────────────
function inferProtocol(src: TechNodeData, tgt: TechNodeData): EdgeProtocol {
  if (tgt.category === 'data') return tgt.icon === 'layers' ? 'cache' : 'database';
  if (tgt.category === 'messaging' || src.category === 'messaging') return 'queue';
  return 'http';
}

// ── Protocol → default color ───────────────────────────────────────────────
const PROTOCOL_COLORS: Record<EdgeProtocol, string> = {
  http:     '#06B6D4',
  database: '#3B82F6',
  cache:    '#A855F7',
  queue:    '#F97316',
};

// ── Props ──────────────────────────────────────────────────────────────────
export interface CanvasHandle {
  getSnapshot: () => { nodes: Node[]; edges: Edge[] };
  runValidation: () => void;
  highlightIssue: (issue: ValidationIssue) => void;
  loadPreset: (presetNodes: Node[], presetEdges: Edge[]) => void;
}

interface CanvasProps {
  onCountChange: (nodes: number) => void;
  onNodeSelect: (node: Node | null) => void;
  onIssuesChange: (issues: ValidationIssue[]) => void;
  onNewIssues: (fresh: ValidationIssue[]) => void;
  onTopologyChange?: (nodes: Node[], edges: Edge[]) => void;
  onEdgeSelect?: (edgeId: string | null) => void;
  onChaosOnNode?: (chaosId: string, nodeId: string) => void;
  onPresetsClick?: () => void;
  isSimulationRunning?: boolean;
  nodeStates?: Map<string, NodeState>;
  edgeStates?: Map<string, EdgeState>;
  canvasRef?: React.RefObject<CanvasHandle | null>;
}

export function Canvas({
  onCountChange,
  onNodeSelect,
  onIssuesChange,
  onNewIssues,
  onTopologyChange,
  onEdgeSelect,
  onChaosOnNode,
  onPresetsClick,
  isSimulationRunning = false,
  nodeStates = new Map(),
  edgeStates = new Map(),
  canvasRef,
}: CanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevIssueCount = useRef(0);

  // Per-type node counters — never reset so IDs stay unique within a session
  const nodeTypeCountsRef = useRef<Map<string, number>>(new Map());

  const [showAIPanel, setShowAIPanel] = useState(false);
  const [settingsNodeId, setSettingsNodeId] = useState<string | null>(null);

  // Listen for gear-icon open-settings events dispatched by TechNode
  useEffect(() => {
    const handler = (e: Event) => {
      setSettingsNodeId((e as CustomEvent<{ nodeId: string }>).detail.nodeId);
    };
    window.addEventListener('node-settings-open', handler);
    return () => window.removeEventListener('node-settings-open', handler);
  }, []);

  // Default routing type for newly drawn edges
  const [defaultEdgeType, setDefaultEdgeType] = useState<EdgeRoutingType>('smoothstep');
  const defaultEdgeTypeRef = useRef<EdgeRoutingType>('smoothstep');
  const updateDefaultEdgeType = (t: EdgeRoutingType) => {
    defaultEdgeTypeRef.current = t;
    setDefaultEdgeType(t);
  };

  useEffect(() => {
    onTopologyChange?.(nodes, edges);
  }, [nodes, edges, onTopologyChange]);

  // Expose imperative API
  useEffect(() => {
    if (!canvasRef) return;
    canvasRef.current = {
      getSnapshot: () => ({ nodes, edges }),
      runValidation: () => runValidate(nodes, edges),
      highlightIssue: (issue) => {
        if (issue.nodeId) {
          setNodes((ns) =>
            ns.map((n) => ({ ...n, selected: n.id === issue.nodeId })),
          );
        }
        if (issue.edgeId) {
          setEdges((es) =>
            es.map((e) => ({ ...e, selected: e.id === issue.edgeId })),
          );
        }
      },
      loadPreset: (presetNodes, presetEdges) => {
        nodeTypeCountsRef.current.clear();
        setNodes(presetNodes);
        setEdges(presetEdges);
        onCountChange(presetNodes.length);
        setTimeout(() => fitView({ padding: 0.12, duration: 350 }), 60);
        setTimeout(() => runValidate(presetNodes, presetEdges), 80);
      },
    };
  });

  // ── Validation ───────────────────────────────────────────────────────────
  const runValidate = useCallback(
    (ns: Node[], es: Edge[]) => {
      const issues = validateArchitecture(ns, es);
      const badEdges = invalidEdgeIds(issues);

      setEdges((prev) =>
        prev.map((e) => ({
          ...e,
          data: { ...e.data, invalid: badEdges.has(e.id) },
        })),
      );

      onIssuesChange(issues);

      const newCount = issues.length;
      if (newCount > prevIssueCount.current) {
        onNewIssues(issues.slice(prevIssueCount.current));
      }
      prevIssueCount.current = newCount;
    },
    [onIssuesChange, onNewIssues, setEdges],
  );

  // ── Connect ──────────────────────────────────────────────────────────────
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return;

      const protocol = inferProtocol(
        sourceNode.data as TechNodeData,
        targetNode.data as TechNodeData,
      );

      setEdges((eds) => {
        const next = addEdge(
          {
            ...connection,
            id: `edge_${Date.now()}`,
            type: 'glowEdge',
            data: {
              protocol,
              color: PROTOCOL_COLORS[protocol],
              invalid: false,
              edgeType: defaultEdgeTypeRef.current,
            },
          },
          eds,
        );
        setTimeout(() => runValidate(nodes, next), 0);
        return next;
      });
    },
    [nodes, setEdges, runValidate],
  );

  // ── Drag & drop ──────────────────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      // Chaos scenario dropped onto a node
      const chaosId = e.dataTransfer.getData('application/chaos-type');
      if (chaosId && onChaosOnNode) {
        const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        const hit = nodes.find(n => {
          const w = (n.style?.width as number) ?? 210;
          const h = (n.measured?.height as number) ?? 80;
          return flowPos.x >= n.position.x && flowPos.x <= n.position.x + w
              && flowPos.y >= n.position.y && flowPos.y <= n.position.y + h;
        });
        if (hit) onChaosOnNode(chaosId, hit.id);
        return;
      }

      const type     = e.dataTransfer.getData('application/reactflow-type');
      const icon     = e.dataTransfer.getData('application/reactflow-icon');
      const category = e.dataTransfer.getData('application/reactflow-category') as Category;
      const rawLabel = e.dataTransfer.getData('application/reactflow-label');
      if (!type) return;

      // Generate clean label: Router-1, LB-2, Postgres-3, etc.
      const prefix = TYPE_PREFIXES[type] ?? rawLabel ?? type;
      const count  = (nodeTypeCountsRef.current.get(type) ?? 0) + 1;
      nodeTypeCountsRef.current.set(type, count);
      const nodeId     = `${prefix.toLowerCase().replace(/[^a-z0-9-]/g, '')}-${count}`;
      const cleanLabel = `${prefix}-${count}`;

      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const newNode: Node = {
        id: nodeId,
        type: 'techNode',
        position: {
          x: Math.round(pos.x / 16) * 16 - 105,
          y: Math.round(pos.y / 16) * 16 - 40,
        },
        style: { width: 210 },
        data: { label: cleanLabel, icon, category, nodeTypeId: type } satisfies TechNodeData,
      };
      setNodes((nds) => {
        const next = [...nds, newNode];
        onCountChange(next.length);
        setTimeout(() => runValidate(next, edges), 0);
        return next;
      });
    },
    [screenToFlowPosition, setNodes, edges, onCountChange, runValidate],
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_e, node) => {
      onEdgeSelect?.(null);
      onNodeSelect(node);
    },
    [onEdgeSelect, onNodeSelect],
  );
  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_e, edge) => {
      onNodeSelect(null);
      onEdgeSelect?.(edge.id);
    },
    [onEdgeSelect, onNodeSelect],
  );
  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
    onEdgeSelect?.(null);
  }, [onEdgeSelect, onNodeSelect]);

  const minimapColor = (node: Node) =>
    CATEGORY_META[(node.data as TechNodeData).category]?.color ?? '#6366F1';

  const renderedNodes = useMemo(
    () => nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        isSimulationRunning,
        simState: nodeStates.get(node.id),
      },
    })),
    [isSimulationRunning, nodeStates, nodes],
  );

  return (
    <div ref={wrapperRef} style={{ flex: 1, height: '100%', position: 'relative' }}>
      {/* Top-center canvas controls */}
      <div
        style={{
          position: 'absolute', top: 10, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5, display: 'flex', alignItems: 'center', gap: 8,
          pointerEvents: 'auto',
        }}
      >
        <EdgeStylePicker value={defaultEdgeType} onChange={updateDefaultEdgeType} />
        {onPresetsClick && (
          <button
            onClick={onPresetsClick}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px',
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.35)',
              borderRadius: 8,
              color: '#34D399',
              fontSize: 11.5,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(16,185,129,0.22)';
              e.currentTarget.style.borderColor = 'rgba(16,185,129,0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(16,185,129,0.12)';
              e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)';
            }}
          >
            <span style={{ fontSize: 13 }}>⊞</span>
            Presets
          </button>
        )}
        <button
          onClick={() => setShowAIPanel(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px',
            background: 'rgba(124,58,237,0.18)',
            border: '1px solid rgba(124,58,237,0.45)',
            borderRadius: 8,
            color: '#A78BFA',
            fontSize: 11.5,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(124,58,237,0.3)';
            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.7)';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(124,58,237,0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(124,58,237,0.18)';
            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.45)';
            e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.4)';
          }}
        >
          <span style={{ fontSize: 13 }}>✨</span>
          AI Generate
        </button>
      </div>

      {showAIPanel && <AIGeneratorPanel onClose={() => setShowAIPanel(false)} />}
      <NodeSettingsPanel
        nodeId={settingsNodeId}
        onClose={() => setSettingsNodeId(null)}
      />

      <ReactFlow
        nodes={renderedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid
        snapGrid={SNAP_GRID}
        fitView
        minZoom={0.15}
        maxZoom={3}
        connectionRadius={30}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--bg)' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#252535" />
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          style={{ marginBottom: 8 }}
          nodeColor={minimapColor}
          maskColor="rgba(13,13,16,0.75)"
          pannable
          zoomable
        />
        {isSimulationRunning && (
          <PacketOverlay nodes={nodes} edgeStates={edgeStates} />
        )}
        {nodes.length === 0 && <EmptyState />}
      </ReactFlow>
    </div>
  );
}

function PacketOverlay({
  nodes,
  edgeStates,
}: {
  nodes: Node[];
  edgeStates: Map<string, EdgeState>;
}) {
  const { getViewport } = useReactFlow();
  const viewport = getViewport();
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const packets = [...edgeStates.values()].flatMap((edge) => {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!source || !target || edge.isPartitioned) return [];

    const sourcePoint = nodeCenter(source);
    const targetPoint = nodeCenter(target);
    return edge.packets.map((packet) => {
      const eased = easeInOut(packet.progress);
      const flowX = sourcePoint.x + (targetPoint.x - sourcePoint.x) * eased;
      const flowY = sourcePoint.y + (targetPoint.y - sourcePoint.y) * eased;
      return {
        id: packet.id,
        x: flowX * viewport.zoom + viewport.x,
        y: flowY * viewport.zoom + viewport.y,
        color: packet.color,
        radius: packet.type === 'attack' ? 4 : packet.type === 'dropped' ? 2.4 : 3,
      };
    });
  });

  return (
    <svg
      className="techsim-packet-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 4,
        overflow: 'visible',
      }}
    >
      {packets.map((packet) => (
        <circle
          key={packet.id}
          cx={packet.x}
          cy={packet.y}
          r={packet.radius}
          fill={packet.color}
          opacity={0.9}
          style={{ filter: `drop-shadow(0 0 4px ${packet.color})` }}
        />
      ))}
    </svg>
  );
}

function nodeCenter(node: Node): { x: number; y: number } {
  const width = typeof node.style?.width === 'number' ? node.style.width : Number(node.measured?.width) || 210;
  const height = typeof node.style?.height === 'number' ? node.style.height : Number(node.measured?.height) || 112;
  return {
    x: node.position.x + width / 2,
    y: node.position.y + height / 2,
  };
}

function easeInOut(value: number): number {
  const t = Math.min(Math.max(value, 0), 1);
  return t * t * (3 - 2 * t);
}

// ── Edge style default picker overlay ─────────────────────────────────────
const EDGE_STYLE_OPTIONS: { type: EdgeRoutingType; icon: string; label: string }[] = [
  { type: 'smoothstep', icon: '⌒', label: 'Smooth' },
  { type: 'straight',   icon: '—', label: 'Straight' },
  { type: 'bezier',     icon: '∿', label: 'Bezier' },
];

function EdgeStylePicker({
  value,
  onChange,
}: {
  value: EdgeRoutingType;
  onChange: (t: EdgeRoutingType) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = EDGE_STYLE_OPTIONS.find(o => o.type === value)!;

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5,
        pointerEvents: 'auto',
      }}
    >
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px 5px 10px',
            background: 'rgba(10,10,15,0.9)',
            border: '1px solid rgba(124,58,237,0.35)',
            borderRadius: 8,
            color: '#94A3B8',
            fontSize: 11.5,
            fontFamily: "'IBM Plex Mono', monospace",
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.6)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)')}
        >
          <span style={{ fontSize: 13, color: '#A78BFA' }}>{current.icon}</span>
          <span style={{ color: '#CBD5E1' }}>Edge Style:</span>
          <span style={{ color: '#A78BFA', fontWeight: 600 }}>{current.label}</span>
          <span style={{ color: '#64748B', fontSize: 9, marginLeft: 2 }}>▾</span>
        </button>

        {open && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 0 }}
              onClick={() => setOpen(false)}
            />
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1,
                background: 'rgba(10,10,15,0.97)',
                border: '1px solid rgba(124,58,237,0.4)',
                borderRadius: 8,
                padding: '4px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
                minWidth: 140,
              }}
            >
              {EDGE_STYLE_OPTIONS.map(({ type, icon, label }) => {
                const isActive = value === type;
                return (
                  <button
                    key={type}
                    onClick={() => { onChange(type); setOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: 5,
                      border: 'none',
                      background: isActive ? 'rgba(124,58,237,0.2)' : 'transparent',
                      color: isActive ? '#A78BFA' : '#94A3B8',
                      fontSize: 12,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(124,58,237,0.1)';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: 14, width: 16, textAlign: 'center' }}>{icon}</span>
                    {label}
                    {isActive && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#7C3AED' }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 1,
      }}
    >
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          padding: '28px 40px',
          background: 'var(--panel-bg)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            width: 48, height: 48, borderRadius: 13,
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <path d="M17.5 14v7M14 17.5h7" />
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", marginBottom: 5 }}>
            Canvas is empty
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
            drag nodes from the sidebar · connect handles to wire them
          </div>
        </div>
      </div>
    </div>
  );
}
