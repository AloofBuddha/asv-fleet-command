import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes } from "../../styles/tokens.stylex";

interface CompassHeadingProps {
  heading: number;
}

const SIZE = 80;
const CENTER = SIZE / 2;
const RADIUS = 32;

export function CompassHeading({ heading }: CompassHeadingProps) {
  const headingRad = ((heading - 90) * Math.PI) / 180;
  const needleX = CENTER + RADIUS * 0.7 * Math.cos(headingRad);
  const needleY = CENTER + RADIUS * 0.7 * Math.sin(headingRad);

  return (
    <div {...stylex.props(styles.container)}>
      <span {...stylex.props(styles.label)}>Heading</span>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Outer ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="#2a3a4e"
          strokeWidth={1.5}
        />
        {/* Tick marks at N/E/S/W */}
        {[0, 90, 180, 270].map((deg) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          const inner = RADIUS - 4;
          const outer = RADIUS;
          return (
            <line
              key={deg}
              x1={CENTER + inner * Math.cos(rad)}
              y1={CENTER + inner * Math.sin(rad)}
              x2={CENTER + outer * Math.cos(rad)}
              y2={CENTER + outer * Math.sin(rad)}
              stroke="#5a6a7a"
              strokeWidth={1.5}
            />
          );
        })}
        {/* Cardinal labels */}
        {(
          [
            [0, "N"],
            [90, "E"],
            [180, "S"],
            [270, "W"],
          ] as const
        ).map(([deg, label]) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          const labelR = RADIUS + 8;
          return (
            <text
              key={label}
              x={CENTER + labelR * Math.cos(rad)}
              y={CENTER + labelR * Math.sin(rad)}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#5a6a7a"
              fontSize={8}
              fontFamily="monospace"
            >
              {label}
            </text>
          );
        })}
        {/* Needle line */}
        <line
          x1={CENTER}
          y1={CENTER}
          x2={needleX}
          y2={needleY}
          stroke="#06b6d4"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* Center dot */}
        <circle cx={CENTER} cy={CENTER} r={2.5} fill="#06b6d4" />
      </svg>
      <span {...stylex.props(styles.value)}>
        {heading.toFixed(0)}° {cardinalLabel(heading)}
      </span>
    </div>
  );
}

function cardinalLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(deg / 45) % 8;
  return dirs[idx]!;
}

const styles = stylex.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  label: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  value: {
    fontSize: fontSizes.sm,
    fontFamily: "monospace",
    color: colors.textPrimary,
  },
});
