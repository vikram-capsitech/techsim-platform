import { useState } from 'react';
import { componentKnowledge, type ComponentInfo } from '../data/componentKnowledge';
import { COMPONENT_REFERENCES, GENERAL_REFERENCES, type Reference, type RefType } from '../data/references';

type Tab = 'overview' | 'when' | 'tradeoffs' | 'mistakes' | 'estimations' | 'references';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',    label: 'Overview'    },
  { id: 'when',        label: 'When to Use' },
  { id: 'tradeoffs',   label: 'Trade-offs'  },
  { id: 'mistakes',    label: 'Mistakes'    },
  { id: 'estimations', label: 'Capacity'    },
  { id: 'references',  label: '📚 Learn'    },
];

interface KnowledgePanelProps {
  nodeTypeId: string;
  label: string;
  onClose: () => void;
}

export function KnowledgePanel({ nodeTypeId, label, onClose }: KnowledgePanelProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const info = componentKnowledge[nodeTypeId];

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(2px)',
          zIndex: 90,
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0, right: 0,
          width: 480,
          height: '100vh',
          background: '#0D0D10',
          borderLeft: '1px solid rgba(124,58,237,0.3)',
          boxShadow: '-8px 0 48px rgba(0,0,0,0.7)',
          zIndex: 91,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'DM Sans', sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {info && <span style={{ fontSize: 22 }}>{info.icon}</span>}
                <span style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#E2E8F0',
                  letterSpacing: '-0.02em',
                }}>
                  {info?.name ?? label}
                </span>
              </div>
              {info && (
                <p style={{
                  margin: 0,
                  fontSize: 12.5,
                  color: '#64748B',
                  fontFamily: "'IBM Plex Mono', monospace",
                  lineHeight: 1.4,
                }}>
                  {info.oneLiner}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#64748B', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0, marginTop: 2,
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#EF4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#64748B'; }}
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, marginTop: 6, flexWrap: 'wrap' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: tab === t.id ? 'rgba(124,58,237,0.22)' : 'transparent',
                  color: tab === t.id ? '#A78BFA' : '#64748B',
                  fontSize: 11.5,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: tab === t.id ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  outline: tab === t.id ? '1px solid rgba(124,58,237,0.4)' : 'none',
                }}
                onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = '#94A3B8'; }}
                onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = '#64748B'; }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
          {tab === 'references' ? (
            <ReferencesTab nodeTypeId={nodeTypeId} />
          ) : !info ? (
            <NoKnowledge label={label} nodeTypeId={nodeTypeId} />
          ) : (
            <>
              {tab === 'overview'    && <OverviewTab info={info} />}
              {tab === 'when'        && <WhenTab info={info} />}
              {tab === 'tradeoffs'   && <TradeoffsTab info={info} />}
              {tab === 'mistakes'    && <MistakesTab info={info} />}
              {tab === 'estimations' && <EstimationsTab info={info} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10.5,
      fontFamily: "'IBM Plex Mono', monospace",
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: '#7C3AED',
      marginBottom: 10,
      marginTop: 18,
    }}>
      {children}
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: '#94A3B8' }}>
      {children}
    </p>
  );
}

