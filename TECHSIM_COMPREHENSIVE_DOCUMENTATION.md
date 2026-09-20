# SystemCraft (TechSim) — Comprehensive System Design Platform Documentation
**The Complete High Level Design (HLD) & Low Level Design (LLD) Engineering Platform**  
*Author: Engineering & Architecture Team | Version: 3.2 | Date: September 2026*

---

## 1. Executive Summary & Project Overview

### 1.1 What SystemCraft Is
**SystemCraft** (formerly *TechSim*) is a comprehensive, browser-based **System Design University, Interactive Simulation Engine, and Architecture Workbench**. It bridges the gap between static whiteboard diagrams (e.g., Draw.io, Excalidraw) and real-world distributed systems engineering. 

Rather than treating system design as static boxes and arrows, SystemCraft allows software engineers, architects, and engineering candidates to:
1. **Visually Architect** complex distributed systems using an enterprise-grade component and tool registry (169 component types, 2,050+ tools).
2. **Simulate Real-Time Traffic & Physics** with dynamic packet animations, CPU/memory saturation, queue depths, and end-to-end latency calculations.
3. **Attack & Chaos Test** architectures by injecting real-world faults (node crashes, latency spikes, network partitions, cascading failures, memory leaks) to observe resilience and recovery in real time.
4. **Learn Distributed Systems Theory** across 7 structured curriculum tracks, 49 lessons, 245 interactive quizzes, and 12 live concept sandboxes (CAP theorem, Consistent Hashing ring, CQRS, Two-Phase Commit, etc.).
5. **Practice System Design Interviews** under timed conditions with AI-guided requirements, progressive hints, and rubric-based architectural scoring.

**Motto:** *Build. Attack. Learn.*

---

### 1.2 Technology Stack

| Layer | Technology | Version / Specification | Role & Architectural Purpose |
|---|---|---|---|
| **Frontend Framework** | React + Vite | React 19.2, Vite 8.0 | Single-page application runtime with fast HMR |
| **Canvas Engine** | `@xyflow/react` | v12.11.0 | High-performance graph canvas, custom nodes, edges, viewports |
| **Styling & Design System** | Tailwind CSS + CSS Variables | Tailwind v4.3, Custom Theme System | Dark, Darker, Light, System themes; CSS tokenized design |
| **Icons & Brand Assets** | `simple-icons` + `lucide-react` | simple-icons v16.23, Lucide 1.17 | Real tech brand SVGs (PostgreSQL, Kafka, Redis, Nginx, etc.) |
| **Backend Runtime** | Node.js + Express.js | Express v5.2, TypeScript | REST API, middleware pipeline, validation, AI proxy |
| **Database & ODM** | MongoDB + Mongoose | Mongoose v9.6 | Document database with automatic MongoMemoryServer fallback |
| **Authentication** | JWT (JSON Web Tokens) + `bcryptjs` | `jsonwebtoken` v9.0, `bcryptjs` v3.0 | Stateless authentication, salted passwords, localStorage token |
| **Primary AI Engine** | Groq SDK (`llama-3.3-70b-versatile`) | Groq SDK | High-speed LLM inference for real-time architecture generation |
| **Fallback AI Engine** | Google Generative AI (`gemini-1.5-flash`) | Gemini SDK | Zero-downtime fallback if Groq rate limits or encounters errors |
| **HTTP Client** | Axios | v1.17 | Intercepted client auto-attaching JWT and custom AI headers |

---

## 2. Complete Feature Catalog & Business Logic Deep-Dive

This section documents every major subsystem in SystemCraft, explaining its purpose, user experience, internal business logic, and code implementation.

