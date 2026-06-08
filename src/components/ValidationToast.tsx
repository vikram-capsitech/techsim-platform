import { useEffect, useState } from 'react';
import { XCircle, AlertTriangle, X } from 'lucide-react';
import type { ValidationIssue } from '../types';

export interface Toast {
  id: string;
  issue: ValidationIssue;
}

interface ValidationToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ValidationToastContainer({ toasts, onDismiss }: ValidationToastProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 56,
        right: 16,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const isError = toast.issue.severity === 'error';
  const color = isError ? '#EF4444' : '#EAB308';
  const Icon = isError ? XCircle : AlertTriangle;

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 5s
    const d = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 5000);
    return () => { clearTimeout(t); clearTimeout(d); };
  }, [toast.id, onDismiss]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 14px',
        background: isError ? 'rgba(20,6,6,0.97)' : 'rgba(20,17,4,0.97)',
        border: `1px solid ${color}40`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 8,
        maxWidth: 340,
        minWidth: 280,
        boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 16px ${color}15`,
        pointerEvents: 'all',
        transform: visible ? 'translateX(0)' : 'translateX(20px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
      }}
    >
      <Icon size={14} style={{ color, flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 9.5,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 700,
            color,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          {toast.issue.severity} · {toast.issue.rule}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: '#CBD5E1',
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.55,
          }}
        >
          {toast.issue.message}
        </div>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 300); }}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <X size={13} />
      </button>
    </div>
  );
}