function BulletList({ items, color = '#A78BFA' }: { items: string[]; color?: string }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13 }}>
          <span style={{ color, flexShrink: 0, marginTop: 3, fontSize: 8 }}>◆</span>
          <span style={{ color: '#94A3B8', lineHeight: 1.55 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Tab content components ────────────────────────────────────────────────────

function OverviewTab({ info }: { info: ComponentInfo }) {
  return (
    <div>
      <SectionHeading>What it does</SectionHeading>
      <Prose>{info.whatItDoes}</Prose>

      {info.algorithms && info.algorithms.length > 0 && (
        <>
          <SectionHeading>Key algorithms & strategies</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {info.algorithms.map((alg, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(124,58,237,0.06)',
                  border: '1px solid rgba(124,58,237,0.15)',
                  borderRadius: 8,
                  padding: '9px 12px',
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#C4B5FD', marginBottom: 3 }}>
                  {alg.name}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                  {alg.desc}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionHeading>Real-world examples</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {info.realWorldExamples.map((ex, i) => (
          <div
            key={i}
            style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              background: 'rgba(6,182,212,0.05)',
              border: '1px solid rgba(6,182,212,0.12)',
              borderRadius: 7,
              padding: '7px 10px',
            }}
          >
            <span style={{ color: '#06B6D4', flexShrink: 0, fontSize: 11, marginTop: 2 }}>▸</span>
            <span style={{ fontSize: 12.5, color: '#94A3B8', lineHeight: 1.5 }}>{ex}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhenTab({ info }: { info: ComponentInfo }) {
  return (
    <div>
      <SectionHeading>When to use</SectionHeading>
      <BulletList items={info.whenToUse} color='#34D399' />
    </div>
  );
}

function TradeoffsTab({ info }: { info: ComponentInfo }) {
  return (
    <div>
      <SectionHeading>Pros</SectionHeading>
      <BulletList items={info.tradeoffs.pros} color='#22C55E' />
      <SectionHeading>Cons</SectionHeading>
      <BulletList items={info.tradeoffs.cons} color='#EF4444' />
    </div>
  );
}

function MistakesTab({ info }: { info: ComponentInfo }) {
  return (
    <div>
      <SectionHeading>Common mistakes to avoid</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {info.commonMistakes.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 8,
              padding: '9px 12px',
            }}
          >
            <span style={{ color: '#EF4444', flexShrink: 0, fontSize: 14, lineHeight: 1.4 }}>⚠</span>
            <span style={{ fontSize: 12.5, color: '#94A3B8', lineHeight: 1.55 }}>{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EstimationsTab({ info }: { info: ComponentInfo }) {
  const rows = [
    { label: 'Throughput', value: info.estimations.throughput, color: '#06B6D4' },
    { label: 'Latency',    value: info.estimations.latency,    color: '#A78BFA' },
    { label: 'Cost',       value: info.estimations.cost,       color: '#34D399' },
  ];

  return (
    <div>
      <SectionHeading>Capacity & cost estimations</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map(row => (
          <div
            key={row.label}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8,
              padding: '11px 14px',
            }}
          >
            <div style={{
              fontSize: 10,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: row.color,
              marginBottom: 5,
            }}>
              {row.label}
            </div>
            <div style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.5 }}>
              {row.value}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 20,
        padding: '10px 14px',
        background: 'rgba(124,58,237,0.06)',
        border: '1px solid rgba(124,58,237,0.15)',
        borderRadius: 8,
        fontSize: 11.5,
        color: '#64748B',
        fontFamily: "'IBM Plex Mono', monospace",
        lineHeight: 1.5,
      }}>
        Numbers are rough estimates. Always benchmark in your specific environment and workload.
      </div>
    </div>
  );
}

// ── References tab ────────────────────────────────────────────────────────────

const REF_TYPE_ICON: Record<RefType, string> = {
  docs:    '📄',
  video:   '🎥',
  paper:   '📑',
  book:    '📘',
  article: '📰',
  course:  '🎓',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     '#22C55E',
  intermediate: '#EAB308',
  advanced:     '#EF4444',
};

const FILTER_OPTIONS: { value: RefType | 'all'; label: string }[] = [
  { value: 'all',     label: 'All'     },
  { value: 'docs',    label: '📄 Docs'  },
  { value: 'video',   label: '🎥 Video' },
  { value: 'paper',   label: '📑 Paper' },
  { value: 'book',    label: '📘 Book'  },
];

function ReferencesTab({ nodeTypeId }: { nodeTypeId: string }) {
  const [filter, setFilter] = useState<RefType | 'all'>('all');
  const componentRefs: Reference[] = COMPONENT_REFERENCES[nodeTypeId] ?? [];
  const filtered = filter === 'all' ? componentRefs : componentRefs.filter(r => r.type === filter);

  return (
    <div>
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
        {FILTER_OPTIONS.map(opt => {
          const active = filter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: `1px solid ${active ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.07)'}`,
                background: active ? 'rgba(124,58,237,0.18)' : 'transparent',
                color: active ? '#A78BFA' : '#64748B',
                fontSize: 11,
                fontFamily: "'IBM Plex Mono', monospace",
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Component-specific references */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((ref, i) => (
            <RefCard key={i} ref={ref} />
          ))}
        </div>
      ) : (
        <div style={{
          padding: '16px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 8,
          fontSize: 12.5,
          color: '#475569',
          fontFamily: "'IBM Plex Mono', monospace",
          textAlign: 'center',
        }}>
          No {filter === 'all' ? '' : filter + ' '}references for this component yet.
        </div>
      )}

      {/* General system design resources */}
      <div style={{
        marginTop: 24,
        paddingTop: 18,
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          fontSize: 10.5,
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#475569',
          marginBottom: 10,
        }}>
          Essential System Design Resources
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {GENERAL_REFERENCES.map((ref, i) => (
            <RefCard key={i} ref={ref} compact />
          ))}
        </div>
      </div>
    </div>
  );
}

function RefCard({ ref, compact = false }: { ref: Reference; compact?: boolean }) {
  return (
    <a
      href={ref.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: compact ? 'center' : 'flex-start',
        gap: 10,
        padding: compact ? '8px 10px' : '10px 12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        textDecoration: 'none',
        transition: 'all 0.12s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(124,58,237,0.08)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(124,58,237,0.25)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.03)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.07)';
      }}
    >
      <span style={{ fontSize: compact ? 14 : 18, flexShrink: 0, lineHeight: 1 }}>
        {REF_TYPE_ICON[ref.type]}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: compact ? 12 : 13,
          fontWeight: 500,
          color: '#C4B5FD',
          lineHeight: 1.35,
          marginBottom: compact ? 0 : 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: compact ? 'nowrap' : 'normal',
        }}>
          {ref.title}
        </div>

        {!compact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {ref.author && (
              <span style={{ fontSize: 11, color: '#475569', fontFamily: "'IBM Plex Mono', monospace" }}>
                {ref.author}
              </span>
            )}
            <span style={{
              fontSize: 10,
              fontFamily: "'IBM Plex Mono', monospace",
              color: DIFFICULTY_COLOR[ref.difficulty],
              fontWeight: 600,
            }}>
              {ref.difficulty}
            </span>
            {ref.duration && (
              <span style={{ fontSize: 10, color: '#475569', fontFamily: "'IBM Plex Mono', monospace" }}>
                ⏱ {ref.duration}
              </span>
            )}
            <span style={{
              fontSize: 10,
              fontFamily: "'IBM Plex Mono', monospace",
              color: ref.free ? '#22C55E' : '#64748B',
            }}>
              {ref.free ? '✅ Free' : '💳 Paid'}
            </span>
          </div>
        )}
      </div>

      <span style={{ color: '#334155', fontSize: 13, flexShrink: 0 }}>→</span>
    </a>
  );
}

function NoKnowledge({ label, nodeTypeId }: { label: string; nodeTypeId: string }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>📖</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#E2E8F0', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 12.5, color: '#64748B', fontFamily: "'IBM Plex Mono', monospace" }}>
        No deep-dive content yet for <code style={{ color: '#A78BFA' }}>{nodeTypeId}</code>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
        Coming soon in a future update.
      </div>
    </div>
  );
}
