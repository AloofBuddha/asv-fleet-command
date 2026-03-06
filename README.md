# ASV Fleet Command

Real-time command and monitoring interface for a fleet of autonomous surface vehicles (ASVs). Built as a portfolio project demonstrating real-time data streaming, interactive mapping, and operational UI design.

![Fleet map overview](e2e/screenshots/app.png)

## What It Does

Simulates and monitors 6 autonomous vessels operating across the Atlantic, Caribbean, and Gulf of Mexico. Each vessel follows a predefined patrol route with realistic telemetry — position, heading, speed, battery, and communications status — updated at 1 Hz.

**Vessels:**
- 4x Lightfish (solar-powered, long-endurance patrol)
- 2x Quickfish (battery-powered, high-speed intercept)

**Features:**
- Dark-themed Leaflet map with CartoDB tiles, graticule overlay, and range rings
- Live vessel markers with heading rotation and position trails
- Mission route visualization per vessel
- Fleet sidebar with vessel cards showing speed, battery, and status
- Vessel detail panel with compass heading, battery gauge, waypoint progress, and time-series telemetry charts
- Transition-based alert system (battery warnings, comms loss, status changes)
- Configurable simulation speed (1x / 10x / 60x / 300x)
- Demo mode (`?demo` query param) for component showcase without a running server

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript (strict) |
| Styling | StyleX (compile-time atomic CSS) |
| UI Primitives | Radix (headless) |
| Mapping | Leaflet via react-leaflet |
| Charts | Recharts |
| State | Zustand |
| Real-time | PartyKit (WebSocket) |
| Icons | Lucide React |
| Build | Vite |
| Testing | Vitest + Playwright |

## Architecture

```
src/                    React client (Vite)
  components/
    Map/                FleetMap, VesselMarker, VesselTrail, MissionRoute, Graticule, ...
    Sidebar/            FleetSidebar, VesselCard
    Detail/             VesselDetailPanel, CompassHeading, BatteryGauge, TelemetryCharts, ...
  stores/               Zustand store (vessels, trails, telemetry history, alerts)
  hooks/                useFleetConnection (PartyKit WebSocket)
  data/                 Vessel configs, route definitions
  styles/               StyleX design tokens

party/                  PartyKit servers
  vessel.ts             One room per vessel, runs 1 Hz simulation loop
  fleet.ts              Single room aggregating all vessel telemetry
  simulation/           Pure simulation functions (testable without PartyKit)

e2e/                    Playwright screenshot tests
```

The client connects to a single **fleet** PartyKit room for the overview, and to individual **vessel** rooms when viewing detail. The simulation engine is pure functions over `(config, simTime) -> telemetry`, making it fully deterministic and unit-testable.

## Getting Started

```bash
npm install

# Start both servers (two terminals):
npm run dev              # Vite dev server — http://localhost:5173
npx partykit dev         # PartyKit server — http://localhost:1999
```

## Verification

```bash
npx tsc --noEmit         # Type check
npm run lint             # ESLint
npm test                 # Vitest unit tests (40 tests)
npm run build            # Production build
```

## License

MIT
