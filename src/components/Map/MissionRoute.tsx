import { Polyline, CircleMarker } from "react-leaflet";
import type { LatLng } from "../../types/vessel";
import type { VesselTelemetry } from "../../types/vessel";

interface MissionRouteProps {
  route: LatLng[];
  telemetry?: VesselTelemetry;
  /** Render at reduced opacity (for non-selected vessels) */
  dim?: boolean;
}

export function MissionRoute({ route, telemetry, dim }: MissionRouteProps) {
  if (route.length < 2) return null;

  const opacity = dim ? 0.1 : 0.7;
  const positions = route.map((p) => [p.lat, p.lng] as [number, number]);
  const activeIdx = telemetry?.waypointIndex ?? 0;

  return (
    <>
      {/* Full route as dashed line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: "#06b6d4",
          weight: dim ? 1 : 2,
          opacity,
          dashArray: "6 4",
        }}
      />
      {/* Active segment highlighted */}
      {!dim && activeIdx < route.length - 1 && (
        <Polyline
          positions={[positions[activeIdx]!, positions[activeIdx + 1]!]}
          pathOptions={{
            color: "#22c55e",
            weight: 3,
            opacity: 0.9,
          }}
        />
      )}
      {/* Waypoint dots */}
      {!dim &&
        route.map((wp, i) => (
          <CircleMarker
            key={`wp-${i}`}
            center={[wp.lat, wp.lng]}
            radius={3}
            pathOptions={{
              color: i === activeIdx ? "#22c55e" : "#06b6d4",
              fillColor: i === activeIdx ? "#22c55e" : "#06b6d4",
              fillOpacity: i <= activeIdx ? 0.9 : 0.4,
              weight: 1,
              opacity: 0.8,
            }}
          />
        ))}
    </>
  );
}
