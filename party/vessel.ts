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
import type { VesselConfig, VesselUpdate } from "../src/types/vessel";

export default class VesselServer implements Party.Server {
  config: VesselConfig | null = null;
  routeMeta: RouteMeta | null = null;
  simState: SimState | null = null;
  simTime = 0;
  interval: ReturnType<typeof setInterval> | null = null;

  constructor(readonly room: Party.Room) {}

  onStart() {
    this.config = vesselConfigs.find((v) => v.id === this.room.id) ?? null;
    if (this.config) {
      this.routeMeta = computeRouteMetadata(this.config.route);
      this.simState = createInitialState(this.config);
      this.startSimulation();
    }
  }

  startSimulation() {
    this.interval = setInterval(() => {
      if (!this.config || !this.routeMeta || !this.simState) return;

      this.simTime += 1;
      const pos = computePosition(this.config, this.routeMeta, this.simTime);
      this.simState.battery = advanceBattery(
        this.config,
        this.simState.battery,
        this.simTime,
        1,
        pos.waypointIndex,
      );

      const update: VesselUpdate = {
        type: "vessel_update",
        telemetry: buildTelemetry(this.config, this.routeMeta, this.simState, this.simTime),
      };

      const message = JSON.stringify(update);
      for (const conn of this.room.getConnections()) {
        conn.send(message);
      }
    }, 1000);
  }

  onConnect(conn: Party.Connection) {
    if (this.config && this.routeMeta && this.simState) {
      const update: VesselUpdate = {
        type: "vessel_update",
        telemetry: buildTelemetry(this.config, this.routeMeta, this.simState, this.simTime),
      };
      conn.send(JSON.stringify(update));
    }
  }

  onClose() {
    // Don't stop simulation — it runs regardless of connections
  }
}

VesselServer satisfies Party.Worker;