```
+-----------------------------------------------------------------------------------+
|                               SYSTEMCRAFT PLATFORM                                |
+-----------------------------------------------------------------------------------+
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |   CANVAS & TOOLS   |  |  SIMULATION & CHAOS  |  |    AI & INTELLIGENCE      |  |
|  | - React Flow Graph |  | - Physics Loop       |  | - Architecture Generator  |  |
|  | - TechNode Handles |  | - Packet Routing     |  | - Requirement Wizard      |  |
|  | - 2050+ Tool Modal |  | - 21 Chaos Scenarios |  | - Architecture Chat (Q&A) |  |
|  | - Conn. Validator  |  | - Recovery Tracking  |  | - Post-Sim Expert Report  |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |  LEARN & CONCEPTS  |  |  INTERVIEW PLATFORM  |  |  BACKEND & MIDDLEWARE     |  |
|  | - 7 Theory Tracks  |  | - Timed Challenges   |  | - Rate Limiting & Auth    |  |
|  | - 49 Lessons & Qs  |  | - Progressive Hints  |  | - PlanGuard & Sanitizer   |  |
|  | - 12 Live Sandboxes|  | - Rubric Scoring     |  | - Dual-Mode MongoDB Atlas  |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

### 2.1 Interactive Architecture Canvas (`Canvas.tsx`, `TechNode.tsx`, `GlowEdge.tsx`)

#### Purpose & UX
The core workspace where users visually drag, drop, connect, configure, and inspect system components. It supports zooming, panning, multi-selection, node grouping, edge routing adjustments, and real-time validation badges.

#### Business Logic & Implementation
1. **Node Lifecycle & Rendering (`TechNode.tsx`)**:
   - Each node is rendered as a custom React Flow node (`type: 'techNode'`).
   - **4-Sided Dual Handles**: To prevent connection clipping and enable intuitive wiring, each node exposes 4 visible source handles (`top`, `bottom`, `left`, `right`) and 4 invisible target handles (`top-t`, `bottom-t`, `left-t`, `right-t`). Target handles have `pointerEvents: 'none'` so they never obstruct dragging out new connections, while React Flow geometrically snaps incoming edges to the nearest boundary handle.
   - **Floating NodeToolbar**: Appears on node selection via a React Flow portal, preventing clipping from neighboring nodes. Contains quick actions: 📚 *Learn/Knowledge*, ⚙ *Configure*, 📋 *Duplicate*, and 🗑 *Delete*.
   - **Inline Renaming**: Double-clicking a node label transitions it into an inline input with Enter/Escape handlers and autofocus.
   - **Live Simulation Overlay**: During simulation, each node displays an animated CPU utilization bar, live P99 latency metric, pulsating status glow (green, amber, red), and an inline `⚡` Chaos trigger button.
   - **Crashed State Representation**: If a node crashes, it dims to 45% opacity, turns grayscale, displays a red `■ DOWN` badge, and renders a `↺ Restart Node` button.

2. **Edge Routing & Protocols (`GlowEdge.tsx`)**:
   - Custom SVG edges support three routing styles: `bezier`, `smoothstep`, and `straight`.
   - Edges are color-coded by protocol:
     - `http` / `gRPC`: Cyan (`#06B6D4`)
     - `database`: Blue (`#3B82F6`)
     - `cache`: Purple (`#A855F7`)
     - `queue`: Amber/Orange (`#F97316`)
   - Selected edges display a floating interactive toolbar allowing the user to switch routing algorithms on the fly or delete the edge.

---

### 2.2 Comprehensive Tool & Component Registry (`ToolSelectionModal.tsx`, `toolIcon.tsx`)

#### Purpose & UX
When an engineer drags a generic component (e.g., "Load Balancer" or "Cache") onto the canvas, SystemCraft intercepts the drop and presents a **Tool Selection Modal**. Users choose from actual production technologies (e.g., Nginx, HAProxy, AWS ALB, Envoy for Load Balancer; Redis, Memcached, Dragonfly for Cache).

#### Business Logic & Implementation
1. **Hierarchical Registry (`techsim_merged_registry.json`)**:
   - Contains 169 component nodes and over 2,050 real-world tools categorized across Compute, Network, Data, Messaging, Infrastructure, and Monitoring.
   - Each tool record contains:
     - Identification: `id`, `name`, `canvasLabel`, `provider`
     - Licensing: `openSource` (boolean), `cloudManaged` (boolean)
     - Evaluation: `bestFor` (array of use cases), `notGoodFor`, `costEstimate`
     - Deep-Dive: `pros`, `cons`, `realWorldUsage` (companies using it in production)
2. **3-Perspective Decision Panel**:
   - When expanding a tool card in the modal, users see three distinct perspectives:
     - **Core Architecture**: How it works under the hood (e.g., event loop, memory structures).
     - **Real-World Production**: How companies like Netflix, Uber, or Airbnb deploy it.
     - **When to Pick**: Trade-off matrix vs alternative technologies.
3. **SVG Brand Icon Rendering (`toolIcon.tsx`)**:
   - Integrates `simple-icons` v16 to render authentic SVGs for technologies (e.g., Kafka, PostgreSQL, Redis, Kubernetes). If an icon is missing from the icon pack, it renders an elegant styled badge with the technology's initial letter.
4. **Changing Tools on Existing Nodes**:
   - Nodes feature a `⇄` button that dispatches a `change-node-tool` event. The canvas listens and reopens the modal for that existing node, updating its data without losing edges or simulation state.

---

### 2.3 Synchronous Connection Validation (`src/data/registry/index.ts`)

#### Purpose & UX
Prevents invalid or anti-pattern architectural connections (e.g., connecting a browser client directly to an internal PostgreSQL database) before the edge is created.

#### Business Logic & Implementation
1. **Rule Enforcement**:
   - Rather than relying on an asynchronous backend round-trip that causes UI lag, connection restrictions are evaluated **synchronously** in `src/data/registry/index.ts` using `isConnectionValid(sourceType, targetType)`.
   - The engine maps canvas node IDs to registry IDs (e.g., `client` → `client_browser`, `postgres` → `postgresql`).
   - If `sourceNode.connectionRestrictions.cannotConnectTo` contains the target, the connection is immediately aborted.
2. **User Feedback**:
   - Displays a 5-second transient error banner explaining the exact architectural reason (e.g., *"Client Browser cannot connect directly to PostgreSQL. Database should reside in a private subnet behind an API Server or Microservice"*).

---

### 2.4 Real-Time Simulation Engine (`SimulationEngine.ts`, `useSimulation.ts`)

#### Purpose & UX
Provides a living simulation of traffic flowing through the system. Packets visibly travel across edges, nodes process requests, queues fill up, latency compounds, and bottlenecks emerge under high load.

