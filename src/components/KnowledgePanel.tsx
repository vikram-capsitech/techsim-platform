import { useState } from 'react';
import { componentKnowledge, type ComponentInfo } from '../data/componentKnowledge';
import { COMPONENT_REFERENCES, GENERAL_REFERENCES, type Reference, type RefType } from '../data/references';
import { getKnowledgeCard } from '../data/content/index';

type Tab = 'overview' | 'when' | 'realworld' | 'metrics' | 'mistakes' | 'interview' | 'references';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',   label: 'Overview'    },
  { id: 'when',       label: 'When to Use' },
  { id: 'realworld',  label: 'Real World'  },
  { id: 'metrics',    label: 'Metrics'     },
  { id: 'mistakes',   label: 'Mistakes'    },
  { id: 'interview',  label: '🎯 Interview' },
  { id: 'references', label: '📚 Learn'    },
];

interface KnowledgePanelProps {
  nodeTypeId: string;
  label: string;
  onClose: () => void;
}

export function KnowledgePanel({ nodeTypeId, label, onClose }: KnowledgePanelProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const info = componentKnowledge[nodeTypeId];
  const card = getKnowledgeCard(nodeTypeId);

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
          background: 'var(--bg-primary)',
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
          borderBottom: '1px solid var(--border-dim)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {info && <span style={{ fontSize: 22 }}>{info.icon}</span>}
                <span style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}>
                  {info?.name ?? label}
                </span>
              </div>
              {info && (
                <p style={{
                  margin: 0,
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
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
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0, marginTop: 2,
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#EF4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
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
                  color: tab === t.id ? '#A78BFA' : 'var(--text-secondary)',
                  fontSize: 11.5,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: tab === t.id ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  outline: tab === t.id ? '1px solid rgba(124,58,237,0.4)' : 'none',
                }}
                onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--text-secondary)'; }}
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
          ) : tab === 'realworld' ? (
            <RealWorldTab card={card} info={info} />
          ) : tab === 'metrics' ? (
            <MetricsTab card={card} info={info} />
          ) : tab === 'interview' ? (
            <InterviewTab card={card} />
          ) : !info && !card ? (
            <NoKnowledge label={label} nodeTypeId={nodeTypeId} />
          ) : (
            <>
              {tab === 'overview' && <OverviewTab info={info} card={card} />}
              {tab === 'when'     && <WhenTab info={info} card={card} />}
              {tab === 'mistakes' && <MistakesTab info={info} card={card} />}
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
    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-secondary)' }}>
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
          <span style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Tab content components ────────────────────────────────────────────────────

import type { KnowledgeCard } from '../data/content/index';

type TabProps = { info: ComponentInfo | undefined; card: KnowledgeCard | undefined };

