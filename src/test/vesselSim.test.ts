import { describe, it, expect } from "vitest";
import {
  distanceNM,
  bearing,
  interpolate,
  computeRouteMetadata,
  computePosition,
  computeCommsHealth,
  advanceBattery,
  createInitialState,
  buildTelemetry,
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

// Helper configs for testing
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

describe("computeRouteMetadata", () => {
  it("returns correct number of segments", () => {
    const meta = computeRouteMetadata(testLightfish.route);
    // 4 waypoints = 4 segments (wraps back to start)
    expect(meta.segmentDistances).toHaveLength(4);
    expect(meta.cumulativeDistances).toHaveLength(5); // n+1 entries
  });

  it("total distance is sum of segments", () => {
    const meta = computeRouteMetadata(testLightfish.route);
    const sum = meta.segmentDistances.reduce((a, b) => a + b, 0);
    expect(meta.totalDistance).toBeCloseTo(sum, 5);
  });

  it("cumulative distances are monotonically increasing", () => {
    const meta = computeRouteMetadata(testLightfish.route);
    for (let i = 1; i < meta.cumulativeDistances.length; i++) {
      expect(meta.cumulativeDistances[i]!).toBeGreaterThanOrEqual(
        meta.cumulativeDistances[i - 1]!,
      );
    }
  });
});

describe("computePosition", () => {
  const meta = computeRouteMetadata(testLightfish.route);

  it("is deterministic — same simTime gives same result", () => {
    const a = computePosition(testLightfish, meta, 5000);
    const b = computePosition(testLightfish, meta, 5000);
    expect(a.position.lat).toBe(b.position.lat);
    expect(a.position.lng).toBe(b.position.lng);
    expect(a.heading).toBe(b.heading);
    expect(a.waypointIndex).toBe(b.waypointIndex);
  });

  it("position advances as simTime increases", () => {
    const early = computePosition(testLightfish, meta, 100);
    const later = computePosition(testLightfish, meta, 10000);
    const dist = distanceNM(early.position, later.position);
    expect(dist).toBeGreaterThan(0);
  });

  it("position wraps around the route", () => {
    // Advance enough simTime to complete multiple laps
    const avgSpeed = testLightfish.maxSpeed * 0.7;
    const lapTimeSeconds = (meta.totalDistance / avgSpeed) * 3600;
    const pos1 = computePosition(testLightfish, meta, lapTimeSeconds * 0.1);
    const pos2 = computePosition(testLightfish, meta, lapTimeSeconds * 3.1);
    // After 3 full laps + 0.1, should be near the same position as 0.1 laps
    const dist = distanceNM(pos1.position, pos2.position);
    expect(dist).toBeLessThan(1); // within 1 NM
  });

  it("speed is positive", () => {
    const pos = computePosition(testLightfish, meta, 1000);
    expect(pos.speed).toBeGreaterThan(0);
  });
});

describe("advanceBattery", () => {
  it("drains for quickfish over time", () => {
    let battery = 80;
    for (let t = 0; t < 100; t++) {
      battery = advanceBattery(testQuickfish, battery, t, 1, 1);
    }
    expect(battery).toBeLessThan(80);
  });

  it("quickfish refuels at waypoint 0", () => {
    let battery = 50;
    // Advance at waypoint 0 — drain + refuel should net positive
    for (let t = 0; t < 100; t++) {
      battery = advanceBattery(testQuickfish, battery, t, 1, 0);
    }
    // Refuel rate (0.5/s) exceeds drain rate (0.02/s), so battery should increase
    expect(battery).toBeGreaterThan(50);
  });

  it("lightfish battery oscillates with solar cycle", () => {
    // Run through a full day/night cycle and collect battery readings
    let battery = 70;
    const readings: number[] = [battery];
    for (let t = 0; t < 20000; t += 100) {
      battery = advanceBattery(testLightfish, battery, t, 100, 0);
      readings.push(battery);
    }
    // Battery should not be monotonically decreasing (solar recharges)
    const allDecreasing = readings.every(
      (v, i) => i === 0 || v <= readings[i - 1]!,
    );
    expect(allDecreasing).toBe(false);
  });

  it("battery stays within [5, 100]", () => {
    // Drain lightfish for a long time
    let battery = 10;
    for (let t = 0; t < 50000; t += 100) {
      battery = advanceBattery(testLightfish, battery, t, 100, 0);
    }
    expect(battery).toBeGreaterThanOrEqual(5);
    expect(battery).toBeLessThanOrEqual(100);
  });
});

describe("computeCommsHealth", () => {
  it("returns values between 0 and 1", () => {
    for (let t = 0; t < 100000; t += 1000) {
      const health = computeCommsHealth(testLightfish, t);
      expect(health).toBeGreaterThanOrEqual(0);
      expect(health).toBeLessThanOrEqual(1);
    }
  });

  it("is deterministic", () => {
    const a = computeCommsHealth(testLightfish, 5000);
    const b = computeCommsHealth(testLightfish, 5000);
    expect(a).toBe(b);
  });

  it("varies over time (oscillates)", () => {
    const values = new Set<number>();
    for (let t = 0; t < 100000; t += 5000) {
      values.add(Math.round(computeCommsHealth(testLightfish, t) * 10));
    }
    // Should hit multiple distinct rounded values
    expect(values.size).toBeGreaterThan(3);
  });

  it("different vessels have different phases", () => {
    const a = computeCommsHealth(testLightfish, 5000);
    const b = computeCommsHealth(testQuickfish, 5000);
    // Different vessel IDs should produce different health values
    expect(a).not.toBe(b);
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
});

describe("buildTelemetry", () => {
  it("returns valid telemetry for a lightfish", () => {
    const meta = computeRouteMetadata(testLightfish.route);
    const state = createInitialState(testLightfish);
    const telemetry = buildTelemetry(testLightfish, meta, state, 1000);
    expect(telemetry.vesselId).toBe("test-lf");
    expect(telemetry.heading).toBeGreaterThanOrEqual(0);
    expect(telemetry.heading).toBeLessThan(360);
    expect(telemetry.speed).toBeGreaterThan(0);
    expect(telemetry.battery).toBeGreaterThan(0);
    expect(telemetry.position.lat).toBeDefined();
    expect(telemetry.position.lng).toBeDefined();
  });
});
