# Kush Bhardwaj — Portfolio

A single-page portfolio built with Next.js (App Router) and Turbopack: a
Three.js / React Three Fiber hero and background scenes, Framer Motion
scroll animations, a small WebGL "shoot the skills" game, and a
Formspree-backed contact form.

Live: https://portfolio-wine-delta-35.vercel.app

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **3D:** `three`, `@react-three/fiber`, `@react-three/drei`
- **Animation:** Framer Motion
- **Styling:** Tailwind CSS v4
- **Forms:** Formspree (see `components/ContactForm.tsx`)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```
app/
  page.tsx          # the entire single-page layout — hero, projects,
                     # timeline, credentials, skills game, contact
  layout.tsx         # fonts, metadata (SEO/OG), JSON-LD
  opengraph-image.tsx / twitter-image.tsx   # generated social preview card
  robots.ts / sitemap.ts
components/
  CustomCursor.tsx    # the custom cursor (site sets `cursor: none`)
  InViewCanvas.tsx     # pauses R3F canvases' render loop when scrolled
                        # out of view, so idle WebGL contexts don't burn CPU
  SkillCloud.tsx       # the "Arsenal" shooting-game skills section
  Timeline.tsx          # "My Journey" experience/education timeline
  ContactForm.tsx        # contact form (posts to Formspree)
```

## Scripts

| Command         | What it does                    |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the dev server             |
| `npm run build` | Production build                 |
| `npm run start` | Serve the production build       |
| `npm run lint`  | Run ESLint                       |

## Notes

- Content (projects, timeline entries, credentials, skills list) lives as
  plain data arrays at the top of the relevant component — edit those
  directly rather than hunting through JSX.
- `AGENTS.md` in the repo root has notes on this specific Next.js version's
  behavior — worth a skim before making framework-level changes.
