import type { Node, Edge } from '@xyflow/react';
import type { ValidationIssue } from '../types';
import type { TechNodeData } from '../components/TechNode';

// ── Role helpers ──────────────────────────────────────────────────────────────
const isLoadBalancer  = (d: TechNodeData) => d.nodeTypeId === 'load-balancer' || d.nodeTypeId === 'nginx';
const isDatabase      = (d: TechNodeData) => d.category === 'data' && d.icon !== 'layers';
const isCache         = (d: TechNodeData) => d.icon === 'layers' || d.nodeTypeId === 'redis';
const isMessageQueue  = (d: TechNodeData) => ['kafka', 'rabbitmq', 'pubsub', 'nats'].includes(d.nodeTypeId);
const isAPIGateway    = (d: TechNodeData) => d.nodeTypeId === 'api-gateway';
const isCompute       = (d: TechNodeData) => d.category === 'compute';
const isMonitoring    = (d: TechNodeData) => d.category === 'monitoring';
const isExternalEntry = (d: TechNodeData) => ['cdn', 'router', 'client'].includes(d.nodeTypeId);
const isAuth          = (d: TechNodeData) => d.nodeTypeId === 'auth-service' || d.label.toLowerCase().includes('auth');
const isWAF           = (d: TechNodeData) =>
  d.nodeTypeId === 'waf' || d.nodeTypeId === 'firewall' || d.label.toLowerCase().includes('waf');

function data(n: Node): TechNodeData { return n.data as TechNodeData; }

// ── Edge-level rules ──────────────────────────────────────────────────────────
function validateEdge(edge: Edge, src: Node, tgt: Node, issues: ValidationIssue[]) {
  const s = data(src), t = data(tgt);

  // C1: LB → Database directly
  if (isLoadBalancer(s) && isDatabase(t)) {
    issues.push({ id: `${edge.id}-lb-db`, severity: 'critical', rule: 'lb-direct-db',
      message: `Load Balancer should not connect directly to a database. Add a service layer.`,
      edgeId: edge.id, nodeId: tgt.id });
  }

  // C2: External entry → Database directly
  if (isExternalEntry(s) && isDatabase(t)) {
    issues.push({ id: `${edge.id}-ext-db`, severity: 'critical', rule: 'client-direct-db',
      message: `Never expose your database directly to clients. Add an API Gateway and Auth layer.`,
      edgeId: edge.id, nodeId: tgt.id });
  }

  // C3: LB → LB chain
  if (isLoadBalancer(s) && isLoadBalancer(t)) {
    issues.push({ id: `${edge.id}-lb-lb`, severity: 'critical', rule: 'lb-chain',
      message: `Load Balancers should not chain directly — route to compute layers instead.`,
      edgeId: edge.id });
  }

  // W1: Wrong cache direction — DB feeds Cache
  if (isDatabase(s) && isCache(t)) {
    issues.push({ id: `${edge.id}-cache-dir`, severity: 'warning', rule: 'cache-direction',
      message: `Cache should sit in front of the database, not after it. Reverse the edge.`,
      edgeId: edge.id });
  }

  // W2: Message queue → Database directly
  if (isMessageQueue(s) && isDatabase(t)) {
    issues.push({ id: `${edge.id}-mq-db`, severity: 'warning', rule: 'queue-direct-db',
      message: `Message queues should deliver to consumer services, not directly to databases.`,
      edgeId: edge.id });
  }

  // W3: API Gateway → Database directly (bypasses service layer)
  if (isAPIGateway(s) && isDatabase(t)) {
    issues.push({ id: `${edge.id}-apigw-db`, severity: 'warning', rule: 'apigw-direct-db',
      message: `API Gateway should route to services, not directly to the database.`,
      edgeId: edge.id, nodeId: tgt.id });
  }
}

