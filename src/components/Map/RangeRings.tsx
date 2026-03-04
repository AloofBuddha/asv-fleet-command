import { useEffect, useState } from "react";
import { Circle, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useFleetStore } from "../../stores/fleetStore";

const NM_TO_METERS = 1852;

/** Pick ring interval based on zoom level */
function getIntervalNM(zoom: number): number {
  if (zoom <= 4) return 100;
  if (zoom <= 6) return 50;
  if (zoom <= 8) return 10;
  if (zoom <= 10) return 5;
  if (zoom <= 12) return 1;
  return 0.5;
}

/** Offset a position east by a given NM distance (for labels) */
function offsetEast(
  lat: number,
  lng: number,
  distNM: number,
): [number, number] {
  const dLng = distNM / (60 * Math.cos((lat * Math.PI) / 180));
  return [lat, lng + dLng];
}

/**
 * ECDIS-style range rings around the selected vessel.
 * 4 concentric dashed circles with NM labels at zoom-appropriate intervals.
 */
export function RangeRings() {
  const selectedVesselId = useFleetStore((s) => s.selectedVesselId);
  const vessels = useFleetStore((s) => s.vessels);
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const handler = () => setZoom(map.getZoom());
    map.on("zoomend", handler);
    return () => {
      map.off("zoomend", handler);
    };
  }, [map]);

  if (!selectedVesselId) return null;

  const vessel = vessels.get(selectedVesselId);
  if (!vessel) return null;

  const center: [number, number] = [
    vessel.position.lat,
    vessel.position.lng,
  ];
  const intervalNM = getIntervalNM(zoom);
  const rings = [1, 2, 3, 4].map((i) => i * intervalNM);

  return (
    <>
      {rings.map((distNM) => (
        <Circle
          key={distNM}
          center={center}
          radius={distNM * NM_TO_METERS}
          pathOptions={{
            color: "#4a5a6e",
            weight: 0.7,
            opacity: 0.5,
            fill: false,
            dashArray: "6 4",
            interactive: false,
          }}
        />
      ))}
      {rings.map((distNM) => (
        <Marker
          key={`label-${distNM}`}
          position={offsetEast(center[0], center[1], distNM)}
          icon={L.divIcon({
            className: "",
            html: `<span style="color:#6a7a8a;font-size:10px;font-family:monospace;white-space:nowrap">${distNM} NM</span>`,
            iconSize: [50, 14],
            iconAnchor: [0, 7],
          })}
          interactive={false}
        />
      ))}
    </>
  );
}
