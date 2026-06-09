import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagramApi, type DiagramSummary } from '../api/client';

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const MODULE_COLORS: Record<string, string> = {
  system_design: '#7C3AED',
  canvas:        '#7C3AED',
  security:      '#EF4444',
  k8s:           '#3B82F6',
  db_schema:     '#10B981',
  network:       '#F97316',
  devops:        '#8B5CF6',
};
const MODULE_LABELS: Record<string, string> = {
  system_design: 'System Design',
  canvas:        'System Design',
  security:      'Security',
  k8s:           'Kubernetes',
  db_schema:     'DB Schema',
  network:       'Network',
  devops:        'DevOps',
};

function actionBtnStyle(bg: string, border?: string, color?: string): React.CSSProperties {
  return {
    background: bg,
    color: color ?? 'var(--text)',
    border: `1px solid ${border ?? bg}`,
    borderRadius: 6,
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.12s',
  };
}

interface DiagramCardProps {
  diagram: DiagramSummary;
  onOpen: () => void;
  onDelete: () => void;
  onFork: () => void;
  deleting: boolean;
}

function DiagramCard({ diagram, onOpen, onDelete, onFork, deleting }: DiagramCardProps) {
  const color = MODULE_COLORS[diagram.module] ?? '#7C3AED';
  const label = MODULE_LABELS[diagram.module] ?? diagram.module;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--card-bg)',
        border: `1px solid ${hovered ? color + '80' : 'var(--border)'}`,
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px ${color}20` : '0 2px 8px rgba(0,0,0,0.3)',
        opacity: deleting ? 0.4 : 1,
      }}
    >
      {/* Thumbnail */}
      <div style={{
        height: 140,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {diagram.thumbnailUrl ? (
          <img
            src={diagram.thumbnailUrl}
            alt={diagram.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ opacity: 0.15, fontSize: 52 }}>🏗️</div>
        )}

        {/* Module badge */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: color + '22',
          border: `1px solid ${color}44`,
          color,
          fontSize: 10, fontWeight: 600,
          fontFamily: "'IBM Plex Mono', monospace",
          padding: '2px 8px', borderRadius: 4,
          letterSpacing: '0.06em',
        }}>
          {label}
        </div>

        {/* Public / private badge */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          fontSize: 13, opacity: 0.7,
        }}>
          {diagram.isPublic ? '🌐' : '🔒'}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 16px 8px' }}>
        <div style={{
          color: 'var(--text)',
          fontSize: 14, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 4,
        }}>
          {diagram.title || 'Untitled Architecture'}
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace" }}>
          Updated {formatTimeAgo(diagram.updatedAt)}
          {(diagram.forkCount ?? 0) > 0 && ` · ${diagram.forkCount} forks`}
        </div>
      </div>

      {/* Actions */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          padding: '8px 16px 12px',
          display: 'flex', gap: 6,
          borderTop: '1px solid var(--border)',
          marginTop: 4,
        }}
      >
        <button
          onClick={onOpen}
          style={actionBtnStyle(color, color, 'white')}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Open
        </button>
        <button
          onClick={onFork}
          style={actionBtnStyle('transparent', 'var(--border)')}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          Fork
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          style={{ ...actionBtnStyle('transparent'), color: '#EF4444', marginLeft: 'auto', opacity: deleting ? 0.5 : 1 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {deleting ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      height: 240,
      animation: 'shimmer 1.6s ease-in-out infinite',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{ height: 140, background: 'var(--bg)' }} />
      <div style={{ padding: '12px 16px' }}>
        <div style={{ height: 14, background: 'var(--border)', borderRadius: 4, marginBottom: 8, width: '70%' }} />
        <div style={{ height: 11, background: 'var(--border)', borderRadius: 4, width: '45%' }} />
      </div>
    </div>
  );
}

export function MyArchitectures() {
  const [diagrams, setDiagrams] = useState<DiagramSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const loadDiagrams = useCallback(async () => {
    try {
      setError(null);
      const data = await diagramApi.my();
      setDiagrams(data);
    } catch (err) {
      setError((err as Error).message ?? 'Failed to load diagrams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDiagrams(); }, [loadDiagrams]);

  const deleteDiagram = useCallback(async (id: string) => {
    setDeletingIds(s => new Set([...s, id]));
    try {
      await diagramApi.delete(id);
      setDiagrams(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      alert((err as Error).message ?? 'Delete failed');
    } finally {
      setDeletingIds(s => { const n = new Set(s); n.delete(id); return n; });
    }
  }, []);

  const forkDiagram = useCallback(async (id: string) => {
    try {
      const forked = await diagramApi.fork(id);
      setDiagrams(prev => [forked, ...prev]);
    } catch (err) {
      alert((err as Error).message ?? 'Fork failed');
    }
  }, []);

  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      background: 'var(--bg)',
      padding: '2rem',
    }}>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '2rem', width: '100%',
      }}>
        <div>
          <h1 style={{
            color: 'var(--text)',
            fontSize: 22, fontWeight: 700, margin: 0,
            fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em',
          }}>
            My Architectures
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: '6px 0 0', fontFamily: "'IBM Plex Mono', monospace" }}>
            {loading ? '—' : `${diagrams.length} saved design${diagrams.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => navigate('/canvas')}
          style={{
            background: 'var(--accent)', color: 'white', border: 'none',
            borderRadius: 8, padding: '9px 18px', cursor: 'pointer',
            fontSize: 13.5, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', gap: 7,
            boxShadow: '0 0 14px var(--accent-glow)',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          + New Architecture
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          width: '100%', marginBottom: 16,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8, padding: '10px 16px',
          color: '#FCA5A5', fontSize: 13,
          fontFamily: "'IBM Plex Mono', monospace",
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ⚠ {error}
          <button
            onClick={loadDiagrams}
            style={{
              marginLeft: 'auto', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: 5, color: '#FCA5A5', cursor: 'pointer', padding: '2px 10px', fontSize: 12,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16, width: '100%',
        }}>
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && diagrams.length === 0 && !error && (
        <div style={{
          width: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '5rem 2rem', textAlign: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18,
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, marginBottom: 20,
          }}>
            🏗️
          </div>
          <h2 style={{
            color: 'var(--text)', fontWeight: 600, fontSize: 18, margin: '0 0 8px',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            No architectures yet
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 13.5, margin: '0 0 24px', fontFamily: "'DM Sans', sans-serif" }}>
            Start designing your first system architecture
          </p>
          <button
            onClick={() => navigate('/canvas')}
            style={{
              background: 'var(--accent)', color: 'white', border: 'none',
              borderRadius: 8, padding: '10px 24px', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 0 14px var(--accent-glow)',
            }}
          >
            Start Designing →
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && diagrams.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16, width: '100%',
        }}>
          {diagrams.map(diagram => (
            <DiagramCard
              key={diagram._id}
              diagram={diagram}
              onOpen={() => navigate(`/canvas?id=${diagram._id}`)}
              onDelete={() => deleteDiagram(diagram._id)}
              onFork={() => forkDiagram(diagram._id)}
              deleting={deletingIds.has(diagram._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
