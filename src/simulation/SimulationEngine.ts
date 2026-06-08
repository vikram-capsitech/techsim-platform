import type { Edge, Node } from '@xyflow/react';
import type { Category } from '../data/nodes';
import type { GlowEdgeData } from '../components/GlowEdge';
import type { TechNodeData } from '../components/TechNode';

export interface NodeState {
  id: string;
  capacity: number;
  currentLoad: number;
  queueDepth: number;
  status: 'healthy' | 'degraded' | 'overloaded' | 'down';
  latency: number;
  errorRate: number;
}

export interface EdgeState {
  id: string;
  source: string;
  target: string;
  bandwidth: number;
  latency: number;
  isPartitioned: boolean;
  packets: Packet[];
}

export interface Packet {
  id: string;
  progress: number;
  speed: number;
  type: 'normal' | 'attack' | 'error';
  color: string;
}

export interface SimMetrics {
  globalRPS: number;
  p50: number;
  p95: number;
  p99: number;
  errorRate: number;
  throughput: number;
  bottleneck: string | null;
}

export interface SimulationSnapshot {
  metrics: SimMetrics;
  nodes: NodeState[];
  edges: EdgeState[];
  isRunning: boolean;
}

type SimulationListener = (snapshot: SimulationSnapshot) => void;

const BASE_RPS = 1000;
const METRICS_INTERVAL_MS = 100;
const MAX_PACKETS_PER_EDGE = 48;
const PACKET_COLORS: Record<Packet['type'], string> = {
  normal: '#06B6D4',
  attack: '#EF4444',
  error: '#F97316',
};

interface NodeMeta {
  category: Category | null;
  icon: string;
}

export class SimulationEngine {
  private nodes: Map<string, NodeState>;
  private edges: Map<string, EdgeState>;
  private nodeMeta: Map<string, NodeMeta>;
  private animationFrameId: number;
  private isRunning: boolean;
  private lastFrameTime: number;
  private lastMetricsTime: number;
  private surgeMultiplier: number;
  private attackBurstUntil: number;
  private subscribers: Set<SimulationListener>;
  private metrics: SimMetrics;

  constructor(nodes: Node[] = [], edges: Edge[] = []) {
    this.nodes = new Map();
    this.edges = new Map();
    this.nodeMeta = new Map();
    this.animationFrameId = 0;
    this.isRunning = false;
    this.lastFrameTime = 0;
    this.lastMetricsTime = 0;
    this.surgeMultiplier = 1;
    this.attackBurstUntil = 0;
    this.subscribers = new Set();
    this.metrics = emptyMetrics();
    this.setTopology(nodes, edges);
  }

  setTopology(nodes: Node[], edges: Edge[]): void {
    const nextNodeIds = new Set(nodes.map((node) => node.id));
    for (const id of this.nodes.keys()) {
      if (!nextNodeIds.has(id)) this.nodes.delete(id);
    }

    for (const node of nodes) {
      const data = node.data as TechNodeData;
      const previous = this.nodes.get(node.id);
      const defaults = defaultsForNode(data);
      this.nodes.set(node.id, {
        id: node.id,
        capacity: previous?.capacity ?? defaults.capacity,
        currentLoad: previous?.currentLoad ?? 0,
        queueDepth: previous?.queueDepth ?? 0,
        status: previous?.status ?? 'healthy',
        latency: previous?.latency ?? defaults.latency,
        errorRate: previous?.errorRate ?? 0,
      });
      this.nodeMeta.set(node.id, {
        category: data.category ?? null,
        icon: data.icon ?? '',
      });
    }

    const nextEdgeIds = new Set(edges.map((edge) => edge.id));
    for (const id of this.edges.keys()) {
      if (!nextEdgeIds.has(id)) this.edges.delete(id);
    }

    for (const edge of edges) {
      const data = edge.data as GlowEdgeData | undefined;
      const previous = this.edges.get(edge.id);
      this.edges.set(edge.id, {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        bandwidth: previous?.bandwidth ?? 0,
        latency: previous?.latency ?? latencyForProtocol(data?.protocol),
        isPartitioned: previous?.isPartitioned ?? false,
        packets: previous?.packets ?? [],
      });
    }

    this.metrics = this.calculateMetrics();
    this.emit();
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.lastMetricsTime = this.lastFrameTime;
    this.animationFrameId = requestAnimationFrame(this.loop);
    this.emit();
  }

  stop(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = 0;
    this.isRunning = false;
    this.surgeMultiplier = 1;
    this.attackBurstUntil = 0;
    for (const node of this.nodes.values()) {
      node.currentLoad = 0;
      node.queueDepth = 0;
      if (node.status !== 'down') node.status = 'healthy';
      node.errorRate = node.status === 'down' ? 1 : 0;
    }
    for (const edge of this.edges.values()) {
      edge.bandwidth = 0;
      edge.packets = [];
    }
    this.metrics = this.calculateMetrics();
    this.emit();
  }

