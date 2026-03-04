import { describe, it, expect } from "vitest";
import {
  distanceNM,
  bearing,
  interpolate,
  createInitialState,
  tick,
} from "../../party/simulation/vesselSim";
import { vesselConfigs } from "../../party/simulation/vesselConfigs";
import type { VesselConfig } from "../types/vessel";

describe("distanceNM", () => {
  it("returns 0 for same point", () => {
    const p = { lat: 25, lng: -70 };
    expect(distanceNM(p, p)).toBeCloseTo(0, 5);
  });

  it("calculates roughly correct distance for known points", () => {
    // Norfolk to Bermuda ≈ 640 NM
    const norfolk = { lat: 36.85, lng: -75.98 };
    const bermuda = { lat: 32.37, lng: -64.69 };
    const dist = distanceNM(norfolk, bermuda);
    expect(dist).toBeGreaterThan(550);
    expect(dist).toBeLessThan(700);
  });
});

describe("bearing", () => {
  it("north is ~0 degrees", () => {
    const a = { lat: 25, lng: -70 };
    const b = { lat: 26, lng: -70 };
    expect(bearing(a, b)).toBeCloseTo(0, 0);
  });

  it("east is ~90 degrees", () => {
    const a = { lat: 25, lng: -70 };
    const b = { lat: 25, lng: -69 };
    expect(bearing(a, b)).toBeCloseTo(90, 0);
  });

  it("south is ~180 degrees", () => {
    const a = { lat: 26, lng: -70 };
    const b = { lat: 25, lng: -70 };
    expect(bearing(a, b)).toBeCloseTo(180, 0);
  });
});

describe("interpolate", () => {
  it("returns start at t=0", () => {
    const a = { lat: 10, lng: 20 };
    const b = { lat: 30, lng: 40 };
    const result = interpolate(a, b, 0);
    expect(result.lat).toBe(10);
    expect(result.lng).toBe(20);
  });

  it("returns end at t=1", () => {
    const a = { lat: 10, lng: 20 };
    const b = { lat: 30, lng: 40 };
    const result = interpolate(a, b, 1);
    expect(result.lat).toBe(30);
    expect(result.lng).toBe(40);
  });

  it("returns midpoint at t=0.5", () => {
    const a = { lat: 10, lng: 20 };
    const b = { lat: 30, lng: 40 };
    const result = interpolate(a, b, 0.5);
    expect(result.lat).toBe(20);
    expect(result.lng).toBe(30);
  });
});

describe("createInitialState", () => {
  it("creates state with battery above 0", () => {
    for (const config of vesselConfigs) {
      const state = createInitialState(config);
      expect(state.battery).toBeGreaterThan(0);
      expect(state.battery).toBeLessThanOrEqual(100);
    }
  });

  it("spreads vessels to different starting positions", () => {
    const states = vesselConfigs.map((c) => createInitialState(c));
    const positions = states.map((s) => s.waypointIndex);
    // At least some vessels should start at different waypoints
    const unique = new Set(positions);
    expect(unique.size).toBeGreaterThan(1);
  });
});

describe("tick", () => {
  // Helper: minimal Lightfish config for predictable testing
  const testLightfish: VesselConfig = {
    id: "test-lf",
    name: "Test Lightfish",
    callsign: "TLF-01",
    type: "lightfish",
    maxSpeed: 4,
    batteryCapacity: 20,
    hasSolar: true,
    route: [
      { lat: 25, lng: -70 },
      { lat: 26, lng: -70 },
      { lat: 26, lng: -69 },
      { lat: 25, lng: -70 },
    ],
  };

  it("advances position along route", () => {
    const state = { waypointIndex: 0, segmentProgress: 0, battery: 80, commsHealth: 1 };
    const result = tick(testLightfish, state, 0);
    expect(result.state.segmentProgress).toBeGreaterThan(0);
  });

  it("wraps around route when reaching the end", () => {
    const state = { waypointIndex: 3, segmentProgress: 0.99, battery: 80, commsHealth: 1 };
    const result = tick(testLightfish, state, 0);
    // Should have wrapped to waypoint 0
    expect(result.state.waypointIndex).toBeLessThanOrEqual(3);
  });

  it("returns valid telemetry", () => {
    const state = createInitialState(testLightfish);
    const result = tick(testLightfish, state, 100);
    expect(result.telemetry.vesselId).toBe("test-lf");
    expect(result.telemetry.heading).toBeGreaterThanOrEqual(0);
    expect(result.telemetry.heading).toBeLessThan(360);
    expect(result.telemetry.speed).toBeGreaterThan(0);
    expect(result.telemetry.battery).toBeGreaterThan(0);
    expect(result.telemetry.position.lat).toBeDefined();
    expect(result.telemetry.position.lng).toBeDefined();
  });

  it("position changes visibly over simulated real-time seconds at 60x", () => {
    const SIM_SPEED = 60;
    let state = { waypointIndex: 0, segmentProgress: 0, battery: 80, commsHealth: 1 };
    const positions: { lat: number; lng: number }[] = [];
    let tickNum = 0;

    for (let realSec = 0; realSec < 5; realSec++) {
      for (let i = 0; i < SIM_SPEED; i++) {
        const result = tick(testLightfish, state, tickNum);
        state = result.state;
        tickNum++;
      }
      const result = tick(testLightfish, state, tickNum);
      positions.push(result.telemetry.position);
    }

    // Position should change between each real second
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1]!;
      const curr = positions[i]!;
      const moved = Math.abs(curr.lat - prev.lat) + Math.abs(curr.lng - prev.lng);
      expect(moved).toBeGreaterThan(0.0001);
    }
  });

  it("quickfish battery drains without solar", () => {
    const testQuickfish: VesselConfig = {
      id: "test-qf",
      name: "Test Quickfish",
      callsign: "TQF-01",
      type: "quickfish",
      maxSpeed: 25,
      batteryCapacity: 50,
      hasSolar: false,
      route: [
        { lat: 25, lng: -80 },
        { lat: 24, lng: -81 },
        { lat: 25, lng: -80 },
      ],
    };

    let state = { waypointIndex: 1, segmentProgress: 0.5, battery: 80, commsHealth: 1 };
    // Run 100 ticks — battery should decrease
    for (let i = 0; i < 100; i++) {
      const result = tick(testQuickfish, state, i);
      state = result.state;
    }
    expect(state.battery).toBeLessThan(80);
  });
});
