# TechSim — Project Handoff Document
> **READ THIS FIRST** before touching any file.
> Updated by team members after every completed task.
> Purpose: Any new AI agent can onboard in under 5 minutes.

---

## 🎯 What TechSim Is
A browser-based System Design University. Users visually build, simulate, attack,
and learn distributed system architectures. Think paperdraw.dev but 10x deeper —
with learning paths, chaos engineering, interview mode, and AI guidance.

**Motto:** Build. Attack. Learn.

---

## 🏗️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Canvas | @xyflow/react v12 (React Flow) |
| Styling | Tailwind CSS + CSS variables (theme system) |
| State | Zustand + React Flow state |
| Backend | Express.js + TypeScript (Node.js) |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT (stored in localStorage as `techsim_token`) |
| AI Primary | Groq (llama-3.3-70b-versatile) |
| AI Fallback | Gemini 1.5 Flash |
| HTTP Client | Axios via `src/api/client.ts` (apiClient) |
| Icons | @icons-pack/react-simple-icons + Lucide React |

---

## 📁 Project Structure
```
techsim/
├── src/
│   ├── api/
│   │   └── client.ts          ← ALL API calls go through here (axios)
│   ├── components/
│   │   ├── TechNode.tsx        ← Canvas node component
│   │   ├── GlowEdge.tsx        ← Canvas edge component
│   │   ├── KnowledgePanel.tsx  ← 📚 button panel
│   │   ├── NodeSettingsPanel.tsx
│   │   ├── BottomBar.tsx       ← Simulation controls + chaos
│   │   ├── Navbar.tsx
│   │   ├── ValidationGate.tsx  ← Pre-sim validation
│   │   ├── AIGeneratorPanel.tsx
│   │   ├── ArchitectureChat.tsx
│   │   ├── SimulationReport.tsx
│   │   ├── ChaosBlockedModal.tsx
│   │   └── FeedbackForm.tsx
│   ├── simulation/
│   │   ├── SimulationEngine.ts ← Core simulation logic
│   │   └── useSimulation.ts    ← React hook wrapper
│   ├── data/
│   │   ├── nodes.ts            ← Node type definitions
│   │   ├── content/
│   │   │   ├── knowledgeCards.json   ← Nova's 51 component cards
│   │   │   ├── theoryTracks.json     ← 7 learning tracks
│   │   │   ├── quizQuestions.json    ← 245 quiz questions
│   │   │   ├── presetScenarios.json  ← 20 preset architectures
│   │   │   └── chaosScenarios.json   ← 30 chaos explanations
│   │   └── chaosValidation.ts  ← Valid chaos per node type
│   ├── pages/
│   │   ├── LandingView.tsx
│   │   ├── Login.tsx / Register.tsx
│   │   ├── MyArchitectures.tsx
│   │   ├── LearnPage.tsx / LessonPage.tsx
│   │   ├── ConceptsPage.tsx / ConceptPage.tsx
│   │   ├── InterviewPage.tsx / InterviewSession.tsx
│   │   └── Settings.tsx
│   ├── context/
│   │   ├── AuthContext.tsx     ← User auth state
│   │   └── ThemeContext.tsx    ← dark/light/system theme
│   └── App.tsx                 ← Routes
├── server/
│   ├── index.ts                ← Express app entry
│   ├── lib/
│   │   ├── mongodb.ts          ← DB connection singleton
│   │   └── ai.ts               ← callAI() with Groq+Gemini fallback
│   ├── middleware/
│   │   ├── auth.ts             ← JWT verification → req.user
│   │   └── errorHandler.ts
│   ├── models/
│   │   ├── User.ts, Diagram.ts, Scenario.ts
│   │   ├── UserProgress.ts, LessonProgress.ts
│   │   ├── UserBadge.ts, KnowledgeCard.ts
│   │   ├── Feedback.ts, DeepDiveCache.ts
│   │   └── (Feedback also duplicated inline in routes — known bug)
│   └── routes/
│       ├── auth.ts, diagrams.ts, scenarios.ts
│       ├── progress.ts, feedback.ts
│       ├── ai.ts               ← All AI endpoints
│       └── knowledge.ts
└── .env                        ← NEVER commit this
```

