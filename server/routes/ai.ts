import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { callAI } from '../lib/ai';
import Scenario from '../models/Scenario';

const router = Router();

function extractJSON(text: string): string {
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  
  let start = -1;
  let end = -1;
  
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
    end = text.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    start = firstBracket;
    end = text.lastIndexOf(']');
  }
  
  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1);
  }
  return text;
}

const SYSTEM_PROMPT = `You are a principal engineer at a top tech company with 15 years of experience designing large-scale distributed systems. When given a system description, generate a DEEP, REALISTIC architecture — not a basic tutorial diagram. Think like an experienced architect who has operated these systems at scale.

Think like this:
- Uber driver tracking: use H3 Geo-Grid indexing, Redis Sorted Sets for spatial queries, Kafka for ingestion, WebSocket proxy for real-time updates, Cassandra for historical trip data
- Netflix streaming: use multi-CDN strategy, adaptive bitrate, separate recommendation service with ML pipeline, Kafka for play events, Cassandra for viewing history, Elasticsearch for content discovery
- Twitter feed: use fan-out-on-write for normal users, fan-out-on-read for celebrities (hybrid approach), Redis sorted sets for timeline, Kafka for real-time event processing, separate media service with CDN

Always include:
1. The RIGHT database for the use case (Cassandra/timeseries-db for time-series, Redis for cache, PostgreSQL/postgres for transactional, Elasticsearch/elastic for search — not just "database")
2. Message queues (kafka or rabbitmq) where async processing makes sense
3. Caching strategy — Redis node connected between compute and database layers
4. CDN for any system serving static assets or media
5. WAF before any internet-facing entry point
6. Monitoring node (prometheus or grafana) connected to key services
7. At least one specialized component that shows deep knowledge (H3 indexing, bloom filters, consistent hashing, write-ahead log, etc.)

Return ONLY valid raw JSON — absolutely no explanation, no markdown, no code blocks, no backticks. Just the raw JSON object.

Return this exact structure:
{
  "nodes": [
    {
      "id": "node_1",
      "type": "techNode",
      "position": { "x": number, "y": number },
      "style": { "width": 210 },
      "data": {
        "label": string,
        "icon": string,
        "category": "network"|"compute"|"data"|"messaging"|"infrastructure"|"monitoring",
        "nodeTypeId": "client"|"cdn"|"dns"|"waf"|"load-balancer"|"api-gateway"|"router"|"firewall"|"microservice"|"api-server"|"lambda"|"worker"|"auth-service"|"rate-limiter"|"postgres"|"mysql"|"mongodb"|"redis"|"elastic"|"s3"|"data-warehouse"|"timeseries-db"|"kafka"|"rabbitmq"|"sqs"|"event-bus"|"docker"|"kubernetes"|"prometheus"|"grafana"|"jaeger"|"log-agg",
        "status": "healthy",
        "replicas": number,
        "capacity": number,
        "latency": number
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "type": "glowEdge",
      "source": "node_1",
      "target": "node_2",
      "data": {
        "protocol": "http"|"database"|"cache"|"queue",
        "color": "#06B6D4",
        "invalid": false,
        "edgeType": "bezier"
      }
    }
  ]
}

Icon values to use for each nodeTypeId:
- client → "monitor", cdn → "cloud", dns → "globe", waf → "shield", load-balancer → "git-branch", api-gateway → "door-open", router → "router", firewall → "flame"
- microservice → "cpu", api-server → "server", lambda → "zap", worker → "settings", auth-service → "lock", rate-limiter → "gauge"
- postgres → "database", mysql → "database", mongodb → "layers", redis → "layers", elastic → "search", s3 → "hard-drive", timeseries-db → "activity", data-warehouse → "database"
- kafka → "send", rabbitmq → "send", sqs → "send", event-bus → "send"
- docker → "box", kubernetes → "hexagon", prometheus → "bar-chart", grafana → "bar-chart-2", jaeger → "git-branch", log-agg → "file-text"

Capacity values by node type (use realistic numbers):
- Load Balancer: capacity 100000 (100K RPS)
- API Gateway: capacity 50000
- Microservice (single instance): capacity 8000
- Redis Cache: capacity 500000 (500K ops/sec)
- Kafka: capacity 1000000 (1M msgs/sec)
- PostgreSQL: capacity 10000 (10K QPS)
- MongoDB: capacity 30000
- Cassandra/timeseries-db: capacity 50000 (50K ops/sec)
- Elasticsearch: capacity 20000
- S3: capacity 5000
- CDN: capacity 500000
- WAF: capacity 200000
- API Server: capacity 5000
- Worker: capacity 2000

Latency values (milliseconds):
- CDN/Redis: 2-5ms, Load Balancer: 3ms, API Gateway: 8ms, Microservices: 20-40ms, Databases: 10-50ms, Kafka: 10ms, S3: 80ms

Layout positioning rules — follow these x positions exactly:
- Client browser/mobile: x=60, y=300
- CDN: x=60, y=120
- DNS: x=60, y=480
- WAF: x=280, y=300
- Load Balancer: x=500, y=300
- API Gateway: x=720, y=300
- Microservices: x=940, spread y from 80 to 520 (gap 120 between each)
- Cache (Redis): x=1160, y=160
- Primary Database: x=1160, y=320
- Secondary Database or data warehouse: x=1160, y=480
- Message Queue (Kafka/RabbitMQ): x=1380, y=300
- Worker/consumer services: x=1600, y=300
- Monitoring (Prometheus/Grafana): x=940, y=600
- CDN/S3 for media: x=1380, y=120

Architecture rules:
- ALWAYS include a WAF for any internet-facing system
- ALWAYS include Load Balancer before multiple microservices
- ALWAYS include Redis Cache before Database for read-heavy systems
- ALWAYS include API Gateway for microservices architecture
- Minimum 10 nodes, maximum 18 nodes
- Every node must have at least one edge connecting it — never leave isolated nodes
- Use "database" protocol color for DB edges, "cache" for Redis edges, "queue" for messaging edges, "http" for everything else
- Monitoring connects TO services (monitoring scrapes them) — use "http" protocol edges
- Kafka/RabbitMQ consumers connect FROM queue TO worker services`;


