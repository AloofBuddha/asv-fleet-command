import { useMemo } from "react";
import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { VesselTelemetry } from "../../types/vessel";
import { useFleetStore } from "../../stores/fleetStore";
import { vesselInfoMap } from "../../data/vesselConfigs";
import { vesselIconSvg } from "../vesselIconSvg";

interface VesselMarkerProps {
  telemetry: VesselTelemetry;
}

function getVesselColor(telemetry: VesselTelemetry): string {
  switch (telemetry.status) {
    case "critical":
      return "#ef4444";
    case "warning":
      return "#f59e0b";
    case "offline":
      return "#6b7280";
    default:
      return telemetry.vesselId.startsWith("lf") ? "#06b6d4" : "#f59e0b";
  }
}

function createVesselIcon(
  vesselType: "lightfish" | "quickfish",
  color: string,
  heading: number,
  isSelected: boolean,
  isOffline: boolean,
): L.DivIcon {
  const size = isSelected ? 22 : 16;

  const svg = vesselIconSvg(vesselType, color, heading, size, isSelected, isOffline);

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function VesselMarker({ telemetry }: VesselMarkerProps) {
  const selectedVesselId = useFleetStore((s) => s.selectedVesselId);
  const selectVessel = useFleetStore((s) => s.selectVessel);
  const isSelected = selectedVesselId === telemetry.vesselId;

  const info = vesselInfoMap.get(telemetry.vesselId);
  const vesselType = info?.type ?? "lightfish";
  const color = getVesselColor(telemetry);
  // Round heading to nearest 5 degrees to avoid icon recreation on tiny changes
  const roundedHeading = Math.round(telemetry.heading / 5) * 5;
  const isOffline = telemetry.status === "offline";

  const icon = useMemo(
    () => createVesselIcon(vesselType, color, roundedHeading, isSelected, isOffline),
    [vesselType, color, roundedHeading, isSelected, isOffline],
  );

  return (
    <Marker
      position={[telemetry.position.lat, telemetry.position.lng]}
      icon={icon}
      eventHandlers={{
        click: () => selectVessel(telemetry.vesselId),
      }}
    >
      <Tooltip direction="top" offset={[0, -10]}>
        <strong>
          {info?.name ?? telemetry.vesselId}{" "}
          <span style={{ opacity: 0.6 }}>
            {info?.callsign ?? telemetry.vesselId.toUpperCase()}
          </span>
        </strong>
        <br />
        Speed: {telemetry.speed.toFixed(1)} kn
        <br />
        Battery: {telemetry.battery.toFixed(0)}%
        <br />
        Status: {telemetry.status}
      </Tooltip>
    </Marker>
  );
}
