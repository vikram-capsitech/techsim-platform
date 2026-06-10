# TechSim — Complete Feature Audit
Generated: 2026-06-11
Audited by: Rex

---

## 1. PAGES & ROUTES

| Route | Component | Status | What it shows | Interactions | API calls |
|---|---|---|---|---|---|
| `/` | `LandingView` | ✅ Working | Marketing hero, trust badges, animated background nodes, CTAs. | Navigate to register/security. | None. |
| `/login` | `Login` | ✅ Working | Email/password form with password reveal, errors, loading state. | Submit logs in, redirects to previous protected page or `/canvas`. | `POST /api/auth/login`, `GET /api/auth/me` through auth context. |
| `/register` | `Register` | ✅ Working | Username/email/password/confirm form with client validation. | Submit creates account and redirects to `/canvas`. | `POST /api/auth/register`. |
| `/canvas` | `CanvasPage` + `Canvas` | ✅ Working | React Flow architecture editor, sidebar, bottom bar, validation, simulation, AI panels, presets, reports. | Drag/drop nodes, connect edges, select nodes/edges, run simulation, inject chaos, save/load/autosave, export/import JSON. | `GET/POST/PUT /api/diagrams`, `PUT /api/diagrams/:id/autosave`, AI routes for generate/chat/report. |
| `/security` | `SecurityView` | ⚠️ Partial | Security lab styled dashboard with attack panel and static topology. | Toggle local attack states; no real backend/simulation integration. | None. |
| `/k8s` | `K8sView` | ⚠️ Partial | Kubernetes/infrastructure lab with services/pods and static incidents. | Local buttons/nav only; no real terminal/docs actions. | None. |
| `/db-schema` | `PlaceholderView` | 🚧 Stub only | Coming soon card. | None. | None. |
| `/network` | `PlaceholderView` | 🚧 Stub only | Coming soon card. | None. | None. |
| `/my-architectures` | `MyArchitectures` | ✅ Working | Saved diagram grid, thumbnails, empty/loading/error states, version modal. | Open, fork, delete, restore version, create new. | `GET /api/diagrams/my`, `DELETE /api/diagrams/:id`, `POST /api/diagrams/:id/fork`, version/restore routes. |
| `/learn` | `LearnPage` | ⚠️ Partial | 7 local tracks, 42 lesson cards, local progress bar. | Expand tracks, local checkbox completion, link to mapped lesson pages. | None; uses localStorage only. |
| `/learn/:trackId/:lessonId` | `LessonPage` | ⚠️ Partial | Markdown theory, key points, analogy, real-world example, exercise, quiz, next lesson. | Quiz feedback works, next lesson works, canvas exercise link works. | No API call currently; completion writes localStorage only despite backend lesson progress route existing. |
| `/concepts` | `ConceptsPage` | ✅ Working | 15 concepts, category/search filters, demo badges. | Filter/search, click card. | None. |
| `/concepts/:id` | `ConceptPage` | ✅ Working | Concept theory, tags, references, and demo area. | Runs 12 interactive demos; 3 concepts show Sprint 4 placeholder. | None. |
| `/interview` | `InterviewPage` | ⚠️ Partial | 3 challenge cards: URL shortener, Twitter feed, Uber tracking. | Start challenge. | None. |
| `/interview/:id` | `InterviewSession` | ⚠️ Partial | Timed challenge, requirements, hints, embedded canvas, AI chat, score modal. | Start timer, reveal hints, build on canvas, submit opens score. | `POST /api/ai/chat`; does not call interview feedback/progress endpoints. |
| `/settings` | `Settings` | ✅ Working | Profile, AI keys, canvas prefs, theme picker. | Save updates profile and localStorage prefs. | `PUT /api/auth/profile`. |
| `/discussion` | `Discussion` | 🚧 Stub only | Extra route not in requested list. | Unknown/minimal. | Not audited deeply because not in PM route list. |

---

## 2. CANVAS — NODE INTERACTIONS

