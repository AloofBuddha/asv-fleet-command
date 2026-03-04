import { Polyline, CircleMarker } from "react-leaflet";
import { useFleetStore } from "../../stores/fleetStore";
import type { VesselTelemetry } from "../../types/vessel";

interface VesselTrailProps {
  telemetry: VesselTelemetry;
}

/** Number of opacity-faded segments to split the trail into */
const TRAIL_SEGMENTS = 8;

/**
 * Past track trail — segmented opacity fade with dotted line style.
 * Newest positions are bright, oldest fade out.
 * Dotted pattern distinguishes trail (historical) from leader (predictive, dashed).
 */
export function VesselTrail({ telemetry }: VesselTrailProps) {
  const trail = useFleetStore((s) => s.trails.get(telemetry.vesselId));

  if (!trail || trail.length < 2) return null;

  // Medium shade of vessel hue — darker than marker, brighter than leader
  const color = telemetry.vesselId.startsWith("lf") ? "#0891b2" : "#d97706";
  const positions: [number, number][] = trail.map((p) => [p.lat, p.lng]);

  // Split trail into segments with fading opacity (oldest=faint, newest=bright)
  const segmentSize = Math.max(1, Math.floor(positions.length / TRAIL_SEGMENTS));
  const segments: { positions: [number, number][]; opacity: number }[] = [];

  for (let i = 0; i < TRAIL_SEGMENTS; i++) {
    const start = i * segmentSize;
    // Overlap by 1 point so segments connect
    const end = Math.min(positions.length, (i + 1) * segmentSize + 1);
    if (start >= positions.length) break;
    const slice = positions.slice(start, end);
    if (slice.length < 2) continue;
    // Opacity: oldest segment (i=0) = 0.15, newest = 0.7
    const t = i / (TRAIL_SEGMENTS - 1);
    const opacity = 0.15 + t * 0.55;
    segments.push({ positions: slice, opacity });
  }

  // Breadcrumb dots at regular intervals for additional texture
  const dotInterval = Math.max(1, Math.floor(positions.length / 20));
  const dots: { position: [number, number]; opacity: number }[] = [];
  for (let i = 0; i < positions.length; i += dotInterval) {
    const t = i / (positions.length - 1);
    dots.push({
      position: positions[i]!,
      opacity: 0.2 + t * 0.6,
    });
  }

  return (
    <>
      {/* Fading trail segments — dotted line */}
      {segments.map((seg, i) => (
        <Polyline
          key={i}
          positions={seg.positions}
          pathOptions={{
            color,
            weight: 2,
            opacity: seg.opacity,
            dashArray: "2 4",
            lineCap: "round",
            lineJoin: "round",
            interactive: false,
          }}
        />
      ))}
      {/* Breadcrumb dots for visual rhythm */}
      {dots.map((dot, i) => (
        <CircleMarker
          key={i}
          center={dot.position}
          radius={2}
          pathOptions={{
            color,
            fillColor: color,
            fillOpacity: dot.opacity,
            weight: 0,
            interactive: false,
          }}
        />
      ))}
    </>
  );
}
