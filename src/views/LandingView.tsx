import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  GitBranch,
  Globe2,
  Network,
  Play,
  Pause,
  Flame,
  RefreshCw,
  AlertTriangle,
  Cpu,
  BookOpen,
  Layers,
  Sparkles,
  Shield,
  Loader2,
  Award,
} from 'lucide-react';

const STATS = [
  ['169', 'Component Nodes'],
  ['30', 'Chaos Scenarios'],
  ['245', 'Theory Quizzes'],
  ['20', 'Starter Presets'],
];

const PLATFORM_OFFERINGS = [
  {
    icon: Network,
    title: 'Visual HLD Canvas',
    description: 'Drag and drop from over 169 custom nodes. Wire them up using precise protocols like HTTP, WebSockets, gRPC, and PostgreSQL TCP.',
    badge: 'Active Sandbox',
  },
  {
    icon: Flame,
    title: 'Chaos Injection',
    description: 'Trigger split-brain partitions, inject network latency, crash container nodes, or spike load to test routing resilience.',
    badge: 'Interactive Lab',
  },
  {
    icon: Bot,
    title: 'AI Architect Reviews',
    description: 'Get real-time feedback on single points of failure, scaling bottlenecks, database caching, and cloud costs directly from Llama 3.',
    badge: 'Co-Pilot',
  },
  {
    icon: BookOpen,
    title: 'System Design Curriculum',
    description: 'Learn distributed concepts step-by-step: CAP Theorem, Consistent Hashing, Database Sharding, Saga Pattern, and primary-replica replication.',
    badge: 'Academy',
  },
  {
    icon: Cpu,
    title: 'Cloud Cost Estimator',
    description: 'See live monthly price calculations for AWS, GCP, and Azure as you scale node replicas and traffic volumes.',
    badge: 'Standard Feature',
  },
  {
    icon: Layers,
    title: 'Low-Level Design (LLD)',
    description: 'Design interactive ERDs, define REST APIs, generate database schemas, and map out UML class/sequence diagrams.',
    badge: 'Standard Feature',
  },
];

const FEATURE_ROADMAP = [
  {
    id: 'hld_complete',
    title: 'Interactive Design Sandbox',
    status: 'available',
    details: 'Infinite canvas workspace, tool selection modal, connection validation rules, pre-simulation gates, and live packet flow animations.',
  },
  {
    id: 'chaos_lab',
    title: 'Chaos Engineering Laboratory',
    status: 'available',
    details: 'Trigger database failures, split-brain partitions, network drops, or gateway latency and trace cascading effects.',
  },
  {
    id: 'academy_lessons',
    title: 'Distributed Systems Academy',
    status: 'available',
    details: '7 curriculum paths containing 49 lessons, interactive CAP and sharding visualizers, and quiz tracks.',
  },
  {
    id: 'lld_suite',
    title: 'Low-Level Design (LLD) Suite',
    status: 'in production',
    details: 'Visual ERD schema builder with DDL export, API REST/GraphQL endpoint config, UML Class maps, and PlantUML builders.',
  },
  {
    id: 'realtime_collab',
    title: 'Real-Time CRDT Collaboration',
    status: 'planned',
    details: 'Multi-user collaborative canvas editing and whiteboarding using conflict-free replicated data types (Yjs) and PartyKit.',
  },
  {
    id: 'devops_iac',
    title: 'DevOps & IaC Generators',
    status: 'planned',
    details: 'Automated Terraform HCL, Kubernetes YAML, and docker-compose.yml configuration generators derived from canvas topologies.',
  },
];