function OverviewTab({ info, card }: TabProps) {
  const whatItDoes = card?.whatItDoes ?? info?.whatItDoes;
  const tagline    = card?.tagline;

  return (
    <div>
      {tagline && (
        <p style={{ margin: '0 0 14px', fontSize: 13, color: '#7C3AED', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.5 }}>
          {tagline}
        </p>
      )}
      <SectionHeading>What it does</SectionHeading>
      {whatItDoes && <Prose>{whatItDoes}</Prose>}

      {info?.algorithms && info.algorithms.length > 0 && (
        <>
          <SectionHeading>Key algorithms & strategies</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {info.algorithms.map((alg, i) => (
              <div key={i} style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 8, padding: '9px 12px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#C4B5FD', marginBottom: 3 }}>{alg.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{alg.desc}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function WhenTab({ info, card }: TabProps) {
  const whenToUse    = card?.whenToUse    ?? info?.whenToUse    ?? [];
  const whenNotToUse = card?.whenNotToUse ?? [];
  return (
    <div>
      <SectionHeading>When to use</SectionHeading>
      <BulletList items={whenToUse} color='#34D399' />
      {whenNotToUse.length > 0 && (
        <>
          <SectionHeading>When NOT to use / trade-offs</SectionHeading>
          <BulletList items={whenNotToUse} color='#F97316' />
        </>
      )}
    </div>
  );
}

function MistakesTab({ info, card }: TabProps) {
  const mistakes = card?.commonMistakes ?? info?.commonMistakes ?? [];
  return (
    <div>
      <SectionHeading>Common mistakes to avoid</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {mistakes.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '9px 12px' }}>
            <span style={{ color: '#EF4444', flexShrink: 0, fontSize: 14, lineHeight: 1.4 }}>⚠</span>
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RealWorldTab({ card, info }: TabProps) {
  if (card?.realWorldUsage?.length) {
    return (
      <div>
        <SectionHeading>Real-world usage</SectionHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {card.realWorldUsage.map((r, i) => (
            <div key={i} style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 9, padding: '11px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#06B6D4', marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>{r.company}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{r.useCase}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // Fallback to legacy realWorldExamples
  const examples = info?.realWorldExamples ?? [];
  return (
    <div>
      <SectionHeading>Real-world examples</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {examples.map((ex, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.12)', borderRadius: 7, padding: '7px 10px' }}>
            <span style={{ color: '#06B6D4', flexShrink: 0, fontSize: 11, marginTop: 2 }}>▸</span>
            <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ex}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricsTab({ card, info }: TabProps) {
  const km = card?.keyMetrics;
  const rows = km
    ? [
        { label: 'Throughput', value: km.throughput,   color: '#06B6D4' },
        { label: 'Latency',    value: km.latency,      color: '#A78BFA' },
        { label: 'Cost',       value: km.typicalCost,  color: '#34D399' },
      ]
    : info
    ? [
        { label: 'Throughput', value: info.estimations.throughput, color: '#06B6D4' },
        { label: 'Latency',    value: info.estimations.latency,    color: '#A78BFA' },
        { label: 'Cost',       value: info.estimations.cost,       color: '#34D399' },
      ]
    : [];

  return (
    <div>
      <SectionHeading>Capacity & cost estimations</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map(row => (
          <div key={row.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px' }}>
            <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: row.color, marginBottom: 5 }}>{row.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{row.value}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, padding: '10px 14px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 8, fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.5 }}>
        Numbers are rough estimates. Always benchmark in your specific environment and workload.
      </div>
    </div>
  );
}

function InterviewTab({ card }: { card: KnowledgeCard | undefined }) {
  if (!card?.interviewTips) {
    return (
      <div style={{ textAlign: 'center' as const, paddingTop: 48 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: "'IBM Plex Mono', monospace" }}>
          Interview tips available once content is loaded.
        </div>
      </div>
    );
  }
  return (
    <div>
      <SectionHeading>Interview talking points</SectionHeading>
      <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
          {card.interviewTips}
        </div>
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
                border: `1px solid ${active ? 'rgba(124,58,237,0.5)' : 'var(--border)'}`,
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
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontSize: 12.5,
          color: 'var(--text-secondary)',
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
        borderTop: '1px solid var(--border-dim)',
      }}>
        <div style={{
          fontSize: 10.5,
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
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
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
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
        (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-card)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
      }}
    >
      <span style={{ fontSize: compact ? 14 : 18, flexShrink: 0, lineHeight: 1 }}>
        {REF_TYPE_ICON[ref.type]}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: compact ? 12 : 13,
          fontWeight: 500,
          color: 'var(--accent-bright)',
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
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: "'IBM Plex Mono', monospace" }}>
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
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: "'IBM Plex Mono', monospace" }}>
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

      <span style={{ color: 'var(--text-secondary)', fontSize: 13, flexShrink: 0 }}>→</span>
    </a>
  );
}

function NoKnowledge({ label, nodeTypeId }: { label: string; nodeTypeId: string }) {
  // Derive a readable category from the node type id
  const category = nodeTypeId.includes('db') || nodeTypeId.includes('sql') || nodeTypeId.includes('mongo') || nodeTypeId.includes('redis') || nodeTypeId.includes('cache')
    ? 'data storage'
    : nodeTypeId.includes('queue') || nodeTypeId.includes('kafka') || nodeTypeId.includes('rabbit') || nodeTypeId.includes('sqs')
    ? 'messaging'
    : nodeTypeId.includes('balancer') || nodeTypeId.includes('gateway') || nodeTypeId.includes('cdn') || nodeTypeId.includes('waf')
    ? 'network'
    : nodeTypeId.includes('service') || nodeTypeId.includes('worker') || nodeTypeId.includes('lambda') || nodeTypeId.includes('server')
    ? 'compute'
    : nodeTypeId.includes('monitor') || nodeTypeId.includes('grafana') || nodeTypeId.includes('prometheus')
    ? 'monitoring'
    : 'infrastructure';

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📖</div>
      <h3 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>
        {label}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: '0 0 8px' }}>
        This component is a <strong style={{ color: 'var(--text-primary)' }}>{category}</strong> layer node.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>
        Detailed knowledge card coming in the next update.
      </p>
    </div>
  );
}
