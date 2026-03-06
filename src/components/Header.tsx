import { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { colors, spacing, fontSizes } from "../styles/tokens.stylex";
import { useFleetStore } from "../stores/fleetStore";
import { AlertDropdown } from "./AlertPanel";

const SIM_SPEED_OPTIONS = [1, 10, 60, 300] as const;

const styles = stylex.create({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "40px",
    paddingInline: spacing.lg,
    backgroundColor: colors.bgSurface,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
    flexShrink: 0,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: 600,
    color: colors.textPrimary,
    letterSpacing: "0.02em",
  },
  badge: {
    fontSize: fontSizes.xs,
    color: colors.accentPrimary,
    fontFamily: "monospace",
    opacity: 0.7,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
  },
  clock: {
    fontSize: fontSizes.sm,
    fontFamily: "monospace",
    color: colors.textSecondary,
  },
  simSpeedBtn: {
    fontSize: fontSizes.xs,
    fontFamily: "monospace",
    color: colors.textSecondary,
    backgroundColor: colors.bgPanel,
    paddingBlock: "3px",
    paddingInline: spacing.sm,
    borderRadius: "3px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.border,
    cursor: "pointer",
  },
  dataStatus: {
    fontSize: fontSizes.xs,
    fontFamily: "monospace",
    fontWeight: 600,
    letterSpacing: "0.05em",
  },
  toggleBtn: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    background: "none",
    borderWidth: 0,
    borderStyle: "none",
    color: colors.textMuted,
    cursor: "pointer",
    padding: spacing.xs,
  },
  hamburgerLine: {
    width: "16px",
    height: "2px",
    backgroundColor: colors.textMuted,
    borderRadius: "1px",
  },
});

function useUTCClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({ sidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const time = useUTCClock();
  const simSpeed = useFleetStore((s) => s.simSpeed);
  const lastUpdate = useFleetStore((s) => s.lastUpdate);
  const utcStr = time.toISOString().slice(11, 19);
  const dateStr = time.toISOString().slice(0, 10);
  const dataAge = lastUpdate ? Math.floor((time.getTime() - lastUpdate) / 1000) : null;
  const dataStale = dataAge !== null && dataAge > 5;

  const cycleSpeed = () => {
    const currentIdx = SIM_SPEED_OPTIONS.indexOf(
      simSpeed as (typeof SIM_SPEED_OPTIONS)[number],
    );
    const nextIdx = (currentIdx + 1) % SIM_SPEED_OPTIONS.length;
    const nextSpeed = SIM_SPEED_OPTIONS[nextIdx]!;
    useFleetStore.getState().setSimSpeed(nextSpeed);
  };

  return (
    <header {...stylex.props(styles.header)}>
      <div {...stylex.props(styles.left)}>
        <button
          onClick={onToggleSidebar}
          {...stylex.props(styles.toggleBtn)}
          aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
        >
          <span {...stylex.props(styles.hamburgerLine)} />
          <span {...stylex.props(styles.hamburgerLine)} />
          <span {...stylex.props(styles.hamburgerLine)} />
        </button>
        <span {...stylex.props(styles.title)}>ASV Fleet Command</span>
        <span {...stylex.props(styles.badge)}>DEMO</span>
      </div>
      <div {...stylex.props(styles.right)}>
        {dataAge !== null && (
          <span
            {...stylex.props(styles.dataStatus)}
            style={{ color: dataStale ? "#ef4444" : "#22c55e" }}
          >
            {dataStale ? `STALE ${dataAge}s` : "LIVE"}
          </span>
        )}
        <button
          onClick={cycleSpeed}
          {...stylex.props(styles.simSpeedBtn)}
          title="Click to change simulation speed"
        >
          {simSpeed}x speed
        </button>
        <AlertDropdown />
        <span {...stylex.props(styles.clock)}>
          {dateStr} {utcStr}Z
        </span>
      </div>
    </header>
  );
}
