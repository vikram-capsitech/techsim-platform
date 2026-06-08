import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Edge, Node } from '@xyflow/react';
import {
  SimulationEngine,
  type EdgeState,
  type NodeState,
  type SimMetrics,
  type SimulationSnapshot,
} from './SimulationEngine';

export interface SimulationControls {
  crashNode: (nodeId: string) => void;
  spikeLatency: (edgeId: string, ms: number) => void;
  trafficSurge: (multiplier: number) => void;
  networkPartition: (edgeId: string) => void;
  healNode: (nodeId: string) => void;
}

interface UseSimulationResult {
  metrics: SimMetrics;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  pause: () => void;
  setSpeed: (v: number) => void;
  setBaseRPS: (rps: number) => void;
  injectChaos: SimulationControls & ((type: string, targetId: string) => void);
  nodeStates: Map<string, NodeState>;
  edgeStates: Map<string, EdgeState>;
  snapshot: SimulationSnapshot;
}

const INITIAL_SNAPSHOT: SimulationSnapshot = {
  metrics: {
    globalRPS: 0,
    p50: 0,
    p95: 0,
    p99: 0,
    errorRate: 0,
    throughput: 0,
    totalPackets: 0,
    droppedPackets: 0,
    bottleneck: null,
  },
  nodes: [],
  edges: [],
  isRunning: false,
};

export function useSimulation(nodes: Node[], edges: Edge[]): UseSimulationResult {
  const engineRef = useRef<SimulationEngine | null>(null);
  const [snapshot, setSnapshot] = useState<SimulationSnapshot>(INITIAL_SNAPSHOT);

  if (engineRef.current === null) {
    engineRef.current = new SimulationEngine(nodes, edges);
  }

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return undefined;
    return engine.subscribe(setSnapshot);
  }, []);

  useEffect(() => {
    engineRef.current?.setTopology(nodes, edges);
  }, [nodes, edges]);

  useEffect(() => {
    return () => engineRef.current?.stop();
  }, []);

  const start = useCallback(() => engineRef.current?.start(), []);
  const stop = useCallback(() => engineRef.current?.stop(), []);
  const pause = useCallback(() => engineRef.current?.pause(), []);
  const setSpeed = useCallback((v: number) => engineRef.current?.setSpeed(v), []);
  const setBaseRPS = useCallback((rps: number) => engineRef.current?.setBaseRPS(rps), []);

  const injectChaos = useMemo<UseSimulationResult['injectChaos']>(() => {
    const dispatch = ((type: string, targetId: string) => {
      switch (type) {
        case 'crash':
          engineRef.current?.crashNode(targetId);
          break;
        case 'heal':
          engineRef.current?.healNode(targetId);
          break;
        case 'surge':
          engineRef.current?.trafficSurge(10);
          break;
        case 'latency':
          engineRef.current?.spikeLatency(targetId, 500);
          break;
        case 'partition':
          engineRef.current?.networkPartition(targetId);
          break;
      }
    }) as UseSimulationResult['injectChaos'];

    dispatch.crashNode = (nodeId: string) => engineRef.current?.crashNode(nodeId);
    dispatch.spikeLatency = (edgeId: string, ms: number) => engineRef.current?.spikeLatency(edgeId, ms);
    dispatch.trafficSurge = (multiplier: number) => engineRef.current?.trafficSurge(multiplier);
    dispatch.networkPartition = (edgeId: string) => engineRef.current?.networkPartition(edgeId);
    dispatch.healNode = (nodeId: string) => engineRef.current?.healNode(nodeId);
    return dispatch;
  }, []);

  const nodeStates = useMemo(
    () => new Map(snapshot.nodes.map((node) => [node.id, node])),
    [snapshot.nodes],
  );
  const edgeStates = useMemo(
    () => new Map(snapshot.edges.map((edge) => [edge.id, edge])),
    [snapshot.edges],
  );

  return {
    metrics: snapshot.metrics,
    isRunning: snapshot.isRunning,
    start,
    stop,
    pause,
    setSpeed,
    setBaseRPS,
    injectChaos,
    nodeStates,
    edgeStates,
    snapshot,
  };
}
