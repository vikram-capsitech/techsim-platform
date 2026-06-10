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
  NodeResizer,
  type NodeProps,
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
import { KnowledgePanel } from './KnowledgePanel';
import { ArchitectureChat } from './ArchitectureChat';
import { ToolRecommendation, TOOL_REC_TRIGGERS } from './ToolRecommendation';
import { useTheme } from '../context/ThemeContext';
import { CATEGORY_META, type Category } from '../data/nodes';
import { validateArchitecture, invalidEdgeIds } from '../engine/validator';
import type { EdgeProtocol, ValidationIssue } from '../types';
import type { EdgeState, NodeState } from '../simulation/SimulationEngine';

// ── Group node ─────────────────────────────────────────────────────────────
function GroupNode({ data, selected }: NodeProps) {
  const gData = data as { label?: string; color?: string };
  const color = gData.color ?? '#7C3AED';
  return (
    <div style={{
      width: '100%', height: '100%',
      border: `2px dashed ${color}`,
      borderRadius: 12,
      background: `${color}08`,
      position: 'relative',
      boxSizing: 'border-box',
    }}>
      <NodeResizer
        isVisible={!!selected}
        minWidth={160} minHeight={90}
        lineStyle={{ border: `1px solid ${color}` }}
        handleStyle={{ background: color, border: 'none', borderRadius: 2, width: 8, height: 8 }}
      />
      <div style={{
        position: 'absolute', top: -13, left: 12,
        background: 'var(--bg)',
        padding: '0 8px',
        color,
        fontSize: 10, fontWeight: 700,
        fontFamily: "'IBM Plex Mono', monospace",
        textTransform: 'uppercase', letterSpacing: '0.08em',
        pointerEvents: 'none',
      }}>
        {gData.label || 'Group'}
      </div>
    </div>
  );
}