#### Business Logic & Physics Model
1. **The Animation Loop**:
   - Runs on `requestAnimationFrame` with high-resolution delta timing (`dt`).
   - Packets spawn at client/ingress nodes and traverse edges toward target services based on connection topology and protocol type.
2. **Load & Queuing Mechanics**:
   - Each node has a configured `capacity` (in RPS) and `currentLoad`.
   - If incoming traffic exceeds node capacity:
     $$\text{queueDepth} = \text{queueDepth} + (\text{incomingRPS} - \text{capacity}) \times dt$$
   - CPU utilization scales proportionally:
     $$\text{cpuUsage} = \min\left(1.0, \frac{\text{currentLoad}}{\text{capacity}}\right)$$
   - Latency compounds non-linearly using queuing theory ($M/M/1$ queue approximation):
     $$\text{latency} = \text{baseLatency} \times \left(1 + \frac{\text{queueDepth}}{\text{capacity} \times 0.5}\right)$$
   - If CPU usage exceeds 90% or queue depth overflows, the node enters `overloaded` or `degraded` status and begins dropping packets ($\text{errorRate} > 0$).
3. **Smoothstep State Transitions**:
   - Metrics do not jump abruptly; values interpolate smoothly using exponential smoothing:
     $$x_{\text{new}} = x_{\text{current}} + (x_{\text{target}} - x_{\text{current}}) \times (1 - e^{-\lambda \cdot dt})$$
4. **Global Metrics Aggregation**:
   - The engine computes global metrics updated every 6 animation frames:
     - **Global RPS**: Total requests processed across all active ingress nodes.
     - **P50 / P95 / P99 Latency**: Weighted percentile calculations across all active network paths.
     - **Error Rate**: Ratio of dropped or 5xx packets to total packets.
     - **Bottleneck Detection**: Identifies the single component with the highest CPU/queue saturation limiting overall system throughput.

---

### 2.5 Chaos Engineering & Fault Injection System

#### Purpose & UX
Allows engineers to validate system resilience by actively breaking components during a live simulation. Users can crash nodes, spike latency, partition networks, or trigger memory leaks.

#### Business Logic & Chaos Types
1. **Chaos Scenarios (21+ built-in scenarios)**:
   - **Node Crash (`crashNode`)**:
     - Marks node status as `down`, zeros CPU usage, sets error rate to 100%.
     - Blocks all outgoing edges (`edge.isBlocked = true`) and destroys packets in flight.
     - Downstream dependent nodes degrade (`status = 'degraded'`).
     - Logs event into `chaosLog` with timestamp, component name, and estimated blast radius.
   - **Latency Spike (`spikeLatency`)**:
     - Multiplies edge latency by $5\times$ to simulate network congestion or GC pauses. Automatically auto-recovers after 8 seconds.
   - **Network Partition (`networkPartition`)**:
     - Simulates split-brain or network cable cuts. All packets on the edge are dropped (`edge.isPartitioned = true`). Auto-recovers after 12 seconds.
   - **Traffic Surge (`trafficSurge`)**:
     - Multiplies global incoming RPS by $3\times - 10\times$ for 10 seconds to test autoscaling limits.
   - **Memory Leak (`injectMemoryLeak`)**:
     - Linearly increases `memoryUsage` over time. Once memory exceeds 90%, the node degrades and eventually crashes automatically.
2. **Recovery & Self-Healing (`healNode`)**:
   - Clicking `↺ Restart Node` removes the node from `downNodes`, restores healthy status, unblocks edges (provided the peer node is not also down), and recovers downstream degraded nodes.
3. **Chaos Blocked Modal (`ChaosBlockedModal.tsx`)**:
   - If a user attempts to apply an invalid chaos scenario to a node (e.g., applying "Disk Failure" to a stateless CDN edge), the system blocks the action and displays an educational modal explaining why the scenario is architecturally inapplicable.

---

### 2.6 Pre-Simulation Validation Gate & Issues Engine (`validator.ts`, `ValidationGate.tsx`)

#### Purpose & UX
Before running a simulation, the system checks for structural errors, missing dependencies, security risks, and architectural anti-patterns.

#### Business Logic & Rules
1. **Rule Engine (`src/engine/validator.ts`)**:
   - **Single Point of Failure (SPOF)**: Warns if a critical service or database has `replicas === 1` with no standby or load balancer.
   - **Orphaned Nodes**: Detects nodes with no incoming or outgoing connections.
   - **Direct Database Exposure**: Blocks architectures where client browsers or public CDNs connect directly to databases without an intermediary API or gateway.
   - **Missing Caching**: Flags high-traffic read paths lacking a cache layer (e.g., Redis/Memcached).
   - **Missing Message Queue**: Flags synchronous coupling between microservices where async decoupling is required.
2. **Validation Gate Modal (`ValidationGate.tsx`)**:
   - Categorizes issues into **Blocking Errors** (must be resolved before simulation can run) and **Warnings** (can proceed with acknowledged risks).
   - Includes one-click **Auto-Fix** buttons for common topology errors.
   - Integrates optional AI deep validation (`POST /api/ai/validate`).

---

### 2.7 AI Intelligence Layer (`callAI`, `ai.ts`, `RequirementWizard.tsx`, `ArchitectureChat.tsx`)

