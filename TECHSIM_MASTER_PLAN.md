# TechSim — System Design University
## Complete Master Plan v3.0
**PM: Tim | Updated: June 2026**

---

## 🎯 VISION STATEMENT

TechSim is the world's most complete System Design learning and collaboration platform.
A beginner can learn what a Load Balancer is.
A senior engineer can design Netflix-scale architecture.
A team can collaborate in real-time on a production system.
An interviewer can run candidates through live system design challenges.

**One platform. Every concept. Every tool. Every skill level.**

---

## 👥 TEAM

| Name | Tool | Role |
|------|------|------|
| Tim | Claude (me) | Project Manager — owns roadmap, reviews all output |
| Ava | Claude Code | Lead Frontend Engineer |
| Rex | Codex | Simulation & Engine Engineer |
| Kai | Antigravity | Backend & Infrastructure Engineer |
| Zara | Stitch | UI/UX Designer |
| Nova | ChatGPT | Content, Prompts & Documentation |

---

## 📊 CURRENT STATUS (Honest Audit)

### Done ✅
- Canvas with drag-and-drop (basic)
- Animated edges
- Simulation engine (basic)
- Security Lab UI (shell only)
- K8s module UI (shell only)
- MongoDB + Express backend
- JWT auth
- Groq AI diagram generator
- Theme switcher (dark/light/system)
- Node settings panel (basic)
- Validation engine (basic rules)
- Bottom metrics bar

### In Progress 🟡
- Real service icons (@icons-pack/react-simple-icons)
- Reference library per component
- Feedback form
- Post-simulation report
- Gemini fallback AI
- Node handle fixes (all 4 sides)
- Edge deletion
- Edge routing improvements

### Not Started ❌ (Everything below)
- Requirement gathering wizard
- Pre-simulation validation gate
- Saved architectures page
- Settings page
- HLD/LLD mode
- Component grouping
- Architecture Q&A chat
- Tool recommendation engine
- Learning paths
- Architecture scoring/gamification
- Sharding visualizer
- CAP theorem interactive
- Consistent hashing demo
- CQRS/Saga visualizers
- Real-time collaboration (Yjs)
- DB Schema Designer module
- Network Topology module
- DevOps/CI-CD module
- Algorithm visualizer module
- Message Broker deep-dive module
- API Designer (LLD)
- ERD Designer (LLD)
- Class diagram (LLD)
- Sequence diagram (LLD)
- State machine diagram (LLD)
- Community blueprints
- Sharing system
- Export (PDF, PNG, Terraform, YAML, IaC)
- Interview mode
- Cost estimator (AWS/GCP/Azure)
- Mobile responsive
- Progressive Web App
- Billing system (Free/Pro/Team)
- Landing page (proper)
- Documentation site

---

## 🗓️ SPRINT PLAN — 10 SPRINTS TO COMPLETION

---

### SPRINT 1 — Canvas Foundation (CURRENT)
**Goal: Canvas that works like a professional tool**
**Duration: 1 week**

#### Ava (Claude Code):
- [ ] Fix node handles — all 4 sides visible on hover
- [ ] Fix edge deletion — click × button OR backspace key
- [ ] Fix edge routing — proper smoothstep with tight corners
- [ ] Fix packet animation — follow actual SVG path
- [ ] Fix data flow direction — always source→target
- [ ] Button overlap — use NodeToolbar, float above node
- [ ] Invisible node bug — CSS variable fallbacks
- [ ] Real service icons via @icons-pack/react-simple-icons
- [ ] Reference library panel per component
- [ ] Feedback form (floating button, every page)
- [ ] Post-simulation expert report modal
- [ ] Component grouping (select multiple → right-click → Group)

#### Rex (Codex):
- [ ] Fix packet spawn rate — max 3 per edge, proper timing
- [ ] Speed multiplier wired to slider
- [ ] Traffic multiplier wired to slider
- [ ] Chaos injection wired to selected node type
- [ ] Post-chaos recovery tracking (measure recovery time)
- [ ] Chaos event log (what happened, when, impact)

#### Kai (Antigravity):
- [ ] Feedback API + MongoDB model
- [ ] POST /api/ai/simulation-report route
- [ ] Gemini fallback — unified callAI() function
- [ ] GET /api/diagrams/my — saved architectures list
- [ ] Autosave every 30 seconds (debounced)