const nodeTypes = { techNode: TechNode, group: GroupNode };
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
  onOpenWizard?: () => void;
  onExport?: () => void;
  onImportFile?: (file: File) => void;
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
  onOpenWizard,
  onExport,
  onImportFile,
  isSimulationRunning = false,
  nodeStates = new Map(),
  edgeStates = new Map(),
  canvasRef,
}: CanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { resolvedTheme } = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevIssueCount = useRef(0);

  // Per-type node counters — never reset so IDs stay unique within a session
  const nodeTypeCountsRef = useRef<Map<string, number>>(new Map());

  const [showAIPanel,        setShowAIPanel]        = useState(false);
  const [showChat,           setShowChat]           = useState(false);
  const [toolRecNodeTypeId,  setToolRecNodeTypeId]  = useState<string | null>(null);
  const [settingsNodeId,     setSettingsNodeId]     = useState<string | null>(null);
  const [knowledgeTarget,    setKnowledgeTarget]    = useState<{ nodeTypeId: string; label: string } | null>(null);
  const [contextMenu,        setContextMenu]        = useState<{ x: number; y: number; selectedCount: number } | null>(null);

  // Listen for gear-icon open-settings events dispatched by TechNode
  useEffect(() => {
    const handler = (e: Event) => {
      setSettingsNodeId((e as CustomEvent<{ nodeId: string }>).detail.nodeId);
    };
    window.addEventListener('node-settings-open', handler);
    return () => window.removeEventListener('node-settings-open', handler);
  }, []);

  // Listen for 📚 learn button events dispatched by TechNode
  useEffect(() => {
    const handler = (e: Event) => {
      const { nodeTypeId, label } = (e as CustomEvent<{ nodeTypeId: string; label: string }>).detail;
      setKnowledgeTarget({ nodeTypeId, label });
    };
    window.addEventListener('node-knowledge-open', handler);
    return () => window.removeEventListener('node-knowledge-open', handler);
  }, []);

  // Default routing type for newly drawn edges (persisted, changed per-edge via EdgeLabelRenderer)
  const defaultEdgeTypeRef = useRef<EdgeRoutingType>(
    (localStorage.getItem('edge_routing') as EdgeRoutingType) ?? 'bezier'
  );

  const [showGrid] = useState(() => localStorage.getItem('show_grid') !== 'false');
  const [minimap]  = useState(() => localStorage.getItem('show_minimap') !== 'false');
  const [animPkts] = useState(() => localStorage.getItem('anim_packets') !== 'false');

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
      if (TOOL_REC_TRIGGERS.has(type)) setToolRecNodeTypeId(type);
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
    setContextMenu(null);
  }, [onEdgeSelect, onNodeSelect]);

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const selected = nodes.filter(n => n.selected && n.type !== 'group');
    if (selected.length >= 2) {
      setContextMenu({ x: e.clientX, y: e.clientY, selectedCount: selected.length });
    }
  }, [nodes]);

  const groupSelectedNodes = useCallback(() => {
    const toGroup = nodes.filter(n => n.selected && n.type !== 'group');
    if (toGroup.length < 2) return;

    const groupId = `group_${Date.now()}`;
    const pad = 28;
    const minX = Math.min(...toGroup.map(n => n.position.x));
    const minY = Math.min(...toGroup.map(n => n.position.y));
    const maxX = Math.max(...toGroup.map(n => n.position.x + ((n.style?.width as number) ?? 210)));
    const maxY = Math.max(...toGroup.map(n => n.position.y + ((n.measured?.height as number) ?? 80)));

    const groupNode: Node = {
      id: groupId,
      type: 'group',
      position: { x: minX - pad, y: minY - pad - 14 },
      style: { width: maxX - minX + pad * 2, height: maxY - minY + pad * 2 + 14 },
      data: { label: 'Group', color: '#7C3AED' },
      selectable: true,
    };

    setNodes(ns => [
      groupNode,
      ...ns.map(n => {
        const hit = toGroup.find(g => g.id === n.id);
        if (!hit) return n;
        return {
          ...n,
          parentId: groupId,
          extent: 'parent' as const,
          position: {
            x: n.position.x - groupNode.position.x,
            y: n.position.y - groupNode.position.y,
          },
          selected: false,
        };
      }),
    ]);
    setContextMenu(null);
  }, [nodes, setNodes]);

  const deleteSelectedNodes = useCallback(() => {
    setNodes(ns => ns.filter(n => !n.selected));
    setContextMenu(null);
  }, [setNodes]);

  const duplicateSelectedNodes = useCallback(() => {
    const selected = nodes.filter(n => n.selected && n.type !== 'group');
    const now = Date.now();
    setNodes(ns => [
      ...ns.map(n => ({ ...n, selected: false })),
      ...selected.map((n, i) => ({
        ...n,
        id: `${n.id}_copy_${now + i}`,
        position: { x: n.position.x + 24, y: n.position.y + 24 },
        selected: true,
        parentId: undefined,
        extent: undefined,
      })),
    ]);
    setContextMenu(null);
  }, [nodes, setNodes]);

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

  const renderedEdges = useMemo(
    () => edges.map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        isBlocked: edgeStates.get(edge.id)?.isBlocked ?? false,
      },
    })),
    [edges, edgeStates],
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
        {onExport && (
          <button
            onClick={onExport}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 11px',
              background: 'rgba(6,182,212,0.12)',
              border: '1px solid rgba(6,182,212,0.35)',
              borderRadius: 8, color: '#67E8F9',
              fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
              cursor: 'pointer', backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.4)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.22)'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.12)'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.35)'; }}
            title="Export diagram as JSON"
          >
            ⬇ Export
          </button>
        )}
        {onImportFile && (
          <label
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 11px',
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.3)',
              borderRadius: 8, color: '#67E8F9',
              fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
              cursor: 'pointer', backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.4)', transition: 'all 0.15s',
            }}
            title="Import diagram from JSON"
          >
            ⬆ Import
            <input
              type="file" accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) onImportFile(f); e.target.value = ''; }}
            />
          </label>
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
        {onOpenWizard && (
          <button
            onClick={onOpenWizard}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px',
              background: 'rgba(16,185,129,0.10)',
              border: '1px solid rgba(16,185,129,0.35)',
              borderRadius: 8, color: '#34D399',
              fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600, cursor: 'pointer',
              backdropFilter: 'blur(8px)', boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.10)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)'; }}
          >
            <span style={{ fontSize: 13 }}>📋</span>
            Requirements
          </button>
        )}
        <button
          onClick={() => setShowChat(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px',
            background: showChat ? 'rgba(96,165,250,0.22)' : 'rgba(96,165,250,0.10)',
            border: `1px solid ${showChat ? 'rgba(96,165,250,0.6)' : 'rgba(96,165,250,0.35)'}`,
            borderRadius: 8, color: '#60A5FA',
            fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600, cursor: 'pointer',
            backdropFilter: 'blur(8px)', boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 13 }}>💬</span>
          Ask AI
        </button>
      </div>

      {showAIPanel && <AIGeneratorPanel onClose={() => setShowAIPanel(false)} />}
      {showChat && (
        <ArchitectureChat
          architectureContext={JSON.stringify({ nodes: nodes.map(n => ({ id: n.id, type: (n.data as TechNodeData).nodeTypeId, label: (n.data as TechNodeData).label })), edgeCount: edges.length })}
          onClose={() => setShowChat(false)}
        />
      )}
      {toolRecNodeTypeId && (
        <ToolRecommendation
          nodeTypeId={toolRecNodeTypeId}
          onClose={() => setToolRecNodeTypeId(null)}
        />
      )}

      {/* Canvas right-click context menu */}
      {contextMenu && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setContextMenu(null)}
            onContextMenu={e => { e.preventDefault(); setContextMenu(null); }}
          />
          <div style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 100,
            background: 'rgba(13,13,18,0.97)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 4,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
          }}>
            <ContextMenuItem
              icon="📦"
              label={`Group ${contextMenu.selectedCount} nodes`}
              onClick={groupSelectedNodes}
              color="#7C3AED"
            />
            <ContextMenuItem
              icon="📋"
              label="Duplicate selection"
              onClick={duplicateSelectedNodes}
            />
            <div style={{ height: 1, background: 'var(--border)', margin: '3px 0' }} />
            <ContextMenuItem
              icon="🗑"
              label="Delete selection"
              onClick={deleteSelectedNodes}
              color="#EF4444"
              danger
            />
          </div>
        </>
      )}
      <NodeSettingsPanel
        nodeId={settingsNodeId}
        onClose={() => setSettingsNodeId(null)}
      />
      {knowledgeTarget && (
        <KnowledgePanel
          nodeTypeId={knowledgeTarget.nodeTypeId}
          label={knowledgeTarget.label}
          onClose={() => setKnowledgeTarget(null)}
        />
      )}

      <ReactFlow
        nodes={renderedNodes}
        edges={renderedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onContextMenu={onContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid
        snapGrid={SNAP_GRID}
        fitView
        minZoom={0.15}
        maxZoom={3}
        connectionRadius={30}
        deleteKeyCode={['Backspace', 'Delete']}
        colorMode={resolvedTheme}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--bg)' }}
      >
        {showGrid && <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#252535" />}
        <Controls position="bottom-right" showInteractive={false} />
        {minimap && (
          <MiniMap
            position="bottom-right"
            style={{ marginBottom: 8 }}
            nodeColor={minimapColor}
            maskColor="rgba(13,13,16,0.75)"
            pannable
            zoomable
          />
        )}
        {isSimulationRunning && animPkts && (
          <PacketOverlay edgeStates={edgeStates} />
        )}
        {nodes.length === 0 && <EmptyState />}
      </ReactFlow>
    </div>
  );
}

