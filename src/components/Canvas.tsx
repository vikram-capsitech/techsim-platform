import { useCallback, useRef, useEffect } from 'react';
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
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TechNode, type TechNodeData } from './TechNode';
import { GlowEdge } from './GlowEdge';
import { CATEGORY_META, type Category } from '../data/nodes';
import { validateArchitecture, invalidEdgeIds } from '../engine/validator';
import type { EdgeProtocol, ValidationIssue } from '../types';

const nodeTypes = { techNode: TechNode };
const edgeTypes = { glowEdge: GlowEdge };
const SNAP_GRID: [number, number] = [16, 16];

let idCounter = 1;
const getId = () => `node_${Date.now()}_${idCounter++}`;

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
}

interface CanvasProps {
  onCountChange: (nodes: number) => void;
  onNodeSelect: (node: Node | null) => void;
  onIssuesChange: (issues: ValidationIssue[]) => void;
  onNewIssues: (fresh: ValidationIssue[]) => void;
  onTopologyChange?: (nodes: Node[], edges: Edge[]) => void;
  canvasRef?: React.RefObject<CanvasHandle | null>;
}

export function Canvas({
  onCountChange,
  onNodeSelect,
  onIssuesChange,
  onNewIssues,
  onTopologyChange,
  canvasRef,
}: CanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevIssueCount = useRef(0);

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
    };
  });

  // ── Validation ───────────────────────────────────────────────────────────
  const runValidate = useCallback(
    (ns: Node[], es: Edge[]) => {
      const issues = validateArchitecture(ns, es);
      const badEdges = invalidEdgeIds(issues);

      // Mark edges red if invalid
      setEdges((prev) =>
        prev.map((e) => ({
          ...e,
          data: { ...e.data, invalid: badEdges.has(e.id) },
        })),
      );

      onIssuesChange(issues);

      // Only toast newly introduced issues
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
            data: { protocol, color: PROTOCOL_COLORS[protocol], invalid: false },
          },
          eds,
        );
        // Run validation after state settles
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
      const type      = e.dataTransfer.getData('application/reactflow-type');
      const label     = e.dataTransfer.getData('application/reactflow-label');
      const icon      = e.dataTransfer.getData('application/reactflow-icon');
      const category  = e.dataTransfer.getData('application/reactflow-category') as Category;
      if (!type) return;

      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const newNode: Node = {
        id: getId(),
        type: 'techNode',
        position: {
          x: Math.round(pos.x / 16) * 16 - 105,
          y: Math.round(pos.y / 16) * 16 - 40,
        },
        data: { label, icon, category, nodeTypeId: type } satisfies TechNodeData,
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
    (_e, node) => onNodeSelect(node),
    [onNodeSelect],
  );
  const onPaneClick = useCallback(() => onNodeSelect(null), [onNodeSelect]);

  const minimapColor = (node: Node) =>
    CATEGORY_META[(node.data as TechNodeData).category]?.color ?? '#6366F1';

  return (
    <div ref={wrapperRef} style={{ flex: 1, height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
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
        {nodes.length === 0 && <EmptyState />}
      </ReactFlow>
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