#### Deliverable: Canvas feels professional. Simulation makes sense. AI reports work.

---

### SPRINT 2 — Intelligence Layer
**Goal: AI makes TechSim smart, not just pretty**
**Duration: 1 week**

#### Ava (Claude Code):
- [ ] Requirement Gathering Wizard (4-step modal on new canvas)
  - Step 1: What are you building? (system type selector)
  - Step 2: Scale (DAU, RPS, storage sliders)
  - Step 3: NFRs (availability, consistency, latency — drag to rank)
  - Step 4: Constraints (cloud provider, compliance, budget)
  - After wizard: AI generates tailored starter architecture
- [ ] Pre-Simulation Validation Gate
  - Blocking issues list (cannot run)
  - Warnings list (can run with risks)
  - Auto-fix buttons for common issues
  - Clear explanation WHY each issue matters
- [ ] Architecture Q&A Chat Panel
  - Floating chat button on canvas
  - Context-aware (knows your current nodes/edges)
  - Streaming responses
  - Suggested questions based on architecture
- [ ] Smart Tool Recommendation Panel
  - Triggers when user adds Database/Queue/Cache node
  - Shows 3 options with comparison (SQL vs NoSQL vs NewSQL etc)
  - Real-world usage examples (Netflix uses X, Uber uses Y)
  - Cost estimates per option
  - "Add this component" button

#### Kai (Antigravity):
- [ ] POST /api/ai/wizard — generate architecture from requirements
- [ ] POST /api/ai/validate — pre-simulation deep validation
- [ ] POST /api/ai/chat — streaming Q&A about architecture
- [ ] POST /api/ai/recommend — tool recommendation by context
- [ ] POST /api/ai/explain — explain any concept in depth

#### Rex (Codex):
- [ ] Sharding simulation — visual data distribution across nodes
- [ ] Replication simulation — primary writes, replica reads, lag meter
- [ ] Circuit breaker pattern — open/half-open/closed state animation

#### Deliverable: TechSim gives expert advice in real-time. Feels like having a senior engineer looking over your shoulder.

---

### SPRINT 3 — Learning Platform
**Goal: A complete curriculum from beginner to senior**
**Duration: 1.5 weeks**

#### Ava (Claude Code):
- [ ] Learning Paths page (/learn)
  Seven tracks:
  1. System Design Fundamentals (Beginner)
  2. Backend Engineering (Intermediate)
  3. Distributed Systems (Advanced)
  4. Cloud Architecture (Intermediate)
  5. Security Engineering (Intermediate)
  6. DevOps & SRE (Intermediate)
  7. Interview Preparation (All levels)
  Each track: 7-10 lessons, each lesson has theory + hands-on canvas exercise
- [ ] Advanced Concepts Library (/concepts)
  Interactive demos for:
  - CAP Theorem simulator (inject partition → see CP vs AP)
  - Database Sharding (drag data → see which shard)
  - Consistent Hashing (ring visualization, add/remove nodes)
  - Database Replication (primary-replica lag animation)
  - CQRS Pattern (command vs query side by side)
  - Saga Pattern (step-through distributed transaction)
  - Event Sourcing (rebuild state from events)
  - Rate Limiting algorithms (token bucket, leaky bucket, sliding window)
  - Load Balancing algorithms (round robin, least connections, ip hash)
  - Caching patterns (cache-aside, write-through, write-behind)
  - Circuit Breaker (states and transitions)
  - Two-Phase Commit (coordinator + participants animation)
  - Paxos/Raft consensus (simplified visual)
- [ ] Architecture Scoring System
  Score 0-100 after each simulation
  Categories: Scalability, Reliability, Security, Performance, Cost
  Badges and achievements
  Leaderboard (optional, for gamification)
- [ ] Saved Architectures page (/my-architectures)
  Grid of architecture thumbnails
  Fork, share, delete options
  Version history (last 10 saves)
  Import/export JSON

#### Nova (ChatGPT — content only):
- [ ] Write theory content for all 7 learning tracks
- [ ] Write 50+ component knowledge cards
- [ ] Write 20 preset scenario descriptions with learning objectives
- [ ] Write quiz questions for each lesson (5 per lesson)
- [ ] Write chaos scenario explanations (what happens, why, how to fix)

#### Deliverable: A complete learning curriculum. Beginner can go from zero to designing Netflix architecture through guided lessons.

