import type * as Party from "partykit/server";
import { vesselConfigs } from "./simulation/vesselConfigs";
import { createInitialState, tick } from "./simulation/vesselSim";
import type { SimState } from "./simulation/vesselSim";
import type { VesselConfig, VesselUpdate } from "../src/types/vessel";

export default class VesselServer implements Party.Server {
  config: VesselConfig | null = null;
  simState: SimState | null = null;
  tickNumber = 0;
  interval: ReturnType<typeof setInterval> | null = null;

  constructor(readonly room: Party.Room) {}

  onStart() {
    // Find vessel config matching this room's ID
    this.config = vesselConfigs.find((v) => v.id === this.room.id) ?? null;
    if (this.config) {
      this.simState = createInitialState(this.config);
      this.startSimulation();
    }
  }

  startSimulation() {
    // Run simulation at 1Hz
    this.interval = setInterval(() => {
      if (!this.config || !this.simState) return;

      const result = tick(this.config, this.simState, this.tickNumber);
      this.simState = result.state;
      this.tickNumber++;

      const update: VesselUpdate = {
        type: "vessel_update",
        telemetry: result.telemetry,
      };

      const message = JSON.stringify(update);
      for (const conn of this.room.getConnections()) {
        conn.send(message);
      }
    }, 1000);
  }

  onConnect(conn: Party.Connection) {
    // Send current state immediately on connect
    if (this.config && this.simState) {
      const result = tick(this.config, this.simState, this.tickNumber);
      const update: VesselUpdate = {
        type: "vessel_update",
        telemetry: result.telemetry,
      };
      conn.send(JSON.stringify(update));
    }
  }

  onClose() {
    // Don't stop simulation — it runs regardless of connections
  }
}

VesselServer satisfies Party.Worker;