All draggable component node types are defined in `src/data/nodes.ts` and render through `TechNode`: network, compute, data, messaging, infrastructure, and monitoring nodes. Behavior is shared across node types.

- Single click → selects node, opens `PropertiesPanel`, clears selected edge.
- Double click → starts inline rename for the node label.
- Hover → React Flow handles become visible by CSS; selected nodes show `NodeResizer`.
- NodeToolbar buttons → 📚 opens `KnowledgePanel`; ⚙ opens `NodeSettingsPanel`; 📋 duplicates; 🗑 deletes.
- Right panel content when selected → name input, replicas input, mock capacity/latency, region selector, node id, category chip, terminate button. Important: name/replica edits in `PropertiesPanel` are local panel state and do not update the React Flow node.
- During simulation → CPU bar, latency label, breathing animation, status dot, status glow, packet overlay on edges.
- During chaos → crashed node dims, grayscale, shows `NODE OFFLINE`, DOWN badge, restart button; overloaded/degraded nodes pulse and badge.

Node-type notes:

- Network nodes: client, CDN, DNS, WAF/firewall, load balancer, API gateway, router. Single/double/hover/toolbar behavior is shared. Simulation defaults have high capacity/low latency.
- Compute nodes: microservice/API server/lambda/worker/auth/rate limiter/docker/kubernetes. Shared interactions. Simulation can degrade/overload under traffic.
- Data nodes: Postgres/MySQL/MongoDB/Redis/Elastic/S3/time-series/data warehouse. Shared interactions. Cache nodes reduce DB load in simulation heuristics.
- Messaging nodes: Kafka/RabbitMQ/SQS/SNS/event bus. Shared interactions. Simulation applies queue physics.
- Infrastructure/monitoring nodes: Terraform/CI/CD/Nginx/Prometheus/Grafana/Datadog/log aggregation. Shared interactions. Monitoring affects validation expectations more than simulation.

---

## 3. CANVAS — TOOLBAR BUTTONS

| Button label | What it does | Current status |
|---|---|---|
| Edge Style | Appears as edge toolbar when an edge is selected, not top toolbar. Switches selected edge between Smooth, Straight, Bezier. | ✅ Working |
| Presets | Opens `PresetsModal` for preset scenarios and prompt generation. | ✅ Working |
| AI Generate | Opens `AIGeneratorPanel`; calls AI, transforms result onto canvas. | ⚠️ Partial: transform expects older `data.nodeType` names, so richer backend `nodeTypeId` outputs can collapse to default Docker nodes. |
| Requirements | Opens `RequirementWizard`; can generate architecture from structured requirements. | ✅ Working |
| Ask AI | Opens `ArchitectureChat` with current architecture context. | ✅ Working if AI keys/server configured. |
| Start/Stop Simulation | Navbar and bottom RUN/STOP both toggle simulation via `CanvasPage.toggleSimulation`. | ✅ Working |
| Save Progress | Navbar save writes diagram to backend or creates a new diagram and updates URL. | ✅ Working |
| Score | Bottom bar SCORE opens `ArchitectureScoreCard`. | ✅ Working |
| Export | Top-center canvas button exports diagram JSON. | ✅ Working |
| Import | Top-center canvas label imports diagram JSON. | ✅ Working |
| Share | Exists only in unused `Toolbar.tsx`; not mounted in current `CanvasPage`. | 🚧 Stub only |
| Clear | Exists only in unused `Toolbar.tsx`; not mounted in current `CanvasPage`. | 🚧 Stub only |

---

## 4. CANVAS — BOTTOM BAR

- ISSUES counter — counts validation issues from `validateArchitecture`; click toggles `IssuesPanel`; severity coloring works.
- RUN button — starts/stops simulation. If auto-validate is enabled, opens `ValidationGate` before start. On stop after 5+ seconds, shows `SimulationReport`.
- CHAOS label + buttons — for selected nodes, opens floating `ChaosArea` inside `BottomBar.tsx`; for selected edges, inline Latency and Partition buttons work.
- Speed slider — wired to `useSimulation.setSpeed` and affects simulation time/packet progress.
- Traffic slider — wired to `useSimulation.setTraffic` and changes base RPS through `setTrafficMultiplier`.
- Metrics — RPS, P99, Errors, Active are live from `SimulationEngine` snapshot, not hardcoded.

