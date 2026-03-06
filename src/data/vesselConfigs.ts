import type { LatLng, VesselType } from "../types/vessel";
import {
  gulfStreamPatrol,
  caribbeanLoop,
  gulfMexicoSurvey,
  chesapeakePatrol,
  floridaStraitIntercept,
  norfolkBermudaTransit,
} from "./routes";

/** Static vessel metadata for client-side display (mirrors server configs) */
export interface VesselInfo {
  id: string;
  name: string;
  callsign: string;
  type: VesselType;
  route: LatLng[];
}

export const vesselInfo: VesselInfo[] = [
  { id: "lf-01", name: "Sentinel", callsign: "LF-01", type: "lightfish", route: gulfStreamPatrol },
  { id: "lf-02", name: "Watcher", callsign: "LF-02", type: "lightfish", route: caribbeanLoop },
  { id: "lf-03", name: "Drifter", callsign: "LF-03", type: "lightfish", route: gulfMexicoSurvey },
  { id: "lf-04", name: "Patrol", callsign: "LF-04", type: "lightfish", route: chesapeakePatrol },
  { id: "qf-01", name: "Interceptor", callsign: "QF-01", type: "quickfish", route: floridaStraitIntercept },
  { id: "qf-02", name: "Striker", callsign: "QF-02", type: "quickfish", route: norfolkBermudaTransit },
];

export const vesselInfoMap = new Map(vesselInfo.map((v) => [v.id, v]));