---

## 🔑 Environment Variables Required
```
MONGODB_URI=          ← MongoDB Atlas connection string
JWT_SECRET=           ← Any long random string
PORT=5000
VITE_API_URL=http://localhost:5000
GROQ_API_KEY=         ← Primary AI (free at console.groq.com)
GEMINI_API_KEY=       ← Fallback AI (free tier available)
```

---

## 🚀 Running the Project
```bash
# Root folder: D:\projects\techsim
npm run dev              # Runs both frontend (5173) and backend (5000)
npm run dev:client       # Frontend only
npm run dev:server       # Backend only
npm run build            # Production build
npm run seed             # Seed 5 starter scenarios
npm run seed:content     # Seed Nova's knowledge cards to MongoDB
```

---

## 🧭 Navigation Structure
**Current navbar (BEING RESTRUCTURED):**
System Design | Security | K8s | DB Schema | Network | Learn | My Architectures | Settings

**New navbar (Sprint 4 target):**
Design | Simulate | Secure | Learn | Export | My Work

**Why:** K8s, DB Schema, Network are VIEWS of the same architecture,
not separate modules. Security is a lens applied to an existing design.

---

## 📊 Current Sprint Status

### Sprint 1 ✅ COMPLETE
Canvas foundation, simulation engine, auth, MongoDB backend, basic UI

### Sprint 2 ✅ COMPLETE
Requirement wizard, pre-sim validation, AI chat, tool recommendations, settings page

### Sprint 3 ✅ MOSTLY COMPLETE — Known issues below
Learning platform, concepts library, interview mode, Nova content, chaos system

### Sprint 3 — Known Bugs (Fix before Sprint 4)
| # | Bug | File | Severity |
|---|-----|------|----------|
| 1 | API keys logged to console | server/lib/ai.ts | 🔴 CRITICAL |
| 2 | PropertiesPanel edits not saved to node | src/components/PropertiesPanel.tsx | 🔴 HIGH |
| 3 | AI Generator maps nodeTypeId wrong → Docker nodes | src/components/AIGeneratorPanel.tsx | 🔴 HIGH |
| 4 | Lesson progress saves to localStorage only | src/pages/LessonPage.tsx | 🟡 HIGH |
| 5 | Interview submit doesn't call AI feedback API | src/pages/InterviewSession.tsx | 🟡 HIGH |
| 6 | Chaos explanation only wired for drag-drop not bottom bar | src/components/BottomBar.tsx | 🟡 MEDIUM |
| 7 | Feedback model duplicated inline in route | server/routes/feedback.ts | 🟡 MEDIUM |
| 8 | Interview progress expects ObjectId, frontend sends slug | server/routes/progress.ts | 🟡 MEDIUM |
| 9 | Settings page claims keys not sent to server (false) | src/pages/Settings.tsx | 🟡 MEDIUM |
| 10 | 30+ files have hardcoded colors instead of CSS vars | Multiple | 🟢 LOW |