---

### SPRINT 4 — HLD Complete + LLD Foundation
**Goal: Full HLD tools + start of LLD**
**Duration: 1.5 weeks**

#### Ava (Claude Code):
HLD Completion:
- [ ] Component Selection Modal (press K or click +)
  Smart search across all 200+ components
  Compatibility checker (is this component compatible with your stack?)
  Quick add suggestions based on current architecture
  Filter by: AWS, GCP, Azure, Generic, Category
- [ ] Cloud Cost Estimator
  Every node maps to real cloud SKUs
  Live cost meter as you build
  AWS vs GCP vs Azure comparison
  Export cost breakdown as CSV
- [ ] Export System
  PNG (current canvas as image)
  PDF (full diagram with legend)
  JSON (re-importable)
  Terraform HCL (generates IaC from diagram)
  Kubernetes YAML (for K8s nodes)
  docker-compose.yml (for container nodes)
  Animated GIF (of simulation run)

LLD Mode (new toggle in toolbar):
- [ ] API Designer
  Define REST endpoints (method, path, request, response)
  GraphQL schema designer
  OpenAPI/Swagger export
  Authentication requirements per endpoint
- [ ] ERD Designer
  Table nodes with columns, types, constraints
  FK relationships with crow's foot notation
  Index markers
  SQL DDL generation
  Switch between SQL and NoSQL schema views
- [ ] Sequence Diagram
  Actors and lifelines
  Synchronous and async messages
  Alt/loop/opt fragments
  Export as image or PlantUML

#### Rex (Codex):
- [ ] Advanced sharding scenarios (hotspot detection)
- [ ] Multi-region simulation (latency between regions)
- [ ] Eventual consistency visualization (sync delay animation)

#### Deliverable: Full HLD + foundation LLD. Can now design both the big picture and the detail.

---

### SPRINT 5 — LLD Complete + Interview Mode
**Goal: Complete LLD suite and interview preparation tools**
**Duration: 1 week**

#### Ava (Claude Code):
LLD Completion:
- [ ] Class Diagram Designer
  Classes, interfaces, abstract classes
  Inheritance, composition, aggregation
  Methods and properties with types
  UML notation
- [ ] State Machine Diagram
  States, transitions, events, guards
  Entry/exit actions
  Nested states
- [ ] Data Flow Diagram
  Processes, data stores, external entities
  Data flows with labels
  Level 0 (context) and Level 1 (system) views

Interview Mode:
- [ ] Interview Challenge Mode
  Timer (45 min per challenge)
  Interviewer-style question prompts
  Progressive hints system
  Scoring rubric (clarity, completeness, tradeoffs, scale)
  AI plays interviewer role — asks follow-up questions
  Record and replay your design session
  Sample: "Design Twitter's tweet feed for 500M users"
  Sample: "Design a URL shortener handling 100K RPS"
  Sample: "Design a distributed cache"
  20+ pre-built interview challenges
- [ ] Settings Page (/settings)
  Profile management
  Canvas preferences (grid, snap, edge style)
  Simulation defaults (RPS, capacity)
  AI provider settings (Groq key, Gemini key)
  Notification preferences
  Export defaults
  Danger zone (delete account, export data)

#### Deliverable: Complete LLD tools. Can practice full system design interviews with AI feedback.

---

### SPRINT 6 — Real-time Collaboration
**Goal: Multiple people working on same canvas simultaneously**
**Duration: 1.5 weeks**

#### Ava (Claude Code):
- [ ] Real-time canvas sync (Yjs + PartyKit or Supabase Realtime)
  Multiple cursors visible with user names and colors
  Every node move/add/delete syncs instantly
  Edge connections sync in real-time
  Awareness: see who is online in this document
  Conflict resolution: CRDT-based (last write wins per node)
- [ ] Collaboration UI
  Share button → generates collaboration link
  View-only link (for presentations)
  Edit link (for team collaboration)
  Online users panel (avatars in top right)
  User cursor labels
  "Someone is editing this node" indicator
- [ ] Comment System
  Click any node → "Add Comment"
  Comment threads per node
  @mention teammates
  Resolve/unresolve comments
  Comment notifications
- [ ] Collaboration Modes
  Design Mode: everyone can edit
  Review Mode: one presenter, others watch
  Interview Mode: one candidate, one interviewer role
  Teaching Mode: one teacher, students can fork but not edit main