router.post('/generate', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { prompt } = req.body;
  const customGroqKey = req.headers['x-groq-api-key'] as string | undefined;
  const customGeminiKey = req.headers['x-gemini-api-key'] as string | undefined;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const raw = await callAI(prompt, SYSTEM_PROMPT, 4096, customGroqKey, customGeminiKey);
    const cleaned = extractJSON(raw);
    const diagram = JSON.parse(cleaned);

    if (!diagram.nodes || !diagram.edges) {
      return res.status(500).json({ error: 'Invalid diagram structure returned' });
    }

    res.json(diagram);
  } catch (err) {
    if (err instanceof SyntaxError) {
      res.status(500).json({ error: 'Failed to parse diagram from AI response' });
    } else {
      next(err);
    }
  }
});

// POST /api/ai/simulation-report — generate a professional architecture simulation report
router.post('/simulation-report', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      architectureName, duration, peakRPS, avgP99,
      totalErrors, bottlenecks, nodeMetrics, chaosEvents
    } = req.body;

    // Validate inputs
    if (!architectureName || duration === undefined || peakRPS === undefined || avgP99 === undefined || totalErrors === undefined || !bottlenecks || !nodeMetrics || !chaosEvents) {
      return res.status(400).json({ error: 'Missing required simulation report fields' });
    }

    const prompt = `
    Generate a professional architecture simulation report for a senior engineering audience.
    
    Architecture: ${architectureName}
    Simulation Duration: ${duration} seconds
    Peak RPS: ${peakRPS}
    Average P99 Latency: ${avgP99}ms
    Total Errors: ${totalErrors}
    Bottlenecks: ${bottlenecks.join(', ')}
    
    Component Metrics:
    ${nodeMetrics.map((n: any) => `- ${n.name}: avg ${n.avgLoad}% load, peak ${n.peakLoad}%, error rate ${(n.errorRate*100).toFixed(2)}%`).join('\n')}
    
    Chaos Events:
    ${chaosEvents.map((e: any) => `- ${e.type} on ${e.targetName} at ${e.timeSeconds}s, recovered in ${e.recoveryTime}s`).join('\n')}
    
    Write a report with these sections:
    ## Executive Summary
    ## Performance Analysis
    ## Bottleneck Deep Dive
    ## Resilience Assessment (based on chaos events)
    ## Capacity Planning
    ## Top 5 Recommendations (prioritized by impact)
    ## Architecture Score (out of 100 with breakdown)
    
    Be specific, use real engineering terminology.
    Reference specific components by name.
    Include concrete numbers and thresholds.
    Format as clean markdown.
  `;

    const systemPrompt = 'You are a principal systems architect with 20 years experience. Write technical reports that are detailed, accurate, and actionable. Use markdown formatting.';
    const customGroqKey = req.headers['x-groq-api-key'] as string | undefined;
    const customGeminiKey = req.headers['x-gemini-api-key'] as string | undefined;

    const reportContent = await callAI(prompt, systemPrompt, 2000, customGroqKey, customGeminiKey);
    res.json({ report: reportContent });
  } catch (error) {
    next(error);
  }
});

