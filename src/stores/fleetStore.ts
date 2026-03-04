import { create } from "zustand";
import type { LatLng, VesselTelemetry } from "../types/vessel";

interface FleetState {
  vessels: Map<string, VesselTelemetry>;
  /** Past positions per vessel for trail rendering */
  trails: Map<string, LatLng[]>;
  selectedVesselId: string | null;
  simSpeed: number;
  lastUpdate: number;
  updateFleet: (
    telemetry: VesselTelemetry[],
    trails: Record<string, LatLng[]>,
    simSpeed: number,
  ) => void;
  updateVessel: (telemetry: VesselTelemetry) => void;
  selectVessel: (id: string | null) => void;
  setSimSpeed: (speed: number) => void;
}

export const useFleetStore = create<FleetState>((set) => ({
  vessels: new Map(),
  trails: new Map(),
  selectedVesselId: null,
  simSpeed: 60,
  lastUpdate: 0,

  updateFleet: (telemetryList, serverTrails, simSpeed) =>
    set(() => {
      const vessels = new Map<string, VesselTelemetry>();
      const trails = new Map<string, LatLng[]>();
      for (const t of telemetryList) {
        vessels.set(t.vesselId, t);
      }
      // Use server-provided trails directly
      for (const [id, trail] of Object.entries(serverTrails)) {
        trails.set(id, trail);
      }
      return { vessels, trails, simSpeed, lastUpdate: Date.now() };
    }),

  updateVessel: (telemetry) =>
    set((state) => {
      const vessels = new Map(state.vessels);
      vessels.set(telemetry.vesselId, telemetry);
      return { vessels, lastUpdate: Date.now() };
    }),

  selectVessel: (id) => set({ selectedVesselId: id }),

  setSimSpeed: (speed) => set({ simSpeed: speed }),
}));