// ── Topology-level rules ──────────────────────────────────────────────────────
function validateTopology(nodes: Node[], edges: Edge[], issues: ValidationIssue[]) {
  const datas = nodes.map(data);
  const lbs        = nodes.filter(n => isLoadBalancer(data(n)));
  const apiGws     = nodes.filter(n => isAPIGateway(data(n)));
  const computes   = nodes.filter(n => isCompute(data(n)));
  const monitors   = nodes.filter(n => isMonitoring(data(n)));
  const caches     = nodes.filter(n => isCache(data(n)));
  const dbs        = nodes.filter(n => isDatabase(data(n)));
  const hasExt     = datas.some(isExternalEntry);
  const hasWAFNode = datas.some(isWAF);
  const hasAuth    = datas.some(isAuth);

  // T1: Multiple computes but no LB
  if (computes.length >= 2 && lbs.length === 0) {
    issues.push({ id: 'topo-no-lb', severity: 'warning', rule: 'multi-compute-no-lb',
      message: `${computes.length} compute nodes but no Load Balancer — traffic cannot be distributed.`,
      nodeId: computes[0].id });
  }

  // T2: Single-replica databases (SPOF)
  for (const dbNode of dbs) {
    const d = data(dbNode);
    const sameType = dbs.filter(n => data(n).nodeTypeId === d.nodeTypeId);
    if (sameType.length === 1) {
      issues.push({ id: `spof-db-${dbNode.id}`, severity: 'warning', rule: 'db-spof',
        message: `"${d.label}" is a single point of failure — consider adding a read replica or standby.`,
        nodeId: dbNode.id });
    }
  }

  // T3: No WAF when system has an external entry point
  if (hasExt && !hasWAFNode && nodes.length > 2) {
    issues.push({ id: 'topo-no-waf', severity: 'warning', rule: 'no-waf',
      message: `No WAF detected. Add a Web Application Firewall before your Load Balancer.` });
  }

  // T4: No Auth service in a non-trivial system
  if (nodes.length > 3 && !hasAuth) {
    issues.push({ id: 'topo-no-auth', severity: 'warning', rule: 'no-auth',
      message: `No Auth Service detected. Add authentication/SSO before your API Gateway.` });
  }

  // T5: No cache layer (info) when DB count > 1
  if (dbs.length > 0 && caches.length === 0 && nodes.length > 4) {
    issues.push({ id: 'topo-no-cache', severity: 'info', rule: 'no-cache',
      message: `No cache layer (Redis/Memcached). Adding one in front of your DB can dramatically reduce latency.` });
  }

  // T6: No monitoring/observability (info)
  if (monitors.length === 0 && nodes.length > 3) {
    issues.push({ id: 'topo-no-monitoring', severity: 'info', rule: 'no-monitoring',
      message: `No monitoring components detected. Consider adding Prometheus, Jaeger, or similar.` });
  }

  // T7: Circular dependency detection (BFS)
  const adjList = new Map<string, string[]>();
  for (const n of nodes) adjList.set(n.id, []);
  for (const e of edges) adjList.get(e.source)?.push(e.target);

  function hasCycle(): boolean {
    const visited = new Set<string>();
    const inStack = new Set<string>();
    function dfs(id: string): boolean {
      if (inStack.has(id)) return true;
      if (visited.has(id)) return false;
      visited.add(id); inStack.add(id);
      for (const neighbour of adjList.get(id) ?? []) {
        if (dfs(neighbour)) return true;
      }
      inStack.delete(id);
      return false;
    }
    for (const id of adjList.keys()) {
      if (dfs(id)) return true;
    }
    return false;
  }

  if (hasCycle()) {
    issues.push({ id: 'topo-cycle', severity: 'critical', rule: 'circular-dependency',
      message: `Circular dependency detected in your architecture. This will cause infinite request loops.` });
  }

  // T8: API Gateway with no Auth service reachable
  if (apiGws.length > 0 && !hasAuth && nodes.length > 3) {
    issues.push({ id: 'topo-gw-no-auth', severity: 'info', rule: 'gateway-no-auth',
      message: `API Gateway has no Auth Service connected. Unauthenticated requests can pass through.`,
      nodeId: apiGws[0].id });
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
export function validateArchitecture(nodes: Node[], edges: Edge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  for (const edge of edges) {
    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (src && tgt) validateEdge(edge, src, tgt, issues);
  }

  validateTopology(nodes, edges, issues);

  return issues.filter((issue, idx, arr) => arr.findIndex(i => i.id === issue.id) === idx);
}

export function invalidEdgeIds(issues: ValidationIssue[]): Set<string> {
  const ids = new Set<string>();
  for (const issue of issues) {
    if (issue.edgeId && (issue.severity === 'critical' || issue.severity === 'error')) {
      ids.add(issue.edgeId);
    }
  }
  return ids;
}