  pause(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = 0;
    this.isRunning = false;
    this.emit();
  }

  crashNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    node.status = 'down';
    node.currentLoad = 0;
    node.queueDepth = 0;
    node.errorRate = 1;
    for (const edge of this.edges.values()) {
      if (edge.source === nodeId || edge.target === nodeId) {
        edge.bandwidth = 0;
        edge.packets = edge.packets.filter((packet) => packet.progress < 0.92);
      }
    }
    this.metrics = this.calculateMetrics();
    this.emit();
  }

  spikeLatency(edgeId: string, ms: number): void {
    const edge = this.edges.get(edgeId);
    if (!edge) return;
    edge.latency = Math.max(0, ms);
    this.metrics = this.calculateMetrics();
    this.emit();
  }

  trafficSurge(multiplier: number): void {
    this.surgeMultiplier = Math.max(0, multiplier);
    this.attackBurstUntil = performance.now() + 2500;
  }

  networkPartition(edgeId: string): void {
    const edge = this.edges.get(edgeId);
    if (!edge) return;
    edge.isPartitioned = true;
    edge.bandwidth = 0;
    edge.packets = [];
    this.metrics = this.calculateMetrics();
    this.emit();
  }

  healNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    node.status = 'healthy';
    node.errorRate = 0;
    node.queueDepth = 0;
    this.metrics = this.calculateMetrics();
    this.emit();
  }

  healEdge(edgeId: string): void {
    const edge = this.edges.get(edgeId);
    if (!edge) return;
    edge.isPartitioned = false;
    this.metrics = this.calculateMetrics();
    this.emit();
  }

  subscribe(listener: SimulationListener): () => void {
    this.subscribers.add(listener);
    listener(this.snapshot());
    return () => this.subscribers.delete(listener);
  }

  getSnapshot(): SimulationSnapshot {
    return this.snapshot();
  }

  private loop = (now: number): void => {
    if (!this.isRunning) return;
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;
    this.step(dt, now);

    if (now - this.lastMetricsTime >= METRICS_INTERVAL_MS) {
      this.lastMetricsTime = now;
      this.metrics = this.calculateMetrics();
      this.emit();
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private step(dt: number, now: number): void {
    const incoming = new Map<string, number>();
    const edgeLoads = new Map<string, number>();
    const sources = this.sourceNodeIds();
    const basePerSource = sources.length > 0 ? (BASE_RPS * this.surgeMultiplier) / sources.length : 0;

    for (const sourceId of sources) {
      incoming.set(sourceId, (incoming.get(sourceId) ?? 0) + basePerSource);
    }

    const ordered = this.orderedNodeIds(sources);
    for (const nodeId of ordered) {
      const node = this.nodes.get(nodeId);
      if (!node) continue;
      const inbound = incoming.get(nodeId) ?? 0;

      if (node.status === 'down') {
        node.currentLoad = smooth(node.currentLoad, 0, dt, 8);
        node.queueDepth = 0;
        node.errorRate = 1;
        continue;
      }

      const meta = this.nodeMeta.get(nodeId);
      const isQueue = meta?.category === 'messaging';
      const handledLoad = this.applyQueuePhysics(node, inbound, isQueue, dt);
      node.currentLoad = smooth(node.currentLoad, handledLoad, dt, isQueue ? 4 : 7);
      this.updateNodeHealth(node);

      const droppedRatio = node.status === 'overloaded' ? clamp((node.currentLoad - node.capacity * 1.5) / node.capacity, 0, 0.45) : 0;
      const deliverable = Math.max(0, handledLoad * (1 - node.errorRate * 0.35 - droppedRatio));
      const outgoing = this.outgoingEdges(nodeId).filter((edge) => !edge.isPartitioned);
      if (outgoing.length === 0) continue;

      const totalWeight = outgoing.reduce((sum, edge) => sum + this.edgeWeight(edge, nodeId), 0);
      for (const edge of outgoing) {
        const target = this.nodes.get(edge.target);
        if (!target || target.status === 'down') {
          edge.bandwidth = smooth(edge.bandwidth, 0, dt, 10);
          continue;
        }

        const share = totalWeight > 0 ? this.edgeWeight(edge, nodeId) / totalWeight : 1 / outgoing.length;
        const backpressure = target.status === 'overloaded' ? 0.48 : target.status === 'degraded' ? 0.72 : 1;
        const cacheReduction = this.cacheReduction(nodeId, edge.target);
        const load = deliverable * share * backpressure * cacheReduction;
        edge.bandwidth = smooth(edge.bandwidth, load, dt, 8);
        edgeLoads.set(edge.id, load);
        incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + load);
      }
    }

    for (const edge of this.edges.values()) {
      if (!edgeLoads.has(edge.id)) edge.bandwidth = smooth(edge.bandwidth, 0, dt, 8);
      this.advancePackets(edge, dt, now);
    }
  }

  private applyQueuePhysics(node: NodeState, inbound: number, isQueue: boolean, dt: number): number {
    if (!isQueue) return inbound;
    const drain = Math.min(node.capacity, inbound + node.queueDepth / Math.max(dt, 0.016));
    const excess = Math.max(0, inbound - drain);
    node.queueDepth = clamp(node.queueDepth + excess * dt - drain * dt * 0.08, 0, node.capacity * 10);
    return drain;
  }

  private updateNodeHealth(node: NodeState): void {
    if (node.status === 'down') return;
    const pressure = node.capacity > 0 ? node.currentLoad / node.capacity : 0;
    if (pressure > 1.5) {
      node.status = 'overloaded';
      node.errorRate = clamp((pressure - 1.2) * 0.22, 0.08, 0.65);
      node.latency = smooth(node.latency, node.latency * 1.01 + 4, 0.016, 2);
    } else if (pressure > 1) {
      node.status = 'degraded';
      node.errorRate = clamp((pressure - 1) * 0.18, 0.015, 0.18);
      node.latency = smooth(node.latency, node.latency * 1.005 + 1, 0.016, 2);
    } else {
      node.status = 'healthy';
      node.errorRate = smooth(node.errorRate, 0, 0.016, 3);
    }
  }

  private cacheReduction(sourceId: string, targetId: string): number {
    const sourceMeta = this.nodeMeta.get(sourceId);
    const targetMeta = this.nodeMeta.get(targetId);
    const sourceIsCache = sourceMeta?.category === 'data' && (sourceMeta.icon === 'layers' || sourceMeta.icon === 'database');
    const targetIsDb = targetMeta?.category === 'data' && targetMeta.icon !== 'layers';
    return sourceIsCache && targetIsDb ? 0.2 : 1;
  }

  private edgeWeight(edge: EdgeState, sourceId: string): number {
    const sourceMeta = this.nodeMeta.get(sourceId);
    const cacheFastPath = sourceMeta?.category === 'data' && sourceMeta.icon === 'layers' ? 1.4 : 1;
    return cacheFastPath / Math.max(edge.latency, 1);
  }

  private advancePackets(edge: EdgeState, dt: number, now: number): void {
    const target = this.nodes.get(edge.target);
    const source = this.nodes.get(edge.source);
    if (edge.isPartitioned || source?.status === 'down') {
      edge.packets = [];
      return;
    }

    const isAttackBurst = now < this.attackBurstUntil && this.surgeMultiplier > 1.5;
    const spawnBudget = clamp((edge.bandwidth / 900) * dt * 18, 0, 5);
    const spawnCount = Math.floor(spawnBudget + Math.random());
    for (let index = 0; index < spawnCount && edge.packets.length < MAX_PACKETS_PER_EDGE; index += 1) {
      const errorPacket = (target?.errorRate ?? 0) > Math.random() && Math.random() < 0.35;
      const type: Packet['type'] = isAttackBurst ? 'attack' : errorPacket ? 'error' : 'normal';
      const speed = type === 'attack'
        ? 1.8
        : clamp(60 / Math.max(edge.latency, 8), 0.08, 1.15);
      edge.packets.push({
        id: `pkt_${edge.id}_${Math.floor(now)}_${index}_${Math.random().toString(36).slice(2, 7)}`,
        progress: 0,
        speed,
        type,
        color: PACKET_COLORS[type],
      });
    }

    edge.packets = edge.packets
      .map((packet) => ({
        ...packet,
        progress: packet.progress + packet.speed * dt,
      }))
      .filter((packet) => {
        if (packet.progress < 1) return true;
        return target?.status === 'down' && packet.progress < 1.08;
      })
      .slice(-MAX_PACKETS_PER_EDGE);
  }

  private calculateMetrics(): SimMetrics {
    if (this.nodes.size === 0) return emptyMetrics();
    const nodes = [...this.nodes.values()];
    const edges = [...this.edges.values()];
    const throughput = edges.reduce((sum, edge) => sum + edge.bandwidth, 0);
    const globalRPS = this.sourceNodeIds().length > 0 && this.isRunning
      ? BASE_RPS * this.surgeMultiplier
      : throughput;
    const weightedErrors = nodes.reduce((sum, node) => sum + node.currentLoad * node.errorRate, 0);
    const totalLoad = nodes.reduce((sum, node) => sum + node.currentLoad, 0);
    const errorRate = totalLoad > 0 ? weightedErrors / totalLoad : 0;
    const bottleneck = nodes.reduce<NodeState | null>((current, node) => {
      if (node.status === 'down') return current;
      if (!current) return node;
      return stressScore(node) > stressScore(current) ? node : current;
    }, null);
    const latencies = this.latencySamples(edges);

    return {
      globalRPS,
      p50: percentile(latencies, 0.5),
      p95: percentile(latencies, 0.95),
      p99: percentile(latencies, 0.99),
      errorRate,
      throughput,
      bottleneck: bottleneck && stressScore(bottleneck) > 0.65 ? bottleneck.id : null,
    };
  }

  private latencySamples(edges: EdgeState[]): number[] {
    const samples: number[] = [];
    for (const edge of edges) {
      const source = this.nodes.get(edge.source);
      const target = this.nodes.get(edge.target);
      if (!source || !target || edge.bandwidth <= 0) continue;
      const queuePenalty = (source.queueDepth + target.queueDepth) / 100;
      const latency = source.latency + edge.latency + target.latency + queuePenalty;
      const count = clamp(Math.round(edge.bandwidth / 80), 1, 30);
      for (let index = 0; index < count; index += 1) {
        samples.push(latency * (0.88 + Math.random() * 0.34));
      }
    }
    if (samples.length === 0) {
      const base = [...this.nodes.values()].reduce((sum, node) => sum + node.latency, 0) / Math.max(this.nodes.size, 1);
      return [base || 0];
    }
    return samples;
  }

  private sourceNodeIds(): string[] {
    const targets = new Set([...this.edges.values()].map((edge) => edge.target));
    const sourceIds = [...this.nodes.keys()].filter((id) => !targets.has(id));
    return sourceIds.length > 0 ? sourceIds : [...this.nodes.keys()].slice(0, 1);
  }

  private outgoingEdges(nodeId: string): EdgeState[] {
    return [...this.edges.values()].filter((edge) => edge.source === nodeId);
  }

  private orderedNodeIds(sources: string[]): string[] {
    const ordered: string[] = [];
    const seen = new Set<string>();
    const queue = [...sources];
    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (!nodeId || seen.has(nodeId)) continue;
      seen.add(nodeId);
      ordered.push(nodeId);
      for (const edge of this.outgoingEdges(nodeId)) {
        if (!seen.has(edge.target)) queue.push(edge.target);
      }
    }
    for (const id of this.nodes.keys()) {
      if (!seen.has(id)) ordered.push(id);
    }
    return ordered;
  }

  private snapshot(): SimulationSnapshot {
    return {
      metrics: this.metrics,
      nodes: [...this.nodes.values()].map((node) => ({ ...node })),
      edges: [...this.edges.values()].map((edge) => ({
        ...edge,
        packets: edge.packets.map((packet) => ({ ...packet })),
      })),
      isRunning: this.isRunning,
    };
  }

  private emit(): void {
    const snapshot = this.snapshot();
    for (const listener of this.subscribers) listener(snapshot);
  }
}