// ── Wizard: generate architecture from requirements ──────────────────────────
router.post('/wizard', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  let response = '';
  try {
    const { systemType, description, scale, priorities, availability,
            consistency, budget, cloudProvider, compliance } = req.body;

    const prompt = `
    You are a principal systems architect. Based on these requirements, generate
    a production-ready system architecture as JSON.

    System Type: ${systemType}
    Description: ${description || 'Not provided'}
    Scale: ${scale?.dau ? scale.dau + ' DAU' : ''}, ${scale?.rps ? scale.rps + ' RPS' : ''}, ${scale?.storage ? scale.storage + ' storage' : ''}
    Top Priorities: ${priorities?.join(', ')}
    Availability Target: ${availability}
    Consistency: ${consistency}
    Budget: ${budget}
    Cloud Provider: ${cloudProvider}
    Compliance: ${compliance?.join(', ') || 'None'}

    Generate a DEEP, REALISTIC architecture. Not basic tutorial stuff.
    Think like a senior engineer who has built this at scale.

    Return ONLY raw JSON with this structure:
    {
      "nodes": [
        {
          "id": "node_1",
          "type": "techNode",
          "position": { "x": number, "y": number },
          "style": { "width": 210 },
          "data": {
            "label": string,
            "icon": string,
            "category": "network"|"compute"|"data"|"messaging"|"infrastructure"|"monitoring",
            "nodeTypeId": "client"|"cdn"|"dns"|"waf"|"load-balancer"|"api-gateway"|"router"|"firewall"|"microservice"|"api-server"|"lambda"|"worker"|"auth-service"|"rate-limiter"|"postgres"|"mysql"|"mongodb"|"redis"|"elastic"|"s3"|"data-warehouse"|"timeseries-db"|"kafka"|"rabbitmq"|"sqs"|"event-bus"|"docker"|"kubernetes"|"prometheus"|"grafana"|"jaeger"|"log-agg",
            "status": "healthy",
            "replicas": number,
            "capacity": number,
            "latency": number
          }
        }
      ],
      "edges": [
        {
          "id": "edge_1",
          "type": "glowEdge",
          "source": "node_1",
          "target": "node_2",
          "data": {
            "protocol": "http"|"database"|"cache"|"queue",
            "color": string,
            "invalid": false,
            "edgeType": "bezier"
          }
        }
      ],
      "summary": "2-3 sentence explanation of key decisions",
      "keyDecisions": ["Why X over Y", "Why Z pattern", ...]
    }

    Position nodes left-to-right: client(x=80) → gateway(x=280) → services(x=480) → data(x=680)
    Include monitoring layer.
    For ${cloudProvider} provider, use cloud-specific services where appropriate.
    Minimum 8 nodes, maximum 16.
    
    Return ONLY valid raw JSON — absolutely no explanation, no markdown, no code blocks, no backticks. Just the raw JSON object.
  `;

    const customGroqKey = req.headers['x-groq-api-key'] as string | undefined;
    const customGeminiKey = req.headers['x-gemini-api-key'] as string | undefined;

    response = await callAI(prompt, 'You are a principal systems architect. Return only valid JSON.', 4096, customGroqKey, customGeminiKey);
    const cleaned = extractJSON(response);
    const diagram = JSON.parse(cleaned);

    if (!diagram.nodes || !diagram.edges) {
      return res.status(500).json({ error: 'Invalid diagram structure returned' });
    }

    res.json(diagram);
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error('Wizard JSON parsing failed. Raw response was:', response);
      console.error(err);
      res.status(500).json({ error: 'Failed to parse diagram from AI response', details: err.message, raw: response });
    } else {
      next(err);
    }
  }
});

