import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHALLENGES } from '../data/challenges';

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy:   '#22C55E',
  Medium: '#F59E0B',
  Hard:   '#EF4444',
};

export function InterviewPage() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)', padding: '2rem', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Interview Mode
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 13.5, margin: 0, fontFamily: "'IBM Plex Mono', monospace" }}>
          Timed system design challenges with real requirements, hints, and AI feedback
        </p>
      </div>

      {/* Info bar */}
      <div style={{
        background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 10, padding: '12px 18px', marginBottom: '2rem',
        display: 'flex', gap: 24, flexWrap: 'wrap',
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
      }}>
        {[
          { icon: '⏱', text: '45–60 minute timer per challenge' },
          { icon: '💡', text: '3 hints available (cost points)' },
          { icon: '🤖', text: 'AI follow-up questions after submission' },
          { icon: '📊', text: 'Architecture score on completion' },
        ].map(item => (
          <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-dim)' }}>
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Challenge cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {CHALLENGES.map(ch => {
          const isHov = hovered === ch.id;
          const diffColor = DIFFICULTY_COLORS[ch.difficulty];
          return (
            <div
              key={ch.id}
              onMouseEnter={() => setHovered(ch.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: 'var(--card-bg)',
                border: `1px solid ${isHov ? diffColor + '60' : 'var(--border)'}`,
                borderRadius: 14, overflow: 'hidden',
                transform: isHov ? 'translateY(-3px)' : 'none',
                transition: 'border-color 0.2s, transform 0.15s, box-shadow 0.2s',
                boxShadow: isHov ? `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${diffColor}20` : 'none',
              }}
            >
              {/* Top accent bar */}
              <div style={{ height: 3, background: diffColor, opacity: isHov ? 1 : 0.4, transition: 'opacity 0.2s' }} />

              <div style={{ padding: '18px 20px 20px' }}>
                {/* Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 5, fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 700,
                    background: diffColor + '18', border: `1px solid ${diffColor}35`, color: diffColor,
                  }}>
                    {ch.difficulty}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                    ⏱ {ch.timeLimit} min
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                    💡 {ch.hints.length} hints
                  </span>
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 10px', color: 'var(--text)' }}>
                  {ch.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '0 0 14px', lineHeight: 1.6 }}>
                  {ch.description.slice(0, 140)}…
                </p>

                {/* Scale */}
                <div style={{
                  background: 'var(--bg)', borderRadius: 7, padding: '8px 12px',
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
                  marginBottom: 16,
                }}>
                  {[
                    { label: 'Scale', value: ch.scale.users },
                    { label: 'RPS', value: ch.scale.rps.split(',')[0] },
                    { label: 'Storage', value: ch.scale.storage },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text)', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 16 }}>
                  {ch.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace",
                      padding: '2px 7px', borderRadius: 4,
                      background: 'var(--panel-bg)', border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/interview/${ch.id}`)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                    background: diffColor, color: 'white', cursor: 'pointer',
                    fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Start Challenge →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
