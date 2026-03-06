export type VesselType = "lightfish" | "quickfish";

export type VesselStatus = "nominal" | "warning" | "critical" | "offline";

export type CommsStatus = "strong" | "degraded" | "lost";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface VesselConfig {
  id: string;
  name: string;
  callsign: string;
  type: VesselType;
  /** Max speed in knots */
  maxSpeed: number;
  /** Battery capacity in kWh */
  batteryCapacity: number;
  /** Whether vessel has solar charging */
  hasSolar: boolean;
  /** Route waypoints */
  route: LatLng[];
}

export interface VesselTelemetry {
  vesselId: string;
  timestamp: number;
  position: LatLng;
  /** Heading in degrees (0-360, 0=north) */
  heading: number;
  /** Speed in knots */
  speed: number;
  /** Battery level 0-100 */
  battery: number;
  /** Battery charge rate (positive = charging, negative = discharging) */
  chargeRate: number;
  status: VesselStatus;
  commsStatus: CommsStatus;
  /** Current waypoint index in route */
  waypointIndex: number;
  /** Progress along current segment (0-1) */
  segmentProgress: number;
}

export type AlertType =
  | "battery_critical"
  | "battery_warning"
  | "comms_lost"
  | "status_critical"
  | "status_offline";

export interface Alert {
  id: string;
  vesselId: string;
  vesselName: string;
  type: AlertType;
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

/** Fleet-level broadcast containing all vessel telemetry */
export interface FleetUpdate {
  type: "fleet_update";
  vessels: VesselTelemetry[];
  /** Past position trails per vessel ID */
  trails: Record<string, LatLng[]>;
  simSpeed: number;
  timestamp: number;
}

/** Single vessel telemetry broadcast */
export interface VesselUpdate {
  type: "vessel_update";
  telemetry: VesselTelemetry;
}
