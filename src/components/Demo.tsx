import { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { colors, spacing, fontSizes } from "../styles/tokens.stylex";
import { BatteryGauge } from "./Detail/BatteryGauge";
import { CompassHeading } from "./Detail/CompassHeading";
import { StatusIndicators } from "./Detail/StatusIndicators";
import { VesselCard } from "./Sidebar/VesselCard";
import type { VesselTelemetry } from "../types/vessel";
import type { VesselInfo } from "../data/vesselConfigs";

const styles = stylex.create({
  page: {
    padding: spacing.xl,
    maxWidth: "900px",
    marginInline: "auto",
    display: "flex",
    flexDirection: "column",
    gap: spacing.xxl,
    minHeight: "100vh",
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 700,
    color: colors.textPrimary,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 600,
    color: colors.accentPrimary,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  row: {
    display: "flex",
    gap: spacing.lg,
    flexWrap: "wrap",
  },
  cardWrap: {
    width: "260px",
  },
  gaugeWrap: {
    width: "280px",
  },
  compassWrap: {
    display: "flex",
    gap: spacing.xl,
  },
  note: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontStyle: "italic",
  },
});

const mockInfo: VesselInfo[] = [
  { id: "lf-01", name: "Sentinel", callsign: "LF-01", type: "lightfish" },
  { id: "qf-01", name: "Interceptor", callsign: "QF-01", type: "quickfish" },
];

function makeTelemetry(
  id: string,
  overrides: Partial<VesselTelemetry>,
): VesselTelemetry {
  return {
    vesselId: id,
    timestamp: Date.now(),
    position: { lat: 25, lng: -70 },
    heading: 45,
    speed: 3.2,
    battery: 72,
    chargeRate: 0.01,
    status: "nominal",
    commsStatus: "strong",
    waypointIndex: 0,
    segmentProgress: 0.5,
    ...overrides,
  };
}

/** Animated demo — values change over time to prove liveness */
function useAnimatedValues() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const heading = (tick * 15) % 360;
  const battery = 30 + 40 * Math.sin(tick * 0.1) + 40 * 0.5;
  const speed = 2 + Math.sin(tick * 0.3) * 1.5;
  return { heading, battery: Math.min(100, Math.max(5, battery)), speed, tick };
}

export function Demo() {
  const animated = useAnimatedValues();

  const nominalTelemetry = makeTelemetry("lf-01", {
    heading: animated.heading,
    speed: animated.speed,
    battery: animated.battery,
    chargeRate: 0.015,
  });
  const warningTelemetry = makeTelemetry("qf-01", {
    status: "warning",
    battery: 22,
    chargeRate: -0.025,
    speed: 18.4,
    heading: 190,
    commsStatus: "degraded",
  });
  const criticalTelemetry = makeTelemetry("lf-01", {
    status: "critical",
    battery: 8,
    chargeRate: -0.005,
    speed: 1.1,
    heading: 310,
    commsStatus: "lost",
  });
  const offlineTelemetry = makeTelemetry("lf-01", {
    status: "offline",
    battery: 0,
    chargeRate: 0,
    speed: 0,
    heading: 0,
    commsStatus: "lost",
  });

  return (
    <div {...stylex.props(styles.page)}>
      <h1 {...stylex.props(styles.title)}>Component Demo</h1>
      <p {...stylex.props(styles.note)}>
        Components shown in various states. Animated values update every second
        to verify real-time rendering.
      </p>

      {/* Vessel Cards */}
      <div {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.sectionTitle)}>VesselCard</h2>
        <div {...stylex.props(styles.row)}>
          <div {...stylex.props(styles.cardWrap)}>
            <VesselCard
              info={mockInfo[0]!}
              telemetry={nominalTelemetry}
              isSelected={false}
              onSelect={() => {}}
            />
          </div>
          <div {...stylex.props(styles.cardWrap)}>
            <VesselCard
              info={mockInfo[1]!}
              telemetry={warningTelemetry}
              isSelected={false}
              onSelect={() => {}}
            />
          </div>
          <div {...stylex.props(styles.cardWrap)}>
            <VesselCard
              info={mockInfo[0]!}
              telemetry={criticalTelemetry}
              isSelected={true}
              onSelect={() => {}}
            />
          </div>
          <div {...stylex.props(styles.cardWrap)}>
            <VesselCard
              info={mockInfo[0]!}
              telemetry={offlineTelemetry}
              isSelected={false}
              onSelect={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Battery Gauge */}
      <div {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.sectionTitle)}>BatteryGauge</h2>
        <div {...stylex.props(styles.row)}>
          <div {...stylex.props(styles.gaugeWrap)}>
            <BatteryGauge level={animated.battery} chargeRate={0.015} />
          </div>
          <div {...stylex.props(styles.gaugeWrap)}>
            <BatteryGauge level={22} chargeRate={-0.025} />
          </div>
          <div {...stylex.props(styles.gaugeWrap)}>
            <BatteryGauge level={8} chargeRate={-0.005} />
          </div>
        </div>
      </div>

      {/* Compass */}
      <div {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.sectionTitle)}>CompassHeading</h2>
        <p {...stylex.props(styles.note)}>
          Left compass animates (rotates 15°/sec). Others are fixed.
        </p>
        <div {...stylex.props(styles.compassWrap)}>
          <CompassHeading heading={animated.heading} />
          <CompassHeading heading={0} />
          <CompassHeading heading={90} />
          <CompassHeading heading={225} />
        </div>
      </div>

      {/* Status Indicators */}
      <div {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.sectionTitle)}>StatusIndicators</h2>
        <div {...stylex.props(styles.row)}>
          <StatusIndicators
            info={mockInfo[0]!}
            telemetry={nominalTelemetry}
          />
          <StatusIndicators
            info={mockInfo[1]!}
            telemetry={warningTelemetry}
          />
        </div>
      </div>
    </div>
  );
}