// ── Validate: review system architecture and identify issues ─────────────────
router.post('/validate', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { nodes, edges, requirements } = req.body;

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return res.status(400).json({ error: 'nodes and edges are required arrays' });
    }

    const architectureDesc = nodes.map(n =>
      `${n.data?.label || 'unnamed'} (${n.data?.nodeType || n.data?.nodeTypeId || 'unknown'}, replicas: ${n.data?.replicas || 1}, capacity: ${n.data?.capacity || 1000} RPS)`
    ).join('\n');

    const connectionDesc = edges.map(e => {
      const src = nodes.find(n => n.id === e.source)?.data?.label || 'unknown';
      const tgt = nodes.find(n => n.id === e.target)?.data?.label || 'unknown';
      return `${src} → ${tgt} (${e.data?.protocol || 'HTTP'})`;
    }).join('\n');

    const prompt = `
    Review this system architecture and identify issues:

    COMPONENTS:
    ${architectureDesc}

    CONNECTIONS:
    ${connectionDesc}

    Requirements/Context:
    ${requirements ? JSON.stringify(requirements) : 'Not specified'}

    Return JSON array of issues:
    [{ "severity": "critical|warning|info", "title": "short title",
       "description": "detailed explanation with WHY it matters",
       "recommendation": "specific fix" }]

    Focus on: security vulnerabilities, single points of failure,
    scalability bottlenecks, missing components, wrong connection patterns.
    Return ONLY the JSON array.
  `;
    const customGroqKey = req.headers['x-groq-api-key'] as string | undefined;
    const customGeminiKey = req.headers['x-gemini-api-key'] as string | undefined;

    const response = await callAI(prompt, 'You are a security and scalability expert. Return only JSON.', 2000, customGroqKey, customGeminiKey);
    const cleaned = extractJSON(response);
    res.json({ aiIssues: JSON.parse(cleaned) });
  } catch (err) {
    if (err instanceof SyntaxError) {
      res.status(500).json({ error: 'Failed to parse validation issues from AI response' });
    } else {
      next(err);
    }
  }
});

// ── Chat: interactive Q&A about the architecture ──────────────────────────────
router.post('/chat', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message, architectureContext, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const ctx = architectureContext || {
      nodeCount: 0,
      components: [],
      hasLoadBalancer: false,
      hasCache: false,
      hasQueue: false,
      hasMonitoring: false
    };

    const systemPrompt = `You are a senior systems architect with 15 years experience.
  The user is asking about their architecture which has:
  - ${ctx.nodeCount || 0} components
  - Components: ${(ctx.components || []).map((c: any) => c.name || c.label).join(', ')}
  - Has Load Balancer: ${!!ctx.hasLoadBalancer}
  - Has Cache: ${!!ctx.hasCache}
  - Has Queue: ${!!ctx.hasQueue}
  - Has Monitoring: ${!!ctx.hasMonitoring}

  Be specific. Reference their actual components by name.
  Give concrete numbers and real-world examples (Netflix does X, Uber uses Y).
  Keep responses under 200 words unless the question requires more detail.
  Format with clear paragraphs, no markdown headers.`;

    const formattedHistory = Array.isArray(conversationHistory) && conversationHistory.length > 0
      ? conversationHistory.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n\n')
      : '';

    const fullPrompt = formattedHistory
      ? `Conversation History:\n${formattedHistory}\n\nUser: ${message}`
      : message;
    const customGroqKey = req.headers['x-groq-api-key'] as string | undefined;
    const customGeminiKey = req.headers['x-gemini-api-key'] as string | undefined;

    const response = await callAI(fullPrompt, systemPrompt, 1000, customGroqKey, customGeminiKey);
    res.json({ response });
  } catch (err) {
    console.error('[/api/ai/chat] error:', err);
    const detail = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'AI service unavailable', detail });
  }
});

