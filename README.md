# StyleMint

Lightning-paid creator style marketplace for the agent economy.

Creators can mint:
- **Art style agents** from image references
- **Writing style agents** from text samples

Buyers (human or autonomous) pay with Lightning and generate outputs in that style.

---

## Core Features

- **Creator dashboard** for publishing art and writing agents
- **Gemini style ingest** that extracts reusable style fingerprints
- **Gemini generation** for both images and prose
- **Marketplace browsing** with search and type filters
- **Per-creator agent management** (refresh, quick price edits, delete)
- **L402 paywalled generation** via MoneyDevKit
- **Autonomous buyer agent CLI** for end-to-end machine payment demos
- **Demo seed endpoint/button** for hackathon-ready sample styles

---

## Tech Stack

- **Framework:** Next.js App Router + TypeScript
- **AI:** Gemini API (`generateContent`)
- **Payments:** `@moneydevkit/nextjs` (L402 flow)
- **Storage:**
  - Local JSON files for local development
  - Vercel/Upstash Redis (`@vercel/kv`) for deployment persistence

---

## Quickstart (Local)

1. Install dependencies:
   - `npm install`
2. Create `.env.local` with required variables (see below)
3. Seed demo styles:
   - `npm run seed`
4. Start app:
   - `npm run dev`
5. Open:
   - [http://localhost:3000](http://localhost:3000)

Optional buyer-agent demo:
- `npm run buyer-agent -- art_001 "a detective under neon rain"`

---

## Environment Variables

Create `.env.local`:

```env
MDK_ACCESS_TOKEN=
MDK_MNEMONIC=
GEMINI_API_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional for Vercel persistence (recommended in production)
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

---

## Deploying to Vercel (Hackathon Path)

1. Push repo to GitHub
2. Import project into Vercel
3. Add environment variables in Vercel Project Settings
4. Ensure Redis/KV integration is connected (`KV_REST_*`)
5. Deploy
6. Open `/creator/studio` and click **Seed Demo Styles** for instant demo data

### Why KV matters
Vercel serverless file systems are ephemeral. Without KV, uploaded styles can reset between deployments/instances.

---

## User Flows

### Creator flow
1. Go to `Creator Dashboard`
2. Choose `Artist Agent` or `Writer Agent`
3. Upload/paste samples
4. Set style metadata + sats price
5. Click `Create and Deploy`
6. Style appears in marketplace

### Buyer flow (human)
1. Browse marketplace
2. Pick style
3. Call paid generation route
4. Complete L402 payment
5. Receive generated output

### Story + art fusion (human)
1. Open **Story + art** (`/create`)
2. Select one **art** style and one **writing** style
3. Enter what the story should be about
4. Pay combined sats (both prices) via L402, then generation returns **prose + illustration**

### Buyer flow (autonomous agent)
1. Run `npm run buyer-agent -- <styleId> "<prompt>"`
2. Script performs 402 -> pay -> authorized retry
3. Returns generated result + payment proof data

---

## API Surface

- `GET /api/style/list`
  - Query options:
    - `full=1`
    - `creatorId=...`
    - `kind=art|writing`
    - `q=search`
- `POST /api/style/create`
- `PATCH /api/style/[id]`
- `DELETE /api/style/[id]`
- `POST /api/generate` (L402 paywalled, single style)
- `POST /api/generate/fusion` (L402 paywalled: `artStyleId` + `writingStyleId` + `prompt`; price = sum of both)
- `GET /api/creator/[id]`
- `POST /api/demo/seed` (demo helper)

---

## Notes on “Training”

For hackathon speed, StyleMint uses **style-profile learning** rather than fine-tuned model weights:
- Ingest samples -> create structured style profile
- Persist profile per creator style
- Reuse profile during generation

This gives fast onboarding, low ops overhead, and a strong demo story.

---

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — lint checks
- `npm run seed` — replace with demo seed styles
- `npm run buyer-agent -- <styleId> "<prompt>"` — autonomous buyer flow
