import type { VesselType } from "../types/vessel";

/**
 * Returns an SVG string for use in Leaflet DivIcon (map markers).
 * Includes rotation for heading and glow effect.
 */
export function vesselIconSvg(
  type: VesselType,
  color: string,
  heading: number,
  size: number,
  isSelected: boolean,
  isOffline: boolean,
): string {
  const strokeColor = isSelected ? "#fff" : color;
  const strokeWidth = isSelected ? 1.5 : 0.5;
  const opacity = isOffline ? 0.4 : 0.9;

  const paths =
    type === "lightfish"
      ? `<path d="M7 22 L5 18 L4 10 L5 4 L7 2 L8 4 L8 18 Z"/>
         <path d="M17 22 L19 18 L20 10 L19 4 L17 2 L16 4 L16 18 Z"/>
         <rect x="8" y="6" width="8" height="12" rx="1" opacity="0.5"/>`
      : `<path d="M12 1 L8 8 L7 14 L8 20 L10 23 L14 23 L16 20 L17 14 L16 8 Z"/>`;

  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
    style="transform: rotate(${heading}deg); filter: drop-shadow(0 0 3px ${color}80);">
    <g fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${opacity}">
      ${paths}
    </g>
  </svg>`;
}