#### Purpose & UX
A built-in senior architect AI that generates architectures from natural language prompts, conducts requirement gathering, answers technical questions about the current canvas, and produces post-simulation debriefs.

#### Business Logic & Model Fallback Strategy
1. **Dual-Model Resilient Pipeline (`server/lib/ai.ts`)**:
   - **Primary**: Groq (`llama-3.3-70b-versatile`) — Chosen for sub-second latency and high architectural reasoning.
   - **Fallback**: Google Gemini (`gemini-1.5-flash`) — If Groq encounters rate limits or service interruptions, the call fails over to Gemini seamlessly.
   - **Zero Key Leaks**: API keys are securely read from environment variables or custom client headers; keys are never logged to stdout/stderr.
2. **AI Endpoints & Capabilities**:
   - `POST /api/ai/generate`: Translates text prompts (e.g., *"Design a WhatsApp clone handling 100B messages/day"*) into valid React Flow JSON containing nodes, positions, and edges.
   - `POST /api/ai/wizard`: 4-step wizard gathering:
     1. System Type (E-commerce, Social, Streaming, Ride-sharing, SaaS)
     2. Scale (DAU, Peak RPS, Storage)
     3. Non-Functional Requirements (Latency vs Consistency vs Availability)
     4. Cloud & Compliance Constraints
     Generates an optimal starter architecture tailored to the specified parameters.
   - `POST /api/ai/chat`: Context-aware streaming technical chat that receives the active canvas topology (node types, counts, protocols) and answers questions (e.g., *"How can I make this architecture survive an AWS region outage?"*).
   - `POST /api/ai/simulation-report`: Generates an executive debrief after a simulation run, analyzing peak load, dropped packets, bottlenecks, and specific remediation advice.
   - `POST /api/ai/interview-feedback`: Scores candidate interview submissions against a standard FAANG-style rubric.

---

### 2.8 Component Knowledge Base (`KnowledgePanel.tsx`, `knowledgeCards.json`)

#### Purpose & UX
Every component on the canvas has an integrated encyclopedia. Clicking the 📚 icon on any node opens a deep-dive knowledge drawer.

#### Structure of Knowledge Cards (51 Components)
1. **Overview**: Tagline and architectural purpose.
2. **When to Use vs When NOT to Use**: Clear trade-off analysis.
3. **Real-World Case Studies**: How Twitter, Netflix, Amazon, or Discord use the component.
4. **Key Metrics**: Crucial metrics to monitor (e.g., cache hit ratio, replication lag, disk IOPS).
5. **Common Pitfalls**: Anti-patterns (e.g., Redis cache stampede, Kafka partition imbalance).
6. **Interview Tips**: Questions interviewers ask about this component and how to answer them.
7. **Curated Reference Library**: Direct links to whitepapers, engineering blogs, videos, and books.

---

### 2.9 Learning Platform & Theory Tracks (`LearnPage.tsx`, `LessonPage.tsx`)

#### Purpose & UX
A complete system design curriculum spanning 7 progressive tracks, 49 comprehensive lessons, and 245 quiz questions.

#### Curriculum Structure
1. **System Design Fundamentals** (Beginner): Client-server, DNS, Load Balancers, Caching, Databases.
2. **Backend Engineering** (Intermediate): REST vs gRPC, Microservices, Authentication, Rate Limiting.
3. **Distributed Systems** (Advanced): CAP Theorem, Consistent Hashing, Replication, Sharding, Consensus.
4. **Cloud Architecture** (Intermediate): Multi-region, Cloud-native storage, Serverless, VPCs.
5. **Security Engineering** (Intermediate): WAF, DDoS protection, Zero Trust, Encryption at rest/transit.
6. **DevOps & SRE** (Intermediate): CI/CD, Observability, SLOs/SLIs, Chaos Engineering.
7. **Interview Preparation** (All levels): Frameworks, back-of-the-envelope calculations, trade-off communication.

#### Lesson Features
- Rich Markdown content with analogies and real-world system breakdowns.
- Interactive 5-question quizzes per lesson with immediate feedback and explanation.
- Progress tracked both locally and persisted to MongoDB (`POST /api/progress/lesson`).

---

### 2.10 Interactive Concepts Sandbox (`ConceptsPage.tsx`, `src/concepts/`)

#### Purpose & UX
Provides 15 distributed systems concepts, featuring **12 live interactive animations** where users can experiment with parameters and observe theoretical concepts in action.

