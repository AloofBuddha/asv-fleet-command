import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * Tells Leaflet to recalculate its container size.
 * Needed when the map container is resized by CSS (e.g. sidebar toggle).
 */
export function MapInvalidateSize({ trigger }: { trigger: unknown }) {
  const map = useMap();

  useEffect(() => {
    // Small delay to let the DOM reflow before Leaflet measures
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map, trigger]);

  return null;
}
