import type {
  LatLng,
  VesselConfig,
  VesselTelemetry,
  VesselStatus,
  CommsStatus,
} from "../../src/types/vessel";

/** Haversine distance in nautical miles */
export function distanceNM(a: LatLng, b: LatLng): number {
  const R = 3440.065; // Earth radius in NM
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const aCalc =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng *
      sinLng;
  return R * 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));
}

/** Bearing from a to b in degrees (0-360) */
export function bearing(a: LatLng, b: LatLng): number {
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return (deg + 360) % 360;
}

/** Interpolate between two points */
export function interpolate(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

export interface SimState {
  waypointIndex: number;
  segmentProgress: number;
  battery: number;
  commsHealth: number; // 0-1, degrades and recovers stochastically
}

/** Create initial sim state for a vessel */
export function createInitialState(config: VesselConfig): SimState {
  // Spread vessels around their routes so they're not all at start
  const startIndex = Math.floor(
    ((hashString(config.id) % 100) / 100) * config.route.length,
  );
  return {
    waypointIndex: startIndex % config.route.length,
    segmentProgress: (hashString(config.id + "seg") % 100) / 100,
    battery: config.type === "lightfish" ? 70 + (hashString(config.id) % 25) : 85 + (hashString(config.id) % 15),
    commsHealth: 1.0,
  };
}

/** Deterministic hash for spreading initial positions */
function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Advance simulation by one tick (1 second) */
export function tick(
  config: VesselConfig,
  state: SimState,
  _tickNumber: number,
): { state: SimState; telemetry: VesselTelemetry } {
  const route = config.route;
  const routeLen = route.length;

  // Current segment endpoints
  const fromWp = route[state.waypointIndex % routeLen]!;
  const toWp = route[(state.waypointIndex + 1) % routeLen]!;

  // Calculate current speed with some variation
  const baseSpeed = config.maxSpeed * 0.7; // cruise at 70% max
  const speedNoise = Math.sin(_tickNumber * 0.1 + hashString(config.id)) * 0.15;
  const speed = baseSpeed * (1 + speedNoise);

  // How far we move this tick (1 second) in nautical miles
  const segmentDist = distanceNM(fromWp, toWp);
  const speedNMPerSec = speed / 3600; // knots to NM/s
  const progressDelta = segmentDist > 0 ? speedNMPerSec / segmentDist : 0;

  let newProgress = state.segmentProgress + progressDelta;
  let newWaypointIndex = state.waypointIndex;

  // Advance to next segment if we passed the current waypoint
  if (newProgress >= 1) {
    newProgress = newProgress - 1;
    newWaypointIndex = (newWaypointIndex + 1) % routeLen;
  }

  // Battery simulation
  let newBattery = state.battery;
  if (config.hasSolar) {
    // Lightfish: slow drain + solar recharge cycle
    // Simulate day/night with a sine wave (~6-hour cycle in sim time)
    const daylight = Math.max(0, Math.sin(_tickNumber * 0.0003));
    const solarInput = daylight * 0.02; // up to +0.02%/s when sunny
    const drain = 0.005; // constant drain
    newBattery = Math.min(100, Math.max(5, newBattery + solarInput - drain));
  } else {
    // Quickfish: steady drain, faster at high speed
    const drain = 0.015 + (speed / config.maxSpeed) * 0.01;
    newBattery = Math.max(5, newBattery - drain);
    // Simulate refueling when back at first waypoint
    if (newWaypointIndex === 0 && newProgress < 0.05) {
      newBattery = Math.min(100, newBattery + 0.5);
    }
  }

  // Comms health — stochastic with slow recovery
  let newCommsHealth = state.commsHealth;
  // Random degradation events
  if (Math.random() < 0.002) {
    newCommsHealth = Math.max(0, newCommsHealth - 0.3 - Math.random() * 0.3);
  }
  // Slow recovery
  newCommsHealth = Math.min(1, newCommsHealth + 0.001);

  const newState: SimState = {
    waypointIndex: newWaypointIndex,
    segmentProgress: newProgress,
    battery: newBattery,
    commsHealth: newCommsHealth,
  };

  // Derive position
  const currentFrom = route[newWaypointIndex % routeLen]!;
  const currentTo = route[(newWaypointIndex + 1) % routeLen]!;
  const position = interpolate(currentFrom, currentTo, newProgress);
  const heading = bearing(currentFrom, currentTo);

  // Derive status
  const status = deriveStatus(newBattery, newCommsHealth);
  const commsStatus = deriveCommsStatus(newCommsHealth);

  const chargeRate = config.hasSolar
    ? Math.max(0, Math.sin(_tickNumber * 0.0003)) * 0.02 - 0.005
    : -(0.015 + (speed / config.maxSpeed) * 0.01);

  const telemetry: VesselTelemetry = {
    vesselId: config.id,
    timestamp: Date.now(),
    position,
    heading,
    speed,
    battery: newBattery,
    chargeRate,
    status,
    commsStatus,
    waypointIndex: newWaypointIndex,
    segmentProgress: newProgress,
  };

  return { state: newState, telemetry };
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
