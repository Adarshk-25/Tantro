# Tantro — tantro.in

The Tantro website: "The Living Intelligence Interface". It's an interactive, scroll-driven homepage that demonstrates industrial connectivity, AI and physical systems through how it behaves.

## Setup

Requires Node.js 20.9 or later.

```bash
npm ci
cp .env.example .env.local   # then fill in values
npm run dev                  # http://localhost:3000
```

Production:

```bash
npm run check   # TypeScript + production build
npm start
```

Deploys to any Next.js host (Vercel, Node server, or Cloudflare via OpenNext). The only server code is `app/api/contact/route.ts`.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical URL for metadata, sitemap, Open Graph (default `https://tantro.in`). |
| `RESEND_API_KEY` | for contact delivery | [Resend](https://resend.com) API key. Server-side only. |
| `CONTACT_FROM_EMAIL` | for contact delivery | Verified sender, e.g. `Tantro Website <web@tantro.in>`. |
| `CONTACT_TO_EMAIL` | optional | Inbox for enquiries (default `info@tantro.in`). |

Without `RESEND_API_KEY` and `CONTACT_FROM_EMAIL`, the form still validates input, but the API returns **503** and the visitor is told to email `info@tantro.in`. It never reports a false success.

## Architecture

```
app/                    routes: / (homepage), /company, /api/contact, sitemap, robots, OG image, 404
content/                ALL copy and data, typed — edit here, not in components
components/
  hero/                 Hero (SSR text) + HeroScene (dynamic, WebGL) + HeroFallback (2D canvas)
  three/                SceneCanvas (DPR cap, visibility pause, adaptive DPR), ParticleMorphSystem (GLSL morph)
  scroll/               ScrollStoryController (GSAP ScrollTrigger, observe-only), MotionRoot (reveals)
  nav/                  SiteNav, ChapterRail, active-chapter/surface hooks
  chapters/             one component per chapter (+ sub-folders for simulations and scenes)
  viz/                  PointCloudProjector — dependency-free 3D point cloud on 2D canvas
lib/
  particles/            procedural samplers and shapes (hero states, capability forms)
  iso.ts                isometric projection for the engineering drawing
  device.ts             quality tiers, WebGL detection, particle budgets
  contact/validate.ts   validation shared by browser and server
```

### Homepage chapters (v2)

Each chapter is a viewport-height story panel (`ChapterTransition`). It has a compact header and an interactive stage that fills the rest of the screen, so the heading, the interaction and the explanation stay visible together. Headings scale with viewport width *and* height (`.t-h1`, `.t-h2`), so they don't clip on short laptop screens.

| # | Chapter | Component | What the visitor does |
| --- | --- | --- | --- |
| 00 | Hero | `Hero`, `ParticleMorphSystem` | Scrolls through a particle machine (up to 60k GPU particles) that becomes a layered OT network, then a neural lattice, then an integrated system. A labelled four-state progress readout tracks the transformation. |
| 01 | Every machine has a story | `MachineStoryExplorer` | Explores a shaded isometric production cell with seven assets (`lib/iso.ts`). Numbered hotspots, an asset selector and a guided tour each open a four-part story: problem → data observed (with trend) → risk → action. |
| 02 | Make systems speak | `ConnectivityExplorer`, `viz/ArchitectureDiagram` | Switches between eight integration scenarios with security zones, animated data paths, protocol tracing and a phone layout. |
| 03 | From data to decisions | `DecisionLab`, `lab/charts.ts` | Works through 13 industrial use cases in six steps (context → signals → model logic → insight → action → impact), each with a formula cue and a purpose-built chart. Autoplay runs through every use case. |
| 04 | One engineering mindset | `CapabilityExplorer`, `three/MorphCloud` | Uses a discipline list, a reading zone (scope, technologies, problem, outcome, value) and a GPU point-cloud figure. |
| 05 | The next frontier is physical | `PhysicalAIExplorer`, `robotics/buildHumanoid.ts`, `robotics/HumanoidScene.tsx` | Explores an original articulated humanoid with per-stage 3D overlays and projected labels. The stage selector and the figure are always on screen together. |
| 06 | Ideas become valuable when they work | `EngineeringWork` | Filters cards by status, sees previews and opens details in an accessible modal (`<dialog>`). |
| 07 | Bring us the problem | `ContactForm` | Follows a "what happens next" sequence and submits a validated form to `/api/contact`. |

### Performance and accessibility

- Hero text is server-rendered. three.js loads after idle, and the robotics scene loads only as the visitor approaches it.
- Particle count adapts to device tier. DPR is capped (1–1.75) and drops if frame time stays above 40 ms.
- Rendering pauses off-screen and in hidden tabs.
- Native scrolling only, no scroll hijacking.
- `prefers-reduced-motion` freezes idle motion, removes reveals and makes morphs immediate.
- Without WebGL, the hero falls back to a 2D-canvas rendering of the same shapes.
- Skip link, focus-visible styles, arrow-key tablists, labelled form fields with `aria-describedby` errors, and a focus-trapped mobile menu.

## Content integrity — before launch

- `content/contact.ts`: confirm the promised response time ("within two working days").
- `content/work.ts`: every entry is a **draft**. Confirm the status (demonstration / concept / research) and the wording. Never list client work without written approval.
- `content/site.ts` and `content/company.ts`: replace the `[bracketed]` placeholders (registered name, city, founders, year).
- `app/opengraph-image.tsx` generates a placeholder OG image. Replace it with a designed one.
- All simulator data is synthetic and labelled as such on the page.
- `public/tantro-logo.png` is unchanged and used as the favicon. The page header uses a typographic wordmark, because the logo's blue/purple gradient conflicts with the graphite/copper palette.

## V3 notes

### Brand system
Colours are derived from the Tantro logomark (sampled from `public/tantro-logo.png`):

| Token | Value | Use |
| --- | --- | --- |
| `--color-brand-blue` | `#2569D1` | primary actions, gradients |
| `--color-brand-indigo` | `#5B55D6` | gradient midpoint |
| `--color-brand-cyan` | `#16A8B7` | data, highlights |
| `--color-brand-teal` | `#1BB088` | positive outcomes |
| `--color-ink-950` | `#090D16` | background |
| `--color-hi` / `--color-mid` | `#F3F6FC` / `#ABB8CE` | text |

Warning and alert colours (`#F2B545`, `#F2707A`) are kept only where data needs them. `public/tantro-mark.png` is a transparent derivative of the original logo, used in the navigation; the original file is unchanged.

### Humanoid point cloud
The Physical AI humanoid is an original design, generated offline from signed-distance-field body parts:

```bash
node scripts/build-humanoid.mjs 96000
```

The script writes `public/models/humanoid-points.bin` (about 1.1 MB) and `public/models/humanoid-levels.json`. The levels are nested blue-noise sets, so every budget the client picks is evenly spaced. If you regenerate, copy the level boundaries into `HUMANOID_LEVELS` in `components/chapters/robotics/pointHumanoid.ts`. The client picks a level from the figure's on-screen size and the device tier.

### Work pages and the "All Work shows nothing" fix
- Every project has a route at `/work/[slug]`, with an interactive preview, problem, challenge, approach, validation status and related capabilities.
- The work filter is stored in the URL (`/?work=research#work`). The project Back link and the browser's back/forward buttons restore it.
- **Root cause of the empty list:** `MotionRoot` hid every `[data-reveal]` element and observed only elements that existed when it first ran. Cards mounted later stayed at opacity 0, for example after switching filters back to "All work". `MotionRoot` now registers late-mounted elements with a `MutationObserver`, and work cards no longer depend on reveal animation.