#### Kai (Antigravity):
- [ ] WebSocket server (Socket.io or native WS)
- [ ] Yjs document sync over WebSockets
- [ ] Presence/awareness protocol
- [ ] Room management (create, join, leave)
- [ ] Collaboration session persistence
- [ ] Access control (view/edit/admin per user per diagram)

#### Rex (Codex):
- [ ] Collaborative simulation (everyone sees same simulation state)
- [ ] Chaos injection in collaboration (one person injects, all see it)

#### Deliverable: Multiple engineers can design together in real-time. Perfect for team architecture reviews and group study.

---

### SPRINT 7 — DB Schema + Network Modules
**Goal: Full DB Schema Designer and Network Topology Lab**
**Duration: 1.5 weeks**

#### Ava (Claude Code):
DB Schema Designer Module (/db-schema):
- [ ] Visual table builder
  Drag to create tables
  Add columns: name, type, nullable, default, PK, FK, unique, index
  Relationship lines: one-to-one, one-to-many, many-to-many
  Crow's foot notation
- [ ] SQL Generation
  Real-time SQL DDL generation from diagram
  Supports PostgreSQL, MySQL, SQLite, SQL Server
  Copy to clipboard or download .sql file
- [ ] Reverse Engineering
  Paste SQL → diagram auto-generated
  Paste JSON schema → diagram auto-generated
- [ ] NoSQL Schema Designer
  MongoDB document structure (nested JSON tree)
  DynamoDB partition key / sort key designer
  Cassandra partition and clustering key designer
- [ ] Query Planner Visualization
  Paste a query → show which indexes are hit
  EXPLAIN plan as visual tree
  Highlight slow query paths
- [ ] Normalization Guide
  AI analyzes schema → suggests normalization (1NF, 2NF, 3NF)
  Visual before/after comparison

Network Topology Lab (/network):
- [ ] Network components
  Router, Switch, Firewall, VPN Gateway
  Subnet (VPC) grouping boxes
  Internet cloud node
  Client devices
  Server nodes
- [ ] Layer toggle
  L2 view: MAC addresses, switches
  L3 view: IP addressing, routing tables
  Application view: services and ports
- [ ] AWS VPC Designer
  VPC, subnets (public/private), NAT gateway
  Security groups, NACLs
  Route tables
  Internet gateway, VPN gateway
  Generate CloudFormation/Terraform from diagram
- [ ] Ping/Traceroute Simulation
  Animate ICMP packets between nodes
  Show hop count and RTT at each hop
  Detect unreachable paths
- [ ] Packet Inspector
  Click any link → see what protocols are flowing
  Show ports, protocols, data rates
  Filter by protocol type

#### Deliverable: Complete DB and Network design tools. A DBA can design schemas. A network engineer can design topology.

---

### SPRINT 8 — DevOps + Algorithm + Message Broker Modules
**Goal: Three remaining specialty modules**
**Duration: 1.5 weeks**

#### Ava (Claude Code):
DevOps / CI-CD Pipeline Module (/devops):
- [ ] Pipeline builder
  Drag stages: Source → Build → Test → Scan → Package → Deploy → Monitor
  Parallel jobs visualization
  Stage dependencies and conditions
  Environment promotion (dev → staging → prod)
- [ ] Pipeline templates
  GitHub Actions pattern
  GitLab CI pattern
  Jenkins pipeline
  ArgoCD GitOps
- [ ] Deployment strategies visual
  Rolling update (% traffic animation)
  Blue-green deployment (traffic switch animation)
  Canary release (10% → 50% → 100% progression)
  Feature flags visualization
- [ ] Pipeline simulation
  Animate a commit flowing through all stages
  Simulate stage failures and rollback
  Show build time and test coverage metrics
  Trigger alert on failure

Algorithm Visualizer Module (/algorithms):
- [ ] Sorting algorithms (step-through with speed control)
  Bubble, Selection, Insertion, Merge, Quick, Heap, Radix
  Side-by-side comparison mode
  Complexity meter (time and space, updates live)
- [ ] Graph algorithms
  BFS, DFS (with stack/queue visualization)
  Dijkstra's shortest path (priority queue visualization)
  A* pathfinding (heuristic visualization)
  Bellman-Ford, Floyd-Warshall
  Topological sort, Kahn's algorithm
