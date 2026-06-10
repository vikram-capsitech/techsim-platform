import { useState, useCallback, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
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
import { MyArchitectures } from './pages/MyArchitectures';
import { Settings } from './pages/Settings';
import { Discussion } from './pages/Discussion';
import { LearnPage } from './pages/LearnPage';
import { LessonPage } from './pages/LessonPage';
import { ChaosExplainPanel } from './components/ChaosExplainPanel';
import { transformDiagram } from './components/AIGeneratorPanel';
import { ConceptsPage } from './pages/ConceptsPage';
import { ConceptPage } from './pages/ConceptPage';
import { InterviewPage } from './pages/InterviewPage';
import { InterviewSession } from './pages/InterviewSession';
import { ArchitectureScoreCard } from './components/ArchitectureScoreCard';
import { RequirementWizard } from './components/wizard/RequirementWizard';
import { ValidationGate } from './components/ValidationGate';

import { toPng } from 'html-to-image';
import { diagramApi, aiApi } from './api/client';
import type { ValidationIssue } from './types';
import { useSimulation } from './simulation/useSimulation';
import { useTheme } from './context/ThemeContext';
import { SimulationReport, type SimulationReportData } from './components/SimulationReport';

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
  const { resolvedTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const diagramId = searchParams.get('id');

  const [nodeCount, setNodeCount] = useState(0);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [topology, setTopology] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const [speed, setSpeed] = useState(1);
  const [traffic, setTraffic] = useState(1);
  const [showIssues, setShowIssues] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [reportData, setReportData] = useState<SimulationReportData | null>(null);
  const [showWizard, setShowWizard] = useState(() => !localStorage.getItem('techsim_wizard_seen'));
  const [showGate, setShowGate] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [chaosExplainId, setChaosExplainId] = useState<string | null>(null);
  const [scenarioGenerating, setScenarioGenerating] = useState(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const canvasRef = useRef<CanvasHandle | null>(null);
  const simStartRef = useRef<number | null>(null);
  const peakRPSRef = useRef(0);
  const { metrics, isRunning, start, stop, injectChaos, nodeStates, edgeStates, setSpeed: engineSetSpeed, setTraffic: engineSetTraffic, getChaosLog, resetChaosLog } = useSimulation(topology.nodes, topology.edges, resolvedTheme);

  const lastSavedRef = useRef<string>('');

  // Fetch / load diagram by id
  useEffect(() => {
    if (!diagramId) return;

    let active = true;
    const loadDiagram = async () => {
      try {
        const diagram = await diagramApi.get(diagramId);
        if (!active) return;
        if (diagram && diagram.canvasJson) {
          const canvasData = typeof diagram.canvasJson === 'string'
            ? JSON.parse(diagram.canvasJson)
            : diagram.canvasJson;

          if (canvasData && canvasRef.current) {
            canvasRef.current.loadPreset(canvasData.nodes || [], canvasData.edges || []);
            lastSavedRef.current = JSON.stringify(canvasData);
          }
        }
      } catch (err) {
        console.error('Failed to load diagram:', err);
      }
    };

    const timer = setTimeout(loadDiagram, 100);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [diagramId]);

  // Autosave interval loop
  useEffect(() => {
    if (!diagramId) return;

    const interval = setInterval(async () => {
      const snap = canvasRef.current?.getSnapshot();
      if (!snap) return;

      const snapStr = JSON.stringify(snap);
      if (snapStr === lastSavedRef.current) return;

      try {
        await diagramApi.autosave(diagramId, snap);
        lastSavedRef.current = snapStr;
      } catch (err) {
        console.error('Autosave failed:', err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [diagramId]);

  const handleCountChange = useCallback((n: number) => setNodeCount(n), []);
  const handleNodeSelect = useCallback((node: Node | null) => setSelectedNode(node), []);
  const handleEdgeSelect = useCallback((edgeId: string | null) => setSelectedEdgeId(edgeId), []);
  const handleIssuesChange = useCallback((next: ValidationIssue[]) => setIssues(next), []);
  const handleNewIssues = useCallback((fresh: ValidationIssue[]) => {
    setToasts(prev => [
      ...prev,
      ...fresh.map(issue => ({ id: `toast_${Date.now()}_${Math.random()}`, issue })),
    ]);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts(p => p.filter(t => t.id !== id)), []);
  const handleHighlight = useCallback((issue: ValidationIssue) => canvasRef.current?.highlightIssue(issue), []);
  const handleValidate = useCallback(() => canvasRef.current?.runValidation(), []);
  const handleTopologyChange = useCallback((nodes: Node[], edges: Edge[]) => {
    setTopology({ nodes, edges });
    setNodeCount(nodes.length);
  }, []);

  const handleExport = useCallback(() => {
    const snap = canvasRef.current?.getSnapshot();
    if (!snap) return;
    const payload = {
      version: '1.0', appVersion: 'techsim',
      exportedAt: new Date().toISOString(),
      title: `Diagram ${new Date().toLocaleDateString()}`,
      nodes: snap.nodes, edges: snap.edges,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `techsim-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImportFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const nodes = data.nodes ?? [];
        const edges = data.edges ?? [];
        canvasRef.current?.loadPreset(nodes, edges);
      } catch {
        alert('Invalid JSON file — could not import diagram.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleSave = useCallback(async () => {
    const snap = canvasRef.current?.getSnapshot();
    if (!snap) return;

    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement | null;
    const thumbnailUrl = viewport
      ? await toPng(viewport, { width: 400, height: 240, quality: 0.8 }).catch(() => undefined)
      : undefined;

    if (diagramId) {
      await diagramApi.update(diagramId, `Diagram ${new Date().toLocaleDateString()}`, snap, thumbnailUrl);
      lastSavedRef.current = JSON.stringify(snap);
    } else {
      const res = await diagramApi.save(`Diagram ${new Date().toLocaleDateString()}`, 'system_design', snap, thumbnailUrl);
      if (res && res._id) {
        lastSavedRef.current = JSON.stringify(snap);
        setSearchParams({ id: res._id });
      }
    }
  }, [diagramId, setSearchParams]);

  // Track peak RPS while running
  if (isRunning && metrics.globalRPS > peakRPSRef.current) {
    peakRPSRef.current = metrics.globalRPS;
  }

  const activeNodeCount = topology.nodes.filter((node) => nodeStates.get(node.id)?.status !== 'down').length;
  const selectedNodeId = selectedNode?.id ?? null;
  const selectedNodeTypeId = selectedNode ? (selectedNode.data as { nodeTypeId?: string }).nodeTypeId ?? null : null;
  const selectedNodeName = selectedNode ? String((selectedNode.data as { label?: string }).label ?? selectedNodeId) : null;
  const selectedNodeSimState = selectedNodeId ? nodeStates.get(selectedNodeId) ?? null : null;

  // Heal node via custom event dispatched from inside TechNode
  useEffect(() => {
    const handler = (e: Event) => {
      const { nodeId } = (e as CustomEvent<{ nodeId: string }>).detail;
      injectChaos('heal', nodeId);
    };
    window.addEventListener('node-heal', handler);
    return () => window.removeEventListener('node-heal', handler);
  }, [injectChaos]);

  // ChaosArea now handles validation and converts scenario IDs → engine methods before calling here.
  // This just passes engine method calls straight through to the simulation engine.
  const handleChaosInject = useCallback((chaosType: string, nodeId: string) => {
    injectChaos(chaosType, nodeId);
  }, [injectChaos]);

  const proceedSimulation = useCallback(() => {
    setShowGate(false);
    simStartRef.current = Date.now();
    peakRPSRef.current = 0;
    resetChaosLog();
    start();
  }, [resetChaosLog, start]);

  const toggleSimulation = useCallback(() => {
    if (isRunning) {
      const duration = simStartRef.current ? (Date.now() - simStartRef.current) / 1000 : 0;

      // Only show report if simulation ran for at least 5 seconds
      if (duration >= 5) {
        // Collect node metrics from last known nodeStates
        const nodeMetrics = topology.nodes.map(n => {
          const state = nodeStates.get(n.id);
          return {
            id: n.id,
            name: (n.data as { label?: string }).label ?? n.id,
            avgLoad: state ? Math.round(state.cpuUsage * 100) : 0,
            peakLoad: state ? Math.round(Math.min(state.cpuUsage * 100 + 15, 100)) : 0,
            errorRate: state?.errorRate ?? 0,
            finalStatus: state?.status ?? 'healthy',
          };
        });

        // Derive bottlenecks from nodes with high load or errors
        const bottlenecks = nodeMetrics
          .filter(n => n.peakLoad > 80 || n.errorRate > 0.05)
          .map(n => n.name);

        setReportData({
          architectureName: `Architecture (${topology.nodes.length} nodes)`,
          duration: Math.round(duration),
          peakRPS: Math.round(peakRPSRef.current),
          avgP99: Math.round(metrics.p99),
          totalErrors: Math.round(metrics.globalRPS * 0.01 * duration),
          bottlenecks,
          nodeMetrics,
          chaosEvents: getChaosLog(),
        });
      }

      stop();
    } else {
      const autoValidate = localStorage.getItem('auto_validate') !== 'false';
      if (autoValidate) {
        setShowGate(true);
      } else {
        simStartRef.current = Date.now();
        peakRPSRef.current = 0;
        resetChaosLog();
        start();
      }
    }
  }, [isRunning, start, stop, topology.nodes, nodeStates, metrics.p99, metrics.globalRPS, getChaosLog, resetChaosLog]);

  const handleSpeedChange = useCallback((v: number) => {
    setSpeed(v);
    engineSetSpeed(v);
  }, [engineSetSpeed]);

  const handlePresetLoad = useCallback((preset: Preset) => {
    setShowPresets(false);
    canvasRef.current?.loadPreset(preset.nodes, preset.edges);
  }, []);

  const handleChaosOnNode = useCallback((chaosId: string, nodeId: string) => {
    const method =
      chaosId === 'node-crash' || chaosId === 'dc-failure' || chaosId === 'disk-failure'
        ? 'crash'
        : chaosId === 'latency-spike' || chaosId === 'slowdown' || chaosId === 'gc-pause'
          ? 'latency'
          : chaosId === 'net-partition' || chaosId === 'packet-loss'
            ? 'partition'
            : 'crash';
    injectChaos(method, nodeId);
    setTimeout(() => setChaosExplainId(chaosId), 3000);
  }, [injectChaos]);

  const handleGenerateFromPrompt = useCallback(async (prompt: string) => {
    setScenarioGenerating(true);
    setScenarioError(null);
    try {
      const raw = await aiApi.generate(prompt, 'system_design');
      const diagram = transformDiagram(raw);
      canvasRef.current?.loadPreset(diagram.nodes, diagram.edges);
    } catch (err) {
      setScenarioError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setScenarioGenerating(false);
    }
  }, []);

  const handleTrafficChange = useCallback((v: number) => {
    setTraffic(v);
    engineSetTraffic(v);
  }, [engineSetTraffic]);

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
            onOpenWizard={() => setShowWizard(true)}
            onExport={handleExport}
            onImportFile={handleImportFile}
            onChaosOnNode={handleChaosOnNode}
            isSimulationRunning={isRunning}
            nodeStates={nodeStates}
            edgeStates={edgeStates}
            canvasRef={canvasRef}
          />
        </ReactFlowProvider>
        {showIssues && <IssuesPanel issues={issues} onHighlight={handleHighlight} onValidate={handleValidate} onClose={() => setShowIssues(false)} />}
        <PropertiesPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        <BottomBar
          isRunning={isRunning}
          onToggle={toggleSimulation}
          metrics={metrics}
          issues={issues}
          onIssuesClick={() => setShowIssues(v => !v)}
          selectedNodeId={selectedNodeId}
          selectedNodeTypeId={selectedNodeTypeId}
          selectedNodeName={selectedNodeName}
          selectedEdgeId={selectedEdgeId}
          selectedNodeSimState={selectedNodeSimState}
          injectChaos={handleChaosInject}
          speed={speed}
          onSpeedChange={handleSpeedChange}
          traffic={traffic}
          onTrafficChange={handleTrafficChange}
          activeNodeCount={activeNodeCount}
          totalNodeCount={Math.max(nodeCount, 1)}
          onScoreClick={() => setShowScore(true)}
        />
      </div>
      <ValidationToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Scenario generation feedback banner */}
      {(scenarioGenerating || scenarioError) && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 90, display: 'flex', alignItems: 'center', gap: 10,
          background: scenarioError ? 'rgba(239,68,68,0.12)' : 'rgba(124,58,237,0.12)',
          border: `1px solid ${scenarioError ? 'rgba(239,68,68,0.4)' : 'rgba(124,58,237,0.4)'}`,
          borderRadius: 10, padding: '10px 16px',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12.5,
          color: scenarioError ? '#FCA5A5' : '#C4B5FD',
          maxWidth: 480,
          animation: 'fadeInUp 0.2s ease',
        }}>
          {scenarioGenerating ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: 14 }}>⟳</span>
              Generating architecture on canvas…
            </>
          ) : (
            <>
              <span>✕</span>
              {scenarioError}
              <button
                onClick={() => setScenarioError(null)}
                style={{
                  marginLeft: 8, background: 'none', border: 'none',
                  color: '#FCA5A5', cursor: 'pointer', fontSize: 13, padding: 0,
                }}
              >
                dismiss
              </button>
            </>
          )}
        </div>
      )}

      {showPresets && <PresetsModal onClose={() => setShowPresets(false)} onLoad={handlePresetLoad} onGenerateFromPrompt={handleGenerateFromPrompt} />}
      {chaosExplainId && <ChaosExplainPanel chaosId={chaosExplainId} onClose={() => setChaosExplainId(null)} />}
      {reportData && (
        <SimulationReport data={reportData} onClose={() => setReportData(null)} />
      )}
      {showWizard && (
        <RequirementWizard
          onComplete={(_diagram, _data) => {
            localStorage.setItem('techsim_wizard_seen', '1');
            setShowWizard(false);
            if (_diagram) canvasRef.current?.loadPreset(_diagram.nodes, _diagram.edges);
          }}
          onSkip={() => {
            localStorage.setItem('techsim_wizard_seen', '1');
            setShowWizard(false);
          }}
        />
      )}
      {showGate && (
        <ValidationGate
          nodes={topology.nodes}
          edges={topology.edges}
          onProceed={proceedSimulation}
          onCancel={() => setShowGate(false)}
        />
      )}
      {showScore && (
        <ArchitectureScoreCard
          nodes={topology.nodes}
          edges={topology.edges}
          onClose={() => setShowScore(false)}
        />
      )}
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
        <Route path="/" element={<LandingView />} />
        <Route path="/login" element={<Login />} />
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
        <Route path="/learn" element={
          <ProtectedRoute>
            <AppShell><LearnPage /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/learn/:trackId/:lessonId" element={
          <ProtectedRoute><LessonPage /></ProtectedRoute>
        } />
        <Route path="/concepts" element={
          <ProtectedRoute>
            <AppShell><ConceptsPage /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/concepts/:id" element={
          <ProtectedRoute>
            <AppShell><ConceptPage /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/interview" element={
          <ProtectedRoute>
            <AppShell><InterviewPage /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/interview/:id" element={
          <ProtectedRoute><InterviewSession /></ProtectedRoute>
        } />
        <Route path="/my-architectures" element={
          <ProtectedRoute>
            <AppShell><MyArchitectures /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <AppShell><Settings /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/discussion" element={
          <ProtectedRoute>
            <AppShell><Discussion /></AppShell>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