---

## 5. SIMULATION ENGINE

Document `src/simulation/SimulationEngine.ts`:

Public methods:

- `setTopology(nodes, edges)` — reconciles React Flow topology into internal node/edge state and emits snapshot.
- `start()` — begins requestAnimationFrame loop and emits running state.
- `stop()` — cancels loop, resets load/errors/status, clears chaos timers and `downNodes`.
- `pause()` — cancels loop but does not reset state.
- `crashNode(nodeId)` — adds node to `downNodes`, marks status down, blocks outgoing edges, clears packets, degrades downstream nodes, logs chaos.
- `spikeLatency(edgeId, ms)` — increases edge latency, auto-recovers after 8s.
- `trafficSurge(multiplier)` — multiplies global traffic, auto-recovers after 10s.
- `networkPartition(edgeId)` — partitions one edge, clears packets, auto-recovers after 12s.
- `injectMemoryLeak(nodeId)` — raises memory/latency over time, degrades, then crashes at high memory.
- `healNode(nodeId)` — removes from `downNodes`, restores node, unblocks edges when peer is up, recovers downstream nodes if no upstream down node remains.
- `setSpeed(v)` — sets speed multiplier.
- `setTheme(theme)` — recolors existing packets for light/dark.
- `setBaseRPS(rps)` — sets base traffic and emits while running.
- `setTrafficMultiplier(multiplier)` — changes base RPS from multiplier; clears packets at zero traffic.
- `healEdge(edgeId)` — clears partition flag.
- `subscribe(listener)` — registers snapshot listener.
- `getSnapshot()` — returns current snapshot.
- `getChaosLog()` — returns cloned chaos log.
- `resetChaosLog()` — clears chaos log.

`downNodes` Set:

- Declared at `src/simulation/SimulationEngine.ts:105`.
- Initialized at line 128.
- `crashNode` adds to it at line 233.
- `healNode` removes from it at line 423.
- `stop` clears it at line 211.
- It is used in `healNode` to avoid unblocking edges connected to another down node and to decide downstream recovery.
- It is not directly checked in `step()` before spawning packets; node status and edge flags are checked instead.

Exact lines where down behavior is checked in the simulation loop:

```ts
556      if (node.status === 'down') {
557        node.currentLoad = smooth(node.currentLoad, 0, dt, 8);
558        node.queueDepth = 0;
559        node.errorRate = 1;
560        node.cpuUsage = 0;
```

Packet spawning/advancing also checks source/edge state:

```ts
656    if (edge.isPartitioned || edge.isBlocked || source?.status === 'down') {
657      edge.packets = [];
658      return;
659    }
```

Is healNode removing from downNodes: yes, `this.downNodes.delete(nodeId)` at line 423.

Chaos injection methods and effects:

- Crash node: down state, blocked outgoing edges, incoming packets become errors, downstream degradation.
- Latency spike: edge latency increases and recovers.
- Network partition: edge stops traffic and recovers.
- Traffic surge: global multiplier increases and recovers.
- Memory leak: memory climbs and can auto-crash.

Document `src/simulation/useSimulation.ts`:

- Exports `useSimulation`, `SimulationControls`, and returns metrics, run state, start/stop/pause, setters, chaos log helpers, `injectChaos`, node/edge state maps, snapshot.
- `setSpeed` is wired to Speed slider in `CanvasPage.handleSpeedChange`.
- `setTraffic` is wired to Traffic slider in `CanvasPage.handleTrafficChange`.
- `getChaosLog` is exported and used for `SimulationReport`.

---

## 6. CHAOS SYSTEM

Document `src/components/ChaosArea.tsx`:

