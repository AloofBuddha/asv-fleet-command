import { create } from "zustand";
import type { Alert, LatLng, VesselTelemetry } from "../types/vessel";
import { vesselInfoMap } from "../data/vesselConfigs";

const MAX_HISTORY = 300;
const MAX_ALERTS = 50;
let alertCounter = 0;

interface FleetState {
  vessels: Map<string, VesselTelemetry>;
  /** Past positions per vessel for trail rendering */
  trails: Map<string, LatLng[]>;
  /** Telemetry history per vessel for charting */
  telemetryHistory: Map<string, VesselTelemetry[]>;
  alerts: Alert[];
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
  acknowledgeAlert: (id: string) => void;
}

function detectAlerts(
  incoming: VesselTelemetry[],
  current: Map<string, VesselTelemetry>,
): Alert[] {
  const newAlerts: Alert[] = [];
  const now = Date.now();

  for (const t of incoming) {
    const prev = current.get(t.vesselId);
    const name = vesselInfoMap.get(t.vesselId)?.name ?? t.vesselId;

    // Battery critical (<15) — only alert on transition
    if (t.battery < 15 && (!prev || prev.battery >= 15)) {
      newAlerts.push({
        id: `alert-${++alertCounter}`,
        vesselId: t.vesselId,
        vesselName: name,
        type: "battery_critical",
        message: `${name} battery critical: ${t.battery.toFixed(0)}%`,
        timestamp: now,
        acknowledged: false,
      });
    }
    // Battery warning (<30) — only on transition
    else if (t.battery < 30 && (!prev || prev.battery >= 30)) {
      newAlerts.push({
        id: `alert-${++alertCounter}`,
        vesselId: t.vesselId,
        vesselName: name,
        type: "battery_warning",
        message: `${name} battery low: ${t.battery.toFixed(0)}%`,
        timestamp: now,
        acknowledged: false,
      });
    }

    // Comms lost — transition
    if (t.commsStatus === "lost" && prev?.commsStatus !== "lost") {
      newAlerts.push({
        id: `alert-${++alertCounter}`,
        vesselId: t.vesselId,
        vesselName: name,
        type: "comms_lost",
        message: `${name} comms lost`,
        timestamp: now,
        acknowledged: false,
      });
    }

    // Status critical — transition
    if (t.status === "critical" && prev?.status !== "critical") {
      newAlerts.push({
        id: `alert-${++alertCounter}`,
        vesselId: t.vesselId,
        vesselName: name,
        type: "status_critical",
        message: `${name} status critical`,
        timestamp: now,
        acknowledged: false,
      });
    }

    // Status offline — transition
    if (t.status === "offline" && prev?.status !== "offline") {
      newAlerts.push({
        id: `alert-${++alertCounter}`,
        vesselId: t.vesselId,
        vesselName: name,
        type: "status_offline",
        message: `${name} went offline`,
        timestamp: now,
        acknowledged: false,
      });
    }
  }

  return newAlerts;
}

export const useFleetStore = create<FleetState>((set) => ({
  vessels: new Map(),
  trails: new Map(),
  telemetryHistory: new Map(),
  alerts: [],
  selectedVesselId: null,
  simSpeed: 60,
  lastUpdate: 0,

  updateFleet: (telemetryList, serverTrails, simSpeed) =>
    set((state) => {
      // Detect alerts before replacing vessels
      const newAlerts = detectAlerts(telemetryList, state.vessels);
      const alerts =
        newAlerts.length > 0
          ? [...state.alerts, ...newAlerts].slice(-MAX_ALERTS)
          : state.alerts;

      const vessels = new Map<string, VesselTelemetry>();
      const trails = new Map<string, LatLng[]>();
      const telemetryHistory = new Map(state.telemetryHistory);
      for (const t of telemetryList) {
        vessels.set(t.vesselId, t);
        // Append to history, cap at MAX_HISTORY
        const history = telemetryHistory.get(t.vesselId) ?? [];
        const updated = [...history, t];
        telemetryHistory.set(
          t.vesselId,
          updated.length > MAX_HISTORY ? updated.slice(-MAX_HISTORY) : updated,
        );
      }
      // Use server-provided trails directly
      for (const [id, trail] of Object.entries(serverTrails)) {
        trails.set(id, trail);
      }
      return { vessels, trails, telemetryHistory, alerts, simSpeed, lastUpdate: Date.now() };
    }),

  updateVessel: (telemetry) =>
    set((state) => {
      const vessels = new Map(state.vessels);
      vessels.set(telemetry.vesselId, telemetry);
      return { vessels, lastUpdate: Date.now() };
    }),

  selectVessel: (id) => set({ selectedVesselId: id }),

  setSimSpeed: (speed) => set({ simSpeed: speed }),

  acknowledgeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a,
      ),
    })),
}));
