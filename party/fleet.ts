import type * as Party from "partykit/server";
import { vesselConfigs } from "./simulation/vesselConfigs";
import {
  createInitialState,
  computeRouteMetadata,
  computePosition,
  advanceBattery,
  buildTelemetry,
} from "./simulation/vesselSim";
import type { SimState, RouteMeta } from "./simulation/vesselSim";
import type { VesselConfig, FleetUpdate, VesselTelemetry, LatLng } from "../src/types/vessel";

interface VesselSim {
  config: VesselConfig;
  routeMeta: RouteMeta;
  state: SimState;
}

/** How many sim-seconds to advance per real-time tick */
const SIM_SPEED_OPTIONS = [1, 10, 60, 300] as const;
type SimSpeed = (typeof SIM_SPEED_OPTIONS)[number];

/** Max trail positions to keep per vessel */
const MAX_TRAIL_LENGTH = 600;

/** How many sim-seconds to warm up (pre-fill trails) */
const WARMUP_SECONDS = 600;

export default class FleetServer implements Party.Server {
  vessels: VesselSim[] = [];
  trails: Map<string, LatLng[]> = new Map();
  simTime = 0;
  simSpeed: SimSpeed = 60;
  interval: ReturnType<typeof setInterval> | null = null;

  constructor(readonly room: Party.Room) {}

  onStart() {
    this.vessels = vesselConfigs.map((config) => ({
      config,
      routeMeta: computeRouteMetadata(config.route),
      state: createInitialState(config),
    }));

    // Initialize empty trails
    for (const vessel of this.vessels) {
      this.trails.set(vessel.config.id, []);
    }

    // Pre-warm: advance simTime to fill trail history
    for (let i = 0; i < WARMUP_SECONDS; i++) {
      this.simTime += 1;
      this.recordTrails();
    }

    this.startSimulation();
  }

  /** Record one trail point per vessel at current simTime */
  private recordTrails() {
    for (const vessel of this.vessels) {
      const pos = computePosition(vessel.config, vessel.routeMeta, this.simTime);
      const trail = this.trails.get(vessel.config.id)!;
      trail.push(pos.position);
      if (trail.length > MAX_TRAIL_LENGTH) {
        trail.splice(0, trail.length - MAX_TRAIL_LENGTH);
      }
    }
  }

  /** Advance battery for all vessels */
  private advanceBatteries(deltaSec: number) {
    for (const vessel of this.vessels) {
      const pos = computePosition(vessel.config, vessel.routeMeta, this.simTime);
      vessel.state.battery = advanceBattery(
        vessel.config,
        vessel.state.battery,
        this.simTime,
        deltaSec,
        pos.waypointIndex,
      );
    }
  }

  private buildUpdate(): FleetUpdate {
    const telemetryList: VesselTelemetry[] = this.vessels.map((vessel) =>
      buildTelemetry(vessel.config, vessel.routeMeta, vessel.state, this.simTime),
    );

    const trails: Record<string, LatLng[]> = {};
    for (const [id, trail] of this.trails) {
      trails[id] = trail;
    }

    return {
      type: "fleet_update",
      vessels: telemetryList,
      trails,
      simSpeed: this.simSpeed,
      timestamp: Date.now(),
    };
  }

  startSimulation() {
    this.interval = setInterval(() => {
      this.simTime += this.simSpeed;
      this.advanceBatteries(this.simSpeed);
      this.recordTrails();

      const update = this.buildUpdate();
      const message = JSON.stringify(update);
      for (const conn of this.room.getConnections()) {
        conn.send(message);
      }
    }, 1000);
  }

  onConnect(conn: Party.Connection) {
    const update = this.buildUpdate();
    conn.send(JSON.stringify(update));
  }

  onMessage(message: string) {
    try {
      const data = JSON.parse(message) as { type: string; speed?: number };
      if (data.type === "set_speed" && typeof data.speed === "number") {
        const valid = SIM_SPEED_OPTIONS.find((s) => s === data.speed);
        if (valid) {
          this.simSpeed = valid;
        }
      }
    } catch {
      // Ignore malformed messages
    }
  }

  onClose() {
    // Don't stop simulation — it runs regardless of connections
  }
}

FleetServer satisfies Party.Worker;
