import { useMemo, useState, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { TechNodeData } from './TechNode';
import apiClient from '../api/client';

// ── Types ──────────────────────────────────────────────────────────────────────
interface GateIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedNodes: string[];
}

interface ValidationGateProps {
  nodes: Node[];
  edges: Edge[];
  onProceed: (mode: 'clean' | 'with_warnings') => void;
  onCancel: () => void;
}

// ── Validation logic ───────────────────────────────────────────────────────────
function runGateValidation(nodes: Node[], edges: Edge[]): GateIssue[] {
  const issues: GateIssue[] = [];
  const d = (n: Node) => n.data as TechNodeData;
  const tid = (n: Node) => d(n).nodeTypeId ?? '';
  const cat = (n: Node) => d(n).category ?? '';

  const hasTypeId = (...ids: string[]) => nodes.some(n => ids.includes(tid(n)));
  const nodesOfType = (...ids: string[]) => nodes.filter(n => ids.includes(tid(n)));

  // ── Empty canvas ──────────────────────────────────────────────────────────
  if (nodes.length === 0) {
    return [{
      id: 'empty_canvas',
      severity: 'critical',
      title: 'Canvas is empty',
      description: 'Add at least a Client and a Service node before simulating.',
      affectedNodes: [],
    }];
  }

  // ── No entry point ────────────────────────────────────────────────────────
  if (!hasTypeId('client', 'cdn', 'dns', 'router')) {
    issues.push({
      id: 'no_entry_point',
      severity: 'critical',
      title: 'No entry point',
      description: 'Every system needs a Client or CDN as the traffic entry point. The simulation engine cannot distribute requests without one.',
      affectedNodes: [],
    });
  }

  // ── Client / entry → DB directly ─────────────────────────────────────────
  const entryIds = new Set(nodes.filter(n => ['client','cdn','dns','router'].includes(tid(n))).map(n => n.id));
  const dbIds    = new Set(nodes.filter(n => cat(n) === 'data' && !['redis'].includes(tid(n))).map(n => n.id));
  const directClientToDb = edges.some(e => entryIds.has(e.source) && dbIds.has(e.target));
  if (directClientToDb) {
    issues.push({
      id: 'client_to_db',
      severity: 'critical',
      title: 'Client directly connected to Database',
      description: 'Databases must never be exposed directly to clients. This is a critical security vulnerability — any user could run arbitrary queries. Add an API Gateway and authentication layer between them.',
      affectedNodes: [],
    });
  }

  // ── No WAF for public-facing systems ─────────────────────────────────────
  if (nodes.length > 3 && hasTypeId('client') && !hasTypeId('waf', 'firewall')) {
    issues.push({
      id: 'no_waf',
      severity: 'warning',
      title: 'No WAF or Firewall',
      description: 'Internet-facing systems should have a Web Application Firewall to protect against SQL injection, XSS, DDoS, and other OWASP Top 10 attacks.',
      affectedNodes: [],
    });
  }

  // ── Multiple compute services without a load balancer ────────────────────
  const computeNodes = nodes.filter(n => cat(n) === 'compute');
  if (computeNodes.length > 1 && !hasTypeId('load-balancer', 'api-gateway')) {
    issues.push({
      id: 'no_lb',
      severity: 'warning',
      title: `${computeNodes.length} services but no Load Balancer`,
      description: 'Without a Load Balancer, all traffic hits a single service instance. You lose fault tolerance and traffic cannot be distributed across replicas.',
      affectedNodes: computeNodes.map(n => n.id),
    });
  }

  // ── DB without a cache ────────────────────────────────────────────────────
  if (dbIds.size > 0 && !hasTypeId('redis')) {
    issues.push({
      id: 'no_cache',
      severity: 'info',
      title: 'No cache layer detected',
      description: 'Adding a Redis cache between your services and database typically reduces database load by 80–90% for read-heavy workloads, improving latency and reducing cost.',
      affectedNodes: [],
    });
  }

  // ── SPOF on critical nodes ────────────────────────────────────────────────
  const criticalTypeIds = ['load-balancer', 'api-gateway', 'postgres', 'mysql', 'mongodb'];
  nodesOfType(...criticalTypeIds).forEach(node => {
    const replicas = (node.data as TechNodeData).replicas ?? 1;
    if (replicas < 2) {
      issues.push({
        id: `spof_${node.id}`,
        severity: 'warning',
        title: `Single point of failure: ${(node.data as TechNodeData).label}`,
        description: `${(node.data as TechNodeData).label} has only 1 replica. If this instance fails, dependent services go down. Set replicas ≥ 2 in node settings for high availability.`,
        affectedNodes: [node.id],
      });
    }
  });

  // ── No monitoring for non-trivial architectures ───────────────────────────
  if (nodes.length > 5 && !hasTypeId('prometheus', 'grafana', 'datadog', 'log-agg')) {
    issues.push({
      id: 'no_monitoring',
      severity: 'info',
      title: 'No monitoring configured',
      description: 'Production systems need observability. Without metrics or logs you will not know when things break until users complain.',
      affectedNodes: [],
    });
  }

  return issues;
}

