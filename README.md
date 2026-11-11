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

### Homepage chapters

| # | Chapter | Component | Technique |
| --- | --- | --- | --- |
| 00 | Hero | `Hero`, `ParticleMorphSystem` | Up to 18k GPU particles morph in a shader between four procedural states: robot arm → layered OT network → neural lattice → integrated loop. Scroll-linked, pointer pressure field. |
| 01 | Every machine has a story | `PhysicalWorld` | Procedural isometric line drawing; accessible hotspots show illustrative live signals. |
| 02 | Make systems speak | `IndustrialNetworkVisualization` | Architecture modelled on ISA-95 layers; pick a field asset to trace its route with protocols and moving packets. Separate desktop and phone compositions. |
| 03 | From data to decisions | `IntelligenceSimulator` | Three canvas simulations (anomaly, vision, line bottleneck as a discrete-event sim), each run Input → Processing → Insight → Action. |
| 04 | One engineering mindset | `CapabilityExplorer` | Keyboard-accessible tablist; central point cloud morphs between six forms. |
| 05 | The next frontier is physical | `RoboticsExplorer` | Lazy-loaded R3F humanoid built from particles, with layer overlays for perception, reasoning, planning, motion and supervision. |
| 06 | Ideas become valuable when they work | `EngineeringWork` | Ledger with status filters; original SVG figures. |
| 07 | Bring us the problem | `ContactForm` | Validated form → `/api/contact`. |

### Performance and accessibility

- Hero text is server-rendered. three.js loads after idle, and the robotics scene loads only as the visitor approaches it.
- Particle count adapts to device tier. DPR is capped (1–1.75) and drops if frame time stays above 40 ms.
- Rendering pauses off-screen and in hidden tabs.
- Native scrolling only, no scroll hijacking.
- `prefers-reduced-motion` freezes idle motion, removes reveals and makes morphs immediate.
- Without WebGL, the hero falls back to a 2D-canvas rendering of the same shapes.
- Skip link, focus-visible styles, arrow-key tablists, labelled form fields with `aria-describedby` errors, and a focus-trapped mobile menu.

## Content integrity — before launch

- `content/work.ts`: every entry is a **draft**. Confirm the status (demonstration / concept / research) and the wording. Never list client work without written approval.
- `content/site.ts` and `content/company.ts`: replace the `[bracketed]` placeholders (registered name, city, founders, year).
- `app/opengraph-image.tsx` generates a placeholder OG image. Replace it with a designed one.
- All simulator data is synthetic and labelled as such on the page.
- `public/tantro-logo.png` is unchanged and used as the favicon. The page header uses a typographic wordmark, because the logo's blue/purple gradient conflicts with the graphite/copper palette.
