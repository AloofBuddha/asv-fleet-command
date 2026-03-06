import turfDistance from "@turf/distance";
import turfBearing from "@turf/bearing";
import { point } from "@turf/helpers";
import type {
  LatLng,
  VesselConfig,
  VesselTelemetry,
  VesselStatus,
  CommsStatus,
} from "../../src/types/vessel";

// ---------------------------------------------------------------------------
// Geo helpers — thin wrappers over Turf.js using our LatLng type
// ---------------------------------------------------------------------------

/** Haversine distance in nautical miles */
export function distanceNM(a: LatLng, b: LatLng): number {
  return turfDistance(point([a.lng, a.lat]), point([b.lng, b.lat]), {
    units: "nauticalmiles",
  });
}

/** Bearing from a to b in degrees (0-360) */
export function bearing(a: LatLng, b: LatLng): number {
  const deg = turfBearing(point([a.lng, a.lat]), point([b.lng, b.lat]));
  return (deg + 360) % 360; // Turf returns [-180, 180], normalize to [0, 360)
}

/** Interpolate between two points (linear — fine for short segments) */
export function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

// ---------------------------------------------------------------------------
// Route metadata — precomputed once per vessel
// ---------------------------------------------------------------------------

export interface RouteMeta {
  segmentDistances: number[];
  cumulativeDistances: number[];
  totalDistance: number;
}

export function computeRouteMetadata(route: LatLng[]): RouteMeta {
  const segmentDistances: number[] = [];
  const cumulativeDistances: number[] = [0];
  let total = 0;
  for (let i = 0; i < route.length; i++) {
    const from = route[i]!;
    const to = route[(i + 1) % route.length]!;
    const d = distanceNM(from, to);
    segmentDistances.push(d);
    total += d;
    cumulativeDistances.push(total);
  }
  return { segmentDistances, cumulativeDistances, totalDistance: total };
}

// ---------------------------------------------------------------------------
// Position — pure function of (config, routeMeta, simTime)
// ---------------------------------------------------------------------------

export interface PositionResult {
  position: LatLng;
  heading: number;
  speed: number;
  waypointIndex: number;
  segmentProgress: number;
}

export function computePosition(
  config: VesselConfig,
  routeMeta: RouteMeta,
  simTime: number,
): PositionResult {
  const route = config.route;
  const avgSpeed = config.maxSpeed * 0.7; // cruise at 70% max
  const totalNM = (avgSpeed * simTime) / 3600; // simTime in seconds, speed in knots

  // Wrap around route
  const routePos =
    routeMeta.totalDistance > 0
      ? ((totalNM % routeMeta.totalDistance) + routeMeta.totalDistance) %
        routeMeta.totalDistance
      : 0;

  // Linear search for segment (routes are short, ~5-10 waypoints)
  let waypointIndex = 0;
  for (let i = 0; i < routeMeta.cumulativeDistances.length - 1; i++) {
    if (routeMeta.cumulativeDistances[i + 1]! > routePos) {
      waypointIndex = i;
      break;
    }
  }

  const segStart = routeMeta.cumulativeDistances[waypointIndex]!;
  const segDist = routeMeta.segmentDistances[waypointIndex]!;
  const segmentProgress = segDist > 0 ? (routePos - segStart) / segDist : 0;

  const from = route[waypointIndex % route.length]!;
  const to = route[(waypointIndex + 1) % route.length]!;
  const position = interpolate(from, to, segmentProgress);
  const heading = bearing(from, to);

  // Display speed with sin noise (cosmetic only, doesn't affect position)
  const speedNoise =
    Math.sin(simTime * 0.1 + hashString(config.id)) * 0.15;
  const speed = avgSpeed * (1 + speedNoise);

  return { position, heading, speed, waypointIndex, segmentProgress };
}

// ---------------------------------------------------------------------------
// Comms health — deterministic sine wave per vessel
// ---------------------------------------------------------------------------

export function computeCommsHealth(config: VesselConfig, simTime: number): number {
  const phase = hashString(config.id + "comms");
  return 0.5 + 0.5 * Math.sin(simTime * 0.00015 + phase);
}

// ---------------------------------------------------------------------------
// Battery — incremental, called once per real second
// ---------------------------------------------------------------------------

export function advanceBattery(
  config: VesselConfig,
  battery: number,
  simTime: number,
  deltaSec: number,
  waypointIndex: number,
): number {
  if (config.hasSolar) {
    // Lightfish: solar recharge with day/night sine cycle
    const daylight = Math.max(0, Math.sin(simTime * 0.0003));
    const solarInput = daylight * 0.02;
    const drain = 0.005;
    return Math.min(100, Math.max(5, battery + (solarInput - drain) * deltaSec));
  } else {
    // Quickfish: steady drain
    const drainRate = 0.02;
    let newBattery = Math.max(5, battery - drainRate * deltaSec);
    // Refuel when passing waypoint 0
    if (waypointIndex === 0) {
      newBattery = Math.min(100, newBattery + 0.5 * deltaSec);
    }
    return newBattery;
  }
}

// ---------------------------------------------------------------------------
// Sim state — only battery is mutable now
// ---------------------------------------------------------------------------

export interface SimState {
  battery: number;
}

export function createInitialState(config: VesselConfig): SimState {
  const battery =
    config.type === "lightfish"
      ? 70 + (hashString(config.id) % 25)
      : 85 + (hashString(config.id) % 15);
  return { battery };
}

// ---------------------------------------------------------------------------
// Build telemetry — convenience for fleet.ts / vessel.ts
// ---------------------------------------------------------------------------

export function buildTelemetry(
  config: VesselConfig,
  routeMeta: RouteMeta,
  state: SimState,
  simTime: number,
): VesselTelemetry {
  const pos = computePosition(config, routeMeta, simTime);
  const commsHealth = computeCommsHealth(config, simTime);
  const status = deriveStatus(state.battery, commsHealth);
  const commsStatus = deriveCommsStatus(commsHealth);

  const chargeRate = config.hasSolar
    ? Math.max(0, Math.sin(simTime * 0.0003)) * 0.02 - 0.005
    : -0.02;

  return {
    vesselId: config.id,
    timestamp: Date.now(),
    position: pos.position,
    heading: pos.heading,
    speed: pos.speed,
    battery: state.battery,
    chargeRate,
    status,
    commsStatus,
    waypointIndex: pos.waypointIndex,
    segmentProgress: pos.segmentProgress,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deterministic hash for spreading initial positions and noise phases */
export function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function deriveStatus(battery: number, commsHealth: number): VesselStatus {
  if (commsHealth < 0.1) return "offline";
  if (battery < 15 || commsHealth < 0.3) return "critical";
  if (battery < 30 || commsHealth < 0.6) return "warning";
  return "nominal";
}

function deriveCommsStatus(commsHealth: number): CommsStatus {
  if (commsHealth < 0.2) return "lost";
  if (commsHealth < 0.6) return "degraded";
  return "strong";
}