export function LandingView() {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const { register } = useAuth();

  // Guest session loading state
  const [isRegisteringGuest, setIsRegisteringGuest] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  // Simulation controls in Welcome Visual
  const [simRunning, setSimRunning] = useState(true);
  const [chaosState, setChaosState] = useState<'none' | 'db_crash' | 'split_brain' | 'latency_spike'>('none');
  const [queueCount, setQueueCount] = useState(0);
  const [metrics, setMetrics] = useState({ rps: 2450, latency: 42, errorRate: 0 });

  // System Design Scaling animation state
  const [scaleReplicas, setScaleReplicas] = useState(1);
  const [scaleActive, setScaleActive] = useState(false);

  // Cyber Attack Section state
  const [attackBlockedCount, setAttackBlockedCount] = useState(0);

  // AI Code section state
  const [aiStep, setAiStep] = useState(0);
  const [aiTypingText, setAiTypingText] = useState('');

  // Academy quiz section state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizSuccess, setQuizSuccess] = useState<boolean | null>(null);

  // Guest login execution
  const handleGuestSession = useCallback(async () => {
    setIsRegisteringGuest(true);
    setGuestError(null);
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const guestUser = `guest_${randomId}`;
    const guestEmail = `guest_${Date.now()}_${randomId}@systemcraft.io`;
    try {
      await register(guestUser, guestEmail, 'GuestPassword123');
      navigate('/canvas', { replace: true });
    } catch (err) {
      console.error('Guest registration failed:', err);
      setGuestError('Could not start guest session. Please register manually.');
      setIsRegisteringGuest(false);
    }
  }, [register, navigate]);

  // Color mappings based on theme
  const colors = useMemo(() => {
    const isDark = resolvedTheme === 'dark';
    return {
      bg: isDark ? '#07070a' : '#f9fafb',
      text: isDark ? '#f3f4f6' : '#111827',
      textDim: isDark ? '#9ca3af' : '#4b5563',
      textMuted: isDark ? '#6b7280' : '#9ca3af',
      border: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      borderBright: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.18)',
      cardBg: isDark ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.7)',
      cardHover: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.95)',
      panelBg: isDark ? 'rgba(10, 10, 15, 0.85)' : 'rgba(255, 255, 255, 0.9)',
      sectionAlt: isDark ? '#0a0a0f' : '#f3f4f6',
      dotColor: isDark ? 'rgba(148, 163, 184, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      shadow: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.05)',
      glow: isDark ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.05)',
    };
  }, [resolvedTheme]);

  // Fluctuating simulator metrics
  useEffect(() => {
    if (!simRunning) return;
    const interval = setInterval(() => {
      setMetrics((prev) => {
        if (chaosState === 'db_crash') {
          setQueueCount((q) => Math.min(100, q + 3));
          return {
            rps: Math.max(900, Math.floor(prev.rps - 100 + Math.random() * 80)),
            latency: Math.min(2800, prev.latency + Math.floor(Math.random() * 200)),
            errorRate: Math.min(65, prev.errorRate + Math.random() * 5),
          };
        } else if (chaosState === 'split_brain') {
          setQueueCount(0);
          return {
            rps: Math.max(0, Math.floor(prev.rps - 400)),
            latency: 0,
            errorRate: Math.min(100, prev.errorRate + 15),
          };
        } else if (chaosState === 'latency_spike') {
          setQueueCount((q) => Math.min(100, q + 1));
          return {
            rps: Math.max(1600, Math.floor(prev.rps - 50 + Math.random() * 60)),
            latency: Math.min(3200, prev.latency + Math.floor(Math.random() * 150)),
            errorRate: Math.min(18, prev.errorRate + Math.random() * 1.5),
          };
        } else {
          // Normal state
          setQueueCount((q) => Math.max(0, q - 2));
          return {
            rps: Math.floor(2400 + Math.random() * 100),
            latency: Math.floor(38 + Math.random() * 8),
            errorRate: Math.max(0, Math.min(0.05, prev.errorRate + (Math.random() * 0.01 - 0.005))),
          };
        }
      });
    }, 800);

    return () => clearInterval(interval);
  }, [simRunning, chaosState]);

  // Triggering simulation state
  const handleChaosState = (type: typeof chaosState) => {
    if (chaosState === type) {
      setChaosState('none');
    } else {
      setChaosState(type);
      if (type === 'db_crash') {
        setMetrics({ rps: 2200, latency: 120, errorRate: 5 });
      } else if (type === 'split_brain') {
        setMetrics({ rps: 1200, latency: 0, errorRate: 20 });
      } else if (type === 'latency_spike') {
        setMetrics({ rps: 2300, latency: 80, errorRate: 1 });
      }
    }
  };

  // Scaling Loop for System Design visual
  useEffect(() => {
    const interval = setInterval(() => {
      setScaleActive(true);
      setTimeout(() => {
        setScaleReplicas((r) => (r === 3 ? 1 : r + 1));
        setScaleActive(false);
      }, 500);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Cyber Attack blocked loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAttackBlockedCount((c) => c + 1);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // AI Generator typing loop
  useEffect(() => {
    const prompts = [
      'Create high-throughput Kafka pipeline with Consumer scaling...',
      'Deploy PostgreSQL cluster with one active master and two read-replicas...',
      'Build client API Gateway that routes to Redis Cache cluster...'
    ];
    let promptIndex = 0;
    let charIndex = 0;
    let typing = true;

    const interval = setInterval(() => {
      const currentPrompt = prompts[promptIndex];
      if (typing) {
        setAiTypingText(currentPrompt.substring(0, charIndex + 1));
        charIndex++;
        if (charIndex >= currentPrompt.length) {
          typing = false;
          setAiStep(1); // triggers diagram reveal
          setTimeout(() => {
            setAiStep(2); // triggers connection drawing
          }, 1000);
        }
      } else {
        // Wait and delete
        setTimeout(() => {
          typing = true;
          setAiStep(0);
          charIndex = 0;
          promptIndex = (promptIndex + 1) % prompts.length;
        }, 3000);
        typing = true;
      }
    }, 75);

    return () => clearInterval(interval);
  }, []);

  const handleAnswerSubmit = (ans: string) => {
    setSelectedAnswer(ans);
    setQuizSuccess(ans === 'b');
  };

  return (
    <main
      style={{
        flex: 1,
        width: '100%',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: colors.bg,
        color: colors.text,
        fontFamily: "'DM Sans', sans-serif",
        transition: 'background-color 0.3s, color 0.3s',
      }}
    >
      <style>{`
        /* Packet motion animation */
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shieldWave {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes floatNode {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .hero-packet-circle {
          animation: pulseGlow 1.5s ease-in-out infinite;
        }
        .landing-card {
          border: 1px solid ${colors.border};
          background: ${colors.cardBg};
          box-shadow: 0 4px 24px ${colors.shadow};
          backdrop-filter: blur(12px);
          transition: all 0.2s ease-in-out;
        }
        .landing-card:hover {
          border-color: ${colors.borderBright};
          transform: translateY(-2px);
        }
        .btn-theme {
          background: #7C3AED;
          color: white;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-theme:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(124, 58, 237, 0.35);
        }
        .btn-theme-outline {
          background: ${colors.cardBg};
          border: 1px solid ${colors.borderBright};
          color: ${colors.text};
          transition: all 0.2s ease;
        }
        .btn-theme-outline:hover {
          background: ${colors.cardHover};
          border-color: ${colors.text};
        }
        @media (max-width: 960px) {
          .welcome-grid { grid-template-columns: 1fr !important; text-align: center; }
          .welcome-actions { justify-content: center !important; }
          .welcome-title { font-size: 52px !important; }
          .visual-columns { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .interactive-flow-bg { display: none !important; }
        }
      `}</style>

      {/* Decorative Dot Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${colors.dotColor} 1.2px, transparent 1.2px)`,
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* SECTION 1: WELCOME / HERO (Large Animation Background) */}
      <section
        style={{
          position: 'relative',
          minHeight: '94vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px 60px',
          overflow: 'hidden',
        }}
      >
        {/* Large Immersive SVGs & Network Mesh Background */}
        <div
          className="interactive-flow-bg"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            opacity: resolvedTheme === 'dark' ? 0.8 : 0.6,
            pointerEvents: 'none',
          }}
        >
          <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
            {/* Background glowing links */}
            <g opacity="0.3">
              <path d="M 100,400 L 300,200" stroke={resolvedTheme === 'dark' ? '#06B6D4' : '#0EA5E9'} strokeWidth="1.5" />
              <path d="M 100,400 L 300,600" stroke="#EF4444" strokeWidth="1.5" />
              <path d="M 300,200 L 500,200" stroke="gray" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M 300,200 L 600,400" stroke={resolvedTheme === 'dark' ? '#8B5CF6' : '#6D28D9'} strokeWidth="1.5" />
              <path d="M 300,600 L 600,400" stroke="gray" strokeWidth="1.5" />
              <path d="M 600,400 L 800,250" stroke={resolvedTheme === 'dark' ? '#10B981' : '#059669'} strokeWidth="1.5" />
              <path d="M 600,400 L 800,550" stroke="gray" strokeWidth="1.2" />
              <path d="M 800,250 L 1050,400" stroke={resolvedTheme === 'dark' ? '#10B981' : '#059669'} strokeWidth="1.8" />
              <path d="M 800,550 L 1050,400" stroke="gray" strokeWidth="1" />
            </g>

            {/* Continuous SVG Animated Packets */}
            {simRunning && (
              <g>
                {/* Path 1: Client to API (Cyan) */}
                <circle r="4" fill="#06B6D4" className="hero-packet-circle">
                  <animateMotion dur="3.5s" repeatCount="indefinite" path="M 100,400 L 300,200 L 600,400" />
                </circle>

                {/* Path 2: Client to Queue (Red Attack/Alert packets during chaos) */}
                <circle r="4" fill={chaosState !== 'none' ? '#EF4444' : '#06B6D4'} className="hero-packet-circle">
                  <animateMotion dur="4.2s" repeatCount="indefinite" path="M 100,400 L 300,600 L 600,400" />
                </circle>

                {/* Path 3: API Gateway to Cache/Database (Purple/Green) */}
                {chaosState !== 'db_crash' && (
                  <circle r="3.5" fill="#10B981" className="hero-packet-circle">
                    <animateMotion dur="2.8s" repeatCount="indefinite" path="M 600,400 L 800,250 L 1050,400" />
                  </circle>
                )}

                <circle r="3.5" fill="#8B5CF6" className="hero-packet-circle">
                  <animateMotion dur="3.2s" repeatCount="indefinite" path="M 600,400 L 800,550 L 1050,400" />
                </circle>
              </g>
            )}

            {/* foreignObject components for real icons */}
            <foreignObject x="68" y="368" width="64" height="64" style={{ animation: 'floatNode 5s ease-in-out infinite' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#06B6D4' }}>
                <Globe2 size={24} />
                <span style={{ fontSize: 9, color: colors.textDim, fontWeight: 'bold', marginTop: 4 }}>Client</span>
              </div>
            </foreignObject>

            <foreignObject x="268" y="168" width="64" height="64" style={{ animation: 'floatNode 6s ease-in-out infinite' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#8B5CF6' }}>
                <Cpu size={24} />
                <span style={{ fontSize: 9, color: colors.textDim, fontWeight: 'bold', marginTop: 4 }}>Gateway</span>
              </div>
            </foreignObject>

            <foreignObject x="268" y="568" width="64" height="64" style={{ animation: 'floatNode 7s ease-in-out infinite' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: chaosState !== 'none' ? '#EF4444' : '#9ca3af' }}>
                <GitBranch size={24} />
                <span style={{ fontSize: 9, color: colors.textDim, fontWeight: 'bold', marginTop: 4 }}>LB Node</span>
              </div>
            </foreignObject>

            <foreignObject x="568" y="368" width="64" height="64" style={{ animation: 'floatNode 4.5s ease-in-out infinite' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#7C3AED' }}>
                <Cpu size={26} />
                <span style={{ fontSize: 9, color: colors.textDim, fontWeight: 'bold', marginTop: 4 }}>API Pool</span>
              </div>
            </foreignObject>

            <foreignObject x="768" y="218" width="64" height="64" style={{ animation: 'floatNode 5.5s ease-in-out infinite' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: chaosState === 'db_crash' ? '#EF4444' : '#10B981' }}>
                <Database size={24} />
                <span style={{ fontSize: 9, color: colors.textDim, fontWeight: 'bold', marginTop: 4 }}>Postgres</span>
              </div>
            </foreignObject>

            <foreignObject x="768" y="518" width="64" height="64" style={{ animation: 'floatNode 6.5s ease-in-out infinite' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#F97316' }}>
                <Layers size={24} />
                <span style={{ fontSize: 9, color: colors.textDim, fontWeight: 'bold', marginTop: 4 }}>Kafka MQ</span>
              </div>
            </foreignObject>

            <foreignObject x="1018" y="368" width="64" height="64" style={{ animation: 'floatNode 5s ease-in-out infinite' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#06B6D4' }}>
                <Database size={24} />
                <span style={{ fontSize: 9, color: colors.textDim, fontWeight: 'bold', marginTop: 4 }}>Replicas</span>
              </div>
            </foreignObject>
          </svg>
        </div>

        {/* Hero Overlay Panel */}
        <div
          style={{
            width: '100%',
            maxWidth: 1200,
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: 24,
            alignItems: 'center',
            position: 'relative',
            zIndex: 10,
          }}
          className="welcome-grid"
        >
          {/* Welcome Text Left */}
          <div
            style={{
              textAlign: 'left',
              padding: '24px',
              borderRadius: 20,
              background: colors.panelBg,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 24px 64px ${colors.shadow}`,
              backdropFilter: 'blur(16px)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(124, 58, 237, 0.1)',
                border: '1px solid rgba(124, 58, 237, 0.25)',
                borderRadius: 99,
                padding: '6px 14px',
                marginBottom: 20,
              }}
            >
              <Sparkles size={13} color="#A78BFA" />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: '#A78BFA', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                System Design Sandbox
              </span>
            </div>

            <h1
              className="welcome-title"
              style={{
                fontSize: 62,
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                marginBottom: 20,
              }}
            >
              SystemCraft
              <span style={{ display: 'block', background: 'linear-gradient(90deg, #A78BFA 0%, #06B6D4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: 4 }}>
                Craft. Simulate. Defend.
              </span>
            </h1>

            <p style={{ fontSize: 16, lineHeight: 1.6, color: colors.textDim, marginBottom: 28, maxWidth: 540 }}>
              Design microservice stacks on an infinite canvas, trace active packet flows, inject chaos failures, and learn key distributed system architectures interactively.
            </p>

            {guestError && (
              <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', borderRadius: 6, fontSize: 12, marginBottom: 16 }}>
                ⚠️ {guestError}
              </div>
            )}

            <div className="welcome-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              {/* Try as Guest mode */}
              <button
                className="btn-theme"
                onClick={handleGuestSession}
                disabled={isRegisteringGuest}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  height: 48,
                  padding: '0 28px',
                  borderRadius: 10,
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: isRegisteringGuest ? 'not-allowed' : 'pointer',
                }}
              >
                {isRegisteringGuest ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Starting Guest Session…
                  </>
                ) : (
                  <>
                    Try as Guest (Instant)
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button
                className="btn-theme-outline"
                onClick={() => navigate('/register')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 46,
                  padding: '0 24px',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Create Account
              </button>
            </div>
            
            <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
              * Guest Mode bypasses sign-up, generating a temporary anonymous session workspace instantly.
            </div>

            {/* STATS rendering inside Welcome panel */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                borderTop: `1px solid ${colors.border}`,
                paddingTop: 20,
                marginTop: 20,
              }}
              className="stats-grid"
            >
              {STATS.map(([value, label]) => (
                <div key={label}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>{value}</div>
                  <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Real-Time Simulator Dashboard Widget Right */}
          <div className="landing-card" style={{ borderRadius: 16, padding: 18, background: colors.panelBg }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: simRunning ? '#10B981' : '#F59E0B' }} />
                <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: colors.textDim, fontWeight: 700 }}>
                  LIVE THREAT RADAR
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => setSimRunning(s => !s)}
                  style={{ background: 'none', border: 'none', color: colors.textDim, cursor: 'pointer', padding: 2, display: 'flex' }}
                >
                  {simRunning ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button
                  onClick={() => { setChaosState('none'); setMetrics({ rps: 2450, latency: 42, errorRate: 0 }); setQueueCount(0); }}
                  style={{ background: 'none', border: 'none', color: colors.textDim, cursor: 'pointer', padding: 2, display: 'flex' }}
                >
                  <RefreshCw size={11} style={{ animation: chaosState !== 'none' ? 'spinSlow 4s linear infinite' : 'none' }} />
                </button>
              </div>
            </div>

            {/* Micro metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, textAlign: 'center', marginBottom: 14 }}>
              <div style={{ background: colors.bg, padding: 6, borderRadius: 8, border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: 8.5, color: colors.textMuted }}>Throughput</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{metrics.rps} RPS</div>
              </div>
              <div style={{ background: colors.bg, padding: 6, borderRadius: 8, border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: 8.5, color: colors.textMuted }}>Latency</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{metrics.latency} ms</div>
              </div>
              <div style={{ background: colors.bg, padding: 6, borderRadius: 8, border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: 8.5, color: colors.textMuted }}>Error rate</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{metrics.errorRate.toFixed(1)}%</div>
              </div>
              <div style={{ background: colors.bg, padding: 6, borderRadius: 8, border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: 8.5, color: colors.textMuted }}>Queue</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{queueCount}%</div>
              </div>
            </div>

            {/* Mini triggers */}
            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: colors.textDim, marginBottom: 8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Flame size={12} color="#F59E0B" /> Click to Inject Failure
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                <button
                  onClick={() => handleChaosState('db_crash')}
                  style={{
                    fontSize: 10,
                    padding: '6px 2px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    border: chaosState === 'db_crash' ? '1px solid #EF4444' : `1px solid ${colors.borderBright}`,
                    background: chaosState === 'db_crash' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    color: chaosState === 'db_crash' ? '#EF4444' : colors.textDim,
                  }}
                >
                  Crash DB
                </button>
                <button
                  onClick={() => handleChaosState('split_brain')}
                  style={{
                    fontSize: 10,
                    padding: '6px 2px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    border: chaosState === 'split_brain' ? '1px solid #EF4444' : `1px solid ${colors.borderBright}`,
                    background: chaosState === 'split_brain' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    color: chaosState === 'split_brain' ? '#EF4444' : colors.textDim,
                  }}
                >
                  Split Brain
                </button>
                <button
                  onClick={() => handleChaosState('latency_spike')}
                  style={{
                    fontSize: 10,
                    padding: '6px 2px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    border: chaosState === 'latency_spike' ? '1px solid #F59E0B' : `1px solid ${colors.borderBright}`,
                    background: chaosState === 'latency_spike' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                    color: chaosState === 'latency_spike' ? '#F59E0B' : colors.textDim,
                  }}
                >
                  Spike Latency
                </button>
              </div>
            </div>

            {/* Alert Console */}
            {chaosState !== 'none' && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 12,
                  padding: 8,
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 8,
                  textAlign: 'left',
                }}
              >
                <AlertTriangle size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 10, color: '#EF4444', fontFamily: 'monospace' }}>
                  {chaosState === 'db_crash' && 'CRITICAL: POSTGRES_DOWN — queue buffering at 3x speed.'}
                  {chaosState === 'split_brain' && 'CRITICAL: PARTITION — LB routing packets dropped.'}
                  {chaosState === 'latency_spike' && 'WARNING: API_TIMEOUT — packet transmission slowed.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: PLATFORM OFFERINGS GRID */}
      <section style={{ borderTop: `1px solid ${colors.border}`, padding: '72px 24px', background: colors.sectionAlt }}>
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: colors.text, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Everything You Need in One Unified Sandbox
            </h2>
            <p style={{ fontSize: 16, color: colors.textDim, maxWidth: 620, margin: '0 auto' }}>
              SystemCraft provides interactive sandboxes, chaos simulators, AI companions, and learning paths.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {PLATFORM_OFFERINGS.map((offer) => {
              const Icon = offer.icon;
              return (
                <article key={offer.title} className="landing-card" style={{ borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={17} color="#8B5CF6" />
                    </div>
                    <span style={{ fontSize: 9.5, background: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.border}`, color: colors.textDim, padding: '2px 7px', borderRadius: 4, fontFamily: 'monospace', fontWeight: 600 }}>
                      {offer.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 8 }}>{offer.title}</h3>
                  <p style={{ fontSize: 13, color: colors.textDim, lineHeight: 1.5 }}>{offer.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: SYSTEM DESIGN (Background scale & round-robin animation) */}
      <section style={{ position: 'relative', borderTop: `1px solid ${colors.border}`, padding: '96px 24px', overflow: 'hidden' }}>
        {/* Scaling Animation Background */}
        <div style={{ position: 'absolute', right: '4%', top: '50%', transform: 'translateY(-50%)', width: '45%', height: '80%', opacity: resolvedTheme === 'dark' ? 0.75 : 0.5, pointerEvents: 'none' }}>
          <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%' }}>
            {/* Load balancer connections */}
            <path d="M 50,150 L 160,75" stroke="#9ca3af" strokeWidth="1.5" />
            <path d="M 50,150 L 160,150" stroke="#9ca3af" strokeWidth="1.5" />
            <path d="M 50,150 L 160,225" stroke="#9ca3af" strokeWidth="1.5" />

            {/* Load Balancer */}
            <circle cx="50" cy="150" r="24" fill={resolvedTheme === 'dark' ? '#0d0d12' : '#ffffff'} stroke="#06B6D4" strokeWidth="2" />
            <text x="50" y="153" textAnchor="middle" fill={colors.text} fontSize="9" fontWeight="bold">LB</text>

            {/* Server Replicas */}
            {/* Node 1 */}
            <g transform="translate(160,75)">
              <circle r="22" fill={resolvedTheme === 'dark' ? '#0d0d12' : '#ffffff'} stroke="#10B981" strokeWidth="2" />
              <text y="3" textAnchor="middle" fill={colors.text} fontSize="8" fontWeight="bold">Replica 1</text>
            </g>

            {/* Node 2 (Scales) */}
            {scaleReplicas >= 2 && (
              <g transform="translate(160,150)">
                <circle r="22" fill={resolvedTheme === 'dark' ? '#0d0d12' : '#ffffff'} stroke="#10B981" strokeWidth="2" />
                <text y="3" textAnchor="middle" fill={colors.text} fontSize="8" fontWeight="bold">Replica 2</text>
                {scaleActive && scaleReplicas === 2 && (
                  <circle r="34" fill="none" stroke="#10B981" strokeWidth="1.5" style={{ animation: 'shieldWave 0.5s ease-out forwards' }} />
                )}
              </g>
            )}

            {/* Node 3 (Scales) */}
            {scaleReplicas >= 3 && (
              <g transform="translate(160,225)">
                <circle r="22" fill={resolvedTheme === 'dark' ? '#0d0d12' : '#ffffff'} stroke="#10B981" strokeWidth="2" />
                <text y="3" textAnchor="middle" fill={colors.text} fontSize="8" fontWeight="bold">Replica 3</text>
                {scaleActive && scaleReplicas === 3 && (
                  <circle r="34" fill="none" stroke="#10B981" strokeWidth="1.5" style={{ animation: 'shieldWave 0.5s ease-out forwards' }} />
                )}
              </g>
            )}

            {/* Packet flows */}
            <circle r="3" fill="#06B6D4">
              <animateMotion dur="2s" repeatCount="indefinite" path="M 50,150 L 160,75" />
            </circle>
            {scaleReplicas >= 2 && (
              <circle r="3" fill="#06B6D4">
                <animateMotion dur="2.4s" repeatCount="indefinite" path="M 50,150 L 160,150" />
              </circle>
            )}
            {scaleReplicas >= 3 && (
              <circle r="3" fill="#06B6D4">
                <animateMotion dur="2.8s" repeatCount="indefinite" path="M 50,150 L 160,225" />
              </circle>
            )}
          </svg>
        </div>

        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div className="visual-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
            <div
              style={{
                padding: '32px',
                borderRadius: 16,
                background: colors.panelBg,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 8px 32px ${colors.shadow}`,
                zIndex: 10,
              }}
            >
              <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#06B6D4', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                Interactive Design Sandbox
              </span>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: colors.text, letterSpacing: '-0.02em', marginTop: 10, marginBottom: 14 }}>
                Model & Scale Replicas Dynamically
              </h2>
              <p style={{ fontSize: 15, color: colors.textDim, lineHeight: 1.6, marginBottom: 20 }}>
                Adjust node replica configurations directly in the workspace settings. Watch the load balancer automatically distribute client packet flows across active compute nodes.
              </p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'monospace' }}>Current Scale Visualized:</span>
                <span style={{ fontSize: 12, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10B981', color: '#10B981', padding: '3px 9px', borderRadius: 4, fontWeight: 700, fontFamily: 'monospace' }}>
                  {scaleReplicas} REPLICAS ACTIVE
                </span>
              </div>
            </div>
            {/* spacer for right SVG background in columns */}
            <div style={{ height: 280 }} className="interactive-flow-bg" />
          </div>
        </div>
      </section>

      {/* SECTION 4: CHAOS & CYBER ATTACKS (Background attack & shield block animation) */}
      <section style={{ position: 'relative', borderTop: `1px solid ${colors.border}`, padding: '96px 24px', background: colors.sectionAlt, overflow: 'hidden' }}>
        {/* Attack Animation Background */}
        <div style={{ position: 'absolute', left: '4%', top: '50%', transform: 'translateY(-50%)', width: '45%', height: '80%', opacity: resolvedTheme === 'dark' ? 0.75 : 0.5, pointerEvents: 'none' }}>
          <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%' }}>
            {/* Connection lines */}
            <path d="M 50,150 L 180,150" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 180,150 L 310,150" stroke="#10B981" strokeWidth="1.5" />

            {/* Hacker Node */}
            <g transform="translate(50,150)">
              <circle r="22" fill={resolvedTheme === 'dark' ? '#0d0d12' : '#ffffff'} stroke="#EF4444" strokeWidth="2" />
              <text y="3" textAnchor="middle" fill="#EF4444" fontSize="8" fontWeight="bold">Attacker</text>
            </g>

            {/* Web Application Firewall (WAF) */}
            <g transform="translate(180,150)">
              <circle r="24" fill={resolvedTheme === 'dark' ? '#0d0d12' : '#ffffff'} stroke="#8B5CF6" strokeWidth="2.5" />
              <Shield size={13} color="#8B5CF6" style={{ transform: 'translate(-6.5px, -6.5px)' }} />
              {/* Collision shield wave */}
              <circle r="32" fill="none" stroke="#EF4444" strokeWidth="1.5" style={{ animation: 'shieldWave 2.8s linear infinite' }} />
            </g>

            {/* Target Server Node */}
            <g transform="translate(310,150)">
              <circle r="22" fill={resolvedTheme === 'dark' ? '#0d0d12' : '#ffffff'} stroke="#10B981" strokeWidth="2" />
              <text y="3" textAnchor="middle" fill={colors.text} fontSize="8" fontWeight="bold">API Pool</text>
            </g>

            {/* Malicious Attack Packets (Collision and dissolve) */}
            <circle r="4" fill="#EF4444">
              <animateMotion dur="2.8s" repeatCount="indefinite" path="M 50,150 L 180,150" />
            </circle>

            {/* Blocked and Rerouted traffic */}
            <circle r="3" fill="#10B981">
              <animateMotion dur="2s" repeatCount="indefinite" path="M 180,150 L 310,150" />
            </circle>
          </svg>
        </div>

        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div className="visual-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
            {/* spacer for left SVG background in columns */}
            <div style={{ height: 280 }} className="interactive-flow-bg" />
            
            <div
              style={{
                padding: '32px',
                borderRadius: 16,
                background: colors.panelBg,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 8px 32px ${colors.shadow}`,
                zIndex: 10,
              }}
            >
              <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#EF4444', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                Cyber Attack & Chaos Lab
              </span>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: colors.text, letterSpacing: '-0.02em', marginTop: 10, marginBottom: 14 }}>
                Inject Cascading System Failures
              </h2>
              <p style={{ fontSize: 15, color: colors.textDim, lineHeight: 1.6, marginBottom: 20 }}>
                Crash active container databases or simulate network split brain partitions. Verify WAF shields block malicious scripts, and inspect how metrics like p99 latency respond to bottlenecks.
              </p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'monospace' }}>Attacks Blocked on Sandbox:</span>
                <span style={{ fontSize: 12, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #EF4444', color: '#EF4444', padding: '3px 9px', borderRadius: 4, fontWeight: 700, fontFamily: 'monospace' }}>
                  {attackBlockedCount} THREATS NEUTRALIZED
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: AI CO-PILOT (Background prompt builder animation) */}
      <section style={{ position: 'relative', borderTop: `1px solid ${colors.border}`, padding: '96px 24px', overflow: 'hidden' }}>
        {/* AI Drawing Animation Background */}
        <div style={{ position: 'absolute', right: '4%', top: '50%', transform: 'translateY(-50%)', width: '45%', height: '80%', opacity: resolvedTheme === 'dark' ? 0.75 : 0.5, pointerEvents: 'none' }}>
          <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%' }}>
            {/* Grid overlay */}
            <defs>
              <pattern id="aiGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={resolvedTheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#aiGrid)" />

            {/* Drawing steps */}
            {aiStep >= 1 && (
              <>
                {/* Node 1 */}
                <g transform="translate(80,150)">
                  <rect x="-24" y="-20" width="48" height="40" rx="6" fill={resolvedTheme === 'dark' ? '#0d0d12' : '#ffffff'} stroke="#8B5CF6" strokeWidth="2" />
                  <text y="4" textAnchor="middle" fill={colors.text} fontSize="9" fontWeight="bold">Nginx</text>
                </g>
                {/* Node 2 */}
                <g transform="translate(200,150)">
                  <rect x="-24" y="-20" width="48" height="40" rx="6" fill={resolvedTheme === 'dark' ? '#0d0d12' : '#ffffff'} stroke="#8B5CF6" strokeWidth="2" />
                  <text y="4" textAnchor="middle" fill={colors.text} fontSize="9" fontWeight="bold">Service</text>
                </g>
                {/* Node 3 */}
                <g transform="translate(320,150)">
                  <rect x="-24" y="-20" width="48" height="40" rx="6" fill={resolvedTheme === 'dark' ? '#0d0d12' : '#ffffff'} stroke="#8B5CF6" strokeWidth="2" />
                  <text y="4" textAnchor="middle" fill={colors.text} fontSize="9" fontWeight="bold">Redis</text>
                </g>
              </>
            )}

            {aiStep >= 2 && (
              <>
                {/* Connection lines drawing */}
                <path d="M 128,150 L 176,150" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="50" strokeDashoffset="0">
                  <animate attributeName="stroke-dashoffset" from="50" to="0" dur="0.8s" fill="freeze" />
                </path>
                <path d="M 248,150 L 296,150" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="50" strokeDashoffset="0">
                  <animate attributeName="stroke-dashoffset" from="50" to="0" dur="0.8s" fill="freeze" />
                </path>
              </>
            )}
          </svg>
        </div>

        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div className="visual-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
            <div
              style={{
                padding: '32px',
                borderRadius: 16,
                background: colors.panelBg,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 8px 32px ${colors.shadow}`,
                zIndex: 10,
              }}
            >
              <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#8B5CF6', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                AI Architect Co-Pilot
              </span>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: colors.text, letterSpacing: '-0.02em', marginTop: 10, marginBottom: 14 }}>
                Generate Topologies from Prompts
              </h2>
              <p style={{ fontSize: 15, color: colors.textDim, lineHeight: 1.6, marginBottom: 20 }}>
                Type your system requirements in natural language and watch our AI co-pilot dynamically draw nodes, configure properties, and hook up connection topologies on the canvas.
              </p>
              
              {/* Typing box visual */}
              <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#8B5CF6', fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>prompt:</span>
                <span style={{ fontSize: 12, color: colors.text, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {aiTypingText}
                  <span style={{ animation: 'cursorBlink 1s infinite', color: '#8B5CF6', fontWeight: 'bold' }}>|</span>
                </span>
              </div>
            </div>
            {/* spacer for right SVG background in columns */}
            <div style={{ height: 280 }} className="interactive-flow-bg" />
          </div>
        </div>
      </section>

      {/* SECTION 6: DESIGN ACADEMY & INTERACTIVE QUIZ */}
      <section style={{ position: 'relative', borderTop: `1px solid ${colors.border}`, padding: '96px 24px', background: colors.sectionAlt, overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div className="visual-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
            {/* Mini Interactive Quiz Left */}
            <div className="landing-card" style={{ borderRadius: 16, padding: '24px 28px', background: colors.panelBg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Award size={18} color="#10B981" />
                <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#10B981', fontWeight: 700 }}>
                  ACADEMY CHALLENGE
                </span>
              </div>

              <h4 style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 12 }}>
                In a network partition, what does a CP (Consistent / Partition tolerant) database do?
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <button
                  onClick={() => handleAnswerSubmit('a')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    border: selectedAnswer === 'a' ? '1px solid #EF4444' : `1px solid ${colors.border}`,
                    background: selectedAnswer === 'a' ? 'rgba(239,68,68,0.08)' : colors.bg,
                    color: colors.text,
                    transition: 'all 0.15s',
                  }}
                >
                  a) Sacrifices consistency to remain fully available to accept writes.
                </button>
                <button
                  onClick={() => handleAnswerSubmit('b')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    border: selectedAnswer === 'b' ? '1px solid #10B981' : `1px solid ${colors.border}`,
                    background: selectedAnswer === 'b' ? 'rgba(16,185,129,0.08)' : colors.bg,
                    color: colors.text,
                    transition: 'all 0.15s',
                  }}
                >
                  b) Refuses writes to guarantee consistency across all surviving nodes.
                </button>
              </div>

              {quizSuccess !== null && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: quizSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    border: quizSuccess ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                    fontSize: 12,
                    color: quizSuccess ? '#10B981' : '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {quizSuccess ? '✅ Correct! A CP database rejects updates on isolated nodes to protect data correctness.' : '❌ Incorrect. Re-read lesson 4.2: CAP theorem trade-offs.'}
                </div>
              )}
            </div>

            {/* Design Academy Copy Right */}
            <div style={{ zIndex: 10 }}>
              <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#10B981', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                Design Academy
              </span>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: colors.text, letterSpacing: '-0.02em', marginTop: 10, marginBottom: 14 }}>
                7 Curriculum Tracks & Guided Quizzes
              </h2>
              <p style={{ fontSize: 15, color: colors.textDim, lineHeight: 1.6, marginBottom: 20 }}>
                Close the loop between visuals and theory. Run curriculum lessons covering caching patterns, broker routing, and replica failover, complete checking quizzes, and earn distributed system badges.
              </p>
              <button
                className="btn-theme-outline"
                onClick={() => navigate('/learn')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 40,
                  padding: '0 18px',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Browse Academy Tracks
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: DETAILED ROADMAP (Features Offerings) */}
      <section style={{ borderTop: `1px solid ${colors.border}`, padding: '80px 24px 100px' }}>
        <div style={{ maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: colors.text, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Feature Roadmap & Future Milestones
            </h2>
            <p style={{ fontSize: 16, color: colors.textDim, maxWidth: 620, margin: '0 auto' }}>
              SystemCraft is evolving rapidly. Explore what is currently ready and what advanced features we are introducing next.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="roadmap-grid">
            {FEATURE_ROADMAP.map((item) => {
              const isCompleted = item.status === 'available';
              const isCurrent = item.status === 'in production';
              return (
                <div
                  key={item.id}
                  className="roadmap-card"
                  style={{
                    border: `1px solid ${isCurrent ? '#7C3AED' : colors.border}`,
                    background: isCurrent ? 'rgba(124,58,237,0.03)' : colors.cardBg,
                    borderRadius: 12,
                    padding: 20,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: isCompleted ? '#10B981' : isCurrent ? '#8B5CF6' : colors.textMuted }}>
                      {isCompleted ? 'AVAILABLE' : isCurrent ? 'IN PRODUCTION' : 'PLANNED'}
                    </span>
                    <span style={{ fontSize: 9, background: isCompleted ? 'rgba(16,185,129,0.1)' : isCurrent ? 'rgba(124,58,237,0.1)' : 'rgba(0,0,0,0.03)', color: isCompleted ? '#10B981' : isCurrent ? '#8B5CF6' : colors.textMuted, padding: '2px 7px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase' }}>
                      {item.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 8 }}>
                    {item.title}
                    {isCompleted && <CheckCircle2 size={14} color="#10B981" style={{ marginLeft: 6, display: 'inline', verticalAlign: 'middle' }} />}
                  </h3>
                  <p style={{ fontSize: 12.5, color: colors.textDim, lineHeight: 1.5 }}>{item.details}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer
        style={{
          borderTop: `1px solid ${colors.border}`,
          background: colors.sectionAlt,
          padding: '24px',
          textAlign: 'center',
          fontSize: 12,
          color: colors.textMuted,
        }}
      >
        <div>&copy; 2026 SystemCraft. All rights reserved. Crafting Distributed Systems Education.</div>
      </footer>
    </main>
  );
}
