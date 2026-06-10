import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONCEPTS, CONCEPT_CATEGORIES } from '../data/concepts';

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner:     '#22C55E',
  Intermediate: '#F59E0B',
  Advanced:     '#EF4444',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Distributed Systems':     '#7C3AED',
  'Database Design':         '#D97706',
  'Networking':              '#2563EB',
  'Microservices':           '#0891B2',
  'Architecture Patterns':   '#DC2626',
  'Performance':             '#059669',
  'Data Structures':         '#8B5CF6',
};

export function ConceptsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = CONCEPTS.filter(c => {
    const matchCat = !activeCategory || c.category === activeCategory;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some(t => t.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)', padding: '2rem', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: 'var(--text)', letterSpacing: '-0.02em' }}>
          CS Concepts
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 13.5, margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>
          {CONCEPTS.length} concepts · {CONCEPTS.filter(c => c.hasDemo).length} interactive demos
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Search concepts or tags…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8,
            padding: '7px 12px', color: 'var(--text)', fontSize: 13,
            fontFamily: "'IBM Plex Mono', monospace", outline: 'none', width: 240,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <FilterChip label="All" active={!activeCategory} onClick={() => setActiveCategory(null)} color="var(--accent)" />
          {CONCEPT_CATEGORIES.map(cat => (
            <FilterChip
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              color={CATEGORY_COLORS[cat] ?? '#7C3AED'}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 14,
      }}>
        {filtered.map(concept => (
          <ConceptCard
            key={concept.id}
            id={concept.id}
            title={concept.title}
            category={concept.category}
            difficulty={concept.difficulty}
            estimatedTime={concept.estimatedTime}
            summary={concept.summary}
            tags={concept.tags}
            hasDemo={concept.hasDemo}
            onClick={() => navigate(`/concepts/${concept.id}`)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{
            gridColumn: '1 / -1', padding: '3rem', textAlign: 'center',
            color: 'var(--text-dim)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13,
          }}>
            No concepts match your search.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 20, fontSize: 12,
        fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
        cursor: 'pointer', transition: 'all 0.15s',
        background: active ? color + '22' : 'var(--card-bg)',
        border: `1px solid ${active ? color + '60' : 'var(--border)'}`,
        color: active ? color : 'var(--text-dim)',
      }}
    >
      {label}
    </button>
  );
}

function ConceptCard({
  title, category, difficulty, estimatedTime, summary, tags, hasDemo, onClick,
}: {
  id: string; title: string; category: string; difficulty: string;
  estimatedTime: string; summary: string; tags: string[]; hasDemo: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const catColor = CATEGORY_COLORS[category] ?? '#7C3AED';
  const diffColor = DIFFICULTY_COLORS[difficulty] ?? '#7C3AED';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--card-bg)',
        border: `1px solid ${hovered ? catColor + '50' : 'var(--border)'}`,
        borderRadius: 12, padding: '16px 18px',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'border-color 0.2s, transform 0.15s, box-shadow 0.2s',
        boxShadow: hovered ? `0 6px 24px rgba(0,0,0,0.25)` : 'none',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600, letterSpacing: '0.04em',
              background: catColor + '18', border: `1px solid ${catColor}35`, color: catColor,
            }}>
              {category}
            </span>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600,
              background: diffColor + '18', border: `1px solid ${diffColor}35`, color: diffColor,
            }}>
              {difficulty}
            </span>
            {hasDemo && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 600,
                background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', color: '#A78BFA',
              }}>
                ▶ Demo
              </span>
            )}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0, marginTop: 2 }}>
          ⏱ {estimatedTime}
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: 0, lineHeight: 1.55 }}>
        {summary}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {tags.slice(0, 3).map(tag => (
          <span key={tag} style={{
            fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace",
            padding: '2px 7px', borderRadius: 4,
            background: 'var(--bg)', border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}>
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
