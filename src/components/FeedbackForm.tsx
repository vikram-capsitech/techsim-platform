import { useState } from 'react';

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';
type Priority = 'low' | 'medium' | 'high';

const TYPE_OPTIONS: { key: FeedbackType; label: string; desc: string }[] = [
  { key: 'bug',         label: '🐛 Bug Report',     desc: 'Something is broken'   },
  { key: 'feature',     label: '✨ Feature Request', desc: 'I want something new'  },
  { key: 'improvement', label: '⚡ Improvement',     desc: 'Make existing better'  },
  { key: 'other',       label: '💬 Other',           desc: 'General feedback'      },
];

const PRIORITY_OPTIONS: { key: Priority; label: string }[] = [
  { key: 'low',    label: '🟢 Low'    },
  { key: 'medium', label: '🟡 Medium' },
  { key: 'high',   label: '🔴 High'   },
];

// ── Floating trigger button ───────────────────────────────────────────────────

export function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          zIndex: 999,
          background: '#7C3AED',
          color: 'white',
          border: 'none',
          borderRadius: 24,
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 4px 20px rgba(124,58,237,0.45)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#6D28D9';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(124,58,237,0.6)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#7C3AED';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.45)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        💬 Feedback
      </button>

      {open && <FeedbackModal onClose={() => setOpen(false)} />}
    </>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [type,        setType]        = useState<FeedbackType>('feature');
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [email,       setEmail]       = useState('');
  const [priority,    setPriority]    = useState<Priority>('medium');
  const [submitted,   setSubmitted]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');

  const submit = async () => {
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type, title: title.trim(), description: description.trim(),
          email: email.trim() || undefined,
          priority,
          page: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Server error');
      setSubmitted(true);
    } catch {
      setError('Could not submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Overlay
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 500,
          background: '#0D0D10',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 14,
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
          fontFamily: "'DM Sans', sans-serif",
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <SuccessView onClose={onClose} />
        ) : (
          <FormView
            type={type} setType={setType}
            title={title} setTitle={setTitle}
            description={description} setDescription={setDescription}
            email={email} setEmail={setEmail}
            priority={priority} setPriority={setPriority}
            submitting={submitting} error={error}
            onSubmit={submit} onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

function SuccessView({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ padding: '48px 32px', textAlign: 'center' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
      <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.02em' }}>
        Thank you!
      </h3>
      <p style={{ margin: '0 0 6px', fontSize: 14, color: '#64748B' }}>
        Your feedback helps us build a better platform.
      </p>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: '#64748B' }}>
        We read every submission.
      </p>
      <button
        onClick={onClose}
        style={{
          padding: '8px 24px', borderRadius: 8,
          background: 'var(--accent, #7C3AED)', border: 'none',
          color: 'white', fontSize: 14, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          cursor: 'pointer',
        }}
      >
        Close
      </button>
    </div>
  );
}

interface FormViewProps {
  type: FeedbackType; setType: (t: FeedbackType) => void;
  title: string; setTitle: (s: string) => void;
  description: string; setDescription: (s: string) => void;
  email: string; setEmail: (s: string) => void;
  priority: Priority; setPriority: (p: Priority) => void;
  submitting: boolean; error: string;
  onSubmit: () => void; onClose: () => void;
}

function FormView({
  type, setType, title, setTitle, description, setDescription,
  email, setEmail, priority, setPriority,
  submitting, error, onSubmit, onClose,
}: FormViewProps) {
  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 8,
    color: '#E2E8F0',
    fontSize: 13.5,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  return (
    <>
      {/* Header */}
      <div style={{
        padding: '18px 20px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.02em' }}>
          💬 Share Your Feedback
        </h3>
        <button
          onClick={onClose}
          style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#64748B', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Type selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {TYPE_OPTIONS.map(opt => {
            const active = type === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setType(opt.key)}
                style={{
                  padding: '9px 12px', borderRadius: 8, textAlign: 'left',
                  border: `1px solid ${active ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.07)'}`,
                  background: active ? 'rgba(124,58,237,0.14)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer', transition: 'all 0.12s',
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 600, color: active ? '#A78BFA' : '#94A3B8', marginBottom: 2 }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 11, color: '#475569' }}>{opt.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Priority */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#64748B', fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0 }}>
            Priority:
          </span>
          {PRIORITY_OPTIONS.map(opt => {
            const active = priority === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setPriority(opt.key)}
                style={{
                  padding: '4px 10px', borderRadius: 6,
                  border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: active ? '#E2E8F0' : '#64748B',
                  fontSize: 12, cursor: 'pointer',
                  fontFamily: "'IBM Plex Mono', monospace",
                  transition: 'all 0.12s',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Title */}
        <input
          placeholder="Short title (e.g. Simulation crashes when no nodes)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={inputStyle}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
        />

        {/* Description */}
        <textarea
          placeholder={
            type === 'bug'
              ? 'Describe what happened and steps to reproduce:\n1.\n2.\n3.'
              : 'Describe your feedback in detail...'
          }
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={5}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Your email (optional — for follow-up)"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
        />

        {error && (
          <div style={{
            padding: '8px 12px', borderRadius: 7,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            fontSize: 12.5, color: '#FCA5A5',
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={!title.trim() || !description.trim() || submitting}
          style={{
            padding: '10px 20px', borderRadius: 9, border: 'none',
            background: !title.trim() || !description.trim() ? 'rgba(124,58,237,0.3)' : '#7C3AED',
            color: 'white', fontSize: 14, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: !title.trim() || !description.trim() ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            transition: 'all 0.15s',
            boxShadow: '0 0 14px rgba(124,58,237,0.25)',
          }}
        >
          {submitting ? 'Sending…' : 'Send Feedback →'}
        </button>

        <p style={{ margin: 0, fontSize: 11, color: '#334155', textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace" }}>
          We read every submission. High-priority bugs are fixed within 48 hours.
        </p>
      </div>
    </>
  );
}
