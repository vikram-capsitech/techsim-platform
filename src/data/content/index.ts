import knowledgeData from './knowledgeCards.json';
import theoryData from './theoryTracks.json';
import quizData from './quizQuestions.json';
import scenarioData from './presetScenarios.json';
import chaosData from './chaosScenarios.json';

// ── Knowledge Cards ──────────────────────────────────────────────────────────

export interface KnowledgeCard {
  componentId: string;
  name: string;
  category?: string;
  tagline: string;
  whatItDoes: string;
  whenToUse: string[];
  whenNotToUse: string[];
  realWorldUsage: { company: string; useCase: string }[];
  keyMetrics: { throughput: string; latency: string; typicalCost: string };
  commonMistakes: string[];
  interviewTips: string;
}

export function getKnowledgeCard(componentId: string): KnowledgeCard | undefined {
  const components = (knowledgeData as { components: KnowledgeCard[] }).components;
  if (!components?.length) return undefined;
  // Normalize hyphens and spaces to underscores (canvas uses kebab, JSON uses snake_case)
  const normalized = componentId.toLowerCase().replace(/[-\s]+/g, '_');
  return components.find(
    c => c.componentId === componentId || c.componentId === normalized,
  );
}

// ── Theory Tracks ────────────────────────────────────────────────────────────

export interface TheoryLesson {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  analogy: string;
  realWorldExample: string;
  exercise: string;
}

export interface TheoryTrack {
  trackId: string;
  title: string;
  lessons: TheoryLesson[];
}

export function getLessonTheory(trackId: string, lessonId: string): TheoryLesson | undefined {
  const rawTracks = (theoryData as any).tracks;
  const track = rawTracks?.find((t: any) => t.trackId === trackId);
  const lesson = track?.lessons.find((l: any) => l.id === lessonId);
  if (!lesson) return undefined;
  return {
    id: lesson.id,
    title: lesson.title,
    content: lesson.theory,
    keyPoints: lesson.keyPoints,
    analogy: lesson.analogy,
    realWorldExample: lesson.example,
    exercise: lesson.theory.includes('## Apply it') ? lesson.theory.split('## Apply it')[1]?.trim() : ''
  };
}

export function getTheoryTrack(trackId: string): TheoryTrack | undefined {
  const rawTracks = (theoryData as any).tracks;
  const track = rawTracks?.find((t: any) => t.trackId === trackId);
  if (!track) return undefined;
  return {
    trackId: track.trackId,
    title: track.title,
    lessons: track.lessons.map((lesson: any) => ({
      id: lesson.id,
      title: lesson.title,
      content: lesson.theory,
      keyPoints: lesson.keyPoints,
      analogy: lesson.analogy,
      realWorldExample: lesson.example,
      exercise: lesson.theory.includes('## Apply it') ? lesson.theory.split('## Apply it')[1]?.trim() : ''
    }))
  };
}

// ── Quiz Questions ───────────────────────────────────────────────────────────

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface LessonQuiz {
  lessonId: string;
  questions: QuizQuestion[];
}

export function getLessonQuiz(lessonId: string): QuizQuestion[] {
  const lessons = (quizData as any).lessons;
  const lesson = lessons?.find((l: any) => l.lessonId === lessonId);
  if (!lesson) return [];
  return lesson.questions.map((q: any) => {
    const options = q.options.map((opt: any, idx: number) => {
      const optionId = String.fromCharCode(65 + idx);
      return typeof opt === 'string' ? { id: optionId, text: opt } : opt;
    });

    let correctOptionId = q.correct;
    if (typeof q.correct === 'string' && q.correct.length > 2) {
      const found = options.find((o: any) => o.text === q.correct);
      if (found) correctOptionId = found.id;
    }

    return {
      id: q.id,
      question: q.question,
      options,
      correctOptionId,
      explanation: q.explanation
    };
  });
}

// ── Preset Scenarios ─────────────────────────────────────────────────────────

export interface PresetScenario {
  id: string;
  title: string;
  difficulty: string;
  domain: string;
  learningObjectives?: string[];
  commonInterviewQuestion: string;
  keyDecisions?: { decision: string; reason: string }[];
  interestingFacts?: string[];
  components?: string[];
}

export function getAllScenarios(): PresetScenario[] {
  return ((scenarioData as { scenarios: PresetScenario[] }).scenarios ?? []);
}

export function getScenariosByDifficulty(difficulty: string): PresetScenario[] {
  return getAllScenarios().filter(s => s.difficulty === difficulty);
}

// ── Chaos Explanations ───────────────────────────────────────────────────────

export interface ChaosExplanation {
  id: string;
  name: string;
  whatHappens: string;
  userImpact: string;
  cascadeEffects: string[];
  recoverySteps: string[];
  preventionStrategies?: string[];
  realWorldExample?: string;
  interviewAngle: string;
}

// Maps CHAOS_SCENARIOS kebab IDs → JSON underscore IDs
const CHAOS_ID_MAP: Record<string, string> = {
  'node-crash':       'node_crash',
  'dc-failure':       'data_center_failure',
  'disk-failure':     'disk_full',
  'cpu-spike':        'cpu_spike',
  'memory-leak':      'memory_leak',
  'slowdown':         'latency_spike',
  'net-partition':    'network_partition',
  'packet-loss':      'packet_loss',
  'latency-spike':    'latency_spike',
  'bw-throttle':      'network_partition',
  'dns-failure':      'dns_failure',
  'tls-expiry':       'tls_cert_expiry',
  'traffic-surge':    'traffic_surge_10x',
  'ddos-flood':       'ddos_flood',
  'thundering-herd':  'thundering_herd',
  'retry-storm':      'retry_storm',
  'thread-exhaustion':'thread_pool_exhaustion',
  'deadlock':         'deadlock',
  'gc-pause':         'gc_pause',
  'config-drift':     'config_drift',
  'db-primary-fail':  'primary_db_failure',
  'replication-lag':  'replication_lag',
  'conn-pool-exhaust':'connection_pool_exhausted',
  'cache-eviction':   'cache_eviction',
  'third-party-fail': 'third_party_api_down',
  'auth-down':        'auth_service_down',
  'queue-full':       'queue_full',
};

export function getChaosExplanation(chaosId: string): ChaosExplanation | undefined {
  const jsonId = CHAOS_ID_MAP[chaosId] ?? chaosId.replace(/-/g, '_');
  const scenarios = (chaosData as { scenarios: ChaosExplanation[] }).scenarios;
  return scenarios?.find(s => s.id === jsonId);
}