- [ ] Tree operations
  BST insert/delete/search
  AVL rotations (LL, RR, LR, RL)
  Red-Black tree (color flips, rotations)
  B-Tree splits and merges (for DB index learning)
  Trie insert and search
- [ ] Hash Tables
  Separate chaining visualization
  Open addressing (linear/quadratic probing)
  Robin Hood hashing
  Consistent hashing (for distributed systems)
- [ ] Dynamic Programming
  Grid visualization (fill animation)
  Memoization tree
  Knapsack, LCS, LIS, Edit Distance
- [ ] User input
  User can input their own array/graph
  Step through with Next/Previous buttons
  Speed slider (slow to instant)
  Show current pseudocode line highlighted

Message Broker Deep-Dive Module (/messaging):
- [ ] Kafka Simulator
  Visual topic with partitions
  Producers writing to specific partitions
  Multiple consumer groups reading at different offsets
  Consumer lag meter
  Offset commit visualization
  Broker failure and leader election
  Replication factor visualization
- [ ] Redis Deep-Dive
  Keyspace explorer (live key browser)
  Data structure visualizations
    String: simple key-value
    List: linked list visualization
    Set: unordered collection
    Sorted Set: score-ordered, skip list animation
    Hash: field-value map
    Stream: append-only log
  TTL expiry animation
  Pub/Sub channel visualization
  LRU/LFU eviction animation
  Redis Cluster: slot distribution across nodes
- [ ] RabbitMQ Simulator
  Exchange types: Direct, Fanout, Topic, Headers
  Routing key matching visualization
  Queue binding
  Dead-letter queue
  Message acknowledgment flow
  Priority queue

#### Deliverable: DevOps, algorithms, and messaging modules complete. Platform covers every major CS topic.

---

### SPRINT 9 — Community + Sharing + Polish
**Goal: Community features that make TechSim viral**
**Duration: 1 week**

#### Ava (Claude Code):
- [ ] Community Blueprints page (/blueprints)
  100+ pre-built architectures (Netflix, Uber, WhatsApp, Twitter, etc.)
  Filter by: complexity, company, domain, scale
  Fork any blueprint to your canvas
  User-submitted blueprints (with moderation)
  Upvote/bookmark system
  "Most forked this week" trending section
- [ ] Architecture sharing
  Public share link (view-only)
  Embed in blog/docs (iframe)
  Export as beautiful PNG with TechSim watermark
  Twitter/LinkedIn share with preview image
- [ ] Profile page (/profile/:username)
  Public architectures
  Stats: designs created, simulations run, chaos events
  Badges earned
  Learning path progress (public)
- [ ] Architecture comments
  Public comment threads on shared architectures
  Reply threads
  Like/helpful votes
- [ ] Proper landing page (/)
  Hero with live canvas animation
  Feature sections for all modules
  Testimonials section
  Pricing section
  vs competitors comparison
  CTA: "Start designing free"
- [ ] Documentation site (/docs)
  Getting started guide
  Component reference
  Simulation guide
  API reference
  Keyboard shortcuts
  Video tutorials

#### Deliverable: Platform can go viral. Users share architectures, community grows, TechSim becomes the go-to resource.

---

### SPRINT 10 — Production Ready
**Goal: Secure, fast, scalable, monetizable**
**Duration: 1 week**

#### Ava (Claude Code):
- [ ] Mobile responsive (all pages except canvas)
- [ ] Progressive Web App (installable)
- [ ] Keyboard shortcuts (comprehensive)
  Cmd+K — component search
  Cmd+Z/Y — undo/redo
  Delete — delete selected
  Cmd+G — group selected
  Cmd+S — save
  Cmd+D — duplicate
  Cmd+A — select all
  Escape — deselect/close panel
  Space+drag — pan canvas
  Cmd+scroll — zoom
- [ ] Onboarding flow (first-time users)
  Welcome tour (7 steps)
  First architecture tutorial (guided)
  First simulation walkthrough

#### Kai (Antigravity):
- [ ] Billing integration (Stripe)
  Free: 5 diagrams, no collaboration, basic sim
  Pro ($12/mo): unlimited, collaboration, all modules, AI reports
  Team ($49/mo): shared workspace, admin, priority support
