# SpecCrew AI — Complete Project Notes

## 2. The Two Tracks (We Had to Pick One)

The hackathon gave two problem statements (tracks) to choose from:

### Track 1: AI for SDLC Productivity (Engineering Track)

**Problem:** Build an "Intelligent SDLC Copilot" — an AI tool that takes messy, unstructured software requirements (from docs, emails, user stories) and converts them into structured development artifacts like tasks, test cases, and project plans.

**Why it matters:** In real companies, requirements come from everywhere (emails, meetings, docs) and are often vague or incomplete. Developers waste time interpreting them. This tool automates that.

### Track 2: AI for Business Outcomes (Business Track)

**Problem:** Build "SmartSpend Analytics" — an AI platform that analyzes financial transaction data to detect fraud, categorize spending, and give financial health insights.

**Why it matters:** Banks and fintech companies process millions of transactions but don't extract meaningful insights from them.

### Why We Chose Track 1

1. **Our approach (prompt engineering) fits perfectly** — Track 1 is about text transformation (text in → structured text out), which is exactly what LLMs are great at. Track 2 would need traditional ML models, statistical analysis, and real financial datasets.

2. **Faster to build** — We have 2 weeks. Track 1 lets us build a polished product faster because the "AI brain" is prompt engineering, and the rest is UI/backend support.

3. **No data dependency** — Track 2 needs financial datasets. Track 1 just needs the user to paste their requirements text.

4. **Evaluation criteria favors us** — Track 1's top criterion is "Output Accuracy" (30%) which we can directly control through our prompts.

---

## 3. Track 1 Evaluation Criteria (How We'll Be Judged)

| Criteria                           | Weight | What Judges Want                                    |
| ---------------------------------- | ------ | --------------------------------------------------- |
| Output Accuracy                    | 30%    | AI produces correct, useful structured output       |
| Usability & Adoption               | 20%    | Easy to use, intuitive UI, practical for real teams |
| Code Quality / Technical Execution | 20%    | Clean code, proper architecture, error handling     |
| AI Integration Depth               | 20%    | AI is deeply woven in, not just one API call        |
| Presentation & Clarity             | 10%    | Demo video, slides, clear explanation               |

---

## 4. Our Project: SpecCrew AI

### The Concept — What Makes Us Different

Instead of building a boring "paste text → get output" tool like most teams will, we built **SpecCrew AI** — a system where **4 specialized AI agents collaborate like a virtual development team**.

Each agent has a unique name, role, personality, and specialized system prompt. They process requirements in sequence, each building on the previous agent's output. Users watch them work in real-time and can chat with any agent afterward.

### The 4 AI Agents

