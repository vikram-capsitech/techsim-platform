import type { Node, Edge } from '@xyflow/react';
import type { ValidationIssue } from '../types';
import type { TechNodeData } from '../components/TechNode';

// ── Node role detection ──────────────────────────────────────────────────────
const isLoadBalancer = (d: TechNodeData) => d.nodeTypeId === 'load-balancer';
const isDatabase = (d: TechNodeData) =>
  d.category === 'data' && !['layers'].includes(d.icon); // not Redis
const isCache = (d: TechNodeData) => d.icon === 'layers'; // Redis
const isMessageQueue = (d: TechNodeData) =>
  d.nodeTypeId === 'kafka' || d.nodeTypeId === 'rabbitmq';
const isAPIServer = (d: TechNodeData) =>
  d.nodeTypeId === 'api-gateway' || d.nodeTypeId === 'nginx';
const isComputeLayer = (d: TechNodeData) => d.category === 'compute';
const isExternalFacing = (d: TechNodeData) =>
  d.nodeTypeId === 'cdn' || d.nodeTypeId === 'router';

function nodeData(node: Node): TechNodeData {
  return node.data as TechNodeData;
}

// ── Per-edge rules ───────────────────────────────────────────────────────────
function validateEdge(
  edge: Edge,
  sourceNode: Node,
  targetNode: Node,
  issues: ValidationIssue[],
) {
  const src = nodeData(sourceNode);
  const tgt = nodeData(targetNode);

  // Rule 1: LB → Database directly
  if (isLoadBalancer(src) && isDatabase(tgt)) {
    issues.push({
      id: `${edge.id}-lb-db`,
      severity: 'error',
      rule: 'lb-direct-db',
      message: `Load Balancers should not connect directly to databases. Add an API Server or microservice in between.`,
      edgeId: edge.id,
    });
  }

  // Rule 2: External-facing → Database directly
  if (isExternalFacing(src) && isDatabase(tgt)) {
    issues.push({
      id: `${edge.id}-client-db`,
      severity: 'error',
      rule: 'client-direct-db',
      message: `Never expose your database directly to clients. Add an API Gateway and Auth layer.`,
      edgeId: edge.id,
    });
  }

  // Rule 3: LB → LB
  if (isLoadBalancer(src) && isLoadBalancer(tgt)) {
    issues.push({
      id: `${edge.id}-lb-lb`,
      severity: 'error',
      rule: 'lb-chain',
      message: `Load Balancers should not chain directly. Route to compute layers instead.`,
      edgeId: edge.id,
    });
  }

  // Rule 4: Wrong cache direction — DB → Cache (should be Cache in front of DB)
  if (isDatabase(src) && isCache(tgt)) {
    issues.push({
      id: `${edge.id}-cache-dir`,
      severity: 'warning',
      rule: 'cache-direction',
      message: `Check your cache direction. Cache should sit between your service and DB, not after.`,
      edgeId: edge.id,
    });
  }

  // Rule 7: Message queue → Database directly
  if (isMessageQueue(src) && isDatabase(tgt)) {
    issues.push({
      id: `${edge.id}-mq-db`,
      severity: 'error',
      rule: 'queue-direct-db',
      message: `Message queues should connect to consumer services, not directly to databases.`,
      edgeId: edge.id,
    });
  }
}

// ── Global / topology rules ──────────────────────────────────────────────────
function validateTopology(
  nodes: Node[],
  edges: Edge[],
  issues: ValidationIssue[],
) {
  const datas = nodes.map(nodeData);
  const apiServers = nodes.filter((n) => isAPIServer(nodeData(n)));
  const lbs = nodes.filter((n) => isLoadBalancer(nodeData(n)));

  // Rule 5: Multiple API servers but no LB
  if (apiServers.length >= 2 && lbs.length === 0) {
    issues.push({
      id: 'topo-no-lb',
      severity: 'warning',
      rule: 'multi-api-no-lb',
      message: `You have ${apiServers.length} API servers but no Load Balancer. Traffic cannot be distributed.`,
      nodeId: apiServers[0].id,
    });
  }

  // Rule 6: Single-replica critical nodes
  for (const node of nodes) {
    const d = nodeData(node);
    if (
      (isDatabase(d) || isLoadBalancer(d) || isAPIServer(d) || isComputeLayer(d)) &&
      !((node.data as TechNodeData & { replicas?: number }).replicas ?? 1) // would need replicas > 1
    ) {
      // Only warn once per node type, avoid spam — check if this node type is alone
      const sameType = nodes.filter(
        (n) => nodeData(n).nodeTypeId === d.nodeTypeId,
      );
      if (sameType.length === 1 && isDatabase(d)) {
        issues.push({
          id: `node-spof-${node.id}`,
          severity: 'warning',
          rule: 'spof',
          message: `"${d.label}" is a single point of failure — consider adding a replica or standby.`,
          nodeId: node.id,
        });
      }
    }
  }

  // Rule 8: No WAF but system is exposed
  const hasExternalFacing = datas.some(isExternalFacing);
  const hasWAF = nodes.some(
    (n) =>
      nodeData(n).nodeTypeId === 'firewall' ||
      nodeData(n).label.toLowerCase().includes('waf'),
  );
  if (hasExternalFacing && !hasWAF && nodes.length > 2) {
    issues.push({
      id: 'topo-no-waf',
      severity: 'warning',
      rule: 'no-waf',
      message: `Your system has no WAF (Web Application Firewall). Consider adding one before your Load Balancer.`,
    });
  }

  void edges; // used indirectly via edge rules above
}

// ── Main export ──────────────────────────────────────────────────────────────
export function validateArchitecture(
  nodes: Node[],
  edges: Edge[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  for (const edge of edges) {
    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (src && tgt) {
      validateEdge(edge, src, tgt, issues);
    }
  }

  validateTopology(nodes, edges, issues);

  // Deduplicate by id
  return issues.filter(
    (issue, idx, arr) => arr.findIndex((i) => i.id === issue.id) === idx,
  );
}

// ── Which edge IDs are invalid ───────────────────────────────────────────────
export function invalidEdgeIds(issues: ValidationIssue[]): Set<string> {
  const ids = new Set<string>();
  for (const issue of issues) {
    if (issue.edgeId && issue.severity === 'error') ids.add(issue.edgeId);
  }
  return ids;
}
