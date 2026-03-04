import type { VesselType } from "../types/vessel";

/** Static vessel metadata for client-side display (mirrors server configs) */
export interface VesselInfo {
  id: string;
  name: string;
  callsign: string;
  type: VesselType;
}

export const vesselInfo: VesselInfo[] = [
  { id: "lf-01", name: "Sentinel", callsign: "LF-01", type: "lightfish" },
  { id: "lf-02", name: "Watcher", callsign: "LF-02", type: "lightfish" },
  { id: "lf-03", name: "Drifter", callsign: "LF-03", type: "lightfish" },
  { id: "lf-04", name: "Patrol", callsign: "LF-04", type: "lightfish" },
  { id: "qf-01", name: "Interceptor", callsign: "QF-01", type: "quickfish" },
  { id: "qf-02", name: "Striker", callsign: "QF-02", type: "quickfish" },
];

export const vesselInfoMap = new Map(vesselInfo.map((v) => [v.id, v]));
