import * as stylex from "@stylexjs/stylex";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { colors, fontSizes, spacing } from "../../styles/tokens.stylex";
import type { VesselTelemetry } from "../../types/vessel";

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
  chart: {
    width: "100%",
    height: "80px",
  },
});

interface TelemetryChartsProps {
  history: VesselTelemetry[];
}

export function TelemetryCharts({ history }: TelemetryChartsProps) {
  if (history.length < 2) return null;

  const batteryData = history.map((t, i) => ({ i, v: t.battery }));
  const speedData = history.map((t, i) => ({ i, v: t.speed }));

  return (
    <div {...stylex.props(styles.section)}>
      <span {...stylex.props(styles.label)}>Battery %</span>
      <div {...stylex.props(styles.chart)}>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={batteryData}>
            <YAxis domain={[0, 100]} hide />
            <Line
              type="monotone"
              dataKey="v"
              stroke="#22c55e"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <span {...stylex.props(styles.label)}>Speed (kn)</span>
      <div {...stylex.props(styles.chart)}>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={speedData}>
            <YAxis domain={[0, "auto"]} hide />
            <Line
              type="monotone"
              dataKey="v"
              stroke="#06b6d4"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