| Concept | File | Interactive Mechanics |
|---|---|---|
| **CAP Theorem** | `CAPTheoremDemo.tsx` | Inject network partitions; observe system choose CP (reject writes) vs AP (serve stale data). |
| **Consistent Hashing** | `ConsistentHashingDemo.tsx` | Interactive hash ring with virtual nodes; add/remove nodes and observe minimal key remapping. |
| **Database Sharding** | `ShardingDemo.tsx` | Hash-based vs range-based sharding; route keys to specific shards and detect hotspots. |
| **Replication & Lag** | `ReplicationDemo.tsx` | Primary writes with synchronous vs asynchronous replication lag visualization. |
| **Circuit Breaker** | `CircuitBreakerDemo.tsx` | Closed, Open, Half-Open state transitions with error thresholds and cooldown timers. |
| **Rate Limiting** | `RateLimitingDemo.tsx` | Token Bucket vs Leaky Bucket vs Sliding Window log demonstrations under burst traffic. |
| **Load Balancing** | `LoadBalancingDemo.tsx` | Round Robin vs Least Connections vs IP Hash distribution across backend servers. |
| **Caching Strategies** | `CachingDemo.tsx` | Cache-Aside vs Write-Through vs Write-Behind with cache hits/misses and eviction policies. |
| **CQRS Pattern** | `CQRSDemo.tsx` | Independent write command models and read query models with async event synchronization. |
| **Two-Phase Commit** | `TwoPCAnimation.tsx` | Prepare and Commit/Abort phases across distributed transaction coordinators and participants. |
| **Saga Pattern** | `SagaAnimation.tsx` | Orchestrated vs Choreographed sagas with compensating transactions on step failure. |
| **Event Sourcing** | `EventSourcingAnimation.tsx` | Append-only event log with state rehydration and temporal query replays. |

---

### 2.11 System Design Interview Playground (`InterviewPage.tsx`, `InterviewSession.tsx`)

#### Purpose & UX
Simulates a real-world FAANG system design interview. Candidates are given a challenge, a 45-minute countdown, a live architecture canvas, progressive hints, and an AI interviewer.

#### Business Logic & Workflow
1. **Challenge Selection**:
   - Includes industry standard prompts: *Design Twitter's Tweet Feed*, *Design a Scalable URL Shortener (Bitly)*, *Design Uber's Real-Time Ride Matching System*.
2. **Timed Session**:
   - 45-minute countdown with warning at 5 minutes remaining.
   - Embedded canvas allows candidates to build their solution.
3. **AI Interviewer Chat**:
   - Candidates can ask clarifying questions; AI responds in the persona of a Staff Systems Architect.
4. **Scoring & Evaluation**:
   - Evaluates architectures across 5 dimensions: **Scalability**, **Reliability**, **Performance**, **Security**, and **Cost Efficiency**.
   - Invokes `POST /api/ai/interview-feedback` to generate detailed feedback, strengths, and areas for improvement.

---

### 2.12 Architecture Lifecycle & Version Control (`MyArchitectures.tsx`, `diagrams.ts`)

#### Features
- **Autosave**: Background autosave every 15 seconds to prevent work loss.
- **Visual Thumbnails**: Generates PNG canvas previews using `html-to-image`.
- **Version History & Rollback**: Maintains historical snapshots with one-click restore.
- **Forking**: Allows users to fork existing architectures into new diagrams.
- **JSON Import / Export**: Portable diagram schemas for sharing and offline backups.

---

### 2.13 Backend Architecture, Middleware & Security Pipeline

The backend is built with Express 5 and follows a robust middleware pipeline:

```
[Incoming Request]
       │
       ▼
1. Security Headers (Helmet)
       │
       ▼
2. Request Logger (devLogger / Morgan)
       │
       ▼
3. CORS Policy (Origin & Credentials validation)
       │
       ▼
4. Rate Limiting (express-rate-limit: API, Auth, and AI tiers)
       │
       ▼
5. Body Parser (express.json)
       │
       ▼
6. Input Sanitization (sanitizeInput - XSS & injection scrubbing)
       │
       ▼
7. Authentication Middleware (JWT verification -> req.user)
       │
       ▼
8. Plan Guard Middleware (planGuard - Free / Pro / Team tier enforcement)
       │
       ▼
9. Route Handlers (/api/auth, /api/diagrams, /api/ai, /api/registry, etc.)
       │
       ▼
10. Centralized Error Handler (errorHandler)
```

#### Dual-Mode MongoDB Storage
In `server/lib/mongodb.ts`, the database automatically connects to MongoDB Atlas if `MONGODB_URI` is present. If no environment variable is found, it spins up an embedded **`MongoMemoryServer`** with WiredTiger persistent disk storage in `.mongo-data`, ensuring developers can run the entire platform locally with zero external database configuration.

---

## 3. Current Project Status & Feature Health Audit

### 3.1 Sprint Milestones Overview

| Sprint | Focus Area | Status | Key Deliverables |
|---|---|---|---|
| **Sprint 1** | Canvas Foundation & Core Engine | ✅ 100% Complete | React Flow canvas, simulation engine, auth, MongoDB backend. |
| **Sprint 2** | AI Intelligence Layer | ✅ 100% Complete | Requirement wizard, AI generator, streaming chat, validation gate. |
| **Sprint 3** | Learning Platform & Concepts | ✅ 100% Complete | 7 theory tracks, 49 lessons, 12 concept sandboxes, interview session. |
| **Sprint 4** | Tool Registry & HLD Completeness | ✅ 100% Complete | 2050+ tools, SVG icons, synchronous connection rules, chaos decoupled. |
| **Sprint 5** | Low Level Design (LLD) Suite | 🚀 **READY TO START** | UML Class Designer, ERD Designer, API Designer, Sequence Diagrams. |

---

### 3.2 Feature Health Matrix (Verification & Audit)

