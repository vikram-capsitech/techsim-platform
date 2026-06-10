import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  getLessonTheory,
  getLessonQuiz,
  getTheoryTrack,
  type QuizQuestion,
} from '../data/content/index';

// ── Shared primitives ────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace",
      fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
      color: '#7C3AED', marginBottom: 10, marginTop: 24,
    }}>
      {children}
    </div>
  );
}

function HighlightBox({ icon, label, children, color = '#7C3AED' }: {
  icon: string; label: string; children: React.ReactNode; color?: string;
}) {
  return (
    <div style={{
      background: color + '0D',
      border: `1px solid ${color}30`,
      borderRadius: 10, padding: '14px 16px', marginTop: 12,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        marginBottom: 8, fontSize: 11.5,
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 700, color, textTransform: 'uppercase' as const, letterSpacing: '0.06em',
      }}>
        <span>{icon}</span> {label}
      </div>
      <div style={{ fontSize: 13.5, color: '#94A3B8', lineHeight: 1.65 }}>
        {children}
      </div>
    </div>
  );
}

// ── Quiz component ───────────────────────────────────────────────────────────

function QuizSection({
  questions,
  onComplete,
}: {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);
  const [showResult, setShowResult] = useState(false);

  if (!questions.length) {
    return (
      <div style={{
        padding: '20px', background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
        fontSize: 13, color: '#64748B', fontFamily: "'IBM Plex Mono', monospace",
        textAlign: 'center' as const,
      }}>
        Quiz questions will appear here once content is loaded.
      </div>
    );
  }

  const q = questions[current];
  const totalAnswered = answers.length;

  if (showResult) {
    const score = answers.filter(a => a.correct).length;
    const passed = score >= 4;
    return (
      <div style={{
        background: passed ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
        border: `1px solid ${passed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        borderRadius: 12, padding: '24px', textAlign: 'center' as const,
      }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>{passed ? '🎉' : '📚'}</div>
        <div style={{
          fontSize: 22, fontWeight: 700, color: passed ? '#22C55E' : '#EF4444',
          fontFamily: "'DM Sans', sans-serif", marginBottom: 6,
        }}>
          {score}/{questions.length} correct
        </div>
        <div style={{ fontSize: 13, color: '#64748B', fontFamily: "'IBM Plex Mono', monospace", marginBottom: 20 }}>
          {passed ? 'Great work! Lesson complete.' : 'Review the material and try again.'}
        </div>
        <button
          onClick={() => onComplete(score)}
          style={{
            padding: '10px 24px', borderRadius: 8,
            background: passed ? 'rgba(34,197,94,0.15)' : 'rgba(124,58,237,0.15)',
            border: `1px solid ${passed ? 'rgba(34,197,94,0.4)' : 'rgba(124,58,237,0.4)'}`,
            color: passed ? '#22C55E' : '#A78BFA',
            fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {passed ? 'Complete Lesson →' : 'Retry Quiz'}
        </button>
      </div>
    );
  }

  const handleSelect = (optionId: string) => {
    if (selected !== null) return;
    setSelected(optionId);
  };

  const handleNext = () => {
    if (selected === null) return;
    const correct = selected === q.correctOptionId;
    const newAnswers = [...answers, { correct }];
    setAnswers(newAnswers);

    if (current + 1 >= questions.length) {
      setShowResult(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  };

  return (
    <div>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{
          fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
          color: '#64748B', textTransform: 'uppercase' as const, letterSpacing: '0.06em',
        }}>
          Question {current + 1} of {questions.length}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              width: 20, height: 4, borderRadius: 2,
              background: i < totalAnswered
                ? answers[i].correct ? '#22C55E' : '#EF4444'
                : i === current ? '#7C3AED' : 'rgba(255,255,255,0.1)',
            }} />
          ))}
        </div>
      </div>

      {/* Question */}
      <div style={{
        fontSize: 15, fontWeight: 600, color: '#E2E8F0',
        lineHeight: 1.55, marginBottom: 18,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {q.question}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {q.options.map(opt => {
          const isSelected = selected === opt.id;
          const isCorrect = opt.id === q.correctOptionId;
          const revealed = selected !== null;
          let bg = 'rgba(255,255,255,0.03)';
          let border = 'rgba(255,255,255,0.08)';
          let color = '#94A3B8';
          if (revealed) {
            if (isCorrect) { bg = 'rgba(34,197,94,0.08)'; border = 'rgba(34,197,94,0.4)'; color = '#22C55E'; }
            else if (isSelected) { bg = 'rgba(239,68,68,0.08)'; border = 'rgba(239,68,68,0.4)'; color = '#EF4444'; }
          } else if (isSelected) {
            bg = 'rgba(124,58,237,0.12)'; border = 'rgba(124,58,237,0.5)'; color = '#A78BFA';
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              style={{
                textAlign: 'left' as const, padding: '12px 14px',
                background: bg, border: `1px solid ${border}`, borderRadius: 8,
                color, fontSize: 13.5, cursor: revealed ? 'default' : 'pointer',
                transition: 'all 0.12s', lineHeight: 1.45,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {selected && (
        <div style={{
          background: 'rgba(124,58,237,0.06)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: 8, padding: '12px 14px', marginBottom: 16,
          fontSize: 12.5, color: '#94A3B8', lineHeight: 1.6,
        }}>
          <span style={{ color: '#A78BFA', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>
            Explanation:{' '}
          </span>
          {q.explanation}
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={selected === null}
        style={{
          padding: '10px 22px', borderRadius: 8,
          background: selected ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${selected ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.07)'}`,
          color: selected ? '#A78BFA' : '#475569',
          fontSize: 13.5, fontWeight: 600, cursor: selected ? 'pointer' : 'default',
          fontFamily: "'DM Sans', sans-serif", transition: 'all 0.12s',
        }}
      >
        {current + 1 >= questions.length ? 'Finish Quiz' : 'Next →'}
      </button>
    </div>
  );
}

// ── LessonPage ───────────────────────────────────────────────────────────────

export function LessonPage() {
  const { trackId = '', lessonId = '' } = useParams<{ trackId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [quizStarted, setQuizStarted] = useState(false);
  const [lessonDone, setLessonDone] = useState(false);

  const theory = getLessonTheory(trackId, lessonId);
  const track = getTheoryTrack(trackId);
  const questions = getLessonQuiz(lessonId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId]);

  const handleQuizComplete = (score: number) => {
    if (score >= 4) {
      setLessonDone(true);
      try {
        const stored = JSON.parse(localStorage.getItem('techsim_learn_completed') || '[]') as string[];
        if (!stored.includes(lessonId)) {
          stored.push(lessonId);
          localStorage.setItem('techsim_learn_completed', JSON.stringify(stored));
        }
      } catch { /* ignore */ }
    }
  };

  if (!theory) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', gap: 16,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ fontSize: 36 }}>📖</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
          Lesson content coming soon
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
          {trackId} / {lessonId}
        </div>
        <Link
          to="/learn"
          style={{
            marginTop: 8, padding: '9px 20px', borderRadius: 8,
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.4)',
            color: '#A78BFA', fontSize: 13, textDecoration: 'none',
          }}
        >
          ← Back to Learning Paths
        </Link>
      </div>
    );
  }

  // Find next/prev lessons in track
  const trackLessons = track?.lessons ?? [];
  const currentIdx = trackLessons.findIndex(l => l.id === lessonId);
  const nextLesson = currentIdx >= 0 && currentIdx + 1 < trackLessons.length
    ? trackLessons[currentIdx + 1]
    : null;

  return (
    <div style={{
      flex: 1, overflowY: 'auto', background: 'var(--bg)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        maxWidth: 800, margin: '0 auto', padding: '32px 24px 64px',
      }}>
        {/* Breadcrumb */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace",
          color: '#64748B', marginBottom: 24,
        }}>
          <Link to="/learn" style={{ color: '#64748B', textDecoration: 'none' }}>
            Learning Paths
          </Link>
          <span>›</span>
          <span style={{ color: '#94A3B8' }}>{track?.title ?? trackId}</span>
          <span>›</span>
          <span style={{ color: '#A78BFA' }}>{theory.title}</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 28, fontWeight: 700, color: '#E2E8F0',
          letterSpacing: '-0.02em', margin: '0 0 8px',
        }}>
          {theory.title}
        </h1>

        {/* Theory content */}
        <div style={{
          fontSize: 14.5, color: '#94A3B8', lineHeight: 1.75,
          marginTop: 24,
        }}>
          <ReactMarkdown>{theory.content}</ReactMarkdown>
        </div>

        {/* Key Points */}
        {theory.keyPoints?.length > 0 && (
          <>
            <SectionHeading>Key Points</SectionHeading>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {theory.keyPoints.map((pt, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5 }}>
                  <span style={{ color: '#7C3AED', flexShrink: 0, marginTop: 4, fontSize: 8 }}>◆</span>
                  <span style={{ color: '#94A3B8', lineHeight: 1.55 }}>{pt}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Analogy */}
        {theory.analogy && (
          <HighlightBox icon="💡" label="Analogy" color="#F59E0B">
            {theory.analogy}
          </HighlightBox>
        )}

        {/* Real World Example */}
        {theory.realWorldExample && (
          <HighlightBox icon="🌍" label="Real World Example" color="#06B6D4">
            {theory.realWorldExample}
          </HighlightBox>
        )}

        {/* Canvas Exercise */}
        {theory.exercise && (
          <>
            <SectionHeading>Canvas Exercise</SectionHeading>
            <div style={{
              background: 'rgba(124,58,237,0.06)',
              border: '1px dashed rgba(124,58,237,0.35)',
              borderRadius: 10, padding: '16px 18px',
            }}>
              <div style={{ fontSize: 13.5, color: '#94A3B8', lineHeight: 1.6, marginBottom: 14 }}>
                {theory.exercise}
              </div>
              <button
                onClick={() => navigate('/canvas')}
                style={{
                  padding: '8px 18px', borderRadius: 7,
                  background: 'rgba(124,58,237,0.18)',
                  border: '1px solid rgba(124,58,237,0.45)',
                  color: '#A78BFA', fontSize: 12.5, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Open Canvas →
              </button>
            </div>
          </>
        )}

        {/* Quiz */}
        <div style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <SectionHeading>Knowledge Check</SectionHeading>
            {!quizStarted && questions.length > 0 && (
              <button
                onClick={() => setQuizStarted(true)}
                style={{
                  padding: '7px 16px', borderRadius: 7,
                  background: 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.4)',
                  color: '#A78BFA', fontSize: 12.5, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Start Quiz ({questions.length} questions)
              </button>
            )}
          </div>
          {quizStarted ? (
            <QuizSection questions={questions} onComplete={handleQuizComplete} />
          ) : (
            <div style={{
              padding: '18px', background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
              fontSize: 13, color: '#475569', fontFamily: "'IBM Plex Mono', monospace",
              textAlign: 'center' as const,
            }}>
              {questions.length > 0
                ? `${questions.length} questions ready — click Start Quiz when you're done reading.`
                : 'Quiz questions will load once content is added.'}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: 48, paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          <Link
            to="/learn"
            style={{
              padding: '10px 20px', borderRadius: 8,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#64748B', fontSize: 13, textDecoration: 'none',
            }}
          >
            ← Back to Tracks
          </Link>

          {nextLesson && (
            <Link
              to={`/learn/${trackId}/${nextLesson.id}`}
              style={{
                padding: '10px 20px', borderRadius: 8,
                background: lessonDone ? 'rgba(34,197,94,0.12)' : 'rgba(124,58,237,0.12)',
                border: `1px solid ${lessonDone ? 'rgba(34,197,94,0.4)' : 'rgba(124,58,237,0.35)'}`,
                color: lessonDone ? '#22C55E' : '#A78BFA',
                fontSize: 13, textDecoration: 'none',
              }}
            >
              Next: {nextLesson.title} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
