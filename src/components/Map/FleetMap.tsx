import { MapContainer, TileLayer } from "react-leaflet";
import * as stylex from "@stylexjs/stylex";
import "leaflet/dist/leaflet.css";
import { useFleetStore } from "../../stores/fleetStore";
import { VesselMarker } from "./VesselMarker";
import { SpeedLeader } from "./SpeedLeader";
import { VesselTrail } from "./VesselTrail";
import { Graticule } from "./Graticule";
import { NauticalScale } from "./NauticalScale";
import { RangeRings } from "./RangeRings";
import { MapFlyTo } from "./MapFlyTo";
import { MapInvalidateSize } from "./MapInvalidateSize";

const styles = stylex.create({
  container: {
    width: "100%",
    height: "100%",
  },
});

// Western Atlantic operational area — covers Gulf Stream, Caribbean, Chesapeake
const DEFAULT_CENTER: [number, number] = [25, -70];
const DEFAULT_ZOOM = 5;

// CartoDB Dark Matter — dark ocean-friendly basemap
const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

function VesselLayers() {
  const vessels = useFleetStore((s) => s.vessels);
  return (
    <>
      {Array.from(vessels.values()).map((telemetry) => (
        <VesselTrail key={`trail-${telemetry.vesselId}`} telemetry={telemetry} />
      ))}
      {Array.from(vessels.values()).map((telemetry) => (
        <SpeedLeader
          key={`leader-${telemetry.vesselId}`}
          telemetry={telemetry}
        />
      ))}
      {Array.from(vessels.values()).map((telemetry) => (
        <VesselMarker key={telemetry.vesselId} telemetry={telemetry} />
      ))}
    </>
  );
}

interface FleetMapProps {
  flyToTarget?: { lat: number; lng: number } | null;
  sidebarCollapsed?: boolean;
  detailOpen?: boolean;
}

export function FleetMap({ flyToTarget, sidebarCollapsed, detailOpen }: FleetMapProps) {
  return (
    <div {...stylex.props(styles.container)}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <Graticule />
        <NauticalScale />
        <RangeRings />
        <VesselLayers />
        <MapFlyTo target={flyToTarget ?? null} />
        <MapInvalidateSize trigger={`${sidebarCollapsed}-${detailOpen}`} />
      </MapContainer>
    </div>
  );
}
