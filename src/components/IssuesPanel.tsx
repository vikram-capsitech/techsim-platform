import { useState } from 'react';
import { XCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Play } from 'lucide-react';
import type { ValidationIssue } from '../types';

interface IssuesPanelProps {
  issues: ValidationIssue[];
  onHighlight: (issue: ValidationIssue) => void;
  onValidate: () => void;
  onClose?: () => void;
}

export function IssuesPanel({ issues, onHighlight, onValidate, onClose }: IssuesPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const errors   = issues.filter(i => i.severity === 'critical' || i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos    = issues.filter(i => i.severity === 'info');

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        zIndex: 20,
        width: 300,
        background: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((s) => !s)}
      >
        <span style={{
          fontSize: 11.5, fontWeight: 600, color: 'var(--text)', flex: 1,
          fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          Issues
        </span>

        {errors.length > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 5, padding: '1px 7px',
            fontSize: 10.5, fontWeight: 700, color: '#EF4444',
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            <XCircle size={9} /> {errors.length}
          </span>
        )}
        {warnings.length > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)',
            borderRadius: 5, padding: '1px 7px',
            fontSize: 10.5, fontWeight: 700, color: '#EAB308',
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            <AlertTriangle size={9} /> {warnings.length}
          </span>
        )}
        {infos.length > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 5, padding: '1px 7px',
            fontSize: 10.5, fontWeight: 700, color: '#818CF8',
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            <Info size={9} /> {infos.length}
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onValidate(); }}
          title="Run validation"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'var(--accent)', border: 'none',
            borderRadius: 5, padding: '3px 8px',
            fontSize: 10, fontWeight: 700, color: 'white',
            fontFamily: "'IBM Plex Mono', monospace",
            cursor: 'pointer', letterSpacing: '0.06em',
          }}
        >
          <Play size={9} />
          RUN
        </button>

        {expanded
          ? <ChevronDown size={13} color="var(--text-muted)" />
          : <ChevronUp size={13} color="var(--text-muted)" />
        }

        {onClose && (
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            title="Close"
            style={{
              width: 20, height: 20, borderRadius: 5,
              background: 'transparent', border: '1px solid transparent',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, marginLeft: 2,
              transition: 'all 0.1s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
              e.currentTarget.style.color = '#EF4444';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Issue list */}
      {expanded && (
        <div style={{ maxHeight: 220, overflowY: 'auto' }}>
          {issues.length === 0 ? (
            <div style={{
              padding: '16px 14px', fontSize: 12,
              color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace",
              textAlign: 'center',
            }}>
              No issues detected
            </div>
          ) : (
            issues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} onHighlight={onHighlight} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function IssueRow({ issue, onHighlight }: { issue: ValidationIssue; onHighlight: (i: ValidationIssue) => void }) {
  const isCritical = issue.severity === 'critical' || issue.severity === 'error';
  const isInfo = issue.severity === 'info';
  const color = isCritical ? '#EF4444' : isInfo ? '#818CF8' : '#EAB308';
  const Icon  = isCritical ? XCircle : isInfo ? Info : AlertTriangle;

  return (
    <button
      onClick={() => onHighlight(issue)}
      style={{
        width: '100%', display: 'flex', alignItems: 'flex-start', gap: 9,
        padding: '9px 12px',
        background: 'none', border: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        cursor: 'pointer', textAlign: 'left',
        transition: 'background 0.12s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      <Icon size={12} style={{ color, flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 9.5, fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 700, color, letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 3,
        }}>
          {issue.rule}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
          {issue.message}
        </div>
      </div>
    </button>
  );
}