- File does not exist. `ChaosArea` is an inner component in `src/components/BottomBar.tsx`.
- It shows all 21 chaos scenarios grouped by Infrastructure, Network, Application, Data, Queue.
- It visually dims invalid scenarios but still allows click to explain why blocked.
- Clicking invalid chaos shows `ChaosBlockedModal`.
- `ChaosBlockedModal` component is wired and receives reason, valid node types, and valid chaos for selected node.
- `ChaosExplanationPanel` is only wired for drag/drop chaos handled by `Canvas.handleChaosOnNode`; normal bottom-bar chaos clicks do not set `chaosExplainId`, so explanations are inconsistent.

Document chaos visual effects:

- When node crashes — node dims, becomes grayscale, shows DOWN badge and restart button. ✅
- When node crashes — outgoing packets stop and outgoing edges become blocked; incoming edges can still show error packets to the failed target by design. ✅/⚠️
- When node crashes — downstream nodes are marked `degraded`. ✅
- When heal clicked — node returns healthy, edges touching the node unblock if the peer is not down, downstream degraded nodes recover if no upstream down node remains. ✅

---

## 7. KNOWLEDGE PANEL (📚 button)

- Clicking 📚 on a node opens `KnowledgePanel` via `node-knowledge-open` event. ✅
- Nova's content: real local content is present from `src/data/content/knowledgeCards.json` with 51 components, plus legacy `componentKnowledge.ts` fallback. Not fetched from `/api/knowledge`. ✅/⚠️
- Tabs work: Overview, When to Use, Real World, Metrics, Mistakes, Interview, Learn/References. ✅
- Reference library shows filter tabs for All, Docs, Video, Paper, Book. ✅
- `componentId` mapping works for common aliases including `redis -> redis`, `load-balancer -> load_balancer`, `api-gateway -> api_gateway`, `postgres -> postgresql`. ✅
- Missing/partial: `client` maps to null, so client/browser nodes show fallback content. Backend `KnowledgeCard` model/route exists but frontend does not use it.

---

## 8. AI FEATURES

| Feature | Endpoint | Works | Groq | Gemini fallback |
|---|---|---|---|---|
| AI Generate | `POST /api/ai/generate` | ⚠️ Partial: backend prompt is strong, frontend transform can mis-map newer nodeTypeIds. | ✅ Primary via `callAI` | ✅ fallback |
| Architecture Chat | `POST /api/ai/chat` | ✅ Working if keys configured. | ✅ | ✅ |
| Requirement Wizard | `POST /api/ai/wizard` | ✅ Working if JSON parses. | ✅ | ✅ |
| Pre-simulation Validation | Local `ValidationGate`; AI endpoint `POST /api/ai/validate` exists but is not used. | ⚠️ Partial | ✅ endpoint exists | ✅ endpoint exists |
| Tool Recommendations | UI component uses local recommendations; endpoint `POST /api/ai/recommend` exists but frontend does not call it. | ⚠️ Partial | ✅ endpoint exists | ✅ endpoint exists |
| Simulation Report | `POST /api/ai/simulation-report` | ✅ Working with raw fallback when AI fails. | ✅ | ✅ |
| Chaos Explanation | `POST /api/ai/chaos-explain` | ⚠️ Partial: panel can call API, but normal bottom-bar chaos does not open it. | ✅ | ✅ |
| Deep Dive | None found. | ❌ Broken / not implemented | ❌ | ❌ |
| Interview feedback | `POST /api/ai/interview-feedback` | ⚠️ Endpoint exists, interview UI does not call it. | ✅ | ✅ |

Bug: `server/lib/ai.ts` logs raw API keys to the server console. This is high severity.

---

## 9. LEARNING PLATFORM

`/learn` page:

- 7 tracks show.
- Track cards are clickable/expandable.
- Clicking a lesson's "View Lesson" navigates to mapped theory lesson page.
- Overall progress bar is wired to localStorage, not backend real data. ⚠️

`/learn/:trackId/:lessonId`:

