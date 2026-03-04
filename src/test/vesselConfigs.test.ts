import { describe, it, expect } from "vitest";
import { vesselInfo, vesselInfoMap } from "../data/vesselConfigs";

describe("vesselConfigs client data", () => {
  it("has 6 vessels", () => {
    expect(vesselInfo).toHaveLength(6);
  });

  it("has 4 lightfish and 2 quickfish", () => {
    const lightfish = vesselInfo.filter((v) => v.type === "lightfish");
    const quickfish = vesselInfo.filter((v) => v.type === "quickfish");
    expect(lightfish).toHaveLength(4);
    expect(quickfish).toHaveLength(2);
  });

  it("all IDs are unique", () => {
    const ids = vesselInfo.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("vesselInfoMap can look up by ID", () => {
    const sentinel = vesselInfoMap.get("lf-01");
    expect(sentinel).toBeDefined();
    expect(sentinel?.name).toBe("Sentinel");
    expect(sentinel?.type).toBe("lightfish");
  });

  it("lightfish IDs start with lf-, quickfish with qf-", () => {
    for (const v of vesselInfo) {
      if (v.type === "lightfish") {
        expect(v.id).toMatch(/^lf-/);
      } else {
        expect(v.id).toMatch(/^qf-/);
      }
    }
  });
});