| Agent        | Role                | What They Do                                                                     | Color              |
| ------------ | ------------------- | -------------------------------------------------------------------------------- | ------------------ |
| **Aria** 🔍  | Requirement Analyst | Parses raw text into structured requirements with IDs, types, priorities         | Coral (#FF6B6B)    |
| **Quinn** 🧪 | QA Engineer         | Finds ambiguities, generates test cases, assesses risks                          | Teal (#4ECDC4)     |
| **Rex** ⚙️   | Tech Lead           | Breaks requirements into dev tasks with effort estimates and acceptance criteria | Sky Blue (#45B7D1) |
| **Sage** 📋  | Project Manager     | Creates project plan with milestones, risk matrix, recommendations               | Mint (#96CEB4)     |

### How The Pipeline Works

```
User pastes raw requirements
        ↓
    [Aria analyzes]  →  Structured requirements (REQ-001, REQ-002, ...)
        ↓
   [Quinn reviews]  →  Ambiguities found, test cases generated (TC-001, ...)
        ↓
   [Rex breaks down] → Dev tasks with effort estimates (TASK-001, ...)
        ↓
   [Sage plans]    →  Project plan, milestones, risks, recommendations
        ↓
   User gets full dashboard of results
   Can chat with any agent for follow-up
   Can export to JSON / CSV / Jira
```

Each agent call takes ~10-15 seconds. The whole pipeline runs in about 40-60 seconds.

### Why This Approach Scores Well

- **Output Accuracy (30%):** Each agent has a focused, well-crafted system prompt. Specialized prompts > one giant generic prompt.
- **Usability (20%):** Beautiful 3D UI, real-time pipeline visualization, drag-and-drop upload, one-click export.
- **Code Quality (20%):** Clean separation — each agent is its own module, proper REST APIs, organized project structure.
- **AI Integration Depth (20%):** 4 specialized AI agents in a chain (not just one API call), each with structured JSON output, conversational follow-ups, multi-stage pipeline.
- **Presentation (10%):** The 3D animated UI and agent "personalities" make for a memorable demo.

---

## 5. Tech Stack

| Layer        | Technology                      | Why                                                                        |
| ------------ | ------------------------------- | -------------------------------------------------------------------------- |
| Frontend     | React 18 + Vite                 | Fast dev server, component-based UI                                        |
| Styling      | Pure CSS with 3D transforms     | 3D effects (perspective, rotateX/Y, translateZ), glassmorphism, animations |
| Backend      | Node.js + Express               | JavaScript everywhere, fast to build                                       |
| AI           | OpenAI API (GPT-5.4-mini)       | Affordable, fast, good at structured output                                |
| Database     | SQLite (via better-sqlite3)     | Zero install — database is just a file. Perfect for demos                  |
| File Parsing | mammoth (docx), pdf-parse (pdf) | Extract text from uploaded documents                                       |
| Real-time    | Server-Sent Events (SSE)        | Stream pipeline progress to the browser in real-time                       |

### Why NOT Python?

Node.js lets us use one language (JavaScript) for both frontend and backend, making it faster for a 3-person team to collaborate. Also, our AI "brain" is in the prompts, not in Python ML libraries.

---

## 6. Project Structure

```
hackerearth/
├── .env                          # API key (NEVER commit this)
├── .gitignore
├── notes.md                      # This file
│
├── server/                       # Backend
│   ├── package.json
│   ├── speccrew.db               # SQLite database (auto-created)
│   └── src/
│       ├── index.js              # Entry point — starts the server
│       ├── app.js                # Express app setup, middleware, routes
│       ├── agents/               # The 4 AI agent definitions
│       │   ├── aria.js           # Requirement Analyst (system prompt + config)
│       │   ├── quinn.js          # QA Engineer
│       │   ├── rex.js            # Tech Lead
│       │   ├── sage.js           # Project Manager
│       │   └── index.js          # Exports all agents
│       ├── services/
│       │   ├── openai.js         # OpenAI API wrapper (chat completion)
│       │   ├── parser.js         # File parsing (txt, docx, pdf)
│       │   └── pipeline.js       # Orchestrates the 4-agent chain with SSE
│       ├── routes/
│       │   ├── projects.js       # CRUD for projects
│       │   ├── analyze.js        # SSE endpoint — triggers the pipeline
│       │   ├── chat.js           # Chat with individual agents
│       │   └── export.js         # Export results (JSON, CSV, Jira)
│       └── db/
│           └── database.js       # SQLite setup + query helpers
│
└── client/                       # Frontend
    ├── package.json
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx              # App entry point
        ├── App.jsx               # Routes
        ├── context/
        │   └── ProjectContext.jsx # Global state management
        ├── hooks/
        │   ├── useSSE.js         # Real-time pipeline streaming hook
        │   └── useAgentChat.js   # Chat with agents hook
        ├── pages/
        │   ├── Home.jsx          # Landing page + project list
        │   └── ProjectView.jsx   # Main workspace for a project
        ├── components/
        │   ├── Layout/           # Nav bar, background decorations
        │   ├── AgentCard/        # 3D agent profile cards
        │   ├── Pipeline/         # Horizontal pipeline visualization
        │   ├── Upload/           # Drag-and-drop file upload + text area
        │   ├── Results/          # Tabbed results (Requirements, QA, Tasks, Summary)
        │   ├── ChatPanel/        # Sliding chat sidebar
        │   ├── ExportPanel/      # Export format cards
        │   └── Dashboard/        # Stat counters
        └── styles/
            ├── global.css        # 3D CSS foundation, colors, animations
            └── agents.css        # Per-agent themed styles
```

---

## 7. How to Run the Project

### Prerequisites

- Node.js installed (v18+ recommended)
- An OpenAI API key

### Steps

1. **Open a terminal in the `server` folder:**

```bash
cd server
npm install
npm run dev
```

This starts the backend on http://localhost:3001

2. **Open another terminal in the `client` folder:**

```bash
cd client
npm install
npm run dev
```

This starts the frontend on http://localhost:5173

3. **Open http://localhost:5173 in your browser**

### Environment Variables

The `.env` file in the project root contains:

```
OPENAI_API_KEY=sk-proj-...   (our API key)
OPENAI_MODEL=gpt-4o-mini     (the model we're using)
PORT=3001                     (backend port)
```

---

## 8. Key Features Checklist

These map directly to the hackathon's required tasks:

| Required Task                | Our Feature                                             | Status |
| ---------------------------- | ------------------------------------------------------- | ------ |
| Requirement Ingestion Module | Upload text, .txt, .docx, .pdf files                    | Done   |
| Generate Structured Outputs  | Aria produces requirements with IDs, types, priorities  | Done   |
| Test Case Generation         | Quinn generates test cases with steps, expected results | Done   |
| Ambiguity Detection          | Quinn flags unclear requirements with suggestions       | Done   |
| Interactive Dashboard        | Full dashboard with stats, tabbed results, 3D UI        | Done   |

### Bonus Tasks (Extra Points)

| Bonus Task                         | Our Feature                                      | Status |
| ---------------------------------- | ------------------------------------------------ | ------ |
| Conversational assistant           | Chat with any of the 4 agents about the analysis | Done   |
| Effort estimation                  | Rex estimates hours per task (S/M/L/XL sizing)   | Done   |
| Export to project management tools | Export to JSON, CSV, and Jira-importable format  | Done   |

---

## 9. The "Secret Sauce" — Our System Prompts

The real brain of the app is the system prompts in `server/src/agents/`. Each agent has a 300-500 word system prompt that:

- Defines the agent's persona and expertise
- Gives detailed instructions on what to analyze
- Specifies the exact JSON output format with field descriptions
- Includes rules for edge cases (e.g., "always find at least 3 ambiguities")
- Forces structured JSON output (no markdown, no explanation outside JSON)

If we need to improve output quality, we tune these prompts. No code changes needed.

---

## 10. What Each Team Member Should Know

### If you're working on the FRONTEND:

- All UI code is in `client/src/`
- Components are in `client/src/components/` — each has a `.jsx` and `.css` file
- Styles use CSS variables defined in `global.css`
- 3D effects use CSS `perspective`, `transform`, `translateZ`
- The app uses React Context (`ProjectContext.jsx`) for global state
- Two custom hooks: `useSSE.js` (pipeline streaming) and `useAgentChat.js` (chat)

### If you're working on the BACKEND:

- All server code is in `server/src/`
- Agent prompts are in `server/src/agents/` — tune these to improve output quality
- The pipeline runs in `server/src/services/pipeline.js`
- API routes are in `server/src/routes/`
- Database is SQLite — auto-created, no setup needed

### If you're working on the PRESENTATION:

- Demo flow: Create project → paste requirements → watch pipeline → show results → chat → export
- Key selling points: Multi-agent AI pipeline, real-time visualization, conversational follow-up, one-click export
- Emphasize: This isn't just one API call — it's 4 specialized agents that collaborate

---

## 11. Submission Requirements

We need to submit ALL of these by May 15:

- [ ] Project Description (write-up)
- [ ] Presentation / Slides
- [ ] Documentation or Implementation Report
- [ ] Working Demo (screen recording of the app)
- [ ] Source Code (ZIP file — include video inside)
- [ ] Video Folder (inside the ZIP)

Optional:

- [ ] GitHub link
- [ ] Video link

---

## 12. Timeline Suggestion (Remaining Days)

| Date      | Task                                                      |
| --------- | --------------------------------------------------------- |
| May 5-7   | Test the app, fix bugs, improve prompts for better output |
| May 8-10  | UI polish, add any missing features, improve 3D effects   |
| May 11-12 | Record demo video, prepare slides                         |
| May 13-14 | Write documentation, finalize everything                  |
| May 15    | Final submission                                          |

---

## 13. Quick Glossary

| Term               | Meaning                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------- |
| SDLC               | Software Development Life Cycle — the process of building software                            |
| LLM                | Large Language Model — AI models like GPT that understand/generate text                       |
| Prompt Engineering | The art of writing instructions for AI models to get better output                            |
| SSE                | Server-Sent Events — a way for the server to push updates to the browser in real-time         |
| RAG                | Retrieval Augmented Generation — feeding relevant context to an AI before asking it questions |
| Pipeline           | A sequence of processing steps, each feeding into the next                                    |
| Glassmorphism      | A UI design style with frosted glass effects (blur + transparency)                            |

---

_Last updated: May 5, 2026_