### Sprint 4 — HLD Complete + LLD Foundation (NEXT)
- Tool selection modal (Nova's registry → pick Nginx/HAProxy for Load Balancer)
- Node shows selected tool name + icon on canvas
- AI deep dive with DB caching
- Connection validation from registry
- Proper middleware refactor (see below)

---

## 🔒 Middleware Plan (Sprint 4 Refactor)
We need these middleware layers added BEFORE Sprint 4 features:

```
Every API request flows through:
1. CORS middleware (already exists)
2. Rate limiting (express-rate-limit) — NEW
3. Request logging (morgan) — NEW  
4. Auth middleware (already exists for protected routes)
5. Subscription/plan check — NEW (for future billing)
6. Feature flag check — NEW (control free vs pro features)
7. Route handler
8. Error handler (already exists)
```

New middleware files needed:
- server/middleware/rateLimiter.ts
- server/middleware/planGuard.ts     ← checks user.plan for feature access
- server/middleware/featureFlag.ts   ← toggles features on/off
- server/middleware/requestLogger.ts
- server/middleware/sanitize.ts      ← input sanitization

Plan tiers (for future Sprint 10 billing):
```typescript
const PLAN_FEATURES = {
  free: {
    maxDiagrams: 5,
    aiGenerations: 10,       // per day
    simulationMinutes: 30,   // per day
    collaboration: false,
    exportFormats: ['png'],
    learningPaths: ['fundamentals'],  // only 1 track
    interviewChallenges: 1,
  },
  pro: {
    maxDiagrams: Infinity,
    aiGenerations: 200,
    simulationMinutes: Infinity,
    collaboration: true,
    exportFormats: ['png','pdf','json','terraform','yaml'],
    learningPaths: 'all',
    interviewChallenges: Infinity,
  },
  team: {
    // Everything in pro + shared workspaces + admin panel
  }
}
```

planGuard middleware (add to protected routes NOW, logic fills in Sprint 10):
```typescript
export const requireFeature = (feature: keyof PlanFeatures) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user._id)
    const plan = PLAN_FEATURES[user.plan || 'free']
    // Currently always passes — billing logic added Sprint 10
    // But middleware is IN PLACE so we don't need to retrofit
    if (canAccess(plan, feature)) return next()
    res.status(403).json({
      error: 'Plan limit reached',
      feature,
      currentPlan: user.plan,
      upgradeUrl: '/settings#upgrade'
    })
  }
}
```

---

## 🤖 AI Integration
```typescript
// server/lib/ai.ts
// Usage: const response = await callAI(userPrompt, systemPrompt, maxTokens)
// Primary: Groq (llama-3.3-70b-versatile)
// Fallback: Gemini 1.5 Flash
// Never log API keys — critical security rule
```

AI Endpoints:
| Endpoint | Purpose | Frontend wired? |
|----------|---------|----------------|
| POST /api/ai/generate | Architecture from text | ✅ Yes |
| POST /api/ai/wizard | Architecture from requirements | ✅ Yes |
| POST /api/ai/chat | Q&A about architecture | ✅ Yes |
| POST /api/ai/simulation-report | Post-sim expert report | ✅ Yes |
| POST /api/ai/chaos-explain | Chaos explanation | ⚠️ Partial |
| POST /api/ai/validate | Pre-sim AI validation | ❌ Not wired |
| POST /api/ai/recommend | Tool recommendations | ❌ Not wired |
| POST /api/ai/interview-feedback | Interview scoring | ❌ Not wired |
| POST /api/ai/deepdive | Component deep dive | ❌ Not built |

---

## 🎨 Theme System
- ThemeContext wraps entire app in src/main.tsx
- Themes: dark, light, darker, system
- CSS variables defined in src/styles/themes.css
- React Flow gets colorMode prop from resolvedTheme
- ⚠️ 30+ components still have hardcoded colors — gradual fix

Key CSS variables:
```css
--bg-primary, --bg-secondary, --bg-tertiary, --bg-card
--text-primary, --text-secondary, --text-muted
--border, --border-hover
--accent (#7C3AED), --accent-hover
--node-bg, --node-border
```

---

## 🌐 API Client Rules
- ALL frontend API calls use `apiClient` from `src/api/client.ts`
- Never use raw `fetch()` — always use `apiClient` (axios)
- JWT token auto-attached via axios interceptor
- Base URL from `import.meta.env.VITE_API_URL`

---

## 🗃️ Nova's Content Files
Located in src/data/content/:
| File | Contents | Status |
|------|---------|--------|
| knowledgeCards.json | 51 component deep-dives | ✅ Wired to KnowledgePanel |
| theoryTracks.json | 7 learning tracks, 49 lessons | ✅ Wired to LearnPage |
| quizQuestions.json | 245 quiz questions | ✅ Wired to LessonPage |
| presetScenarios.json | 20 preset architectures | ✅ Wired to PresetsModal |
| chaosScenarios.json | 30 chaos explanations | ✅ Wired to ChaosExplainPanel |
| techsim_tools_registry.json | 169 nodes, 2050 tools | ❌ NOT YET INTEGRATED |

Tools registry status:
- Structure is good (169 nodes, 2050 tools)
- Content quality is generic (templated descriptions)
- validConnections is EMPTY (critical for connection validation)
- Chaos IDs don't match app IDs (need mapping)
- Needs content improvement before integration

---

## 🔄 Collaboration Plan (Sprint 6)
Decision: **CRDT via Yjs + PartyKit**
- Yjs for document state (conflict-free auto-merge)
- PartyKit for WebSocket room management
- This decision affects canvas state structure
- Canvas state must be Yjs-compatible before Sprint 6

---

## 💳 Billing Plan (Sprint 10)
- Stripe integration
- Plans: Free / Pro ($12/mo) / Team ($49/mo)
- planGuard middleware being added in Sprint 4 (empty now, logic in Sprint 10)
- Free tier limits defined in PLAN_FEATURES constant

---

## 📋 Sprint Roadmap
| Sprint | Focus | Status |
|--------|-------|--------|
| 1 | Canvas + Auth + Backend | ✅ Done |
| 2 | AI Intelligence Layer | ✅ Done |
| 3 | Learning Platform | ✅ Mostly done |
| 4 | Middleware refactor + Tool selection + HLD complete | 🔴 NEXT |
| 5 | Security module (view of existing architecture) | ⏳ |
| 6 | Real-time collaboration (Yjs + CRDT) | ⏳ |
| 7 | DB Schema + Network modules | ⏳ |
| 8 | DevOps + Algorithm + Messaging modules | ⏳ |
| 9 | Community + Sharing + Polish | ⏳ |
| 10 | Billing + Production ready | ⏳ |

---

## ⚠️ Critical Rules for All Agents

1. **NEVER log API keys** — check server/lib/ai.ts before any AI changes
2. **ALL API calls use apiClient** — never raw fetch()
3. **ALL colors use CSS variables** — never hardcode hex colors
4. **Theme must work** — test dark AND light after any UI change
5. **Mobile responsive** — non-canvas pages must work on mobile
6. **No breaking changes** — existing canvas/simulation must keep working
7. **TypeScript strict** — no `any` without comment explaining why
8. **Test the happy path** — after every change, manually test the main flow

---

## 👥 Team
| Agent | Tool | Role |
|-------|------|------|
| Tim | Claude (PM) | Architecture decisions, sprint planning, code review |
| Ava | Claude Code | Lead frontend — canvas, UI, pages |
| Kai | Antigravity | Backend — Express, MongoDB, middleware |
| Rex | Codex | Simulation engine, chaos, performance |
| Zara | Stitch | UI/UX design, component specs |
| Nova | ChatGPT | Content, prompts, data files |

---

## 📝 Change Log
| Date | Agent | What changed |
|------|-------|-------------|
| Jun 10 | Ava | Sprint 1-3 complete — canvas, auth, learning platform |
| Jun 10 | Kai | Backend routes, models, AI endpoints |
| Jun 10 | Rex | Simulation engine, chaos injection, packet animation |
| Jun 10 | Nova | Knowledge cards, theory tracks, quiz questions, tools registry |
| Jun 11 | Rex | Full codebase audit — see TECHSIM_AUDIT_REPORT.md |
| Jun 11 | Tim | Architecture rethink — navbar restructure, middleware plan |
| Jun 11 | Kai | Added middleware: rateLimiter, planGuard, sanitize, requestLogger, helmet. Fixed API key logging, feedback model, interview progress. |

---

*This file must be updated by every agent after completing their task.*
*Keep it under 300 lines. Be specific. No fluff.*
