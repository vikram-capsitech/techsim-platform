import { useState } from 'react';
import { Search, Network, Server, Database, Package, MessageSquare, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { NODE_TEMPLATES, CATEGORY_META, type Category } from '../data/nodes';
import { CHAOS_SCENARIOS, CHAOS_CATEGORY_META, type ChaosCategory } from '../data/chaos';
import { NodeIcon } from './NodeIcon';

// ── Category icons ─────────────────────────────────────────────────────────
const CAT_ICONS: Record<Category, React.ReactNode> = {
  network:        <Network size={14} strokeWidth={1.75} />,
  compute:        <Server size={14} strokeWidth={1.75} />,
  data:           <Database size={14} strokeWidth={1.75} />,
  messaging:      <MessageSquare size={14} strokeWidth={1.75} />,
  infrastructure: <Package size={14} strokeWidth={1.75} />,
  monitoring:     <Activity size={14} strokeWidth={1.75} />,
};

const CHAOS_ICONS: Record<ChaosCategory, string> = {
  infrastructure: '💥', network: '🌐', traffic: '📈', application: '🐛', data: '🗄️', dependency: '🔗',
};

const CATEGORIES = Object.keys(CATEGORY_META) as Category[];
const CHAOS_CATEGORIES = Object.keys(CHAOS_CATEGORY_META) as ChaosCategory[];

// ── Draggable node item ────────────────────────────────────────────────────
function NodeItem({ id, icon, label, category, collapsed }: {
  id: string; icon: string; label: string; category: Category; collapsed: boolean;
}) {
  const { color } = CATEGORY_META[category];

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/reactflow-type', id);
    e.dataTransfer.setData('application/reactflow-label', label);
    e.dataTransfer.setData('application/reactflow-icon', icon);
    e.dataTransfer.setData('application/reactflow-category', category);
    e.dataTransfer.effectAllowed = 'move';
  };

  if (collapsed) {
    return (
      <div
        draggable
        onDragStart={onDragStart}
        title={label}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 7, margin: '2px auto',
          cursor: 'grab', transition: 'all 0.12s',
          background: `${color}12`, border: `1px solid ${color}22`, color,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${color}22`; e.currentTarget.style.borderColor = `${color}44`; }}
        onMouseLeave={e => { e.currentTarget.style.background = `${color}12`; e.currentTarget.style.borderColor = `${color}22`; }}
      >
        <NodeIcon icon={icon} size={13} strokeWidth={1.75} />
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 12px', margin: '1px 4px',
        cursor: 'grab', borderRadius: 5, transition: 'all 0.12s', userSelect: 'none',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 5,
        background: `${color}15`, border: `1px solid ${color}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0,
      }}>
        <NodeIcon icon={icon} size={11} strokeWidth={1.75} />
      </div>
      <span style={{
        fontSize: 12, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif",
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Draggable chaos item ───────────────────────────────────────────────────
function ChaosItem({ id, icon, label, category, severity, collapsed }: {
  id: string; icon: string; label: string; category: ChaosCategory; severity: string; collapsed: boolean;
}) {
  const { color } = CHAOS_CATEGORY_META[category];
  const sevColor = severity === 'critical' ? '#EF4444' : severity === 'high' ? '#F97316' : '#EAB308';

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/chaos-type', id);
    e.dataTransfer.setData('application/chaos-label', label);
    e.dataTransfer.effectAllowed = 'move';
  };

  if (collapsed) {
    return (
      <div
        draggable
        onDragStart={onDragStart}
        title={label}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 7, margin: '2px auto',
          cursor: 'grab', transition: 'all 0.12s',
          background: `${color}12`, border: `1px solid ${color}22`,
          fontSize: 13,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${color}22`; }}
        onMouseLeave={e => { e.currentTarget.style.background = `${color}12`; }}
      >
        <NodeIcon icon={icon} size={12} strokeWidth={1.75} color={color} />
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 12px', margin: '1px 4px',
        cursor: 'grab', borderRadius: 5, transition: 'all 0.12s', userSelect: 'none',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 5,
        background: `${color}15`, border: `1px solid ${color}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <NodeIcon icon={icon} size={11} strokeWidth={1.75} color={color} />
      </div>
      <span style={{
        fontSize: 11.5, color: 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif",
        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 8.5, padding: '1px 5px', borderRadius: 3,
        background: `${sevColor}15`, color: sevColor,
        fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700,
        letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0,
      }}>
        {severity === 'critical' ? '!!' : severity === 'high' ? '!' : '~'}
      </span>
    </div>
  );
}

// ── Main Sidebar ───────────────────────────────────────────────────────────
export function Sidebar() {
  const [tab, setTab] = useState<'components' | 'chaos'>('components');
  const [activeCategory, setActiveCategory] = useState<Category>('network');
  const [activeChaosCategory, setActiveChaosCategory] = useState<ChaosCategory>('infrastructure');
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('techsim_sidebar_collapsed') === 'true',
  );

  const toggleCollapse = () => {
    setCollapsed(c => {
      const next = !c;
      localStorage.setItem('techsim_sidebar_collapsed', String(next));
      return next;
    });
  };

  const filteredNodes = NODE_TEMPLATES.filter(n =>
    n.category === activeCategory &&
    (search === '' || n.label.toLowerCase().includes(search.toLowerCase())),
  );

  const filteredChaos = CHAOS_SCENARIOS.filter(c =>
    c.category === activeChaosCategory &&
    (search === '' || c.label.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <aside
      style={{
        width: collapsed ? 48 : 220,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        flexShrink: 0,
        userSelect: 'none',
        position: 'relative',
        transition: 'width 300ms ease',
        overflow: 'hidden',
      }}
    >
      {/* Collapse toggle */}
      <button
        onClick={toggleCollapse}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          position: 'absolute', top: 10, right: -10,
          width: 20, height: 20, borderRadius: '50%',
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          color: 'var(--text-muted)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10, transition: 'all 0.12s',
          padding: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'white'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      {!collapsed && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {(['components', 'chaos'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '9px 0',
                background: tab === t ? 'rgba(124,58,237,0.1)' : 'transparent',
                border: 'none', borderBottom: tab === t ? '2px solid #7C3AED' : '2px solid transparent',
                color: tab === t ? '#A78BFA' : 'var(--text-muted)',
                fontSize: 11.5, fontWeight: 600,
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: '0.04em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.12s',
              }}
            >
              {t === 'components' ? 'Components' : '💥 Chaos'}
            </button>
          ))}
        </div>
      )}

      {/* ── Collapsed: tab toggle icons ────────────────────────────────────── */}
      {collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 36, gap: 4 }}>
          <button
            onClick={() => { setTab('components'); setCollapsed(false); localStorage.setItem('techsim_sidebar_collapsed', 'false'); }}
            title="Components"
            style={{
              width: 32, height: 32, borderRadius: 7, background: tab === 'components' ? 'rgba(124,58,237,0.2)' : 'transparent',
              border: tab === 'components' ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
              color: tab === 'components' ? '#A78BFA' : 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Package size={14} />
          </button>
          <button
            onClick={() => { setTab('chaos'); setCollapsed(false); localStorage.setItem('techsim_sidebar_collapsed', 'false'); }}
            title="Chaos"
            style={{
              width: 32, height: 32, borderRadius: 7, background: tab === 'chaos' ? 'rgba(239,68,68,0.2)' : 'transparent',
              border: tab === 'chaos' ? '1px solid rgba(239,68,68,0.4)' : '1px solid transparent',
              color: tab === 'chaos' ? '#FCA5A5' : 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13,
            }}
          >
            💥
          </button>
        </div>
      )}

      {/* ── Search (components tab only, expanded) ────────────────────────── */}
      {!collapsed && (
        <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-dim)', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6, padding: '5px 9px',
          }}>
            <Search size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${tab}…`}
              style={{
                flex: 1, background: 'none', border: 'none',
                fontSize: 11.5, color: 'var(--text)', outline: 'none',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>
        </div>
      )}

      {/* ── Category navigation ───────────────────────────────────────────── */}
      {tab === 'components' ? (
        <>
          <div style={{ padding: '4px 0', borderBottom: '1px solid var(--border-dim)', flexShrink: 0 }}>
            {CATEGORIES.map(cat => {
              const { color, label } = CATEGORY_META[cat];
              const isActive = activeCategory === cat;
              const count = NODE_TEMPLATES.filter(n => n.category === cat).length;
              if (collapsed) {
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    title={label}
                    style={{
                      width: '100%', padding: '7px 0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isActive ? `${color}18` : 'transparent',
                      border: 'none',
                      borderLeft: isActive ? `2px solid ${color}` : '2px solid transparent',
                      color: isActive ? color : 'var(--text-muted)',
                      cursor: 'pointer', transition: 'all 0.12s',
                    }}
                  >
                    {CAT_ICONS[cat]}
                  </button>
                );
              }
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '6px 14px',
                    background: isActive ? `${color}10` : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? `2px solid ${color}` : '2px solid transparent',
                    cursor: 'pointer', transition: 'all 0.1s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ color: isActive ? color : 'var(--text-muted)', display: 'flex' }}>
                    {CAT_ICONS[cat]}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--text)' : 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif", flex: 1, textAlign: 'left' }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Node list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
            {filteredNodes.map(node => (
              <NodeItem key={node.id} id={node.id} icon={node.icon} label={node.label} category={node.category} collapsed={collapsed} />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Chaos categories */}
          <div style={{ padding: '4px 0', borderBottom: '1px solid var(--border-dim)', flexShrink: 0 }}>
            {CHAOS_CATEGORIES.map(cat => {
              const { color, label } = CHAOS_CATEGORY_META[cat];
              const isActive = activeChaosCategory === cat;
              const count = CHAOS_SCENARIOS.filter(c => c.category === cat).length;
              if (collapsed) {
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveChaosCategory(cat)}
                    title={label}
                    style={{
                      width: '100%', padding: '7px 0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isActive ? `${color}18` : 'transparent',
                      border: 'none', borderLeft: isActive ? `2px solid ${color}` : '2px solid transparent',
                      color: isActive ? color : 'var(--text-muted)',
                      cursor: 'pointer', transition: 'all 0.12s',
                      fontSize: 13,
                    }}
                  >
                    {CHAOS_ICONS[cat]}
                  </button>
                );
              }
              return (
                <button
                  key={cat}
                  onClick={() => setActiveChaosCategory(cat)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '6px 14px',
                    background: isActive ? `${color}10` : 'transparent',
                    border: 'none', borderLeft: isActive ? `2px solid ${color}` : '2px solid transparent',
                    cursor: 'pointer', transition: 'all 0.1s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 12 }}>{CHAOS_ICONS[cat]}</span>
                  <span style={{ fontSize: 11.5, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--text)' : 'var(--text-dim)', fontFamily: "'DM Sans', sans-serif", flex: 1, textAlign: 'left' }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Chaos items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
            {!collapsed && (
              <div style={{ padding: '6px 14px 2px', fontSize: 10, color: '#64748B', fontFamily: "'IBM Plex Mono', monospace" }}>
                Drag onto a node to inject chaos
              </div>
            )}
            {filteredChaos.map(c => (
              <ChaosItem key={c.id} id={c.id} icon={c.icon} label={c.label} category={c.category} severity={c.severity} collapsed={collapsed} />
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
