import * as stylex from "@stylexjs/stylex";
import { colors, spacing, fontSizes, radii } from "../../styles/tokens.stylex";
import type { VesselTelemetry } from "../../types/vessel";
import type { VesselInfo } from "../../data/vesselConfigs";
import { VesselIcon } from "../VesselIcon";

const styles = stylex.create({
  card: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.bgPanel,
    borderRadius: radii.md,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.border,
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
  cardSelected: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.bgHover,
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameGroup: {
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
  },
  name: {
    fontSize: fontSizes.md,
    fontWeight: 600,
    color: colors.textPrimary,
  },
  callsign: {
    fontSize: fontSizes.xs,
    fontFamily: "monospace",
    color: colors.textMuted,
  },
  typeBadge: {
    fontSize: fontSizes.xs,
    fontFamily: "monospace",
    paddingBlock: "1px",
    paddingInline: spacing.xs,
    borderRadius: "3px",
  },
  lightfish: {
    color: colors.vesselLightfish,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
  },
  quickfish: {
    color: colors.vesselQuickfish,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
  },
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    fontSize: fontSizes.sm,
    fontFamily: "monospace",
    color: colors.textSecondary,
  },
  batteryGroup: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  chargeArrow: {
    fontSize: "10px",
    lineHeight: 1,
  },
  batteryBar: {
    flexGrow: 1,
    height: "4px",
    backgroundColor: colors.bgDeep,
    borderRadius: "2px",
    overflow: "hidden",
  },
  batteryFill: {
    height: "100%",
    borderRadius: "2px",
    transition: "width 0.5s",
  },
  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
  },
});

const statusColors: Record<string, string> = {
  nominal: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
  offline: "#6b7280",
};

const pulseAnimations: Record<string, string> = {
  nominal: "pulse-nominal 2s ease-in-out infinite",
  warning: "pulse-warning 1.5s ease-in-out infinite",
  critical: "pulse-critical 1s ease-in-out infinite",
};

function batteryColor(level: number): string {
  if (level < 15) return "#ef4444";
  if (level < 30) return "#f59e0b";
  return "#22c55e";
}

interface VesselCardProps {
  info: VesselInfo;
  telemetry: VesselTelemetry | undefined;
  isSelected: boolean;
  onSelect: () => void;
}

export function VesselCard({
  info,
  telemetry,
  isSelected,
  onSelect,
}: VesselCardProps) {
  const status = telemetry?.status ?? "offline";
  const speed = telemetry?.speed ?? 0;
  const battery = telemetry?.battery ?? 0;
  const chargeRate = telemetry?.chargeRate ?? 0;

  return (
    <div
      {...stylex.props(styles.card, isSelected && styles.cardSelected)}
      onClick={onSelect}
      onMouseEnter={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLDivElement).style.backgroundColor = "#1f2d3f";
      }}
      onMouseLeave={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLDivElement).style.backgroundColor = "";
      }}
    >
      <div {...stylex.props(styles.topRow)}>
        <div {...stylex.props(styles.nameGroup)}>
          <div
            {...stylex.props(styles.statusDot)}
            style={{
              backgroundColor: statusColors[status],
              animation: pulseAnimations[status] ?? "none",
            }}
          />
          <span {...stylex.props(styles.name)}>{info.name}</span>
          <span {...stylex.props(styles.callsign)}>{info.callsign}</span>
        </div>
        <div
          {...stylex.props(
            styles.typeBadge,
            info.type === "lightfish" ? styles.lightfish : styles.quickfish,
          )}
          style={{ display: "flex", alignItems: "center", gap: "3px" }}
        >
          <VesselIcon
            type={info.type}
            color={info.type === "lightfish" ? "#06b6d4" : "#f59e0b"}
            size={14}
          />
          {info.type === "lightfish" ? "LF" : "QF"}
        </div>
      </div>
      <div {...stylex.props(styles.statsRow)}>
        <span>{speed.toFixed(1)} kn</span>
        <div {...stylex.props(styles.batteryGroup)}>
          <span>{battery.toFixed(0)}%</span>
          <span
            {...stylex.props(styles.chargeArrow)}
            style={{ color: chargeRate > 0 ? "#22c55e" : "#ef4444" }}
          >
            {chargeRate > 0 ? "▲" : "▼"}
          </span>
        </div>
        <div {...stylex.props(styles.batteryBar)}>
          <div
            {...stylex.props(styles.batteryFill)}
            style={{
              width: `${battery}%`,
              backgroundColor: batteryColor(battery),
            }}
          />
        </div>
      </div>
    </div>
  );
}
