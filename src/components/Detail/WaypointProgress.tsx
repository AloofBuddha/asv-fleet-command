import * as stylex from "@stylexjs/stylex";
import { colors, spacing, fontSizes, radii } from "../../styles/tokens.stylex";
import type { LatLng, VesselTelemetry } from "../../types/vessel";

const styles = stylex.create({
  section: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  info: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontFamily: "monospace",
  },
  barTrack: {
    height: "4px",
    backgroundColor: colors.bgPanel,
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.accentPrimary,
    borderRadius: radii.sm,
    transition: "width 0.3s ease",
  },
  nextWp: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontFamily: "monospace",
  },
});

interface WaypointProgressProps {
  telemetry: VesselTelemetry;
  route: LatLng[];
}

export function WaypointProgress({ telemetry, route }: WaypointProgressProps) {
  if (route.length < 2) return null;

  const totalWaypoints = route.length;
  const currentWp = telemetry.waypointIndex + 1; // 1-indexed for display
  const nextWpCoord = route[telemetry.waypointIndex + 1] ?? route[route.length - 1]!;
  const overallProgress =
    ((telemetry.waypointIndex + telemetry.segmentProgress) / (totalWaypoints - 1)) * 100;

  return (
    <div {...stylex.props(styles.section)}>
      <span {...stylex.props(styles.label)}>Mission Progress</span>
      <span {...stylex.props(styles.info)}>
        Waypoint {currentWp} of {totalWaypoints}
      </span>
      <div {...stylex.props(styles.barTrack)}>
        <div
          {...stylex.props(styles.barFill)}
          style={{ width: `${Math.min(overallProgress, 100)}%` }}
        />
      </div>
      <span {...stylex.props(styles.nextWp)}>
        Next: {nextWpCoord.lat.toFixed(2)}N, {Math.abs(nextWpCoord.lng).toFixed(2)}W
      </span>
    </div>
  );
}