- Theory content renders through `react-markdown`.
- Content area is scrollable.
- Key points show.
- Analogy box shows.
- Real-world example and canvas exercise show when present.
- Quiz works with questions, correct/wrong feedback, explanation, pass threshold.
- Completing quiz does not save progress to API; it writes localStorage only. ❌
- Next lesson button works.

`/concepts` page:

- 15 concepts show.
- 12 have ▶ Demo badge.
- CAP Theorem demo has interactive partition behavior. ✅
- Consistent Hashing demo supports add/remove node and virtual node toggle. ✅
- Interactive demos: CAP, Consistent Hashing, Sharding, Replication, Circuit Breaker, Rate Limiting, Load Balancing, Caching, CQRS, Two-Phase Commit animation, Saga animation, Event Sourcing animation.
- Placeholders/no demo: Bloom Filters, Leader Election, Service Mesh.

`/interview` page:

- 3 challenges show.
- Timer starts when challenge begins.
- 5-min warning exists via red timer when `timeLeft < 300`.
- Canvas embeds in interview session.
- Submit works locally by stopping timer and showing `ArchitectureScoreCard`.
- Missing: submit does not call `POST /api/ai/interview-feedback` or `POST /api/progress/interview`; follow-up questions only display after finished on hints tab, not AI-generated.

---

## 10. BACKEND — ALL ROUTES

| Method | Path | File | Auth required | Status |
|---|---|---|---|---|
| GET | `/health` | `server/index.ts` | No | ✅ Working |
| POST | `/api/auth/register` | `auth.ts` | No | ✅ Working |
| POST | `/api/auth/login` | `auth.ts` | No | ✅ Working |
| PUT | `/api/auth/profile` | `auth.ts` | Yes | ✅ Working |
| GET | `/api/auth/me` | `auth.ts` | Yes | ✅ Working |
| GET | `/api/diagrams` | `diagrams.ts` | Yes | ✅ Working |
| GET | `/api/diagrams/my` | `diagrams.ts` | Yes | ✅ Working |
| POST | `/api/diagrams` | `diagrams.ts` | Yes | ✅ Working |
| GET | `/api/diagrams/:id` | `diagrams.ts` | Yes | ✅ Working |
| PUT | `/api/diagrams/:id` | `diagrams.ts` | Yes | ✅ Working |
| DELETE | `/api/diagrams/:id` | `diagrams.ts` | Yes | ✅ Working |
| POST | `/api/diagrams/:id/fork` | `diagrams.ts` | Yes | ✅ Working |
| GET | `/api/diagrams/:id/versions` | `diagrams.ts` | Yes | ✅ Working |
| POST | `/api/diagrams/:id/restore/:idx` | `diagrams.ts` | Yes | ✅ Working |
| PUT | `/api/diagrams/:id/autosave` | `diagrams.ts` | Yes | ⚠️ Partial: rate limited per user; does not create version history. |
| GET | `/api/scenarios` | `scenarios.ts` | Yes | ✅ Working |
| GET | `/api/scenarios/:id` | `scenarios.ts` | Yes | ✅ Working |
| POST | `/api/progress` | `progress.ts` | Yes | ✅ Working |
| GET | `/api/progress` | `progress.ts` | Yes | ✅ Working |
| POST | `/api/progress/lesson` | `progress.ts` | Yes | ✅ Working backend; not used by frontend. |
| GET | `/api/progress/lessons` | `progress.ts` | Yes | ✅ Working backend; not used by frontend. |
| GET | `/api/progress/badges` | `progress.ts` | Yes | ✅ Working backend. |
| POST | `/api/progress/badge` | `progress.ts` | Yes | ✅ Working backend. |
| POST | `/api/progress/interview` | `progress.ts` | Yes | ⚠️ Backend expects Scenario ObjectId; frontend challenge ids are slugs, so current interview data will 404 unless seeded as scenarios. |
| GET | `/api/progress/leaderboard/:challengeId` | `progress.ts` | Yes | ✅ Backend route; not used by frontend. |
| POST | `/api/feedback` | `feedback.ts` | No | ✅ Working |
| GET | `/api/feedback` | `feedback.ts` | Yes/admin heuristic | ⚠️ Partial: simple email/username check only. |
| POST | `/api/ai/generate` | `ai.ts` | Yes | ✅ Working if AI configured. |
| POST | `/api/ai/simulation-report` | `ai.ts` | Yes | ✅ Working if AI configured. |
| POST | `/api/ai/wizard` | `ai.ts` | Yes | ✅ Working if JSON parses. |
| POST | `/api/ai/validate` | `ai.ts` | Yes | ✅ Backend exists; unused. |
| POST | `/api/ai/chat` | `ai.ts` | Yes | ✅ Working if AI configured. |
| POST | `/api/ai/recommend` | `ai.ts` | Yes | ✅ Backend exists; unused. |
| POST | `/api/ai/interview-feedback` | `ai.ts` | Yes | ✅ Backend exists; unused. |
| POST | `/api/ai/chaos-explain` | `ai.ts` | Yes | ✅ Backend exists; partial UI wiring. |
| GET | `/api/knowledge/:componentId` | `knowledge.ts` | No | ✅ Backend exists; frontend uses local JSON instead. |

