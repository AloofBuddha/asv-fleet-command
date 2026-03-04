import * as stylex from "@stylexjs/stylex";
import { colors, spacing, fontSizes } from "../../styles/tokens.stylex";

const styles = stylex.create({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  barOuter: {
    height: "12px",
    backgroundColor: colors.bgDeep,
    borderRadius: "6px",
    overflow: "hidden",
  },
  barInner: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.5s, background-color 0.5s",
  },
  stats: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: fontSizes.sm,
    fontFamily: "monospace",
  },
  percent: {
    fontWeight: 600,
  },
  chargeRate: {
    color: colors.textMuted,
  },
});

function barColor(level: number): string {
  if (level < 15) return "#ef4444";
  if (level < 30) return "#f59e0b";
  return "#22c55e";
}

interface BatteryGaugeProps {
  level: number;
  chargeRate: number;
}

export function BatteryGauge({ level, chargeRate }: BatteryGaugeProps) {
  const charging = chargeRate > 0;
  const rateStr = charging
    ? `+${(chargeRate * 100).toFixed(1)}%/s`
    : `${(chargeRate * 100).toFixed(1)}%/s`;

  return (
    <div {...stylex.props(styles.container)}>
      <span {...stylex.props(styles.label)}>Battery</span>
      <div {...stylex.props(styles.barOuter)}>
        <div
          {...stylex.props(styles.barInner)}
          style={{
            width: `${level}%`,
            backgroundColor: barColor(level),
          }}
        />
      </div>
      <div {...stylex.props(styles.stats)}>
        <span
          {...stylex.props(styles.percent)}
          style={{ color: barColor(level) }}
        >
          {level.toFixed(1)}%
        </span>
        <span {...stylex.props(styles.chargeRate)}>
          {charging ? "Charging" : "Discharging"} {rateStr}
        </span>
      </div>
    </div>
  );
}
