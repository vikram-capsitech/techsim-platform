import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Edge, Node } from '@xyflow/react';
import {
  SimulationEngine,
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
  injectChaos: SimulationControls;
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

  const injectChaos = useMemo<SimulationControls>(() => ({
    crashNode: (nodeId: string) => engineRef.current?.crashNode(nodeId),
    spikeLatency: (edgeId: string, ms: number) => engineRef.current?.spikeLatency(edgeId, ms),
    trafficSurge: (multiplier: number) => engineRef.current?.trafficSurge(multiplier),
    networkPartition: (edgeId: string) => engineRef.current?.networkPartition(edgeId),
    healNode: (nodeId: string) => engineRef.current?.healNode(nodeId),
  }), []);

  return {
    metrics: snapshot.metrics,
    isRunning: snapshot.isRunning,
    start,
    stop,
    pause,
    injectChaos,
    snapshot,
  };
}
