import * as stylex from "@stylexjs/stylex";
import { colors, spacing, fontSizes, radii } from "../../styles/tokens.stylex";
import { useFleetStore } from "../../stores/fleetStore";
import { vesselInfoMap } from "../../data/vesselConfigs";
import { BatteryGauge } from "./BatteryGauge";
import { CompassHeading } from "./CompassHeading";
import { StatusIndicators } from "./StatusIndicators";

const styles = stylex.create({
  panel: {
    width: "300px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    backgroundColor: colors.bgSurface,
    borderLeftWidth: "1px",
    borderLeftStyle: "solid",
    borderLeftColor: colors.border,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBlock: spacing.md,
    paddingInline: spacing.md,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  vesselName: {
    fontSize: fontSizes.lg,
    fontWeight: 600,
    color: colors.textPrimary,
  },
  callsign: {
    fontSize: fontSizes.xs,
    fontFamily: "monospace",
    color: colors.textMuted,
  },
  closeBtn: {
    background: "none",
    borderWidth: 0,
    borderStyle: "none",
    color: colors.textMuted,
    cursor: "pointer",
    fontSize: fontSizes.lg,
    padding: spacing.xs,
    lineHeight: 1,
    borderRadius: radii.sm,
  },
  content: {
    flexGrow: 1,
    overflowY: "auto",
    padding: spacing.md,
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
  },
  compassRow: {
    display: "flex",
    justifyContent: "center",
  },
  position: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  posLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  posValue: {
    fontSize: fontSizes.sm,
    fontFamily: "monospace",
    color: colors.textSecondary,
  },
});

function formatCoord(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
}

export function VesselDetailPanel() {
  const selectedVesselId = useFleetStore((s) => s.selectedVesselId);
  const telemetry = useFleetStore((s) =>
    s.selectedVesselId ? s.vessels.get(s.selectedVesselId) : undefined,
  );
  const selectVessel = useFleetStore((s) => s.selectVessel);

  if (!selectedVesselId || !telemetry) return null;

  const info = vesselInfoMap.get(selectedVesselId);
  if (!info) return null;

  return (
    <aside {...stylex.props(styles.panel)}>
      <div {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.headerLeft)}>
          <span {...stylex.props(styles.vesselName)}>{info.name}</span>
          <span {...stylex.props(styles.callsign)}>{info.callsign}</span>
        </div>
        <button
          onClick={() => selectVessel(null)}
          {...stylex.props(styles.closeBtn)}
          aria-label="Close detail panel"
        >
          ✕
        </button>
      </div>
      <div {...stylex.props(styles.content)}>
        <StatusIndicators info={info} telemetry={telemetry} />
        <BatteryGauge
          level={telemetry.battery}
          chargeRate={telemetry.chargeRate}
        />
        <div {...stylex.props(styles.compassRow)}>
          <CompassHeading heading={telemetry.heading} />
        </div>
        <div {...stylex.props(styles.position)}>
          <span {...stylex.props(styles.posLabel)}>Position</span>
          <span {...stylex.props(styles.posValue)}>
            {formatCoord(telemetry.position.lat, telemetry.position.lng)}
          </span>
        </div>
      </div>
    </aside>
  );
}
