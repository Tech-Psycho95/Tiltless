# DESIGN.md: Tiltless design system

Starting spec. The agent must reconcile this with the existing site: if the
code already differs, extract the REAL values from the code and update this
file, then follow it for all new UI.

## Feel
Quant terminal meets luxury product. Dark, high-contrast, precise. No stock
imagery, no generic gradient blobs.

## Color tokens
- bg: #07090B
- surface (glass cards): rgba(255,255,255,0.04) with 1px border rgba(255,255,255,0.08), backdrop-blur
- text: #E8ECEF, muted: #8A939B
- accent (mint/teal): #97FCE4
- loss / tilt red: #FF5C5C (use ONLY for losses and tilt)
- gain green: reuse accent
- Grain overlay: subtle noise at low opacity

## Typography
- Display: Space Grotesk or Sora (bold)
- Body: Inter
- All numbers use tabular figures (`font-variant-numeric: tabular-nums`)

## Components
- Glass cards, radius 16px, soft glow on hover
- Primary button: accent fill, dark text, magnetic hover, ripple on click
- Stat cards: large number, small muted label, optional delta chip
- Evidence chips: small pills showing coin, time range or trade count
- Skeleton shimmer while loading, with agent status text

## Motion
- Smooth scroll (Lenis) synced with GSAP ScrollTrigger
- Section headings: masked line-by-line reveal
- Numbers count up on viewport enter
- Card hover: 3D tilt toward cursor, glare highlight, border glow
- Respect prefers-reduced-motion: disable scroll choreography, 3D motion, custom cursor

## 3D
- Procedural geometry only (React Three Fiber). Glass-like candlesticks that
  turn red and shake to show "tilt". Cap DPR at 2, pause off-screen, lighter
  scene on mobile, static fallback if WebGL is unavailable.

## Content rules
- Never invent stats, testimonials or user counts. Sample content is labeled "Example data".
- Short, specific, trader-friendly copy. No hype words.
- Always show "Informational only, not financial advice" near results.
