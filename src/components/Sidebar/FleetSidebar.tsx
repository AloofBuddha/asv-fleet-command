import { useCallback } from "react";
import * as stylex from "@stylexjs/stylex";
import { colors, spacing, fontSizes, radii } from "../../styles/tokens.stylex";
import { useFleetStore } from "../../stores/fleetStore";
import { vesselInfo } from "../../data/vesselConfigs";
import { VesselCard } from "./VesselCard";

function onlineStatusColor(online: number, total: number): string {
  if (online === total) return "#22c55e"; // green — all online
  if (online >= total * 0.9) return "#f59e0b"; // amber — ≤10% offline
  return "#ef4444"; // red — >10% offline
}

const styles = stylex.create({
  sidebar: {
    width: "280px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    backgroundColor: colors.bgSurface,
    borderRightWidth: "1px",
    borderRightStyle: "solid",
    borderRightColor: colors.border,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBlock: spacing.sm,
    paddingInline: spacing.lg,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: fontSizes.sm,
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  statusBadge: {
    fontSize: fontSizes.sm,
    fontWeight: 600,
    fontFamily: "monospace",
    paddingBlock: "2px",
    paddingInline: spacing.sm,
    borderRadius: radii.sm,
  },
  list: {
    flexGrow: 1,
    overflowY: "auto",
    padding: spacing.md,
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
  },
});

interface FleetSidebarProps {
  collapsed: boolean;
  onFlyTo: (lat: number, lng: number) => void;
}

export function FleetSidebar({ collapsed, onFlyTo }: FleetSidebarProps) {
  const vessels = useFleetStore((s) => s.vessels);
  const selectedVesselId = useFleetStore((s) => s.selectedVesselId);
  const selectVessel = useFleetStore((s) => s.selectVessel);

  const handleSelect = useCallback(
    (id: string) => {
      selectVessel(id);
      const telemetry = vessels.get(id);
      if (telemetry) {
        onFlyTo(telemetry.position.lat, telemetry.position.lng);
      }
    },
    [selectVessel, vessels, onFlyTo],
  );

  if (collapsed) return null;

  const onlineCount = Array.from(vessels.values()).filter(
    (v) => v.status !== "offline",
  ).length;
  const total = vesselInfo.length;
  const statusColor = onlineStatusColor(onlineCount, total);

  return (
    <aside {...stylex.props(styles.sidebar)}>
      <div {...stylex.props(styles.header)}>
        <span {...stylex.props(styles.headerTitle)}>Fleet</span>
        <span
          {...stylex.props(styles.statusBadge)}
          style={{
            color: statusColor,
            backgroundColor: `${statusColor}18`,
          }}
        >
          {onlineCount}/{total} online
        </span>
      </div>
      <div {...stylex.props(styles.list)}>
        {vesselInfo.map((info) => (
          <VesselCard
            key={info.id}
            info={info}
            telemetry={vessels.get(info.id)}
            isSelected={selectedVesselId === info.id}
            onSelect={() => handleSelect(info.id)}
          />
        ))}
      </div>
    </aside>
  );
}
