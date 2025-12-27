# AGENTS.md — Bar-Chart Race Generator (Web)

## 1) Project Summary
Build a web application that generates **bar-chart race** animations from a user’s natural-language prompt. The user enters a topic (e.g., “GDP by country 1960–2024”), the app calls an LLM API (e.g., OpenRouter or Volcengine) **with web search enabled**, the system returns a structured dataset + chart configuration, and the webpage renders an animated bar-chart race that the user can **showcase or download** (video/GIF/data).

## 2) Core Goals
- **Simple UX**: one prompt box → generate → preview animation → download/share.
- **Reliable data pipeline**: prompt → web search → extraction → validated time-series ranking dataset.
- **High-quality rendering**: smooth, readable, aesthetically consistent bar-chart race.
- **Download options**: at minimum JSON/CSV; ideally MP4/WebM and GIF.
- **Reproducibility**: output includes sources/citations and a “regenerate” capability.

## 3) Non-Goals (v1)
- Enterprise multi-user permissions, team workspaces, billing.
- Fully general data wrangling UI (manual pivoting, joins, etc.).
- Offline-only generation (LLM + search are required for v1).
- Perfect coverage for niche datasets; prioritize mainstream public datasets.

## 4) Target Users & User Stories
### Primary users
- Teachers, content creators, analysts, students.

### User stories
1. As a user, I type “Search engine market share 1995–2024” and get an animation.
2. As a user, I can adjust basic settings (top N, time range, speed) and re-render.
3. As a user, I can download the animation as MP4/WebM (or GIF) and the dataset as CSV/JSON.
4. As a user, I can see where the data came from (citations + extraction notes).
5. As a user, I can share a link to the generated project state.

## 5) UX Requirements
### Single-page flow
- Prompt input (topic + optional constraints)
- “Generate” button + progress states (Searching → Extracting → Validating → Rendering)
- Preview player controls:
  - Play/Pause, scrub timeline
  - Speed (0.5×, 1×, 2×)
  - Top N (e.g., 5–30)
  - Value format (short scale, percent, currency)
  - Theme (light/dark)
- Output actions:
  - Download: MP4/WebM/GIF (as supported), PNG snapshot, CSV, JSON
  - Copy share link

### Accessibility
- Keyboard navigable controls
- High-contrast labels and readable typography
- Avoid relying only on color for rank changes

## 6) Technical Architecture (Recommended)
### Stack
- **Next.js (App Router) + TypeScript**
- Chart rendering: **D3.js** (SVG) or **Canvas** (for smoother exports)
- Schema validation: **zod**
- State management: lightweight (React state + URL state)
- LLM API: **OpenRouter** or **Volcengine** (server-side calls to protect keys)
- Optional: caching via KV (Redis/Upstash) or in-memory (v1)

### Why Next.js
- Server routes for LLM calls without exposing API keys
- Easy deployment to Vercel/Cloudflare

### High-level components
- `PromptPanel` (input + preset prompts)
- `GenerationPipeline` (progress + logs)
- `RaceRenderer` (chart + timeline)
- `ExportPanel` (video/GIF/data download)
- `SourcePanel` (citations + dataset provenance)

## 7) Data Contract (Critical)
All rendering must rely on a strict, validated JSON schema.