---

## 11. DATA MODELS

- `User` — `server/models/User.ts`; fields: `username` string unique required, `email` string unique required lowercase, `password` string required, `avatarUrl` string, `plan` enum free/pro/team, `createdAt` date. Indexes: unique username/email. Used by auth/profile.
- `Diagram` — `server/models/Diagram.ts`; fields: `userId`, `title`, `module`, `canvasJson.nodes`, `canvasJson.edges`, `thumbnailUrl`, `isPublic`, `forkCount`, `tags`, `versions`, timestamps. Indexes: none explicit. Used by diagrams routes and canvas save/load.
- `Scenario` — `server/models/Scenario.ts`; fields: `title`, `description`, `module`, `difficulty`, `canvasJson`, `solutionJson`, `tags`, `completionCount`. Indexes: none explicit. Used by scenarios/progress/AI interview context.
- `UserProgress` — `server/models/UserProgress.ts`; fields: `userId`, `scenarioId`, `completedAt`, `score`, `attempts`, `timeSpent`. Indexes: unique `{ userId, scenarioId }`. Used by progress routes.
- `LessonProgress` — `server/models/LessonProgress.ts`; fields: `userId`, `lessonId`, `trackId`, `completed`, `completedAt`, `score`, `timeSpent`. Indexes: unique `{ userId, lessonId }`. Backend route exists; frontend not using it.
- `UserBadge` — `server/models/UserBadge.ts`; fields: `userId`, `badgeId`, `earnedAt`. Indexes: unique `{ userId, badgeId }`. Backend route exists; frontend not using it.
- `KnowledgeCard` — `server/models/KnowledgeCard.ts`; fields: `componentId`, `name`, `category`, `tagline`, `whatItDoes`, `whenToUse`, `whenNotToUse`, `realWorldUsage`, `keyMetrics`, `commonMistakes`, `interviewTips`. Indexes: unique `componentId`. Backend route exists; frontend not using it.
- `Feedback` — `server/models/Feedback.ts`; fields: `type`, `title`, `description`, `email`, `priority`, `page`, `userAgent`, `timestamp`, `createdAt`. Indexes: none explicit. Not actually used by `server/routes/feedback.ts`, which defines a duplicate inline model/schema.

---

## 12. THEME SYSTEM