- [ ] Rate limiting (API calls per plan)
- [ ] Usage analytics (PostHog or Mixpanel)
- [ ] Error monitoring (Sentry)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] CDN for static assets
- [ ] Database backups (automated)
- [ ] Security audit
  OWASP Top 10 checklist
  Input sanitization
  Rate limiting on all routes
  Helmet.js headers
  CORS properly configured

#### Deliverable: Production-ready platform that can handle real users and generate revenue.

---

## 🗂️ COMPLETE FEATURE REGISTRY

Every feature TechSim will have, categorized by module:

### Core Canvas
- Infinite canvas with zoom/pan
- Drag-and-drop from sidebar
- All 4-side connection handles
- Custom edge routing (smooth, straight, bezier)
- Edge deletion (× button + backspace)
- Node resize
- Node grouping with labeled boxes
- Component search modal (press K)
- Undo/redo (unlimited)
- Copy/paste nodes
- Keyboard shortcuts
- Mini-map
- Auto-layout
- Snap-to-grid
- Canvas export (PNG, PDF, SVG)
- JSON import/export
- Auto-save

### System Design Module (HLD)
- 200+ draggable components with real icons
- AWS, GCP, Azure service icons
- Open-source tool icons
- Component knowledge panel (click 📚)
- Reference library (docs, videos, papers, books)
- Requirement gathering wizard
- AI diagram generator (text → architecture)
- Pre-simulation validation gate
- Simulation engine (traffic, latency, RPS)
- Chaos injection (50+ scenarios, component-specific)
- Speed and traffic sliders
- Live metrics (RPS, P99, errors, active nodes)
- Post-simulation expert AI report
- Architecture scoring (0-100)
- Architecture Q&A chat
- Smart tool recommendations
- Cloud cost estimator (AWS/GCP/Azure)
- Component grouping (Processing, Storage, etc.)
- Preset architectures (100+)
- Export: PNG, PDF, Terraform, K8s YAML, docker-compose

### LLD Tools
- API Designer (REST/GraphQL endpoints)
- ERD Designer (tables, columns, relationships)
- Class Diagram (UML)
- Sequence Diagram
- State Machine Diagram
- Data Flow Diagram
- OpenAPI/Swagger export
- SQL DDL generation

### DB Schema Module
- Visual table builder
- SQL generation (PostgreSQL, MySQL, SQLite)
- Reverse SQL → diagram
- NoSQL schema (MongoDB, DynamoDB, Cassandra)
- Query planner visualization
- Normalization guide (1NF, 2NF, 3NF)
- Index advisor

### Network Module
- Network topology components (router, switch, firewall, VPN)
- AWS VPC designer
- OSI layer toggle (L2/L3/Application)
- Subnet/VPC grouping
- Ping/traceroute simulation
- Packet inspector
- CloudFormation/Terraform export

### DevOps Module
- CI/CD pipeline builder
- Pipeline templates (GitHub Actions, GitLab, Jenkins, ArgoCD)
- Deployment strategies (rolling, blue-green, canary)
- Pipeline simulation (commit flowing through stages)
- Feature flag visualization

### Algorithm Module
- Sorting: Bubble, Selection, Insertion, Merge, Quick, Heap, Radix, Counting, Radix
- Graph: BFS, DFS, Dijkstra, A*, Bellman-Ford, Floyd-Warshall, Topological Sort
- Trees: BST, AVL, Red-Black, B-Tree, Trie
- Hash: Chaining, Open Addressing, Robin Hood, Consistent Hashing
- Dynamic Programming: Grid fill, Knapsack, LCS, LIS, Edit Distance
- Custom input, speed control, pseudocode highlight, complexity meter

### Message Broker Module
- Kafka: topics, partitions, consumer groups, offset, lag, replication, leader election
- Redis: all data structures, TTL, pub/sub, cluster, eviction
- RabbitMQ: exchanges, routing, DLQ, acknowledgment, priority queues

### Concepts Library (Interactive)
- CAP Theorem simulator
- Database Sharding (range vs hash vs consistent)
- Consistent Hashing ring
- Database Replication (sync vs async, lag)
- CQRS Pattern
- Saga Pattern (choreography + orchestration)
- Event Sourcing
- Rate Limiting algorithms
- Load Balancing algorithms
- Caching patterns
- Circuit Breaker states
- Two-Phase Commit
- Paxos/Raft consensus (simplified)

