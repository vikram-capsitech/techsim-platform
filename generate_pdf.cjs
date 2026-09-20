const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function generatePDF() {
  console.log('Generating high-quality documentation PDF...');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SystemCraft — Complete System Design Platform Documentation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

    @page {
      size: A4;
      margin: 18mm 16mm 20mm 16mm;
      @bottom-right {
        content: counter(page);
        font-family: 'JetBrains Mono', monospace;
        font-size: 8pt;
        color: #888;
      }
      @top-right {
        content: "SystemCraft Architecture Platform";
        font-family: 'Inter', sans-serif;
        font-size: 7.5pt;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a24;
      background: #ffffff;
      line-height: 1.6;
      font-size: 9.5pt;
      margin: 0;
      padding: 0;
    }

    /* Cover Page */
    .cover-page {
      page-break-after: always;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 40px;
      background: linear-gradient(145deg, #09090e 0%, #161626 50%, #0d0d18 100%);
      color: #ffffff;
      border-radius: 12px;
      margin-bottom: 20px;
    }

    .cover-badge {
      display: inline-block;
      background: rgba(124, 58, 237, 0.25);
      border: 1px solid rgba(167, 139, 250, 0.4);
      color: #c4b5fd;
      padding: 6px 14px;
      border-radius: 20px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 24px;
    }

    .cover-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 32pt;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin: 0 0 16px 0;
      background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 60%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .cover-subtitle {
      font-size: 14pt;
      color: #94a3b8;
      font-weight: 400;
      line-height: 1.5;
      max-width: 600px;
      margin-bottom: 32px;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      max-width: 550px;
    }

    .cover-meta-item {
      display: flex;
      flex-direction: column;
    }

    .cover-meta-label {
      font-size: 7.5pt;
      font-family: 'JetBrains Mono', monospace;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .cover-meta-val {
      font-size: 10pt;
      font-weight: 600;
      color: #f1f5f9;
      margin-top: 2px;
    }

    .cover-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5pt;
      color: #64748b;
    }

    /* Headings */
    h1, h2, h3, h4 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    h1 {
      font-size: 18pt;
      font-weight: 800;
      border-bottom: 2px solid #7c3aed;
      padding-bottom: 8px;
      margin-top: 28pt;
      margin-bottom: 14pt;
      page-break-after: avoid;
    }

    h2 {
      font-size: 13.5pt;
      font-weight: 700;
      color: #1e1b4b;
      margin-top: 18pt;
      margin-bottom: 8pt;
      page-break-after: avoid;
    }

    h3 {
      font-size: 11pt;
      font-weight: 600;
      color: #334155;
      margin-top: 14pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 8pt 0;
      color: #334155;
      text-align: justify;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12pt 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }

    th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      text-align: left;
      padding: 7px 10px;
      border: 1px solid #cbd5e1;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    td {
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
      color: #334155;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Callout Boxes */
    .callout {
      padding: 10px 14px;
      border-radius: 8px;
      margin: 10pt 0;
      page-break-inside: avoid;
      font-size: 9pt;
      border-left: 4px solid;
    }

    .callout-info {
      background: #f5f3ff;
      border-left-color: #7c3aed;
      color: #4c1d95;
    }

    .callout-success {
      background: #f0fdf4;
      border-left-color: #16a34a;
      color: #14532d;
    }

    .callout-warning {
      background: #fffbeb;
      border-left-color: #d97706;
      color: #78350f;
    }

    .callout-title {
      font-weight: 700;
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Code & Pre */
    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      background: #f1f5f9;
      color: #6b21a8;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    pre {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5pt;
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 14px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 10pt 0;
      line-height: 1.45;
      page-break-inside: avoid;
    }

    /* Lists */
    ul, ol {
      margin: 4pt 0 10pt 16pt;
      padding: 0;
      color: #334155;
    }

    li {
      margin-bottom: 3pt;
    }

    /* Diagrams & ASCII boxes */
    .diagram-container {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      margin: 12pt 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5pt;
      line-height: 1.35;
      color: #0f172a;
      page-break-inside: avoid;
      white-space: pre;
      overflow-x: hidden;
    }

    .status-badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 7pt;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
    }

    .badge-done { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-progress { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .badge-planned { background: #f3e8ff; color: #7e22ce; border: 1px solid #e9d5ff; }

    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div>
      <div class="cover-badge">System Architecture & Engineering Specification</div>
      <div class="cover-title">SystemCraft Platform</div>
      <div class="cover-subtitle">
        Comprehensive Documentation of the High Level Design (HLD) & Low Level Design (LLD) Simulation, Learning, and Architecture Platform
      </div>
    </div>

    <div class="cover-meta-grid">
      <div class="cover-meta-item">
        <span class="cover-meta-label">Project Codename</span>
        <span class="cover-meta-val">SystemCraft (TechSim)</span>
      </div>
      <div class="cover-meta-item">
        <span class="cover-meta-label">Architecture Version</span>
        <span class="cover-meta-val">v3.2 Production</span>
      </div>
      <div class="cover-meta-item">
        <span class="cover-meta-label">Stack</span>
        <span class="cover-meta-val">React 19, Express 5, MongoDB, Groq/Gemini</span>
      </div>
      <div class="cover-meta-item">
        <span class="cover-meta-label">Target Completion</span>
        <span class="cover-meta-val">Unified HLD & LLD Ecosystem</span>
      </div>
    </div>

    <div class="cover-footer">
      <span>Antigravity AI & SystemCraft Core Engineering Team</span>
      <span>Confidential & Proprietary</span>
    </div>
  </div>

  <!-- TABLE OF CONTENTS -->
  <h1>Table of Contents</h1>
  <ol style="font-size: 10pt; line-height: 1.8; margin-top: 14pt;">
    <li><strong>Executive Summary & System Overview</strong> — Platform mission, engineering philosophy, and full tech stack.</li>
    <li><strong>Complete Feature Catalog & Business Logic Deep-Dive</strong> — Detailed breakdown of all 14 platform subsystems, physics models, and code implementations.</li>
    <li><strong>Current Status & Feature Health Audit</strong> — Real-time validation of all routes, APIs, and resolved bugs.</li>
    <li><strong>High Level Design (HLD) Playground: Roadmap & Next Features</strong> — Cloud cost estimator, IaC exporter, and real-time collaboration.</li>
    <li><strong>Low Level Design (LLD) Playground: The Complete Blueprint</strong> — UML Class Diagrams, Database ERDs, API Contracts, Sequence Diagrams, and State Machines.</li>
    <li><strong>Actionable Improvements & Implementation Plan</strong> — Phased roadmap to achieve full platform completion.</li>
  </ol>

  <div class="page-break"></div>

  <!-- SECTION 1 -->
  <h1>1. Executive Summary & System Overview</h1>
  
  <h2>1.1 What SystemCraft Is</h2>
  <p>
    <strong>SystemCraft</strong> (formerly <em>TechSim</em>) is an enterprise-grade, browser-based <strong>System Design University, Interactive Simulation Engine, and Architecture Workbench</strong>. Unlike traditional static diagramming tools (such as Draw.io, Lucidchart, or Excalidraw), SystemCraft treats system architecture as a <em>living, dynamic, and fault-tolerant computing system</em>.
  </p>
  <p>
    The platform empowers engineers, system architects, and technical interview candidates to:
  </p>
  <ul>
    <li><strong>Visually Design Distributed Systems:</strong> Build topologies utilizing an extensive component registry comprising 169 node types and over 2,050 production tools (e.g., Nginx, Envoy, Apache Kafka, Redis, PostgreSQL, AWS S3).</li>
    <li><strong>Simulate Real-Time Traffic & Physics:</strong> Experience live packet flow, request-per-second (RPS) throughput, queuing delays, CPU/memory saturation, and P50/P95/P99 latency calculations.</li>
    <li><strong>Execute Chaos Engineering Experiments:</strong> Inject realistic operational faults (node crashes, network partitions, latency spikes, and memory leaks) to observe cascading blast radiuses and evaluate system self-healing.</li>
    <li><strong>Master Distributed Systems Theory:</strong> Learn via 7 structured curriculum tracks, 49 interactive lessons, 245 quiz questions, and 12 live interactive algorithmic sandboxes.</li>
    <li><strong>Practice System Design Interviews:</strong> Solve real-world challenges (e.g., Twitter feed, Uber tracking, Bitly URL shortener) with automated scoring and AI interviewer feedback.</li>
  </ul>

  <div class="callout callout-info">
    <div class="callout-title">Platform Motto</div>
    <strong>Build. Attack. Learn.</strong> An engineer learns far more from breaking a system in a sandbox than from reading static documentation.
  </div>

  <h2>1.2 Technology Stack Overview</h2>
  <table>
    <thead>
      <tr>
        <th>Layer</th>
        <th>Technologies</th>
        <th>Version / Spec</th>
        <th>Architectural Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frontend Framework</strong></td>
        <td>React + Vite + TypeScript</td>
        <td>React 19.2, Vite 8.0</td>
        <td>Client application runtime with sub-second HMR and strict typing.</td>
      </tr>
      <tr>
        <td><strong>Canvas Engine</strong></td>
        <td>@xyflow/react (React Flow)</td>
        <td>v12.11.0</td>
        <td>Graph visualization, custom node portals, bezier/smoothstep edge routing.</td>
      </tr>
      <tr>
        <td><strong>Design System</strong></td>
        <td>Tailwind CSS + CSS Variables</td>
        <td>Tailwind v4.3</td>
        <td>Multi-theme token system (Dark, Darker, Light, System).</td>
      </tr>
      <tr>
        <td><strong>Brand Assets</strong></td>
        <td>simple-icons + Lucide</td>
        <td>v16.23 / v1.17</td>
        <td>Authentic technology brand SVGs (Kafka, Redis, Postgres, etc.).</td>
      </tr>
      <tr>
        <td><strong>Backend API</strong></td>
        <td>Node.js + Express.js</td>
        <td>Express v5.2, TS</td>
        <td>REST API, security middleware pipeline, AI orchestration proxy.</td>
      </tr>
      <tr>
        <td><strong>Database & ORM</strong></td>
        <td>MongoDB + Mongoose</td>
        <td>Mongoose v9.6</td>
        <td>Document storage with embedded MongoMemoryServer fallback.</td>
      </tr>
      <tr>
        <td><strong>Authentication</strong></td>
        <td>JWT + bcryptjs</td>
        <td>jsonwebtoken v9.0</td>
        <td>Stateless authorization with salted passwords and bearer tokens.</td>
      </tr>
      <tr>
        <td><strong>Primary AI</strong></td>
        <td>Groq SDK (LLaMA 3.3 70B)</td>
        <td>llama-3.3-70b-versatile</td>
        <td>Sub-second LLM inference for architecture generation and chat.</td>
      </tr>
      <tr>
        <td><strong>Fallback AI</strong></td>
        <td>Google Generative AI</td>
        <td>gemini-1.5-flash</td>
        <td>Zero-downtime failover model when primary LLM encounters rate limits.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- SECTION 2 -->
  <h1>2. Complete Feature Catalog & Business Logic Deep-Dive</h1>

  <h2>2.1 Interactive Visual Architecture Canvas</h2>
  <p>
    The canvas serves as the primary workbench. Implemented via <code>@xyflow/react</code> in <code>src/components/Canvas.tsx</code> and <code>src/components/TechNode.tsx</code>:
  </p>
  <ul>
    <li><strong>4-Sided Dual Handles:</strong> Standard React Flow nodes often suffer from handle overlap when multiple edges connect to a single side. TechNode solves this by implementing 4 visible source handles (<code>top</code>, <code>bottom</code>, <code>left</code>, <code>right</code>) for initiating connections and 4 invisible target handles (<code>top-t</code>, <code>bottom-t</code>, etc.) with <code>pointerEvents: 'none'</code>. React Flow detects target handles geometrically for connection snapping without blocking outbound drags.</li>
    <li><strong>Floating NodeToolbar:</strong> Rendered in a React Flow portal above the node. Provides quick access to Knowledge Base (📚), Node Configuration (⚙), Duplication (📋), and Deletion (🗑).</li>
    <li><strong>Dynamic State Overlays:</strong> During live simulation, nodes display a color-shifting CPU utilization bar, live P99 latency readout, and status glow. Overloaded nodes pulse red; crashed nodes dim to 45% grayscale and display an inline <code>↺ Restart Node</code> button.</li>
    <li><strong>Edge Routing Protocols:</strong> Custom <code>GlowEdge.tsx</code> components support <code>bezier</code>, <code>smoothstep</code>, and <code>straight</code> paths with protocol-specific color coding (HTTP: Cyan, DB: Blue, Cache: Purple, Queue: Amber).</li>
  </ul>

  <h2>2.2 Comprehensive Tool & Component Registry</h2>
  <p>
    When dragging a generic component onto the canvas, SystemCraft intercepts the drop event and presents the <strong>Tool Selection Modal</strong> (<code>src/components/ToolSelectionModal.tsx</code>):
  </p>
  <ul>
    <li><strong>2,050+ Production Tools:</strong> Mapped across 169 node types in <code>techsim_merged_registry.json</code>. For example, a Load Balancer node offers Nginx, HAProxy, AWS ALB, Traefik, and Envoy.</li>
    <li><strong>3-Perspective Decision Panel:</strong> Expanding any tool displays:
      <ol>
        <li><em>Core Architecture:</em> Internal mechanics (event loops, memory models, threading).</li>
        <li><em>Real-World Usage:</em> How Netflix, Uber, or Airbnb configure and deploy it.</li>
        <li><em>When to Pick:</em> Concrete trade-offs vs competing solutions.</li>
      </ol>
    </li>
    <li><strong>SVG Brand Icons:</strong> Integrated via <code>simple-icons</code> (<code>src/utils/toolIcon.tsx</code>). If a brand icon is absent, an elegant letter-badge fallback is rendered automatically.</li>
    <li><strong>Dynamic Tool Swapping:</strong> Existing nodes feature a <code>⇄</code> button to swap tools without severing edges or resetting simulation metrics.</li>
  </ul>

  <h2>2.3 Synchronous Connection Validation Engine</h2>
  <p>
    To prevent architectural anti-patterns, connections are validated <strong>synchronously</strong> before edges are established (<code>src/data/registry/index.ts</code>):
  </p>
  <pre>export function isConnectionValid(sourceType: string, targetType: string): { valid: boolean; reason?: string } {
  const sourceId = NODE_TYPE_TO_REGISTRY_ID[sourceType] ?? sourceType;
  const targetId = NODE_TYPE_TO_REGISTRY_ID[targetType] ?? targetType;
  const sourceNode = registry[sourceId];
  if (!sourceNode?.connectionRestrictions) return { valid: true };
  const blocked = sourceNode.connectionRestrictions.cannotConnectTo ?? [];
  if (blocked.includes(targetId)) {
    return { valid: false, reason: sourceNode.connectionRestrictions.cannotConnectToReason?.[targetId] };
  }
  return { valid: true };
}</pre>
  <p>
    If a user attempts to connect a Client Browser directly to a PostgreSQL Database, the connection is aborted instantly, displaying a 5-second architectural explanation banner.
  </p>

  <div class="page-break"></div>

  <h2>2.4 Real-Time Simulation Engine & Physics Loop</h2>
  <p>
    The simulation engine (<code>src/simulation/SimulationEngine.ts</code>) powers real-time traffic dynamics through a <code>requestAnimationFrame</code> loop:
  </p>

  <div class="diagram-container">
[Client Ingress] ──(RPS Packets)──> [Load Balancer] ──> [Microservice] ──> [Database / Cache]
       │                                     │                 │                 │
       ▼                                     ▼                 ▼                 ▼
Packet Physics Loop                     Queue Depth       CPU Utilization    Latency Penalty
(speed * delta_time)                 (inflow - cap)       (load / cap)       (M/M/1 queue formula)
  </div>

  <ul>
    <li><strong>Queueing Dynamics:</strong> If inbound RPS exceeds a node's capacity, queue depth accumulates:
      <code>queueDepth += (inboundRPS - capacity) * dt</code>.
    </li>
    <li><strong>Latency Degradation:</strong> Node latency increases non-linearly using an $M/M/1$ queuing approximation:
      <code>latency = baseLatency * (1 + queueDepth / (capacity * 0.5))</code>.
    </li>
    <li><strong>Smoothstep Interpolation:</strong> Metrics interpolate exponentially to prevent jarring visual jumps:
      <code>current = current + (target - current) * (1 - Math.exp(-lambda * dt))</code>.
    </li>
    <li><strong>Global Metrics Aggregation:</strong> Computes global RPS, P50/P95/P99 latency, error rate, throughput, and detects the primary system bottleneck.</li>
  </ul>

  <h2>2.5 Chaos Engineering & Fault Injection System</h2>
  <p>
    Engineers can test system resilience by injecting 21+ real-world fault scenarios via the bottom bar (<code>src/components/BottomBar.tsx</code>):
  </p>
  <table>
    <thead>
      <tr>
        <th>Chaos Type</th>
        <th>Engine Method</th>
        <th>Physical Impact & Blast Radius</th>
        <th>Recovery Behavior</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Node Crash</strong></td>
        <td><code>crashNode(id)</code></td>
        <td>Node marks DOWN; outgoing edges blocked; in-flight packets destroyed; downstream nodes degrade.</td>
        <td>Manual click <code>↺ Restart</code> or <code>healNode(id)</code> restores topology.</td>
      </tr>
      <tr>
        <td><strong>Latency Spike</strong></td>
        <td><code>spikeLatency(edge, ms)</code></td>
        <td>Edge latency multiplies by $5\times$; upstream queues backup rapidly.</td>
        <td>Auto-recovers after 8 seconds.</td>
      </tr>
      <tr>
        <td><strong>Network Partition</strong></td>
        <td><code>networkPartition(edge)</code></td>
        <td>Edge blocks all traffic; 100% packet loss simulated on path.</td>
        <td>Auto-recovers after 12 seconds.</td>
      </tr>
      <tr>
        <td><strong>Traffic Surge</strong></td>
        <td><code>trafficSurge(multiplier)</code></td>
        <td>Global RPS multiplies by $3\times - 10\times$; tests autoscaling headroom.</td>
        <td>Auto-recovers after 10 seconds.</td>
      </tr>
      <tr>
        <td><strong>Memory Leak</strong></td>
        <td><code>injectMemoryLeak(id)</code></td>
        <td>RAM utilization climbs linearly; degrades at 85%, crashes at 95%.</td>
        <td>Requires restart or garbage collection intervention.</td>
      </tr>
    </tbody>
  </table>

  <h2>2.6 AI Intelligence & Architecture Generation</h2>
  <p>
    SystemCraft integrates a resilient AI proxy (<code>server/lib/ai.ts</code>) using Groq (LLaMA 3.3 70B) with automatic failover to Google Gemini 1.5 Flash:
  </p>
  <ul>
    <li><strong>Architecture Generator (<code>POST /api/ai/generate</code>):</strong> Translates natural language prompts into complete React Flow topologies. <code>transformDiagram</code> in <code>AIGeneratorPanel.tsx</code> maps AI output strings (snake_case, camelCase, generic names) reliably to canvas node templates.</li>
    <li><strong>Requirement Gathering Wizard (<code>POST /api/ai/wizard</code>):</strong> A 4-step wizard collecting System Type, Scale (DAU, RPS), Non-Functional Requirements (CAP trade-offs), and Constraints to generate custom architectures.</li>
    <li><strong>Architecture Chat (<code>POST /api/ai/chat</code>):</strong> Context-aware technical assistant aware of active nodes, edges, protocols, and SPOF vulnerabilities.</li>
    <li><strong>Post-Simulation Report (<code>POST /api/ai/simulation-report</code>):</strong> Generates an executive debrief summarizing peak load, dropped packets, bottlenecks, and optimization recommendations.</li>
  </ul>

  <div class="page-break"></div>

  <h2>2.7 Learning Platform, Lessons & Quizzes</h2>
  <p>
    Accessible via <code>/learn</code> and <code>/learn/:trackId/:lessonId</code>:
  </p>
  <ul>
    <li><strong>7 Complete Learning Tracks:</strong> Fundamentals, Backend Engineering, Distributed Systems, Cloud Architecture, Security Engineering, DevOps & SRE, and Interview Preparation.</li>
    <li><strong>49 In-Depth Lessons:</strong> Theory explained with intuitive real-world analogies, production case studies, and interactive canvas exercises.</li>
    <li><strong>245 Quiz Questions:</strong> Every lesson features a 5-question comprehension quiz with instant feedback and score tracking persisted to MongoDB (<code>POST /api/progress/lesson</code>).</li>
  </ul>

  <h2>2.8 Interactive Distributed Systems Concepts Sandbox</h2>
  <p>
    Accessible via <code>/concepts</code>, providing 12 standalone interactive simulations:
  </p>
  <table>
    <thead>
      <tr>
        <th>Concept</th>
        <th>Component File</th>
        <th>Interactive Mechanics</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>CAP Theorem</strong></td>
        <td><code>CAPTheoremDemo.tsx</code></td>
        <td>Inject network partitions; toggle Consistency (CP) vs Availability (AP) behavior.</td>
      </tr>
      <tr>
        <td><strong>Consistent Hashing</strong></td>
        <td><code>ConsistentHashingDemo.tsx</code></td>
        <td>Interactive hash ring with virtual nodes; add/remove nodes and track key migration.</td>
      </tr>
      <tr>
        <td><strong>Database Sharding</strong></td>
        <td><code>ShardingDemo.tsx</code></td>
        <td>Range vs hash-based key distribution; detect hotspot shard imbalances.</td>
      </tr>
      <tr>
        <td><strong>Replication & Lag</strong></td>
        <td><code>ReplicationDemo.tsx</code></td>
        <td>Primary-replica replication with animated replication lag and replica read staleness.</td>
      </tr>
      <tr>
        <td><strong>Circuit Breaker</strong></td>
        <td><code>CircuitBreakerDemo.tsx</code></td>
        <td>Closed, Open, Half-Open state transitions with failure thresholds and cooldown timers.</td>
      </tr>
      <tr>
        <td><strong>Rate Limiting</strong></td>
        <td><code>RateLimitingDemo.tsx</code></td>
        <td>Token Bucket, Leaky Bucket, and Sliding Window algorithms under burst traffic.</td>
      </tr>
      <tr>
        <td><strong>Load Balancing</strong></td>
        <td><code>LoadBalancingDemo.tsx</code></td>
        <td>Round Robin, Least Connections, and IP Hash server traffic distribution.</td>
      </tr>
      <tr>
        <td><strong>Caching Patterns</strong></td>
        <td><code>CachingDemo.tsx</code></td>
        <td>Cache-Aside, Write-Through, and Write-Behind with cache hit/miss animations.</td>
      </tr>
      <tr>
        <td><strong>CQRS Pattern</strong></td>
        <td><code>CQRSDemo.tsx</code></td>
        <td>Separated write command models and read query models with async synchronization.</td>
      </tr>
      <tr>
        <td><strong>Two-Phase Commit</strong></td>
        <td><code>TwoPCAnimation.tsx</code></td>
        <td>Prepare and Commit/Abort distributed transaction coordinator protocol.</td>
      </tr>
      <tr>
        <td><strong>Saga Pattern</strong></td>
        <td><code>SagaAnimation.tsx</code></td>
        <td>Choreographed vs orchestrated distributed transactions with compensating steps.</td>
      </tr>
      <tr>
        <td><strong>Event Sourcing</strong></td>
        <td><code>EventSourcingAnimation.tsx</code></td>
        <td>Append-only event store with state rehydration and historical temporal replays.</td>
      </tr>
    </tbody>
  </table>

  <h2>2.9 System Design Interview Playground</h2>
  <p>
    Accessible via <code>/interview</code> and <code>/interview/:id</code>:
  </p>
  <ul>
    <li><strong>Timed FAANG Challenges:</strong> Real-world prompts including <em>Design Twitter's Tweet Feed</em>, <em>Design a Scalable URL Shortener</em>, and <em>Design Uber's Tracking System</em>.</li>
    <li><strong>45-Minute Interview Timer:</strong> Countdown clock with visual alerts at 5 minutes remaining.</li>
    <li><strong>Embedded Architecture Canvas:</strong> Candidates build solutions directly inside the interview session.</li>
    <li><strong>AI Interviewer Chat:</strong> Interactive chat with a simulated Staff Systems Architect.</li>
    <li><strong>Rubric-Based Scoring:</strong> Automatically scores candidate architectures across Scalability, Reliability, Security, Performance, and Cost Efficiency via <code>POST /api/ai/interview-feedback</code>.</li>
  </ul>

  <div class="page-break"></div>

  <!-- SECTION 3 -->
  <h1>3. Current Status & Feature Health Audit</h1>
  
  <p>
    A comprehensive codebase and runtime audit was conducted. Both frontend (port 5173) and backend API (port 5000) compile with <strong>zero TypeScript errors</strong> and pass all functional checks.
  </p>

  <h2>3.1 Route & Subsystem Audit Matrix</h2>
  <table>
    <thead>
      <tr>
        <th>Route / Feature</th>
        <th>Component</th>
        <th>Status</th>
        <th>Audit Findings & Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>/</code> (Home)</td>
        <td><code>LandingView.tsx</code></td>
        <td><span class="status-badge badge-done">HEALTHY</span></td>
        <td>Hero chaos simulator, feature showcases, responsive layout verified.</td>
      </tr>
      <tr>
        <td><code>/login</code>, <code>/register</code></td>
        <td><code>Login.tsx</code>, <code>Register.tsx</code></td>
        <td><span class="status-badge badge-done">HEALTHY</span></td>
        <td>JWT authentication, password hashing, and token persistence verified.</td>
      </tr>
      <tr>
        <td><code>/canvas</code></td>
        <td><code>Canvas.tsx</code></td>
        <td><span class="status-badge badge-done">HEALTHY</span></td>
        <td>Drag & drop, 4-sided handles, synchronous connection validation verified.</td>
      </tr>
      <tr>
        <td><code>/my-architectures</code></td>
        <td><code>MyArchitectures.tsx</code></td>
        <td><span class="status-badge badge-done">HEALTHY</span></td>
        <td>Diagram thumbnails, autosave, version rollback, and JSON export verified.</td>
      </tr>
      <tr>
        <td><code>/learn</code></td>
        <td><code>LearnPage.tsx</code></td>
        <td><span class="status-badge badge-done">HEALTHY</span></td>
        <td>7 curriculum tracks, progress tracking to DB and localStorage verified.</td>
      </tr>
      <tr>
        <td><code>/learn/:t/:l</code></td>
        <td><code>LessonPage.tsx</code></td>
        <td><span class="status-badge badge-done">HEALTHY</span></td>
        <td>Markdown rendering, 245 quiz questions, progress API integration verified.</td>
      </tr>
      <tr>
        <td><code>/concepts</code></td>
        <td><code>ConceptsPage.tsx</code></td>
        <td><span class="status-badge badge-done">HEALTHY</span></td>
        <td>15 concepts indexed, 12 interactive simulations functioning smoothly.</td>
      </tr>
      <tr>
        <td><code>/interview</code></td>
        <td><code>InterviewPage.tsx</code></td>
        <td><span class="status-badge badge-done">HEALTHY</span></td>
        <td>3 FAANG challenge prompts, difficulty badges, briefing cards verified.</td>
      </tr>
      <tr>
        <td><code>/interview/:id</code></td>
        <td><code>InterviewSession.tsx</code></td>
        <td><span class="status-badge badge-done">HEALTHY</span></td>
        <td>45-min timer, canvas embedding, hints, and AI scoring verified.</td>
      </tr>
      <tr>
        <td><code>/settings</code></td>
        <td><code>Settings.tsx</code></td>
        <td><span class="status-badge badge-done">HEALTHY</span></td>
        <td>Profile updates, theme picker, and custom AI key preferences verified.</td>
      </tr>
      <tr>
        <td><code>/security</code></td>
        <td><code>SecurityView.tsx</code></td>
        <td><span class="status-badge badge-progress">PARTIAL</span></td>
        <td>Security lab UI operational; planned for deeper simulation engine linkage.</td>
      </tr>
      <tr>
        <td><code>/k8s</code></td>
        <td><code>K8sView.tsx</code></td>
        <td><span class="status-badge badge-progress">PARTIAL</span></td>
        <td>Pod/service visualizer operational; planned for live YAML generation.</td>
      </tr>
      <tr>
        <td><code>/db-schema</code></td>
        <td><code>PlaceholderView</code></td>
        <td><span class="status-badge badge-planned">PLANNED</span></td>
        <td>Stub ready for the Low Level Design (LLD) ERD Studio.</td>
      </tr>
      <tr>
        <td><code>/network</code></td>
        <td><code>PlaceholderView</code></td>
        <td><span class="status-badge badge-planned">PLANNED</span></td>
        <td>Stub ready for the Network Topology & VPC Designer.</td>
      </tr>
    </tbody>
  </table>

  <h2>3.2 Verification of Previous Bug Fixes</h2>
  <ul>
    <li><strong>Bug #1 (API Key Security):</strong> <code>server/lib/ai.ts</code> was verified. API keys are strictly read from environment variables or client headers and are never logged to console outputs.</li>
    <li><strong>Bug #2 (Properties Panel Edits):</strong> <code>PropertiesPanel.tsx</code> properly calls <code>updateNodeData</code> on name, replicas, and region changes.</li>
    <li><strong>Bug #3 (AI Generator Node Mapping):</strong> <code>AIGeneratorPanel.tsx</code> contains a comprehensive <code>NODE_ID_MAP</code> handling snake_case, camelCase, and generic aliases without defaulting to Docker nodes.</li>
    <li><strong>Bug #4 (Lesson Progress Backend Persistence):</strong> <code>LessonPage.tsx</code> successfully posts completed quiz scores and time spent to <code>POST /api/progress/lesson</code>.</li>
    <li><strong>Bug #5 (Interview Submission AI Scoring):</strong> <code>InterviewSession.tsx</code> calls <code>POST /api/ai/interview-feedback</code> upon submission and renders rubric scores.</li>
    <li><strong>Bug #6 (Chaos Panel Decoupling):</strong> In <code>TechNode.tsx</code>, clicking a node opens properties; clicking the <code>⚡</code> button independently opens the Chaos Injection panel.</li>
    <li><strong>Bug #7 (Connection Validation Performance):</strong> Migrated from asynchronous API roundtrips to synchronous evaluation in <code>src/data/registry/index.ts</code>, eliminating edge drawing lag.</li>
  </ul>

  <div class="page-break"></div>

  <!-- SECTION 4 -->
  <h1>4. High Level Design (HLD) Playground: Roadmap & Next Features</h1>
  
  <p>
    While the High Level Design canvas is currently feature-rich, the following advanced capabilities are recommended to elevate SystemCraft to the premier enterprise architecture tool:
  </p>

  <h2>4.1 Cloud Cost Estimator (AWS / GCP / Azure)</h2>
  <p>
    Every component on the canvas will automatically map to real-world cloud SKUs based on its configured replicas, throughput, and storage capacity:
  </p>
  <ul>
    <li><strong>Live Cost Meter:</strong> Displays a live monthly cost readout in the top toolbar (e.g., <code>$2,480 / month</code>).</li>
    <li><strong>Multi-Cloud Comparison:</strong> Side-by-side cost breakdown comparing AWS (e.g., ALB + ECS + RDS Aurora), Google Cloud (Cloud Run + Cloud SQL), Azure, and self-hosted Bare Metal.</li>
    <li><strong>Cost Optimization AI Suggestions:</strong> AI flags over-provisioned components (e.g., *"Replacing RDS multi-AZ with read replicas can reduce monthly spend by 35%"*).</li>
  </ul>

  <h2>4.2 Infrastructure-as-Code (IaC) Exporter</h2>
  <p>
    Bridge the gap between design and DevOps by enabling one-click code generation:
  </p>
  <ul>
    <li><strong>Terraform HCL Exporter:</strong> Automatically generates production-ready <code>main.tf</code>, <code>variables.tf</code>, and <code>outputs.tf</code> provisioning VPCs, subnets, security groups, compute clusters, and databases.</li>
    <li><strong>Kubernetes Manifest Exporter:</strong> Generates standard K8s Deployments, Services, Ingress objects, and HorizontalPodAutoscalers (HPA).</li>
    <li><strong>Docker Compose Exporter:</strong> Generates a single <code>docker-compose.yml</code> allowing engineers to run the designed architecture locally with one terminal command.</li>
  </ul>

  <h2>4.3 Real-Time Multi-User Collaboration</h2>
  <p>
    Transform SystemCraft into a collaborative whiteboard for engineering teams:
  </p>
  <ul>
    <li><strong>CRDT Engine (Yjs):</strong> Conflict-free replicated data types ensuring that simultaneous node movements, edge creations, and deletions resolve without state divergence.</li>
    <li><strong>Live Awareness & Cursors:</strong> Render teammates' cursors with user avatars and color-coded selection halos.</li>
    <li><strong>Architecture Review Mode:</strong> A lead presenter can "broadcast" their view, automatically syncing viewport zoom and pan for all participating team members.</li>
  </ul>

  <h2>4.4 Multi-Region & Geo-Distribution Simulation</h2>
  <ul>
    <li><strong>Global Map Overlay:</strong> Group nodes into specific geographic regions (e.g., <code>us-east-1</code>, <code>eu-central-1</code>, <code>ap-southeast-1</code>).</li>
    <li><strong>Physical Latency Simulation:</strong> Packets crossing oceanic boundaries incur realistic speed-of-light propagation delays (e.g., 75ms trans-Atlantic, 140ms trans-Pacific).</li>
    <li><strong>Regional Outage Testing:</strong> Test multi-region active-active vs active-passive failover when an entire cloud region experiences an outage.</li>
  </ul>

  <div class="page-break"></div>

  <!-- SECTION 5 -->
  <h1>5. Low Level Design (LLD) Playground: The Complete Blueprint</h1>
  
  <p>
    To make SystemCraft a <strong>complete system design application</strong>, we must provide both <strong>High Level Design (HLD)</strong> (system topology, cloud services, databases, queues) and <strong>Low Level Design (LLD)</strong> (object-oriented class hierarchies, database ERDs, API interface contracts, and sequence interactions).
  </p>

  <div class="diagram-container">
+───────────────────────────────────────────────────────────────────────────────────+
|                         THE COMPLETE ARCHITECTURE SUITE                           |
+───────────────────────────────────────────────────────────────────────────────────+
|  HIGH LEVEL DESIGN (HLD) PLAYGROUND         LOW LEVEL DESIGN (LLD) PLAYGROUND     |
|  • Cloud & Service Topology                 • UML Class Diagram Studio            |
|  • Traffic & Queue Simulation               • Database ERD & Schema Designer      |
|  • Chaos Engineering & Fault Injection      • API Contract & OpenAPI 3.0 Designer |
|  • Multi-Region & Capacity Planning         • Sequence Diagram Studio             |
|                                             • State Machine & OOD Interview Mode  |
+───────────────────────────────────────────────────────────────────────────────────+
                                      ▲
                                      │  (Double-Click Microservice Node)
                                      ▼
             [THE UNIFIED HLD ↔ LLD DRILL-DOWN BRIDGE]
  </div>

  <h2>5.1 UML Class Diagram Designer</h2>
  <p>
    Enables engineers to model object-oriented software architectures:
  </p>
  <ul>
    <li><strong>Class & Interface Nodes:</strong> Define class name, visibility modifiers (<code>+</code> public, <code>-</code> private, <code>#</code> protected), attributes with types, and methods with arguments and return types.</li>
    <li><strong>Stereotypes:</strong> Support for <code>&lt;&lt;interface&gt;&gt;</code>, <code>&lt;&lt;abstract&gt;&gt;</code>, <code>&lt;&lt;singleton&gt;&gt;</code>, and <code>&lt;&lt;factory&gt;&gt;</code>.</li>
    <li><strong>Standard UML Connectors:</strong>
      <ul>
        <li><strong>Inheritance / Generalization:</strong> Solid line with hollow triangular arrowhead.</li>
        <li><strong>Realization / Implementation:</strong> Dashed line with hollow triangular arrowhead.</li>
        <li><strong>Composition:</strong> Solid line with filled diamond.</li>
        <li><strong>Aggregation:</strong> Solid line with hollow diamond.</li>
        <li><strong>Association / Dependency:</strong> Open arrows with multiplicity markers (<code>1</code>, <code>0..*</code>, <code>1..*</code>).</li>
      </ul>
    </li>
    <li><strong>Design Pattern Templates:</strong> One-click scaffolding of Gang of Four (GoF) design patterns: Factory, Singleton, Strategy, Observer, Decorator, Adapter, and Builder.</li>
    <li><strong>Code Generation:</strong> Generates clean boilerplate code in Java, TypeScript, and Python from the visual class diagram.</li>
  </ul>

  <h2>5.2 Database Schema & ERD Designer</h2>
  <p>
    A dedicated visual studio for relational and NoSQL database modeling (replacing the <code>/db-schema</code> placeholder):
  </p>
  <ul>
    <li><strong>Table Builder:</strong> Add columns with data types (VARCHAR, INT, UUID, TIMESTAMP, JSONB), nullable flags, and default expressions.</li>
    <li><strong>Keys & Indexes:</strong> Mark Primary Keys (PK), Foreign Keys (FK), and index types (B-Tree, Hash, GIN).</li>
    <li><strong>Crow's Foot Relationships:</strong> Connect PK to FK with visual crow's foot notation representing $1:1$, $1:N$, and $M:N$ relationships.</li>
    <li><strong>SQL DDL Generation:</strong> Generates valid, executable SQL DDL for PostgreSQL, MySQL, SQLite, and SQL Server.</li>
    <li><strong>NoSQL Document Modeling:</strong> Visual schema designer for nested MongoDB document collections and DynamoDB partition/sort key structures.</li>
  </ul>

  <div class="page-break"></div>

  <h2>5.3 API Contract & Interface Designer</h2>
  <ul>
    <li><strong>REST Endpoint Studio:</strong> Visually configure HTTP methods, resource paths, request parameters, JSON request bodies, and expected HTTP status codes (200, 201, 400, 404, 500).</li>
    <li><strong>OpenAPI / Swagger 3.0 Export:</strong> Instant generation and export of standard OpenAPI 3.0 YAML and JSON specifications.</li>
    <li><strong>gRPC & Protobuf Studio:</strong> Visual definition of RPC services and message schemas with export to <code>.proto</code> files.</li>
    <li><strong>GraphQL Schema Designer:</strong> Visual graph of Types, Queries, Mutations, and Resolvers.</li>
  </ul>

  <h2>5.4 Sequence Diagram Studio</h2>
  <p>
    Captures dynamic runtime interactions between actors and services over time:
  </p>
  <ul>
    <li><strong>Actors & Lifelines:</strong> Vertical lifelines representing User, API Gateway, Services, Message Queues, and Databases.</li>
    <li><strong>Message Flows:</strong> Synchronous calls, asynchronous dispatches, and return responses with activation boxes.</li>
    <li><strong>Combined Fragments:</strong> Visual frames for conditional execution (<code>alt</code> / <code>opt</code>), iteration (<code>loop</code>), and concurrency (<code>par</code>).</li>
    <li><strong>Mermaid.js & PlantUML Export:</strong> One-click export to standard diagram-as-code formats.</li>
  </ul>

  <h2>5.5 State Machine Diagram Studio</h2>
  <ul>
    <li><strong>State Modeling:</strong> Initial, intermediate, composite, and terminal states.</li>
    <li><strong>Transitions & Guards:</strong> Trigger events, guard conditions (e.g., <code>[payment_received]</code>), and execution actions (e.g., <code>/dispatch_email()</code>).</li>
    <li><strong>State Engine Code Gen:</strong> Generates state-machine code skeletons in Java (Spring State Machine) or TypeScript (XState).</li>
  </ul>

  <h2>5.6 Object-Oriented Design (OOD) Interview Practice</h2>
  <p>
    System design interviews frequently include Low Level Design problems. SystemCraft will feature 5 built-in interactive OOD challenges:
  </p>
  <ol>
    <li><strong>Design a Parking Lot System:</strong> Vehicle hierarchies (Motorcycle, Car, Bus), spot allocation algorithms, payment calculation strategies.</li>
    <li><strong>Design an Elevator Control System:</strong> Multi-car scheduling algorithms (SCAN/LOOK), dispatch logic, door safety state transitions.</li>
    <li><strong>Design a Chess Game:</strong> Board representation, polymorphic piece movement validation, checkmate evaluation, turn state management.</li>
    <li><strong>Design Splitwise (Expense Sharing):</strong> Expense split algorithms (equal, exact, percentage), balance sheets, debt simplification graph algorithms.</li>
    <li><strong>Design BookMyShow / Movie Ticket Booking:</strong> Concurrent seat reservations, distributed lock timeouts, payment callbacks.</li>
  </ol>

  <h2>5.7 The Unified HLD ↔ LLD Drill-Down Bridge</h2>
  <p>
    The crowning innovation of SystemCraft is connecting HLD and LLD seamlessly:
  </p>
  <ul>
    <li>On the High Level Design canvas, double-clicking any microservice node (e.g., <code>Order Service</code>) opens its <strong>LLD Drill-Down Studio</strong>.</li>
    <li>Inside the drill-down studio, the user can toggle between:
      <ul>
        <li><strong>API Tab:</strong> Endpoints exposed by this specific service.</li>
        <li><strong>Class Tab:</strong> Internal class architecture (Controllers, Services, Repositories).</li>
        <li><strong>Sequence Tab:</strong> Sequence flows executing within this service boundary.</li>
        <li><strong>Schema Tab:</strong> Dedicated database tables owned by this service.</li>
      </ul>
    </li>
    <li>This provides a complete, unified 360-degree software design platform.</li>
  </ul>

  <div class="page-break"></div>

  <!-- SECTION 6 -->
  <h1>6. Actionable Improvements & Implementation Plan</h1>

  <h2>6.1 Immediate Improvements for Existing Features</h2>
  <table>
    <thead>
      <tr>
        <th>Subsystem</th>
        <th>Recommended Improvement</th>
        <th>Priority</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Security Lab (<code>/security</code>)</strong></td>
        <td>Connect the static attack panels to the real simulation engine so attacks visually propagate across the live canvas.</td>
        <td>Medium</td>
      </tr>
      <tr>
        <td><strong>Kubernetes Lab (<code>/k8s</code>)</strong></td>
        <td>Link K8s nodes directly to the canvas topology and add a one-click "Download K8s Manifests" button.</td>
        <td>Medium</td>
      </tr>
      <tr>
        <td><strong>Canvas Export</strong></td>
        <td>Add toolbar buttons for high-resolution PNG, SVG, and PDF diagram export.</td>
        <td>High</td>
      </tr>
      <tr>
        <td><strong>Mobile Experience</strong></td>
        <td>Add touch gestures and collapsible toolbars for tablet and mobile viewing on non-canvas pages.</td>
        <td>Low</td>
      </tr>
    </tbody>
  </table>

  <h2>6.2 Phased Implementation Roadmap</h2>

  <div class="diagram-container">
PHASE 1: HLD Polish & Exporters (Sprint 4.5)
├── Cloud Cost Estimator widget (live SKU pricing)
├── Infrastructure-as-Code exporter (Terraform & K8s YAML)
└── Canvas SVG / PDF export toolbar

PHASE 2: LLD Foundation (Sprint 5)
├── LLD Canvas Mode toggle in main navigation
├── UML Class Diagram node types & relationship connectors
├── Database Schema / ERD table builder & SQL DDL generator
└── API Contract / OpenAPI 3.0 designer

PHASE 3: LLD Advanced & OOD Interview (Sprint 5.5)
├── Sequence Diagram studio (lifelines, sync/async, alt/loop)
├── State Machine designer with code generation
└── 5 classic OOD interview challenges (Parking Lot, Elevator, etc.)

PHASE 4: The Unified Bridge & Collaboration (Sprint 6)
├── HLD ↔ LLD drill-down navigation
└── Real-time multi-user collaboration (Yjs CRDT + WebSockets)
  </div>

  <div class="callout callout-success">
    <div class="callout-title">Conclusion</div>
    SystemCraft possesses an exceptionally strong foundation in High Level Design (HLD), real-time simulation physics, chaos engineering, and curriculum-driven learning. With the addition of the Low Level Design (LLD) Playground and the unified HLD ↔ LLD bridge, SystemCraft will stand as the most comprehensive, innovative system design engineering platform in the industry.
  </div>

</body>
</html>
`;

  const outputPath = path.resolve(__dirname, 'SystemCraft_Complete_Documentation.pdf');

  try {
    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.setContent(htmlContent, { waitUntil: 'networkidle' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '16mm',
        bottom: '18mm',
        left: '14mm',
        right: '14mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: '<div style="width:100%; font-size:8pt; font-family:sans-serif; color:#888; text-align:right; padding-right:16mm;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
    });

    console.log(`✅ PDF successfully generated at: ${outputPath}`);
    await browser.close();
  } catch (error) {
    console.error('❌ Failed to generate PDF:', error);
  }
}

generatePDF();
