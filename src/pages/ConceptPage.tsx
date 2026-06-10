import { useParams, useNavigate } from 'react-router-dom';
import { CONCEPTS } from '../data/concepts';
import { CAPTheoremDemo } from '../concepts/CAPTheoremDemo';
import { ConsistentHashingDemo } from '../concepts/ConsistentHashingDemo';
import { ShardingDemo } from '../concepts/ShardingDemo';
import { ReplicationDemo } from '../concepts/ReplicationDemo';
import { CircuitBreakerDemo } from '../concepts/CircuitBreakerDemo';
import { RateLimitingDemo } from '../concepts/RateLimitingDemo';
import { LoadBalancingDemo } from '../concepts/LoadBalancingDemo';
import { CachingDemo } from '../concepts/CachingDemo';
import { CQRSDemo } from '../concepts/CQRSDemo';
import { TwoPCAnimation } from '../concepts/TwoPCAnimation';
import { SagaAnimation } from '../concepts/SagaAnimation';
import { EventSourcingAnimation } from '../concepts/EventSourcingAnimation';

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner:     '#22C55E',
  Intermediate: '#F59E0B',
  Advanced:     '#EF4444',
};

const REF_TYPE_ICONS: Record<string, string> = {
  paper: '📄',
  blog:  '✍️',
  docs:  '📖',
  video: '▶️',
};

export function ConceptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const concept = CONCEPTS.find(c => c.id === id);

  if (!concept) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤔</div>
          <div style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>Concept not found</div>
          <button onClick={() => navigate('/concepts')} style={{
            background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 7,
            padding: '8px 18px', cursor: 'pointer', fontSize: 13,
          }}>
            Back to Concepts
          </button>
        </div>
      </div>
    );
  }

  const diffColor = DIFFICULTY_COLORS[concept.difficulty] ?? '#7C3AED';

  return (
    <div style={{
      flex: 1, overflowY: 'auto', background: 'var(--bg)',
      fontFamily: "'DM Sans', sans-serif", color: 'var(--text)',
    }}>
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '2rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem', fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace" }}>
          <button onClick={() => navigate('/concepts')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-dim)', padding: 0,
          }}>
            Concepts
          </button>
          <span style={{ color: 'var(--text-muted)' }}>›</span>
          <span style={{ color: 'var(--text-dim)' }}>{concept.category}</span>
          <span style={{ color: 'var(--text-muted)' }}>›</span>
          <span style={{ color: 'var(--text)' }}>{concept.title}</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 5,
              background: diffColor + '18', border: `1px solid ${diffColor}35`, color: diffColor,
              fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
            }}>
              {concept.difficulty}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
              ⏱ {concept.estimatedTime}
            </span>
            {concept.hasDemo && (
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 5,
                background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', color: '#A78BFA',
                fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
              }}>
                ▶ Interactive Demo
              </span>
            )}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            {concept.title}
          </h1>
          <p style={{ fontSize: 14.5, color: 'var(--text-dim)', margin: 0, lineHeight: 1.6 }}>
            {concept.summary}
          </p>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '2rem' }}>
          {concept.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
              padding: '3px 9px', borderRadius: 5,
              background: 'var(--card-bg)', border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* Theory */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 16px', color: 'var(--text)' }}>
            Theory
          </h2>
          {concept.theory.map((para, i) => (
            <p key={i} style={{
              fontSize: 14, lineHeight: 1.75, color: 'var(--text-dim)',
              margin: '0 0 16px',
            }}>
              {para}
            </p>
          ))}
        </section>

        {/* Interactive Demo */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 16px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
            Interactive Demo
            {!concept.hasDemo && (
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 5,
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                color: '#F59E0B', fontFamily: "'IBM Plex Mono', monospace",
              }}>
                Coming in Sprint 4
              </span>
            )}
          </h2>

          {concept.hasDemo ? (
            <div style={{
              background: 'var(--panel-bg)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '20px',
            }}>
              {concept.demoType === 'cap'                    && <CAPTheoremDemo />}
              {concept.demoType === 'hashing'                 && <ConsistentHashingDemo />}
              {concept.demoType === 'sharding'                && <ShardingDemo />}
              {concept.demoType === 'replication'             && <ReplicationDemo />}
              {concept.demoType === 'circuit-breaker'         && <CircuitBreakerDemo />}
              {concept.demoType === 'rate-limiting'           && <RateLimitingDemo />}
              {concept.demoType === 'load-balancing'          && <LoadBalancingDemo />}
              {concept.demoType === 'caching'                 && <CachingDemo />}
              {concept.demoType === 'cqrs'                    && <CQRSDemo />}
              {concept.demoType === 'twopc-animation'         && <TwoPCAnimation />}
              {concept.demoType === 'saga-animation'          && <SagaAnimation />}
              {concept.demoType === 'eventsourcing-animation' && <EventSourcingAnimation />}
            </div>
          ) : (
            <div style={{
              background: 'var(--panel-bg)', border: '1px dashed var(--border)',
              borderRadius: 12, padding: '40px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              <div style={{ fontSize: 40 }}>🧪</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                Interactive Demo
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', maxWidth: 380 }}>
                An interactive simulation for this concept is planned for Sprint 4.
                In the meantime, read through the theory above and check the references below.
              </div>
              <div style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 12,
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                color: '#F59E0B', fontFamily: "'IBM Plex Mono', monospace",
              }}>
                Coming in Sprint 4
              </div>
            </div>
          )}
        </section>

        {/* References */}
        <section>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 14px', color: 'var(--text)' }}>
            Further Reading
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {concept.references.map((ref, i) => (
              <a
                key={i}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 8,
                  background: 'var(--card-bg)', border: '1px solid var(--border)',
                  textDecoration: 'none', color: 'var(--text)',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <span style={{ fontSize: 16 }}>{REF_TYPE_ICONS[ref.type]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{ref.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>
                    {ref.type} · {new URL(ref.url).hostname.replace('www.', '')}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>↗</span>
              </a>
            ))}
          </div>
        </section>

        {/* Nav: prev/next */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => navigate('/concepts')}
            style={{
              background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '8px 16px', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← All Concepts
          </button>
          {(() => {
            const idx = CONCEPTS.findIndex(c => c.id === id);
            const next = CONCEPTS[idx + 1];
            if (!next) return <div />;
            return (
              <button
                onClick={() => navigate(`/concepts/${next.id}`)}
                style={{
                  background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '8px 16px', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {next.title} →
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