function defaultsForNode(data: TechNodeData): Pick<NodeState, 'capacity' | 'latency'> {
  switch (data.category) {
    case 'network':
      return { capacity: 3200, latency: data.nodeTypeId === 'cdn' ? 8 : 14 };
    case 'compute':
      return { capacity: data.nodeTypeId === 'lambda' ? 1800 : 1400, latency: 28 };
    case 'data':
      return { capacity: data.icon === 'layers' ? 2600 : 900, latency: data.icon === 'layers' ? 5 : 42 };
    case 'messaging':
      return { capacity: 2200, latency: 18 };
    case 'monitoring':
      return { capacity: 1200, latency: 22 };
    case 'infrastructure':
      return { capacity: data.nodeTypeId === 'api-gateway' ? 2500 : 1000, latency: 16 };
    default:
      return { capacity: 1200, latency: 24 };
  }
}

function latencyForProtocol(protocol: GlowEdgeData['protocol']): number {
  switch (protocol) {
    case 'cache':
      return 4;
    case 'queue':
      return 12;
    case 'database':
      return 24;
    case 'http':
    default:
      return 10;
  }
}

function stressScore(node: NodeState): number {
  if (node.status === 'down') return 0;
  return node.capacity > 0 ? node.currentLoad / node.capacity + node.errorRate + node.queueDepth / (node.capacity * 4) : 0;
}

function percentile(values: number[], q: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = clamp(Math.ceil(sorted.length * q) - 1, 0, sorted.length - 1);
  return sorted[index] ?? 0;
}

function smooth(current: number, target: number, dt: number, rate: number): number {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function emptyMetrics(): SimMetrics {
  return {
    globalRPS: 0,
    p50: 0,
    p95: 0,
    p99: 0,
    errorRate: 0,
    throughput: 0,
    bottleneck: null,
  };
}
