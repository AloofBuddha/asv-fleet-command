import { Polyline } from "react-leaflet";
import type { VesselTelemetry } from "../../types/vessel";

interface SpeedLeaderProps {
  telemetry: VesselTelemetry;
}

/** Minutes of travel to project ahead */
const LEADER_MINUTES = 30;

/**
 * Speed leader line — projects where the vessel will be in N minutes.
 * Standard ECDIS/AIS display feature for perceiving vessel motion at a glance.
 */
export function SpeedLeader({ telemetry }: SpeedLeaderProps) {
  const { position, heading, speed } = telemetry;

  // Don't show leader for stationary or offline vessels
  if (speed < 0.1 || telemetry.status === "offline") return null;

  // Project ahead: speed (knots) * time (hours) = distance (NM)
  const distanceNM = speed * (LEADER_MINUTES / 60);
  // Convert NM to approximate degrees (1 NM ≈ 1/60 degree)
  const distanceDeg = distanceNM / 60;

  const headingRad = (heading * Math.PI) / 180;
  const endLat = position.lat + distanceDeg * Math.cos(headingRad);
  const endLng =
    position.lng +
    (distanceDeg * Math.sin(headingRad)) /
      Math.cos((position.lat * Math.PI) / 180);

  // Dark shade of vessel hue — fainter than marker and trail
  const color = telemetry.vesselId.startsWith("lf") ? "#164e63" : "#78350f";

  return (
    <Polyline
      positions={[
        [position.lat, position.lng],
        [endLat, endLng],
      ]}
      pathOptions={{
        color,
        weight: 1.5,
        opacity: 0.6,
        dashArray: "4 4",
      }}
    />
  );
}
