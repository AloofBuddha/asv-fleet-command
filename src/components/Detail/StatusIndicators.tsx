import * as stylex from "@stylexjs/stylex";
import { colors, spacing, fontSizes, radii } from "../../styles/tokens.stylex";
import type { VesselTelemetry } from "../../types/vessel";
import type { VesselInfo } from "../../data/vesselConfigs";

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: spacing.sm,
  },
  item: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: spacing.sm,
    backgroundColor: colors.bgDeep,
    borderRadius: radii.sm,
  },
  itemLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  itemValue: {
    fontSize: fontSizes.md,
    fontFamily: "monospace",
    fontWeight: 600,
  },
});

const statusColors: Record<string, string> = {
  nominal: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
  offline: "#6b7280",
  strong: "#22c55e",
  degraded: "#f59e0b",
  lost: "#ef4444",
};

interface StatusIndicatorsProps {
  info: VesselInfo;
  telemetry: VesselTelemetry;
}

export function StatusIndicators({ info, telemetry }: StatusIndicatorsProps) {
  return (
    <div {...stylex.props(styles.grid)}>
      <div {...stylex.props(styles.item)}>
        <span {...stylex.props(styles.itemLabel)}>Status</span>
        <span
          {...stylex.props(styles.itemValue)}
          style={{ color: statusColors[telemetry.status] }}
        >
          {telemetry.status.toUpperCase()}
        </span>
      </div>
      <div {...stylex.props(styles.item)}>
        <span {...stylex.props(styles.itemLabel)}>Comms</span>
        <span
          {...stylex.props(styles.itemValue)}
          style={{ color: statusColors[telemetry.commsStatus] }}
        >
          {telemetry.commsStatus.toUpperCase()}
        </span>
      </div>
      <div {...stylex.props(styles.item)}>
        <span {...stylex.props(styles.itemLabel)}>Speed</span>
        <span
          {...stylex.props(styles.itemValue)}
          style={{ color: colors.textPrimary }}
        >
          {telemetry.speed.toFixed(1)} kn
        </span>
      </div>
      <div {...stylex.props(styles.item)}>
        <span {...stylex.props(styles.itemLabel)}>Type</span>
        <span
          {...stylex.props(styles.itemValue)}
          style={{
            color:
              info.type === "lightfish" ? "#06b6d4" : "#f59e0b",
          }}
        >
          {info.type === "lightfish" ? "LIGHTFISH" : "QUICKFISH"}
        </span>
      </div>
    </div>
  );
}