// ── Issue card ─────────────────────────────────────────────────────────────────
function IssueCard({ issue, color, icon }: { issue: GateIssue; color: string; icon: string }) {
  return (
    <div style={{
      border: `1px solid ${color}33`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 8, padding: '11px 14px', marginBottom: 8,
      background: `${color}08`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginBottom: 3 }}>
            {issue.title}
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: 12, lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>
            {issue.description}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ count, color, label }: { count: number; color: string; label: string }) {
  return (
    <span style={{
      fontSize: 11.5, color,
      background: color + '20', border: `1px solid ${color}40`,
      padding: '2px 9px', borderRadius: 4,
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      {count} {label}{count !== 1 ? 's' : ''}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ValidationGate({ nodes, edges, onProceed, onCancel }: ValidationGateProps) {
  const localIssues = useMemo(() => runGateValidation(nodes, edges), [nodes, edges]);
  const [aiIssues, setAiIssues] = useState<GateIssue[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const localCritical = useMemo(() => localIssues.filter(i => i.severity === 'critical'), [localIssues]);

  useEffect(() => {
    if (localCritical.length === 0 && nodes.length > 0) {
      let isMounted = true;
      setLoadingAi(true);
      setAiError(null);

      apiClient.post<{ aiIssues: any[] }>('/api/ai/validate', { nodes, edges })
        .then(res => {
          if (!isMounted) return;
          const mapped = (res.data.aiIssues || []).map((issue: any, index: number) => ({
            id: `ai_issue_${index}`,
            severity: (issue.severity === 'critical' || issue.severity === 'warning' || issue.severity === 'info')
              ? issue.severity
              : 'info',
            title: `[AI] ${issue.title}`,
            description: `${issue.description} Recommendation: ${issue.recommendation}`,
            affectedNodes: []
          }));
          setAiIssues(mapped);
          setLoadingAi(false);
        })
        .catch(err => {
          if (!isMounted) return;
          console.error('AI validation failed:', err);
          setAiError('AI validation service is currently unavailable.');
          setLoadingAi(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setAiIssues([]);
      setLoadingAi(false);
    }
  }, [nodes, edges, localCritical.length]);

  const issues = useMemo(() => {
    return [...localIssues, ...aiIssues];
  }, [localIssues, aiIssues]);

  const critical = useMemo(() => issues.filter(i => i.severity === 'critical'), [issues]);
  const warnings = useMemo(() => issues.filter(i => i.severity === 'warning'),  [issues]);
  const infos    = useMemo(() => issues.filter(i => i.severity === 'info'),     [issues]);

  const canRun = critical.length === 0;
  const passed = 6 - Math.min(6, issues.length); // rough "checks passed" count

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--panel-bg)',
        border: '1px solid var(--border)',
        borderRadius: 16, width: 520, maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{
            margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em',
          }}>
            🔍 Pre-Simulation Check
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif" }}>
            Validating your architecture before running simulation
          </p>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>

          {/* Summary badges */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {critical.length > 0 && <Badge count={critical.length} color="#EF4444" label="Critical" />}
            {warnings.length > 0 && <Badge count={warnings.length} color="#F59E0B" label="Warning" />}
            {infos.length > 0    && <Badge count={infos.length}    color="#60A5FA" label="Suggestion" />}
            {issues.length === 0 && (
              <span style={{ fontSize: 11.5, color: '#10B981', background: '#10B98120', border: '1px solid #10B98140', padding: '2px 9px', borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
                ✓ All checks passed
              </span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#10B981', background: '#10B98120', border: '1px solid #10B98140', padding: '2px 9px', borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
              ✓ {passed} Passed
            </span>
          </div>

          {/* All clear */}
          {issues.length === 0 && !loadingAi && !aiError && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#10B981' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
              <h3 style={{ color: 'var(--text)', margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>Architecture looks great!</h3>
              <p style={{ color: 'var(--text-dim)', margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>No issues found. Ready to simulate.</p>
            </div>
          )}

          {loadingAi && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 14px', marginBottom: 8,
              border: '1px solid var(--border)', borderRadius: 8,
              background: 'rgba(255,255,255,0.02)'
            }}>
              <span style={{ fontSize: 14 }}>⏳</span>
              <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif" }}>
                Running AI deep architecture review...
              </span>
            </div>
          )}

          {aiError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 14px', marginBottom: 8,
              border: '1px solid #EF444433', borderRadius: 8,
              background: '#EF444408', color: '#EF4444'
            }}>
              <span style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                ⚠️ {aiError}
              </span>
            </div>
          )}

          {critical.map(i => <IssueCard key={i.id} issue={i} color="#EF4444" icon="🔴" />)}
          {warnings.map(i => <IssueCard key={i.id} issue={i} color="#F59E0B" icon="⚠️" />)}
          {infos.map(i    => <IssueCard key={i.id} issue={i} color="#60A5FA" icon="💡" />)}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center',
        }}>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-dim)', borderRadius: 8,
              padding: '8px 16px', cursor: 'pointer', fontSize: 13,
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            Fix Issues
          </button>

          {!canRun && (
            <button disabled style={{
              background: 'rgba(124,58,237,0.15)', border: 'none', color: 'rgba(167,139,250,0.5)',
              borderRadius: 8, padding: '8px 16px', fontSize: 13,
              cursor: 'not-allowed', fontFamily: "'DM Sans', sans-serif",
            }}>
              Fix Critical Issues First
            </button>
          )}

          {canRun && warnings.length > 0 && (
            <button
              onClick={() => onProceed('with_warnings')}
              style={{
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
                color: '#F59E0B', borderRadius: 8, padding: '8px 16px',
                cursor: 'pointer', fontSize: 13,
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.12s',
              }}
            >
              Run With Warnings
            </button>
          )}

          {canRun && (
            <button
              onClick={() => onProceed('clean')}
              style={{
                background: '#7C3AED', color: 'white', border: 'none',
                borderRadius: 8, padding: '8px 18px',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 0 14px rgba(124,58,237,0.35)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              ▶ Start Simulation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