### Learning Paths
- Track 1: System Design Fundamentals
- Track 2: Backend Engineering
- Track 3: Distributed Systems
- Track 4: Cloud Architecture
- Track 5: Security Engineering
- Track 6: DevOps & SRE
- Track 7: Interview Preparation
- Quizzes per lesson
- Progress tracking
- Certificates

### Interview Mode
- 20+ interview challenges
- 45-minute timer
- AI plays interviewer (asks follow-ups)
- Progressive hints
- Scoring rubric
- Record and replay sessions
- Share interview performance

### Collaboration
- Real-time multi-user canvas (Yjs)
- Multiple cursors with names
- Online presence indicators
- Comment threads per node
- @mention teammates
- Share link (view/edit)
- Design/Review/Interview/Teaching modes
- Collaborative simulation
- Version history

### Community
- 100+ community blueprints
- Fork any architecture
- User-submitted blueprints
- Upvote/bookmark
- Public profile pages
- Architecture comments
- Social sharing (Twitter, LinkedIn)
- Trending architectures

### Platform
- Dark/Light/System theme
- Feedback form (every page)
- Settings page
- Saved architectures page
- Profile page
- Landing page
- Documentation site
- Mobile responsive (non-canvas pages)
- Progressive Web App
- Keyboard shortcuts

### Monetization
- Free tier: 5 diagrams, basic sim, no collab
- Pro ($12/mo): unlimited, collab, AI reports, all modules
- Team ($49/mo): shared workspace, admin panel, priority support
- Stripe billing
- Usage limits per plan

---

## 🏃 NEXT ACTION — SPRINT 1 COMPLETION

Before starting Sprint 2, Sprint 1 must be 100% done:

### Sprint 1 Checklist (Current)
- [ ] Node handles fixed (all 4 sides)
- [ ] Edge deletion working
- [ ] Packets follow edge paths correctly
- [ ] Data flow direction correct
- [ ] Node buttons use NodeToolbar (no overlap)
- [ ] Real service icons showing
- [ ] Reference library in knowledge panel
- [ ] Feedback form on all pages
- [ ] Post-simulation report generating
- [ ] Gemini fallback working
- [ ] Component grouping working
- [ ] Saved architectures page (/my-architectures)
- [ ] Chaos injection wired properly
- [ ] Speed/traffic sliders wired to engine

**Sprint 1 is DONE when ALL checkboxes above are checked.**
**Only then do we start Sprint 2.**

---

## 📌 SPRINT TRACKER

| Sprint | Focus | Status | Estimated Duration |
|--------|-------|--------|--------------------|
| Sprint 1 | Canvas Foundation | 🟡 In Progress | 1 week |
| Sprint 2 | Intelligence Layer | ⏳ Waiting | 1 week |
| Sprint 3 | Learning Platform | ⏳ Waiting | 1.5 weeks |
| Sprint 4 | HLD Complete + LLD Foundation | ⏳ Waiting | 1.5 weeks |
| Sprint 5 | LLD Complete + Interview Mode | ⏳ Waiting | 1 week |
| Sprint 6 | Real-time Collaboration | ⏳ Waiting | 1.5 weeks |
| Sprint 7 | DB Schema + Network Modules | ⏳ Waiting | 1.5 weeks |
| Sprint 8 | DevOps + Algorithm + Messaging | ⏳ Waiting | 1.5 weeks |
| Sprint 9 | Community + Sharing + Polish | ⏳ Waiting | 1 week |
| Sprint 10 | Production Ready + Billing | ⏳ Waiting | 1 week |

**Total estimated time: ~12 weeks (3 months)**

---

## 🔑 KEY DECISIONS (LOCKED)

- **Stack:** Vite + React + TypeScript (frontend), Express + MongoDB (backend)
- **Canvas:** React Flow v12
- **Collaboration:** Yjs + PartyKit
- **AI Primary:** Groq (llama-3.3-70b-versatile)
- **AI Fallback:** Gemini 1.5 Flash
- **Icons:** @icons-pack/react-simple-icons
- **Deployment:** Vercel (frontend) + Railway/Render (backend)
- **Database:** MongoDB Atlas
- **Auth:** JWT (current) → upgrade to NextAuth-style in Sprint 10
- **Billing:** Stripe

---

*This document is the source of truth. If a feature is not in this doc, it doesn't exist yet.*
*When you ask Tim "what about X?", Tim will tell you which Sprint it's in.*
*Updated by Tim after every sprint completion.*

