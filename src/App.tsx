import { useState, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReactFlowProvider, type Edge, type Node } from '@xyflow/react';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Canvas, type CanvasHandle } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { BottomBar } from './components/BottomBar';
import { IssuesPanel } from './components/IssuesPanel';
import { PresetsModal, type Preset } from './components/PresetsModal';
import { GuidedTour } from './components/GuidedTour';
import { ValidationToastContainer, type Toast } from './components/ValidationToast';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingView } from './views/LandingView';
import { SecurityView } from './views/SecurityView';
import { K8sView } from './views/K8sView';

import { Login } from './pages/Login';
import { Register } from './pages/Register';

import { diagramApi } from './api/client';
import type { ValidationIssue } from './types';
import { useSimulation } from './simulation/useSimulation';

// ── Placeholder for unbuilt modules ────────────────────────────────────────
function PlaceholderView({ label }: { label: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, #252535 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.4 }} />
      <div style={{ position: 'relative', textAlign: 'center', background: 'var(--panel-bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px 48px', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
        <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-bright)', marginBottom: 8 }}>Coming Soon</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}>{label}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginTop: 8 }}>This module is in development</div>
      </div>
    </div>
  );
}

// ── Shared layout for all protected app pages ───────────────────────────────
function AppShell({
  children,
  showSidebar = false,
  showMetrics = false,
  onSave,
  onSimulationStart,
  simulationRunning,
}: {
  children: React.ReactNode;
  showSidebar?: boolean;
  showMetrics?: boolean;
  onSave?: () => Promise<void>;
  onSimulationStart?: () => void;
  simulationRunning?: boolean;
  nodeCount?: number;
  totalNodes?: number;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Navbar onSave={onSave} onSimulationStart={onSimulationStart} simulationRunning={simulationRunning} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {showSidebar && <Sidebar />}
        {children}
      </div>
      {showMetrics && <_MetricsSlot />}
    </div>
  );
}

// Metrics bar is only relevant to canvas — rendered by CanvasPage which controls nodeCount
function _MetricsSlot() { return null; }

// ── Canvas page with full state ─────────────────────────────────────────────
function CanvasPage() {
  const [nodeCount,    setNodeCount]    = useState(0);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [issues,       setIssues]       = useState<ValidationIssue[]>([]);
  const [toasts,       setToasts]       = useState<Toast[]>([]);
  const [topology,     setTopology]     = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const [speed,        setSpeed]        = useState(1);
  const [traffic,      setTraffic]      = useState(1);
  const [showIssues,   setShowIssues]   = useState(false);
  const [showPresets,  setShowPresets]  = useState(false);
  const canvasRef = useRef<CanvasHandle | null>(null);
  const { metrics, isRunning, start, stop, injectChaos, nodeStates, edgeStates, setSpeed: engineSetSpeed, setBaseRPS } = useSimulation(topology.nodes, topology.edges);

  const handleCountChange  = useCallback((n: number) => setNodeCount(n), []);
  const handleNodeSelect   = useCallback((node: Node | null) => setSelectedNode(node), []);
  const handleEdgeSelect   = useCallback((edgeId: string | null) => setSelectedEdgeId(edgeId), []);
  const handleIssuesChange = useCallback((next: ValidationIssue[]) => setIssues(next), []);
  const handleNewIssues    = useCallback((fresh: ValidationIssue[]) => {
    setToasts(prev => [
      ...prev,
      ...fresh.map(issue => ({ id: `toast_${Date.now()}_${Math.random()}`, issue })),
    ]);
  }, []);
  const dismissToast    = useCallback((id: string) => setToasts(p => p.filter(t => t.id !== id)), []);
  const handleHighlight = useCallback((issue: ValidationIssue) => canvasRef.current?.highlightIssue(issue), []);
  const handleValidate  = useCallback(() => canvasRef.current?.runValidation(), []);
  const handleTopologyChange = useCallback((nodes: Node[], edges: Edge[]) => {
    setTopology({ nodes, edges });
    setNodeCount(nodes.length);
  }, []);

  const handleSave = useCallback(async () => {
    const snap = canvasRef.current?.getSnapshot();
    if (!snap) return;
    await diagramApi.save(`Diagram ${new Date().toLocaleDateString()}`, 'canvas', JSON.stringify(snap));
  }, []);

  const activeNodeCount = topology.nodes.filter((node) => nodeStates.get(node.id)?.status !== 'down').length;
  const selectedNodeId = selectedNode?.id ?? null;
  const toggleSimulation = useCallback(() => {
    if (isRunning) stop();
    else start();
  }, [isRunning, start, stop]);

  const handleSpeedChange = useCallback((v: number) => {
    setSpeed(v);
    engineSetSpeed(v);
  }, [engineSetSpeed]);

  const handlePresetLoad = useCallback((preset: Preset) => {
    setShowPresets(false);
    canvasRef.current?.loadPreset(preset.nodes, preset.edges);
  }, []);

  const handleChaosOnNode = useCallback((chaosId: string, nodeId: string) => {
    // Map chaos scenario id to engine method
    const method =
      chaosId === 'node-crash' || chaosId === 'dc-failure' || chaosId === 'disk-failure'
        ? 'crash'
        : chaosId === 'latency-spike' || chaosId === 'slowdown' || chaosId === 'gc-pause'
        ? 'latency'
        : chaosId === 'net-partition' || chaosId === 'packet-loss'
        ? 'partition'
        : 'crash';
    injectChaos(method, nodeId);
  }, [injectChaos]);

  const handleTrafficChange = useCallback((v: number) => {
    setTraffic(v);
    setBaseRPS(1000 * v);
  }, [setBaseRPS]);

  return (
    <AppShell showSidebar onSave={handleSave} onSimulationStart={toggleSimulation} simulationRunning={isRunning}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <ReactFlowProvider>
          <Canvas
            onCountChange={handleCountChange}
            onNodeSelect={handleNodeSelect}
            onEdgeSelect={handleEdgeSelect}
            onIssuesChange={handleIssuesChange}
            onNewIssues={handleNewIssues}
            onTopologyChange={handleTopologyChange}
            onPresetsClick={() => setShowPresets(true)}
            onChaosOnNode={handleChaosOnNode}
            isSimulationRunning={isRunning}
            nodeStates={nodeStates}
            edgeStates={edgeStates}
            canvasRef={canvasRef}
          />
        </ReactFlowProvider>
        {showIssues && <IssuesPanel issues={issues} onHighlight={handleHighlight} onValidate={handleValidate} />}
        <PropertiesPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        <BottomBar
          isRunning={isRunning}
          onToggle={toggleSimulation}
          metrics={metrics}
          issues={issues}
          onIssuesClick={() => setShowIssues(v => !v)}
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          injectChaos={injectChaos}
          speed={speed}
          onSpeedChange={handleSpeedChange}
          traffic={traffic}
          onTrafficChange={handleTrafficChange}
          activeNodeCount={activeNodeCount}
          totalNodeCount={Math.max(nodeCount, 1)}
        />
      </div>
      <ValidationToastContainer toasts={toasts} onDismiss={dismissToast} />
      {showPresets && <PresetsModal onClose={() => setShowPresets(false)} onLoad={handlePresetLoad} />}
      <GuidedTour />
    </AppShell>
  );
}

// ── Root router ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<LandingView />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/canvas" element={
          <ProtectedRoute><CanvasPage /></ProtectedRoute>
        } />
        <Route path="/security" element={
          <ProtectedRoute>
            <AppShell><SecurityView /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/k8s" element={
          <ProtectedRoute>
            <AppShell><K8sView /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/db-schema" element={
          <ProtectedRoute>
            <AppShell><PlaceholderView label="DB Schema" /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/network" element={
          <ProtectedRoute>
            <AppShell><PlaceholderView label="Network Topology" /></AppShell>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