| Subsystem / Feature | Route / Component | Verified Status | Notes / Recent Improvements |
|---|---|---|---|
| **Landing Page** | `/` (`LandingView.tsx`) | 🟢 Healthy | Hero chaos simulator, feature showcases, responsive design. |
| **User Authentication** | `/login`, `/register` | 🟢 Healthy | JWT issuance, password hashing, profile updates verified. |
| **Canvas & Node Drag/Drop** | `/canvas` (`Canvas.tsx`) | 🟢 Healthy | 4-sided dual handles, inline rename, toolbar portals. |
| **Tool Selection Modal** | `ToolSelectionModal.tsx` | 🟢 Healthy | 169 nodes, 2050 tools, simple-icons SVGs, 3-perspective cards. |
| **Connection Validation** | `src/data/registry/index.ts` | 🟢 Healthy | Synchronous, zero-lag blocking of invalid connections (e.g. client to DB). |
| **Simulation Physics** | `SimulationEngine.ts` | 🟢 Healthy | Queue dynamics, smoothstep metrics, P50-P99 latency, bottleneck detection. |
| **Chaos Injection** | `BottomBar.tsx` | 🟢 Healthy | 21 scenarios, crash, latency, partition, memory leak, auto-recovery. |
| **AI Architecture Gen** | `AIGeneratorPanel.tsx` | 🟢 Healthy | Groq Llama 3.3 + Gemini fallback; robust node mapping fixed. |
| **Requirement Wizard** | `RequirementWizard.tsx` | 🟢 Healthy | 4-step wizard generates custom architectures. |
| **Architecture Chat** | `ArchitectureChat.tsx` | 🟢 Healthy | Context-aware Q&A with live canvas topology. |
| **Post-Sim Report** | `SimulationReport.tsx` | 🟢 Healthy | Automatic report modal after 5s+ simulation run. |
| **Knowledge Base** | `KnowledgePanel.tsx` | 🟢 Healthy | 51 component knowledge cards with interview tips & references. |
| **Learning Tracks** | `/learn`, `/learn/:t/:l` | 🟢 Healthy | 7 tracks, 49 lessons, quizzes; progress saved to DB & localStorage. |
| **Concepts Sandboxes** | `/concepts`, `/concepts/:id` | 🟢 Healthy | 12 interactive demos (CAP, Hashing, Sharding, Replication, 2PC, Saga). |
| **Interview Mode** | `/interview`, `/interview/:id`| 🟢 Healthy | 45-min timer, live canvas, progressive hints, AI feedback scoring. |
| **Saved Architectures** | `/my-architectures` | 🟢 Healthy | Thumbnails, version rollback, autosave, JSON import/export. |
| **Security Lab View** | `/security` (`SecurityView.tsx`) | 🟡 Partial | UI styled and interactive; needs deep simulation backend tie-in. |
| **Kubernetes View** | `/k8s` (`K8sView.tsx`) | 🟡 Partial | Pod/service topology viewer; needs live K8s YAML generator. |

---

## 4. High Level Design (HLD) Playground: What We Can Add Next

While the HLD canvas is robust, a complete enterprise-grade system design platform requires several advanced capabilities to reach industry perfection:

```
+-----------------------------------------------------------------------------------+
|                        HLD PLAYGROUND EXPANSION ROADMAP                           |
+-----------------------------------------------------------------------------------+
|  1. Cloud Cost Estimator (AWS / GCP / Azure live SKU pricing calculator)         |
|  2. Infrastructure-as-Code (IaC) Exporter (Terraform HCL, K8s manifests, Compose) |
|  3. Real-Time Collaboration (Multi-user cursors via Yjs CRDT & WebSockets)        |
|  4. Multi-Region Topology Simulation (Cross-region replication & geo-latency)     |
|  5. Deep Packet Inspector & Protocol Analyzer (HTTP/2, gRPC, WebSocket frames)    |
|  6. Capacity Planning & Sizing Calculator (Storage, RAM, Network bandwidth)       |
+-----------------------------------------------------------------------------------+
```

### 4.1 Cloud Cost Estimator (AWS / GCP / Azure)
- **Live SKU Mapping**: Every tool selected on the canvas maps to real-world cloud SKUs (e.g., AWS RDS db.r6g.2xlarge, ALB, ElastiCache cluster, EKS worker nodes).
- **Cost Calculator**: Real-time monthly cost estimation based on RPS, data storage, and replica count.
- **Provider Comparison**: Side-by-side cost comparison showing AWS vs GCP vs Azure vs Self-Hosted Open Source.

### 4.2 Infrastructure-as-Code (IaC) Exporter
- **Terraform HCL Generator**: Converts the canvas graph into production-ready Terraform files (`main.tf`, `variables.tf`, `outputs.tf`) provisioning VPCs, subnets, load balancers, and databases.
- **Kubernetes Manifest Generator**: Generates K8s Deployments, Services, Ingresses, and ConfigMaps for compute nodes.
- **Docker Compose**: One-click download of a `docker-compose.yml` to spin up the entire designed architecture locally.

### 4.3 Real-Time Multi-User Collaboration
- **CRDT Engine**: Integration of **Yjs** for conflict-free real-time state synchronization.
- **Presence & Cursors**: See teammates' live mouse cursors, active selections, and edits in real time.
- **Architecture Review Mode**: Live presentation mode where a lead architect drives the canvas while team members follow along with voice or text comments.

