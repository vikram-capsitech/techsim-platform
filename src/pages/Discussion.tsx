import { FeedbackSection } from '../components/FeedbackForm';

export function Discussion() {
  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      background: 'var(--bg)',
    }}>
      <div style={{
        maxWidth: 780,
        margin: '0 auto',
        padding: '40px 24px',
        color: 'var(--text)',
      }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--text)',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '-0.02em',
          }}>
            Discussion
          </h1>
          <p style={{
            margin: '6px 0 0',
            fontSize: 13.5,
            color: 'var(--text-dim)',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Connect with us, suggest feature improvements, or report issues to help shape TechSim
          </p>
        </div>

        <FeedbackSection />
      </div>
    </div>
  );
}