- `ThemeContext` wraps the entire app in `src/main.tsx`. ✅
- Dark/light/system switching works through `data-theme` and localStorage. `darker` resolves to dark for React Flow color mode. ✅
- React Flow `colorMode` changes with resolved theme in `Canvas.tsx`. ✅
- Hardcoded colors remain in many files. High-impact list: `App.tsx`, `AIGeneratorPanel.tsx`, `ArchitectureChat.tsx`, `ArchitectureScoreCard.tsx`, `BottomBar.tsx`, `Canvas.tsx`, `ChaosBlockedModal.tsx`, `ChaosExplainPanel.tsx`, `FeedbackForm.tsx`, `GlowEdge.tsx`, `KnowledgePanel.tsx`, `Navbar.tsx`, `NodeSettingsPanel.tsx`, `PresetsModal.tsx`, `PropertiesPanel.tsx`, `Sidebar.tsx`, `SimulationReport.tsx`, `TechNode.tsx`, `ValidationGate.tsx`, all concept demos, `Login.tsx`, `Register.tsx`, `LearnPage.tsx`, `LessonPage.tsx`, `ConceptPage.tsx`, `InterviewPage.tsx`, `InterviewSession.tsx`, `Settings.tsx`, `LandingView.tsx`, `SecurityView.tsx`, `K8sView.tsx`.
- Several pages use theme variables plus hardcoded semantic colors, so light mode may work generally but is not fully audited/polished on every screen. ⚠️

---

## 13. KNOWN BUGS

| # | Bug | File | Severity | Impact |
|---|---|---|---|---|
| 1 | API keys are logged to server console in `callAI`. | `server/lib/ai.ts` | Critical | Leaks sensitive user/server secrets into logs. |
| 2 | Lesson completion never calls backend progress API. | `src/pages/LessonPage.tsx`, `src/api/client.ts` | High | Progress is not portable across devices/accounts. |
| 3 | `/learn` progress is localStorage only while backend LessonProgress exists. | `src/pages/LearnPage.tsx` | High | Project manager may think learning progress is real server data, but it is local-only. |
| 4 | Interview submit does not call AI feedback or progress APIs. | `src/pages/InterviewSession.tsx` | High | Interview results are not saved and AI scoring endpoint is unused. |
| 5 | AI generator transform can default many backend-generated nodes to Docker because it reads `data.nodeType`, not `data.nodeTypeId`. | `src/components/AIGeneratorPanel.tsx` | High | Generated architectures may lose specific service types. |
| 6 | Normal bottom-bar chaos injection does not open `ChaosExplainPanel`. | `src/App.tsx`, `src/components/BottomBar.tsx` | Medium | Chaos explanation feature feels inconsistent. |
| 7 | `PropertiesPanel` edits name/replicas in local state only. | `src/components/PropertiesPanel.tsx` | Medium | Users think settings changed, but node data does not update from that panel. |
| 8 | `Settings` claims AI keys are never sent to servers, but keys are sent to TechSim backend headers for proxying. | `src/pages/Settings.tsx`, `src/api/client.ts` | Medium | Privacy copy is inaccurate. |
| 9 | `Feedback` model duplicated inline in feedback route. | `server/models/Feedback.ts`, `server/routes/feedback.ts` | Medium | Schema drift risk and unused model file. |
| 10 | `downNodes` is not directly checked in `step()` before packet logic; status/edge flags do the work. | `src/simulation/SimulationEngine.ts` | Low/Medium | Current behavior works, but the intended invariant is split across status and edge flags. |
| 11 | Backend interview progress expects Scenario ObjectId while frontend challenge ids are slugs. | `server/routes/progress.ts`, `src/data/challenges.ts` | Medium | Saving interview progress would fail with current UI ids. |
| 12 | Unused legacy pages `LoginPage.tsx` and `RegisterPage.tsx` remain. | `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx` | Low | Maintenance confusion. |
| 13 | Unused `Toolbar.tsx` contains stub Share/Export/Clear behavior not mounted. | `src/components/Toolbar.tsx` | Low | Confusing duplicate toolbar implementation. |

---

## 14. INCOMPLETE FEATURES