### `RaceSpec` schema (v1)
```json
{
  "title": "GDP by Country",
  "subtitle": "1960–2024 (current USD)",
  "unit": "USD",
  "valueFormat": "shortCurrency",
  "timeField": "year",
  "entityField": "name",
  "valueField": "value",
  "topN": 12,
  "framesPerStep": 12,
  "stepDurationMs": 900,
  "notes": "Any caveats about missing data or interpolation",
  "sources": [
    { "title": "World Bank GDP (current US$)", "url": "https://...", "accessed": "2025-12-27" }
  ],
  "data": [
    { "year": 1960, "name": "United States", "value": 543300000000 },
    { "year": 1960, "name": "Japan", "value": 44300000000 }
  ]
}

Validation requirements
	•	time must be monotonically increasing across steps.
	•	No negative values unless the metric allows it (default: disallow).
	•	Units and formatting must be consistent.
	•	If missing values exist, define a policy:
	•	default: forward-fill within a limited window, otherwise omit entity for that time step.
	•	Enforce a maximum dataset size (e.g., <= 50,000 rows) to protect performance.

8) LLM Orchestration Plan

Principle

The LLM is responsible for: (1) clarifying the metric and timeframe, (2) using web search, (3) extracting a dataset, (4) returning a validated RaceSpec JSON.

Two-step prompting (recommended)
	1.	Planner step: interpret user prompt → decide metric definition, timeframe, likely sources, and extraction approach.
	2.	Extractor step: call web search tools → parse tables / reports → build dataset → output RaceSpec.

Function calling / tool use
	•	Use provider-native web search capability if available.
	•	If not, integrate an external search tool (Tavily/SerpAPI) and pass results to the LLM.

System prompt guidelines (do not show users)
	•	Force JSON-only output (no prose).
	•	Require sources with URLs.
	•	Require a “data caveats” field when data is estimated or stitched.
	•	Require consistent entity naming (normalize country names, etc.).
	•	If insufficient data is found, return:
	•	status: "insufficient_data"
	•	missing: ["time range", "credible source", ...]
	•	suggested narrower prompt variants

9) Bar-Chart Race Rendering Requirements

Animation rules
	•	For each time step:
	•	sort entities by value
	•	keep top N visible (optionally “others”)
	•	animate transitions in position and width
	•	Interpolate values between steps for smoothness:
	•	linear interpolation per frame
	•	Display:
	•	rank number, entity label, value label
	•	time indicator (big year/date)
	•	Handle ties deterministically (secondary sort by name)

Implementation choices
	•	SVG (D3): simpler and crisp; exports need extra work.
	•	Canvas: smoother for large N and easier frame capture for MP4/WebM.
	•	Recommendation: implement SVG first for speed, then add Canvas exporter if needed.

10) Export / Download Strategy

Minimum (v1)
	•	Download RaceSpec.json
	•	Download data.csv
	•	Download PNG snapshot (current frame)

Preferred (v1.5)
	•	Download WebM/MP4:
	•	Render frames → capture via canvas.captureStream() + MediaRecorder (WebM)
	•	Optionally use WebCodecs (advanced) for MP4/H.264 where supported
	•	Download GIF:
	•	frame capture + gif.js (client-side; set size limits)

Constraints
	•	Provide export limits (e.g., max 60 seconds, max 1080p) to avoid browser crashes.
	•	Show estimated file size and time based on settings.

11) Security, Privacy, Compliance
	•	Never expose API keys to the client; all LLM calls go through /api/generate.
	•	Log redaction: do not store user prompts by default (or store only with explicit consent).
	•	Cite sources and surface basic licensing caveats:
	•	If data appears copyrighted or paywalled, warn and avoid copying large tables verbatim.
	•	Rate limit /api/generate to prevent abuse.
	•	Content safety: refuse disallowed content per provider policy.

12) Performance & Caching
	•	Cache by a stable hash of:
	•	normalized prompt + time window + topN + provider model id
	•	Deduplicate repeated generations.
	•	Render optimization:
	•	virtualize labels if needed
	•	limit topN default to 10–15

13) Error Handling Requirements
	•	If LLM returns invalid JSON:
	•	auto-retry once with “repair” instruction
	•	if still invalid: show a structured error to user + raw response (developer toggle)
	•	If sources conflict:
	•	pick one primary source, annotate caveats, or return insufficient data
	•	If dataset too large:
	•	automatically reduce timeframe granularity (e.g., yearly → every 2 years)
	•	or reduce topN

14) Testing Plan

Unit tests
	•	Schema validation (zod)
	•	Sorting + interpolation correctness
	•	Export pipeline (mock)

Integration tests
	•	/api/generate with mocked LLM responses
	•	Rendering smoke tests across browsers

Visual regression (optional)
	•	snapshot key frames for known specs

15) Suggested Repo Structure

/app
  /api/generate/route.ts
  /page.tsx
/components
  PromptPanel.tsx
  GenerationProgress.tsx
  RaceRenderer.tsx
  ExportPanel.tsx
  SourcePanel.tsx
/lib
  llm/client.ts
  llm/prompts.ts
  llm/schema.ts
  data/normalize.ts
  data/interpolate.ts
  render/raceLayout.ts
  export/capture.ts
/public
  presets.json
/tests

16) Environment Variables
	•	OPENROUTER_API_KEY=... (or Volcengine equivalent)
	•	LLM_MODEL_ID=...
	•	SEARCH_ENABLED=true (feature flag)
	•	Optional: CACHE_PROVIDER=memory|redis, REDIS_URL=...

17) API Contract: /api/generate

Request

{
  "prompt": "GDP ranking by country 1960-2024",
  "options": { "topN": 12, "timeRange": "1960-2024" }
}

Response (success)

{ "status": "ok", "raceSpec": { "...": "RaceSpec JSON" } }

Response (insufficient)

{
  "status": "insufficient_data",
  "missing": ["credible source for full range"],
  "suggestedPrompts": ["GDP by country 2000-2024 World Bank", "..."]
}

18) Milestones

M0 — MVP (must ship)
	•	Prompt → /api/generate → validated RaceSpec → render SVG bar-chart race
	•	Download JSON/CSV/PNG
	•	Sources panel

M1 — Export video
	•	Canvas-based renderer or SVG→Canvas capture
	•	WebM export via MediaRecorder

M2 — Quality & polish
	•	Presets gallery
	•	Better normalization (country names, currencies)
	•	Shareable links (encode spec in URL or store in KV)

19) Agent Operating Instructions (for Coding Agent)

When implementing:
	1.	Start with strict RaceSpec schema and validation-first pipeline.
	2.	Implement rendering with a small known fixture RaceSpec to lock animation behavior.
	3.	Implement /api/generate with mocked LLM response; then integrate provider.
	4.	Add repair logic for malformed JSON (single retry).
	5.	Add export (JSON/CSV) before attempting video.
	6.	Only then add GIF export with clear limits and user feedback.

Definition of done for MVP:
	•	A user can enter a prompt and, in under ~30 seconds for common topics, see a working bar-chart race with credible sources and download JSON/CSV/PNG.