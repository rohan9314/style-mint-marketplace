# StyleMint Technical Specification

## 1. Purpose and Product Model

StyleMint is a creator marketplace where:

- creators mint style agents (art or writing),
- buyers generate outputs in those styles,
- each generation is priced in sats (Lightning),
- payouts are logged per creator/style for accounting.

The system is optimized for hackathon speed:

- no model fine-tuning pipeline,
- style "training" is implemented as profile extraction (structured summaries),
- persistence is JSON-first locally with optional cloud KV on Vercel.

---

## 2. High-Level Architecture

### 2.1 Runtime stack

- Framework: Next.js App Router + TypeScript
- UI: React client/server components in `app/`
- API: route handlers in `app/api/**/route.ts`
- AI provider: Gemini `generateContent` endpoint
- Payments: MoneyDevKit L402 wrapper (`withPayment`)
- Storage:
  - Local: `data/styles.json`, `data/earnings.json`
  - Cloud fallback: Vercel KV (`@vercel/kv`) when configured

### 2.2 Core bounded contexts

1. **Style Registry**
   - Create/read/update/delete style definitions
   - Distinguishes `art` vs `writing` style agents

2. **Generation Engine**
   - Single-style generation (`/api/generate`)
   - Fusion generation (`/api/generate/fusion`) story + multi-image pages

3. **Payments & Earnings**
   - L402 challenge and authorization (unless local skip is enabled)
   - Earnings ledger for creator payout visibility

4. **Creator Operations**
   - Creator studio for onboarding, update, delete, demo seeding

---

## 3. Data Model

Defined in `types/stylemint.ts`.

### 3.1 Style entities

- `ArtStyle`
  - identity: `id`, `creatorId`, `creatorName`
  - metadata: `title`, `description`, `pricePerGenerationSats`, `createdAt`
  - profile:
    - `visualSummary`
    - `keywords[]`
    - `palette[]`
  - references: `referenceImageUrls[]`

- `WritingStyle`
  - identity: `id`, `creatorId`, `creatorName`
  - metadata: `title`, `description`, `pricePerGenerationSats`, `createdAt`
  - profile:
    - `proseSummary`
    - `sentenceStructure`
    - `vocabularyLevel`
    - `recurringThemes[]`
    - `representativeExcerpts[]`

- `Style = ArtStyle | WritingStyle`

### 3.2 Earnings entity

- `EarningEvent`
  - `id`, `timestamp`
  - `styleId`, `creatorId`
  - `amountSats`
  - `paymentHash`
  - `buyerKind` (`human` | `agent`)
  - `generationId`

---

## 4. Persistence Design

### 4.1 Styles store (`lib/store/styles.ts`)

- In-memory cache for read efficiency (`cache`)
- Promise-based write lock (`writeLock`) to serialize writes
- Atomic local writes via temp file + rename
- Cloud mode:
  - enabled by KV env presence (`isCloudStoreEnabled`)
  - reads/writes styles through `cloudGet/cloudSet`

APIs:

- `loadStyles()`
- `saveStyles(styles)`
- `getStyleById(id)`
- `updateStyleById(id, updates)`
- `deleteStyleById(id)`

### 4.2 Earnings store (`lib/lightning/earnings.ts`)

- Same concurrency pattern (cache + lock)
- `logEarning()` prepends new event with UUID and timestamp
- `getEarningsForCreator(creatorId)`

### 4.3 Cloud store adapter (`lib/store/cloud-store.ts`)

- Decouples KV integration from domain logic
- Provides typed key/value read-write primitives

---

## 5. AI Layer

### 5.1 Gemini client (`lib/clients/gemini.ts`)

Responsibilities:

- API key resolution with fallback chains
- text generation
- image generation with model fallback and detailed error reasons

Key behaviors:

- Text key search order:
  - `GOOGLE_GEMINI_API_KEY`
  - `GEMINI_API_KEY`
  - `NANO_BANANA_API_KEY`
  - `GOOGLE_API_KEY`

- Image key search order:
  - `NANO_BANANA_API_KEY`
  - `GOOGLE_GEMINI_API_KEY`
  - `GEMINI_API_KEY`
  - `GOOGLE_API_KEY`

- Image generation:
  - uses `responseModalities: ["IMAGE"]`
  - safety settings set to `BLOCK_ONLY_HIGH`
  - supports configured image model (`GEMINI_IMAGE_MODEL`)
  - captures per-model attempt errors for diagnostics

### 5.2 Style agent modules

- `lib/agents/art-style-agent.ts`
  - ingest references -> visual profile JSON
  - generation prompt conditioning from profile + references
  - fallback retry path without reference images if needed

- `lib/agents/writing-style-agent.ts`
  - ingest writing samples -> prose profile
  - generate prose in learned style

- `lib/agents/fusion-agent.ts`
  - generate story first (writing style)
  - split story into paragraphs
  - generate one art image per paragraph (storybook pages)
  - returns:
    - full story
    - primary image (first success)
    - `pages[]` with page-level image/errors

---

## 6. API Contract

### 6.1 Style management

- `POST /api/style/create`
  - validates kind + metadata + sample cardinality
  - art: 3-8 image samples
  - writing: 2-5 text samples
  - ingests style profile and persists style

- `GET /api/style/list`
  - filters:
    - `creatorId`
    - `kind`
    - `q` (title/description/creator search)
  - `full=1` returns full objects
  - default returns trimmed marketplace objects