| Feature | Status | What's missing | File |
|---|---|---|---|
| DB Schema module | 🚧 Stub only | Actual editor/view. | `src/App.tsx` PlaceholderView |
| Network module | 🚧 Stub only | Actual topology module. | `src/App.tsx` PlaceholderView |
| Security lab | ⚠️ Partial | Real simulations, backend data, persistence, scoring. | `src/views/SecurityView.tsx` |
| Kubernetes lab | ⚠️ Partial | Real cluster actions, terminal/docs behavior, persistence. | `src/views/K8sView.tsx` |
| Learning backend sync | ⚠️ Partial | Frontend progress API client and calls. | `src/pages/LearnPage.tsx`, `src/pages/LessonPage.tsx`, `server/routes/progress.ts` |
| Interview scoring/persistence | ⚠️ Partial | Call AI feedback and progress endpoints, leaderboard UI. | `src/pages/InterviewSession.tsx` |
| Deep Dive AI | ❌ Missing | No endpoint/UI found. | N/A |
| AI recommendation endpoint wiring | ⚠️ Partial | Frontend uses local recommendations, not AI route. | `src/components/ToolRecommendation.tsx`, `server/routes/ai.ts` |
| AI validation endpoint wiring | ⚠️ Partial | Frontend uses local validation gate. | `src/components/ValidationGate.tsx`, `server/routes/ai.ts` |
| Knowledge backend integration | ⚠️ Partial | Frontend uses local JSON, not `/api/knowledge`. | `src/components/KnowledgePanel.tsx`, `server/routes/knowledge.ts` |
| Concept demos for Bloom Filters, Leader Election, Service Mesh | 🚧 Stub only | Interactive demos. | `src/data/concepts.ts`, `src/pages/ConceptPage.tsx` |
| Dedicated `ChaosArea.tsx` file | ❌ Missing | Component lives inside BottomBar. | `src/components/BottomBar.tsx` |

---

## 15. SUMMARY SCORECARD

| Category | Score | Notes |
|----------|-------|-------|
| Canvas UX | 8/10 | Rich editor, validation, import/export, AI, presets; some settings edits are fake/local. |
| Simulation | 8/10 | Solid live simulation, metrics, packet overlays, chaos effects; `downNodes` invariant not directly central. |
| Chaos System | 7/10 | Broad scenario catalog and blocked modal; explanation panel wiring inconsistent. |
| Learning Platform | 6/10 | Strong content volume and quiz UI; backend progress not wired. |
| AI Features | 7/10 | Good backend coverage and Groq/Gemini fallback; unused endpoints and key logging issue. |
| Backend/API | 7/10 | Auth/diagrams/progress/AI/routes exist; some frontend/API mismatches and duplicated feedback schema. |
| Theme/UI | 6/10 | Global theme provider and variables exist; many hardcoded colors remain. |
| Performance | 7/10 | Vite build passes; large client bundle warning remains; simulation is client-heavy but scoped. |
| Overall | 7/10 | Strong Sprint 3 feature surface, but several systems are local-only or only half-wired to backend. |

---

## 16. SPRINT 4 READINESS

Based on current state, what MUST be fixed before starting Sprint 4 (HLD Complete + LLD Foundation):

1. Remove API key logging from `server/lib/ai.ts` immediately.
2. Wire lesson progress to `POST /api/progress/lesson` and `/api/progress/lessons`; update `/learn` progress from server data.
3. Wire interview submit to `POST /api/ai/interview-feedback` and `POST /api/progress/interview`, or change backend to accept frontend challenge slugs.
4. Fix AI generator transform to support backend `nodeTypeId` directly.
5. Make `PropertiesPanel` persist node label/replica/settings changes to React Flow node data, or make it explicitly read-only.
6. Wire normal chaos injection to `ChaosExplainPanel` or remove the promise of live explanations.
7. Decide source of truth for knowledge cards: local JSON or MongoDB `/api/knowledge`; remove dead path or wire it.
8. Consolidate duplicate auth pages and unused `Toolbar.tsx` to reduce confusion.
9. Convert high-impact hardcoded colors to theme tokens before polishing light mode.
10. Build real `/db-schema` and `/network` modules or hide them until scoped.
11. Add tests for diagram save/autosave/version restore, lesson progress, AI transform, and simulation crash/heal behavior.
12. Address Vite bundle-size warning with route-level code splitting, especially concept demos and AI-heavy panels.
