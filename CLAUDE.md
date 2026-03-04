# ASV Fleet Command

Portfolio demo: autonomous surface vehicle fleet command & monitoring interface.

## Tech Stack
- **Build:** Vite
- **Framework:** React 19 + TypeScript (strict)
- **Styling:** StyleX (`@stylexjs/unplugin`) — compile-time atomic CSS
- **UI Primitives:** Radix Primitives (headless, styled with StyleX)
- **Mapping:** Leaflet via `react-leaflet`
- **Real-time:** PartyKit (`partysocket`)
- **State:** Zustand
- **Charts:** Recharts
- **Icons:** Lucide React
- **Testing:** Vitest + Playwright

## How to Run
```bash
npm run dev          # Vite dev server (port 5173)
npx partykit dev     # PartyKit server (port 1999)
```

## How to Verify
```bash
npx tsc --noEmit     # Type check
npm run lint         # ESLint
npm test             # Vitest unit tests
npm run build        # Production build
npx playwright test e2e/screenshot.spec.ts  # Screenshots
```

## Architecture
- `src/` — React client (Vite)
- `party/` — PartyKit servers (vessel simulation + fleet aggregation)
- `party/simulation/` — Pure simulation functions (testable without PartyKit)
- `e2e/` — Playwright screenshot tests

## StyleX Conventions
- Design tokens in `src/styles/tokens.stylex.ts`
- Component styles co-located: `Component.tsx` + `Component.stylex.ts` or inline
- StyleX plugin MUST come before React plugin in vite.config.ts

## PartyKit Architecture
- `vessel` party (main): one room per vessel, runs 1Hz simulation loop
- `fleet` party: single room aggregating all vessel telemetry
- Client connects to fleet room for overview, vessel rooms for detail

## Task Status
- [x] Task 1: Project Scaffolding + Playwright
- [ ] Task 2: Map View Foundation
- [ ] Task 3: Vessel Simulation Engine
- [ ] Task 4: Live Vessel Markers on Map (MVP checkpoint)
- [ ] Task 5: Fleet Sidebar + App Layout
- [ ] Task 6: Vessel Detail Panel + Telemetry
- [ ] Task 7: Time-Series Charts
- [ ] Task 8: Mission Route Visualization
- [ ] Task 9: Alert System
- [ ] Task 10: Mission Planning + Polish