// ── Context menu item ──────────────────────────────────────────────────────
function ContextMenuItem({
  icon, label, onClick, color, danger,
}: {
  icon: string; label: string; onClick: () => void; color?: string; danger?: boolean;
}) {
  const base = danger ? '#EF4444' : color ?? 'var(--text)';
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 9,
        padding: '8px 12px', borderRadius: 6,
        background: 'transparent', border: 'none',
        color: base, fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        cursor: 'pointer', textAlign: 'left',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger
          ? 'rgba(239,68,68,0.1)'
          : color
          ? `${color}18`
          : 'var(--card-bg)';
      }}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  );
}

// Reusable detached SVG path element for sampling — avoids DOM allocation per frame
let _samplerPath: SVGPathElement | null = null;
function sampleEdgePath(pathData: string, t: number): { x: number; y: number } | null {
  try {
    if (!_samplerPath) {
      _samplerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    }
    _samplerPath.setAttribute('d', pathData);
    const total = _samplerPath.getTotalLength();
    if (total === 0) return null;
    const pt = _samplerPath.getPointAtLength(Math.min(Math.max(t, 0), 1) * total);
    return { x: pt.x, y: pt.y };
  } catch {
    return null;
  }
}

function PacketOverlay({
  edgeStates,
}: {
  edgeStates: Map<string, EdgeState>;
}) {
  const { getViewport } = useReactFlow();
  const viewport = getViewport();

  const packets = useMemo(() => {
    const result: { id: string; x: number; y: number; color: string; r: number }[] = [];

    edgeStates.forEach((edgeState, edgeId) => {
      if (edgeState.isPartitioned || edgeState.isBlocked || !edgeState.packets.length) return;

      // Get the actual rendered SVG path for this edge (GlowEdge sets id={edgeId} on its main path)
      const pathEl = document.getElementById(edgeId) as unknown as SVGPathElement | null;
      if (!pathEl) return;
      const pathData = pathEl.getAttribute('d');
      if (!pathData) return;

      edgeState.packets.forEach((packet) => {
        const pt = sampleEdgePath(pathData, packet.progress);
        if (!pt) return;
        result.push({
          id: packet.id,
          x: pt.x * viewport.zoom + viewport.x,
          y: pt.y * viewport.zoom + viewport.y,
          color: packet.color,
          r: packet.type === 'attack' ? 4 : packet.type === 'dropped' ? 2.4 : 3,
        });
      });
    });

    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeStates, viewport.x, viewport.y, viewport.zoom]);

  return (
    <svg
      className="techsim-packet-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'visible',
      }}
    >
      {packets.map((p) => (
        <g key={p.id}>
          {/* Glow halo */}
          <circle cx={p.x} cy={p.y} r={p.r * 2.5} fill={p.color} opacity={0.18} />
          {/* Solid center */}
          <circle
            cx={p.x} cy={p.y} r={p.r}
            fill={p.color} opacity={0.92}
            style={{ filter: `drop-shadow(0 0 5px ${p.color})` }}
          />
        </g>
      ))}
    </svg>
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
