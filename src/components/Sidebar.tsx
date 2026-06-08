import { useState } from 'react';
import { Search, Plus, Settings, Network, Server, Database, Package, MessageSquare, Activity } from 'lucide-react';
import { NODE_TEMPLATES, CATEGORY_META, type Category } from '../data/nodes';
import { NodeIcon } from './NodeIcon';

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  network:        <Network size={16} strokeWidth={1.75} />,
  compute:        <Server size={16} strokeWidth={1.75} />,
  data:           <Database size={16} strokeWidth={1.75} />,
  messaging:      <MessageSquare size={16} strokeWidth={1.75} />,
  infrastructure: <Package size={16} strokeWidth={1.75} />,
  monitoring:     <Activity size={16} strokeWidth={1.75} />,
};

const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

interface SidebarItemProps {
  id: string;
  icon: string;
  label: string;
  category: Category;
}

function SidebarDraggable({ id, icon, label, category }: SidebarItemProps) {
  const { color } = CATEGORY_META[category];

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/reactflow-type', id);
    e.dataTransfer.setData('application/reactflow-label', label);
    e.dataTransfer.setData('application/reactflow-icon', icon);
    e.dataTransfer.setData('application/reactflow-category', category);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '7px 14px',
        cursor: 'grab',
        borderRadius: 6,
        margin: '1px 8px',
        transition: 'all 0.12s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--card-bg)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 6,
          background: `${color}15`,
          border: `1px solid ${color}28`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        <NodeIcon icon={icon} size={13} strokeWidth={1.75} />
      </div>
      <span
        style={{
          fontSize: 12.5,
          color: 'var(--text-dim)',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 400,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function Sidebar() {
  const [activeCategory, setActiveCategory] = useState<Category>('network');
  const [search, setSearch] = useState('');

  const filteredNodes = NODE_TEMPLATES.filter(
    (n) =>
      n.category === activeCategory &&
      (search === '' || n.label.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <aside
      style={{
        width: 240,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid var(--border-dim)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-bright)" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <path d="M17.5 14v7M14 17.5h7" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text)',
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.2,
              }}
            >
              Library
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: 'var(--text-muted)',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              Infrastructure Nodes
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-dim)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--input-bg)',
            border: '1px solid var(--border)',
            borderRadius: 7,
            padding: '6px 10px',
          }}
        >
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              fontSize: 12.5,
              color: 'var(--text)',
              outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
      </div>

      {/* Category nav */}
      <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border-dim)', flexShrink: 0 }}>
        {CATEGORIES.map((cat) => {
          const { color, label } = CATEGORY_META[cat];
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--card-bg)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'none'; }}
            >
              {/* Active bar */}
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0, top: '15%', bottom: '15%',
                    width: 2.5,
                    borderRadius: '0 2px 2px 0',
                    background: color,
                  }}
                />
              )}
              <span
                style={{
                  color: isActive ? color : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.12s',
                }}
              >
                {CATEGORY_ICONS[cat]}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--text)' : 'var(--text-dim)',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'color 0.12s',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 10,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: 'var(--text-muted)',
                }}
              >
                {NODE_TEMPLATES.filter((n) => n.category === cat).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Node list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {filteredNodes.length === 0 ? (
          <div
            style={{
              padding: '20px 16px',
              textAlign: 'center',
              fontSize: 11.5,
              color: 'var(--text-muted)',
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            No components found
          </div>
        ) : (
          filteredNodes.map((node) => (
            <SidebarDraggable
              key={node.id}
              id={node.id}
              icon={node.icon}
              label={node.label}
              category={node.category}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border-dim)' }}>
        <button
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            padding: '8px 0',
            borderRadius: 7,
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-dim)',
            fontSize: 12.5,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: 6,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-bright)';
            e.currentTarget.style.color = 'var(--accent-bright)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-dim)';
          }}
        >
          <Plus size={13} />
          Add New Node
        </button>
        <button
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 12px',
            borderRadius: 7,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 12.5,
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
            transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Settings size={14} />
          Settings
        </button>
      </div>
    </aside>
  );
}
