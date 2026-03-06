import type { VesselType } from "../types/vessel";

interface VesselIconProps {
  type: VesselType;
  color: string;
  size?: number;
}

/**
 * Lightfish: solar-powered catamaran — twin hulls, flat deck
 * Viewed from above, pointing up (north)
 */
function LightfishPath() {
  return (
    <>
      {/* Left hull */}
      <path d="M7 22 L5 18 L4 10 L5 4 L7 2 L8 4 L8 18 Z" />
      {/* Right hull */}
      <path d="M17 22 L19 18 L20 10 L19 4 L17 2 L16 4 L16 18 Z" />
      {/* Solar deck connecting hulls */}
      <rect x="8" y="6" width="8" height="12" rx="1" opacity="0.5" />
    </>
  );
}

/**
 * Quickfish: fast tactical monohull — sharp bow, wider stern
 * Viewed from above, pointing up (north)
 */
function QuickfishPath() {
  return (
    <path d="M12 1 L8 8 L7 14 L8 20 L10 23 L14 23 L16 20 L17 14 L16 8 Z" />
  );
}

export function VesselIcon({ type, color, size = 24 }: VesselIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill={color}
      stroke={color}
      strokeWidth="0.5"
    >
      {type === "lightfish" ? <LightfishPath /> : <QuickfishPath />}
    </svg>
  );
}
