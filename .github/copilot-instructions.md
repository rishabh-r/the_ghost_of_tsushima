# Copilot Instructions for this Repository

## Build, test, and lint commands

Run commands from the repository root (`D:\the_ghosts_of_tsushima\the_ghost_of_tsushima`).

| Purpose | Command | Notes |
|---|---|---|
| Install dependencies | `npm install` | Uses root `package.json` |
| Start local dev app | `npm run dev` | Vite dev server on port `5173` |
| Production build | `npm run build` | Outputs to `dist/` |
| Preview production build | `npm run preview` | Serves built app locally |
| Lint | _Not configured_ | No `lint` script in `package.json` |
| Test suite | _Not configured_ | No `test` script in `package.json` |
| Single test | _Not available_ | No test runner/scripts are defined yet |

## High-level architecture

This is a Vite + React SPA with Vercel serverless API routes. The frontend orchestrates a 4-stage AI pipeline and stores project state in browser `localStorage`; the backend API routes call OpenAI and return structured JSON.

1. **App shell and routing:** `src/main.jsx` wraps `BrowserRouter` + `ProjectProvider`; `src/App.jsx` routes `/` to `Home` and `/project/:id` to `ProjectView`.
2. **Project persistence layer:** `src/context/ProjectContext.jsx` is the single source of project state in the client, persisted under `localStorage` key `speccrew_projects`.
3. **Pipeline execution flow:** `src/hooks/useSSE.js` runs agents sequentially (`aria -> quinn -> rex -> sage`) by POSTing to `/api/analyze`, passing prior agent outputs forward as context.
4. **Result rendering + persistence:** `src/pages/ProjectView.jsx` converts live outputs to `project.analyses` and persists completed runs back through `updateProject`.
5. **Conversation flow:** `src/hooks/useAgentChat.js` sends contextual chat payloads to `/api/chat`, including project name, raw input, prior analyses, and chat history.
6. **Serverless backend:** `api/analyze.js` and `api/chat.js` are Vercel functions that load agent configs from `lib/agents/*`, call OpenAI, and return JSON consumed directly by the UI.
7. **Deployment wiring:** `vercel.json` rewrites `/api/*` to functions and all other routes to `index.html` (SPA fallback).

## Key conventions in this codebase

1. **Agent contract is centralized in `lib/agents/`:** each agent module exports `name`, `displayName`, `role`, `color`, `emoji`, `systemPrompt`, and `parseOutput(text)`. Keep this shape consistent for all agents.
2. **Structured-output tolerance pattern:** agent `parseOutput` functions strip Markdown fences and attempt `JSON.parse`; on failure they return a safe fallback object with stable keys (never throw).
3. **Fixed 4-agent pipeline assumption:** the app logic assumes exactly four agents in order (`aria`, `quinn`, `rex`, `sage`) in multiple places (`useSSE`, `Pipeline`, completion checks in `ProjectView`). Any agent set/order change requires coordinated updates across these files.
4. **Frontend/backed payload naming must stay aligned:** analysis endpoint expects `rawInput`, `agentName`, `previousOutputs`; chat endpoint expects `agentName`, `message`, `projectName`, `rawInput`, `analyses`, `history`.
5. **Agent visual metadata is duplicated intentionally:** UI cards/tabs define display metadata (emoji/color/role) in `src/components/AgentCard/AgentCard.jsx` and `src/components/Results/Results.jsx`; keep values synchronized with `lib/agents/*` to avoid UI/API drift.
6. **Project storage schema is UI-driven:** each project record uses `{ id, name, rawInput, status, analyses, createdAt }` and is treated as append/update-only via reducer actions in `ProjectContext`.