### 4.4 Multi-Region & Geo-Distribution Simulation
- **Global Map View**: Place nodes across geographic regions (e.g., `us-east-1`, `eu-west-1`, `ap-southeast-1`).
- **Geo-Latency Physics**: Simulates cross-Atlantic (70ms) and trans-Pacific (150ms) speed-of-light delays.
- **Active-Active vs Active-Passive**: Test failover when an entire AWS region experiences an outage.

---

## 5. Low Level Design (LLD) Playground: The Complete Blueprint

To fulfill the vision of a **complete system design application**, SystemCraft must provide both **High Level Design (HLD)** (the big picture: services, databases, caches, queues) and **Low Level Design (LLD)** (the granular design: classes, design patterns, schemas, API contracts, sequence flows).

```
+-----------------------------------------------------------------------------------+
|                        LOW LEVEL DESIGN (LLD) PLAYGROUND                          |
+-----------------------------------------------------------------------------------+
|  +---------------------------+  +--------------------------+  +----------------+  |
|  |    UML CLASS DESIGNER     |  |   DATABASE ERD DESIGNER  |  |  API DESIGNER  |  |
|  | - Class/Interface Nodes   |  | - Table / Column Builder |  | - REST / gRPC  |  |
|  | - Inheritance / Aggreg.   |  | - PK / FK Crow's Foot    |  | - GraphQL Spec |  |
|  | - Design Pattern Templates|  | - SQL DDL Generation     |  | - OpenAPI 3.0  |  |
|  +---------------------------+  +--------------------------+  +----------------+  |
|  +---------------------------+  +--------------------------+  +----------------+  |
|  |     SEQUENCE DIAGRAMS     |  |   STATE MACHINE STUDIO   |  |  OOD INTERVIEW |  |
|  | - Actors & Lifelines      |  | - States & Transitions   |  | - Parking Lot  |  |
|  | - Sync/Async Messages     |  | - Guard Conditions       |  | - Elevator Sys |  |
|  | - Alt/Loop Fragments      |  | - Code Generation        |  | - Splitwise    |  |
|  +---------------------------+  +--------------------------+  +----------------+  |
+-----------------------------------------------------------------------------------+
```

---

### 5.1 UML Class Diagram Designer

#### Purpose
Enables engineers to design object-oriented class hierarchies, interfaces, methods, and relationships for modular software components.

#### Features & Components
1. **Class & Interface Nodes**:
   - **Properties**: Visibility (`+` public, `-` private, `#` protected), name, type, default value.
   - **Methods**: Visibility, name, parameters, return type, abstract/static flags.
   - **Stereotypes**: `<<interface>>`, `<<abstract>>`, `<<singleton>>`, `<<factory>>`.
2. **UML Relationship Connectors**:
   - **Inheritance** (solid line with hollow closed arrow $\triangle$)
   - **Realization / Implementation** (dashed line with hollow closed arrow $\triangle$)
   - **Composition** (solid line with filled diamond $\blacklozenge$)
   - **Aggregation** (solid line with hollow diamond $\lozenge$)
   - **Association & Dependency** (open arrows $\rightarrow$)
3. **Design Pattern Templates**:
   - One-click insertion of classic Gang of Four (GoF) patterns:
     - Factory / Abstract Factory
     - Singleton & Builder
     - Observer / Pub-Sub
     - Strategy & State
     - Decorator & Adapter

---

### 5.2 Database Schema & ERD Designer

#### Purpose
Enables visual modeling of relational and NoSQL database schemas with automated migration generation.

#### Features & Components
1. **Table Builder**:
   - Column name, data type (VARCHAR, INT, UUID, TIMESTAMP, JSONB), nullable, unique, default.
   - Primary Key (PK) and Foreign Key (FK) flags.
   - Index markers (B-Tree, Hash, GIN, Composite indexes).
2. **Relationship Notation**:
   - Crow's foot notation for One-to-One ($1:1$), One-to-Many ($1:N$), and Many-to-Many ($M:N$).
3. **SQL DDL Generation**:
   - Real-time generation of SQL schemas for PostgreSQL, MySQL, SQLite, and SQL Server.
   - Supports copy-to-clipboard or direct `.sql` file download.
4. **NoSQL Document Modeling**:
   - Visual schema designer for MongoDB collections (nested sub-documents) and DynamoDB (Partition Key + Sort Key definitions with Global Secondary Indexes).

---

### 5.3 API Contract & Interface Designer

#### Purpose
Allows engineers to specify API contracts, endpoints, data transfer objects (DTOs), and communication protocols between services.

