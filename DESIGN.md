# Design Brief: SHOOT SENSE AI — Year 2258 Futuristic Cyberpunk

## Design Direction
Ultra-futuristic AI photography planner with retro-futuristic maximalism. Year 2258 space-noir aesthetic: deep dark space backgrounds, neon accents, glassmorphic layering, geometric precision. Tone: bold, intentional, tech-forward maximalism with zero clutter.

## Differentiation
Neon glow pulses on interactive elements, Three.js 3D rotating wireframe backgrounds, GSAP choreographed entrance animations (staggered text reveals, card slide-ups from bottom, hero logo glow halo), HUD-style dashboard panels with realistic glassmorphism (backdrop-blur, semi-transparent cards), precise geometric borders.

## Color Palette
| Token | OKLCH | Hex | Purpose |
|-------|-------|-----|---------|
| primary (neon cyan) | 0.5 0.25 262 | #00FFFF | Hero text, accent borders, glowing elements |
| secondary (neon purple) | 0.6 0.25 305 | #BF5FFF | Secondary accents, hover states |
| background (space black) | 0.14 0 0 | #1A1A1F | Page background, near-black depth |
| card | 0.18 0.02 270 | #1E2535 | Glassmorphic card base with subtle blue tint |
| foreground | 0.92 0 0 | #EAE9E7 | Text on dark surfaces |
| muted | 0.24 0 0 | #3D4452 | Secondary UI, disabled states |
| border | 0.28 0.02 270 | #4A5A77 | Card borders, dividers with cyan tint |

## Typography
| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display | Space Grotesk | 700 | Hero logo, section headlines, CTAs (geometric, futuristic) |
| Body | GeneralSans | 400–600 | UI copy, labels, descriptions (tech-clean, readable) |
| Mono | GeistMono | 400–500 | Code blocks, data displays, timestamps |

Type scale: 3xl (2.25rem) hero, xl (1.5rem) section heads, lg (1.125rem) card titles, base (1rem) body text.

## Elevation & Depth
No traditional shadows. Glassmorphism layers: semi-transparent cards (50% opacity) with 20px backdrop-blur, 1px subtle borders. Glow effects replace shadow: neon-cyan glow (24px, 0.6 opacity) on hero, neon-purple inset glow (10px, 0.2 opacity) on cards. Stacked z-index: background 3D (z-0) → content cards (z-10) → modals/overlays (z-20).

## Structural Zones
| Zone | Treatment | Notes |
|------|-----------|-------|
| Navigation/Header | glassmorphism, semi-transparent, 1px cyan-tinted border | min-height 64px, sticky, dark space feel |
| Hero Banner | dark background, glowing logo (cyan + purple halo), 3D Three.js element behind | full-width, 80vh min-height, centered text with GSAP stagger |
| Dashboard Grid | card-based layout, 2–3 columns (responsive), 16px gap | each card: glassmorphic, hover neon-glow, slide-up entrance |
| Footer | dark background, tech specs in mono font, minimal border-top | bg-muted/20, border-cyan-tinted |

## Spacing & Rhythm
Base unit 4px. Padding: 16px (cards), 24px (sections), 8px (buttons). Gap: 16px (grid). Margins: 32px (section separation). No excess breathing room — tight, tech-forward density. Compact card grid with snug gaps reinforces futuristic HUD aesthetic.

## Component Patterns
- **Card**: glassmorphism base (50% opacity + blur), 1px border (cyan-tinted), neon-glow on hover via box-shadow, fade-in entrance (GSAP stagger)
- **Button**: primary = cyan bg + cyan text-glow, secondary = purple border + purple glow, no shadow (glow only)
- **Input**: dark card-colored background, cyan border on focus, mono font for data
- **Text**: hero logo = hero-glow (cyan + purple 2-color text-shadow), body = foreground-on-background

## Motion & Animation
GSAP orchestration (not CSS): Hero logo text reveals letter-by-letter with stagger (0.05s between), glow effect pulses (3s infinite, ease-in-out), cards slide-up from bottom with 0.2s stagger per card (0.8s total duration). Hover states: cards pulse neon-glow (100ms ease-out), buttons brighten. All transitions smooth cubic-bezier(0.4, 0, 0.2, 1) at 0.3s.

## Constraints
- Dark mode only (no light theme)
- No traditional box shadows — glow effects only
- Cyan (#00FFFF) and purple (#BF5FFF) as ONLY accent colors (no secondary palette gradients)
- Minimal decoration — reserve glassmorphism + glow for interactive elements only
- Mobile-first responsive (sm: 1 col, md: 2 col, lg: 3 col card grids)
- 60fps performance: CSS transforms only (no layout shifts), GSAP GPU acceleration via transform + opacity

## Signature Detail
Neon cyan glow halo behind futuristic Space Grotesk logo in hero, pulsing subtle glow effect (sine wave, 3s loop). Three.js 3D rotating abstract shape (wireframe, cyan/purple gradient) subtly animated behind hero text. Zero skeuomorphism — geometric precision, color contrast, and motion do the heavy lifting.
