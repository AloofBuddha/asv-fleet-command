import type { VesselConfig } from "../../src/types/vessel";
import {
  gulfStreamPatrol,
  caribbeanLoop,
  gulfMexicoSurvey,
  chesapeakePatrol,
  floridaStraitIntercept,
  norfolkBermudaTransit,
} from "./routes";

export const vesselConfigs: VesselConfig[] = [
  {
    id: "lf-01",
    name: "Sentinel",
    callsign: "LF-01",
    type: "lightfish",
    maxSpeed: 4, // knots — slow, solar-powered endurance
    batteryCapacity: 20,
    hasSolar: true,
    route: gulfStreamPatrol,
  },
  {
    id: "lf-02",
    name: "Watcher",
    callsign: "LF-02",
    type: "lightfish",
    maxSpeed: 3.5,
    batteryCapacity: 20,
    hasSolar: true,
    route: caribbeanLoop,
  },
  {
    id: "lf-03",
    name: "Drifter",
    callsign: "LF-03",
    type: "lightfish",
    maxSpeed: 3,
    batteryCapacity: 18,
    hasSolar: true,
    route: gulfMexicoSurvey,
  },
  {
    id: "lf-04",
    name: "Patrol",
    callsign: "LF-04",
    type: "lightfish",
    maxSpeed: 4,
    batteryCapacity: 22,
    hasSolar: true,
    route: chesapeakePatrol,
  },
  {
    id: "qf-01",
    name: "Interceptor",
    callsign: "QF-01",
    type: "quickfish",
    maxSpeed: 25, // knots — fast tactical vessel
    batteryCapacity: 50,
    hasSolar: false,
    route: floridaStraitIntercept,
  },
  {
    id: "qf-02",
    name: "Striker",
    callsign: "QF-02",
    type: "quickfish",
    maxSpeed: 22,
    batteryCapacity: 45,
    hasSolar: false,
    route: norfolkBermudaTransit,
  },
];
