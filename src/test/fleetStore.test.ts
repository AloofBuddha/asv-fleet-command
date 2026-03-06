import { describe, it, expect, beforeEach } from "vitest";
import { useFleetStore } from "../stores/fleetStore";
import type { VesselTelemetry } from "../types/vessel";

function makeTelemetry(id: string, overrides?: Partial<VesselTelemetry>): VesselTelemetry {
  return {
    vesselId: id,
    timestamp: Date.now(),
    position: { lat: 25, lng: -70 },
    heading: 45,
    speed: 3.5,
    battery: 72,
    chargeRate: 0.01,
    status: "nominal",
    commsStatus: "strong",
    waypointIndex: 0,
    segmentProgress: 0.5,
    ...overrides,
  };
}

describe("fleetStore", () => {
  beforeEach(() => {
    // Reset store to initial state
    useFleetStore.setState({
      vessels: new Map(),
      trails: new Map(),
      telemetryHistory: new Map(),
      alerts: [],
      selectedVesselId: null,
      simSpeed: 60,
      lastUpdate: 0,
    });
  });

  it("updateFleet populates vessels map", () => {
    const t1 = makeTelemetry("lf-01");
    const t2 = makeTelemetry("qf-01", { speed: 20 });
    const trails = { "lf-01": [{ lat: 25, lng: -70 }], "qf-01": [{ lat: 26, lng: -71 }] };

    useFleetStore.getState().updateFleet([t1, t2], trails, 60);

    const state = useFleetStore.getState();
    expect(state.vessels.size).toBe(2);
    expect(state.vessels.get("lf-01")?.speed).toBe(3.5);
    expect(state.vessels.get("qf-01")?.speed).toBe(20);
  });

  it("updateFleet sets trails from server data", () => {
    const t1 = makeTelemetry("lf-01");
    const trail = [
      { lat: 24, lng: -69 },
      { lat: 24.5, lng: -69.5 },
      { lat: 25, lng: -70 },
    ];
    useFleetStore.getState().updateFleet([t1], { "lf-01": trail }, 60);

    const state = useFleetStore.getState();
    expect(state.trails.get("lf-01")).toHaveLength(3);
    expect(state.trails.get("lf-01")![0]!.lat).toBe(24);
  });

  it("updateFleet updates simSpeed", () => {
    const t1 = makeTelemetry("lf-01");
    useFleetStore.getState().updateFleet([t1], {}, 300);
    expect(useFleetStore.getState().simSpeed).toBe(300);
  });

  it("selectVessel sets and clears selection", () => {
    useFleetStore.getState().selectVessel("lf-01");
    expect(useFleetStore.getState().selectedVesselId).toBe("lf-01");

    useFleetStore.getState().selectVessel(null);
    expect(useFleetStore.getState().selectedVesselId).toBeNull();
  });

  it("setSimSpeed updates local state", () => {
    useFleetStore.getState().setSimSpeed(10);
    expect(useFleetStore.getState().simSpeed).toBe(10);
  });

  it("updateVessel updates a single vessel", () => {
    const t1 = makeTelemetry("lf-01");
    useFleetStore.getState().updateFleet([t1], {}, 60);

    const updated = makeTelemetry("lf-01", { speed: 5.0, battery: 50 });
    useFleetStore.getState().updateVessel(updated);

    const vessel = useFleetStore.getState().vessels.get("lf-01");
    expect(vessel?.speed).toBe(5.0);
    expect(vessel?.battery).toBe(50);
  });

  it("updateFleet replaces all vessels on each call", () => {
    const t1 = makeTelemetry("lf-01");
    const t2 = makeTelemetry("qf-01");
    useFleetStore.getState().updateFleet([t1, t2], {}, 60);
    expect(useFleetStore.getState().vessels.size).toBe(2);

    // Update with only 1 vessel — should replace, not merge
    const t3 = makeTelemetry("lf-01", { speed: 10 });
    useFleetStore.getState().updateFleet([t3], {}, 60);
    expect(useFleetStore.getState().vessels.size).toBe(1);
    expect(useFleetStore.getState().vessels.get("lf-01")?.speed).toBe(10);
  });

  it("lastUpdate is set on fleet update", () => {
    const before = Date.now();
    useFleetStore.getState().updateFleet([makeTelemetry("lf-01")], {}, 60);
    const after = Date.now();
    const lastUpdate = useFleetStore.getState().lastUpdate;
    expect(lastUpdate).toBeGreaterThanOrEqual(before);
    expect(lastUpdate).toBeLessThanOrEqual(after);
  });

  it("telemetryHistory accumulates across updates", () => {
    const t1 = makeTelemetry("lf-01", { battery: 90 });
    useFleetStore.getState().updateFleet([t1], {}, 60);

    const t2 = makeTelemetry("lf-01", { battery: 85 });
    useFleetStore.getState().updateFleet([t2], {}, 60);

    const t3 = makeTelemetry("lf-01", { battery: 80 });
    useFleetStore.getState().updateFleet([t3], {}, 60);

    const history = useFleetStore.getState().telemetryHistory.get("lf-01");
    expect(history).toHaveLength(3);
    expect(history![0]!.battery).toBe(90);
    expect(history![2]!.battery).toBe(80);
  });

  it("telemetryHistory caps at 300 entries", () => {
    // Seed with 299 entries
    for (let i = 0; i < 299; i++) {
      useFleetStore.getState().updateFleet(
        [makeTelemetry("lf-01", { battery: i })],
        {},
        60,
      );
    }
    expect(useFleetStore.getState().telemetryHistory.get("lf-01")).toHaveLength(299);

    // Two more pushes it to 301, should cap at 300
    useFleetStore.getState().updateFleet(
      [makeTelemetry("lf-01", { battery: 299 })],
      {},
      60,
    );
    useFleetStore.getState().updateFleet(
      [makeTelemetry("lf-01", { battery: 300 })],
      {},
      60,
    );

    const history = useFleetStore.getState().telemetryHistory.get("lf-01")!;
    expect(history).toHaveLength(300);
    // Oldest entry should have been trimmed (battery=0 gone)
    expect(history[0]!.battery).toBe(1);
    expect(history[history.length - 1]!.battery).toBe(300);
  });
});