#### Features & Components
1. **REST Endpoint Designer**:
   - Method (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`), path (`/api/v1/orders/{id}`), path/query parameters.
   - Request body schema and response status codes (`200 OK`, `400 Bad Request`, `404 Not Found`).
2. **OpenAPI / Swagger 3.0 Export**:
   - Live generation of standard OpenAPI YAML/JSON specs directly from the visual interface.
3. **gRPC & Protocol Buffers Studio**:
   - Visual service definition with RPC methods and Protobuf message structures.
   - Export to `.proto` files.
4. **GraphQL Schema Designer**:
   - Types, Queries, Mutations, Subscriptions, and Resolvers visual graph.

---

### 5.4 Sequence Diagram Studio

#### Purpose
Captures dynamic interaction over time between actors, services, and databases during a specific workflow (e.g., *"User Checkout Flow"* or *"Token Refresh Flow"*).

#### Features & Components
1. **Lifelines & Actors**:
   - Vertical lifelines representing User, API Gateway, Order Service, Payment Gateway, and Database.
2. **Message Arrows**:
   - Synchronous Request (solid line with filled arrow $\rightarrow$).
   - Asynchronous Message (solid line with open arrow $\rightarrow$).
   - Return Response (dashed line with open arrow $\dashrightarrow$).
3. **Control Fragments**:
   - `alt` (conditional branch / if-else), `loop` (for/while loops), `opt` (optional step), `par` (parallel execution).
4. **PlantUML & Mermaid Export**:
   - One-click copy of the sequence diagram as Mermaid.js or PlantUML code.

---

### 5.5 State Machine Diagram Studio

#### Purpose
Models the lifecycle and state transitions of complex business entities (e.g., Order: `PLACED` $\rightarrow$ `PAID` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED` or `CANCELLED`).

#### Features & Components
1. **States**: Initial state, intermediate states, composite/nested states, final state.
2. **Transitions**: Event triggers, guard conditions `[isPaymentValid]`, and transition actions `/sendNotification()`.
3. **Code Generation**: Generates state-machine code skeletons in Java (Spring Statemachine) or TypeScript (XState).

---

### 5.6 Object-Oriented Design (OOD) Interview Practice

#### Purpose
System design interviews at top tech companies often test Low Level Design (OOD). SystemCraft will provide dedicated interactive interview challenges.

#### Built-in OOD Challenges
1. **Design a Parking Lot System**: Multiple vehicle types (Car, Bike, Truck), spot allocation strategies, fee calculation algorithms.
2. **Design an Elevator Control System**: Multi-elevator scheduling algorithms (SCAN / LOOK), dispatch logic, door safety states.
3. **Design a Chess Game**: Board representation, piece movement validation, checkmate detection, turn management.
4. **Design Splitwise (Expense Sharing)**: Equal/exact/percentage splits, debt simplification graph algorithms.
5. **Design BookMyShow / Movie Ticket Booking**: Concurrent seat reservation, lock timeouts, payment callbacks.

---

### 5.7 The Unified HLD ↔ LLD Drill-Down Bridge

The ultimate superpower of SystemCraft: **Connecting High Level Design directly to Low Level Design**.

```
[HLD Canvas]
┌─────────────────────────────────────────────────────────────┐
│  [Client] ──> [API Gateway] ──> [Order Service] ──> [DB]    │
└───────────────────────────────────────┬─────────────────────┘
                                        │ (Double Click)
                                        ▼
[LLD Drill-Down View for "Order Service"]
┌─────────────────────────────────────────────────────────────┐
│  • API Tab:      POST /orders, GET /orders/{id}             │
│  • Class Tab:    OrderController, OrderService, Repository  │
│  • Sequence Tab: Checkout Workflow Sequence Diagram         │
│  • Schema Tab:   orders, order_items, payments ERD          │
└─────────────────────────────────────────────────────────────┘
```

- When viewing an HLD architecture, double-clicking any microservice node (e.g., `Order Service`) opens its **LLD Drill-Down Studio**.
- Inside, the user can define the API contracts, class structure, sequence flows, and database tables specific to that service.
- This creates a **truly unified architecture platform** spanning from 10,000-foot cloud topology down to class methods and database columns.

---

## 6. Actionable Improvements & Implementation Plan

### 6.1 Recommended Fixes & Polish for Existing Features
1. **Security & K8s Module Integration**: Replace the static views in `SecurityView.tsx` and `K8sView.tsx` with dynamic views linked directly to the active canvas architecture.
2. **Export System**: Add automated export options for SVG, high-resolution PNG, and PDF documentation directly from the canvas toolbar.
3. **Settings Page Polish**: Update the UI text in `Settings.tsx` to clearly communicate that API keys are stored strictly in client localStorage and only transmitted securely via HTTPS headers to the backend proxy.

### 6.2 Implementation Phases for New Features

```
PHASE 1: HLD Polish & Exporters (Immediate)
├── Cloud Cost Estimator widget (live SKU pricing)
├── Infrastructure-as-Code exporter (Terraform & K8s YAML)
└── Canvas SVG / PDF export toolbar

PHASE 2: LLD Foundation (Next Sprint)
├── LLD Canvas Mode toggle in main navigation
├── UML Class Diagram node types & relationship connectors
├── Database Schema / ERD table builder & SQL DDL generator
└── API Contract / OpenAPI 3.0 designer

PHASE 3: LLD Advanced & OOD Interview
├── Sequence Diagram studio (lifelines, sync/async, alt/loop)
├── State Machine designer with code generation
└── 5 classic OOD interview challenges (Parking Lot, Elevator, etc.)

PHASE 4: The Unified Bridge & Collaboration
├── HLD ↔ LLD drill-down navigation
└── Real-time multi-user collaboration (Yjs CRDT + WebSockets)
```

---

*SystemCraft Documentation — Comprehensive Technical Blueprint & Architecture Guide.*
