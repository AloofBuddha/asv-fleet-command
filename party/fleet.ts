import type * as Party from "partykit/server";
import { vesselConfigs } from "./simulation/vesselConfigs";
import { createInitialState, tick } from "./simulation/vesselSim";
import type { SimState } from "./simulation/vesselSim";
import type { VesselConfig, FleetUpdate, VesselTelemetry, LatLng } from "../src/types/vessel";

interface VesselSim {
  config: VesselConfig;
  state: SimState;
}

/** How many sim-seconds to advance per real-time tick */
const SIM_SPEED_OPTIONS = [1, 10, 60, 300] as const;
type SimSpeed = (typeof SIM_SPEED_OPTIONS)[number];

/** Max trail positions to keep per vessel */
const MAX_TRAIL_LENGTH = 600;

/** How many warm-up ticks to run on server start to pre-fill trails */
const WARMUP_TICKS = 600;

export default class FleetServer implements Party.Server {
  vessels: VesselSim[] = [];
  trails: Map<string, LatLng[]> = new Map();
  tickNumber = 0;
  simSpeed: SimSpeed = 60; // Default 60x — 1 minute of sim per second
  interval: ReturnType<typeof setInterval> | null = null;

  constructor(readonly room: Party.Room) {}

  onStart() {
    this.vessels = vesselConfigs.map((config) => ({
      config,
      state: createInitialState(config),
    }));

    // Initialize empty trails
    for (const vessel of this.vessels) {
      this.trails.set(vessel.config.id, []);
    }

    // Pre-warm: run simulation ticks to build trail history
    for (let i = 0; i < WARMUP_TICKS; i++) {
      this.runSimTick();
    }

    this.startSimulation();
  }

  /** Run one batch of sim sub-ticks and record trail positions */
  private runSimTick() {
    for (let i = 0; i < this.simSpeed; i++) {
      for (const vessel of this.vessels) {
        const result = tick(vessel.config, vessel.state, this.tickNumber);
        vessel.state = result.state;
      }
      this.tickNumber++;
    }

    // Record one trail point per vessel per real-time tick
    for (const vessel of this.vessels) {
      const result = tick(vessel.config, vessel.state, this.tickNumber);
      const trail = this.trails.get(vessel.config.id)!;
      trail.push(result.telemetry.position);
      if (trail.length > MAX_TRAIL_LENGTH) {
        trail.splice(0, trail.length - MAX_TRAIL_LENGTH);
      }
    }
  }

  private buildUpdate(): FleetUpdate {
    const telemetryList: VesselTelemetry[] = this.vessels.map((vessel) => {
      const result = tick(vessel.config, vessel.state, this.tickNumber);
      return result.telemetry;
    });

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
    console.log("[fleet] startSimulation — interval starting");
    this.interval = setInterval(() => {
      this.runSimTick();

      const connections = [...this.room.getConnections()];
      console.log(
        `[fleet] tick ${this.tickNumber}, ${connections.length} connections, vessel0 pos:`,
        this.vessels[0]
          ? {
              wp: this.vessels[0].state.waypointIndex,
              prog: this.vessels[0].state.segmentProgress.toFixed(6),
            }
          : "none",
      );

      const update = this.buildUpdate();
      const message = JSON.stringify(update);
      for (const conn of connections) {
        conn.send(message);
      }
    }, 1000);
  }

  onConnect(conn: Party.Connection) {
    console.log(`[fleet] onConnect — id=${conn.id}`);
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

  onClose(conn: Party.Connection) {
    console.log(`[fleet] onClose — id=${conn.id}, remaining=${[...this.room.getConnections()].length}`);
    // Don't stop simulation — it runs regardless of connections
  }
}

FleetServer satisfies Party.Worker;