- `PATCH /api/style/[id]`
- `DELETE /api/style/[id]`

### 6.2 Generation

- `POST /api/generate`
  - single style inference
  - wraps handler in L402 via `withPayment` unless local skip
  - logs creator earning

- `POST /api/generate/fusion`
  - validates one art style + one writing style
  - calls fusion agent
  - sums sats from both styles
  - logs two earnings (one per creator/style)
  - returns story + image(s) + payout metadata

### 6.3 Misc

- `GET /api/creator/[id]` creator analytics/list view
- `POST /api/demo/seed` sample style bootstrapping
- `GET/POST /api/mdk` MoneyDevKit route

---

## 7. Payment Model and Local Bypass

### 7.1 Payment wrapping

`/api/generate` and `/api/generate/fusion` are wrapped with:

- `withPayment({ amount, currency: "SAT" }, handler)`

### 7.2 Local testing mode

Current project supports local bypass:

- env: `SKIP_L402_DEV=1`
- behavior:
  - routes export `POST = handler` (no challenge)
  - useful for local creator/demo testing without Lightning checkout

If unset:

- routes export wrapped paywall handler
- caller must satisfy L402 authorization.

---

## 8. Frontend Architecture

### 8.1 App shell

- `app/layout.tsx` root layout + nav integration
- `app/components/site-nav.tsx` route switching

### 8.2 Marketplace

- `app/page.tsx` server-side initial style load
- `app/components/marketplace-browser.tsx`
  - client filtering/search
  - style cards and route links

### 8.3 Creator Studio

- `app/creator/studio/page.tsx`
- `app/creator/studio/studio-form.tsx`
  - art mode: image uploads -> client resize -> data URLs
  - writing mode: pasted blocks + txt uploads
  - deploy action -> `/api/style/create`
  - style management:
    - refresh by creator
    - quick price patch
    - delete
  - demo seed action

### 8.4 Fusion create flow

- `app/create/page.tsx`
- `app/create/create-fusion-form.tsx`
  - fetch available styles
  - select one art + one writing style
  - submit generation prompt
  - robust response parsing for non-JSON failures
  - displays:
    - status/errors
    - story text
    - storybook pages (paragraph + per-page image)

---

## 9. End-to-End Flow Narratives

### 9.1 Creator mints art style

1. Creator uploads reference images in studio
2. Client preprocesses images to manageable size
3. `POST /api/style/create` receives metadata + samples
4. `ingestArtStyle` creates profile via Gemini vision
5. Style persisted to local JSON/KV
6. Style appears in marketplace/listing APIs

### 9.2 Buyer runs fusion generation

1. Buyer chooses art + writing style and enters prompt
2. `POST /api/generate/fusion`
3. (optional) L402 challenge/authorization
4. Backend generates story in writing style
5. Backend generates one image per paragraph in art style
6. Earnings logged for both creators
7. UI renders storybook pages with image warnings where needed

### 9.3 Autonomous buyer script

`scripts/buyer-agent.ts`:

- discovers style/endpoint
- handles L402 handshake
- pays invoice via MDK APIs
- retries with auth
- prints generation payload + payment proof metadata

---

## 10. Configuration and Environment

### 10.1 Essential env vars

- `GOOGLE_GEMINI_API_KEY` (or fallback keys)
- `NANO_BANANA_API_KEY` (preferred for image model access)
- `NEXT_PUBLIC_BASE_URL`
- `MDK_ACCESS_TOKEN` / `MDK_MNEMONIC` (when paywall enabled)
- `SKIP_L402_DEV=1` (local bypass mode)

### 10.2 Optional env vars

- `GEMINI_TEXT_MODEL`
- `GEMINI_IMAGE_MODEL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

---

## 11. Error Handling Strategy

- API routes return structured JSON errors with status codes
- Frontend parsing uses text-first fallback to avoid JSON parse crashes
- Gemini client bubbles rich diagnostics:
  - HTTP code
  - model-level failures
  - finish/block reasons
- Fusion degrades gracefully:
  - story can succeed even if some/all images fail

---

## 12. Operational Notes

### 12.1 Local dev

- default UI URL: `http://localhost:3000`
- use `SKIP_L402_DEV=1` for fast local demos

### 12.2 Webhook/payment dev mode

- requires public URL (ngrok/Vercel)
- `NEXT_PUBLIC_BASE_URL` must match reachable public host
- MDK webhook must point to `<base>/api/mdk`

### 12.3 Production guidance

- disable skip logic
- use real HTTPS domain
- prefer KV/db persistence over local JSON files
- rotate tokens/keys, never commit secrets

---

## 13. Current Tradeoffs / Known Constraints

- Style "training" is profile-based, not fine-tuned weights
- Local JSON store is not multi-instance durable
- Image generation depends on model entitlement/quota
- Long prompts + multi-page image generation can be latency-heavy
- L402 flow complexity is intentionally bypassable in local mode

---

## 14. Suggested Next Improvements

1. Add auth layer for creator ownership enforcement
2. Add pagination and sort APIs for large marketplaces
3. Add retry/backoff policy for transient Gemini failures
4. Add structured observability (request IDs, metrics)
5. Add integration tests for L402 + fusion APIs
6. Move earnings/styles to first-class DB schema