// ── Recommend: suggest best-fit tools/technologies ────────────────────────────
router.post('/recommend', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { category, requirements, existingComponents } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'category is required' });
    }

    const prompt = `
    Recommend the best ${category} for this system:
    Requirements: ${JSON.stringify(requirements || {})}
    Existing components: ${existingComponents?.join(', ') || 'None'}

    Return JSON: { "recommended": "tool name", "reason": "why", "alternatives": [...] }
  `;
    const customGroqKey = req.headers['x-groq-api-key'] as string | undefined;
    const customGeminiKey = req.headers['x-gemini-api-key'] as string | undefined;

    const response = await callAI(prompt, 'You are a database and infrastructure expert. Return only JSON.', 1000, customGroqKey, customGeminiKey);
    const cleaned = extractJSON(response);
    res.json(JSON.parse(cleaned));
  } catch (err) {
    if (err instanceof SyntaxError) {
      res.status(500).json({ error: 'Failed to parse recommendation from AI response' });
    } else {
      next(err);
    }
  }
});

// POST /api/ai/interview-feedback — score system design interview solution
router.post('/interview-feedback', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { challengeId, nodes, edges, timeUsed, hintsUsed } = req.body;

    if (!challengeId || !nodes || !edges) {
      return res.status(400).json({ error: 'challengeId, nodes, and edges are required' });
    }

    let scenarioContext = '';
    try {
      const scenario = await Scenario.findById(challengeId);
      if (scenario) {
        scenarioContext = `
Challenge Title: ${scenario.title}
Challenge Target Description: ${scenario.description}
Difficulty: ${scenario.difficulty}
`;
      }
    } catch (err) {
      // Ignore invalid ObjectId or not found
    }

    const architectureDesc = nodes.map((n: any) =>
      `- ${n.data?.label || 'unnamed'} (${n.data?.nodeType || n.data?.nodeTypeId || 'unknown'}, replicas: ${n.data?.replicas || 1}, capacity: ${n.data?.capacity || 1000} RPS)`
    ).join('\n');

    const connectionDesc = edges.map((e: any) => {
      const src = nodes.find((n: any) => n.id === e.source)?.data?.label || 'unknown';
      const tgt = nodes.find((n: any) => n.id === e.target)?.data?.label || 'unknown';
      return `- ${src} → ${tgt} (${e.data?.protocol || 'HTTP'})`;
    }).join('\n');

    const prompt = `
    Grade the candidate's whiteboard architecture simulation:
    ${scenarioContext || `Challenge ID: ${challengeId}`}

    Candidate's stats:
    Time Used: ${timeUsed !== undefined ? timeUsed + ' seconds' : 'Not specified'}
    Hints Used: ${hintsUsed !== undefined ? hintsUsed : 0}

    Proposed Architecture Details:
    Components (Nodes):
    ${architectureDesc || 'None'}

    Connections (Edges):
    ${connectionDesc || 'None'}

    Evaluate the architecture against the following rubric (score out of 100 for each):
    1. Functional Requirements: Did they build the right flow/structure for the target scenario?
    2. Non-Functional Requirements: Are throughput, latency, reliability, and security handled correctly?
    3. Component Selection: Did they select appropriate technologies (databases, messaging, caching, gateway, etc.)?
    4. Connection Patterns: Are connection directions, protocols, and layers logically valid?
    5. Scalability: Did they handle scaling mechanisms, failover, redundancy, and capacity correctly?

    Return ONLY valid raw JSON with this exact structure (no backticks, no code blocks, no other text):
    {
      "rubricScores": {
        "functionalRequirements": number,
        "nonFunctionalRequirements": number,
        "componentSelection": number,
        "connectionPatterns": number,
        "scalability": number
      },
      "verdict": "Pass" | "Conditional Pass" | "Fail",
      "strengths": ["string"],
      "improvements": ["string"]
    }
    `;

    const systemPrompt = 'You are a principal systems architect grading whiteboard interviews. Be critical, specific, and detailed. Return only the JSON object.';
    const customGroqKey = req.headers['x-groq-api-key'] as string | undefined;
    const customGeminiKey = req.headers['x-gemini-api-key'] as string | undefined;

    const response = await callAI(prompt, systemPrompt, 2000, customGroqKey, customGeminiKey);
    const cleaned = extractJSON(response);
    res.json(JSON.parse(cleaned));
  } catch (error) {
    if (error instanceof SyntaxError) {
      res.status(500).json({ error: 'Failed to parse interview feedback from AI response' });
    } else {
      next(error);
    }
  }
});

export default router;
